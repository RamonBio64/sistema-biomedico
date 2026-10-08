
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Airtable = require("airtable");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN =
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_KEY;

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const MANTENIMIENTO_PASSWORD = process.env.MANTENIMIENTO_PASSWORD || "";
const FALLAS_PASSWORD = process.env.FALLAS_PASSWORD || "";
const FALLAS_SESSION_SECRET = process.env.FALLAS_SESSION_SECRET || "";

if (!AIRTABLE_TOKEN) {
    console.error("ERROR: No se encontró AIRTABLE_TOKEN ni AIRTABLE_API_KEY.");
}
if (!AIRTABLE_BASE_ID) {
    console.error("ERROR: No se encontró AIRTABLE_BASE_ID.");
}

Airtable.configure({ apiKey: AIRTABLE_TOKEN });
const base = Airtable.base(AIRTABLE_BASE_ID);

/* =========================================================
   NOMBRES DE TABLAS
========================================================= */

const TABLA_EQUIPOS = "Equipos Médicos";
const TABLA_ACCESORIOS = "Accesorios Médicos";
const TABLA_REPUESTOS = "Repuestos Médicos";
const TABLA_MANTENIMIENTOS = "Mantenimientos";
const TABLA_FALLAS = "Fallas y Alarmas";
const CAMPO_FOTOGRAFIA_FALLA = "fldOUKCZoD8IDLkPe";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   NORMALIZAR NOMBRES DE CAMPOS
========================================================= */

function normalizarNombreCampo(valor) {
    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

/* =========================================================
   ACCESO SEGURO DEL PERSONAL TÉCNICO PARA FALLAS
========================================================= */

const DURACION_SESION_FALLAS = 2 * 60 * 60 * 1000;

function compararSeguro(valorA, valorB) {
    const a = Buffer.from(String(valorA));
    const b = Buffer.from(String(valorB));

    return a.length === b.length &&
        crypto.timingSafeEqual(a, b);
}

function generarFirmaSesionFallas(expiracion) {
    return crypto
        .createHmac("sha256", FALLAS_SESSION_SECRET)
        .update(String(expiracion))
        .digest("hex");
}

function verificarSesionFallas(req) {
    if (!FALLAS_SESSION_SECRET) return false;

    const autorizacion = req.headers.authorization || "";
    if (!autorizacion.startsWith("Bearer ")) return false;

    const token = autorizacion.slice(7);
    const partes = token.split(".");

    if (partes.length !== 2) return false;

    const expiracion = Number(partes[0]);
    const firmaRecibida = partes[1];

    if (!Number.isFinite(expiracion) || expiracion <= Date.now()) {
        return false;
    }

    const firmaEsperada = generarFirmaSesionFallas(expiracion);

    return compararSeguro(firmaRecibida, firmaEsperada);
}

/* =========================================================
   VALIDAR CONTRASEÑA DEL PERSONAL TÉCNICO
========================================================= */

app.post("/api/fallas/acceso", (req, res) => {
    if (!FALLAS_PASSWORD || !FALLAS_SESSION_SECRET) {
        return res.status(503).json({
            success: false,
            error: "El acceso técnico no está configurado en el servidor."
        });
    }

    const password = String(req.body?.password || "");

    if (!compararSeguro(password, FALLAS_PASSWORD)) {
        return res.status(401).json({
            success: false,
            error: "La contraseña es incorrecta."
        });
    }

    const expiracion = Date.now() + DURACION_SESION_FALLAS;
    const firma = generarFirmaSesionFallas(expiracion);
    const token = `${expiracion}.${firma}`;

    return res.json({
        success: true,
        token,
        expiresAt: expiracion
    });
});

/* =========================================================
   OBTENER CAMPOS DE AIRTABLE
========================================================= */

function obtenerCampo(fields, nombres, valorDefault = "") {
    if (!fields) return valorDefault;

    for (const nombre of nombres) {
        if (
            fields[nombre] !== undefined &&
            fields[nombre] !== null &&
            fields[nombre] !== ""
        ) {
            return fields[nombre];
        }
    }

    const nombresNormalizados = nombres.map(normalizarNombreCampo);

    for (const clave of Object.keys(fields)) {
        const claveNormalizada = normalizarNombreCampo(clave);

        if (nombresNormalizados.includes(claveNormalizada)) {
            const valor = fields[clave];

            if (valor !== undefined && valor !== null && valor !== "") {
                return valor;
            }
        }
    }

    return valorDefault;
}

/* =========================================================
   NORMALIZAR FOTOGRAFÍA DE AIRTABLE
========================================================= */

function obtenerUrlFotografia(valor) {
    if (!valor) return "";

    if (Array.isArray(valor)) {
        for (const archivo of valor) {
            if (
                archivo &&
                typeof archivo === "object" &&
                typeof archivo.url === "string" &&
                archivo.url.trim() !== ""
            ) {
                return archivo.url;
            }
        }
        return "";
    }

    if (
        typeof valor === "object" &&
        typeof valor.url === "string" &&
        valor.url.trim() !== ""
    ) {
        return valor.url;
    }

    if (typeof valor === "string") {
        const texto = valor.trim();

        if (
            texto.startsWith("http://") ||
            texto.startsWith("https://") ||
            texto.startsWith("data:image/")
        ) {
            return texto;
        }
    }

    return "";
}

/* =========================================================
   NORMALIZAR CAMPOS DE FALLA
========================================================= */

function normalizarFieldsFalla(fields) {
    const original = fields || {};
    const resultado = { ...original };

    const fotografia = obtenerUrlFotografia(
        obtenerCampo(original, ["Fotografía del error", "Fotografia del error"], [])
    );

    resultado["Fotografía del error"] = fotografia
        ? [{ url: fotografia }]
        : [];

    // Compatibilidad con registros anteriores.
    resultado["Solución"] = obtenerCampo(
        original,
        ["Solución", "Solucion"],
        ""
    );

    return resultado;
}

/* =========================================================
   OBTENER EQUIPOS RELACIONADOS
========================================================= */

async function obtenerEquiposRelacionados(registros) {
    const resultados = [];

    for (const registro of registros) {
        const fields = registro.fields || {};

        const equiposRelacionados = obtenerCampo(
            fields,
            ["Equipo Médico relacionado", "Equipo relacionado"],
            []
        );

        const equipoIds = Array.isArray(equiposRelacionados)
            ? equiposRelacionados
            : [];

        const equipos = [];

        for (const equipoId of equipoIds) {
            try {
                const equipo = await base(TABLA_EQUIPOS).find(equipoId);
                const equipoFields = equipo.fields || {};

                equipos.push({
                    id: equipo.id,
                    numeroActivo: obtenerCampo(
                        equipoFields,
                        ["Número de activo fijo", "Numero de activo fijo"],
                        ""
                    ),
                    nombre: obtenerCampo(
                        equipoFields,
                        ["nombre del equipo", "Nombre del equipo"],
                        ""
                    ),
                    servicio: obtenerCampo(
                        equipoFields,
                        ["servicio o área", "Servicio o área"],
                        ""
                    ),
                    marca: obtenerCampo(equipoFields, ["Marca", "marca"], ""),
                    modelo: obtenerCampo(equipoFields, ["Modelo", "modelo"], ""),
                    serie: obtenerCampo(
                        equipoFields,
                        [
                            "Número de serie", "Numero de serie", "No. de serie",
                            "No de serie", "N° de serie", "Nº de serie",
                            "Número Serie", "Numero Serie", "Serie"
                        ],
                        ""
                    ),
                    ubicacion: obtenerCampo(
                        equipoFields,
                        ["Ubicación", "ubicación"],
                        ""
                    ),
                    estado: obtenerCampo(
                        equipoFields,
                        ["Estado del equipo", "estado del equipo"],
                        ""
                    ),
                    criticidad: obtenerCampo(
                        equipoFields,
                        ["Criticidad", "criticidad"],
                        ""
                    )
                });
            } catch (error) {
                console.error(
                    "Error obteniendo equipo relacionado:",
                    error.message
                );
            }
        }

        resultados.push({
            id: registro.id,
            fields,
            equiposRelacionados: equipos
        });
    }

    return resultados;
}

/* =========================================================
   NORMALIZAR ACCESORIO
========================================================= */

function normalizarAccesorio(registro) {
    const fields = registro.fields || {};

    return {
        id: registro.id,
        nombre: obtenerCampo(fields, ["Nombre", "nombre"], "No especificado"),
        activoFijo: obtenerCampo(
            fields,
            ["Activo fijo", "Número de activo fijo", "Numero de activo fijo"],
            "No especificado"
        ),
        serie: obtenerCampo(
            fields,
            ["Serie", "Número de serie", "Numero de serie"],
            "No especificado"
        ),
        modelo: obtenerCampo(fields, ["Modelo", "modelo"], "No especificado"),
        estado: obtenerCampo(fields, ["Estado", "estado"], "No especificado"),
        color: obtenerCampo(fields, ["Color", "color"], "No especificado"),
        activo: obtenerCampo(fields, ["Activo", "activo"], false),
        observaciones: obtenerCampo(fields, ["Observaciones", "observaciones"], ""),
        fotografia: obtenerCampo(fields, ["Fotografía", "Fotografia"], []),
        equipoRelacionado: obtenerCampo(
            fields,
            ["Equipo Médico relacionado", "Equipo relacionado"],
            []
        )
    };
}

/* =========================================================
   NORMALIZAR REPUESTO
========================================================= */

function normalizarRepuesto(registro) {
    const fields = registro.fields || {};

    return {
        id: registro.id,
        nombre: obtenerCampo(fields, ["Nombre", "nombre"], "No especificado"),
        activoFijo: obtenerCampo(
            fields,
            ["Activo fijo", "Número de activo fijo", "Numero de activo fijo"],
            "No especificado"
        ),
        serie: obtenerCampo(
            fields,
            ["Serie", "Número de serie", "Numero de serie"],
            "No especificado"
        ),
        modelo: obtenerCampo(fields, ["Modelo", "modelo"], "No especificado"),
        estado: obtenerCampo(fields, ["Estado", "estado"], "No especificado"),
        lugar: obtenerCampo(fields, ["Lugar", "lugar"], "No especificado"),
        color: obtenerCampo(fields, ["Color", "color"], "No especificado"),
        observaciones: obtenerCampo(fields, ["Observaciones", "observaciones"], ""),
        compatibilidad: obtenerCampo(fields, ["Compatibilidad", "compatibilidad"], ""),
        equipoRelacionado: obtenerCampo(
            fields,
            ["Equipo Médico relacionado", "Equipo relacionado"],
            []
        )
    };
}

/* =========================================================
   EQUIPO INDIVIDUAL
========================================================= */

app.get("/api/equipo/:id", async (req, res) => {
    try {
        const registro = await base(TABLA_EQUIPOS).find(req.params.id);
        const fields = registro.fields || {};

        const garantia = obtenerCampo(fields, ["Garantía", "Garantia"], "");
        const condicionFisica = obtenerCampo(
            fields,
            [
                "Condición Física", "Condicion Física",
                "Condición física", "Condicion física"
            ],
            ""
        );

        console.log("Garantía del equipo:", garantia);
        console.log("Condición física del equipo:", condicionFisica);

        res.json({
            id: registro.id,
            fields,
            garantia,
            condicionFisica
        });
    } catch (error) {
        console.error("Error obteniendo equipo:", error);
        res.status(500).json({
            error: "No se pudo obtener el equipo."
        });
    }
});

/* =========================================================
   ACCESORIOS DE UN EQUIPO
========================================================= */

app.get("/api/accesorios/:equipoId", async (req, res) => {
    try {
        const registros = await base(TABLA_ACCESORIOS).select().all();

        const accesorios = registros.filter(registro => {
            const fields = registro.fields || {};
            const relacionados = obtenerCampo(
                fields,
                ["Equipo Médico relacionado", "Equipo relacionado"],
                []
            );

            return Array.isArray(relacionados) &&
                relacionados.includes(req.params.equipoId);
        });

        res.json(accesorios.map(normalizarAccesorio));
    } catch (error) {
        console.error("Error obteniendo accesorios:", error);
        res.status(500).json({
            error: "No se pudieron obtener los accesorios."
        });
    }
});

/* =========================================================
   ACCESORIO INDIVIDUAL
========================================================= */

app.get("/api/accesorio/:id", async (req, res) => {
    try {
        const registro = await base(TABLA_ACCESORIOS).find(req.params.id);
        res.json(normalizarAccesorio(registro));
    } catch (error) {
        console.error("Error obteniendo accesorio:", error);
        res.status(500).json({
            error: "No se pudo obtener el accesorio."
        });
    }
});

/* =========================================================
   REPUESTOS DE UN EQUIPO
========================================================= */

app.get("/api/repuestos/:equipoId", async (req, res) => {
    try {
        const registros = await base(TABLA_REPUESTOS).select().all();

        const repuestos = registros.filter(registro => {
            const fields = registro.fields || {};
            const relacionados = obtenerCampo(
                fields,
                ["Equipo Médico relacionado", "Equipo relacionado"],
                []
            );

            return Array.isArray(relacionados) &&
                relacionados.includes(req.params.equipoId);
        });

        res.json(repuestos.map(normalizarRepuesto));
    } catch (error) {
        console.error("Error obteniendo repuestos:", error);
        res.status(500).json({
            error: "No se pudieron obtener los repuestos."
        });
    }
});

/* =========================================================
   REPUESTO INDIVIDUAL
========================================================= */

app.get("/api/repuesto/:id", async (req, res) => {
    try {
        const registro = await base(TABLA_REPUESTOS).find(req.params.id);
        res.json(normalizarRepuesto(registro));
    } catch (error) {
        console.error("Error obteniendo repuesto:", error);
        res.status(500).json({
            error: "No se pudo obtener el repuesto."
        });
    }
});

/* =========================================================
   NORMALIZAR MANTENIMIENTO
========================================================= */

function normalizarMantenimiento(registro) {
    const fields = registro.fields || {};

    return {
        id: registro.id,
        idMantenimiento: obtenerCampo(
            fields,
            ["ID Mantenimiento por Equipo"],
            ""
        ),
        equipoRelacionado: obtenerCampo(
            fields,
            ["Equipo relacionado", "Equipo Médico relacionado"],
            []
        ),
        numeroActivo: obtenerCampo(
            fields,
            ["Número de activo fijo", "Numero de activo fijo"],
            ""
        ),
        fechaMantenimiento: obtenerCampo(
            fields,
            ["Fecha de mantenimiento realizado"],
            ""
        ),
        tipoMantenimiento: obtenerCampo(
            fields,
            ["Tipo de mantenimiento"],
            ""
        ),
        tecnicoResponsable: obtenerCampo(
            fields,
            ["Técnico responsable"],
            ""
        ),
        estadoMantenimiento: obtenerCampo(
            fields,
            ["Estado del mantenimiento"],
            ""
        ),
        actividadesRealizadas: obtenerCampo(
            fields,
            ["Actividades realizadas"],
            ""
        ),
        hallazgos: obtenerCampo(fields, ["Hallazgos"], ""),
        refaccionesUtilizadas: obtenerCampo(
            fields,
            ["Refacciones utilizadas"],
            ""
        ),
        observaciones: obtenerCampo(fields, ["Observaciones"], ""),
        fechaProximoMantenimiento: obtenerCampo(
            fields,
            ["Fecha de próximo mantenimiento"],
            ""
        ),
        tecnico: obtenerCampo(fields, ["Técnico responsable"], ""),
        estado: obtenerCampo(fields, ["Estado del mantenimiento"], ""),
        actividades: obtenerCampo(fields, ["Actividades realizadas"], ""),
        refacciones: obtenerCampo(fields, ["Refacciones utilizadas"], ""),
        proximoMantenimiento: obtenerCampo(
            fields,
            ["Fecha de próximo mantenimiento"],
            ""
        )
    };
}

/* =========================================================
   OBTENER EQUIPO PARA MANTENIMIENTO
========================================================= */

async function obtenerEquipoParaMantenimiento(equipoId) {
    const equipo = await base(TABLA_EQUIPOS).find(equipoId);
    const fields = equipo.fields || {};

    console.log("Campos del equipo para mantenimiento:", Object.keys(fields));

    return {
        id: equipo.id,
        numeroActivo: obtenerCampo(
            fields,
            ["Número de activo fijo", "Numero de activo fijo"],
            ""
        ),
        nombre: obtenerCampo(
            fields,
            ["nombre del equipo", "Nombre del equipo"],
            ""
        ),
        servicio: obtenerCampo(
            fields,
            ["servicio o área", "Servicio o área"],
            ""
        ),
        marca: obtenerCampo(fields, ["Marca", "marca"], ""),
        modelo: obtenerCampo(fields, ["Modelo", "modelo"], ""),
        serie: obtenerCampo(
            fields,
            [
                "Número de serie", "Numero de serie", "No. de serie",
                "No de serie", "N° de serie", "Nº de serie",
                "Número Serie", "Numero Serie", "Serie"
            ],
            ""
        ),
        ubicacion: obtenerCampo(fields, ["Ubicación", "ubicación"], ""),
        estado: obtenerCampo(
            fields,
            ["Estado del equipo", "estado del equipo"],
            ""
        ),
        condicionFisica: obtenerCampo(
            fields,
            [
                "Condición Física", "Condicion Física",
                "Condición física", "Condicion física",
                "CONDICIÓN FÍSICA", "CONDICION FISICA"
            ],
            ""
        ),
        garantia: obtenerCampo(
            fields,
            ["Garantía", "Garantia", "GARANTÍA", "GARANTIA"],
            ""
        ),
        criticidad: obtenerCampo(fields, ["Criticidad", "criticidad"], "")
    };
}

/* =========================================================
   MANTENIMIENTOS DE UN EQUIPO
========================================================= */

app.get("/api/mantenimientos/:equipoId", async (req, res) => {
    try {
        const registros = await base(TABLA_MANTENIMIENTOS).select().all();

        const mantenimientos = registros.filter(registro => {
            const fields = registro.fields || {};
            const relacionados = obtenerCampo(
                fields,
                ["Equipo relacionado", "Equipo Médico relacionado"],
                []
            );

            return Array.isArray(relacionados) &&
                relacionados.includes(req.params.equipoId);
        });

        res.json(mantenimientos.map(normalizarMantenimiento));
    } catch (error) {
        console.error("Error obteniendo mantenimientos:", error);
        res.status(500).json({
            error: "No se pudieron obtener los mantenimientos."
        });
    }
});

/* =========================================================
   MANTENIMIENTO INDIVIDUAL
========================================================= */

app.get("/api/mantenimiento/:id", async (req, res) => {
    try {
        const registro = await base(TABLA_MANTENIMIENTOS).find(req.params.id);
        const mantenimiento = normalizarMantenimiento(registro);

        let equipo = null;
        const equipoRelacionado = mantenimiento.equipoRelacionado;

        if (
            Array.isArray(equipoRelacionado) &&
            equipoRelacionado.length > 0
        ) {
            try {
                equipo = await obtenerEquipoParaMantenimiento(
                    equipoRelacionado[0]
                );
            } catch (errorEquipo) {
                console.error(
                    "No se pudo obtener el equipo del mantenimiento:",
                    errorEquipo.message
                );
            }
        }

        res.json({
            correcto: true,
            mantenimiento,
            equipo
        });
    } catch (error) {
        console.error("Error obteniendo mantenimiento:", error);
        res.status(500).json({
            error: "No se pudo obtener el mantenimiento."
        });
    }
});

/* =========================================================
   REGISTRAR MANTENIMIENTO
========================================================= */

app.post("/api/mantenimiento", async (req, res) => {
    try {
        console.log("Datos recibidos para mantenimiento:");
        console.log(req.body);

        const datos = req.body || {};
        const equipoId = datos.equipoId;
        const fechaMantenimiento = datos.fechaMantenimiento;
        const tipoMantenimiento = datos.tipoMantenimiento;
        const tecnicoResponsable = datos.tecnicoResponsable;
        const estadoMantenimiento = datos.estadoMantenimiento;
        const actividadesRealizadas = datos.actividadesRealizadas;
        const hallazgos = datos.hallazgos;
        const refaccionesUtilizadas = datos.refaccionesUtilizadas;
        const observaciones = datos.observaciones;
        const fechaProximoMantenimiento = datos.fechaProximoMantenimiento;

        if (!equipoId) {
            return res.status(400).json({
                error: "No se recibió el equipo."
            });
        }

        if (!fechaMantenimiento) {
            return res.status(400).json({
                error: "La fecha de mantenimiento es obligatoria."
            });
        }

        if (!tipoMantenimiento) {
            return res.status(400).json({
                error: "El tipo de mantenimiento es obligatorio."
            });
        }

        if (!tecnicoResponsable) {
            return res.status(400).json({
                error: "El técnico responsable es obligatorio."
            });
        }

        const equipo = await obtenerEquipoParaMantenimiento(equipoId);

        const campos = {
            "Equipo relacionado": [equipo.id],
            "Número de activo fijo": equipo.numeroActivo,
            "Fecha de mantenimiento realizado": fechaMantenimiento,
            "Tipo de mantenimiento": tipoMantenimiento,
            "Técnico responsable": tecnicoResponsable,
            "Estado del mantenimiento": estadoMantenimiento,
            "Actividades realizadas": actividadesRealizadas,
            "Hallazgos": hallazgos,
            "Refacciones utilizadas": refaccionesUtilizadas,
            "Observaciones": observaciones
        };

        if (fechaProximoMantenimiento) {
            campos["Fecha de próximo mantenimiento"] =
                fechaProximoMantenimiento;
        }

        console.log("Campos enviados a Airtable:");
        console.log(campos);

        const nuevoRegistro = await base(TABLA_MANTENIMIENTOS).create([
            { fields: campos }
        ]);

        res.json({
            success: true,
            message: "Mantenimiento registrado correctamente.",
            id: nuevoRegistro[0].id
        });
    } catch (error) {
        console.error("ERROR REGISTRANDO MANTENIMIENTO:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message ||
                "No se pudo registrar el mantenimiento."
        });
    }
});

/* =========================================================
   MULTER PARA FOTOGRAFÍAS DE FALLAS
========================================================= */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        fieldSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
            callback(null, true);
        } else {
            callback(new Error(
                "El archivo seleccionado no es una imagen válida."
            ));
        }
    }
});

/* =========================================================
   GENERAR NÚMERO DE FALLA
========================================================= */

async function generarNumeroFalla() {
    const registros = await base(TABLA_FALLAS).select().all();
    let mayor = 0;

    for (const registro of registros) {
        const valor = registro.fields && registro.fields["ID Falla"];
        const numero = parseInt(valor, 10);

        if (!isNaN(numero) && numero > mayor) {
            mayor = numero;
        }
    }

    return mayor + 1;
}

/* =========================================================
   REGISTRAR FALLA
   CAMBIO: UTILIZA EL CAMPO "Solución"
========================================================= */

app.post("/api/falla", upload.single("fotografia"), async (req, res) => {
    try {
        console.log("Datos recibidos para falla:");
        console.log(req.body);

        console.log(
            "Fotografía recibida:",
            req.file
                ? {
                    nombre: req.file.originalname,
                    tipo: req.file.mimetype,
                    tamaño: req.file.size
                }
                : "SIN FOTOGRAFÍA"
        );

        const datos = req.body || {};
        const equipoId = datos.equipoId;

        if (!equipoId) {
            return res.status(400).json({
                success: false,
                error: "No se recibió el equipo relacionado."
            });
        }

        const equipo = await base(TABLA_EQUIPOS).find(equipoId);
        const equipoFields = equipo.fields || {};

        const numeroActivo = obtenerCampo(
            equipoFields,
            ["Número de activo fijo", "Numero de activo fijo"],
            ""
        );

        const numeroFalla = await generarNumeroFalla();

        const campos = {
            "ID Falla": String(numeroFalla),
            "Equipo relacionado": [equipo.id],
            "Número de activo fijo": numeroActivo,
            "Fecha y hora del reporte":
                datos.fechaHora || new Date().toISOString(),
            "Tipo de falla": datos.tipoFalla || "",
            "Descripción de la falla":
                datos.descripcion || datos.descripcionFalla || "",
            "Estado": datos.estado || "Reportada",
            "Reportado por": datos.reportadoPor || "",
            "Solución": ""
        };

        console.log("Campos enviados a Airtable:");
        console.log(campos);

        const nuevoRegistro = await base(TABLA_FALLAS).create([
            { fields: campos }
        ]);

        const idFallaCreada = nuevoRegistro[0].id;

        /* SUBIR FOTOGRAFÍA A AIRTABLE */

        if (req.file) {
            console.log("Subiendo fotografía a Airtable...");

            const base64 = req.file.buffer.toString("base64");

            const urlUpload =
                `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${idFallaCreada}/${CAMPO_FOTOGRAFIA_FALLA}/uploadAttachment`;

            const respuestaFoto = await fetch(urlUpload, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contentType: req.file.mimetype,
                    filename: req.file.originalname,
                    file: base64
                })
            });

            const textoRespuestaFoto = await respuestaFoto.text();

            if (!respuestaFoto.ok) {
                console.error(
                    "ERROR SUBIENDO FOTOGRAFÍA A AIRTABLE:"
                );
                console.error(textoRespuestaFoto);

                return res.status(500).json({
                    success: false,
                    error: "La falla se registró, pero no se pudo guardar la fotografía."
                });
            }

            console.log("Fotografía subida correctamente a Airtable.");
        }

        res.json({
            success: true,
            message: "Falla registrada correctamente.",
            id: idFallaCreada,
            numeroFalla
        });
    } catch (error) {
        console.error("ERROR REGISTRANDO FALLA:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message || "No se pudo registrar la falla."
        });
    }
});

/* =========================================================
   OBTENER FALLAS DE UN EQUIPO
========================================================= */

app.get("/api/fallas/:equipoId", async (req, res) => {
    try {
        const registros = await base(TABLA_FALLAS).select().all();

        const fallas = registros.filter(registro => {
            const fields = registro.fields || {};
            const relacionados = obtenerCampo(
                fields,
                ["Equipo relacionado"],
                []
            );

            return Array.isArray(relacionados) &&
                relacionados.includes(req.params.equipoId);
        });

        const resultado = fallas.map(registro => {
            const fields = registro.fields || {};
            const fieldsNormalizados = normalizarFieldsFalla(fields);

            const fotografia = obtenerUrlFotografia(
                obtenerCampo(
                    fields,
                    ["Fotografía del error", "Fotografia del error"],
                    []
                )
            );

            return {
                id: registro.id,
                fields: fieldsNormalizados,
                idFalla: obtenerCampo(fields, ["ID Falla"], ""),
                equipoRelacionado: obtenerCampo(
                    fields,
                    ["Equipo relacionado"],
                    []
                ),
                nombreEquipo: obtenerCampo(
                    fields,
                    ["Nombre del equipo relacionado"],
                    ""
                ),
                numeroActivo: obtenerCampo(
                    fields,
                    ["Número de activo fijo", "Numero de activo fijo"],
                    ""
                ),
                fechaHora: obtenerCampo(
                    fields,
                    ["Fecha y hora del reporte"],
                    ""
                ),
                tipoFalla: obtenerCampo(fields, ["Tipo de falla"], ""),
                descripcion: obtenerCampo(
                    fields,
                    ["Descripción de la falla"],
                    ""
                ),
                fotografia,
                estado: obtenerCampo(fields, ["Estado"], ""),
                reportadoPor: obtenerCampo(fields, ["Reportado por"], ""),
                solucion: obtenerCampo(fields, ["Solución", "Solucion"], ""),

                // Alias antiguo para no romper fichas que aún lo consulten.
                observaciones: obtenerCampo(
                    fields,
                    ["Observaciones", "Observación", "Observacion"],
                    ""
                )
            };
        });

        res.json(resultado);
    } catch (error) {
        console.error("Error obteniendo fallas:", error);
        res.status(500).json({
            error: "No se pudieron obtener las fallas."
        });
    }
});

/* =========================================================
   FALLA INDIVIDUAL
========================================================= */

app.get("/api/falla/:id", async (req, res) => {
    try {
        const registro = await base(TABLA_FALLAS).find(req.params.id);
        const fields = registro.fields || {};
        const fieldsNormalizados = normalizarFieldsFalla(fields);

        const fotografia = obtenerUrlFotografia(
            obtenerCampo(
                fields,
                ["Fotografía del error", "Fotografia del error"],
                []
            )
        );

        let equipoData = null;

        let equipoRelacionado = obtenerCampo(
            fields,
            ["Equipo relacionado", "Equipo Médico relacionado"],
            []
        );

        if (!Array.isArray(equipoRelacionado)) {
            equipoRelacionado = equipoRelacionado
                ? [equipoRelacionado]
                : [];
        }

        const equipoId = equipoRelacionado.length > 0
            ? equipoRelacionado[0]
            : null;

        if (equipoId) {
            try {
                const equipo = await base(TABLA_EQUIPOS).find(equipoId);
                const equipoFields = equipo.fields || {};

                equipoData = {
                    id: equipo.id,
                    fields: equipoFields,
                    nombre: obtenerCampo(
                        equipoFields,
                        ["Nombre del equipo", "nombre del equipo"],
                        ""
                    ),
                    numeroActivo: obtenerCampo(
                        equipoFields,
                        ["Número de activo fijo", "Numero de activo fijo"],
                        ""
                    ),
                    marca: obtenerCampo(equipoFields, ["Marca", "marca"], ""),
                    modelo: obtenerCampo(equipoFields, ["Modelo", "modelo"], ""),
                    serie: obtenerCampo(
                        equipoFields,
                        [
                            "Número de serie", "Numero de serie", "No. de serie",
                            "No de serie", "N° de serie", "Nº de serie",
                            "Número Serie", "Numero Serie", "Serie"
                        ],
                        ""
                    ),
                    servicio: obtenerCampo(
                        equipoFields,
                        [
                            "Servicio o área", "Servicio o Área",
                            "servicio o área", "Servicio", "Área", "Area"
                        ],
                        ""
                    ),
                    ubicacion: obtenerCampo(
                        equipoFields,
                        ["Ubicación", "ubicación"],
                        ""
                    ),
                    estado: obtenerCampo(
                        equipoFields,
                        ["Estado del equipo", "estado del equipo"],
                        ""
                    ),
                    criticidad: obtenerCampo(
                        equipoFields,
                        ["Criticidad", "criticidad"],
                        ""
                    )
                };

                console.log("Equipo obtenido para ficha de falla:", equipoData);
            } catch (errorEquipo) {
                console.error(
                    "Error obteniendo equipo relacionado para la falla:",
                    errorEquipo
                );
            }
        }

        const solucion = obtenerCampo(
            fields,
            ["Solución", "Solucion"],
            ""
        );

        res.json({
            id: registro.id,
            fields: fieldsNormalizados,

            idFalla: obtenerCampo(fields, ["ID Falla"], ""),
            numeroReporte: obtenerCampo(fields, ["ID Falla"], ""),
            "Número de reporte": obtenerCampo(fields, ["ID Falla"], ""),

            equipoRelacionado,
            equipo: equipoData,

            nombreEquipo:
                equipoData?.nombre ||
                obtenerCampo(
                    fields,
                    ["Nombre del equipo relacionado", "Nombre del equipo"],
                    ""
                ),

            numeroActivo:
                equipoData?.numeroActivo ||
                obtenerCampo(
                    fields,
                    ["Número de activo fijo", "Numero de activo fijo"],
                    ""
                ),

            marca: equipoData?.marca || "",
            modelo: equipoData?.modelo || "",
            serie: equipoData?.serie || "",
            servicio: equipoData?.servicio || "",
            ubicacion: equipoData?.ubicacion || "",
            estadoEquipo: equipoData?.estado || "",
            criticidad: equipoData?.criticidad || "",

            fechaHora: obtenerCampo(
                fields,
                [
                    "Fecha y hora del reporte",
                    "Fecha y hora",
                    "Fecha y hora de la falla"
                ],
                ""
            ),

            tipoFalla: obtenerCampo(
                fields,
                ["Tipo de falla", "Tipo"],
                ""
            ),

            descripcion: obtenerCampo(
                fields,
                [
                    "Descripción de la falla",
                    "Descripcion de la falla",
                    "Descripción",
                    "Descripcion"
                ],
                ""
            ),

            descripcionFalla: obtenerCampo(
                fields,
                [
                    "Descripción de la falla",
                    "Descripcion de la falla",
                    "Descripción",
                    "Descripcion"
                ],
                ""
            ),

            fotografia,

            estado: obtenerCampo(
                fields,
                ["Estado", "Estado de la falla"],
                ""
            ),

            estadoFalla: obtenerCampo(
                fields,
                ["Estado", "Estado de la falla"],
                ""
            ),

            reportadoPor: obtenerCampo(
                fields,
                ["Reportado por", "Reportado por:"],
                ""
            ),

            // Campo nuevo de Airtable.
            solucion,

            // Compatibilidad con la respuesta anterior.
            observaciones: obtenerCampo(
                fields,
                ["Observaciones", "Observación", "Observacion"],
                ""
            )
        });
    } catch (error) {
        console.error("Error obteniendo falla individual:", error);
        res.status(500).json({
            error: "No se pudo obtener la falla."
        });
    }
});

/* =========================================================
   ACTUALIZAR ESTADO Y SOLUCIÓN DE UNA FALLA
   SOLO PERSONAL TÉCNICO AUTENTICADO
========================================================= */

app.put("/api/falla/:id/solucion", async (req, res) => {
    try {
        if (!verificarSesionFallas(req)) {
            return res.status(401).json({
                success: false,
                error: "La sesión técnica no es válida o ha expirado. Inicia sesión nuevamente."
            });
        }

        const estado = String(req.body?.estado || "").trim();
        const solucion = String(req.body?.solucion || "").trim();

        const estadosPermitidos = [
            "Reportada",
            "En proceso",
            "Solucionada"
        ];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: "El estado seleccionado no es válido."
            });
        }

        if (estado === "Solucionada" && !solucion) {
            return res.status(400).json({
                success: false,
                error: "Debes registrar la solución antes de marcar la falla como solucionada."
            });
        }

        const camposActualizar = {
            "Estado": estado,
            "Solución": solucion
        };

        const registrosActualizados = await base(TABLA_FALLAS).update([
            {
                id: req.params.id,
                fields: camposActualizar
            }
        ]);

        const registroActualizado = registrosActualizados[0];
        const fieldsActualizados = registroActualizado.fields || {};

        return res.json({
            success: true,
            message: "El estado y la solución se guardaron correctamente.",
            id: registroActualizado.id,
            estado: obtenerCampo(fieldsActualizados, ["Estado"], estado),
            solucion: obtenerCampo(
                fieldsActualizados,
                ["Solución", "Solucion"],
                solucion
            )
        });
    } catch (error) {
        console.error("ERROR ACTUALIZANDO SOLUCIÓN DE FALLA:");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message ||
                "No se pudo guardar el estado y la solución de la falla."
        });
    }
});

/* =========================================================
   MANEJO DE ERRORES DE MULTER
========================================================= */

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error("ERROR DE MULTER:", error);

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                error: "La fotografía es demasiado grande. Debe pesar menos de 2 MB."
            });
        }

        if (error.code === "LIMIT_FIELD_SIZE") {
            return res.status(413).json({
                success: false,
                error: "La información enviada es demasiado grande."
            });
        }

        return res.status(400).json({
            success: false,
            error: "No se pudo procesar la fotografía: " + error.message
        });
    }

    if (
        error &&
        error.message === "El archivo seleccionado no es una imagen válida."
    ) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    console.error("ERROR NO CONTROLADO:", error);

    res.status(500).json({
        success: false,
        error: "Ocurrió un error en el servidor."
    });
});

/* =========================================================
   RUTA PRINCIPAL
========================================================= */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Airtable = require("airtable");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN =
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_KEY;

const AIRTABLE_BASE_ID =
    process.env.AIRTABLE_BASE_ID;

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD || "1234";

Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base =
    Airtable.base(AIRTABLE_BASE_ID);

const TABLA_EQUIPOS = "Equipos Médicos";
const TABLA_ACCESORIOS = "Accesorios Médicos";
const TABLA_REPUESTOS = "Repuestos Médicos";
const TABLA_MANTENIMIENTOS = "Mantenimientos";
const TABLA_FALLAS = "Fallas y Alarmas";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});


/* =========================================================
   EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const f = record.fields;

            const videos = [];

            for (let i = 1; i <= 4; i++) {

                const titulo =
                    f[`Título del video ${i}`];

                const url =
                    f[`URL del video ${i}`];

                if (titulo || url) {

                    videos.push({
                        titulo: titulo || "",
                        url: url || ""
                    });

                }

            }

            res.json({

                id: record.id,

                numeroActivo:
                    f["Numero de activo fijo"] ||
                    f["Número de activo fijo"] ||
                    "",

                servicio:
                    f["servicio o área"] || "",

                nombre:
                    f["nombre del equipo"] || "",

                marca:
                    f["marca"] || "",

                modelo:
                    f["modelo"] || "",

                serie:
                    f["número de serie"] || "",

                ubicacion:
                    f["ubicación"] || "",

                responsable:
                    f["responsable"] || "",

                estado:
                    f["estado del equipo"] || "",

                criticidad:
                    f["Criticidad"] || "",

                garantia:
                    f["Garantía "] ||
                    f["Garantía"] ||
                    "",

                condicionFisica:
                    f["Condición Física "] ||
                    f["Condición Física"] ||
                    "",

                fechaAdquisicion:
                    f["Fecha de adquisición"] || "",

                proveedor:
                    f["Proveedor"] || "",

                fechaUltimoMantenimiento:
                    f["Fecha de ultimo mantenimiento"] || "",

                fechaProximoMantenimiento:
                    f["Fecha de próximo mantenimiento"] || "",

                alertaMantenimiento:
                    f["alerta mantenimiento próximo"] || "",

                fotografia:
                    f["fotografía del equipo"] || [],

                accesorios:
                    f["Accesorios Médicos"] || [],

                repuestos:
                    f["Repuestos Médicos"] || [],

                correoMantenimientos:
                    f["Correo mantenimientos"] || "",

                urlFicha:
                    f["URL ficha"] || "",

                videos

            });

        } catch (error) {

            console.error(
                "Error al obtener equipo:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo obtener el equipo."
            });

        }

    }
);


/* =========================================================
   ACCESORIOS
========================================================= */

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const registros =
                await base(TABLA_ACCESORIOS)
                    .select({
                        filterByFormula:
                            `FIND("${req.params.id}", ARRAYJOIN({Equipo Médico relacionado})) > 0`
                    })
                    .all();

            const resultado =
                registros.map(record => {

                    const f =
                        record.fields;

                    return {

                        id:
                            record.id,

                        nombre:
                            f["nombre"] || "",

                        activoFijo:
                            f["activo fijo"] || "",

                        serie:
                            f["serie"] || "",

                        modelo:
                            f["modelo"] || "",

                        estado:
                            f["estado"] || "",

                        color:
                            f["color"] || "",

                        activo:
                            f["activo"] || false,

                        observaciones:
                            f["observaciones"] || "",

                        fotografia:
                            f["fotografía"] || []

                    };

                });

            res.json(resultado);

        } catch (error) {

            console.error(
                "Error accesorios:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron obtener los accesorios."
            });

        }

    }
);


/* =========================================================
   ACCESORIO INDIVIDUAL
========================================================= */

app.get(
    "/api/accesorio/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_ACCESORIOS)
                    .find(req.params.id);

            const f =
                record.fields;

            res.json({

                id:
                    record.id,

                nombre:
                    f["nombre"] || "",

                activoFijo:
                    f["activo fijo"] || "",

                serie:
                    f["serie"] || "",

                modelo:
                    f["modelo"] || "",

                estado:
                    f["estado"] || "",

                color:
                    f["color"] || "",

                activo:
                    f["activo"] || false,

                observaciones:
                    f["observaciones"] || "",

                fotografia:
                    f["fotografía"] || [],

                equipoRelacionado:
                    f["Equipo Médico relacionado"] || []

            });

        } catch (error) {

            console.error(
                "Error accesorio:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo obtener el accesorio."
            });

        }

    }
);


/* =========================================================
   REPUESTOS
========================================================= */

app.get(
    "/api/equipo/:id/repuestos",
    async (req, res) => {

        try {

            const registros =
                await base(TABLA_REPUESTOS)
                    .select({
                        filterByFormula:
                            `FIND("${req.params.id}", ARRAYJOIN({Equipo Médico relacionado})) > 0`
                    })
                    .all();

            const resultado =
                registros.map(record => {

                    const f =
                        record.fields;

                    return {

                        id:
                            record.id,

                        nombre:
                            f["nombre"] || "",

                        estado:
                            f["estado"] || "",

                        lugar:
                            f["lugar"] || "",

                        observaciones:
                            f["observaciones"] || "",

                        activoFijo:
                            f["activo fijo"] || "",

                        serie:
                            f["serie"] || "",

                        color:
                            f["color"] || "",

                        modelo:
                            f["modelo"] || "",

                        compatibilidad:
                            f["compatibilidad"] || ""

                    };

                });

            res.json(resultado);

        } catch (error) {

            console.error(
                "Error repuestos:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron obtener los repuestos."
            });

        }

    }
);


/* =========================================================
   REPUESTO INDIVIDUAL
========================================================= */

app.get(
    "/api/repuesto/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_REPUESTOS)
                    .find(req.params.id);

            const f =
                record.fields;

            res.json({

                id:
                    record.id,

                nombre:
                    f["nombre"] || "",

                estado:
                    f["estado"] || "",

                lugar:
                    f["lugar"] || "",

                observaciones:
                    f["observaciones"] || "",

                activoFijo:
                    f["activo fijo"] || "",

                serie:
                    f["serie"] || "",

                color:
                    f["color"] || "",

                modelo:
                    f["modelo"] || "",

                compatibilidad:
                    f["compatibilidad"] || "",

                equipoRelacionado:
                    f["Equipo Médico relacionado"] || []

            });

        } catch (error) {

            console.error(
                "Error repuesto:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo obtener el repuesto."
            });

        }

    }
);


/* =========================================================
   MANTENIMIENTOS
========================================================= */

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const registros =
                await base(TABLA_MANTENIMIENTOS)
                    .select({
                        filterByFormula:
                            `FIND("${req.params.id}", ARRAYJOIN({Equipo relacionado})) > 0`
                    })
                    .all();

            const resultado =
                registros.map(record => {

                    const f =
                        record.fields;

                    return {

                        id:
                            record.id,

                        numeroActivo:
                            f["Número de activo fijo"] ||
                            "",

                        fechaMantenimiento:
                            f["Fecha de mantenimiento realizado"] ||
                            "",

                        tipoMantenimiento:
                            f["Tipo de mantenimiento"] ||
                            "",

                        tecnico:
                            f["Técnico responsable"] ||
                            "",

                        estado:
                            f["Estado del mantenimiento"] ||
                            "",

                        actividades:
                            f["Actividades realizadas"] ||
                            "",

                        hallazgos:
                            f["Hallazgos"] ||
                            "",

                        refacciones:
                            f["Refacciones utilizadas"] ||
                            "",

                        observaciones:
                            f["Observaciones"] ||
                            "",

                        proximoMantenimiento:
                            f["Fecha de próximo mantenimiento"] ||
                            "",

                        idMantenimiento:
                            f["ID Mantenimiento por Equipo"] ||
                            ""

                    };

                });

            resultado.sort(
                (a, b) => {

                    const fechaA =
                        new Date(
                            a.fechaMantenimiento || 0
                        );

                    const fechaB =
                        new Date(
                            b.fechaMantenimiento || 0
                        );

                    return fechaB - fechaA;

                }
            );

            res.json(resultado);

        } catch (error) {

            console.error(
                "Error mantenimientos:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron obtener los mantenimientos."
            });

        }

    }
);


/* =========================================================
   MANTENIMIENTO INDIVIDUAL
========================================================= */

app.get(
    "/api/mantenimiento/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_MANTENIMIENTOS)
                    .find(req.params.id);

            const f =
                record.fields;

            let equipo = null;

            const equipoRelacionado =
                f["Equipo relacionado"];

            if (
                equipoRelacionado &&
                equipoRelacionado.length > 0
            ) {

                try {

                    const equipoRecord =
                        await base(TABLA_EQUIPOS)
                            .find(
                                equipoRelacionado[0]
                            );

                    const ef =
                        equipoRecord.fields;

                    equipo = {

                        id:
                            equipoRecord.id,

                        nombre:
                            ef["nombre del equipo"] ||
                            "",

                        numeroActivo:
                            ef["Numero de activo fijo"] ||
                            ef["Número de activo fijo"] ||
                            "",

                        marca:
                            ef["marca"] || "",

                        modelo:
                            ef["modelo"] || "",

                        serie:
                            ef["número de serie"] ||
                            "",

                        servicio:
                            ef["servicio o área"] ||
                            "",

                        ubicacion:
                            ef["ubicación"] ||
                            "",

                        criticidad:
                            ef["Criticidad"] ||
                            ""

                    };

                } catch (errorEquipo) {

                    console.error(
                        "No se pudo obtener equipo:",
                        errorEquipo
                    );

                }

            }

            res.json({

                id:
                    record.id,

                idMantenimiento:
                    f["ID Mantenimiento por Equipo"] ||
                    "",

                fechaMantenimiento:
                    f["Fecha de mantenimiento realizado"] ||
                    "",

                tipoMantenimiento:
                    f["Tipo de mantenimiento"] ||
                    "",

                tecnico:
                    f["Técnico responsable"] ||
                    "",

                estado:
                    f["Estado del mantenimiento"] ||
                    "",

                actividades:
                    f["Actividades realizadas"] ||
                    "",

                hallazgos:
                    f["Hallazgos"] ||
                    "",

                refacciones:
                    f["Refacciones utilizadas"] ||
                    "",

                observaciones:
                    f["Observaciones"] ||
                    "",

                proximoMantenimiento:
                    f["Fecha de próximo mantenimiento"] ||
                    "",

                equipo

            });

        } catch (error) {

            console.error(
                "Error mantenimiento:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo obtener el mantenimiento."
            });

        }

    }
);


/* =========================================================
   CREAR MANTENIMIENTO
========================================================= */

app.post(
    "/api/mantenimiento",
    async (req, res) => {

        try {

            const password =
                req.headers["x-mantenimiento-password"];

            if (
                password !==
                MANTENIMIENTO_PASSWORD
            ) {

                return res.status(401).json({
                    correcto: false,
                    error:
                        "Contraseña incorrecta."
                });

            }

            const {

                equipoId,
                fechaMantenimiento,
                tipoMantenimiento,
                tecnicoResponsable,
                estadoMantenimiento,
                actividadesRealizadas,
                hallazgos,
                refaccionesUtilizadas,
                observaciones,
                fechaProximoMantenimiento

            } = req.body;

            if (!equipoId) {

                return res.status(400).json({
                    correcto: false,
                    error:
                        "No se recibió el equipo."
                });

            }

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(equipoId);

            const ef =
                equipoRecord.fields;

            const numeroActivo =
                ef["Numero de activo fijo"] ||
                ef["Número de activo fijo"] ||
                "";

            const mantenimiento =
                await base(
                    TABLA_MANTENIMIENTOS
                ).create({

                    "Equipo relacionado":
                        [equipoId],

                    "Número de activo fijo":
                        numeroActivo,

                    "Fecha de mantenimiento realizado":
                        fechaMantenimiento || "",

                    "Tipo de mantenimiento":
                        tipoMantenimiento || "",

                    "Técnico responsable":
                        tecnicoResponsable || "",

                    "Estado del mantenimiento":
                        estadoMantenimiento || "",

                    "Actividades realizadas":
                        actividadesRealizadas || "",

                    "Hallazgos":
                        hallazgos || "",

                    "Refacciones utilizadas":
                        refaccionesUtilizadas || "",

                    "Observaciones":
                        observaciones || "",

                    "Fecha de próximo mantenimiento":
                        fechaProximoMantenimiento || ""

                });

            const actualizacion = {};

            if (fechaMantenimiento) {

                actualizacion[
                    "Fecha de ultimo mantenimiento"
                ] =
                    fechaMantenimiento;

            }

            if (fechaProximoMantenimiento) {

                actualizacion[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }

            if (
                Object.keys(actualizacion).length > 0
            ) {

                await base(TABLA_EQUIPOS)
                    .update(
                        equipoId,
                        actualizacion
                    );

            }

            res.json({

                correcto:
                    true,

                id:
                    mantenimiento.id,

                mensaje:
                    "Mantenimiento registrado correctamente."

            });

        } catch (error) {

            console.error(
                "Error al registrar mantenimiento:",
                error
            );

            res.status(500).json({

                correcto:
                    false,

                error:
                    "No se pudo registrar el mantenimiento.",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   GENERAR ID DE FALLA
========================================================= */

async function generarNumeroReporte() {

    const registros =
        await base(TABLA_FALLAS)
            .select({
                fields: [
                    "ID Falla"
                ]
            })
            .all();

    let mayor = 0;

    registros.forEach(record => {

        const numero =
            record.fields["ID Falla"];

        if (!numero) {
            return;
        }

        const coincidencia =
            String(numero)
                .match(
                    /FALLA-(\d+)/i
                );

        if (!coincidencia) {
            return;
        }

        const valor =
            parseInt(
                coincidencia[1],
                10
            );

        if (
            !isNaN(valor) &&
            valor > mayor
        ) {

            mayor = valor;

        }

    });

    const siguiente =
        mayor + 1;

    return (
        "FALLA-" +
        String(siguiente)
            .padStart(4, "0")
    );

}


/* =========================================================
   REGISTRAR FALLA / ALARMA
========================================================= */

app.post(
    "/api/falla",
    upload.single("fotografia"),
    async (req, res) => {

        try {

            const {
                equipoId,
                tipoFalla,
                descripcionFalla,
                reportadoPor,
                observaciones
            } = req.body;

            if (!equipoId) {

                return res.status(400).json({

                    correcto:
                        false,

                    error:
                        "No se recibió el equipo."

                });

            }

            if (!tipoFalla) {

                return res.status(400).json({

                    correcto:
                        false,

                    error:
                        "No se indicó el tipo de falla."

                });

            }

            if (!descripcionFalla) {

                return res.status(400).json({

                    correcto:
                        false,

                    error:
                        "No se describió la falla."

                });

            }

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(equipoId);

            const ef =
                equipoRecord.fields;

            const numeroReporte =
                await generarNumeroReporte();

            /*
             * "Nombre del equipo relacionado"
             * NO se envía porque es un campo
             * calculado en Airtable.
             */

            const fallaRecord =
                await base(TABLA_FALLAS)
                    .create({

                        "ID Falla":
                            numeroReporte,

                        "Equipo relacionado":
                            [equipoId],

                        "Número de activo fijo":
                            ef["Numero de activo fijo"] ||
                            ef["Número de activo fijo"] ||
                            "",

                        "Tipo de falla":
                            tipoFalla,

                        "Descripción de la falla":
                            descripcionFalla,

                        "Reportado por":
                            reportadoPor || "",

                        /*
                         * Estado inicial de una falla nueva
                         */
                        "Estado":
                            "Reportada",

                        "Observaciones":
                            observaciones || "",

                        "Fecha y hora del reporte":
                            new Date().toISOString()

                    });

            if (req.file) {

                try {

                    const base64 =
                        req.file.buffer
                            .toString("base64");

                    const attachmentResponse =
                        await fetch(
                            `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${fallaRecord.id}/fldFotografiaError/uploadAttachment`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Authorization":
                                        `Bearer ${AIRTABLE_TOKEN}`,

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        contentType:
                                            req.file.mimetype,

                                        filename:
                                            req.file.originalname,

                                        file:
                                            base64

                                    })

                            }
                        );

                    if (
                        !attachmentResponse.ok
                    ) {

                        console.error(
                            "No se pudo subir la fotografía:",
                            await attachmentResponse.text()
                        );

                    }

                } catch (errorFoto) {

                    console.error(
                        "Error al subir fotografía:",
                        errorFoto
                    );

                }

            }

            res.json({

                correcto:
                    true,

                id:
                    fallaRecord.id,

                numeroReporte,

                mensaje:
                    "Falla reportada correctamente."

            });

        } catch (error) {

            console.error(
                "Error al reportar falla:",
                error
            );

            res.status(500).json({

                correcto:
                    false,

                error:
                    "No se pudo registrar la falla.",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   OBTENER REPORTES DE UN EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id/fallas",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;

            const registros =
                await base(TABLA_FALLAS)
                    .select()
                    .all();

            const resultado = [];

            for (
                const record
                of registros
            ) {

                const f =
                    record.fields;

                const relacionados =
                    f["Equipo relacionado"] ||
                    [];

                if (
                    !Array.isArray(relacionados) ||
                    !relacionados.includes(equipoId)
                ) {

                    continue;

                }

                const fotografia =
                    f["Fotografía del error"] ||
                    [];

                resultado.push({

                    id:
                        record.id,

                    numeroReporte:
                        f["ID Falla"] ||
                        "Sin número",

                    fechaHora:
                        f["Fecha y hora del reporte"] ||
                        "",

                    nombreEquipo:
                        f["Nombre del equipo relacionado"] ||
                        "",

                    numeroActivo:
                        f["Número de activo fijo"] ||
                        "",

                    tipoFalla:
                        f["Tipo de falla"] ||
                        "",

                    descripcionFalla:
                        f["Descripción de la falla"] ||
                        "",

                    reportadoPor:
                        f["Reportado por"] ||
                        "",

                    estadoFalla:
                        f["Estado"] ||
                        "Reportada",

                    observaciones:
                        f["Observaciones"] ||
                        "",

                    fotografia:
                        Array.isArray(fotografia) &&
                        fotografia.length > 0
                        ?
                        fotografia[0].url
                        :
                        ""

                });

            }

            resultado.sort(
                (a, b) => {

                    const fechaA =
                        new Date(
                            a.fechaHora || 0
                        );

                    const fechaB =
                        new Date(
                            b.fechaHora || 0
                        );

                    return fechaB - fechaA;

                }
            );

            res.json({

                correcto:
                    true,

                fallas:
                    resultado

            });

        } catch (error) {

            console.error(
                "Error al obtener fallas:",
                error
            );

            res.status(500).json({

                correcto:
                    false,

                error:
                    "No se pudieron obtener los reportes.",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   OBTENER UN REPORTE INDIVIDUAL
========================================================= */

app.get(
    "/api/falla/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_FALLAS)
                    .find(req.params.id);

            const f =
                record.fields;

            let equipo = null;

            const equipoRelacionado =
                f["Equipo relacionado"] ||
                [];

            if (
                equipoRelacionado.length > 0
            ) {

                try {

                    const equipoRecord =
                        await base(TABLA_EQUIPOS)
                            .find(
                                equipoRelacionado[0]
                            );

                    const ef =
                        equipoRecord.fields;

                    equipo = {

                        id:
                            equipoRecord.id,

                        nombre:
                            ef["nombre del equipo"] ||
                            "",

                        numeroActivo:
                            ef["Numero de activo fijo"] ||
                            ef["Número de activo fijo"] ||
                            "",

                        marca:
                            ef["marca"] ||
                            "",

                        modelo:
                            ef["modelo"] ||
                            "",

                        serie:
                            ef["número de serie"] ||
                            "",

                        servicio:
                            ef["servicio o área"] ||
                            "",

                        ubicacion:
                            ef["ubicación"] ||
                            "",

                        estado:
                            ef["estado del equipo"] ||
                            "",

                        criticidad:
                            ef["Criticidad"] ||
                            ""

                    };

                } catch (errorEquipo) {

                    console.error(
                        "Error obteniendo equipo del reporte:",
                        errorEquipo
                    );

                }

            }

            const fotografia =
                f["Fotografía del error"] ||
                [];

            res.json({

                id:
                    record.id,

                numeroReporte:
                    f["ID Falla"] ||
                    "Sin número",

                fechaHora:
                    f["Fecha y hora del reporte"] ||
                    "",

                nombreEquipo:
                    f["Nombre del equipo relacionado"] ||
                    "",

                numeroActivo:
                    f["Número de activo fijo"] ||
                    "",

                tipoFalla:
                    f["Tipo de falla"] ||
                    "",

                descripcionFalla:
                    f["Descripción de la falla"] ||
                    "",

                reportadoPor:
                    f["Reportado por"] ||
                    "",

                estadoFalla:
                    f["Estado"] ||
                    "Reportada",

                observaciones:
                    f["Observaciones"] ||
                    "",

                fotografia:
                    Array.isArray(fotografia) &&
                    fotografia.length > 0
                    ?
                    fotografia[0].url
                    :
                    "",

                equipo

            });

        } catch (error) {

            console.error(
                "Error al obtener reporte:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el reporte.",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   SERVIDOR
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor ejecutándose en el puerto ${PORT}`
        );

    }
);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Airtable = require("airtable");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN =
    process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY;

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD || "1234";


// ======================================================
// CONFIGURACIÓN DE AIRTABLE
// ======================================================

Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base = Airtable.base(AIRTABLE_BASE_ID);


// ======================================================
// NOMBRES DE LAS TABLAS
// ======================================================

const TABLA_EQUIPOS = "Equipos Médicos";
const TABLA_ACCESORIOS = "Accesorios Médicos";
const TABLA_REPUESTOS = "Repuestos Médicos";
const TABLA_MANTENIMIENTOS = "Mantenimientos";
const TABLA_FALLAS = "Fallas y Alarmas";


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ======================================================
// CONFIGURACIÓN PARA FOTOGRAFÍAS
// ======================================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


// ======================================================
// ARCHIVOS PÚBLICOS
// ======================================================

app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// PÁGINA PRINCIPAL
// ======================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});


// ======================================================
// OBTENER EQUIPO POR ID
// ======================================================

app.get("/api/equipo/:id", async (req, res) => {

    try {

        const record = await base(TABLA_EQUIPOS)
            .find(req.params.id);

        const f = record.fields;

        res.json({

            correcto: true,

            equipo: {

                id: record.id,

                numeroActivo:
                    f["Numero de activo fijo"] || "",

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
                    f["Garantía "] || "",

                condicionFisica:
                    f["Condición Física "] || "",

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

                videos: [

                    {
                        titulo:
                            f["Título del video 1"] || "",

                        url:
                            f["URL del video 1 (YouTube)"] || ""
                    },

                    {
                        titulo:
                            f["Título del video 2"] || "",

                        url:
                            f["URL del video 2 (YouTube)"] || ""
                    },

                    {
                        titulo:
                            f["Título del video 3"] || "",

                        url:
                            f["URL del video 3 (YouTube)"] || ""
                    },

                    {
                        titulo:
                            f["Título del video 4"] || "",

                        url:
                            f["URL del video 4 (YouTube)"] || ""
                    }

                ]

            }

        });

    } catch (error) {

        console.error(
            "Error al obtener equipo:",
            error
        );

        res.status(500).json({

            correcto: false,

            error:
                "No se pudo obtener la información del equipo."

        });

    }

});


// ======================================================
// OBTENER ACCESORIOS DE UN EQUIPO
// ======================================================

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const equipoId = req.params.id;

            const records =
                await base(TABLA_ACCESORIOS)
                    .select()
                    .all();

            const accesorios =
                records

                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] || [];

                        return Array.isArray(relacionados)
                            && relacionados.includes(equipoId);

                    })

                    .map(record => {

                        const f = record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["Nombre del accesorio"] ||
                                f["nombre del accesorio"] ||
                                f["Nombre"] ||
                                "",

                            numeroActivo:
                                f["Número de activo fijo"] ||
                                f["Numero de activo fijo"] ||
                                "",

                            serie:
                                f["Número de serie"] ||
                                f["número de serie"] ||
                                "",

                            modelo:
                                f["Modelo"] ||
                                f["modelo"] ||
                                "",

                            estado:
                                f["Estado del accesorio"] ||
                                f["estado del accesorio"] ||
                                "",

                            color:
                                f["Color"] ||
                                f["color"] ||
                                "",

                            activo:
                                f["Activo"] ||
                                f["activo"] ||
                                false,

                            observaciones:
                                f["Observaciones"] ||
                                f["observaciones"] ||
                                "",

                            fotografia:
                                f["Fotografía"] ||
                                f["fotografía"] ||
                                f["Fotografia"] ||
                                [],

                            equipo:
                                f["Equipo Médico relacionado"] ||
                                []

                        };

                    });

            res.json({

                correcto: true,

                accesorios

            });

        } catch (error) {

            console.error(
                "Error al obtener accesorios:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudieron obtener los accesorios."

            });

        }

    }
);


// ======================================================
// OBTENER UN ACCESORIO POR ID
// ======================================================
//
// IMPORTANTE:
// Aquí está la modificación.
// El campo de Airtable se llama exactamente:
//
// "Equipo Médico relacionado"
//
// Además de devolver los IDs originales,
// ahora obtenemos la información completa
// de cada equipo relacionado.
// ======================================================

app.get(
    "/api/accesorio/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_ACCESORIOS)
                    .find(req.params.id);

            const f = record.fields;


            // --------------------------------------------------
            // OBTENER LOS EQUIPOS RELACIONADOS
            // --------------------------------------------------

            const equiposRaw =
                f["Equipo Médico relacionado"] || [];


            const equiposIds =
                Array.isArray(equiposRaw)

                    ? equiposRaw

                    : equiposRaw
                        ? [equiposRaw]
                        : [];


            const equiposRelacionados = [];


            // --------------------------------------------------
            // BUSCAR CADA EQUIPO RELACIONADO
            // --------------------------------------------------

            for (const equipoId of equiposIds) {

                try {

                    const equipoRecord =
                        await base(TABLA_EQUIPOS)
                            .find(equipoId);

                    const ef =
                        equipoRecord.fields;


                    equiposRelacionados.push({

                        id:
                            equipoRecord.id,

                        numeroActivo:
                            ef["Numero de activo fijo"] ||
                            ef["Número de activo fijo"] ||
                            "",

                        servicio:
                            ef["servicio o área"] ||
                            "",

                        nombre:
                            ef["nombre del equipo"] ||
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

                        ubicacion:
                            ef["ubicación"] ||
                            "",

                        estado:
                            ef["estado del equipo"] ||
                            "",

                        criticidad:
                            ef["Criticidad"] ||
                            ""

                    });


                } catch (errorEquipo) {

                    console.error(

                        `No se pudo obtener el equipo relacionado ${equipoId}:`,

                        errorEquipo.message

                    );

                }

            }


            // --------------------------------------------------
            // RESPUESTA
            // --------------------------------------------------

            res.json({

                correcto: true,

                accesorio: {

                    id:
                        record.id,

                    nombre:
                        f["Nombre del accesorio"] ||
                        f["nombre del accesorio"] ||
                        f["Nombre"] ||
                        "",

                    numeroActivo:
                        f["Número de activo fijo"] ||
                        f["Numero de activo fijo"] ||
                        "",

                    serie:
                        f["Número de serie"] ||
                        f["número de serie"] ||
                        "",

                    modelo:
                        f["Modelo"] ||
                        f["modelo"] ||
                        "",

                    estado:
                        f["Estado del accesorio"] ||
                        f["estado del accesorio"] ||
                        "",

                    color:
                        f["Color"] ||
                        f["color"] ||
                        "",

                    activo:
                        f["Activo"] ||
                        f["activo"] ||
                        false,

                    observaciones:
                        f["Observaciones"] ||
                        f["observaciones"] ||
                        "",

                    fotografia:
                        f["Fotografía"] ||
                        f["fotografía"] ||
                        f["Fotografia"] ||
                        [],

                    equipo:
                        equiposIds,

                    equiposRelacionados:
                        equiposRelacionados

                }

            });


        } catch (error) {

            console.error(
                "Error al obtener accesorio:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener la información del accesorio."

            });

        }

    }
);


// ======================================================
// OBTENER REPUESTOS DE UN EQUIPO
// ======================================================

app.get(
    "/api/equipo/:id/repuestos",
    async (req, res) => {

        try {

            const equipoId = req.params.id;

            const records =
                await base(TABLA_REPUESTOS)
                    .select()
                    .all();

            const repuestos =
                records

                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] || [];

                        return Array.isArray(relacionados)
                            && relacionados.includes(equipoId);

                    })

                    .map(record => {

                        const f = record.fields;

                        return {

                            id:
                                record.id,

                            nombre:
                                f["Nombre"] ||
                                f["nombre"] ||
                                "",

                            estado:
                                f["Estado"] ||
                                f["estado"] ||
                                "",

                            lugar:
                                f["Lugar"] ||
                                f["lugar"] ||
                                "",

                            observaciones:
                                f["Observaciones"] ||
                                f["observaciones"] ||
                                "",

                            numeroActivo:
                                f["Activo fijo"] ||
                                f["Número de activo fijo"] ||
                                f["Numero de activo fijo"] ||
                                "",

                            serie:
                                f["Serie"] ||
                                f["Número de serie"] ||
                                f["número de serie"] ||
                                "",

                            color:
                                f["Color"] ||
                                f["color"] ||
                                "",

                            equipo:
                                f["Equipo Médico relacionado"] ||
                                [],

                            modelo:
                                f["Modelo"] ||
                                f["modelo"] ||
                                "",

                            compatibilidad:
                                f["Compatibilidad"] ||
                                f["compatibilidad"] ||
                                ""

                        };

                    });


            res.json({

                correcto: true,

                repuestos

            });


        } catch (error) {

            console.error(
                "Error al obtener repuestos:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudieron obtener los repuestos."

            });

        }

    }
);


// ======================================================
// OBTENER UN REPUESTO POR ID
// ======================================================

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

                correcto: true,

                repuesto: {

                    id:
                        record.id,

                    nombre:
                        f["Nombre"] ||
                        f["nombre"] ||
                        "",

                    estado:
                        f["Estado"] ||
                        f["estado"] ||
                        "",

                    lugar:
                        f["Lugar"] ||
                        f["lugar"] ||
                        "",

                    observaciones:
                        f["Observaciones"] ||
                        f["observaciones"] ||
                        "",

                    numeroActivo:
                        f["Activo fijo"] ||
                        f["Número de activo fijo"] ||
                        f["Numero de activo fijo"] ||
                        "",

                    serie:
                        f["Serie"] ||
                        f["Número de serie"] ||
                        f["número de serie"] ||
                        "",

                    color:
                        f["Color"] ||
                        f["color"] ||
                        "",

                    equipo:
                        f["Equipo Médico relacionado"] ||
                        [],

                    modelo:
                        f["Modelo"] ||
                        f["modelo"] ||
                        "",

                    compatibilidad:
                        f["Compatibilidad"] ||
                        f["compatibilidad"] ||
                        ""

                }

            });


        } catch (error) {

            console.error(
                "Error al obtener repuesto:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener la información del repuesto."

            });

        }

    }
);


// ======================================================
// HISTORIAL DE MANTENIMIENTOS DE UN EQUIPO
// ======================================================

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;

            const records =
                await base(TABLA_MANTENIMIENTOS)
                    .select()
                    .all();


            const mantenimientos =
                records

                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo relacionado"
                            ] || [];

                        return Array.isArray(relacionados)
                            && relacionados.includes(equipoId);

                    })

                    .map(record => {

                        const f =
                            record.fields;

                        return {

                            id:
                                record.id,

                            fechaMantenimiento:
                                f["Fecha mantenimiento realizado"] ||
                                "",

                            tipoMantenimiento:
                                f["Tipo"] ||
                                "",

                            tecnicoResponsable:
                                f["Técnico"] ||
                                "",

                            estadoMantenimiento:
                                f["Estado"] ||
                                "",

                            actividadesRealizadas:
                                f["Actividades"] ||
                                "",

                            hallazgos:
                                f["Hallazgos"] ||
                                "",

                            refaccionesUtilizadas:
                                f["Refacciones"] ||
                                "",

                            observaciones:
                                f["Observaciones"] ||
                                "",

                            fechaProximoMantenimiento:
                                f["Fecha próximo mantenimiento"] ||
                                ""

                        };

                    });


            // Ordenar del más reciente al más antiguo

            mantenimientos.sort(
                (a, b) => {

                    return new Date(
                        b.fechaMantenimiento
                    ) - new Date(
                        a.fechaMantenimiento
                    );

                }
            );


            res.json({

                correcto: true,

                mantenimientos

            });


        } catch (error) {

            console.error(
                "Error al obtener mantenimientos:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudieron obtener los mantenimientos."

            });

        }

    }
);


// ======================================================
// OBTENER MANTENIMIENTO POR ID
// ======================================================

app.get(
    "/api/mantenimiento/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_MANTENIMIENTOS)
                    .find(req.params.id);

            const f =
                record.fields;


            const equipoIds =
                f["Equipo relacionado"] || [];


            let equipo = null;


            if (
                Array.isArray(equipoIds)
                &&
                equipoIds.length > 0
            ) {

                try {

                    const equipoRecord =
                        await base(TABLA_EQUIPOS)
                            .find(equipoIds[0]);

                    const ef =
                        equipoRecord.fields;


                    equipo = {

                        id:
                            equipoRecord.id,

                        numeroActivo:
                            ef["Numero de activo fijo"] ||
                            "",

                        nombre:
                            ef["nombre del equipo"] ||
                            "",

                        servicio:
                            ef["servicio o área"] ||
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

                        ubicacion:
                            ef["ubicación"] ||
                            ""

                    };

                } catch (errorEquipo) {

                    console.error(
                        "Error al obtener equipo del mantenimiento:",
                        errorEquipo.message
                    );

                }

            }


            res.json({

                correcto: true,

                mantenimiento: {

                    id:
                        record.id,

                    fechaMantenimiento:
                        f["Fecha mantenimiento realizado"] ||
                        "",

                    tipoMantenimiento:
                        f["Tipo"] ||
                        "",

                    tecnicoResponsable:
                        f["Técnico"] ||
                        "",

                    estadoMantenimiento:
                        f["Estado"] ||
                        "",

                    actividadesRealizadas:
                        f["Actividades"] ||
                        "",

                    hallazgos:
                        f["Hallazgos"] ||
                        "",

                    refaccionesUtilizadas:
                        f["Refacciones"] ||
                        "",

                    observaciones:
                        f["Observaciones"] ||
                        "",

                    fechaProximoMantenimiento:
                        f["Fecha próximo mantenimiento"] ||
                        "",

                    equipo:
                        equipo

                }

            });


        } catch (error) {

            console.error(
                "Error al obtener mantenimiento:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el mantenimiento."

            });

        }

    }
);


// ======================================================
// CREAR MANTENIMIENTO
// ======================================================

app.post(
    "/api/mantenimiento",
    async (req, res) => {

        try {

            const password =
                req.headers[
                    "x-mantenimiento-password"
                ];


            if (
                password !==
                MANTENIMIENTO_PASSWORD
            ) {

                return res.status(401).json({

                    correcto: false,

                    error:
                        "Contraseña de mantenimiento incorrecta."

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


            const nuevoMantenimiento =

                await base(TABLA_MANTENIMIENTOS)
                    .create({

                        "Equipo relacionado":
                            [equipoId],

                        "Fecha mantenimiento realizado":
                            fechaMantenimiento || null,

                        "Tipo":
                            tipoMantenimiento || "",

                        "Técnico":
                            tecnicoResponsable || "",

                        "Estado":
                            estadoMantenimiento || "",

                        "Actividades":
                            actividadesRealizadas || "",

                        "Hallazgos":
                            hallazgos || "",

                        "Refacciones":
                            refaccionesUtilizadas || "",

                        "Observaciones":
                            observaciones || "",

                        "Fecha próximo mantenimiento":
                            fechaProximoMantenimiento || null

                    });


            // --------------------------------------------------
            // ACTUALIZAR FECHAS DEL EQUIPO
            // --------------------------------------------------

            const camposActualizar = {};


            if (fechaMantenimiento) {

                camposActualizar[
                    "Fecha de ultimo mantenimiento"
                ] =
                    fechaMantenimiento;

            }


            if (fechaProximoMantenimiento) {

                camposActualizar[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            if (
                Object.keys(
                    camposActualizar
                ).length > 0
            ) {

                await base(TABLA_EQUIPOS)
                    .update(
                        equipoId,
                        camposActualizar
                    );

            }


            res.json({

                correcto: true,

                id:
                    nuevoMantenimiento.id,

                mensaje:
                    "Mantenimiento guardado correctamente."

            });


        } catch (error) {

            console.error(
                "Error al crear mantenimiento:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo guardar el mantenimiento."

            });

        }

    }
);


// ======================================================
// REPORTAR FALLA / ALARMA
// ======================================================

app.post(
    "/api/falla",
    upload.single("fotografia"),
    async (req, res) => {

        try {

            const {

                equipoId,

                tipoFalla,

                descripcionFalla

            } = req.body;


            if (!equipoId) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "No se recibió el equipo."

                });

            }


            if (!tipoFalla) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "No se indicó el tipo de falla."

                });

            }


            if (!descripcionFalla) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "No se describió la falla."

                });

            }


            // Obtener equipo

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(equipoId);

            const ef =
                equipoRecord.fields;


            // Crear registro de falla

            const fallaRecord =
                await base(TABLA_FALLAS)
                    .create({

                        "Equipo relacionado":
                            [equipoId],

                        "Nombre del equipo":
                            ef["nombre del equipo"] || "",

                        "Número de activo fijo":
                            ef["Numero de activo fijo"] || "",

                        "Tipo de falla":
                            tipoFalla,

                        "Descripción de la falla":
                            descripcionFalla,

                        "Fecha y hora":
                            new Date().toISOString()

                    });


            // --------------------------------------------------
            // SUBIR FOTOGRAFÍA SI EXISTE
            // --------------------------------------------------

            if (req.file) {

                try {

                    const base64 =
                        req.file.buffer.toString(
                            "base64"
                        );


                    const attachmentResponse =
                        await fetch(

                            `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${fallaRecord.id}/fldFotografiaError/uploadAttachment`,

                            {

                                method: "POST",

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

                correcto: true,

                id:
                    fallaRecord.id,

                mensaje:
                    "Falla reportada correctamente."

            });


        } catch (error) {

            console.error(
                "Error al reportar falla:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo registrar la falla."

            });

        }

    }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

// ÚNICO CAMBIO PARA RENDER:
// Se especifica 0.0.0.0 para que Render pueda
// detectar y recibir conexiones en el puerto.

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor ejecutándose en el puerto ${PORT}`
        );

    }
);
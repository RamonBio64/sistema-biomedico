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
    process.env.MANTENIMIENTO_PASSWORD ||
    "1234";

const TABLA_EQUIPOS =
    "Equipos Médicos";

const TABLA_ACCESORIOS =
    "Accesorios Médicos";

const TABLA_REPUESTOS =
    "Repuestos Médicos";

const TABLA_MANTENIMIENTOS =
    "Mantenimientos";

const TABLA_FALLAS =
    "Fallas y Alarmas";


Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base =
    Airtable.base(
        AIRTABLE_BASE_ID
    );


app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/* =========================================================
   RUTA PRINCIPAL
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/* =========================================================
   EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id",
    async (req, res) => {

        try {

            const record =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    req.params.id
                );

            res.json({
                id: record.id,
                fields: record.fields
            });

        } catch (error) {

            console.error(
                "Error al obtener equipo:",
                error
            );

            res.status(500).json({
                error:
                    error.message
            });

        }

    }
);


/* =========================================================
   ACCESORIOS
========================================================= */

app.get(
    "/api/accesorios/:equipoId",
    async (req, res) => {

        try {

            const equipoId =
                req.params.equipoId;

            const records =
                await base(
                    TABLA_ACCESORIOS
                )
                    .select()
                    .all();

            const accesorios =
                records.filter(
                    record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] ||
                            record.fields[
                                "Equipo médico relacionado"
                            ] ||
                            record.fields[
                                "Equipo relacionado"
                            ] ||
                            [];

                        return Array.isArray(
                            relacionados
                        ) &&
                        relacionados.includes(
                            equipoId
                        );

                    }
                );

            res.json(
                accesorios.map(
                    record => ({
                        id:
                            record.id,
                        fields:
                            record.fields
                    })
                )
            );

        } catch (error) {

            console.error(
                "Error al obtener accesorios:",
                error
            );

            res.status(500).json({
                error:
                    error.message
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
                await base(
                    TABLA_ACCESORIOS
                ).find(
                    req.params.id
                );

            res.json({
                id:
                    record.id,
                fields:
                    record.fields
            });

        } catch (error) {

            console.error(
                "Error al obtener accesorio:",
                error
            );

            res.status(500).json({
                error:
                    error.message
            });

        }

    }
);


/* =========================================================
   REPUESTOS
========================================================= */

app.get(
    "/api/repuestos/:equipoId",
    async (req, res) => {

        try {

            const equipoId =
                req.params.equipoId;

            const records =
                await base(
                    TABLA_REPUESTOS
                )
                    .select()
                    .all();

            const repuestos =
                records.filter(
                    record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] ||
                            record.fields[
                                "Equipo médico relacionado"
                            ] ||
                            record.fields[
                                "Equipo relacionado"
                            ] ||
                            [];

                        return Array.isArray(
                            relacionados
                        ) &&
                        relacionados.includes(
                            equipoId
                        );

                    }
                );

            res.json(
                repuestos.map(
                    record => ({
                        id:
                            record.id,
                        fields:
                            record.fields
                    })
                )
            );

        } catch (error) {

            console.error(
                "Error al obtener repuestos:",
                error
            );

            res.status(500).json({
                error:
                    error.message
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
                await base(
                    TABLA_REPUESTOS
                ).find(
                    req.params.id
                );

            res.json({
                id:
                    record.id,
                fields:
                    record.fields
            });

        } catch (error) {

            console.error(
                "Error al obtener repuesto:",
                error
            );

            res.status(500).json({
                error:
                    error.message
            });

        }

    }
);


/* =========================================================
   MANTENIMIENTOS
========================================================= */

app.get(
    "/api/mantenimientos/:equipoId",
    async (req, res) => {

        try {

            const equipoId =
                req.params.equipoId;

            const records =
                await base(
                    TABLA_MANTENIMIENTOS
                )
                    .select()
                    .all();

            const mantenimientos =
                records.filter(
                    record => {

                        const relacionados =
                            record.fields[
                                "Equipo relacionado"
                            ] ||
                            [];

                        return Array.isArray(
                            relacionados
                        ) &&
                        relacionados.includes(
                            equipoId
                        );

                    }
                );

            res.json(
                mantenimientos.map(
                    record => ({
                        id:
                            record.id,
                        fields:
                            record.fields
                    })
                )
            );

        } catch (error) {

            console.error(
                "Error al obtener mantenimientos:",
                error
            );

            res.status(500).json({
                error:
                    error.message
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
                await base(
                    TABLA_MANTENIMIENTOS
                ).find(
                    req.params.id
                );

            res.json({
                id:
                    record.id,
                fields:
                    record.fields
            });

        } catch (error) {

            console.error(
                "Error al obtener mantenimiento:",
                error
            );

            res.status(500).json({
                error:
                    error.message
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

            const datos =
                req.body;

            const equipoId =
                datos.equipoId || "";

            const tipoMantenimiento =
                datos.tipoMantenimiento || "";

            const tecnicoResponsable =
                datos.tecnicoResponsable || "";

            const estadoMantenimiento =
                datos.estadoMantenimiento || "";

            const actividades =
                datos.actividades || "";

            const hallazgos =
                datos.hallazgos || "";

            const refacciones =
                datos.refacciones || "";

            const observaciones =
                datos.observaciones || "";

            const fechaRealizado =
                datos.fechaRealizado || "";

            const fechaProximo =
                datos.fechaProximo || "";


            const equipoRecord =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    equipoId
                );


            const equipoFields =
                equipoRecord.fields;


            const numeroActivo =
                equipoFields[
                    "Numero de activo fijo"
                ] ||
                equipoFields[
                    "Número de activo fijo"
                ] ||
                "";


            const campos =
                {

                    "Equipo relacionado":
                        [
                            equipoRecord.id
                        ],

                    "Número de activo fijo":
                        numeroActivo,

                    "Fecha de mantenimiento realizado":
                        fechaRealizado,

                    "Tipo de mantenimiento":
                        tipoMantenimiento,

                    "Técnico responsable":
                        tecnicoResponsable,

                    "Estado del mantenimiento":
                        estadoMantenimiento,

                    "Actividades realizadas":
                        actividades,

                    "Hallazgos":
                        hallazgos,

                    "Refacciones utilizadas":
                        refacciones,

                    "Observaciones":
                        observaciones,

                    "Fecha de próximo mantenimiento":
                        fechaProximo

                };


            const mantenimientoRecord =
                await base(
                    TABLA_MANTENIMIENTOS
                ).create(
                    campos
                );


            res.json({

                success:
                    true,

                id:
                    mantenimientoRecord.id

            });

        } catch (error) {

            console.error(
                "Error al crear mantenimiento:",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "No se pudo crear el mantenimiento."

            });

        }

    }
);


/* =========================================================
   GENERAR NÚMERO DE FALLA
========================================================= */

async function generarNumeroFalla(
    numeroActivo
) {

    if (!numeroActivo) {

        return "1";

    }


    const records =
        await base(
            TABLA_FALLAS
        )
            .select({

                filterByFormula:
                    `AND({Número de activo fijo}="${numeroActivo}")`

            })
            .all();


    return String(
        records.length + 1
    );

}


/* =========================================================
   SUBIDA DE FOTOGRAFÍA
========================================================= */

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


/* =========================================================
   CREAR FALLA / ALARMA
========================================================= */

app.post(
    "/api/falla",
    upload.single(
        "fotografia"
    ),
    async (req, res) => {

        try {

            const datos =
                req.body;


            console.log(
                "Datos recibidos para falla:",
                datos
            );


            const equipoId =
                datos.equipoId ||
                "";


            const tipoFalla =
                datos.tipoFalla ||
                "";


            const descripcionFalla =
                datos.descripcionFalla ||
                "";


            const reportadoPor =
                datos.reportadoPor ||
                "";


            const observaciones =
                datos.observaciones ||
                "";


            let equipoRelacionado =
                [];


            let numeroActivo =
                "";


            if (equipoId) {

                const equipoRecord =
                    await base(
                        TABLA_EQUIPOS
                    )
                        .find(
                            equipoId
                        );


                const equipoFields =
                    equipoRecord.fields;


                equipoRelacionado =
                    [
                        equipoRecord.id
                    ];


                numeroActivo =
                    equipoFields[
                        "Numero de activo fijo"
                    ] ||
                    equipoFields[
                        "Número de activo fijo"
                    ] ||
                    "";

            }


            /*
             * El número se genera por equipo.
             * Ejemplo:
             *
             * CMG-MSV-001 → 1
             * CMG-MSV-001 → 2
             * CMG-MSV-001 → 3
             */

            const numeroFalla =
                await generarNumeroFalla(
                    numeroActivo
                );


            const fechaHora =
                new Date().toISOString();


            /*
             * IMPORTANTE:
             *
             * NO se envía:
             *
             * "Nombre del equipo relacionado"
             *
             * porque es un campo de Búsqueda
             * y Airtable lo calcula automáticamente.
             */

            const camposFalla = {

                "ID Falla":
                    String(
                        numeroFalla
                    ),

                "Equipo relacionado":
                    equipoRelacionado,

                "Número de activo fijo":
                    numeroActivo,

                "Fecha y hora del reporte":
                    fechaHora,

                "Tipo de falla":
                    tipoFalla,

                "Descripción de la falla":
                    descripcionFalla,

                "Estado":
                    "Pendiente",

                "Reportado por":
                    reportadoPor,

                "Observaciones":
                    observaciones

            };


            console.log(
                "Campos que se enviarán a Airtable:",
                camposFalla
            );


            /*
             * Crear primero el registro
             * sin la fotografía.
             */

            const fallaRecord =
                await base(
                    TABLA_FALLAS
                ).create(
                    camposFalla
                );


            console.log(
                "Falla creada correctamente:",
                fallaRecord.id
            );


            /*
             * Si el usuario seleccionó
             * una fotografía, se sube
             * después de crear el registro.
             */

            if (
                req.file
            ) {

                const uploadUrl =
                    `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${fallaRecord.id}/fldOUKCZoD8IDLkPe/uploadAttachment`;


                const formData =
                    new FormData();


                const blob =
                    new Blob(
                        [
                            req.file.buffer
                        ],
                        {
                            type:
                                req.file.mimetype
                        }
                    );


                formData.append(
                    "file",
                    blob,
                    req.file.originalname
                );


                const respuestaFotografia =
                    await fetch(
                        uploadUrl,
                        {

                            method:
                                "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${AIRTABLE_TOKEN}`

                            },

                            body:
                                formData

                        }
                    );


                if (
                    !respuestaFotografia.ok
                ) {

                    const errorFotografia =
                        await respuestaFotografia.text();


                    console.error(
                        "Error al subir fotografía:",
                        errorFotografia
                    );

                } else {

                    console.log(
                        "Fotografía subida correctamente."
                    );

                }

            }


            /*
             * Respuesta correcta
             * al navegador.
             */

            res.json({

                success:
                    true,

                id:
                    fallaRecord.id,

                numeroFalla:
                    String(
                        numeroFalla
                    )

            });


        } catch (error) {

            console.error(
                "Error al reportar falla:",
                error
            );


            res.status(500).json({

                error:
                    error.message ||
                    "No se pudo reportar la falla."

            });

        }

    }
);


/* =========================================================
   CONSULTAR FALLAS DE UN EQUIPO
========================================================= */

app.get(
    "/api/fallas/:equipoId",
    async (req, res) => {

        try {

            const equipoId =
                req.params.equipoId;


            const records =
                await base(
                    TABLA_FALLAS
                )
                    .select()
                    .all();


            const fallas =
                records.filter(
                    record => {

                        const relacionados =
                            record.fields[
                                "Equipo relacionado"
                            ] ||
                            [];


                        return Array.isArray(
                            relacionados
                        ) &&
                        relacionados.includes(
                            equipoId
                        );

                    }
                );


            res.json(
                fallas.map(
                    record => {

                        const fields =
                            record.fields;


                        return {

                            id:
                                record.id,

                            fields:
                                fields,

                            numeroFalla:
                                fields[
                                    "ID Falla"
                                ] ||
                                "",

                            numeroReporte:
                                fields[
                                    "ID Falla"
                                ] ||
                                "",

                            tipo:
                                fields[
                                    "Tipo de falla"
                                ] ||
                                "",

                            tipoFalla:
                                fields[
                                    "Tipo de falla"
                                ] ||
                                "",

                            descripcion:
                                fields[
                                    "Descripción de la falla"
                                ] ||
                                "",

                            descripcionFalla:
                                fields[
                                    "Descripción de la falla"
                                ] ||
                                "",

                            estado:
                                fields[
                                    "Estado"
                                ] ||
                                "",

                            estadoFalla:
                                fields[
                                    "Estado"
                                ] ||
                                "",

                            fecha:
                                fields[
                                    "Fecha y hora del reporte"
                                ] ||
                                "",

                            reportadoPor:
                                fields[
                                    "Reportado por"
                                ] ||
                                "",

                            observaciones:
                                fields[
                                    "Observaciones"
                                ] ||
                                "",

                            fotografia:
                                fields[
                                    "Fotografía del error"
                                ] ||
                                []

                        };

                    }
                )
            );


        } catch (error) {

            console.error(
                "Error al obtener fallas:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   FALLA INDIVIDUAL
========================================================= */

app.get(
    "/api/falla/:id",
    async (req, res) => {

        try {

            const record =
                await base(
                    TABLA_FALLAS
                ).find(
                    req.params.id
                );


            const fields =
                record.fields;


            res.json({

                id:
                    record.id,

                fields:
                    fields,

                numeroFalla:
                    fields[
                        "ID Falla"
                    ] ||
                    "",

                numeroReporte:
                    fields[
                        "ID Falla"
                    ] ||
                    "",

                tipo:
                    fields[
                        "Tipo de falla"
                    ] ||
                    "",

                tipoFalla:
                    fields[
                        "Tipo de falla"
                    ] ||
                    "",

                descripcion:
                    fields[
                        "Descripción de la falla"
                    ] ||
                    "",

                descripcionFalla:
                    fields[
                        "Descripción de la falla"
                    ] ||
                    "",

                estado:
                    fields[
                        "Estado"
                    ] ||
                    "",

                estadoFalla:
                    fields[
                        "Estado"
                    ] ||
                    "",

                fecha:
                    fields[
                        "Fecha y hora del reporte"
                    ] ||
                    "",

                reportadoPor:
                    fields[
                        "Reportado por"
                    ] ||
                    "",

                observaciones:
                    fields[
                        "Observaciones"
                    ] ||
                    "",

                fotografia:
                    fields[
                        "Fotografía del error"
                    ] ||
                    []

            });


        } catch (error) {

            console.error(
                "Error al obtener falla:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor ejecutándose en el puerto ${PORT}`
        );

    }
);
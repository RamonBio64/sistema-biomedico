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
   FUNCIONES AUXILIARES
========================================================= */

function obtenerCampo(
    fields,
    nombres
) {

    for (
        const nombre of nombres
    ) {

        if (
            fields[nombre] !== undefined &&
            fields[nombre] !== null &&
            fields[nombre] !== ""
        ) {

            return fields[nombre];

        }

    }

    return "";

}


/* =========================================================
   OBTENER EQUIPOS RELACIONADOS
========================================================= */

async function obtenerEquiposRelacionados(
    equipoRelacionado
) {

    if (
        !Array.isArray(equipoRelacionado) ||
        equipoRelacionado.length === 0
    ) {

        return [];

    }


    const equipos = [];


    for (
        const equipoId of equipoRelacionado
    ) {

        try {

            const equipoRecord =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    equipoId
                );


            const fields =
                equipoRecord.fields || {};


            const equipo = {

                id:
                    equipoRecord.id,

                nombre:
                    obtenerCampo(
                        fields,
                        [
                            "Nombre del equipo",
                            "Nombre",
                            "nombre del equipo",
                            "Equipo"
                        ]
                    ),

                numeroActivoFijo:
                    obtenerCampo(
                        fields,
                        [
                            "Numero de activo fijo",
                            "Número de activo fijo"
                        ]
                    ),

                areaServicio:
                    obtenerCampo(
                        fields,
                        [
                            "Servicio o área",
                            "Servicio o Area",
                            "Área / Servicio",
                            "Area / Servicio",
                            "Área",
                            "Area"
                        ]
                    ),

                marca:
                    obtenerCampo(
                        fields,
                        [
                            "Marca",
                            "marca"
                        ]
                    ),

                modelo:
                    obtenerCampo(
                        fields,
                        [
                            "Modelo",
                            "modelo"
                        ]
                    ),

                numeroSerie:
                    obtenerCampo(
                        fields,
                        [
                            "Número de serie",
                            "Numero de serie",
                            "Número de Serie",
                            "Serie"
                        ]
                    ),

                ubicacion:
                    obtenerCampo(
                        fields,
                        [
                            "Ubicación",
                            "Ubicacion"
                        ]
                    ),

                estado:
                    obtenerCampo(
                        fields,
                        [
                            "Estado del equipo",
                            "Estado",
                            "estado del equipo"
                        ]
                    ),

                criticidad:
                    obtenerCampo(
                        fields,
                        [
                            "Criticidad",
                            "criticidad"
                        ]
                    ),

                fields:
                    fields

            };


            equipos.push(
                equipo
            );


        } catch (error) {

            console.error(
                `Error al obtener equipo relacionado ${equipoId}:`,
                error.message
            );

        }

    }


    return equipos;

}


/* =========================================================
   NORMALIZAR ACCESORIO
========================================================= */

function normalizarAccesorio(
    record
) {

    const fields =
        record.fields || {};


    const nombre =
        obtenerCampo(
            fields,
            [
                "Nombre",
                "nombre",
                "Nombre del accesorio",
                "Nombre del accesorio médico"
            ]
        );


    const activoFijo =
        obtenerCampo(
            fields,
            [
                "Numero de activo fijo",
                "Número de activo fijo",
                "Numero de activo",
                "Número de activo",
                "Activo fijo",
                "Activo"
            ]
        );


    const serie =
        obtenerCampo(
            fields,
            [
                "Serie",
                "Número de serie",
                "Numero de serie"
            ]
        );


    const modelo =
        obtenerCampo(
            fields,
            [
                "Modelo",
                "modelo"
            ]
        );


    const estado =
        obtenerCampo(
            fields,
            [
                "Estado",
                "estado"
            ]
        );


    const color =
        obtenerCampo(
            fields,
            [
                "Color",
                "color"
            ]
        );


    const activo =
        obtenerCampo(
            fields,
            [
                "Activo",
                "activo"
            ]
        );


    const observaciones =
        obtenerCampo(
            fields,
            [
                "Observaciones",
                "observaciones"
            ]
        );


    const fotografia =
        obtenerCampo(
            fields,
            [
                "Fotografía",
                "Fotografia",
                "Fotografía del accesorio",
                "Fotografia del accesorio"
            ]
        );


    const equipoRelacionado =
        obtenerCampo(
            fields,
            [
                "Equipo Médico relacionado",
                "Equipo médico relacionado",
                "Equipo relacionado"
            ]
        );


    const cantidad =
        obtenerCampo(
            fields,
            [
                "Cantidad de accesorios",
                "Cantidad de accesorios médicos",
                "Conteo de accesorios",
                "Cantidad"
            ]
        );


    return {

        id:
            record.id,

        fields:
            fields,

        nombre:
            nombre,

        nombreAccesorio:
            nombre,

        activoFijo:
            activoFijo,

        numeroActivoFijo:
            activoFijo,

        numeroDeActivoFijo:
            activoFijo,

        serie:
            serie,

        numeroSerie:
            serie,

        modelo:
            modelo,

        estado:
            estado,

        color:
            color,

        activo:
            activo,

        observaciones:
            observaciones,

        fotografia:
            fotografia,

        equipoRelacionado:
            equipoRelacionado,

        cantidad:
            cantidad,

        cantidadAccesorios:
            cantidad

    };

}


/* =========================================================
   NORMALIZAR REPUESTO
========================================================= */

function normalizarRepuesto(
    record
) {

    const fields =
        record.fields || {};


    const nombre =
        obtenerCampo(
            fields,
            [
                "Nombre",
                "nombre",
                "Nombre del repuesto",
                "Nombre del repuesto médico"
            ]
        );


    const activoFijo =
        obtenerCampo(
            fields,
            [
                "Numero de activo fijo",
                "Número de activo fijo",
                "Numero de activo",
                "Número de activo",
                "Activo fijo",
                "Activo"
            ]
        );


    const serie =
        obtenerCampo(
            fields,
            [
                "Serie",
                "Número de serie",
                "Numero de serie"
            ]
        );


    const modelo =
        obtenerCampo(
            fields,
            [
                "Modelo",
                "modelo"
            ]
        );


    const estado =
        obtenerCampo(
            fields,
            [
                "Estado",
                "estado"
            ]
        );


    const lugar =
        obtenerCampo(
            fields,
            [
                "Lugar",
                "lugar"
            ]
        );


    const color =
        obtenerCampo(
            fields,
            [
                "Color",
                "color"
            ]
        );


    const observaciones =
        obtenerCampo(
            fields,
            [
                "Observaciones",
                "observaciones"
            ]
        );


    const compatibilidad =
        obtenerCampo(
            fields,
            [
                "Compatibilidad",
                "compatibilidad"
            ]
        );


    const equipoRelacionado =
        obtenerCampo(
            fields,
            [
                "Equipo Médico relacionado",
                "Equipo médico relacionado",
                "Equipo relacionado"
            ]
        );


    const fotografia =
        obtenerCampo(
            fields,
            [
                "Fotografía",
                "Fotografia",
                "Fotografía del repuesto",
                "Fotografia del repuesto"
            ]
        );


    const cantidad =
        obtenerCampo(
            fields,
            [
                "Cantidad de repuestos",
                "Cantidad de repuestos médicos",
                "Conteo de repuestos",
                "Cantidad"
            ]
        );


    return {

        id:
            record.id,

        fields:
            fields,

        nombre:
            nombre,

        nombreRepuesto:
            nombre,

        activoFijo:
            activoFijo,

        numeroActivoFijo:
            activoFijo,

        numeroDeActivoFijo:
            activoFijo,

        serie:
            serie,

        numeroSerie:
            serie,

        modelo:
            modelo,

        estado:
            estado,

        lugar:
            lugar,

        color:
            color,

        observaciones:
            observaciones,

        compatibilidad:
            compatibilidad,

        equipoRelacionado:
            equipoRelacionado,

        fotografia:
            fotografia,

        cantidad:
            cantidad,

        cantidadRepuestos:
            cantidad

    };

}


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

                id:
                    record.id,

                fields:
                    record.fields

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


            const resultado = [];


            for (
                const record of accesorios
            ) {

                const accesorio =
                    normalizarAccesorio(
                        record
                    );


                const equiposRelacionados =
                    await obtenerEquiposRelacionados(
                        accesorio.equipoRelacionado
                    );


                resultado.push({

                    ...accesorio,

                    equiposRelacionados:
                        equiposRelacionados

                });

            }


            res.json(
                resultado
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


            const accesorio =
                normalizarAccesorio(
                    record
                );


            const equiposRelacionados =
                await obtenerEquiposRelacionados(
                    accesorio.equipoRelacionado
                );


            res.json({

                ...accesorio,

                equiposRelacionados:
                    equiposRelacionados

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


            const resultado = [];


            for (
                const record of repuestos
            ) {

                const repuesto =
                    normalizarRepuesto(
                        record
                    );


                const equiposRelacionados =
                    await obtenerEquiposRelacionados(
                        repuesto.equipoRelacionado
                    );


                resultado.push({

                    ...repuesto,

                    equiposRelacionados:
                        equiposRelacionados

                });

            }


            res.json(
                resultado
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


            const repuesto =
                normalizarRepuesto(
                    record
                );


            const equiposRelacionados =
                await obtenerEquiposRelacionados(
                    repuesto.equipoRelacionado
                );


            res.json({

                ...repuesto,

                equiposRelacionados:
                    equiposRelacionados

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


            const campos = {

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


            const numeroFalla =
                await generarNumeroFalla(
                    numeroActivo
                );


            const fechaHora =
                new Date().toISOString();


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
                    "Reportada",

                "Reportado por":
                    reportadoPor,

                "Observaciones":
                    observaciones

            };


            console.log(
                "Campos que se enviarán a Airtable:",
                camposFalla
            );


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
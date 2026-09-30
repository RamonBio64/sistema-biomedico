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


/* =========================================================
   AIRTABLE
========================================================= */

Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base =
    Airtable.base(
        AIRTABLE_BASE_ID
    );


/* =========================================================
   CONFIGURACIÓN EXPRESS
========================================================= */

app.use(cors());

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
        path.join(__dirname, "public")
    )
);


/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function obtenerCampo(fields, nombres) {

    for (const nombre of nombres) {

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
   EQUIPOS RELACIONADOS
========================================================= */

async function obtenerEquiposRelacionados(
    equipoRelacionado
) {

    if (
        !equipoRelacionado ||
        !Array.isArray(equipoRelacionado)
    ) {

        return [];

    }

    const resultados = [];

    for (
        const equipoId
        of equipoRelacionado
    ) {

        try {

            const equipo =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    equipoId
                );

            const fields =
                equipo.fields;

            resultados.push({

                id: equipo.id,

                numeroActivo:
                    obtenerCampo(
                        fields,
                        [
                            "Número de activo fijo",
                            "Numero de activo fijo"
                        ]
                    ),

                nombre:
                    obtenerCampo(
                        fields,
                        [
                            "Nombre del equipo",
                            "nombre del equipo",
                            "Nombre"
                        ]
                    ),

                servicio:
                    obtenerCampo(
                        fields,
                        [
                            "servicio o área",
                            "Servicio o área",
                            "Servicio"
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

                serie:
                    obtenerCampo(
                        fields,
                        [
                            "Número de serie",
                            "Numero de serie",
                            "Serie"
                        ]
                    ),

                ubicacion:
                    obtenerCampo(
                        fields,
                        [
                            "Ubicación",
                            "ubicación"
                        ]
                    ),

                estado:
                    obtenerCampo(
                        fields,
                        [
                            "Estado del equipo",
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
                    )

            });

        } catch (error) {

            console.error(
                "Error obteniendo equipo relacionado:",
                error.message
            );

        }

    }

    return resultados;

}


/* =========================================================
   NORMALIZAR ACCESORIO
========================================================= */

async function normalizarAccesorio(
    record
) {

    const fields =
        record.fields;

    const equiposRelacionados =
        await obtenerEquiposRelacionados(
            fields[
                "Equipo Médico relacionado"
            ] ||
            fields[
                "Equipo relacionado"
            ]
        );

    return {

        id:
            record.id,

        nombre:
            obtenerCampo(
                fields,
                [
                    "Nombre",
                    "nombre"
                ]
            ),

        activoFijo:
            obtenerCampo(
                fields,
                [
                    "Activo fijo",
                    "Número de activo fijo",
                    "Numero de activo fijo"
                ]
            ),

        serie:
            obtenerCampo(
                fields,
                [
                    "Número de serie",
                    "Numero de serie",
                    "Serie"
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

        estado:
            obtenerCampo(
                fields,
                [
                    "Estado",
                    "estado"
                ]
            ),

        color:
            obtenerCampo(
                fields,
                [
                    "Color",
                    "color"
                ]
            ),

        activo:
            obtenerCampo(
                fields,
                [
                    "Activo",
                    "activo"
                ]
            ),

        observaciones:
            obtenerCampo(
                fields,
                [
                    "Observaciones",
                    "observaciones"
                ]
            ),

        fotografia:
            obtenerCampo(
                fields,
                [
                    "Fotografía",
                    "fotografía",
                    "Fotografia"
                ]
            ),

        equiposRelacionados

    };

}


/* =========================================================
   NORMALIZAR REPUESTO
========================================================= */

async function normalizarRepuesto(
    record
) {

    const fields =
        record.fields;

    const equiposRelacionados =
        await obtenerEquiposRelacionados(
            fields[
                "Equipo Médico relacionado"
            ] ||
            fields[
                "Equipo relacionado"
            ]
        );

    return {

        id:
            record.id,

        nombre:
            obtenerCampo(
                fields,
                [
                    "Nombre",
                    "nombre"
                ]
            ),

        activoFijo:
            obtenerCampo(
                fields,
                [
                    "Número de activo fijo",
                    "Numero de activo fijo",
                    "Activo fijo"
                ]
            ),

        serie:
            obtenerCampo(
                fields,
                [
                    "Número de serie",
                    "Numero de serie",
                    "Serie"
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

        estado:
            obtenerCampo(
                fields,
                [
                    "Estado",
                    "estado"
                ]
            ),

        lugar:
            obtenerCampo(
                fields,
                [
                    "Lugar",
                    "lugar"
                ]
            ),

        color:
            obtenerCampo(
                fields,
                [
                    "Color",
                    "color"
                ]
            ),

        observaciones:
            obtenerCampo(
                fields,
                [
                    "Observaciones",
                    "observaciones"
                ]
            ),

        compatibilidad:
            obtenerCampo(
                fields,
                [
                    "Compatibilidad",
                    "compatibilidad"
                ]
            ),

        equiposRelacionados

    };

}


/* =========================================================
   OBTENER EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id",
    async (
        req,
        res
    ) => {

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
                "Error obteniendo equipo:",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "No se pudo obtener el equipo."

            });

        }

    }
);


/* =========================================================
   ACCESORIOS DE UN EQUIPO
========================================================= */

app.get(
    "/api/accesorios/:equipoId",
    async (
        req,
        res
    ) => {

        try {

            const registros =
                await base(
                    TABLA_ACCESORIOS
                )
                .select()
                .all();

            const accesorios =
                [];

            for (
                const record
                of registros
            ) {

                const fields =
                    record.fields;

                const relacionados =
                    fields[
                        "Equipo Médico relacionado"
                    ] ||
                    fields[
                        "Equipo relacionado"
                    ];

                if (
                    Array.isArray(
                        relacionados
                    ) &&
                    relacionados.includes(
                        req.params.equipoId
                    )
                ) {

                    accesorios.push(
                        await normalizarAccesorio(
                            record
                        )
                    );

                }

            }

            res.json(
                accesorios
            );

        } catch (error) {

            console.error(
                "Error obteniendo accesorios:",
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
    async (
        req,
        res
    ) => {

        try {

            const record =
                await base(
                    TABLA_ACCESORIOS
                ).find(
                    req.params.id
                );

            const accesorio =
                await normalizarAccesorio(
                    record
                );

            res.json(
                accesorio
            );

        } catch (error) {

            console.error(
                "Error obteniendo accesorio:",
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
   REPUESTOS DE UN EQUIPO
========================================================= */

app.get(
    "/api/repuestos/:equipoId",
    async (
        req,
        res
    ) => {

        try {

            const registros =
                await base(
                    TABLA_REPUESTOS
                )
                .select()
                .all();

            const repuestos =
                [];

            for (
                const record
                of registros
            ) {

                const fields =
                    record.fields;

                const relacionados =
                    fields[
                        "Equipo Médico relacionado"
                    ] ||
                    fields[
                        "Equipo relacionado"
                    ];

                if (
                    Array.isArray(
                        relacionados
                    ) &&
                    relacionados.includes(
                        req.params.equipoId
                    )
                ) {

                    repuestos.push(
                        await normalizarRepuesto(
                            record
                        )
                    );

                }

            }

            res.json(
                repuestos
            );

        } catch (error) {

            console.error(
                "Error obteniendo repuestos:",
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
    async (
        req,
        res
    ) => {

        try {

            const record =
                await base(
                    TABLA_REPUESTOS
                ).find(
                    req.params.id
                );

            const repuesto =
                await normalizarRepuesto(
                    record
                );

            res.json(
                repuesto
            );

        } catch (error) {

            console.error(
                "Error obteniendo repuesto:",
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
   NORMALIZAR MANTENIMIENTO
========================================================= */

function normalizarMantenimiento(
    record
) {

    const fields =
        record.fields;

    return {

        id:
            record.id,

        equipoRelacionado:
            fields[
                "Equipo relacionado"
            ] ||
            fields[
                "Equipo Médico relacionado"
            ] ||
            [],

        numeroActivo:
            obtenerCampo(
                fields,
                [
                    "Número de activo fijo",
                    "Numero de activo fijo"
                ]
            ),

        fechaMantenimiento:
            obtenerCampo(
                fields,
                [
                    "Fecha de mantenimiento realizado"
                ]
            ),

        tipoMantenimiento:
            obtenerCampo(
                fields,
                [
                    "Tipo de mantenimiento"
                ]
            ),

        tecnicoResponsable:
            obtenerCampo(
                fields,
                [
                    "Técnico responsable",
                    "Tecnico responsable"
                ]
            ),

        estadoMantenimiento:
            obtenerCampo(
                fields,
                [
                    "Estado del mantenimiento"
                ]
            ),

        actividadesRealizadas:
            obtenerCampo(
                fields,
                [
                    "Actividades realizadas"
                ]
            ),

        hallazgos:
            obtenerCampo(
                fields,
                [
                    "Hallazgos"
                ]
            ),

        refaccionesUtilizadas:
            obtenerCampo(
                fields,
                [
                    "Refacciones utilizadas"
                ]
            ),

        observaciones:
            obtenerCampo(
                fields,
                [
                    "Observaciones"
                ]
            ),

        fechaProximoMantenimiento:
            obtenerCampo(
                fields,
                [
                    "Fecha de próximo mantenimiento",
                    "Fecha de proximo mantenimiento"
                ]
            )

    };

}


/* =========================================================
   OBTENER EQUIPO PARA MANTENIMIENTO
========================================================= */

async function obtenerEquipoParaMantenimiento(
    equipoRelacionado
) {

    if (
        !Array.isArray(
            equipoRelacionado
        ) ||
        equipoRelacionado.length === 0
    ) {

        return null;

    }

    try {

        const equipo =
            await base(
                TABLA_EQUIPOS
            ).find(
                equipoRelacionado[0]
            );

        const fields =
            equipo.fields;

        return {

            id:
                equipo.id,

            numeroActivo:
                obtenerCampo(
                    fields,
                    [
                        "Número de activo fijo",
                        "Numero de activo fijo"
                    ]
                ),

            nombre:
                obtenerCampo(
                    fields,
                    [
                        "Nombre del equipo",
                        "nombre del equipo",
                        "Nombre"
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

            servicio:
                obtenerCampo(
                    fields,
                    [
                        "servicio o área",
                        "Servicio o área",
                        "Servicio"
                    ]
                )

        };

    } catch (error) {

        console.error(
            "Error obteniendo equipo del mantenimiento:",
            error.message
        );

        return null;

    }

}


/* =========================================================
   LISTAR MANTENIMIENTOS DE UN EQUIPO
========================================================= */

app.get(
    "/api/mantenimientos/:equipoId",
    async (
        req,
        res
    ) => {

        try {

            const registros =
                await base(
                    TABLA_MANTENIMIENTOS
                )
                .select()
                .all();

            const mantenimientos =
                [];

            for (
                const record
                of registros
            ) {

                const fields =
                    record.fields;

                const relacionados =
                    fields[
                        "Equipo relacionado"
                    ] ||
                    fields[
                        "Equipo Médico relacionado"
                    ];

                if (
                    Array.isArray(
                        relacionados
                    ) &&
                    relacionados.includes(
                        req.params.equipoId
                    )
                ) {

                    const mantenimiento =
                        normalizarMantenimiento(
                            record
                        );

                    mantenimiento.equipo =
                        await obtenerEquipoParaMantenimiento(
                            mantenimiento.equipoRelacionado
                        );

                    mantenimientos.push(
                        mantenimiento
                    );

                }

            }

            res.json(
                mantenimientos
            );

        } catch (error) {

            console.error(
                "Error obteniendo mantenimientos:",
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
    async (
        req,
        res
    ) => {

        try {

            const record =
                await base(
                    TABLA_MANTENIMIENTOS
                ).find(
                    req.params.id
                );

            const mantenimiento =
                normalizarMantenimiento(
                    record
                );

            mantenimiento.equipo =
                await obtenerEquipoParaMantenimiento(
                    mantenimiento.equipoRelacionado
                );

            res.json(
                mantenimiento
            );

        } catch (error) {

            console.error(
                "Error obteniendo mantenimiento:",
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
    async (
        req,
        res
    ) => {

        try {

            console.log(
                "Datos recibidos para mantenimiento:",
                req.body
            );

            const datos =
                req.body;

            const equipoId =
                datos.equipoId ||
                "";

            const fechaMantenimiento =
                datos.fechaMantenimiento ||
                "";

            const tipoMantenimiento =
                datos.tipoMantenimiento ||
                "";

            const tecnicoResponsable =
                datos.tecnicoResponsable ||
                "";

            const estadoMantenimiento =
                datos.estadoMantenimiento ||
                "";

            const actividadesRealizadas =
                datos.actividadesRealizadas ||
                "";

            const hallazgos =
                datos.hallazgos ||
                "";

            const refaccionesUtilizadas =
                datos.refaccionesUtilizadas ||
                "";

            const observaciones =
                datos.observaciones ||
                "";

            const fechaProximoMantenimiento =
                datos.fechaProximoMantenimiento ||
                "";


            if (!equipoId) {

                return res.status(400).json({

                    error:
                        "No se recibió el identificador del equipo."

                });

            }


            if (!fechaMantenimiento) {

                return res.status(400).json({

                    error:
                        "La fecha de mantenimiento es obligatoria."

                });

            }

            if (!tipoMantenimiento) {

                return res.status(400).json({

                    error:
                        "El tipo de mantenimiento es obligatorio."

                });

            }

            if (!tecnicoResponsable) {

                return res.status(400).json({

                    error:
                        "El técnico responsable es obligatorio."

                });

            }


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
                    "Número de activo fijo"
                ] ||
                equipoFields[
                    "Numero de activo fijo"
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
                    fechaMantenimiento,

                "Tipo de mantenimiento":
                    tipoMantenimiento,

                "Técnico responsable":
                    tecnicoResponsable,

                "Estado del mantenimiento":
                    estadoMantenimiento,

                "Actividades realizadas":
                    actividadesRealizadas,

                "Hallazgos":
                    hallazgos,

                "Refacciones utilizadas":
                    refaccionesUtilizadas,

                "Observaciones":
                    observaciones

            };


            if (
                fechaProximoMantenimiento
            ) {

                campos[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            console.log(
                "Campos enviados a Airtable:",
                campos
            );


            const mantenimientoRecord =
                await base(
                    TABLA_MANTENIMIENTOS
                ).create(
                    campos
                );


            console.log(
                "Mantenimiento creado correctamente:",
                mantenimientoRecord.id
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
   MULTER PARA FOTOGRAFÍAS DE FALLAS
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
   GENERAR ID DE FALLA
========================================================= */

async function generarNumeroFalla() {

    const registros =
        await base(
            TABLA_FALLAS
        )
        .select({
            fields: [
                "ID Falla"
            ]
        })
        .all();

    let mayor =
        0;

    for (
        const record
        of registros
    ) {

        const valor =
            record.fields[
                "ID Falla"
            ];

        if (
            valor !== undefined &&
            valor !== null
        ) {

            const numero =
                parseInt(
                    String(
                        valor
                    ).replace(
                        /\D/g,
                        ""
                    )
                ) || 0;

            if (
                numero > mayor
            ) {

                mayor =
                    numero;

            }

        }

    }

    return (
        mayor + 1
    );

}


/* =========================================================
   CREAR FALLA
   CORREGIDO:
   "Nombre del equipo relacionado" ES BÚSQUEDA
   Y NO SE ESCRIBE MANUALMENTE
========================================================= */

app.post(
    "/api/falla",
    upload.single(
        "fotografia"
    ),
    async (
        req,
        res
    ) => {

        try {

            console.log(
                "Datos recibidos para falla:",
                req.body
            );

            const datos =
                req.body;

            const equipoId =
                datos.equipoId ||
                "";

            if (!equipoId) {

                return res.status(400).json({

                    error:
                        "No se recibió el identificador del equipo."

                });

            }


            /* -----------------------------------------
               BUSCAR EQUIPO
            ----------------------------------------- */

            const equipoRecord =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    equipoId
                );

            const equipoFields =
                equipoRecord.fields;


            /* -----------------------------------------
               OBTENER ACTIVO FIJO
            ----------------------------------------- */

            const numeroActivo =
                equipoFields[
                    "Número de activo fijo"
                ] ||
                equipoFields[
                    "Numero de activo fijo"
                ] ||
                "";


            /* -----------------------------------------
               GENERAR ID DE FALLA
            ----------------------------------------- */

            const numeroFalla =
                await generarNumeroFalla();


            /* -----------------------------------------
               CAMPOS PARA AIRTABLE
               
               IMPORTANTE:
               "Nombre del equipo relacionado"
               NO SE ENVÍA PORQUE ES BÚSQUEDA.
            ----------------------------------------- */

            const campos = {

                "ID Falla":
                    String(
                        numeroFalla
                    ),

                "Equipo relacionado":
                    [
                        equipoRecord.id
                    ],

                "Número de activo fijo":
                    numeroActivo,

                "Fecha y hora del reporte":
                    datos.fechaHora ||
                    new Date().toISOString(),

                "Tipo de falla":
                    datos.tipoFalla ||
                    "",

                "Descripción de la falla":
                    datos.descripcion ||
                    "",

                "Estado":
                    datos.estado ||
                    "Pendiente",

                "Reportado por":
                    datos.reportadoPor ||
                    "",

                "Observaciones":
                    datos.observaciones ||
                    ""

            };


            /* -----------------------------------------
               FOTOGRAFÍA
            ----------------------------------------- */

            if (
                req.file
            ) {

                campos[
                    "Fotografía del error"
                ] = [

                    {

                        filename:
                            req.file.originalname,

                        content:
                            req.file.buffer

                    }

                ];

            }


            console.log(
                "Campos de falla enviados a Airtable:",
                campos
            );


            /* -----------------------------------------
               CREAR FALLA
            ----------------------------------------- */

            const fallaRecord =
                await base(
                    TABLA_FALLAS
                ).create(
                    campos
                );


            console.log(
                "Falla creada correctamente:",
                fallaRecord.id
            );


            res.json({

                success:
                    true,

                id:
                    fallaRecord.id

            });

        } catch (error) {

            console.error(
                "Error al crear falla:",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "No se pudo registrar la falla."

            });

        }

    }
);


/* =========================================================
   LISTAR FALLAS DE UN EQUIPO
========================================================= */

app.get(
    "/api/fallas/:equipoId",
    async (
        req,
        res
    ) => {

        try {

            const registros =
                await base(
                    TABLA_FALLAS
                )
                .select()
                .all();

            const fallas =
                [];

            for (
                const record
                of registros
            ) {

                const fields =
                    record.fields;

                const relacionados =
                    fields[
                        "Equipo relacionado"
                    ];

                if (
                    Array.isArray(
                        relacionados
                    ) &&
                    relacionados.includes(
                        req.params.equipoId
                    )
                ) {

                    fallas.push({

                        id:
                            record.id,

                        fields:
                            fields,

                        idFalla:
                            fields[
                                "ID Falla"
                            ] || "",

                        nombreEquipo:
                            fields[
                                "Nombre del equipo relacionado"
                            ] || "",

                        numeroActivo:
                            fields[
                                "Número de activo fijo"
                            ] || "",

                        fechaHora:
                            fields[
                                "Fecha y hora del reporte"
                            ] || "",

                        tipoFalla:
                            fields[
                                "Tipo de falla"
                            ] || "",

                        descripcion:
                            fields[
                                "Descripción de la falla"
                            ] || "",

                        fotografia:
                            fields[
                                "Fotografía del error"
                            ] || [],

                        estado:
                            fields[
                                "Estado"
                            ] || "",

                        reportadoPor:
                            fields[
                                "Reportado por"
                            ] || "",

                        observaciones:
                            fields[
                                "Observaciones"
                            ] || ""

                    });

                }

            }

            res.json(
                fallas
            );

        } catch (error) {

            console.error(
                "Error obteniendo fallas:",
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
    async (
        req,
        res
    ) => {

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

                idFalla:
                    fields[
                        "ID Falla"
                    ] || "",

                nombreEquipo:
                    fields[
                        "Nombre del equipo relacionado"
                    ] || "",

                numeroActivo:
                    fields[
                        "Número de activo fijo"
                    ] || "",

                fechaHora:
                    fields[
                        "Fecha y hora del reporte"
                    ] || "",

                tipoFalla:
                    fields[
                        "Tipo de falla"
                    ] || "",

                descripcion:
                    fields[
                        "Descripción de la falla"
                    ] || "",

                fotografia:
                    fields[
                        "Fotografía del error"
                    ] || [],

                estado:
                    fields[
                        "Estado"
                    ] || "",

                reportadoPor:
                    fields[
                        "Reportado por"
                    ] || "",

                observaciones:
                    fields[
                        "Observaciones"
                    ] || ""

            });

        } catch (error) {

            console.error(
                "Error obteniendo falla:",
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
   RUTA PRINCIPAL
========================================================= */

app.get(
    "/",
    (
        req,
        res
    ) => {

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
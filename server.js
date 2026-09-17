require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Airtable = require("airtable");
const multer = require("multer");

const app = express();


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN =
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_KEY;

const AIRTABLE_BASE_ID =
    process.env.AIRTABLE_BASE_ID;

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD || "1234";


// ======================================================
// CONFIGURACIÓN DE AIRTABLE
// ======================================================

Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base =
    Airtable.base(AIRTABLE_BASE_ID);


// ======================================================
// NOMBRES DE LAS TABLAS
// ======================================================

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


// ======================================================
// CONFIGURACIÓN GENERAL DEL SERVIDOR
// ======================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// CONFIGURACIÓN PARA FOTOGRAFÍAS
// ======================================================

const upload =
    multer({
        storage: multer.memoryStorage(),

        limits: {
            fileSize:
                5 * 1024 * 1024
        }
    });


// ======================================================
// ARCHIVOS PÚBLICOS
// ======================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ======================================================
// PÁGINA PRINCIPAL
// ======================================================

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


// ======================================================
// OBTENER EQUIPO POR ID
// ======================================================

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

            const f =
                record.fields;

            res.json({

                id:
                    record.id,

                numeroActivo:
                    f["Numero de activo fijo"] ||
                    f["Número de activo fijo"] ||
                    "",

                servicio:
                    f["servicio o área"] ||
                    "",

                nombre:
                    f["nombre del equipo"] ||
                    "",

                marca:
                    f["marca"] ||
                    "",

                modelo:
                    f["modelo"] ||
                    "",

                serie:
                    f["número de serie"] ||
                    "",

                ubicacion:
                    f["ubicación"] ||
                    "",

                responsable:
                    f["responsable"] ||
                    "",

                estado:
                    f["estado del equipo"] ||
                    "",

                criticidad:
                    f["Criticidad"] ||
                    "",

                garantia:
                    f["Garantía "] ||
                    f["Garantía"] ||
                    "",

                condicionFisica:
                    f["Condición Física "] ||
                    f["Condición Física"] ||
                    "",

                fechaAdquisicion:
                    f["Fecha de adquisición"] ||
                    "",

                proveedor:
                    f["Proveedor"] ||
                    "",

                fechaUltimoMantenimiento:
                    f["Fecha de ultimo mantenimiento"] ||
                    "",

                fechaProximoMantenimiento:
                    f["Fecha de próximo mantenimiento"] ||
                    "",

                alertaMantenimiento:
                    f["alerta mantenimiento próximo"] ||
                    "",

                fotografia:
                    f["fotografía del equipo"] ||
                    [],

                accesorios:
                    f["Accesorios Médicos"] ||
                    [],

                repuestos:
                    f["Repuestos Médicos"] ||
                    [],

                correoMantenimientos:
                    f["Correo mantenimientos"] ||
                    "",

                urlFicha:
                    f["URL ficha"] ||
                    "",

                videos: [

                    {
                        titulo:
                            f["Título del video 1"] ||
                            "",

                        url:
                            f["URL del video 1 (YouTube)"] ||
                            ""
                    },

                    {
                        titulo:
                            f["Título del video 2"] ||
                            "",

                        url:
                            f["URL del video 2 (YouTube)"] ||
                            ""
                    },

                    {
                        titulo:
                            f["Título del video 3"] ||
                            "",

                        url:
                            f["URL del video 3 (YouTube)"] ||
                            ""
                    },

                    {
                        titulo:
                            f["Título del video 4"] ||
                            "",

                        url:
                            f["URL del video 4 (YouTube)"] ||
                            ""
                    }

                ]

            });

        } catch (error) {

            console.error(
                "Error al obtener equipo:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener la información del equipo.",

                detalle:
                    error.message

            });

        }

    }
);


// ======================================================
// OBTENER ACCESORIOS DE UN EQUIPO
// ======================================================

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;

            const records =
                await base(
                    TABLA_ACCESORIOS
                )
                .select({
                    maxRecords: 1000
                })
                .all();

            const accesorios =
                records
                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] || [];

                        return (
                            Array.isArray(
                                relacionados
                            ) &&
                            relacionados.includes(
                                equipoId
                            )
                        );

                    })
                    .map(record => {

                        const f =
                            record.fields;

                        return {

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
                                f[
                                    "Equipo Médico relacionado"
                                ] ||
                                []

                        };

                    });

            res.json({

                correcto: true,

                accesorios:
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
                    "No se pudieron obtener los accesorios.",

                detalle:
                    error.message

            });

        }

    }
);


// ======================================================
// OBTENER UN ACCESORIO POR ID
// ======================================================

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

            const f =
                record.fields;

            const equiposRaw =
                f[
                    "Equipo Médico relacionado"
                ] || [];

            const equiposIds =
                Array.isArray(equiposRaw)
                    ? equiposRaw
                    : equiposRaw
                        ? [equiposRaw]
                        : [];

            const equiposRelacionados = [];

            for (
                const equipoId
                of equiposIds
            ) {

                try {

                    const equipoRecord =
                        await base(
                            TABLA_EQUIPOS
                        ).find(
                            equipoId
                        );

                    const ef =
                        equipoRecord.fields;

                    equiposRelacionados.push({

                        id:
                            equipoRecord.id,

                        numeroActivo:
                            ef[
                                "Numero de activo fijo"
                            ] ||
                            ef[
                                "Número de activo fijo"
                            ] ||
                            "",

                        servicio:
                            ef[
                                "servicio o área"
                            ] ||
                            "",

                        nombre:
                            ef[
                                "nombre del equipo"
                            ] ||
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
                            ef[
                                "estado del equipo"
                            ] ||
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

            res.json({

                correcto: true,

                accesorio: {

                    id:
                        record.id,

                    nombre:
                        f[
                            "Nombre del accesorio"
                        ] ||
                        f[
                            "nombre del accesorio"
                        ] ||
                        f["Nombre"] ||
                        "",

                    numeroActivo:
                        f[
                            "Número de activo fijo"
                        ] ||
                        f[
                            "Numero de activo fijo"
                        ] ||
                        "",

                    serie:
                        f[
                            "Número de serie"
                        ] ||
                        f[
                            "número de serie"
                        ] ||
                        "",

                    modelo:
                        f["Modelo"] ||
                        f["modelo"] ||
                        "",

                    estado:
                        f[
                            "Estado del accesorio"
                        ] ||
                        f[
                            "estado del accesorio"
                        ] ||
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
                    "No se pudo obtener la información del accesorio.",

                detalle:
                    error.message

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

            const equipoId =
                req.params.id;

            const records =
                await base(
                    TABLA_REPUESTOS
                )
                .select({
                    maxRecords: 1000
                })
                .all();

            const repuestos =
                records
                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] || [];

                        return (
                            Array.isArray(
                                relacionados
                            ) &&
                            relacionados.includes(
                                equipoId
                            )
                        );

                    })
                    .map(record => {

                        const f =
                            record.fields;

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
                                f[
                                    "Equipo Médico relacionado"
                                ] ||
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

                repuestos:
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
                    "No se pudieron obtener los repuestos.",

                detalle:
                    error.message

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
                await base(
                    TABLA_REPUESTOS
                ).find(
                    req.params.id
                );

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
                        f[
                            "Equipo Médico relacionado"
                        ] ||
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
                    "No se pudo obtener la información del repuesto.",

                detalle:
                    error.message

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
                await base(
                    TABLA_MANTENIMIENTOS
                )
                .select({
                    maxRecords: 1000
                })
                .all();

            const mantenimientos =
                records
                    .filter(record => {

                        const relacionados =
                            record.fields[
                                "Equipo relacionado"
                            ] || [];

                        const ids =
                            Array.isArray(
                                relacionados
                            )
                                ? relacionados
                                : relacionados
                                    ? [relacionados]
                                    : [];

                        return ids.includes(
                            equipoId
                        );

                    })
                    .map(record => {

                        const f =
                            record.fields;

                        return {

                            id:
                                record.id,

                            numeroActivo:
                                f[
                                    "Número de activo fijo"
                                ] ||
                                f[
                                    "Numero de activo fijo"
                                ] ||
                                "",

                            fechaMantenimiento:
                                f[
                                    "Fecha de mantenimiento realizado"
                                ] ||
                                "",

                            tipoMantenimiento:
                                f[
                                    "Tipo de mantenimiento"
                                ] ||
                                "",

                            tecnico:
                                f[
                                    "Técnico responsable"
                                ] ||
                                f[
                                    "Técnico responsable "
                                ] ||
                                "",

                            estado:
                                f[
                                    "Estado del mantenimiento"
                                ] ||
                                "",

                            actividades:
                                f[
                                    "Actividades realizadas"
                                ] ||
                                "",

                            hallazgos:
                                f[
                                    "Hallazgos"
                                ] ||
                                "",

                            refacciones:
                                f[
                                    "Refacciones utilizadas"
                                ] ||
                                "",

                            observaciones:
                                f[
                                    "Observaciones"
                                ] ||
                                "",

                            proximoMantenimiento:
                                f[
                                    "Fecha de próximo mantenimiento"
                                ] ||
                                "",

                            idMantenimiento:
                                f[
                                    "ID Mantenimiento por Equipo"
                                ] ||
                                ""

                        };

                    });

            mantenimientos.sort(
                (a, b) => {

                    return (
                        new Date(
                            b.fechaMantenimiento
                        ) -
                        new Date(
                            a.fechaMantenimiento
                        )
                    );

                }
            );

            res.json({

                correcto: true,

                mantenimientos:
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
                    "No se pudo obtener el historial de mantenimientos.",

                detalle:
                    error.message

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

            const mantenimientoId =
                req.params.id;

            const record =
                await base(
                    TABLA_MANTENIMIENTOS
                ).find(
                    mantenimientoId
                );

            const f =
                record.fields;


            // ==================================================
            // OBTENER EQUIPO RELACIONADO
            // ==================================================

            const relacionadosRaw =
                f[
                    "Equipo relacionado"
                ] || [];

            const equipoIds =
                Array.isArray(
                    relacionadosRaw
                )
                    ? relacionadosRaw
                    : relacionadosRaw
                        ? [relacionadosRaw]
                        : [];

            let equipo = null;


            if (
                equipoIds.length > 0
            ) {

                try {

                    const equipoRecord =
                        await base(
                            TABLA_EQUIPOS
                        ).find(
                            equipoIds[0]
                        );

                    const ef =
                        equipoRecord.fields;

                    equipo = {

                        id:
                            equipoRecord.id,

                        numeroActivo:
                            ef[
                                "Numero de activo fijo"
                            ] ||
                            ef[
                                "Número de activo fijo"
                            ] ||
                            "",

                        nombre:
                            ef[
                                "nombre del equipo"
                            ] ||
                            "",

                        servicio:
                            ef[
                                "servicio o área"
                            ] ||
                            "",

                        marca:
                            ef["marca"] ||
                            "",

                        modelo:
                            ef["modelo"] ||
                            "",

                        serie:
                            ef[
                                "número de serie"
                            ] ||
                            "",

                        ubicacion:
                            ef[
                                "ubicación"
                            ] ||
                            ""

                    };

                } catch (errorEquipo) {

                    console.error(
                        "Error al obtener equipo relacionado:",
                        errorEquipo.message
                    );

                }

            }


            // ==================================================
            // INFORMACIÓN DEL MANTENIMIENTO
            // ==================================================

            const mantenimiento = {

                id:
                    record.id,

                numeroActivo:
                    f[
                        "Número de activo fijo"
                    ] ||
                    f[
                        "Numero de activo fijo"
                    ] ||
                    (
                        equipo
                            ? equipo.numeroActivo
                            : ""
                    ),

                fechaMantenimiento:
                    f[
                        "Fecha de mantenimiento realizado"
                    ] ||
                    "",

                tipoMantenimiento:
                    f[
                        "Tipo de mantenimiento"
                    ] ||
                    "",

                tecnico:
                    f[
                        "Técnico responsable"
                    ] ||
                    f[
                        "Técnico responsable "
                    ] ||
                    "",

                estado:
                    f[
                        "Estado del mantenimiento"
                    ] ||
                    "",

                actividades:
                    f[
                        "Actividades realizadas"
                    ] ||
                    "",

                hallazgos:
                    f[
                        "Hallazgos"
                    ] ||
                    "",

                refacciones:
                    f[
                        "Refacciones utilizadas"
                    ] ||
                    "",

                observaciones:
                    f[
                        "Observaciones"
                    ] ||
                    "",

                proximoMantenimiento:
                    f[
                        "Fecha de próximo mantenimiento"
                    ] ||
                    "",

                idMantenimiento:
                    f[
                        "ID Mantenimiento por Equipo"
                    ] ||
                    "",

                equipoRelacionado:
                    equipoIds

            };


            // ==================================================
            // RESPUESTA
            // ==================================================

            res.json({

                correcto: true,

                mantenimiento:
                    mantenimiento,

                equipo:
                    equipo

            });

        } catch (error) {

            console.error(
                "Error al obtener mantenimiento:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el mantenimiento.",

                detalle:
                    error.message

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

            // ==================================================
            // COMPROBAR CONTRASEÑA
            // ==================================================

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


            // ==================================================
            // RECIBIR DATOS
            // ==================================================

            const {

                equipoId,

                numeroActivo,

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


            // ==================================================
            // COMPROBAR EQUIPO
            // ==================================================

            if (!equipoId) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "No se recibió el equipo."

                });

            }


            // ==================================================
            // COMPROBAR FECHA
            // ==================================================

            if (!fechaMantenimiento) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "Debe indicar la fecha del mantenimiento."

                });

            }


            // ==================================================
            // COMPROBAR TIPO
            // ==================================================

            if (!tipoMantenimiento) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "Debe indicar el tipo de mantenimiento."

                });

            }


            // ==================================================
            // COMPROBAR TÉCNICO
            // ==================================================

            if (!tecnicoResponsable) {

                return res.status(400).json({

                    correcto: false,

                    error:
                        "Debe indicar el técnico responsable."

                });

            }


            // ==================================================
            // CREAR REGISTRO EN AIRTABLE
            // ==================================================

            const campos = {

                "Equipo relacionado":
                    [equipoId],

                "Fecha de mantenimiento realizado":
                    fechaMantenimiento,

                "Tipo de mantenimiento":
                    tipoMantenimiento,

                "Técnico responsable":
                    tecnicoResponsable,

                "Estado del mantenimiento":
                    estadoMantenimiento ||
                    "Realizado",

                "Actividades realizadas":
                    actividadesRealizadas ||
                    "",

                "Hallazgos":
                    hallazgos ||
                    "",

                "Refacciones utilizadas":
                    refaccionesUtilizadas ||
                    "",

                "Observaciones":
                    observaciones ||
                    ""

            };


            // ==================================================
            // FECHA DE PRÓXIMO MANTENIMIENTO
            // ==================================================

            if (
                fechaProximoMantenimiento
            ) {

                campos[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            // ==================================================
            // CREAR MANTENIMIENTO
            // ==================================================

            const nuevoMantenimiento =
                await base(
                    TABLA_MANTENIMIENTOS
                ).create(
                    campos
                );


            // ==================================================
            // ACTUALIZAR FECHAS DEL EQUIPO
            // ==================================================

            const camposEquipo = {

                "Fecha de ultimo mantenimiento":
                    fechaMantenimiento

            };


            if (
                fechaProximoMantenimiento
            ) {

                camposEquipo[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            await base(
                TABLA_EQUIPOS
            ).update(
                equipoId,
                camposEquipo
            );


            // ==================================================
            // RESPUESTA
            // ==================================================

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
                    "No se pudo guardar el mantenimiento.",

                detalle:
                    error.message

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


            // ==================================================
            // OBTENER EQUIPO
            // ==================================================

            const equipoRecord =
                await base(
                    TABLA_EQUIPOS
                ).find(
                    equipoId
                );

            const ef =
                equipoRecord.fields;


            // ==================================================
            // CREAR FALLA
            // ==================================================

            const fallaRecord =
                await base(
                    TABLA_FALLAS
                ).create({

                    "Equipo relacionado":
                        [equipoId],

                    "Nombre del equipo":
                        ef[
                            "nombre del equipo"
                        ] ||
                        "",

                    "Número de activo fijo":
                        ef[
                            "Numero de activo fijo"
                        ] ||
                        ef[
                            "Número de activo fijo"
                        ] ||
                        "",

                    "Tipo de falla":
                        tipoFalla,

                    "Descripción de la falla":
                        descripcionFalla,

                    "Fecha y hora":
                        new Date().toISOString()

                });


            // ==================================================
            // SUBIR FOTOGRAFÍA
            // ==================================================

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


            // ==================================================
            // RESPUESTA
            // ==================================================

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
                    "No se pudo registrar la falla.",

                detalle:
                    error.message

            });

        }

    }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor ejecutándose en el puerto ${PORT}`
        );

    }
);
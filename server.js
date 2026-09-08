require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Airtable = require("airtable");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN =
    process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY;

const AIRTABLE_BASE_ID =
    process.env.AIRTABLE_BASE_ID;

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD || "1234";

if (!AIRTABLE_TOKEN) {
    console.error(
        "ERROR: Falta AIRTABLE_TOKEN o AIRTABLE_API_KEY en .env"
    );
}

if (!AIRTABLE_BASE_ID) {
    console.error(
        "ERROR: Falta AIRTABLE_BASE_ID en .env"
    );
}

const base = new Airtable({
    apiKey: AIRTABLE_TOKEN
}).base(AIRTABLE_BASE_ID);


/* =========================================================
   TABLAS DE AIRTABLE
========================================================= */

const TABLA_EQUIPOS =
    "Equipos Médicos";

const TABLA_ACCESORIOS =
    "Accesorios Médicos";

const TABLA_REPUESTOS =
    "Repuestos Médicos";

const TABLA_MANTENIMIENTO =
    "Mantenimientos";


/* =========================================================
   ARCHIVOS PÚBLICOS
========================================================= */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */

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
   API - EQUIPO
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

            const f =
                record.fields;

            const equipo = {

                id: record.id,

                numeroActivo:
                    f["Numero de activo fijo"] ||
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
                    "",

                condicionFisica:
                    f["Condición Física "] ||
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


                /* =================================================
                   AYUDA VISUAL - VIDEOS DE YOUTUBE
                ================================================= */

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

            };

            res.json(equipo);

        } catch (error) {

            console.error(
                "Error obteniendo equipo:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el equipo",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - ACCESORIOS DE UN EQUIPO
========================================================= */

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

                        const equipo =
                            record.fields[
                                "Equipo Médico relacionado"
                            ] || [];

                        return (
                            Array.isArray(equipo) &&
                            equipo.includes(equipoId)
                        );

                    })
                    .map(record => {

                        const f =
                            record.fields;

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

                accesorios:
                    accesorios

            });

        } catch (error) {

            console.error(
                "Error obteniendo accesorios:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudieron obtener los accesorios",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - ACCESORIO INDIVIDUAL
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

            const f =
                record.fields;

            res.json({

                correcto: true,

                accesorio: {

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

                }

            });

        } catch (error) {

            console.error(
                "Error obteniendo accesorio:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el accesorio",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - REPUESTOS DE UN EQUIPO
========================================================= */

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

                        const equipo =
                            record.fields[
                                "Equipo relacionado"
                            ] || [];

                        return (
                            Array.isArray(equipo) &&
                            equipo.includes(equipoId)
                        );

                    })
                    .map(record => {

                        const f =
                            record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["Nombre del repuesto"] ||
                                f["nombre del repuesto"] ||
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
                                f["Estado del repuesto"] ||
                                f["estado del repuesto"] ||
                                "",

                            color:
                                f["Color"] ||
                                f["color"] ||
                                "",

                            lugar:
                                f["Lugar"] ||
                                f["lugar"] ||
                                "",

                            tipoCompatibilidad:
                                f["Tipo de compatibilidad"] ||
                                f["tipo de compatibilidad"] ||
                                "",

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
                                f["Equipo relacionado"] ||
                                []

                        };

                    });

            res.json({

                correcto: true,

                repuestos:
                    repuestos

            });

        } catch (error) {

            console.error(
                "Error obteniendo repuestos:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudieron obtener los repuestos",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - REPUESTO INDIVIDUAL
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

            const f =
                record.fields;

            res.json({

                correcto: true,

                repuesto: {

                    id: record.id,

                    nombre:
                        f["Nombre del repuesto"] ||
                        f["nombre del repuesto"] ||
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
                        f["Estado del repuesto"] ||
                        f["estado del repuesto"] ||
                        "",

                    color:
                        f["Color"] ||
                        f["color"] ||
                        "",

                    lugar:
                        f["Lugar"] ||
                        f["lugar"] ||
                        "",

                    tipoCompatibilidad:
                        f["Tipo de compatibilidad"] ||
                        f["tipo de compatibilidad"] ||
                        "",

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
                        f["Equipo relacionado"] ||
                        []

                }

            });

        } catch (error) {

            console.error(
                "Error obteniendo repuesto:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el repuesto",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - HISTORIAL DE MANTENIMIENTO
========================================================= */

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;

            const records =
                await base(
                    TABLA_MANTENIMIENTO
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

                        return (
                            Array.isArray(relacionados) &&
                            relacionados.includes(equipoId)
                        );

                    })
                    .map(record => {

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
                                f["Tipo de mantenimiento(preventivo, correctivo)"] ||
                                "",

                            tecnico:
                                f["Técnico responsable "] ||
                                f["Técnico responsable"] ||
                                "",

                            estado:
                                f["Estado del mantenimiento"] ||
                                f["Estado del mantenimiento(realizado, pendiente, en proceso, realizado)"] ||
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


            mantenimientos.sort(
                (a, b) =>
                    new Date(
                        b.fechaMantenimiento
                    ) -
                    new Date(
                        a.fechaMantenimiento
                    )
            );


            res.json({

                correcto: true,

                mantenimientos:
                    mantenimientos

            });

        } catch (error) {

            console.error(
                "Error obteniendo historial:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el historial",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   API - MANTENIMIENTO INDIVIDUAL
========================================================= */

app.get(
    "/api/mantenimiento/:id",
    async (req, res) => {

        try {

            const mantenimientoId =
                req.params.id;

            const record =
                await base(
                    TABLA_MANTENIMIENTO
                ).find(
                    mantenimientoId
                );

            const f =
                record.fields;

            const relacionados =
                f["Equipo relacionado"] ||
                [];

            let equipo = null;

            if (
                Array.isArray(relacionados) &&
                relacionados.length > 0
            ) {

                try {

                    const equipoRecord =
                        await base(
                            TABLA_EQUIPOS
                        ).find(
                            relacionados[0]
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
                        "No se pudo obtener información del equipo relacionado:",
                        errorEquipo.message
                    );

                }

            }


            const mantenimiento = {

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
                    f["Tipo de mantenimiento(preventivo, correctivo)"] ||
                    "",

                tecnico:
                    f["Técnico responsable "] ||
                    f["Técnico responsable"] ||
                    "",

                estado:
                    f["Estado del mantenimiento"] ||
                    f["Estado del mantenimiento(realizado, pendiente, en proceso, realizado)"] ||
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
                    "",

                equipoRelacionado:
                    relacionados,

                camposOriginales:
                    f

            };


            res.json({

                correcto: true,

                mantenimiento:
                    mantenimiento,

                equipo:
                    equipo

            });

        } catch (error) {

            console.error(
                "Error obteniendo mantenimiento individual:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo obtener el mantenimiento",

                detalle:
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
                        "Contraseña incorrecta"

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
                        "Falta el equipo relacionado"

                });

            }


            const campos = {

                "Equipo relacionado":
                    [equipoId],

                "Fecha de mantenimiento realizado":
                    fechaMantenimiento,

                "Tipo de mantenimiento":
                    tipoMantenimiento,

                "Técnico responsable ":
                    tecnicoResponsable,

                "Estado del mantenimiento":
                    estadoMantenimiento ||
                    "pendiente",

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


            if (
                fechaProximoMantenimiento
            ) {

                campos[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            const nuevo =
                await base(
                    TABLA_MANTENIMIENTO
                ).create(
                    campos
                );


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
            )
            .update(
                equipoId,
                camposEquipo
            );


            res.json({

                correcto: true,

                id:
                    nuevo.id

            });

        } catch (error) {

            console.error(
                "Error creando mantenimiento:",
                error
            );

            res.status(500).json({

                correcto: false,

                error:
                    "No se pudo crear el mantenimiento",

                detalle:
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
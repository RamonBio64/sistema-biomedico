require("dotenv").config();

const express = require("express");
const Airtable = require("airtable");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const TABLA_EQUIPOS = "Equipos Médicos";
const TABLA_ACCESORIOS = "Accesorios Médicos";
const TABLA_REPUESTOS = "Repuestos Médicos";
const TABLA_MANTENIMIENTO = "Mantenimientos";

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD;

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN
}).base(
    process.env.AIRTABLE_BASE_ID
);

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================================
// OBTENER EQUIPO
// =====================================================

app.get(
    "/api/equipo/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const f = record.fields;

            res.json({

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

                ultimoMantenimiento:
                    f["Fecha de ultimo mantenimiento"] || "",

                proximoMantenimiento:
                    f["Fecha de próximo mantenimiento"] || "",

                alertaMantenimiento:
                    f["alerta mantenimiento próximo"] || "",

                fotografia:
                    f["fotografía del equipo"] || [],

                accesorios:
                    f["Accesorios Médicos"] || [],

                repuestos:
                    f["Repuestos Médicos"] || []

            });

        } catch (error) {

            console.error(
                "Error obteniendo equipo:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el equipo",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// ACCESORIOS DE UN EQUIPO
// =====================================================

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const records =
                await base(TABLA_ACCESORIOS)
                    .select({
                        maxRecords: 1000
                    })
                    .all();

            const accesorios =
                records
                    .filter(record => {

                        const equipo =
                            record.fields["Equipo"] || [];

                        return Array.isArray(equipo) &&
                               equipo.includes(
                                   req.params.id
                               );

                    })
                    .map(record => {

                        const f = record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["nombre del accesorio"] || "",

                            numeroActivo:
                                f["numero de activo fijo"] || "",

                            serie:
                                f["numero de serie"] || "",

                            modelo:
                                f["modelo"] || "",

                            estado:
                                f["estado del accesorio"] || "",

                            color:
                                f["color"] || "",

                            activo:
                                f["activo"] || false,

                            observaciones:
                                f["observaciones"] || "",

                            fotografia:
                                f["fotografia"] || []

                        };

                    });

            res.json(accesorios);

        } catch (error) {

            console.error(
                "Error obteniendo accesorios:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener los accesorios",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// FICHA DE ACCESORIO
// =====================================================

app.get(
    "/api/accesorio/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_ACCESORIOS)
                    .find(req.params.id);

            const f = record.fields;

            res.json({

                id: record.id,

                nombre:
                    f["nombre del accesorio"] || "",

                numeroActivo:
                    f["numero de activo fijo"] || "",

                serie:
                    f["numero de serie"] || "",

                modelo:
                    f["modelo"] || "",

                estado:
                    f["estado del accesorio"] || "",

                color:
                    f["color"] || "",

                activo:
                    f["activo"] || false,

                observaciones:
                    f["observaciones"] || "",

                fotografia:
                    f["fotografia"] || []

            });

        } catch (error) {

            console.error(
                "Error obteniendo accesorio:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el accesorio",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// REPUESTOS DE UN EQUIPO
// =====================================================

app.get(
    "/api/equipo/:id/repuestos",
    async (req, res) => {

        try {

            const records =
                await base(TABLA_REPUESTOS)
                    .select({
                        maxRecords: 1000
                    })
                    .all();

            const repuestos =
                records
                    .filter(record => {

                        const equipo =
                            record.fields["Equipo"] || [];

                        return Array.isArray(equipo) &&
                               equipo.includes(
                                   req.params.id
                               );

                    })
                    .map(record => {

                        const f = record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["nombre del repuesto"] || "",

                            numeroActivo:
                                f["numero de activo fijo"] || "",

                            serie:
                                f["numero de serie"] || "",

                            modelo:
                                f["modelo"] || "",

                            estado:
                                f["estado del repuesto"] || "",

                            color:
                                f["color"] || "",

                            lugar:
                                f["lugar donde se encuentra"] || "",

                            compatibilidad:
                                f["tipo de compatibilidad"] || "",

                            observaciones:
                                f["observaciones"] || "",

                            fotografia:
                                f["fotografia"] || []

                        };

                    });

            res.json(repuestos);

        } catch (error) {

            console.error(
                "Error obteniendo repuestos:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener los repuestos",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// FICHA DE REPUESTO
// =====================================================

app.get(
    "/api/repuesto/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_REPUESTOS)
                    .find(req.params.id);

            const f = record.fields;

            res.json({

                id: record.id,

                nombre:
                    f["nombre del repuesto"] || "",

                numeroActivo:
                    f["numero de activo fijo"] || "",

                serie:
                    f["numero de serie"] || "",

                modelo:
                    f["modelo"] || "",

                estado:
                    f["estado del repuesto"] || "",

                color:
                    f["color"] || "",

                lugar:
                    f["lugar donde se encuentra"] || "",

                compatibilidad:
                    f["tipo de compatibilidad"] || "",

                observaciones:
                    f["observaciones"] || "",

                fotografia:
                    f["fotografia"] || []

            });

        } catch (error) {

            console.error(
                "Error obteniendo repuesto:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el repuesto",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// HISTORIAL DE MANTENIMIENTO
// =====================================================

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;

            const records =
                await base(TABLA_MANTENIMIENTO)
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

                            numeroActivo:
                                f[
                                    "Número de activo fijo"
                                ] || "",

                            fechaMantenimiento:
                                f[
                                    "Fecha de mantenimiento realizado"
                                ] || "",

                            tipoMantenimiento:
                                f[
                                    "Tipo de mantenimiento"
                                ] || "",

                            tecnico:
                                f[
                                    "Técnico responsable "
                                ] ||
                                f[
                                    "Técnico responsable"
                                ] ||
                                "",

                            estado:
                                f[
                                    "Estado del mantenimiento"
                                ] || "",

                            actividades:
                                f[
                                    "Actividades realizadas"
                                ] || "",

                            hallazgos:
                                f[
                                    "Hallazgos"
                                ] || "",

                            refacciones:
                                f[
                                    "Refacciones utilizadas"
                                ] || "",

                            observaciones:
                                f[
                                    "Observaciones"
                                ] || "",

                            proximoMantenimiento:
                                f[
                                    "Fecha de próximo mantenimiento"
                                ] || "",

                            idMantenimiento:
                                f[
                                    "ID Mantenimiento por Equipo"
                                ] || ""

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


// =====================================================
// REGISTRAR MANTENIMIENTO
// =====================================================

app.post(
    "/api/mantenimiento",
    async (req, res) => {

        try {

            const {

                password,
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


            // -----------------------------------------
            // VALIDAR CONTRASEÑA
            // -----------------------------------------

            if (
                !MANTENIMIENTO_PASSWORD ||
                password !==
                    MANTENIMIENTO_PASSWORD
            ) {

                return res.status(401).json({

                    error:
                        "Contraseña incorrecta"

                });

            }


            // -----------------------------------------
            // VALIDAR CAMPOS OBLIGATORIOS
            // -----------------------------------------

            if (
                !equipoId ||
                !fechaMantenimiento ||
                !tipoMantenimiento ||
                !tecnicoResponsable
            ) {

                return res.status(400).json({

                    error:
                        "Faltan campos obligatorios"

                });

            }


            // -----------------------------------------
            // CREAR CAMPOS DEL MANTENIMIENTO
            // -----------------------------------------

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
                    "",

                "Fecha de próximo mantenimiento":
                    fechaProximoMantenimiento ||
                    undefined

            };


            if (numeroActivo) {

                campos[
                    "Número de activo fijo"
                ] =
                    numeroActivo;

            }


            Object.keys(campos)
                .forEach(key => {

                    if (
                        campos[key] ===
                        undefined
                    ) {

                        delete campos[key];

                    }

                });


            // -----------------------------------------
            // GUARDAR MANTENIMIENTO EN AIRTABLE
            // -----------------------------------------

            const nuevoMantenimiento =
                await base(
                    TABLA_MANTENIMIENTO
                ).create(
                    campos
                );


            // -----------------------------------------
            // ACTUALIZAR FECHAS DEL EQUIPO
            // -----------------------------------------

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


            // -----------------------------------------
            // RESPUESTA
            // -----------------------------------------

            res.json({

                success: true,

                mensaje:
                    "Mantenimiento registrado correctamente",

                mantenimientoId:
                    nuevoMantenimiento.id

            });

        } catch (error) {

            console.error(
                "Error registrando mantenimiento:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo registrar el mantenimiento",

                detalle:
                    error.message

            });

        }

    }
);


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor ejecutándose en puerto ${PORT}`
        );

    }
);
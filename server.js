require("dotenv").config();

const express = require("express");
const Airtable = require("airtable");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   AIRTABLE
========================================================= */

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);


/* =========================================================
   TABLAS
========================================================= */

const TABLA_EQUIPOS = "Equipos Médicos";
const TABLA_ACCESORIOS = "Accesorios Médicos";
const TABLA_REPUESTOS = "Repuestos Médicos";
const TABLA_MANTENIMIENTO = "Mantenimiento";


/* =========================================================
   CONTRASEÑA DE MANTENIMIENTO
========================================================= */

const MANTENIMIENTO_PASSWORD =
    process.env.MANTENIMIENTO_PASSWORD;


/* =========================================================
   CONFIGURACIÓN EXPRESS
========================================================= */

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public"),
        {
            maxAge: "1h"
        }
    )
);


/* =========================================================
   FUNCIÓN AUXILIAR
   Convierte valores de Airtable a texto seguro
========================================================= */

function valorTexto(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {
        return "";
    }

    if (Array.isArray(valor)) {
        return valor.join(", ");
    }

    return String(valor);
}


/* =========================================================
   OBTENER EQUIPO
========================================================= */

app.get("/api/equipo/:id", async (req, res) => {

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
            error: "No se pudo obtener el equipo",
            detalle: error.message
        });

    }

});


/* =========================================================
   ACCESORIOS DEL EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;


            /* -----------------------------------------
               Primero obtenemos los IDs relacionados
            ----------------------------------------- */

            const equipo =
                await base(TABLA_EQUIPOS)
                    .find(equipoId);


            const ids =
                equipo.fields["Accesorios Médicos"] || [];


            if (
                !Array.isArray(ids) ||
                ids.length === 0
            ) {

                return res.json([]);

            }


            /* -----------------------------------------
               UNA SOLA CONSULTA A AIRTABLE
            ----------------------------------------- */

            const registros =
                await base(TABLA_ACCESORIOS)
                    .select({
                        maxRecords: 1000
                    })
                    .all();


            const idsSet =
                new Set(ids);


            const accesorios =
                registros
                    .filter(record =>
                        idsSet.has(record.id)
                    )
                    .map(record => {

                        const f =
                            record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["Nombre del accesorio"] || "",

                            numeroActivo:
                                f["Numero de activo fijo"] || "",

                            serie:
                                f["número de serie"] || "",

                            modelo:
                                f["Modelo"] || "",

                            estado:
                                f["estado del accesorio"] || "",

                            color:
                                f["color"] || "",

                            activo:
                                f["activo"] || "",

                            observaciones:
                                f["Observaciones"] || "",

                            fotografia:
                                f["Fotografia"] || []

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


/* =========================================================
   REPUESTOS DEL EQUIPO
========================================================= */

app.get(
    "/api/equipo/:id/repuestos",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;


            /* -----------------------------------------
               OBTENER IDS DE REPUESTOS
            ----------------------------------------- */

            const equipo =
                await base(TABLA_EQUIPOS)
                    .find(equipoId);


            const ids =
                equipo.fields["Repuestos Médicos"] || [];


            if (
                !Array.isArray(ids) ||
                ids.length === 0
            ) {

                return res.json([]);

            }


            /* -----------------------------------------
               UNA SOLA CONSULTA A AIRTABLE
            ----------------------------------------- */

            const registros =
                await base(TABLA_REPUESTOS)
                    .select({
                        maxRecords: 1000
                    })
                    .all();


            const idsSet =
                new Set(ids);


            const repuestos =
                registros
                    .filter(record =>
                        idsSet.has(record.id)
                    )
                    .map(record => {

                        const f =
                            record.fields;

                        return {

                            id: record.id,

                            nombre:
                                f["Nombre del repuesto"] || "",

                            estado:
                                f["estado del repuesto"] || "",

                            lugar:
                                f["Lugar donde se encuentra"] || "",

                            observaciones:
                                f["Observaciones"] || "",

                            numeroActivo:
                                f["Numero de activo fijo"] || "",

                            serie:
                                f["número de serie"] || "",

                            color:
                                f["color"] || "",

                            modelo:
                                f["Modelo"] || "",

                            compatibilidad:
                                f["Tipo de compatibilidad"] || "",

                            fotografia:
                                f["Fotografía"] || [],

                            cantidad:
                                f["Cantidad Repuestos/Accesorios"] || []

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


/* =========================================================
   FICHA DE ACCESORIO
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

                id: record.id,

                nombre:
                    f["Nombre del accesorio"] || "",

                numeroActivo:
                    f["Numero de activo fijo"] || "",

                serie:
                    f["número de serie"] || "",

                modelo:
                    f["Modelo"] || "",

                estado:
                    f["estado del accesorio"] || "",

                color:
                    f["color"] || "",

                activo:
                    f["activo"] || "",

                observaciones:
                    f["Observaciones"] || "",

                fotografia:
                    f["Fotografia"] || []

            });


        } catch (error) {

            console.error(
                "Error accesorio:",
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


/* =========================================================
   FICHA DE REPUESTO
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

                id: record.id,

                nombre:
                    f["Nombre del repuesto"] || "",

                estado:
                    f["estado del repuesto"] || "",

                lugar:
                    f["Lugar donde se encuentra"] || "",

                observaciones:
                    f["Observaciones"] || "",

                numeroActivo:
                    f["Numero de activo fijo"] || "",

                serie:
                    f["número de serie"] || "",

                color:
                    f["color"] || "",

                modelo:
                    f["Modelo"] || "",

                compatibilidad:
                    f["Tipo de compatibilidad"] || "",

                fotografia:
                    f["Fotografía"] || [],

                cantidad:
                    f["Cantidad Repuestos/Accesorios"] || []

            });


        } catch (error) {

            console.error(
                "Error repuesto:",
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


/* =========================================================
   HISTORIAL DE MANTENIMIENTO
========================================================= */

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const equipoId =
                req.params.id;


            /* -----------------------------------------
               CONSULTA ÚNICA
            ----------------------------------------- */

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

                        return
                            Array.isArray(relacionados) &&
                            relacionados.includes(equipoId);

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

                            fecha:
                                f[
                                    "Fecha de mantenimiento realizado"
                                ] || "",

                            tipo:
                                f[
                                    "Tipo de mantenimiento"
                                ] || "",

                            tecnico:
                                f[
                                    "Técnico responsable"
                                ] || "",

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


            /* -----------------------------------------
               ORDENAR DEL MÁS RECIENTE AL MÁS ANTIGUO
            ----------------------------------------- */

            mantenimientos.sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );


            res.json(mantenimientos);


        } catch (error) {

            console.error(
                "Error obteniendo historial:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el historial",

                detalle:
                    error.message

            });

        }

    }
);


/* =========================================================
   REGISTRAR MANTENIMIENTO
========================================================= */

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


            /* -----------------------------------------
               VALIDAR CONTRASEÑA
            ----------------------------------------- */

            if (
                !MANTENIMIENTO_PASSWORD ||
                password !== MANTENIMIENTO_PASSWORD
            ) {

                return res.status(401).json({

                    error:
                        "Contraseña incorrecta"

                });

            }


            /* -----------------------------------------
               VALIDAR CAMPOS
            ----------------------------------------- */

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


            /* -----------------------------------------
               CAMPOS DE MANTENIMIENTO
            ----------------------------------------- */

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
                ] = numeroActivo;

            }


            /* -----------------------------------------
               ELIMINAR CAMPOS VACÍOS
            ----------------------------------------- */

            Object.keys(campos).forEach(
                key => {

                    if (
                        campos[key] === undefined
                    ) {

                        delete campos[key];

                    }

                }
            );


            /* -----------------------------------------
               CREAR REGISTRO
            ----------------------------------------- */

            const nuevoMantenimiento =
                await base(TABLA_MANTENIMIENTO)
                    .create(campos);


            /* -----------------------------------------
               ACTUALIZAR EQUIPO
            ----------------------------------------- */

            const camposEquipo = {

                "Fecha de ultimo mantenimiento":
                    fechaMantenimiento

            };


            if (fechaProximoMantenimiento) {

                camposEquipo[
                    "Fecha de próximo mantenimiento"
                ] =
                    fechaProximoMantenimiento;

            }


            await base(TABLA_EQUIPOS)
                .update(
                    equipoId,
                    camposEquipo
                );


            /* -----------------------------------------
               RESPUESTA
            ----------------------------------------- */

            res.json({

                success: true,

                mensaje:
                    "Mantenimiento registrado correctamente",

                mantenimientoId:
                    nuevoMantenimiento.id

            });


        } catch (error) {

            console.error(
                "ERROR REGISTRANDO MANTENIMIENTO:",
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


/* =========================================================
   SERVIDOR
========================================================= */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "       SISTEMA BIOMÉDICO"
        );

        console.log(
            "=========================================="
        );

        console.log("");

        console.log(
            `Servidor: http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "Tablas conectadas:"
        );

        console.log(
            "- Equipos Médicos"
        );

        console.log(
            "- Accesorios Médicos"
        );

        console.log(
            "- Repuestos Médicos"
        );

        console.log(
            "- Mantenimiento"
        );

        console.log("");

        console.log(
            "Optimización:"
        );

        console.log(
            "- Equipo: consulta directa"
        );

        console.log(
            "- Accesorios: consulta agrupada"
        );

        console.log(
            "- Repuestos: consulta agrupada"
        );

        console.log(
            "- Mantenimiento: consulta agrupada"
        );

        console.log("");

        console.log(
            "SERVIDOR ACTIVO..."
        );

        console.log(
            "NO CIERRES ESTA VENTANA"
        );

        console.log("");

    }
);
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

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {

    console.error(
        "Faltan variables de entorno de Airtable."
    );

    process.exit(1);
}

Airtable.configure({
    apiKey: AIRTABLE_TOKEN
});

const base =
    Airtable.base(
        AIRTABLE_BASE_ID
    );

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


/*
 * =====================================================
 * OBTENER EQUIPO
 * =====================================================
 */

app.get(
    "/api/equipo/:id",
    async (req, res) => {

        try {

            const record =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const f =
                record.fields;

            console.log(
                "Campos del equipo:",
                Object.keys(f)
            );

            const videos = [];

            for (let i = 1; i <= 4; i++) {

                const titulo =
                    f[`Título del video ${i}`];

                const url =
                    f[`URL del video ${i}`];

                if (titulo || url) {

                    videos.push({

                        titulo:
                            titulo || "",

                        url:
                            url || ""

                    });

                }

            }

            let urlManuales =
                f["Manuales"] || "";

            console.log(
                "URL manual encontrada:",
                urlManuales
            );

            res.json({

                id:
                    record.id,

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

                urlManuales:
                    urlManuales,

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


/*
 * =====================================================
 * ACCESORIOS DE UN EQUIPO
 * =====================================================
 */

app.get(
    "/api/equipo/:id/accesorios",
    async (req, res) => {

        try {

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const idsAccesorios =
                equipoRecord.fields[
                    "Accesorios Médicos"
                ] || [];

            const accesorios =
                [];

            for (
                const accesorioId
                of idsAccesorios
            ) {

                try {

                    const record =
                        await base(
                            TABLA_ACCESORIOS
                        ).find(
                            accesorioId
                        );

                    const f =
                        record.fields;

                    accesorios.push({

                        id:
                            record.id,

                        nombre:
                            f["Nombre del accesorio"] || "",

                        activoFijo:
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
                            f["Fotografia"] ||
                            f["Fotografía"] ||
                            [],

                        equipoRelacionado:
                            f[
                                "Equipo Médico relacionado"
                            ] || [],

                        cantidadAccesorios:
                            f[
                                "Cantidad Accesorios"
                            ] ||
                            f[
                                "Cantidad Repuestos/Accesorios"
                            ] ||
                            ""

                    });

                } catch (error) {

                    console.error(
                        "Error con accesorio:",
                        accesorioId,
                        error
                    );

                }

            }

            res.json(
                accesorios
            );

        } catch (error) {

            console.error(
                "Error al obtener accesorios:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener los accesorios."

            });

        }

    }
);


/*
 * =====================================================
 * ACCESORIO INDIVIDUAL
 * =====================================================
 */

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

                id:
                    record.id,

                nombre:
                    f["Nombre del accesorio"] || "",

                activoFijo:
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
                    f["Fotografia"] ||
                    f["Fotografía"] ||
                    [],

                equipoRelacionado:
                    f[
                        "Equipo Médico relacionado"
                    ] || [],

                cantidadAccesorios:
                    f[
                        "Cantidad Accesorios"
                    ] ||
                    f[
                        "Cantidad Repuestos/Accesorios"
                    ] ||
                    ""

            });

        } catch (error) {

            console.error(
                "Error al obtener accesorio:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el accesorio."

            });

        }

    }
);


/*
 * =====================================================
 * REPUESTOS DE UN EQUIPO
 * =====================================================
 */

app.get(
    "/api/equipo/:id/repuestos",
    async (req, res) => {

        try {

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const idsRepuestos =
                equipoRecord.fields[
                    "Repuestos Médicos"
                ] || [];

            const repuestos =
                [];

            for (
                const repuestoId
                of idsRepuestos
            ) {

                try {

                    const record =
                        await base(
                            TABLA_REPUESTOS
                        ).find(
                            repuestoId
                        );

                    const f =
                        record.fields;

                    repuestos.push({

                        id:
                            record.id,

                        nombre:
                            f["Nombre del repuesto"] || "",

                        activoFijo:
                            f["Numero de activo fijo"] || "",

                        serie:
                            f["número de serie"] || "",

                        modelo:
                            f["Modelo"] || "",

                        estado:
                            f["estado del repuesto"] || "",

                        lugar:
                            f["Lugar donde se encuentra"] || "",

                        color:
                            f["color"] || "",

                        observaciones:
                            f["Observaciones"] || "",

                        compatibilidad:
                            f["Tipo de compatibilidad"] || "",

                        fotografia:
                            f["Fotografía"] ||
                            f["Fotografia"] ||
                            [],

                        equipoRelacionado:
                            f[
                                "Equipo Médico relacionado"
                            ] || [],

                        cantidadRepuestos:
                            f[
                                "Cantidad Repuestos/Accesorios"
                            ] || ""

                    });

                } catch (error) {

                    console.error(
                        "Error con repuesto:",
                        repuestoId,
                        error
                    );

                }

            }

            res.json(
                repuestos
            );

        } catch (error) {

            console.error(
                "Error al obtener repuestos:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener los repuestos."

            });

        }

    }
);


/*
 * =====================================================
 * REPUESTO INDIVIDUAL
 * =====================================================
 */

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

                id:
                    record.id,

                nombre:
                    f["Nombre del repuesto"] || "",

                activoFijo:
                    f["Numero de activo fijo"] || "",

                serie:
                    f["número de serie"] || "",

                modelo:
                    f["Modelo"] || "",

                estado:
                    f["estado del repuesto"] || "",

                lugar:
                    f["Lugar donde se encuentra"] || "",

                color:
                    f["color"] || "",

                observaciones:
                    f["Observaciones"] || "",

                compatibilidad:
                    f["Tipo de compatibilidad"] || "",

                fotografia:
                    f["Fotografía"] ||
                    f["Fotografia"] ||
                    [],

                equipoRelacionado:
                    f[
                        "Equipo Médico relacionado"
                    ] || [],

                cantidadRepuestos:
                    f[
                        "Cantidad Repuestos/Accesorios"
                    ] || ""

            });

        } catch (error) {

            console.error(
                "Error al obtener repuesto:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el repuesto."

            });

        }

    }
);


/*
 * =====================================================
 * MANTENIMIENTOS DE UN EQUIPO
 * =====================================================
 */

app.get(
    "/api/equipo/:id/mantenimientos",
    async (req, res) => {

        try {

            const equipoRecord =
                await base(TABLA_EQUIPOS)
                    .find(req.params.id);

            const numeroActivo =
                equipoRecord.fields[
                    "Numero de activo fijo"
                ] ||
                equipoRecord.fields[
                    "Número de activo fijo"
                ] ||
                "";

            const records =
                await base(TABLA_MANTENIMIENTOS)
                    .select({

                        filterByFormula:
                            `AND({Número de activo fijo}="${numeroActivo}")`,

                        sort: [
                            {
                                field:
                                    "Fecha de mantenimiento realizado",

                                direction:
                                    "desc"
                            }
                        ]

                    })
                    .all();

            const mantenimientos =
                records.map(
                    record => {

                        const f =
                            record.fields;

                        return {

                            id:
                                record.id,

                            idMantenimiento:
                                f[
                                    "ID Mantenimiento por Equipo"
                                ] || "",

                            equipoRelacionado:
                                f[
                                    "Equipo relacionado"
                                ] || [],

                            numeroActivo:
                                f[
                                    "Número de activo fijo"
                                ] || "",

                            fechaMantenimiento:
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

                            fechaProximo:
                                f[
                                    "Fecha de próximo mantenimiento"
                                ] || ""

                        };

                    }
                );

            res.json(
                mantenimientos
            );

        } catch (error) {

            console.error(
                "Error al obtener mantenimientos:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener los mantenimientos."

            });

        }

    }
);


/*
 * =====================================================
 * MANTENIMIENTO INDIVIDUAL
 * =====================================================
 */

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

            const f =
                record.fields;

            res.json({

                id:
                    record.id,

                idMantenimiento:
                    f[
                        "ID Mantenimiento por Equipo"
                    ] || "",

                equipoRelacionado:
                    f[
                        "Equipo relacionado"
                    ] || [],

                numeroActivo:
                    f[
                        "Número de activo fijo"
                    ] || "",

                fechaMantenimiento:
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

                fechaProximo:
                    f[
                        "Fecha de próximo mantenimiento"
                    ] || ""

            });

        } catch (error) {

            console.error(
                "Error al obtener mantenimiento:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener el mantenimiento."

            });

        }

    }
);


/*
 * =====================================================
 * CREAR MANTENIMIENTO
 * =====================================================
 */

app.post(
    "/api/mantenimiento",
    async (req, res) => {

        try {

            const datos =
                req.body;

            const numeroActivo =
                datos.numeroActivo || "";

            const record =
                await base(
                    TABLA_MANTENIMIENTOS
                ).create({

                    "Equipo relacionado":
                        datos.equipoRelacionado || [],

                    "Número de activo fijo":
                        numeroActivo,

                    "Fecha de mantenimiento realizado":
                        datos.fechaMantenimiento || "",

                    "Tipo de mantenimiento":
                        datos.tipo || "",

                    "Técnico responsable":
                        datos.tecnico || "",

                    "Estado del mantenimiento":
                        datos.estado || "",

                    "Actividades realizadas":
                        datos.actividades || "",

                    "Hallazgos":
                        datos.hallazgos || "",

                    "Refacciones utilizadas":
                        datos.refacciones || "",

                    "Observaciones":
                        datos.observaciones || "",

                    "Fecha de próximo mantenimiento":
                        datos.fechaProximo || ""

                });

            if (
                numeroActivo &&
                datos.fechaMantenimiento
            ) {

                const equipos =
                    await base(
                        TABLA_EQUIPOS
                    )
                        .select({

                            filterByFormula:
                                `OR({Número de activo fijo}="${numeroActivo}",{Numero de activo fijo}="${numeroActivo}")`

                        })
                        .all();

                if (
                    equipos.length > 0
                ) {

                    const equipo =
                        equipos[0];

                    await base(
                        TABLA_EQUIPOS
                    ).update(
                        equipo.id,
                        {

                            "Fecha de ultimo mantenimiento":
                                datos.fechaMantenimiento,

                            "Fecha de próximo mantenimiento":
                                datos.fechaProximo || ""

                        }
                    );

                }

            }

            res.json({

                success:
                    true,

                id:
                    record.id

            });

        } catch (error) {

            console.error(
                "Error al crear mantenimiento:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo crear el mantenimiento."

            });

        }

    }
);


/*
 * =====================================================
 * GENERAR NÚMERO DE FALLA
 * =====================================================
 */

async function generarNumeroFalla(
    numeroActivo
) {

    const records =
        await base(
            TABLA_FALLAS
        )
            .select({

                filterByFormula:
                    `AND({Número de activo fijo}="${numeroActivo}")`

            })
            .all();

    return records.length + 1;

}


/*
 * =====================================================
 * REPORTAR FALLA / ALARMA
 * =====================================================
 */

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


app.post(
    "/api/falla",
    upload.single(
        "fotografia"
    ),
    async (req, res) => {

        try {

            const datos =
                req.body;

            const numeroActivo =
                datos.numeroActivo || "";

            const numeroFalla =
                await generarNumeroFalla(
                    numeroActivo
                );

            const fallaRecord =
                await base(
                    TABLA_FALLAS
                ).create({

                    "Número de falla":
                        numeroFalla,

                    "Equipo relacionado":
                        datos.equipoRelacionado
                            ? datos.equipoRelacionado.split(",")
                            : [],

                    "Nombre del equipo relacionado":
                        datos.nombreEquipo || "",

                    "Número de activo fijo":
                        numeroActivo,

                    "Fecha y hora del reporte":
                        datos.fechaHora || "",

                    "Tipo":
                        datos.tipo || "",

                    "Descripción":
                        datos.descripcion || "",

                    "Estado":
                        datos.estado || "Pendiente"

                });


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

            }

            res.json({

                success:
                    true,

                id:
                    fallaRecord.id,

                numeroFalla

            });

        } catch (error) {

            console.error(
                "Error al reportar falla:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo reportar la falla."

            });

        }

    }
);


/*
 * =====================================================
 * FALLAS DE UN EQUIPO
 * =====================================================
 */

app.get(
    "/api/equipo/:id/fallas",
    async (req, res) => {

        try {

            const equipoRecord =
                await base(
                    TABLA_EQUIPOS
                )
                    .find(
                        req.params.id
                    );

            const numeroActivo =
                equipoRecord.fields[
                    "Numero de activo fijo"
                ] ||
                equipoRecord.fields[
                    "Número de activo fijo"
                ] ||
                "";

            const records =
                await base(
                    TABLA_FALLAS
                )
                    .select({

                        filterByFormula:
                            `AND({Número de activo fijo}="${numeroActivo}")`

                    })
                    .all();

            const fallas =
                records.map(
                    record => {

                        const f =
                            record.fields;

                        return {

                            id:
                                record.id,

                            numeroFalla:
                                f[
                                    "Número de falla"
                                ] || "",

                            equipoRelacionado:
                                f[
                                    "Equipo relacionado"
                                ] || [],

                            nombreEquipo:
                                f[
                                    "Nombre del equipo relacionado"
                                ] || "",

                            numeroActivo:
                                f[
                                    "Número de activo fijo"
                                ] || "",

                            fechaHora:
                                f[
                                    "Fecha y hora del reporte"
                                ] || "",

                            tipo:
                                f[
                                    "Tipo"
                                ] || "",

                            descripcion:
                                f[
                                    "Descripción"
                                ] || "",

                            estado:
                                f[
                                    "Estado"
                                ] || "",

                            fotografia:
                                f[
                                    "Fotografía del error"
                                ] || []

                        };

                    }
                );

            res.json(
                fallas
            );

        } catch (error) {

            console.error(
                "Error al obtener fallas:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron obtener las fallas."

            });

        }

    }
);


/*
 * =====================================================
 * FALLA INDIVIDUAL
 * =====================================================
 */

app.get(
    "/api/falla/:id",
    async (req, res) => {

        try {

            const record =
                await base(
                    TABLA_FALLAS
                )
                    .find(
                        req.params.id
                    );

            const f =
                record.fields;

            res.json({

                id:
                    record.id,

                numeroFalla:
                    f[
                        "Número de falla"
                    ] || "",

                equipoRelacionado:
                    f[
                        "Equipo relacionado"
                    ] || [],

                nombreEquipo:
                    f[
                        "Nombre del equipo relacionado"
                    ] || "",

                numeroActivo:
                    f[
                        "Número de activo fijo"
                    ] || "",

                fechaHora:
                    f[
                        "Fecha y hora del reporte"
                    ] || "",

                tipo:
                    f[
                        "Tipo"
                    ] || "",

                descripcion:
                    f[
                        "Descripción"
                    ] || "",

                estado:
                    f[
                        "Estado"
                    ] || "",

                fotografia:
                    f[
                        "Fotografía del error"
                    ] || []

            });

        } catch (error) {

            console.error(
                "Error al obtener falla:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo obtener la falla."

            });

        }

    }
);


/*
 * =====================================================
 * SERVIDOR
 * =====================================================
 */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor ejecutándose en puerto ${PORT}`
        );

    }
);
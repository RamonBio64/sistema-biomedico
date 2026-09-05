const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE;

/* ================================
   SERVIR LA INTERFAZ
================================ */

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

/* ================================
   CONSULTAR EQUIPO EN AIRTABLE
================================ */

app.get("/api/equipo/:id", async (req, res) => {

    try {

        const equipoId = req.params.id;

        console.log("");
        console.log("Consultando equipo:", equipoId);

        const url =
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${equipoId}`;

        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            console.error("Error de Airtable:", datos);

            return res.status(respuesta.status).json({
                correcto: false,
                error: datos
            });
        }

        console.log(
            "Equipo encontrado:",
            datos.fields?.["nombre del equipo"]
        );

        res.json({
            correcto: true,
            equipo: datos
        });

    } catch (error) {

        console.error("Error del servidor:", error);

        res.status(500).json({
            correcto: false,
            error: error.message
        });
    }

});

/* ================================
   INICIAR SERVIDOR
================================ */

app.listen(PORT, () => {

    console.log("");
    console.log("==========================================");
    console.log("       SISTEMA BIOMÉDICO");
    console.log("==========================================");
    console.log("");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("");

});
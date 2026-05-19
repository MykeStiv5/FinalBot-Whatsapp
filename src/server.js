const express = require("express");
const path = require("path");

const app = express();

const { generarRSS } = require("./services/rssGenerator");

app.use(express.json());

/* ENVÍO MANUAL WHATSAPP */
app.post("/api/send", (req, res) => {

    try {

        const { number, text } = req.body;

        const { BrowserWindow } = require("electron");

        const win = BrowserWindow.getAllWindows()[0];

        if (!win) {
            return res.status(500).json({
                success: false,
                error: "Ventana Electron no encontrada"
            });
        }

        win.webContents.send(
            "manual-send",
            {
                number,
                message: text
            }
        );

        res.json({
            success: true
        });

    } catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            error: err.message
        });

    }

});


/* GENERAR Y SERVIR RSS */
app.get("/rss", async(req,res)=>{

    try{

        await generarRSS();

        res.sendFile(
            path.join(
                __dirname,
                "data",
                "feed.xml"
            )
        );

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            error:err.message
        });

    }

});


/* RUTA DE PRUEBA */
app.get("/", (req,res)=>{

    res.json({
        status:"Servidor activo",
        rss:"http://localhost:3000/rss"
    });

});


app.listen(3000, ()=>{

    console.log(
        "Servidor iniciado en puerto 3000"
    );

});
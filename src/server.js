const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/send", (req, res) => {
  const { number, text } = req.body;

  const { BrowserWindow } = require("electron");
  const win = BrowserWindow.getAllWindows()[0];

  win.webContents.send("manual-send", { number, message: text });

  res.json({ success: true });
});

app.listen(3000, () => console.log("Servidor iniciado"));
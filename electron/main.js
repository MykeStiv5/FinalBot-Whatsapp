const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {
  connectWhatsApp,
  sendMessage
} = require("../src/whatsapp");

const {
  startScraper
} = require("../src/services/scraperEngine");

let mainWindow = null;
let botStarted = false;

/*

CREAR VENTANA

*/
function createWindow() {

  mainWindow = new BrowserWindow({

    width: 1400,
    height: 900,

    webPreferences: {

      preload: path.join(__dirname, "preload.js"),

      contextIsolation: true,

      nodeIntegration: false
    }
  });

  /*
  ========================
  CARGAR HTML
  ========================
  */
  mainWindow.loadFile(
    path.join(__dirname, "../ui/index.html")
  );
}

/*
========================
INICIAR BOT
========================
*/
ipcMain.handle("start-bot", async () => {

  try {

    /*
    ========================
    WHATSAPP
    ========================
    */
    if (!botStarted) {

      await connectWhatsApp(mainWindow);

      botStarted = true;
    }

    /*
    ========================
    SCRAPER
    ========================
    */
    startScraper(mainWindow);

    /*
    ========================
    LOG
    ========================
    */
    mainWindow.webContents.send(
      "bot-log",
      "🚀 Bot iniciado correctamente"
    );

    return {
      success: true
    };

  } catch (err) {

    console.log(err);

    return {
      success: false,
      error: err.message
    };
  }
});

/*
========================
ENVÍO MANUAL
========================
*/
ipcMain.handle("send-message", async (_, data) => {

  try {

    const { number, text, imagePath } = data;

    /*
    ========================
    VALIDAR
    ========================
    */
    if (!number || !text) {

      return {
        success: false,
        error: "Datos incompletos"
      };
    }

    /*
    ========================
    ENVIAR
    ========================
    */
   const result = await sendMessage(
    number,
    text,
    imagePath
    );

    /*
    ========================
    LOG UI
    ========================
    */
    mainWindow.webContents.send(
      "bot-log",
      result.success
        ? "📩 Mensaje manual enviado"
        : "❌ Error envío manual"
    );

    return result;

  } catch (err) {

    console.log(err);

    return {
      success: false,
      error: err.message
    };
  }
});

/*
========================
READY
========================
*/
app.whenReady().then(createWindow);

/*
========================
CERRAR
========================
*/
app.on("window-all-closed", () => {

  if (process.platform !== "darwin") {

    app.quit();
  }
});

/*
========================
MAC
========================
*/
app.on("activate", () => {

  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();
  }
});
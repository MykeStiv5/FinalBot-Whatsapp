const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

  /*INICIAR BOT*/
  startBot: () =>
    ipcRenderer.invoke("start-bot"),

  /*ENVIAR MENSAJE*/
  sendMessage: (data) =>
    ipcRenderer.invoke("send-message", data),
    getFilePath: (file) =>
    file.path,

  /*QR*/
  onQRCode: (callback) =>
    ipcRenderer.on("qr-code", (_, data) => callback(data)),

  /*STATUS*/
  onStatus: (callback) =>
    ipcRenderer.on("bot-status", (_, data) => callback(data)),

  /*LOGS*/
  onLog: (callback) =>
    ipcRenderer.on("bot-log", (_, data) => callback(data))
});
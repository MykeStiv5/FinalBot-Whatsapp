const {
Client,
LocalAuth,
MessageMedia
} = require("whatsapp-web.js");

const qrcode = require("qrcode");
const path = require("path");

let client = null;
let isReady = false;

 /*
 CONECTAR WHATSAPP

*/
async function connectWhatsApp(mainWindow) {

return new Promise((resolve, reject) => {

console.log("🟡 Inicializando WhatsApp...");

client = new Client({

authStrategy: new LocalAuth({
dataPath: path.join(__dirname, "../../session")
}),

puppeteer: {

headless: false,

executablePath: undefined,

args: [
"--no-sandbox",
"--disable-setuid-sandbox",
"--disable-dev-shm-usage",
"--disable-accelerated-2d-canvas",
"--disable-gpu"
]
}
});

 /*

QR

*/
client.on("qr", async (qr) => {

console.log("📲 QR generado");

const qrBase64 =
await qrcode.toDataURL(qr);

mainWindow.webContents.send(
"qr-code",
qrBase64
);

mainWindow.webContents.send(
"bot-status",
"Escanea el QR"
);
});

/*

READY

*/
client.on("ready", async () => {

console.log("🟢 WhatsApp conectado");

isReady = true;

mainWindow.webContents.send(
"bot-status",
"WhatsApp conectado"
);

mainWindow.webContents.send(
"bot-log",
"✅ Bot listo"
);

resolve(true);
});

/*

AUTH FAIL

*/
client.on("auth_failure", (msg) => {

console.log("❌ AUTH FAIL:", msg);

isReady = false;

reject(new Error(msg));
});

/*

# DISCONNECTED

*/
client.on("disconnected", (reason) => {

console.log("❌ DESCONECTADO:", reason);

isReady = false;

mainWindow.webContents.send(
"bot-log",
"❌ WhatsApp desconectado"
);
});

/*

# LOADING

*/
client.on("loading_screen", (percent, message) => {

console.log(percent, message);

mainWindow.webContents.send(
"bot-log",
`⏳ ${message} ${percent}%`
);
});

client.initialize();
});
}

/*

 ENVIAR MENSAJE

*/
async function sendMessage(
number,
text,
imagePath = null
) {

try {

if (!client || !isReady) {

return {
success: false,
error: "WhatsApp no está listo"
};
}
 /*

 DETECTAR GRUPO

*/
let chatId = number;

if (!number.includes("@g.us")) {

let clean = number
.toString()
.replace(/\D/g, "");

if (!clean.startsWith("57")) {
clean = "57" + clean;
}

chatId = `${clean}@c.us`;
}

console.log("📤 ENVIANDO:", chatId);

 /*

IMAGEN

*/
if (imagePath) {

const media =
MessageMedia.fromFilePath(
imagePath
);

await client.sendMessage(
chatId,
media,
{
caption: text
}
);

} else {

await client.sendMessage(
chatId,
text
);
}

return {
success: true
};

} catch (err) {

console.log(
"💥 SEND ERROR:",
err.message
);

return {
success: false,
error: err.message
};
}
}

module.exports = {
connectWhatsApp,
sendMessage
};

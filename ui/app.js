window.addEventListener("DOMContentLoaded", () => {

const refreshBtn =
document.getElementById("refreshBtn");

const qrImage =
document.getElementById("qrImage");

const qrMessage =
document.getElementById("qrMessage");

const statusText =
document.getElementById("statusText");

const processStatus =
document.getElementById("processStatus");

const whatsappState =
document.getElementById("whatsappState");

const rssStatus =
document.getElementById("rssStatus");

const sendStatus =
document.getElementById("sendStatus");

const activityList =
document.getElementById("activityList");

const manualForm =
document.getElementById("manualForm");

const lastDate =
document.getElementById("lastDate");

const lastTime =
document.getElementById("lastTime");

/*ACTIVIDAD*/
function addActivity(text) {

const item =
document.createElement("div");

item.className =
"activity-item";

const now =
new Date();

item.innerHTML = `

<div style="display:flex;align-items:center;gap:12px;">
<i class="fa-solid fa-circle-info"></i>
<p>${text}</p>
</div>

<span>
${now.toLocaleTimeString()}
</span>
`;

activityList.prepend(item);

lastDate.innerHTML =
now.toLocaleDateString();

lastTime.innerHTML =
now.toLocaleTimeString();
}

/*INICIO DEL BOT*/
refreshBtn.addEventListener(
"click",
async () => {

processStatus.innerHTML =
"Inicializando...";

addActivity(
"🚀 Iniciando bot..."/*se verifica en actividad reciente o en la consola*/
);

const result =
await window.electronAPI.startBot();

if (result.success) {

addActivity(
"✅ Bot iniciado"
);

} else {

addActivity(
"❌ " + result.error
);
}
}
);

/*QR*/
window.electronAPI.onQRCode(
(qr) => {

qrImage.src = qr;

qrImage.style.display =
"block";

qrMessage.innerHTML =
"Escanea el QR";

whatsappState.innerHTML =
"Esperando autenticación";

addActivity(
"QR generado"
);
}
);

/*STATUS*/
window.electronAPI.onStatus(
(status) => {

statusText.innerHTML =
status;

processStatus.innerHTML =
status;

whatsappState.innerHTML =
status;

if (
status.toLowerCase()
.includes("conectado")
) {

qrImage.style.display =
"none";

qrMessage.innerHTML =
"WhatsApp conectado";

sendStatus.innerHTML =
"Sistema listo";
}

addActivity(status);
}
);

/*LOGS*/
window.electronAPI.onLog(
(log) => {

addActivity(log);

if (
log.includes("RSS")
) {

rssStatus.innerHTML =
log;
}

if (
log.includes("enviado")
) {

sendStatus.innerHTML =
"Mensaje enviado";
}

if (
log.toLowerCase()
.includes("error")
) {

sendStatus.innerHTML =
"Error envío";
}
}
);

/*previsualizacion de la imagen*/
const imageInput =
document.getElementById(
"imageInput"
);

const previewImage =
document.getElementById(
"previewImage"
);

if (imageInput) {

imageInput.addEventListener(
"change",
(e) => {

const file =
e.target.files[0];

if (!file) return;

const reader =
new FileReader();

reader.onload =
(event) => {

previewImage.src =
event.target.result;

previewImage.style.display =
"block";
};

reader.readAsDataURL(file);
}
);
}
/*envio manual validaciones desde el main de electron con logs en la UI*/
manualForm.addEventListener(
"submit",
async (e) => {

e.preventDefault();

const title =
document.getElementById("title").value;

const link =
document.getElementById("link").value;

const description =
document.getElementById("description").value;

/* imagen no se guarda en el historial de mensajes enviados, 
por lo que no se valida duplicados en este caso, se asume 
que es para envios puntuales y no masivos*/
const image =
imageInput.files[0];

let imagePath = null;

if (image) {

imagePath =
window.electronAPI.getFilePath(
image
);
}
console.log(image);
sendStatus.innerHTML =
"Enviando...";

const result =
await window.electronAPI.sendMessage({

number:
"120363408686646018@g.us",

text:

`📰 ${title}

🔗 ${link}

📝 ${description}`,

imagePath:
imagePath
});

if (result.success) {

sendStatus.innerHTML =
"Mensaje enviado";

addActivity(
"✅ Mensaje manual enviado"
);

manualForm.reset();

/* ver imagen previa al envio, se limpia el src y se oculta la previsualizacion*/
previewImage.src = "";

previewImage.style.display =
"none";

} else {

sendStatus.innerHTML =
"Error envío";

addActivity(
"❌ " + result.error
);
}
}
);

/*TOGGLE ACTIVIDAD*/
const toggleBtn =
document.getElementById(
"toggleActivityBtn"
);

const activityCard =
document.getElementById(
"activityCard"
);

let opened = false;

if (toggleBtn) {

toggleBtn.addEventListener(
"click",
() => {

opened = !opened;

if (opened) {

  activityCard.style.display =
    "block";

} else {

  activityCard.style.display =
    "none";
}

toggleBtn.innerHTML = opened
? `
<i class="fa-solid fa-eye-slash"></i>
Ocultar actividad reciente
`
: `
<i class="fa-solid fa-clock-rotate-left"></i>
Mostrar actividad reciente
`;
}
);
}

/*INIT*/
addActivity(
"✅ Interfaz iniciada"
);

});
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

refreshBtn.addEventListener(
"click",
async () => {


  processStatus.innerHTML =
    "Inicializando...";

  addActivity(
    "🚀 Iniciando bot..."
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
    "📲 QR generado"
  );
}

);

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

  sendStatus.innerHTML =
    "Enviando...";

  const result =
    await window.electronAPI.sendMessage({

      number: "3118425404",

      text:

`📰 ${title}

🔗 ${link}

📝 ${description}`
});

  if (result.success) {

    sendStatus.innerHTML =
      "Mensaje enviado";

    addActivity(
      "✅ Mensaje manual enviado"
    );

    manualForm.reset();

  } else {

    sendStatus.innerHTML =
      "Error envío";

    addActivity(
      "❌ " + result.error
    );
  }
}

);

addActivity(
"✅ Interfaz iniciada"
);
});

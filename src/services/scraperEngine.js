const fs = require("fs");
const path = require("path");

const { getRSS } = require("./rssService");
const { sendMessage } = require("../whatsapp");

/*ARCHIVO STORAGE*/
const STORAGE_PATH = path.join(
  __dirname,
  "../../storage/sent.json"
);

/*LEER ENVIADOS*/
function getSentPosts() {

  try {

    if (!fs.existsSync(STORAGE_PATH)) {
      fs.writeFileSync(
        STORAGE_PATH,
        JSON.stringify([])
      );
    }

    const data =
      fs.readFileSync(STORAGE_PATH);

    return JSON.parse(data);

  } catch (err) {

    console.log("❌ Error leyendo sent.json");

    return [];
  }
}

/*GUARDAR ENVIADOS*/
function saveSentPosts(posts) {

  try {

    fs.writeFileSync(
      STORAGE_PATH,
      JSON.stringify(posts, null, 2)
    );

  } catch (err) {

    console.log("❌ Error guardando sent.json");
  }
}

/*SCRAPER RSS*/
function startScraper(mainWindow) {

  const RSS_URL =
    "https://rss.app/feeds/2bnwgukClF8bI3BT.xml";//tener en cuenta actualizaciones por si se cae 

  console.log(" Scraper iniciado");

  mainWindow.webContents.send(
    "bot-log",
    " Scraper RSS iniciado"
  );

  /*REVISAR RSS*/
  setInterval(async () => {

    try {

      const items = await getRSS(RSS_URL);

      if (!items || !items.length) {

        console.log("❌ RSS vacío");

        return;
      }

      const latest = items[0];

      /*LEER HISTORIAL*/
      let sentPosts = getSentPosts();

      /*validacion de mensjaes duplicados*/
      if (sentPosts.includes(latest.link)) {

        console.log("🟡 Publicación ya enviada");

        mainWindow.webContents.send(
          "bot-log",
          "🟡 Sin nuevas publicaciones"
        );

        return;
      }

      /* MENSAJE*/
      const message =

`📰 NUEVA PUBLICACIÓN

📌 ${latest.title}

🔗 ${latest.link}`;

      /*ENVIAR*/
      const result = await sendMessage(
        "120363408686646018@g.us",
        message
      );

      /*SI ENVÍA -> GUARDAR*/
      if (result.success) {

        console.log("✅ RSS enviado");

        mainWindow.webContents.send(
          "bot-log",
          "✅ Nueva publicación enviada"
        );

        /*
        GUARDAR LINK
        */
        sentPosts.unshift(latest.link);

        /*
        MANTENER SOLO 50
        */
        sentPosts = sentPosts.slice(0, 50);

        saveSentPosts(sentPosts);

      } else {

        console.log(result.error);

        mainWindow.webContents.send(
          "bot-log",
          "❌ Error enviando RSS"
        );
      }

    } catch (err) {

      console.log("💥 RSS ERROR:", err.message);

      mainWindow.webContents.send(
        "bot-log",
        "❌ RSS ERROR: " + err.message
      );
    }

  }, 30000);
}

module.exports = {
  startScraper
};
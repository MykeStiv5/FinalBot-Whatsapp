const RSS = require("rss");
const fs = require("fs");
const path = require("path");

async function generarRSS() {

    try {

        // Import dinámico para Puppeteer
        const puppeteer =
        await import("puppeteer");

        const browser =
        await puppeteer.default.launch({
            headless: true
        });

        const page =
        await browser.newPage();

        await page.goto(
    "https://www.titularizadora.com/es",
    {
        waitUntil: "domcontentloaded",
        timeout: 60000
    }
);

// esperar un poco para que cargue contenido dinámico
await new Promise(resolve =>
    setTimeout(resolve, 5000)
);

        const noticias =
        await page.evaluate(() => {

            let items = [];

            document
            .querySelectorAll("a")
            .forEach(el => {

                const titulo =
                el.innerText?.trim();

                const link =
                el.href;

                if (
                    titulo &&
                    titulo.length > 10 &&
                    link
                ) {

                    items.push({
                        titulo,
                        link
                    });

                }

            });

            return items;

        });

        await browser.close();

        const feed = new RSS({
            title: "Titularizadora RSS",
            description: "Feed automático",
            feed_url: "http://localhost:3000/rss",
            site_url: "https://www.titularizadora.com"
        });

        noticias.forEach(item => {

            feed.item({
                title: item.titulo,
                url: item.link,
                guid: item.link,
                date: new Date()
            });

        });

        const ruta = path.join(
            __dirname,
            "../data/feed.xml"
        );

        fs.mkdirSync(
            path.dirname(ruta),
            { recursive: true }
        );

        fs.writeFileSync(
            ruta,
            feed.xml()
        );

        console.log(
            `✅ RSS generado (${noticias.length})`
        );

    } catch(err){

        console.log(
            "ERROR RSS:",
            err.message
        );

    }

}

module.exports = {
    generarRSS
};
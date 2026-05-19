const fs = require("fs");
const path = require("path");

const Parser = require("rss-parser");
const parser = new Parser();

const { generarRSS } = require("./rssGenerator");
const { sendMessage } = require("../whatsapp");

const STORAGE_PATH = path.join(
    __dirname,
    "../../storage/sent.json"
);

const FEED_PATH = path.join(
    __dirname,
    "../data/feed.xml"
);

function getSentPosts(){

    try{

        if(!fs.existsSync(STORAGE_PATH)){

            fs.writeFileSync(
                STORAGE_PATH,
                JSON.stringify([])
            );

        }

        return JSON.parse(
            fs.readFileSync(
                STORAGE_PATH
            )
        );

    }catch{

        return [];
    }

}

function saveSentPosts(posts){

    fs.writeFileSync(
        STORAGE_PATH,
        JSON.stringify(
            posts,
            null,
            2
        )
    );

}

async function leerFeedLocal(){

    const xml=
    fs.readFileSync(
        FEED_PATH,
        "utf8"
    );

    return await parser.parseString(
        xml
    );

}

function startScraper(mainWindow){

    console.log(
        "🟢 Scraper iniciado"
    );

    setInterval(async()=>{

        try{

            await generarRSS();

            const feed=
            await leerFeedLocal();

            const items=
            feed.items || [];

            if(!items.length){

                console.log(
                    "❌ RSS vacío"
                );

                return;
            }

            const latest=
            items[0];

            let sentPosts=
            getSentPosts();

            if(
                sentPosts.includes(
                    latest.link
                )
            ){

                console.log(
                    "🟡 Ya enviado"
                );

                return;
            }

            const message=

`📰 NUEVA PUBLICACIÓN

📌 ${latest.title}

🔗 ${latest.link}`;

            const result=
            await sendMessage(
                "120363408686646018@g.us",
                message
            );

            if(result.success){

                sentPosts.unshift(
                    latest.link
                );

                sentPosts=
                sentPosts.slice(
                    0,
                    50
                );

                saveSentPosts(
                    sentPosts
                );

                console.log(
                    "✅ Enviado"
                );

            }

        }catch(err){

            console.log(
                "💥 ERROR:",
                err.message
            );

        }

    },30000);

}

module.exports={
    startScraper
};
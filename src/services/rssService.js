const Parser = require("rss-parser");

const parser = new Parser();

/* LEER RSS */
async function getRSS(url) {
  try {

    const feed = await parser.parseURL(url);

    return feed.items || [];

  } catch (err) {

    console.log("RSS ERROR:", err.message);

    return [];

  }
}

module.exports = {
  getRSS
};
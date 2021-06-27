const settings = require("./settings.json")
const Sharder = require('eris-sharder').Master;
const sharder = new Sharder(settings.token, "/sharder.js", {
  stats: true,
  debug: false,
  guildsPerShard: 250,
  name: "Suggestions",
  clientOptions: {
    defaultImageFormat: "png",
    defaultImageSize: 32,
    messageLimit: 500
  },
  clusterTimeout: 7
});
const arkdb = require('ark.db')
const db = new arkdb.Database('./arkdb.json')
const client = sharder.eris;

sharder.on('stats', async stats => db.set(`totalservers`, stats.guilds))

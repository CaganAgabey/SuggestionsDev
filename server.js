const settings = require("./settings.json")
const Sharder = require('eris-sharder').Master;
const fs = require('fs')
const sharder = new Sharder(settings.token, "/sharder.js", {
  stats: true,
  debug: false,
  guildsPerShard: 150,
  name: "Suggestions",
  clientOptions: {
    defaultImageFormat: "png",
    defaultImageSize: 32,
    messageLimit: 500
  },
  clusterTimeout: 5
});
const client = sharder.eris;

sharder.on('stats', async stats => {
  fs.writeFile('totalservers.txt', stats.guilds.toString(), async err => {
    if (err) console.error(err)
  })
})

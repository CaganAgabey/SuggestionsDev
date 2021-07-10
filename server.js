const { isMaster } = require('cluster');
const settings = require("./settings.json")
const Sharder = require('eris-fleet');
const fs = require('fs')
const path = require("path");
const sharder = new Sharder.Fleet( {
  token: 'Bot ' + settings.token,
  path: path.join(__dirname, "./sharder.js"),
  guildsPerShard: 150,
  clientOptions: {
    defaultImageFormat: "png",
    defaultImageSize: 32,
    messageLimit: 500
  }
});

if (isMaster) {
  sharder.on('stats', async stats => fs.writeFile('totalservers.txt', stats.guilds.toString(), async err => {
        if (err) console.error(err)
  }))
}

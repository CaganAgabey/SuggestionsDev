const settings = require("./settings.json")
const Sharder = require('eris-sharder').Master;
const sharder = new Sharder(settings.token, "/sharder.js", {
  stats: false,
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
const client = sharder.eris;

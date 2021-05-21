const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

if (message.author.id != "343412762522812419") return;

let dil = db.fetch(`dil_${message.guildID}`) || "english";

  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  db.delete('changelog')
  message.channel.createMessage('Successfully reseted.')
}

module.exports.help = {
  name: "resetchangelog",
  aliase: ["reset-change-log"],
  descriptionen: "Shows the bot's stats.",
  descriptiontr: "Botun istatistiklerini gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'owner'
}

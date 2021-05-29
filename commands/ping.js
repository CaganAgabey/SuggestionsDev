const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
    const db = client.db
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {
    let prefix = db.fetch(`prefix_${message.guildID}`) || "."
    message.channel.createMessage(`Calculating...`).then(async msg => {
        msg.edit(`**Bot ping:** \`${Math.round(msg.timestamp - message.timestamp)} ms\`\n**API ping:** \`${Math.round((msg.timestamp - message.timestamp) / 2 * 1.5)} ms\``)
    })
}

if (dil == "turkish") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  message.channel.createMessage(`Ölçülüyor...`).then(async msg => {
      msg.edit(`**Bot gecikmesi:** \`${Math.round(msg.timestamp - message.timestamp)} ms\`\n**API gecikmesi:** \`${Math.round((msg.timestamp - message.timestamp) / 2 * 1.5)} ms\``)
  })
}
}

module.exports.help = {
  name: "ping",
  nametr: "gecikme",
  aliase: ["gecikme"],
  descriptionen: "Shows ping.",
  descriptiontr: "Gecikmeyi gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'public'
}

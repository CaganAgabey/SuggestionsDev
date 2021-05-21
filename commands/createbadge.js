const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

if (message.author.id != "343412762522812419") return;

let dil = db.fetch(`dil_${message.guildID}`) || "english";

  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  let badgemoji = args[0]
  let thechangelog = args.slice(1).join(" ")
  if (!badgemoji) return message.channel.createMessage(`You must provide a badge name and badge emoji.`)
  if (!thechangelog) return message.channel.createMessage(`You must provide a badge name and badge emoji.`)
  let badgename = thechangelog.toLowerCase().split(' ').join('_').split('.').join('')
  db.set(`badges_${badgename}`, {emoji: badgemoji, users: [], text: thechangelog})
  message.channel.createMessage(`Successfully created a badge! Badge name: \`${badgename}\``)
}

module.exports.help = {
  name: "createbadge",
  aliase: [],
  descriptionen: "Shows the bot's stats.",
  descriptiontr: "Botun istatistiklerini gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'owner'
}

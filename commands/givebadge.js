const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

if (message.author.id != "343412762522812419") return;

let dil = db.fetch(`dil_${message.guildID}`) || "english";

  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  let userid = args[0]
  let thechangelog = args[1]
  if (!thechangelog) return message.channel.createMessage(`You must provide a badge name and user ID.`)
  if (!userid || isNaN(userid)) return message.channel.createMessage(`You must provide an user ID.`)
  if (!db.has(`badges_${thechangelog}`)) return message.channel.createMessage(`Can't find a badge with this name.`)
  db.push(`badges_${thechangelog}.users`, userid)
  message.channel.createMessage(`Successfully added this badge to this user!`)
}

module.exports.help = {
  name: "givebadge",
  aliase: [],
  descriptionen: "Shows the bot's stats.",
  descriptiontr: "Botun istatistiklerini gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'owner'
}

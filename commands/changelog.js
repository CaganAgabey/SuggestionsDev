const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  if (!db.has(`changelog`)) return message.channel.createMessage(`There's not any update changelog.`)
  let changelogmap = db.fetch(`changelog`).map(c => `<:rightarrow:709539888411836526> ` + c + `\n`).join('')
  if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Update changelog__**`, description: changelogmap + `\n \n<:rightarrow:709539888411836526> There is an active giveaway in the bot!\n**Giveaway** ${db.fetch(`botcekilis.english`)}\n**Join with** ${prefix}giveaway`, color: colorToSignedBit("#2F3136")}})
  if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Update changelog__**`, description: changelogmap, color: colorToSignedBit("#2F3136")}})
}

if (dil == "turkish") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  if (!db.has(`changelog`)) return message.channel.createMessage(`Herhangi bir güncelleme değişiklik kaydı yok.`)
  let changelogmap = db.fetch(`changelog`).map(c => `<:rightarrow:709539888411836526> ` + c + `\n`).join('')
  if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Değişim kaydı__**`, description: changelogmap + `\n \n<:rightarrow:709539888411836526> Botta aktif bir çekiliş var!\n**Çekiliş** ${db.fetch(`botcekilis.turkish`)}\n**Katılmak için** ${prefix}çekiliş`, color: colorToSignedBit("#2F3136")}})
  if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Değişim kaydı__**`, description: changelogmap, color: colorToSignedBit("#2F3136")}})
}
}

module.exports.help = {
  name: "changelog",
  nametr: "değişimkaydı",
  aliase: ["degisimkaydi", "değişimkaydı", "güncellemekaydı"],
  descriptionen: "Shows the changelog of the last update.",
  descriptiontr: "Son güncellemenin değişim kaydını gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'public'
}

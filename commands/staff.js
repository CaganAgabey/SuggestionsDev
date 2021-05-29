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
    let helpcommands = client.commands.filter(prop => prop.help.category == "staff" && prop.help.name != "help")
    if (helpcommands.length == 0) return message.channel.createMessage(`There's not any commands in this category.`)
    let helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptionen + `\n`).join('')
    if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: '__**Staff Commands**__', description: helpcommandsmap, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
    if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: '__**Staff Commands**__', description: helpcommandsmap + `\n \n<:rightarrow:709539888411836526> There is an active giveaway in this bot!\n**Giveaway** ${db.fetch(`botcekilis.english`)}\n**Join with** ${prefix}giveaway`, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
  }

  if (dil == "turkish") {

    let prefix = db.fetch(`prefix_${message.guildID}`) || "."
    let helpcommands = client.commands.filter(prop => prop.help.category == "staff" && prop.help.name != "help")
    if (helpcommands.length == 0) return message.channel.createMessage(`Bu kategoride herhangi bir komut yok.`)
    let helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.nametr + '** ' + p.help.descriptiontr + `\n`).join('')
    if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: '__**Yetkili Komutları**__', description: helpcommandsmap, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
    if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: '__**Yetkili Komutları**__', description: helpcommandsmap + `\n \n<:rightarrow:709539888411836526> Botta aktif bir çekiliş var!\n**Çekiliş** ${db.fetch(`botcekilis.turkish`)}\n**Katılmak için** ${prefix}çekiliş`, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
  }
}

module.exports.help = {
  name: "staff",
  nametr: "yetkili",
  aliase: ["yetkili", "staffhelp", "yetkiliyardım"],
  descriptionen: "Shows the commands that only staffs can use.",
  descriptiontr: "Sadece yetkililerin kullanabileceği komutları gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'help'
}

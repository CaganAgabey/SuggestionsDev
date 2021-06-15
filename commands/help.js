const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
  const db = client.db
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}
  
  const dil = db.fetch(`dil_${message.guildID}`) || "english";
  
  if (dil == "english") {
  const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
  const helpcommands = client.commands.filter(prop => prop.help.category == "help" && prop.help.name != "help");
  if (helpcommands.length == 0) return message.channel.createMessage(`There's not any commands in this category.`)
  const helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptionen + `\n`).join('');
  message.channel.createMessage({embed: {title: '__**Commands**__', description: helpcommandsmap, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
}

if (dil == "turkish") {
  const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
  const helpcommands = client.commands.filter(prop => prop.help.category == "help" && prop.help.name != "help");
  if (helpcommands.length == 0) return message.channel.createMessage(`Bu kategoride herhangi bir komut yok.`)
  const helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.nametr + '** ' + p.help.descriptiontr + `\n`).join('');
  if (!db.has(`botcekilis`)) message.channel.createMessage({
      embed: {
        title: '__**Komutlar**__',
        description: helpcommandsmap,
        color: colorToSignedBit("#2F3136"),
        footer: {
          text: client.user.username,
          icon_url: client.user.avatarURL || client.user.defaultAvatarURL
        }
      }
    })
    message.channel.createMessage({embed: {title: '__**Komutlar**__', description: helpcommandsmap, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
  }
}

module.exports.help = {
  name: "help",
  nametr: "yardım",
  aliase: ["yardım", "yardim", "helpme", "helping", "helppls", "helpls"],
  descriptionen: "Shows the commands.",
  descriptiontr: "Komutları gösterir.",
  usageen: "ping",
  usagetr: "ping",
  category: 'help'
}

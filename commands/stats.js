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
  if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Bot stats__**`, description: `**Users** ${Math.round(client.users.size * 1.5)}\n**Guilds** ${Math.round(client.guilds.size)}\n**If you want to support Suggestions** [Add bot](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Vote Suggestions bot](https://top.gg/bot/709351286922936362/vote)` + `\n \n<:rightarrow:709539888411836526> There is an active giveaway in the bot!\n**Giveaway** ${db.fetch(`botcekilis.english`)}\n**Join with** ${prefix}giveaway`, color: colorToSignedBit("#2F3136")}})
  if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Bot stats__**`, description: `**Users** ${Math.round(client.users.size * 1.5)}\n**Guilds** ${Math.round(client.guilds.size)}\n**If you want to support Suggestions** [Add bot](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Vote Suggestions bot](https://top.gg/bot/709351286922936362/vote)`, color: colorToSignedBit("#2F3136")}})
}

if (dil == "turkish") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  if (db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Bot istatistikleri__**`, description: `**Kullanıcılar** ${Math.round(client.users.size * 1.5)}\n**Sunucular** ${Math.round(client.guilds.size)}\n**Suggestions'u desteklemek isterseniz** [Botu ekle](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Suggestions botu oyla](https://top.gg/bot/709351286922936362/vote)` + `\n \n<:rightarrow:709539888411836526> Botta aktif bir çekiliş var!\n**Çekiliş** ${db.fetch(`botcekilis.turkish`)}\n**Katılmak için** ${prefix}çekiliş`, color: colorToSignedBit("#2F3136")}})
  if (!db.has(`botcekilis`)) message.channel.createMessage({embed: {title: `**__Bot istatistikleri__**`, description: `**Kullanıcılar** ${Math.round(client.users.size * 1.5)}\n**Sunucular** ${Math.round(client.guilds.size)}\n**Suggestions'u desteklemek isterseniz** [Botu ekle](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Suggestions botu oyla](https://top.gg/bot/709351286922936362/vote)`, color: colorToSignedBit("#2F3136")}})
}
}

module.exports.help = {
  name: "stats",
  nametr: "istatistikler",
  aliase: ["istatistik", "stat", "istatistikler"],
  descriptionen: "Shows the bot's stats.",
  descriptiontr: "Botun istatistiklerini gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'public'
}

const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  let user;
  if (message.mentions[0]) user = message.mentions[0]
  if (!message.mentions[0]) user = client.users.get(args[0]) || message.author;
  if (args[0] && !isNaN(args[0]) && !client.users.has(args[0])) return message.channel.createMessage(`Can't find a Suggestions user with this ID.`)
  let userbadges = '';
  for (const i of db.all().filter(i => i.ID.startsWith("badges_"))) {
      if (db.fetch(`${i.ID}.users`).includes(user.id)) userbadges += `${db.fetch(`${i.ID}.emoji`)} ${db.fetch(`${i.ID}.text`)}\n`
  }
  if (userbadges == '') userbadges == "Nothing"
  message.channel.createMessage({embed: {title: `**${user.username}**#${user.discriminator}`, description: `**User ID:** ${user.id}\n**Total sent suggestions:** ${db.all().filter(i => i.ID.startsWith(`suggestion_`) && db.fetch(`${i.ID}.author`) == user.id && db.fetch(`${i.ID}.status`) != "deleted").length}`, thumbnail: {url: user.avatarURL || user.defaultAvatarURL}, fields: [{name: `__**Suggestions badges**__`, value: userbadges || "Nothing"}], color: colorToSignedBit("#2F3136"), footer: {text: `Suggestions`, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
}

if (dil == "turkish") {
  let prefix = db.fetch(`prefix_${message.guildID}`) || "."
  let user;
  if (message.mentions[0]) user = message.mentions[0]
  if (!message.mentions[0]) user = client.users.get(args[0]) || message.author;
  if (args[0] && !isNaN(args[0]) && !client.users.has(args[0])) return message.channel.createMessage(`Bu ID ile herhangi bir Suggestions kullanıcısı bulunamadı.`)
  let userbadges = '';
  for (const i of db.all().filter(i => i.ID.startsWith("badges_"))) {
      if (db.fetch(`${i.ID}.users`).includes(user.id)) userbadges += `${db.fetch(`${i.ID}.emoji`)} ${db.fetch(`${i.ID}.text`)}\n`
  }
  if (userbadges == '') userbadges == "Hiçbir şey"
  message.channel.createMessage({embed: {title: `**${user.username}**#${user.discriminator}`, description: `**Kullanıcı ID:** ${user.id}\n**Toplam gönderilen öneriler:** ${db.all().filter(i => i.ID.startsWith(`suggestion_`) && db.fetch(`${i.ID}.author`) == user.id && db.fetch(`${i.ID}.status`) != "deleted").length}`, thumbnail: {url: user.avatarURL || user.defaultAvatarURL}, fields: [{name: `__**Suggestions rozetleri**__`, value: userbadges || "Hiçbir şey"}], color: colorToSignedBit("#2F3136"), footer: {text: `Suggestions`, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
}
}

module.exports.help = {
  name: "profile",
  nametr: "profil",
  aliase: ["profil", "userinfo", "kullanıcıbilgi"],
  descriptionen: "Shows any user's Suggestions profile.",
  descriptiontr: "Belirtilen kişinin Suggestions profilini gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'public'
}

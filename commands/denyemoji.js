﻿const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
  const db = client.db
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

let prefix = db.fetch(`prefix_${message.guildID}`) || ".";

if (dil == "english") {

if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)

if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`You must allow voting in suggestions with \`${prefix}allowvoting\` comand before opening this feature.`)

  const channel = args[0]
  if (channel == "reset" || channel == "delete") {
    if (!db.has(`customdeny_${message.guildID}`)) return message.channel.createMessage(`This guild already doesn't have a deny emoji.`)
    db.delete(`customdeny_${message.guildID}`)
    return message.channel.createMessage(`Successfully reseted the deny emoji.`)
  }
  if (!channel) return message.channel.createMessage(`You must provide an emoji or reset to reset.`)
  let kanal;
  if (/\p{Emoji}/u.test(channel) == true) kanal = args[0]
  if (/\p{Emoji}/u.test(channel) == false) kanal = message.channel.guild.emojis.filter(e => e.id == channel.split(':')[2].replace('>', ''))[0]
  if (!kanal) return message.channel.createMessage(`You must provide a correct emoji or reset to reset.`)
  if (channel.includes('<')) kanal = message.channel.guild.emojis.filter(e => e.id == channel.split(':')[2].replace('>', ''))[0].name + ':' + channel.split(':')[2].replace('>', '')
  if (db.has(`customdeny_${message.guildID}`) && db.fetch(`customdeny_${message.guildID}`) == kanal) return message.channel.createMessage(`Deny emoji of this guild is already this emoji.`)
  db.set(`customdeny_${message.guildID}`, kanal)
  if (channel.includes('<')) message.channel.createMessage(`Successfully setted the deny emoji to <:${kanal.split(':')[0]}:${kanal.split(':')[1]}> in this server! Hereafter all suggestions deny emoji will be this.`)
  if (!channel.includes('<')) message.channel.createMessage(`Successfully setted the deny emoji to ${kanal} in this server! Hereafter all suggestions deny emoji will be this.`)
}

if (dil == "turkish") {

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
  if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`Bu özelliği açmadan önce \`${prefix}oylamaizni\` komuduyla önerilerdeki oylamayı açmalısın.`)

  const channel = args[0]
  if (channel == "sıfırla" || channel == "sil") {
    if (!db.has(`customdeny_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun zaten özel bir red emojisi yok.`)
    db.delete(`customdeny_${message.guildID}`)
    return message.channel.createMessage(`Red emojisi başarıyla sıfırlandı.`)
  }
  if (!channel) return message.channel.createMessage(`Bir emoji belirtmelisin veya sıfırlamak için sıfırla yazmalısın.`)
  let kanal;
  if (/\p{Emoji}/u.test(channel) == true) kanal = args[0]
  if (/\p{Emoji}/u.test(channel) == false) kanal = message.channel.guild.emojis.filter(e => e.id == channel.split(':')[2].replace('>', ''))[0]
  if (!kanal) return message.channel.createMessage(`Doğru bir emoji belirtmelisin veya sıfırlamak için sıfırla yazmalısın.`)
  if (channel.includes('<')) kanal = message.channel.guild.emojis.filter(e => e.id == channel.split(':')[2].replace('>', ''))[0].name + ':' + channel.split(':')[2].replace('>', '')
  if (db.has(`customdeny_${message.guildID}`) && db.fetch(`customdeny_${message.guildID}`) == kanal) return message.channel.createMessage(`Bu sunucunun red emojisi zaten bu emoji.`)
  db.set(`customdeny_${message.guildID}`, kanal)
  if (channel.includes('<')) message.channel.createMessage(`Bu sunucunun red emojisi başarıyla <:${kanal.split(':')[0]}:${kanal.split(':')[1]}> belirlendi! Artık bütün önerilerin red emojisi bu olacak.`)
  if (!channel.includes('<')) message.channel.createMessage(`Bu sunucunun red emojisi başarıyla ${kanal} belirlendi! Artık bütün önerilerin red emojisi bu olacak.`)
  }
}

module.exports.help = {
  name: "denyemoji",
  nametr: "redemoji",
  aliase: ["redemoji", "redemojisi"],
  descriptionen: "Sets an unique emoji to deny emoji.",
  descriptiontr: "Reddetme emojisi için bir emoji seçer.",
  usageen: "setchannel [channel name, mention or id]",
  usagetr: "önerikanal [kanal ismi, etiketi veya idsi]",
  category: 'admin'
}

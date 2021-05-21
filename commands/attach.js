﻿const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {
    if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have Manage Messages permission to use this command!`)
    if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have the staff role!`)
    if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This server even doesn't has a suggestion channel!`)
    const sugid = args[0]
    if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to manage.`)
    if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this number in this guild.`)
    if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This server's suggestion channel has deleted, so you can't manage suggestions until setting a new suggestion channel.`)
    if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`You must review this suggestion in review channel with emojis before using this command.`)
    if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion has deleted!`)
    let image = message.attachments[0] || args[1]
    if (!image) return message.channel.createMessage(`You must send an image or an image link.`)
    if (args[1] && !args[1].includes('https://') && !args[1].includes('http://')) return message.channel.createMessage(`Invalid image link.`)
    if (db.has(`suggestion_${message.guildID}_${sugid}.attachment`) && (db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`) == args[1] || db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`) == image.url)) return message.channel.createMessage(`This suggestion's attached image is this image.`)
    try{
    client.guilds.get(message.guildID).channels.get(db.fetch(`suggestion_${message.guildID}_${sugid}.channel`)).getMessage(db.fetch(`suggestion_${message.guildID}_${sugid}.msgid`)).then(async msg => {
      message.addReaction(`✅`)
      if (args[1]) {
        msg.edit({embed: {title: msg.embeds[0].title, description: msg.embeds[0].description, color: msg.embeds[0].color, author: msg.embeds[0].author, footer: msg.embeds[0].footer, fields: msg.embeds[0].fields, image: {url: args[1]}}})
        db.set(`suggestion_${message.guildID}_${sugid}.attachment`, args[1])
      }
      if (!args[1]) {
       msg.edit({embed: {title: msg.embeds[0].title, description: msg.embeds[0].description, color: msg.embeds[0].color, author: msg.embeds[0].author, footer: msg.embeds[0].footer, fields: msg.embeds[0].fields, image: {url: image.url}}})
       db.set(`suggestion_${message.guildID}_${sugid}.attachment`, image.url)
      }
    })
    }catch(e){
      if (e.includes('Unknown Message')) return message.channel.createMessage(`This suggestion's message has deleted, so you can't manage this suggestion.`)
    }
}

if (dil == "turkish") {
  if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucu bir yetkili rolü seçmedi ve senin bu komudu kullanmak için Mesajları Yönetme yetkisine sahip olman gerekli!`)
  if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için yetkili rolüne sahip değilsin!`)
  if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
  const sugid = args[0]
  if (!sugid) return message.channel.createMessage(`Yönetmek için bir öneri numarası belirtmelisin.`)
  if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu numara ile böyle bir öneri bulunamadı.`)
  if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple yeni bir öneri kanalı seçmeden önerileri yönetemezsin.`)
  if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`Bu komudu kullanmadan önce öneriyi doğrulama kanalında emojiler ile doğrulamalısın veya silmelisin.`)
  if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`Bu öneri silinmiş!`)
  let image = message.attachments[0] || args[1]
  if (!image) return message.channel.createMessage(`Bir resim atmalısın veya resim linki belirtmelisin.`)
  if (args[1] && !args[1].includes('https://') && !args[1].includes('http://')) return message.channel.createMessage(`Geçersiz resim linki.`)
  if (db.has(`suggestion_${message.guildID}_${sugid}.attachment`) && (db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`) == args[1] || db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`) == image.url)) return message.channel.createMessage(`Bu öneriye eklenmiş resim zaten bu resim.`)
  try{
  client.guilds.get(message.guildID).channels.get(db.fetch(`suggestion_${message.guildID}_${sugid}.channel`)).getMessage(db.fetch(`suggestion_${message.guildID}_${sugid}.msgid`)).then(async msg => {
    message.addReaction(`✅`)
    if (args[1]) {
      msg.edit({embed: {title: msg.embeds[0].title, description: msg.embeds[0].description, color: msg.embeds[0].color, author: msg.embeds[0].author, footer: msg.embeds[0].footer, fields: msg.embeds[0].fields, image: {url: args[1]}}})
      db.set(`suggestion_${message.guildID}_${sugid}.attachment`, args[1])
    }
    if (!args[1]) {
     msg.edit({embed: {title: msg.embeds[0].title, description: msg.embeds[0].description, color: msg.embeds[0].color, author: msg.embeds[0].author, footer: msg.embeds[0].footer, fields: msg.embeds[0].fields, image: {url: image.url}}})
     db.set(`suggestion_${message.guildID}_${sugid}.attachment`, image.url)
    }
  })
  }catch(e){
    if (e.includes('Unknown Message')) return message.channel.createMessage(`Bu önerinin mesajı silinmiş, bu sebeple bu öneriyi yönetemezsin.`)
  }
  }
}

module.exports.help = {
  name: "attach",
  nametr: "resimekle",
  aliase: ["attachimage", "resimekle"],
  descriptionen: "Allows to add attachment to any suggestion.",
  descriptiontr: "Herhangi bir öneriye resim ekleyebilmenizi sağlar.",
  usageen: "prefix [new prefix]",
  usagetr: "önek [yeni önek]",
  category: 'staff'
}

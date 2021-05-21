const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {

  if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have MANAGE MESSAGES permission to use this!`)
if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have staff role to use this command!`)

if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`This guild doesn't have any review channel.`)

message.channel.createMessage(`Preparing...`).then(async msg => {
let all = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}`) && db.fetch(`${i.ID}.status`) == "awaiting approval")
if (all.length == 0) {
msg.edit(`There's not any suggestion that awaiting review.`)
}else{
let map = '';
for (const i of all.slice(0, 15)) {
    if (db.fetch(`${i.ID}.suggestion`).substr(0, 60) == db.fetch(`${i.ID}.suggestion`)) map += `<:rightarrow:709539888411836526> **Suggestion #${i.ID.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i.ID}.suggestion`)}\n`
    if (db.fetch(`${i.ID}.suggestion`).substr(0, 60) != db.fetch(`${i.ID}.suggestion`)) map += `<:rightarrow:709539888411836526> **Suggestion #${i.ID.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i.ID}.suggestion`).substr(0, 60)}...\n`
}
msg.edit({content: 'Suggestions that awaiting review', embed: {title: `__**Suggestions that awaiting review**__`, description: map, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
}
})
}

if (dil == "turkish") {

  if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucu bir yetkili rolü seçmemiş ve bu komudu kullanmak için Mesajları Yönetme yetkisine sahip olman gerek!`)
  if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için yetkili rolüne sahip değilsin!`)

if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun bir doğrulama kanalı yok.`)

message.channel.createMessage(`Hazırlanıyor...`).then(async msg => {
    let all = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}`) && db.fetch(`${i.ID}.status`) == "awaiting approval")
    if (all.length == 0) {
msg.edit(`Doğrulama bekleyen herhangi bir öneri yok.`)
}else{
    let map = '';
    for (const i of all.slice(0, 15)) {
        if (db.fetch(`${i.ID}.suggestion`).substr(0, 60) == db.fetch(`${i.ID}.suggestion`)) map += `<:rightarrow:709539888411836526> **Öneri #${i.ID.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i.ID}.suggestion`)}\n`
        if (db.fetch(`${i.ID}.suggestion`).substr(0, 60) != db.fetch(`${i.ID}.suggestion`)) map += `<:rightarrow:709539888411836526> **Öneri #${i.ID.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i.ID}.suggestion`).substr(0, 60)}...\n`
    }
    msg.edit({content: 'Doğrulama bekleyen öneriler', embed: {title: `__**Doğrulama bekleyen öneriler**__`, description: map, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
    }
})
}
  }

module.exports.help = {
  name: "queue",
  nametr: "sıra",
  aliase: ["reviewqueue", "doğrulamasıra", "doğrulamasırası", "sıra"],
  descriptionen: "Shows the suggestions that awaiting review.",
  descriptiontr: "Doğrulama bekleyen önerileri gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'staff'
}

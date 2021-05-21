const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {

if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have MANAGE MESSAGES permission to use this!`)
if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have staff role to use this command!`)
if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
const sugid = args
if (!args[0]) return message.channel.createMessage(`You must provide one or more suggestion numbers to manage these suggestions.`)
if (isNaN(args[0])) return message.channel.createMessage(`You must provide at least 1 suggestion number.`)
if (args.some(arg => !isNaN(arg) && !db.has(`suggestion_${message.guildID}_${arg}`))) return message.channel.createMessage(`One or more provided suggestion number(s) are invalid.`)
if (args.some(arg => !isNaN(arg) && db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval")) return message.channel.createMessage(`One or more provided suggestion(s) are still waiting for verification. You must verify or delete these suggestions with emojis before using this command.`)
if (args.some(arg => !isNaN(arg) && db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted")) return message.channel.createMessage(`One or more provided suggestion(s) are deleted. You must remove this suggestion number from provided suggestion numbers.`)
if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't handle suggestions in this guild until setting a new suggestion channel.`)

try{
await message.addReaction(`⏲`)
for (const gid of sugid.filter(ar => !isNaN(ar))) {
client.guilds.get(message.guildID).channels.find(c => c.id == db.fetch(`suggestion_${message.guildID}_${gid}.channel`)).getMessage(db.fetch(`suggestion_${message.guildID}_${gid}.msgid`)).then(async msg => {
  if (isNaN(args[args.length - 1])) {
    if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
      await msg.edit({embed: {title: `Suggestion #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Approved suggestion - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, fields: [{name: `${message.author.username}'s reason`, value: args[args.length - 1]}], image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}})
      db.set(`suggestion_${message.guildID}_${gid}.channel`, msg.channel.id)
  }
  if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
      msg.delete()
      await client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({embed: {title: `Suggestion #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Approved suggestion - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, fields: [{name: `${message.author.username}'s reason`, value: args[args.length - 1]}], image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}}).then(async masg => {
      db.set(`suggestion_${message.guildID}_${gid}.channel`, masg.channel.id)
      db.set(`suggestion_${message.guildID}_${gid}.msgid`, masg.id)
  })
  }
    db.set(`suggestion_${message.guildID}_${gid}.status`, 'approved')
    await msg.removeReactions()
    if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${gid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${gid}.author`)).getDMChannel().then(async ch => ch.createMessage({embed: {title: 'Your suggestion has approved!', description: `Your suggestion has approved in \`${message.channel.guild.name}\`.\n**Suggestion:** ${db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`)}\n**Suggestion number:** ${gid}\n**Reason:** ${args[args.length - 1]}`, color: colorToSignedBit("#00FF00")}}))
  }
  if (!isNaN(args[args.length - 1])) {
    if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
      await msg.edit({embed: {title: `Suggestion #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Approved suggestion - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}})
      db.set(`suggestion_${message.guildID}_${gid}.channel`, msg.channel.id)
  }
  if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
      msg.delete()
      await client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({embed: {title: `Suggestion #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Approved suggestion - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}}).then(async masg => {
      db.set(`suggestion_${message.guildID}_${gid}.channel`, masg.channel.id)
      db.set(`suggestion_${message.guildID}_${gid}.msgid`, masg.id)
  })
  }
    db.set(`suggestion_${message.guildID}_${gid}.status`, 'approved')
    await msg.removeReactions()
    if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${gid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${gid}.author`)).getDMChannel().then(async ch => ch.createMessage({embed: {title: 'Your suggestion has approved!', description: `Your suggestion has approved in \`${message.channel.guild.name}\`.\n**Suggestion:** ${db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`)}\n**Suggestion number:** ${gid}`, color: colorToSignedBit("#00FF00")}}))
  }
})
}
await sleep(7500)
  await message.removeReactions()
  await message.addReaction(`✅`)
}catch(e){
  if (e.toString().includes('Unknown Message')) message.channel.createMessage(`This suggestion's message has been deleted, so you can't manage this suggestion.`)
  return console.log(e.stack)
}
}

if (dil == "turkish") {

  if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucu bir yetkili rolü seçmedi ve bu komudu kullanabilmek için Mesajları Yönetme yetkisine sahip olmalısın!`)
  if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için yetkili rolüne sahip değilsin!`)
  if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
  const sugid = args
  if (!args[0]) return message.channel.createMessage(`Bu önerileri yönetmek için bir veya daha fazla öneri numarası belirtmelisin.`)
  if (isNaN(args[0])) return message.channel.createMessage(`En az 1 öneri numarası belirtmelisin.`)
  if (args.some(arg => !isNaN(arg) && !db.has(`suggestion_${message.guildID}_${arg}`))) return message.channel.createMessage(`Bir veya birkaç belirtilen öneri numarası geçersiz.`)
  if (args.some(arg => !isNaN(arg) && db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval")) return message.channel.createMessage(`Bir veya birkaç öneri hala doğrulama sırasında bekliyor. Bu komudu kullanmadan önce o önerileri emojiler ile doğrulamalısın veya silmelisin.`)
  if (args.some(arg => !isNaN(arg) && db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted")) return message.channel.createMessage(`Bir veya birkaç öneri silinmiş. Bu önerilerin numaralarını belirtilen numaralardan silmelisin.`)
  if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple yeni bir öneri kanalı seçmeden önerileri yönetemezsin.`)
  try{
  await message.addReaction(`⏲`)
  for (const gid of sugid.filter(ar => !isNaN(ar))) {
  client.guilds.get(message.guildID).channels.find(c => c.id == db.fetch(`suggestion_${message.guildID}_${gid}.channel`)).getMessage(db.fetch(`suggestion_${message.guildID}_${gid}.msgid`)).then(async msg => {
    if (isNaN(args[args.length - 1])) {
      if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
        await msg.edit({embed: {title: `Öneri #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, fields: [{name: `${message.author.username} adlı yetkilinin cevabı`, value: args[args.length - 1]}], image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}})
        db.set(`suggestion_${message.guildID}_${gid}.channel`, msg.channel.id)
    }
    if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
        msg.delete()
        await client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({embed: {title: `Öneri #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, fields: [{name: `${message.author.username} adlı yetkilinin cevabı`, value: args[args.length - 1]}], image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}}).then(async masg => {
        db.set(`suggestion_${message.guildID}_${gid}.channel`, masg.channel.id)
        db.set(`suggestion_${message.guildID}_${gid}.msgid`, masg.id)
    })
    }
      db.set(`suggestion_${message.guildID}_${gid}.status`, 'approved')
      await msg.removeReactions()
      if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${gid}.author`)).getDMChannel().then(async ch => ch.createMessage({embed: {title: 'Önerin onaylandı!', description: `Önerin \`${message.channel.guild.name}\` sunucusunda onaylandı.\n**Öneri:** ${db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`)}\n**Öneri numarası:** ${gid}\n**Sebep:** ${args[args.length - 1]}`, color: colorToSignedBit("#00FF00")}}))
    }
    if (!isNaN(args[args.length - 1])) {
      if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
        await msg.edit({embed: {title: `Öneri #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}})
        db.set(`suggestion_${message.guildID}_${gid}.channel`, msg.channel.id)
    }
    if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
        msg.delete()
        await client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({embed: {title: `Öneri #${gid}`, description: db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`), color: colorToSignedBit("#00FF00"), author: {name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).discriminator}`, icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${gid}.author`)).defaultAvatarURL}, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, image: {url: db.fetch(`suggestion_${message.guildID}_${gid}.attachment`)}}}).then(async masg => {
        db.set(`suggestion_${message.guildID}_${gid}.channel`, masg.channel.id)
        db.set(`suggestion_${message.guildID}_${gid}.msgid`, masg.id)
    })
    }
      db.set(`suggestion_${message.guildID}_${gid}.status`, 'approved')
      await msg.removeReactions()
      if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${gid}.author`)).getDMChannel().then(async ch => ch.createMessage({embed: {title: 'Önerin onaylandı!', description: `Önerin \`${message.channel.guild.name}\` sunucusunda onaylandı.\n**Öneri:** ${db.fetch(`suggestion_${message.guildID}_${gid}.suggestion`)}\n**Öneri numarası:** ${gid}`, color: colorToSignedBit("#00FF00")}}))
    }
  })
  }
  await sleep(7500)
    await message.removeReactions()
    await message.addReaction(`✅`)
  }catch(e){
    if (e.toString().includes('Unknown Message')) message.channel.createMessage(`Bu önerinin mesajı silinmiş, bu sebeple bu öneriyi yönetemezsin.`)
    return console.log(e.stack)
  }
  }
}

module.exports.help = {
  name: "massapprove",
  nametr: "çokluonay",
  aliase: ["massapprovesuggestion", "çokluonayla", "çokluonay"],
  descriptionen: "Allows to approve mass suggestions.",
  descriptiontr: "Çoklu öneri onaylamanıza yarar.",
  usageen: "prefix [new prefix]",
  usagetr: "önek [yeni önek]",
  category: 'staff'
}

const Eris = require("eris");
const db = require('quick.db');
const {manageSuggestion} = require('../functions')

module.exports.run = async (client, message, args) => {
  
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
  }
  
  let dil = db.fetch(`dil_${message.guildID}`) || "english";
  
  if (dil == "english") {
    if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have MANAGE MESSAGES permission to use this!`)
    if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have staff role to use this command!`)
    if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
    const sugid = args[0]
    if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to manage.`)
    if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
    if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't handle suggestions in this guild until setting a new suggestion channel.`)
    if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`You must verify or delete this suggestion in review channel using emojis before using this command.`)
    if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion was deleted!`)
    //if (db.fetch(`deletedmessages`).includes(db.fetch(`suggestion_${message.guildID}_${sugid}.msgid`)) return message.channel.createMessage(`This suggestion's message has been deleted, so you can't manage this suggestion.`)
    try {
      manageSuggestion(message, message.channel.guild, sugid, "Approved", client, dil, args)
    } catch(e) {
      if (e.includes('Unknown Message')) return message.channel.createMessage(`This suggestion's message has been deleted, so you can't manage this suggestion.`)
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
    try {
      client.guilds.get(message.guildID).channels.get(db.fetch(`suggestion_${message.guildID}_${sugid}.channel`)).getMessage(db.fetch(`suggestion_${message.guildID}_${sugid}.msgid`)).then(async msg => {
        message.addReaction(`✅`)
        if (args.slice(1).join(' ')) {
          if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
            msg.edit({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#0F0"),
                author: {
                  name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                fields: [ {name: `${message.author.username} adlı yetkilinin cevabı`, value: args.slice(1).join(' ')} ],
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#0F0"),
                author: {
                  name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                fields: [ {name: `${message.author.username} adlı yetkilinin cevabı`, value: args.slice(1).join(' ')} ],
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${message.guildID}_${sugid}.status`, 'approved')
          msg.removeReactions()
          if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Önerin onaylandı!',
              description: `Önerin \`${message.channel.guild.name}\` sunucusunda onaylandı.\n**Öneri:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}\n**Sebep:** ${args.slice(1).join(' ')}`,
              color: colorToSignedBit("#0F0")
            }
          }))
        }
        if (!args.slice(1).join(' ')) {
          if (!db.has(`approvedchannel_${message.guildID}`) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) {
            msg.edit({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FF00"),
                author: {
                  name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            client.guilds.get(message.guildID).channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#0F0"),
                author: {
                  name: `Onaylanmış öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${message.guildID}_${sugid}.status`, 'approved')
          msg.removeReactions()
          if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Önerin onaylandı!',
              description: `Önerin \`${message.channel.guild.name}\` sunucusunda onaylandı.\n**Öneri:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}`,
              color: colorToSignedBit("#00FF00")
            }
          }))
        }
      })
    } catch(e) {
      if (e.includes('Unknown Message')) return message.channel.createMessage(`Bu önerinin mesajı silinmiş, bu sebeple bu öneriyi yönetemezsin.`)
    }
  }
}

module.exports.help = {
  name: "approve",
  nametr: "onayla",
  aliase: [ "approvesuggestion", "onayla", "onay" ],
  descriptionen: "Allows to approve any suggestion.",
  descriptiontr: "Herhangi bir öneriyi onaylamanıza yarar.",
  usageen: "prefix [new prefix]",
  usagetr: "önek [yeni önek]",
  category: 'staff'
}

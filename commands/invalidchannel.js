const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
  const db = client.db
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {

if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)

  const channel = message.channelMentions[0] || args.join(' ')
  if (!channel) return message.channel.createMessage(`You must write a channel name, mention a channel, write a channel ID or write delete to delete invalid channel.`)
  if (channel == "delete") {
    if (!db.has(`invalidchannel_${message.guildID}`)) return message.channel.createMessage(`This guild already doesn't have a invalid channel.`)
    db.delete(`invalidchannel_${message.guildID}`)
    return message.channel.createMessage(`Successfully deleted the invalid channel.`)
  }
  let kanal;
  if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
  if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
  if (!kanal) return message.channel.createMessage(`Can't find a channel with this ID/name.`)
  if (kanal.type == 2) return message.channel.createMessage(`You can't set voice channels as invalid channel.`)
  if (db.has(`invalidchannel_${message.guildID}`) && db.fetch(`invalidchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Invalid channel of this guild is already this channel.`)
  if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Invalid channel can't be same with suggestion channel.`)
  db.set(`invalidchannel_${message.guildID}`, kanal.id)
  message.channel.createMessage(`Successfully setted the invalid channel to ${kanal.mention} in this server! Hereafter all invalid suggestions will send to this channel.`)
}

if (dil == "turkish") {

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olman gerek.`)
  
    const channel = message.channelMentions[0] || args.join(' ')
    if (!channel) return message.channel.createMessage(`Bir kanal ismi yazmalısın, kanal etiketlemelisin, kanal IDsi yazmalısın veya silmek için sil yazmalısın.`)
    if (channel == "sil") {
      if (!db.has(`invalidchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun zaten bir geçersiz öneri kanalı yok.`)
      db.delete(`invalidchannel_${message.guildID}`)
      return message.channel.createMessage(`Geçersiz öneri kanalı başarıyla silindi.`)
    }
    let kanal;
    if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
    if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
    if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir kanal bulunamadı.`)
    if (kanal.type == 2) return message.channel.createMessage(`Sesli kanallarını geçersiz öneri kanalı olarak seçemezsin.`)
    if (db.has(`invalidchannel_${message.guildID}`) && db.fetch(`invalidchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Bu sunucunun geçersiz öneri kanalı zaten bu kanal.`)
  if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Geçersiz öneri kanalı, öneri kanalı ile aynı olamaz.`)
  db.set(`invalidchannel_${message.guildID}`, kanal.id)
    message.channel.createMessage(`Bu sunucuda geçersiz öneri kanalı başarıyla ${kanal.mention} olarak belirlendi! Bundan sonra tüm geçersiz öneriler bu kanala gönderilecektir.`)
  }
}

module.exports.help = {
  name: "invalidchannel",
  nametr: "geçersizönerikanalı",
  aliase: ["invalidschannel", "geçersizkanal", "geçersizönerikanalı", "geçersizönerikanal"],
  descriptionen: "Sets a channel to send invalid suggestions. (write delete to delete invalid channel)",
  descriptiontr: "Geçersiz önerileri göndermek için bir kanal seçer. (silmek için sil yaz)",
  usageen: "setchannel [channel name, mention or id]",
  usagetr: "önerikanal [kanal ismi, etiketi veya idsi]",
  category: 'admin'
}

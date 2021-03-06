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

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak i??in Y??netici yetkisine sahip olman gerek.`)
  
    const channel = message.channelMentions[0] || args.join(' ')
    if (!channel) return message.channel.createMessage(`Bir kanal ismi yazmal??s??n, kanal etiketlemelisin, kanal IDsi yazmal??s??n veya silmek i??in sil yazmal??s??n.`)
    if (channel == "sil") {
      if (!db.has(`invalidchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun zaten bir ge??ersiz ??neri kanal?? yok.`)
      db.delete(`invalidchannel_${message.guildID}`)
      return message.channel.createMessage(`Ge??ersiz ??neri kanal?? ba??ar??yla silindi.`)
    }
    let kanal;
    if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
    if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
    if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir kanal bulunamad??.`)
    if (kanal.type == 2) return message.channel.createMessage(`Sesli kanallar??n?? ge??ersiz ??neri kanal?? olarak se??emezsin.`)
    if (db.has(`invalidchannel_${message.guildID}`) && db.fetch(`invalidchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Bu sunucunun ge??ersiz ??neri kanal?? zaten bu kanal.`)
  if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Ge??ersiz ??neri kanal??, ??neri kanal?? ile ayn?? olamaz.`)
  db.set(`invalidchannel_${message.guildID}`, kanal.id)
    message.channel.createMessage(`Bu sunucuda ge??ersiz ??neri kanal?? ba??ar??yla ${kanal.mention} olarak belirlendi! Bundan sonra t??m ge??ersiz ??neriler bu kanala g??nderilecektir.`)
  }
}

module.exports.help = {
  name: "invalidchannel",
  nametr: "ge??ersiz??nerikanal??",
  aliase: ["invalidschannel", "ge??ersizkanal", "ge??ersiz??nerikanal??", "ge??ersiz??nerikanal"],
  descriptionen: "Sets a channel to send invalid suggestions. (write delete to reset)",
  descriptiontr: "Ge??ersiz ??nerileri g??ndermek i??in bir kanal se??er. (silmek i??in sil yaz)",
  usageen: "setchannel [channel name, mention or id]",
  usagetr: "??nerikanal [kanal ismi, etiketi veya idsi]",
  category: 'admin'
}

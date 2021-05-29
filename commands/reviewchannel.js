const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
  const db = client.db
  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let prefix = db.fetch(`prefix_${message.guildID}`) || "."

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {

if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`First, you must select a suggestion channel with using \`${prefix}setchannel\` command.`)

  const channel = message.channelMentions[0] || args.join(' ')
  if (!channel) return message.channel.createMessage(`You must write a channel name, mention a channel, write a channel ID or write delete to delete review channel.`)
  if (channel == "delete") {
    if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`This guild already doesn't have a review channel.`)
    db.delete(`reviewchannel_${message.guildID}`)
    return message.channel.createMessage(`Successfully deleted the review channel.`)
  }
  let kanal;
  if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
  if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
  if (!kanal) return message.channel.createMessage(`Can't find a channel with this ID/name.`)
  if (kanal.type == 2) return message.channel.createMessage(`You can't set voice channels as review channel.`)
  if (db.has(`reviewchannel_${message.guildID}`) && db.fetch(`reviewchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Review channel of this guild is already this channel.`)
  if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Review channel can't be same with suggestion channel.`)
  db.set(`reviewchannel_${message.guildID}`, kanal.id)
  message.channel.createMessage(`Successfully setted the review channel to ${kanal.mention} in this server! Hereafter all suggestions will send to this channel, and when a staff approve this suggestion, it will show up in suggestion channel.`)
}

if (dil == "turkish") {

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
  if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Öncelikle, \`${prefix}kanalseç\` komuduyla bir öneri kanalı seçmelisin.`)
  
    const channel = message.channelMentions[0] || args.join(' ')
    if (!channel) return message.channel.createMessage(`Bir kanal ismi yazmalısın, kanal ismi etiketlemelisin, kanal IDsi yazmalısın veya sil yazarak doğrulama kanalını silmelisin.`)
    if (channel == "sil") {
      if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun zaten bir doğrulama kanalı yok.`)
      db.delete(`reviewchannel_${message.guildID}`)
      return message.channel.createMessage(`Doğrulama kanalı başarıyla silindi.`)
    }
    let kanal;
    if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
    if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
    if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir kanal bulunamadı.`)
    if (kanal.type == 2) return message.channel.createMessage(`Ses kanallarını doğrulama kanalı olarak seçemezsin.`)
    if (db.has(`reviewchannel_${message.guildID}`) && db.fetch(`reviewchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Bu sunucunun doğrulama kanalı zaten bu kanal.`)
  if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Doğrulama kanalı öneri kanalı ile aynı olamaz.`)
  db.set(`reviewchannel_${message.guildID}`, kanal.id)
    message.channel.createMessage(`Bu sunucuda doğrulama kanalı başarıyla ${kanal.mention} olarak seçildi! Bundan sonra tüm yeni öneriler bu kanala gönderilecek, bu kanalda eğer bir yetkili doğrularsa öneriler kanalında gözükecek.`)
  }
}

module.exports.help = {
  name: "reviewchannel",
  nametr: "doğrulamakanalı",
  aliase: ["reviewingchannel", "doğrulamakanalı", "doğrulamakanal"],
  descriptionen: "Sets a channel to send suggestions that awaiting approval. (write delete to close reviewing feature)",
  descriptiontr: "Doğrulama bekleyen önerileri göndermek için bir kanal seçer. (doğrulama özelliğini kapatmak için sil yazın)",
  usageen: "setchannel [channel name, mention or id]",
  usagetr: "önerikanal [kanal ismi, etiketi veya idsi]",
  category: 'admin'
}

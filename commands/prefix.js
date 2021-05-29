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

  const prefix = args.join(' ')
  if (!prefix) return message.channel.createMessage(`You must provide a prefix.`)
  if (prefix == "delete" || prefix == "remove" || prefix == "reset" || prefix == "restart") {
    db.delete(`prefix_${message.guildID}`)
    return message.channel.createMessage(`Successfully reseted the prefix to **.** in this server!`)
  }
  if (prefix.includes(' ')) return message.channel.createMessage(`A prefix can't include space.`)
  if (prefix.length > 5) return message.channel.createMessage(`A prefix can't be longer than 5 character.`)

  db.set(`prefix_${message.guildID}`, prefix)
  message.channel.createMessage(`Successfully setted the prefix to **${prefix}** in this server!`)
}

if (dil == "turkish") {

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
  
    const prefix = args.join(' ')
    if (!prefix) return message.channel.createMessage(`Bir önek belirtmelisin.`)
    if (prefix == "sil" || prefix == "yenile" || prefix == "sıfırla") {
      db.delete(`prefix_${message.guildID}`)
      return message.channel.createMessage(`Bu sunucuda bu botun öneki başarıyla **.** olarak sıfırlandı!`)
    }
    if (prefix.includes(' ')) return message.channel.createMessage(`Bir önek boşluk içeremez.`)
    if (prefix.length > 5) return message.channel.createMessage(`Bir önek 5 karakterden uzun olamaz.`)
  
    db.set(`prefix_${message.guildID}`, prefix)
    message.channel.createMessage(`Bu sunucuda önek başarıyla **${prefix}** olarak belirlendi!`)
  }
}

module.exports.help = {
  name: "prefix",
  nametr: "önek",
  aliase: ["setprefix", "önek", "önekbelirle", "önekseç"],
  descriptionen: "Sets the bot's prefix that valid in this server.",
  descriptiontr: "Botun bu sunucuda kullanacağı öneki seçmeye yarar.",
  usageen: "prefix [new prefix]",
  usagetr: "önek [yeni önek]",
  category: 'admin'
}

const Eris = require("eris");
const arkdb = require('ark.db');
const db = new arkdb.Database()

module.exports.run = async (client, message, args) => {

  function colorToSignedBit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

let dil = db.fetch(`dil_${message.guildID}`) || "english";

if (dil == "english") {

if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)

if (!args[0]) return message.channel.createMessage(`You must provide an option. (\`add\`, \`remove\` or \`list\`)`)
if (args[0] == "add") {
  const channel = message.roleMentions[0] || args.slice(1).join(' ')
  if (!channel) return message.channel.createMessage(`You must write a role name, mention a role, write a role ID.`)
  let kanal;
  if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.id == channel)
  if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
  if (!kanal) return message.channel.createMessage(`Can't find a role with this ID/name.`)
  if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`This guild already has a staff role like this.`)
  if (db.has(`staffrole_${message.guildID}`)) db.push(`staffrole_${message.guildID}`, kanal.id)
  if (!db.has(`staffrole_${message.guildID}`)) db.set(`staffrole_${message.guildID}`, [kanal.id])
  message.channel.createMessage(`Successfully added the staff role ${kanal.mention} in this server! Hereafter, this role will be able to use commands in staff category.`)
}

if (args[0] == "remove") {
  const channel = message.roleMentions[0] || args.slice(1).join(' ')
  if (!channel) return message.channel.createMessage(`You must write a role name, mention a role, write a role ID.`)
  let kanal;
  if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.id == channel)
  if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
  if (!kanal) return message.channel.createMessage(`Can't find a role with this ID/name.`)
  if (!db.has(`staffrole_${message.guildID}`) || !db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`This guild doesn't have a staff role like this.`)
  let array = db.fetch(`staffrole_${message.guildID}`)
  var indexi = array.indexOf(kanal.id)
  array.splice(indexi, 1)
  db.set(`staffrole_${message.guildID}`, array)
  message.channel.createMessage(`Successfully removed the staff role ${kanal.mention} in this server! Hereafter, this role won't be able to use commands in staff category.`)
}

if (args[0] == "list") {
  if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) return message.channel.createMessage(`This guild doesn't have any staff role.`)
  const staffroles = db.fetch(`staffrole_${message.guildID}`)
  const rolemap = staffroles.map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
  message.channel.createMessage({embed: {title: `__**Staff roles**__`, description: rolemap, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, color: colorToSignedBit("#2F3136")}})
}

if (args[0] != "add" && args[0] != "remove" && args[0] != "list") return message.channel.createMessage(`You must provide a correct option. (\`add\`, \`remove\` or \`list\`)`)
}

if (dil == "turkish") {

  if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
  
  if (!args[0]) return message.channel.createMessage(`Bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
  if (args[0] == "ekle") {
    const channel = message.roleMentions[0] || args.slice(1).join(' ')
    if (!channel) return message.channel.createMessage(`Bir rol ismi, rol IDsi yazmalısın veya rol etiketlemelisin.`)
    let kanal;
    if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.id == channel)
    if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
    if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir rol buluanamadı.`)
    if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`Bu sunucu zaten bu yetkili rolüne sahip.`)
    if (db.has(`staffrole_${message.guildID}`)) db.push(`staffrole_${message.guildID}`, kanal.id)
    if (!db.has(`staffrole_${message.guildID}`)) db.set(`staffrole_${message.guildID}`, [kanal.id])
    message.channel.createMessage(`Başarıyla bu sunucudaki yetkili rollerine ${kanal.mention} eklendi! Artık bu rol, yetkili kategorisindeki komutları kullanabilecektir.`)
  }
  
  if (args[0] == "sil") {
    const channel = message.roleMentions[0] || args.slice(1).join(' ')
    if (!channel) return message.channel.createMessage(`Bir rol ismi, rol IDsi yazmalısın veya rol etiketlemelisin.`)
    let kanal;
    if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.id == channel)
    if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).roles.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
    if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir rol bulunamadı.`)
    if (!db.has(`staffrole_${message.guildID}`) || !db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`Bu sunucunun böyle bir yetkili rolü yok.`)
    let array = db.fetch(`staffrole_${message.guildID}`)
    var indexi = array.indexOf(kanal.id)
    array.splice(indexi, 1)
    db.set(`staffrole_${message.guildID}`, array)
    message.channel.createMessage(`Başarıyla bu sunucunun yetkili rollerinden ${kanal.mention} kaldırıldı! Artık bu rol, yetkili kategorisindeki komutları kullanamayacaktır.`)
  }
  
  if (args[0] == "liste") {
    if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) return message.channel.createMessage(`Bu sunucunun hiçbir yetkili rolü yok.`)
    const staffroles = db.fetch(`staffrole_${message.guildID}`)
    const rolemap = staffroles.map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
    message.channel.createMessage({embed: {title: `__**Yetkili rolleri**__`, description: rolemap, footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}, color: colorToSignedBit("#2F3136")}})
  }
  
  if (args[0] != "ekle" && args[0] != "sil" && args[0] != "liste") return message.channel.createMessage(`Doğru bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
  }
}

module.exports.help = {
  name: "staffrole",
  nametr: "yetkilirol",
  aliase: ["setstaff", "setstaffrole", "yetkilirol", "yetkilirolseç"],
  descriptionen: "Sets a staff role to manage suggestions. (if not selected, required permission for staff roles is Manage Messages)",
  descriptiontr: "Önerileri yönetecek bir yetkili rolü seçer. (seçilmediyse, yetkililer için gereken yetki Mesajları Yönetme olacaktır)",
  usageen: "setstaffrole [role name, mention or id]",
  usagetr: "yetkilirol [rol ismi, etiketi veya idsi]",
  category: 'admin'
}

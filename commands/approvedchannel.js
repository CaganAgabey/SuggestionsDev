const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
  
  const dil = db.fetch(`dil_${message.guildID}`) || "english";
  
  if (dil == "english") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
		
		const channel = message.channelMentions[0] || args.join(' ')
		if (!channel) return message.channel.createMessage(`You must write a channel name, mention a channel, write a channel ID or write delete to delete approved channel.`)
		if (channel == "delete") {
			if (!db.has(`approvedchannel_${message.guildID}`)) return message.channel.createMessage(`This guild already doesn't have a approved channel.`)
			db.delete(`approvedchannel_${message.guildID}`)
			return message.channel.createMessage(`Successfully deleted the approved channel.`)
		}
		let kanal;
		if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
		if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
		if (!kanal) return message.channel.createMessage(`Can't find a channel with this ID/name.`)
		if (kanal.type == 2) return message.channel.createMessage(`You can't set voice channels as approved channel.`)
		if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Approved channel of this guild is already this channel.`)
		if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Approved channel can't be same with suggestion channel.`)
		db.set(`approvedchannel_${message.guildID}`, kanal.id)
		message.channel.createMessage(`Successfully setted the approved channel to ${kanal.mention} in this server! Hereafter all approved suggestions will send to this channel.`)
	}
	
	if (dil == "turkish") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		const channel = message.channelMentions[0] || args.join(' ')
		if (!channel) return message.channel.createMessage(`Bir kanal ismi yazmalısın, kanal etiketlemelisin, kanal IDsi yazmalısın veya onaylı öneri kanalını silmek için sil yazmalısın.`)
		if (channel == "sil") {
			if (!db.has(`approvedchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun zaten onaylı öneri kanalı yok.`)
			db.delete(`approvedchannel_${message.guildID}`)
			return message.channel.createMessage(`Başarıyla onaylı öneri kanalı silindi.`)
		}
		let kanal;
		if (!isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.id == channel)
		if (isNaN(channel)) kanal = client.guilds.find(g => g.id == message.guildID).channels.find(c => c.name.toLowerCase().includes(channel.toLowerCase()))
		if (!kanal) return message.channel.createMessage(`Bu ID/isim ile bir kanal bulunamadı.`)
		if (kanal.type == 2) return message.channel.createMessage(`Sesli kanalları onaylı öneri kanalı yapamazsın.`)
		if (db.has(`approvedchannel_${message.guildID}`) && db.fetch(`approvedchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Bu sunucunun onaylı öneri kanalı zaten bu kanal.`)
		if (db.fetch(`suggestionchannel_${message.guildID}`) == kanal.id) return message.channel.createMessage(`Onaylı öneri kanalı, öneri kanalı ile aynı olamaz.`)
		db.set(`approvedchannel_${message.guildID}`, kanal.id)
		message.channel.createMessage(`Başarıyla bu sunucuda onaylı öneri kanalı ${kanal.mention} yapıldı! Bundan sonra tüm onaylanmış öneriler bu kanala gönderilecektir.`)
	}
}

module.exports.help = {
	name: "approvedchannel",
	nametr: "onaylanmışönerikanal",
	aliase: [ "approvechannel", "onaylanankanal", "onaylanmışönerikanal", "onaylanmışönerikanalı" ],
	descriptionen: "Sets a channel to send approved suggestions. (write delete to reset)",
	descriptiontr: "Onaylanmış önerileri göndermek için bir kanal seçer. (silmek için sil yazın)",
	usageen: "setchannel [channel name, mention or id]",
	usagetr: "önerikanal [kanal ismi, etiketi veya idsi]",
	category: 'admin'
}

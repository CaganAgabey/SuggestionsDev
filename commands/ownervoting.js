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
		if (db.has(`ownervoting_${message.guildID}`)) {
			db.delete(`ownervoting_${message.guildID}`)
			message.channel.createMessage(`Successfully allowed suggestion owners to vote.`)
		} else {
			db.set(`ownervoting_${message.guildID}`, 'true')
			message.channel.createMessage(`Successfully denied suggestion owners to vote.`)
		}
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		if (db.has(`ownervoting_${message.guildID}`)) {
			db.delete(`ownervoting_${message.guildID}`)
			message.channel.createMessage(`Başarıyla öneri sahiplerinin oy verebilmesi açıldı.`)
		} else {
			db.set(`ownervoting_${message.guildID}`, 'true')
			message.channel.createMessage(`Başarıyla öneri sahiplerinin oy verebilmesi kapatıldı.`)
		}
	}
}

module.exports.help = {
	name: "ownervoting",
	nametr: "sahipoylama",
	aliase: [ "sahipoylama", "sahipoy", "selfvoting" ],
	descriptionen: "Sets the users can vote to multiple reactions. (default: true)",
	descriptiontr: "Kullanıcıların önerilerde birden fazla tepkiye oy verip veremeyeceğini belirler. (normali: evet)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

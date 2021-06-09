const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
	
	if (dil == "english") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
		if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`You must allow voting in suggestions with \`${prefix}allowvoting\` comand before opening this feature.`)
		if (db.has(`multiplevoting_${message.guildID}`)) {
			db.delete(`multiplevoting_${message.guildID}`)
			message.channel.createMessage(`Successfully allowed multiple voting.`)
		} else {
			db.set(`multiplevoting_${message.guildID}`, 'true')
			message.channel.createMessage(`Successfully denied multiple voting.`)
		}
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`Bu özelliği açmadan önce \`${prefix}oylamaizni\` komuduyla önerilerdeki oylamayı açmalısın.`)
		if (db.has(`multiplevoting_${message.guildID}`)) {
			db.delete(`multiplevoting_${message.guildID}`)
			message.channel.createMessage(`Başarıyla önerilerde birden fazla tepkiye oy verebilme açıldı.`)
		} else {
			db.set(`multiplevoting_${message.guildID}`, 'true')
			message.channel.createMessage(`Başarıyla önerilerde birden fazla tepkiye oy verebilme kapatıldı.`)
		}
	}
}

module.exports.help = {
	name: "multiplevoting",
	nametr: "çokluoylama",
	aliase: [ "çokluoylama", "çokluoy" ],
	descriptionen: "Sets the users can vote to multiple reactions. (default: true)",
	descriptiontr: "Kullanıcıların önerilerde birden fazla tepkiye oy verip veremeyeceğini belirler. (normali: evet)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

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
		if (db.has(`denyeveryonecomment_${message.guildID}`)) {
			db.delete(`denyeveryonecomment_${message.guildID}`)
			message.channel.createMessage(`Hereafter everyone can comment to suggestions.`)
		} else {
			db.set(`denyeveryonecomment_${message.guildID}`, 'true')
			message.channel.createMessage(`Hereafter only staffs can comment to suggestions.`)
		}
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		if (db.has(`denyeveryonecomment_${message.guildID}`)) {
			db.delete(`denyeveryonecomment_${message.guildID}`)
			message.channel.createMessage(`Artık, herkes önerilere yorum yapabilecek.`)
		} else {
			db.set(`denyeveryonecomment_${message.guildID}`, 'true')
			message.channel.createMessage(`Artık, sadece yetkililer önerilere yorum yapabilecek.`)
		}
	}
}

module.exports.help = {
	name: "denyeveryonecomment",
	nametr: "herkesyorumyapamaz",
	aliase: [ "herkesyorumyapamaz", "herkesyorumyapabilir", "herkesyorum" ],
	descriptionen: "Sets everyone can comment to suggestions or only staffs can.",
	descriptiontr: "Herkesin yorum yapabilmesini veya yalnızca yetkililerin yorum yapabilmesini seçer.",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

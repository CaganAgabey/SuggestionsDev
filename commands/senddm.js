const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		if (db.has(`denydm_${message.author.id}`)) {
			db.delete(`denydm_${message.author.id}`)
			message.channel.createMessage(`Hereafter you will get a DM when an action taken on your suggestions.`)
		} else {
			db.set(`denydm_${message.author.id}`, 'true')
			message.channel.createMessage(`Hereafter you won't get a DM when an action taken on your suggestions.`)
		}
	}
	
	if (dil == "turkish") {
		
		if (db.has(`denydm_${message.author.id}`)) {
			db.delete(`denydm_${message.author.id}`)
			message.channel.createMessage(`Artık önerilerinizde bir işlem olduğunda DM alacaksınız.`)
		} else {
			db.set(`denydm_${message.author.id}`, 'true')
			message.channel.createMessage(`Artık önerilerinizde bir işlem olduğunda DM almayacaksınız.`)
		}
	}
}

module.exports.help = {
	name: "senddm",
	nametr: "dmgönder",
	aliase: [ "dmgönder", "dmgönderme" ],
	descriptionen: "Sets you will get a DM when an action taken on your suggestions or not. (default: true)",
	descriptiontr: "Önerilerinizde bir işlem yapıldığında DM alıp almayacağınızı seçer. (normali: evet)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'public'
}

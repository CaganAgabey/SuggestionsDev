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
		
		
		const dill = args[0]
		if (!dill) return message.channel.createMessage(`You must provide a language. (english, turkish)`)
		if (dill == "english") {
			return message.channel.createMessage(`Language is already English!`)
		}
		if (dill == "turkish") {
			db.set(`dil_${message.guildID}`, 'turkish')
			return message.channel.createMessage(`Başarıyla bot dili bu sunucuda Türkçe yapıldı!`)
		}
		if (dill != "english" && dill != "turkish") return message.channel.createMessage(`Possible languages: \`english\` \`turkish\``)
	}
	
	if (dil == "turkish") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		
		const dill = args[0]
		if (!dill) return message.channel.createMessage(`Bir dil belirtmelisin. (english, turkish)`)
		if (dill == "english") {
			db.delete(`dil_${message.guildID}`)
			return message.channel.createMessage(`Successfully setted the language English!`)
		}
		if (dill == "turkish") {
			return message.channel.createMessage(`Bot dili zaten Türkçe!`)
		}
		if (dill != "english" && dill != "turkish") return message.channel.createMessage(`Mümkün diller: \`english\` \`turkish\``)
	}
}

module.exports.help = {
	name: "language",
	nametr: "dil",
	aliase: [ "lang", "dil" ],
	descriptionen: "Sets the bot language in this guild.",
	descriptiontr: "Botun bu sunucudaki dilini seçer.",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

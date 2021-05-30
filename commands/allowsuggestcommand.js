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
		if (db.has(`denysuggestcommand_${message.guildID}`)) {
			db.delete(`denysuggestcommand_${message.guildID}`)
			message.channel.createMessage(`Hereafter your members can use suggest command.`)
		} else {
			if (db.has(`disablemessagechannel_${message.guildID}`)) return message.channel.createMessage(`You must allow messaging to suggestion channel for sending suggestion with \`${prefix}messagingsuggestionchannel\` command before this.`)
			db.set(`denysuggestcommand_${message.guildID}`, 'true')
			message.channel.createMessage(`Hereafter your members can't use suggest command.`)
		}
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		if (db.has(`denysuggestcommand_${message.guildID}`)) {
			db.delete(`denysuggestcommand_${message.guildID}`)
			message.channel.createMessage(`Artık üyeleriniz öner komudunu kullanabilecek.`)
		} else {
			if (db.has(`disablemessagechannel_${message.guildID}`)) return message.channel.createMessage(`Bunu yapmadan önce öneri kanalına mesaj atarak öneri gönderilmesine \`${prefix}önerikanalınamesajgönderme\` ile izin vermeniz gerekiyor.`)
			db.set(`denysuggestcommand_${message.guildID}`, 'true')
			message.channel.createMessage(`Artık üyeleriniz öner komudunu kullanamayacak.`)
		}
	}
}

module.exports.help = {
	name: "allowsuggestcommand",
	nametr: "önerikomudunukullanma",
	aliase: [ "önerikomudunukullanma", "önerkomudunukullanma", "önerikomudunukullan", "önerkomudunukullan", "suggestcommand" ],
	descriptionen: "Sets your members can use suggest command without messaging to suggestion channel or not.",
	descriptiontr: "Üyelerinizin öneri kanalına mesaj atmadan öner komuduyla öneri atıp atamayacağını seçer.",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

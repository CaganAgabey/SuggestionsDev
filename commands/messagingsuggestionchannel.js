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
		if (db.has(`disablemessagechannel_${message.guildID}`)) {
			db.delete(`disablemessagechannel_${message.guildID}`)
			message.channel.createMessage(`Hereafter your members can send suggestions with sending message to suggestion channel.`)
		} else {
			if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`You must allow using suggest command with \`${prefix}disablesuggestcommand\` command before this.`)
			db.set(`disablemessagechannel_${message.guildID}`, 'true')
			message.channel.createMessage(`Hereafter your members can't send suggestions with sending message to suggestion channel.`)
		}
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		if (db.has(`disablemessagechannel_${message.guildID}`)) {
			db.delete(`disablemessagechannel_${message.guildID}`)
			message.channel.createMessage(`Artık üyeleriniz öneri kanalına mesaj göndererek öneri gönderebilecek.`)
		} else {
			if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`Bunu yapmadan önce öner komudunun kullanımına \`${prefix}önerikomudunukullanma\` ile izin vermeniz gerekiyor.`)
			db.set(`disablemessagechannel_${message.guildID}`, 'true')
			message.channel.createMessage(`Artık üyeleriniz öneri kanalına mesaj göndererek öneri gönderemeyecek.`)
		}
	}
}

module.exports.help = {
	name: "messagingsuggestionchannel",
	nametr: "önerikanalınamesajgönderme",
	aliase: [ "önerikanalınamesajgönderme", "önerikanalınamesajgönder", "sendmessagetosuggestionchannel" ],
	descriptionen: "Sets your members can send suggestion with messaging to suggestion channel or not. (default: true)",
	descriptiontr: "Üyelerinizin öneri kanalına mesaj atarak öneri gönderebilmesini veya gönderememesini seçer. (normali: evet)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

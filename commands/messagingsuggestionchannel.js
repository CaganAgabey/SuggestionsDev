const Eris = require("eris");
const arkdb = require('ark.db');
const db = new arkdb.Database()

module.exports.run = async (client, message, args) => {
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
	
	if (dil == "english") {
		if (db.has(`disablemessagechannel_${message.guildID}`)) {
			db.delete(`disablemessagechannel_${message.guildID}`)
			message.channel.createMessage(`Hereafter your members can send suggestions with sending message to suggestion channel.`)
		} else {
			if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`You must allow using suggest command with \`${prefix}disablesuggestcommand\` command before this.`)
			db.set(`disablemessagechannel_${message.author.id}`, 'true')
			message.channel.createMessage(`Hereafter your members can't send suggestions with sending message to suggestion channel.`)
		}
	}
	
	if (dil == "turkish") {
		if (db.has(`disablemessagechannel_${message.author.id}`)) {
			db.delete(`disablemessagechannel_${message.author.id}`)
			message.channel.createMessage(`Artık üyeleriniz öneri kanalına mesaj göndererek öneri gönderebilecek.`)
		} else {
			if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`Bunu yapmadan önce öner komudunun kullanımına \`${prefix}önerikomudunukullanma\` ile izin vermeniz gerekiyor.`)
			db.set(`disablemessagechannel_${message.author.id}`, 'true')
			message.channel.createMessage(`Artık üyeleriniz öneri kanalına mesaj göndererek öneri gönderemeyecek.`)
		}
	}
}

module.exports.help = {
	name: "messagingsuggestionchannel",
	nametr: "önerikanalınamesajgönderme",
	aliase: [ "önerikanalınamesajgönderme", "önerikanalınamesajgönder" ],
	descriptionen: "Sets your members can send suggestion with messaging to suggestion channel or not. (default: true)",
	descriptiontr: "Üyelerinizin öneri kanalına mesaj atarak öneri gönderebilmesini veya gönderememesini seçer. (normali: evet)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

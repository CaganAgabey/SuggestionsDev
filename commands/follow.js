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
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to follow.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion has deleted!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't follow suggestions in this guild until admins setting a new suggestion channel.`)
		if (db.has(`denydm_${message.author.id}`)) return message.channel.createMessage(`You must allow DMs with \`${prefix}senddm\` before following.`)
		db.push(`suggestion_${message.guildID}_${sugid}.followers`, message.author.id)
		message.channel.createMessage(`Successfully followed this suggestion! You can unfollow it with \`${prefix}unfollow ${sugid}\` command.`)
	}
	
	if (dil == "turkish") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`Takip etmek için bir öneri numarası belirtmelisin.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu numara ile bir öneri bulunamadı.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`Bu öneri silinmiş!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple sunucu yöneticileri yeni bir kanal belirlemeden önerileri takip edemezsin.`)
		if (db.has(`denydm_${message.author.id}`)) return message.channel.createMessage(`Takip etmeden önce \`${prefix}dmgönder\` komuduyla mesaj göndermeye izin vermelisin.`)
		db.push(`suggestion_${message.guildID}_${sugid}.followers`, message.author.id)
		message.channel.createMessage(`Bu öneri başarıyla takip edildi! Dilersen bu öneriyi \`${prefix}unfollow ${sugid}\` komuduyla takipten çıkabilirsin.`)
	}
}

module.exports.help = {
	name: "follow",
	nametr: "takip",
	aliase: [ "takip", "takipet" ],
	descriptionen: "Allows to follow any suggestion to get DM when suggestion has updated.",
	descriptiontr: "Herhangi bir öneride değişiklik olduğunda DM almak için takip etmenize yarar.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'public'
}

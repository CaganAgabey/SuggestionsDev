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
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to unfollow.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion has deleted!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't unfollow suggestions in this guild until admins setting a new suggestion channel.`)
		const array = db.fetch(`suggestion_${message.guildID}_${sugid}.followers`);
		const indexi = array.indexOf(message.author.id);
		if (indexi == -1) return message.channel.createMessage(`You are not following this suggestion.`)
		array.splice(indexi, 1)
		db.set(`suggestion_${message.guildID}_${sugid}.followers`, array)
		message.channel.createMessage(`Successfully unfollowed this suggestion! You can refollow this suggestion with \`${prefix}follow ${sugid}\` command.`)
	}
	
	if (dil == "turkish") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`Takipten çıkmak için bir öneri numarası belirtmelisin.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu numara ile bir öneri bulunamadı.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`Bu öneri silinmiş!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple sunucu yöneticileri yeni bir kanal belirlemeden önerileri takipten çıkamazsın.`)
		const array = db.fetch(`suggestion_${message.guildID}_${sugid}.followers`);
		const indexi = array.indexOf(message.author.id);
		if (indexi == -1) return message.channel.createMessage(`Bu öneriyi zaten takip etmiyorsun.`)
		array.splice(indexi, 1)
		db.set(`suggestion_${message.guildID}_${sugid}.followers`, array)
		message.channel.createMessage(`Bu öneri başarıyla takipten çıkıldı! Dilersen bu öneriyi \`${prefix}takipet ${sugid}\` komuduyla tekrar takip edebilirsin.`)
	}
}

module.exports.help = {
	name: "unfollow",
	nametr: "takiptençık",
	aliase: [ "takiptençık", "takibibırak" ],
	descriptionen: "Allows to unfollow any suggestion to stop getting DM about that suggestion.",
	descriptiontr: " O öneri hakkında DM almamak için herhangi bir öneriyi takipten çıkmanıza izin verir.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'public'
}

const Eris = require("eris");
const arkdb = require('ark.db');
const {sendSuggestion} = require('../functions')

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const guild = client.guilds.get(message.guildID)
	
	if (dil == "english") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't send suggestions in this guild until admins setting a new suggestion channel.`)
		if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`Suggest command disabled in this server, so you must send your suggestion as a plain message to the server's suggestion channel.`)
		if (!args[0]) return message.channel.createMessage(`You must provide a suggestion.`)
		if (message.channel.id == db.fetch(`suggestionchannel_${guild.id}`)) message.delete()
		sendSuggestion(message, guild, client, dil)
		message.channel.createMessage({content: `Got it!`, messageReference: {channelID: message.channel.id, messageID: message.id, guildID: message.guildID, failIfNotExists: false}})
	}
	
	if (dil == "turkish") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bundan dolayı yöneticiler yeni bir öneri kanalı belirlemeden öneri gönderemezsin.`)
		if (db.has(`denysuggestcommand_${message.guildID}`)) return message.channel.createMessage(`Bu sunucuda önerme komudu kullanıma engellenmiş, önerini sunucunun öneri kanalına düz mesaj olarak yazmalısın.`)
		if (!args[0]) return message.channel.createMessage(`Bir öneri belirtmelisin.`)
		if (message.channel.id == db.fetch(`suggestionchannel_${guild.id}`)) message.delete()
		sendSuggestion(message, guild, client, dil)
		message.channel.createMessage({content: `Anlaşıldı!`, messageReference: {channelID: message.channel.id, messageID: message.id, guildID: message.guildID, failIfNotExists: false}})
	}
}

module.exports.help = {
	name: "suggest",
	nametr: "öner",
	aliase: [ "suggestion", "öner", "öneri", "öneriver", "givesuggestion", "suggestiongive" ],
	descriptionen: "Send a suggestion.",
	descriptiontr: "Öneri gönderme.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'owner'
}

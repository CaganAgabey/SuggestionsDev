const Eris = require("eris");
const arkdb = require('ark.db');
const {deleteSuggestion} = require('../functions')

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have MANAGE MESSAGES permission to use this!`)
		if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have staff role to use this command!`)
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to manage.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't handle suggestions in this guild until setting a new suggestion channel.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`You must verify or delete this suggestion in review channel using emojis before using this command.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion was deleted!`)
		deleteSuggestion(message, client.guilds.get(message.guildID), sugid, client, dil, args, false, db.fetch(`suggestion_${message.guildID}_${sugid}.channel`))
	}
	if (dil == "turkish") {
		
		if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucu bir yetkili rolü seçmedi ve bu komudu kullanmak için Mesajları Yönetme yetkisine sahip olmalısın!`)
		if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için yetkili rolüne sahip değilsin!`)
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`Yönetmek için bir öneri numarası belirtmelisin.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu numara ile herhangi bir öneri bulunamadı.`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple yeni bir öneri kanalı seçmeden önerileri yönetemezsin.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`Bu komudu kullanmadan önce öneriyi doğrulama kanalında emojiler ile doğrulamalısın veya silmelisin.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`Bu öneri silinmiş!`)
		deleteSuggestion(message, client.guilds.get(message.guildID), sugid, client, dil, args, false, db.fetch(`suggestion_${message.guildID}_${sugid}.channel`))
	}
}

module.exports.help = {
	name: "delete",
	nametr: "sil",
	aliase: [ "deletesuggestion", "önerisil", "sil" ],
	descriptionen: "Allows to delete any suggestion.",
	descriptiontr: "Herhangi bir öneriyi silmenize yarar.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'staff'
}

const Eris = require("eris");
const arkdb = require('ark.db');
const { addComment }  = require('../functions')

module.exports.run = async (client, message, args) => {
	const db = client.db
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const guild = client.guilds.get(message.guildID)
	
	if (dil == "english") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't comment to suggestions in this guild until admins setting a new suggestion channel.`)
		if (db.has(`denyeveryonecomment_${message.guildID}`)) {
			if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Only staffs can comment in this guild.`)
			if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Only staffs can comment in this guild.`)
		}
		const sugid = args[0]
		if (!args[0]) return message.channel.createMessage(`You must provide a suggestion number to comment.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`You must verify or delete this suggestion in review channel before using this command.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`This suggestion was deleted!`)
		if (!args[1]) return message.channel.createMessage(`You must provide a comment.`)
		addComment(message, guild, sugid, args.slice(1).join(' '), message.author.id, client, dil, true)
	}
	
	if (dil == "turkish") {
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bundan dolayı yöneticiler yeni bir öneri kanalı belirlemeden önerilere yorum yapamazsın.`)
		if (db.has(`denyeveryonecomment_${message.guildID}`)) {
			if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucuda yalnızca yetkililer yorum yapabilir.`)
			if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu sunucuda yalnızca yetkililer yorum yapabilir.`)
		}
		const sugid = args[0]
		if (!args[0]) return message.channel.createMessage(`Yorum yapmak için bir öneri numarası belirtmelisin.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu öneri numarasıyla herhangi bir öneri bulunamadı.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "awaiting approval") return message.channel.createMessage(`Bu komudu kullanmadan önce öneriyi doğrulama kanalında doğrulamalı veya silmelisin.`)
		if (db.fetch(`suggestion_${message.guildID}_${sugid}.status`) == "deleted") return message.channel.createMessage(`Bu öneri silinmiş!`)
		if (!args[1]) return message.channel.createMessage(`Bir yorum belirtmelisin.`)
		addComment(message, guild, sugid, args.slice(1).join(' '), message.author.id, client, dil, true)
	}
}

module.exports.help = {
	name: "comment",
	nametr: "yorumyap",
	aliase: [ "yorumyap", "yorum" ],
	descriptionen: "Comment to a suggestion.",
	descriptiontr: "Bir öneriye yorum yapma.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'public'
}

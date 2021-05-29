﻿const Eris = require("eris");
const arkdb = require('ark.db');
const db = new arkdb.Database()

module.exports.run = async (client, message, args) => {
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || "."
		let helpcommands = client.commands.filter(prop => prop.help.category == "admin" && prop.help.name != "help")
		if (helpcommands.length == 0) return message.channel.createMessage(`There's not any commands in this category.`)
		let helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptionen + `\n`).join('')
		message.channel.createMessage({
			embed: {
				title: '__**Admin Commands**__',
				description: helpcommandsmap,
				color: colorToSignedBit("#2F3136"),
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		})
	}
	
	if (dil == "turkish") {
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || "."
		let helpcommands = client.commands.filter(prop => prop.help.category == "admin" && prop.help.name != "help")
		if (helpcommands.length == 0) return message.channel.createMessage(`Bu kategoride hiç komut yok.`)
		let helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.nametr + '** ' + p.help.descriptiontr + `\n`).join('')
		if (!db.has(`botcekilis`)) message.channel.createMessage({
			embed: {
				title: '__**Yönetici Komutları**__',
				description: helpcommandsmap,
				color: colorToSignedBit("#2F3136"),
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		})
		if (db.has(`botcekilis`)) message.channel.createMessage({
			embed: {
				title: '__**Yönetici Komutları**__',
				description: helpcommandsmap + `\n \n<:rightarrow:709539888411836526> Botta aktif bir çekiliş var!\n**Çekiliş** ${db.fetch(`botcekilis.turkish`)}\n**Katılmak için** ${prefix}çekiliş`,
				color: colorToSignedBit("#2F3136"),
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		})
	}
}

module.exports.help = {
	name: "admin",
	nametr: "yönetici",
	aliase: [ "yönetici", "adminhelp", "yöneticiyardım" ],
	descriptionen: "Shows the commands that only admins (administrator permission) can use.",
	descriptiontr: "Sadece sunucu yöneticilerinin kullanabileceği komutları gösterir.",
	usageen: "admin",
	usagetr: "yetkili",
	category: 'help'
}

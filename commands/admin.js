const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		const helpcommands = client.commands.filter(prop => prop.help.category == "admin" && prop.help.name != "help");
		if (helpcommands.length == 0) return message.channel.createMessage(`There's not any commands in this category.`)
		const helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptionen + `\n`).join('');
		if (helpcommandsmap.length > 2048) {
			const helpcommandsmap2 = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptionen.length > 50 ? p.help.descriptionen.slice(0, 50) + `...` : p.help.descriptionen + `\n`).join('');
			message.channel.createMessage({
				embed: {
					title: '__**Admin Commands**__',
					description: helpcommandsmap.slice(0, 2048),
					color: colorToSignedBit("#2F3136"),
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})
		} else {
			message.channel.createMessage({
				embed: {
					title: '__**Admin Commands**__',
					description: helpcommandsmap.slice(0, 2048),
					color: colorToSignedBit("#2F3136"),
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})
		}
	}
	
	if (dil == "turkish") {
		
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		const helpcommands = client.commands.filter(prop => prop.help.category == "admin" && prop.help.name != "help");
		if (helpcommands.length == 0) return message.channel.createMessage(`Bu kategoride komut yok.`)
		const helpcommandsmap = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptiontr + `\n`).join('');
		if (helpcommandsmap.length > 2048) {
			const helpcommandsmap2 = helpcommands.map(p => '<:rightarrow:709539888411836526> **' + prefix + p.help.name + '** ' + p.help.descriptiontr.length > 50 ? p.help.descriptiontr.slice(0, 50) + `...` : p.help.descriptiontr + `\n`).join('');
			message.channel.createMessage({
				embed: {
					title: '__**Yönetici Komutları**__',
					description: helpcommandsmap.slice(0, 2048),
					color: colorToSignedBit("#2F3136"),
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})
		} else {
			message.channel.createMessage({
				embed: {
					title: '__**Yönetici Komutları**__',
					description: helpcommandsmap.slice(0, 2048),
					color: colorToSignedBit("#2F3136"),
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})
		}
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

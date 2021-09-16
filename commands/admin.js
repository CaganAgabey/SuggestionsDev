const Eris = require("eris");
const arkdb = require("ark.db");

module.exports.run = async (client, message, args) => {
	const db = client.db
	
	const colorToSignedBit = s => {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const lang = db.fetch(`dil_${message.guildID}`) || "english";
	const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
	const helpcommands = client.commands.filter(prop => prop.help.category == "admin" && prop.help.name != "help");
	if (helpcommands.length == 0) return message.channel.createMessage(lang == "english" ? "There's not any commands in this category." : "Bu kategoride komut yok.")
	const helpcommandsmap = helpcommands.map(p => "<:rightarrow:709539888411836526> **" + prefix + (lang == "english" ? p.help.name : p.help.nametr) + "** " + (lang == "english" ? p.help.descriptionen : p.help.descriptiontr) + `\n`).join('');
	if (helpcommandsmap.length > 2000) {
		const helpcommandsmap2 = helpcommands.map(p => "<:rightarrow:709539888411836526> **" + prefix + (lang == "english" ? p.help.name : p.help.nametr) + '** ' + (lang == "english" ? (p.help.descriptionen.length > 50 ? p.help.descriptionen.slice(0, 50) + `...` : p.help.descriptionen) : (p.help.descriptiontr.length > 50 ? p.help.descriptiontr.slice(0, 50) + `...` : p.help.descriptiontr)) + `\n`).join('');
		message.channel.createMessage({
			embed: {
				title: lang == "english" ? "__**Admin Commands**__" : "__**Yönetici Komutları**__",
				description: helpcommandsmap2.slice(0, 2048),
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
				title: lang == "english" ? "__**Admin Commands**__" : "__**Yönetici Komutları**__",
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

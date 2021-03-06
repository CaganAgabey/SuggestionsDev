const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`This server didn't set a staff role and you must have MANAGE MESSAGES permission to use this!`)
		if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`You don't have staff role to use this command!`)
		
		if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`This guild doesn't have any review channel.`)
		
		message.channel.createMessage(`Preparing...`).then(async msg => {
			const map = new Map(Object.entries(db.all()));
			for (const i of map.keys()) {
			    if (!i.startsWith(`suggestion_${message.guildID}_`)) map.delete(i)
            }
            for (const i of map.keys()) {
                if (db.fetch(i).status != "awaiting approval") map.delete(i)
            }
			if (map.length == 0) {
				msg.edit(`There's not any suggestion that awaiting review.`)
			} else {
				let map = '';
				for (const i of map.keys().slice(0, 15)) {
					if (db.fetch(`${i}.suggestion`).length > 60) map += `<:rightarrow:709539888411836526> **Suggestion #${i.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i}.suggestion`)}\n`
					else map += `<:rightarrow:709539888411836526> **Suggestion #${i.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i}.suggestion`).substr(0, 60)}...\n`
				}
				msg.edit({content: 'Suggestions that awaiting review',
					embed: {
						title: `__**Suggestions that awaiting review**__`,
						description: map,
						color: colorToSignedBit("#2F3136"),
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})
			}
		})
	}
	
	if (dil == "turkish") {
		
		if (!db.has(`staffrole_${message.guildID}`) && !message.member.permissions.has('manageMessages')) return message.channel.createMessage(`Bu sunucu bir yetkili rol?? se??memi?? ve bu komudu kullanmak i??in Mesajlar?? Y??netme yetkisine sahip olman gerek!`)
		if (db.has(`staffrole_${message.guildID}`) && !message.member.roles.some(r => db.fetch(`staffrole_${message.guildID}`).includes(r)) && !message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak i??in yetkili rol??ne sahip de??ilsin!`)
		
		if (!db.has(`reviewchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun bir do??rulama kanal?? yok.`)
		
		message.channel.createMessage(`Haz??rlan??yor...`).then(async msg => {
            const map = new Map(Object.entries(db.all()));
            for (const i of map.keys()) {
                if (!i.startsWith(`suggestion_${message.guildID}_`)) map.delete(i)
            }
            for (const i of map.keys()) {
                if (db.fetch(i).status != "awaiting approval") map.delete(i)
            }
			if (map.length == 0) {
				msg.edit(`Do??rulama bekleyen herhangi bir ??neri yok.`)
			} else {
				let map = '';
                for (const i of map.keys().slice(0, 15)) {
                    if (db.fetch(`${i}.suggestion`).length > 60) map += `<:rightarrow:709539888411836526> **??neri #${i.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i}.suggestion`)}\n`
                    else map += `<:rightarrow:709539888411836526> **??neri #${i.replace(`suggestion_${message.guildID}_`, '')}** ${db.fetch(`${i}.suggestion`).substr(0, 60)}...\n`
                }
				msg.edit({content: 'Do??rulama bekleyen ??neriler',
					embed: {
						title: `__**Do??rulama bekleyen ??neriler**__`,
						description: map,
						color: colorToSignedBit("#2F3136"),
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})
			}
		})
	}
}

module.exports.help = {
	name: "queue",
	nametr: "s??ra",
	aliase: [ "reviewqueue", "do??rulamas??ra", "do??rulamas??ras??", "s??ra" ],
	descriptionen: "Shows the suggestions that awaiting review.",
	descriptiontr: "Do??rulama bekleyen ??nerileri g??sterir.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'staff'
}

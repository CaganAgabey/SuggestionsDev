const arkdb = require('ark.db')
const db = new arkdb.Database()
const Eris = require("eris");

function colorToSignedBit(s) {
	return (parseInt(s.substr(1), 16) << 8) / 256;
}

module.exports = {
	manageSuggestion: async (message, guild, sugid, type, client, language, args) => {
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`);
		const author = client.users.get(data.author)
		let color = colorToSignedBit("#00FF00")
		if (type == "Approved") color = colorToSignedBit("#00FF00")
		if (type == "Denied") color = 16711680
		if (type == "Invalid") color = colorToSignedBit("#000000")
		if (type == "Maybe") color = 16776960
		let displaytype = type.toLowerCase()
		if (language == "turkish") {
			displaytype = displaytype
			.replace('approved', 'onaylanmış')
			.replace('denied', 'reddedilmiş')
			.replace('invalid', 'geçersiz')
			.replace('maybe', 'düşünülecek')
		}
		displaytype = displaytype.replace('maybe', 'potential')
		guild.channels.get(data.channel).getMessage(data.msgid).then(async msg => {
			if (!db.has(`${type.toLowerCase()}channel_${guild.id}`) || db.fetch(`${type.toLowerCase()}channel_${guild.id}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`${type.toLowerCase()}channel_${guild.id}`))) {
				msg.edit({
					embed: {
						title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
						description: data.suggestion,
						color,
						author: {
							name: language == "english" ? `${displaytype} suggestion - ${author.username}#${author.discriminator}` : `${displaytype} öneri - ${author.username}#${author.discriminator}`,
							icon_url: author.avatarURL || author.defaultAvatarURL
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						fields: args[1] ? [ {name: language == "english" ? `${message.author.username}'s comment` : `${message.author.username} adlı yetkilinin yorumu`, value: args.slice(1).join(' ')} ] : [],
						image: data.attachment ? {url: data.attachment} : null
					}
				})
				db.set(`suggestion_${guild.id}_${sugid}.channel`, msg.channel.id)
				msg.removeReactions()
			}
			if (db.has(`${type.toLowerCase()}channel_${guild.id}`) && db.fetch(`${type.toLowerCase()}channel_${guild.id}`) != msg.channel.id && msg.channel.guild.channels.has(db.fetch(`${type.toLowerCase()}channel_${guild.id}`))) {
				msg.delete()
				msg.channel.guild.channels.get(db.fetch(`${type.toLowerCase()}channel_${guild.id}`)).createMessage({
					embed: {
						title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
						description: data.suggestion,
						color,
						author: {
							name: language == "english" ? `${displaytype} suggestion - ${author.username}#${author.discriminator}` : `${displaytype} öneri - ${author.username}#${author.discriminator}`,
							icon_url: author.avatarURL || author.defaultAvatarURL
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						fields: args[1] ? [ {name: language == "english" ? `${message.author.username}'s comment` : `${message.author.username} adlı yetkilinin yorumu`, value: args.slice(1).join(' ')} ] : [],
						image: data.attachment ? {url: data.attachment} : null
					}
				}).then(async msgg => {
					db.set(`suggestion_${guild.id}_${sugid}.channel`, msgg.channel.id)
					db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
				})
			}
			db.set(`suggestion_${guild.id}_${sugid}.status`, type.toLowerCase())
			if (!db.has(`denydm_${author.id}`)) client.users.get(author.id).getDMChannel().then(async ch => ch.createMessage({
				embed: {
					title: `Your suggestion has ${type.toLowerCase()}!`,
					description: `Your suggestion that in \`${guild.name}\` has ${type.toLowerCase()}.\n**Suggestion number:** ${sugid}${args[1] ? `\n**Comment:** ${args.slice(1).join(' ')}` : ``}\n**Suggestion:** \`\`\`${data.suggestion}\`\`\``,
					color
				}
			})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			if (message != null) message.addReaction(`✅`)
		})
	},
	deleteSuggestion: async (message, guild, sugid, client, language, args, msgdeleted) => {
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`);
		const author = client.users.get(data.author)
		if (msgdeleted == false) {
			guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).getMessage(data.msgid).then(async msg => msg.delete())
		}
		if (message != null) message.addReaction(`✅`)
		db.set(`suggestion_${guild.id}_${sugid}.status`, 'deleted')
		if (!db.has(`denydm_${author.id}`)) author.getDMChannel().then(async ch => ch.createMessage({
			embed: {
				title: 'Your suggestion has deleted!',
				description: `Your suggestion that in \`${guild.name}\` has deleted.\n**Suggestion number:** ${sugid}${args[1] ? `\n**Comment:** ${args.slice(1).join(' ')}` : ``}\n**Suggestion:** \`\`\`${data.suggestion}\`\`\``,
				color: colorToSignedBit("#000000")
			}
		})).catch(async e => console.log(`Someone's dm is closed (${e})`))
	}
}

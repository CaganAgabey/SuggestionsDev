const arkdb = require('ark.db')
const db = new arkdb.Database()
const Eris = require("eris");
const awaitingsuggestions = new Map()

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
							name: language == "english" ? `${displaytype.replace(displaytype.charAt(0), displaytype.charAt(0).toUpperCase)} suggestion - ${author.username}#${author.discriminator}` : `${displaytype.replace(displaytype.charAt(0), displaytype.charAt(0).toUpperCase)} öneri - ${author.username}#${author.discriminator}`,
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
							name: language == "english" ? `${displaytype.replace(displaytype.charAt(0), displaytype.charAt(0).toUpperCase)} suggestion - ${author.username}#${author.discriminator}` : `${displaytype.replace(displaytype.charAt(0), displaytype.charAt(0).toUpperCase)} öneri - ${author.username}#${author.discriminator}`,
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
			for (const id of data.followers) {
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: `Followed suggestion has ${type.toLowerCase()}!`,
						description: `Followed suggestion that in \`${guild.name}\` has ${type.toLowerCase()}.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}${args[1] ? `\n**Staff comment:** ${args.slice(1).join(' ')}` : ``}\n**Suggestion:** \`\`\`${data.suggestion}\`\`\``,
						color,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
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
		for (const id of data.followers) {
			if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
				embed: {
					title: 'Followed suggestion has deleted!',
					description: `Followed suggestion that in \`${guild.name}\` has deleted.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}${args[1] ? `\n**Staff comment:** ${args.slice(1).join(' ')}` : ``}\n**Suggestion:** \`\`\`${data.suggestion}\`\`\``,
					color: colorToSignedBit("#000000"),
					footer: {
						text: `You can disable these DMs with using .senddm command in a guild.`,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})).catch(async e => console.log(`Someone's dm is closed (${e})`))
		}
	},
	
	sendSuggestion: async (message, guild, client, language) => {
		const guildme = client.guilds.get(message.guildID).members.get(client.user.id)
		if (!guildme.permissions.has('sendMessages')) return message.author.getDMChannel().then(ch => ch.createMessage(`That bot doesn't have send messages permission in this guild.`))
		if (!guildme.permissions.has('manageMessages') || !guildme.permissions.has('embedLinks') || !guildme.permissions.has('addReactions')) return message.channel.createMessage(`The bot should have Manage Messages, Embed Links and Add Reactions permissions in order to work properly.`)
		let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
		if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
		awaitingsuggestions.set(message.guildID, oldsugssize + 1)
		let approveemoji = `👍`
		if (db.has(`customapprove_${message.guildID}`)) {
			if (/\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
			else if (guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = db.fetch(`customapprove_${message.guildID}`)
		}
		let denyemoji = `👎`
		if (db.has(`customdeny_${message.guildID}`)) {
			if (/\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) approveemoji = db.fetch(`customdeny_${message.guildID}`)
			else if (guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = db.fetch(`customdeny_${message.guildID}`)
		}
		if (db.has(`reviewchannel_${message.guildID}`) && guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) {
			db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
				status: 'awaiting approval',
				author: message.author.id,
				suggestion: message.content,
				timestamp: Date.now(),
				channel: db.fetch(`reviewchannel_${message.guildID}`),
				guild: message.guildID,
				approveemoji,
				denyemoji,
				followers: [ message.author.id ]
			})
			message.channel.createMessage( language == "english" ? `Successfully sent the suggestion to approval queue! When your suggestion get verified, it will show up here.` : `Öneri başarıyla doğrulama sırasına gönderildi! Önerin doğrulandığında, bu kanalda gözükecektir.`).then(async msg =>
				guild.channels.get(db.fetch(`reviewchannel_${message.guildID}`)).createMessage({
					embed: {
						title: `Suggestion #${oldsugssize + 1}`,
						description: message.content,
						color: 4934475,
						author: {
							name: `${language == "english" ? `Awaiting suggestion` : `Bekleyen öneri`} - ${message.author.username}#${message.author.discriminator}`,
							icon_url: message.author.avatarURL || message.author.defaultAvatarURL
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				}).then(async msgg => {
					db.set(`suggestion_${message.guildID}_${oldsugssize + 1}.msgid`, msgg.id)
					msgg.addReaction(`✅`)
					await sleep(75)
					msgg.addReaction(`❌`)
					await sleep(9000)
					msg.delete()
				}))
		} else {
			message.channel.createMessage({
				embed: {
					title: language == "english" ? `Suggestion #${oldsugssize + 1}` : `Öneri #${oldsugssize + 1}`,
					description: message.content,
					color: colorToSignedBit("#0FF"),
					author: {
						name: `${language == "english" ? `New suggestion` : `Yeni öneri`} - ${message.author.username}#${message.author.discriminator}`,
						icon_url: message.author.avatarURL || message.author.defaultAvatarURL
					},
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			}).then(async msg => {
				db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
					status: 'new',
					msgid: msg.id,
					author: message.author.id,
					suggestion: message.content,
					timestamp: Date.now(),
					channel: db.fetch(`suggestionchannel_${guild.id}`),
					guild: message.guildID,
					approveemoji,
					denyemoji,
					followers: [ message.author.id ]
				})
				if (!db.has(`denyvoting_${message.guildID}`)) {
					msg.addReaction(approveemoji)
					await sleep(75)
					msg.addReaction(denyemoji)
				}
			})
		}
	},
	
	verifySuggestion: async (message, guild, client, language) => {
		const sugid = Number(message.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', ''))
		const author = client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`))
		const approveemoji = db.fetch(`suggestion_${guild.id}_${sugid}.approveemoji`);
		const denyemoji = db.fetch(`suggestion_${guild.id}_${sugid}.denyemoji`);
		guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).createMessage({
			embed: {
				title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
				description: db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`),
				color: colorToSignedBit("#0FF"),
				author: {
					name: `${language == "english" ? `New suggestion` : `Yeni öneri`} - ${author.username}#${author.discriminator}`,
					icon_url: author.avatarURL || author.defaultAvatarURL
				},
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		}).then(async msgg => {
			db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
			db.set(`suggestion_${guild.id}_${sugid}.status`, 'new')
			if (!db.has(`denyvoting_${guild.id}`)) {
				msgg.addReaction(approveemoji)
				msgg.addReaction(denyemoji)
			}
			message.delete()
			for (const id of db.fetch(`suggestion_${guild.id}_${sugid}.followers`)) {
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'Followed suggestion has verified!',
						description: `Followed suggestion that in \`${guild.name}\` has verified. It will be shown in suggestions channel now.\n**Suggestion number: \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				}))
			}
		})
	},
	
	attachImage: async (message, guild, sugid, image, client, language) => {
		const author = client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`))
		guild.channels.get(db.fetch(`suggestion_${guild.id}_${sugid}.channel`)).getMessage(db.fetch(`suggestion_${guild.id}_${sugid}.msgid`)).then(async msg => {
			msg.edit({
				embed: {
					title: msg.embeds[0].title,
					description: msg.embeds[0].description,
					color: msg.embeds[0].color,
					author: msg.embeds[0].author,
					footer: msg.embeds[0].footer,
					fields: msg.embeds[0].fields,
					image: {url: typeof image == "string" ? image : image.url}
				}
			})
			db.set(`suggestion_${guild.id}_${sugid}.attachment`, typeof image == "string" ? image : image.url)
			if (message != null) message.addReaction(`✅`)
			for (const id of db.fetch(`suggestion_${guild.id}_${sugid}.followers`)) {
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'An image attached to a followed suggestion!',
						description: `An image attached to followed suggestion that in \`${guild.name}\`.\n**Suggestion number: \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						image: {url: typeof image == "string" ? image : image.url}
					}
				}))
			}
		})
	}
}

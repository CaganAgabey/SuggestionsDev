const arkdb = require('ark.db')
const Eris = require("eris");
const awaitingsuggestions = new Map()

function colorToSignedBit(s) {
	return (parseInt(s.substr(1), 16) << 8) / 256;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function loadComments(guild, sugid, client, language) {
	const db = client.db
	const fields = []
	const array = db.fetch(`suggestion_${guild.id}_${sugid}.comments`)
	array.sort((a, b) => a.commentid - b.commentid)
	for (const i of array) {
		guild.fetchMembers({userIDs: [ i.author ]})
		fields.push({
			name: language == "english" ? `Comment #${i.commentid} - ${client.users.get(i.author).username}#${client.users.get(i.author).discriminator}` : `Yorum #${i.commentid} - ${client.users.get(i.author).username}#${client.users.get(i.author).discriminator}`,
			value: i.comment
		})
	}
	return fields
}

async function addComment(message, guild, sugid, comment, commenter, client, language, senddm, reloadmessage) {
	const db = client.db
	const data = db.fetch(`suggestion_${guild.id}_${sugid}`)
	if (data.comments.length >= 10) return;
	if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
	if (!client.users.has(commenter)) client.guilds.get(guild.id).fetchMembers({userIDs: [ commenter ]})
	const author = client.users.get(commenter)
	const suggestionauthor = client.users.get(data.author)
	let commentid = 1
	for (const i of db.fetch(`suggestion_${guild.id}_${sugid}.comments`)) {
		if (i.commentid + 1 > commentid) commentid = i.commentid + 1
	}
	db.push(`suggestion_${guild.id}_${sugid}.comments`, {
		author: author.id,
		timestamp: Date.now(),
		commentid,
		comment
	})
	if (reloadmessage != false) {
		guild.channels.get(data.channel).getMessage(data.msgid).then(async msg => {
			msg.edit({
				embed: {
					title: msg.embeds[0].title,
					description: msg.embeds[0].description,
					color: msg.embeds[0].color,
					author: msg.embeds[0].author,
					footer: msg.embeds[0].footer,
					fields: loadComments(guild, sugid, client, language),
					image: msg.embeds[0].image
				}
			})
			if (message != null) message.channel.createMessage({
				content: language == "english" ? `Successfully commented!` : `Başarıyla yorum yapıldı!`,
				messageReference: {
					channelID: message.channel.id,
					messageID: message.id,
					guildID: message.guildID,
					failIfNotExists: false
				}
			})
		})
	}
	if (senddm != false) {
		guild.fetchMembers({userIDs: data.followers})
		for (const id of data.followers) {
			if (!client.users.has(id) || !guild.members.has(id)) return;
			if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
				embed: {
					title: 'A comment made to a followed suggestion!',
					description: `A comment made to followed suggestion that in \`${guild.name}\`.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${suggestionauthor.username}#${suggestionauthor.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\`\n**Comment number:** \`#${commentid}\`\n**Comment author:** ${author.username}#${author.discriminator}\n**Comment:** \`\`\`${comment}\`\`\``,
					color: 6579300,
					footer: {
						text: `You can disable these DMs with using .senddm command in a guild.`,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					}
				}
			})).catch(async e => console.log(`Someone's dm is closed (${e})`))
		}
	}
}

module.exports = {
	addComment: async (message, guild, sugid, comment, commenter, client, language, senddm, reloadmessage) => {
		const db = client.db
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`)
		if (data.comments.length >= 10) return;
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
		if (!client.users.has(commenter)) client.guilds.get(guild.id).fetchMembers({userIDs: [ commenter ]})
		const author = client.users.get(commenter)
		const suggestionauthor = client.users.get(data.author)
		let commentid = 1
		for (const i of db.fetch(`suggestion_${guild.id}_${sugid}.comments`)) {
			if (i.commentid + 1 > commentid) commentid = i.commentid + 1
		}
		db.push(`suggestion_${guild.id}_${sugid}.comments`, {
			author: author.id,
			timestamp: Date.now(),
			commentid,
			comment
		})
		if (reloadmessage != false) {
			guild.channels.get(data.channel).getMessage(data.msgid).then(async msg => {
				msg.edit({
					embed: {
						title: msg.embeds[0].title,
						description: msg.embeds[0].description,
						color: msg.embeds[0].color,
						author: msg.embeds[0].author,
						footer: msg.embeds[0].footer,
						fields: loadComments(guild, sugid, client, language),
						image: msg.embeds[0].image
					}
				})
				if (message != null) message.channel.createMessage({
					content: language == "english" ? `Successfully commented!` : `Başarıyla yorum yapıldı!`,
					messageReference: {
						channelID: message.channel.id,
						messageID: message.id,
						guildID: message.guildID,
						failIfNotExists: false
					}
				})
			})
		}
		if (senddm != false) {
			guild.fetchMembers({userIDs: data.followers})
			for (const id of data.followers) {
				if (!client.users.has(id) || !guild.members.has(id)) return;
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'A comment made to a followed suggestion!',
						description: `A comment made to followed suggestion that in \`${guild.name}\`.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${suggestionauthor.username}#${suggestionauthor.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\`\n**Comment number:** \`#${commentid}\`\n**Comment author:** ${author.username}#${author.discriminator}\n**Comment:** \`\`\`${comment}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
		}
	},
	
	deleteComment: async (message, guild, sugid, commentid, client, language) => {
		const db = client.db
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`)
		let commentdata
		const array = db.fetch(`suggestion_${guild.id}_${sugid}.comments`)
		for (const i of array) {
			if (i.commentid == commentid) {
				commentdata = i
				array.splice(array.indexOf(i), 1)
			}
		}
		db.set(`suggestion_${guild.id}_${sugid}.comments`, array)
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
		if (!client.users.has(commentdata.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ commentdata.author ]})
		const author = client.users.get(commentdata.author)
		const suggestionauthor = client.users.get(data.author)
		guild.channels.get(data.channel).getMessage(data.msgid).then(async msg => {
			msg.edit({
				embed: {
					title: msg.embeds[0].title,
					description: msg.embeds[0].description,
					color: msg.embeds[0].color,
					author: msg.embeds[0].author,
					footer: msg.embeds[0].footer,
					fields: loadComments(guild, sugid, client, language),
					image: msg.embeds[0].image
				}
			})
			if (message != null) message.channel.createMessage({
				content: language == "english" ? `Successfully deleted the comment!` : `Başarıyla yorum silindi!`,
				messageReference: {
					channelID: message.channel.id,
					messageID: message.id,
					guildID: message.guildID,
					failIfNotExists: false
				}
			})
			guild.fetchMembers({userIDs: data.followers})
			for (const id of data.followers) {
				if (!client.users.has(id) || !guild.members.has(id)) return;
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'A comment deleted on a followed suggestion!',
						description: `A comment deleted on followed suggestion that in \`${guild.name}\`.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${suggestionauthor.username}#${suggestionauthor.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\`\n**Deleted comment number:** \`#${commentid}\`\n**Deleted comment author:** ${author.username}#${author.discriminator}\n**Deleted comment:** \`\`\`${commentdata.comment}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
		})
	},
	
	manageSuggestion: async (message, guild, sugid, type, client, language, args) => {
		const db = client.db
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`);
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
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
		displaytype = displaytype.charAt(0).toUpperCase() + displaytype.slice(1)
		guild.channels.get(data.channel).getMessage(data.msgid).then(msg => {
			let comment = 0
			if (args[1]) {
				comment = args.slice(1).join(' ').slice(0, 512)
				addComment(null, guild, sugid, args.slice(1).join(' '), message.author.id, client, language, false, false)
			}
			if (!db.has(`${type.toLowerCase()}channel_${guild.id}`) || db.fetch(`${type.toLowerCase()}channel_${guild.id}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`${type.toLowerCase()}channel_${guild.id}`))) {
				msg.edit({
					embed: {
						title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
						description: data.suggestion,
						color,
						author: {
							name: language == "english" ? `${displaytype} suggestion - ${msg.embeds[0].author.name.split(' - ')[1]}` : `${displaytype} öneri - ${msg.embeds[0].author.name.split(' - ')[1]}`,
							icon_url: msg.embeds[0].author.icon_url
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						fields: loadComments(guild, sugid, client, language),
						image: data.attachment == null ? null : {url: data.attachment}
					}
				})
				msg.removeReactions()
				db.set(`suggestion_${guild.id}_${sugid}.channel`, msg.channel.id)
			}
			if (db.has(`${type.toLowerCase()}channel_${guild.id}`) && db.fetch(`${type.toLowerCase()}channel_${guild.id}`) != msg.channel.id && msg.channel.guild.channels.has(db.fetch(`${type.toLowerCase()}channel_${guild.id}`))) {
				msg.channel.guild.channels.get(db.fetch(`${type.toLowerCase()}channel_${guild.id}`)).createMessage({
					embed: {
						title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
						description: data.suggestion,
						color,
						author: {
							name: language == "english" ? `${displaytype} suggestion - ${msg.embeds[0].author.name.split(' - ')[1]}` : `${displaytype} öneri - ${msg.embeds[0].author.name.split(' - ')[1]}`,
							icon_url: msg.embeds[0].author.icon_url
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						fields: loadComments(guild, sugid, client, language),
						image: data.attachment == null ? null : {url: data.attachment}
					}
				}).then(async msgg => {
					db.set(`suggestion_${guild.id}_${sugid}.channel`, msgg.channel.id)
					db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
					msg.delete()
				})
			}
			db.set(`suggestion_${guild.id}_${sugid}.status`, type.toLowerCase())
			if (message != null) message.channel.createMessage({
				content: language == "english" ? `Successful!` : `Başarılı!`,
				messageReference: {
					channelID: message.channel.id,
					messageID: message.id,
					guildID: message.guildID,
					failIfNotExists: false
				}
			})
			guild.fetchMembers({userIDs: data.followers})
			for (const id of data.followers) {
				if (!client.users.has(id) || !guild.members.has(id)) return;
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: `Followed suggestion has ${type.toLowerCase()}!`,
						description: `Followed suggestion that in \`${guild.name}\` has ${type.toLowerCase()}.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}${(comment == 1 ? `` : `\n**Staff comment:** ${comment}`)}\n**Suggestion:** \`\`\`${data.suggestion}\`\`\``,
						color,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
		})
	},
	
	deleteSuggestion: async (message, guild, sugid, client, language, args, msgdeleted, channelid) => {
		const db = client.db
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`);
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
		const author = client.users.get(data.author)
		if (msgdeleted == false) {
			guild.channels.get(channelid).getMessage(data.msgid).then(msg => msg.delete())
		}
		db.set(`suggestion_${guild.id}_${sugid}.status`, 'deleted')
		db.set(`suggestion_${guild.id}_${sugid}.msgid`, 1)
		db.set(`suggestion_${guild.id}_${sugid}.channel`, 1)
		if (message != null) message.channel.createMessage({
			content: language == "english" ? `Successful!` : `Başarılı!`,
			messageReference: {
				channelID: message.channel.id,
				messageID: message.id,
				guildID: message.guildID,
				failIfNotExists: false
			}
		})
		guild.fetchMembers({userIDs: data.followers})
		for (const id of data.followers) {
			if (!client.users.has(id) || !guild.members.has(id)) return;
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
	
	sendSuggestion: async (message, suggestion, guild, client, language, sendmessage) => {
		const db = client.db
		if (!client.users.has(message.author.id)) client.guilds.get(guild.id).fetchMembers({userIDs: [ message.author.id ]})
		const map = new Map(Object.entries(db.all()));
		let oldsugssize = 0
		for (const i of map.keys()) {
			if (i.startsWith(`suggestion_${guild.id}_`) && Number(i.split('_')[2]) > oldsugssize) oldsugssize = Number(i.split('_')[2])
		}
		if (awaitingsuggestions.has(guild.id) && awaitingsuggestions.get(guild.id) >= oldsugssize) oldsugssize = awaitingsuggestions.get(guild.id);
		awaitingsuggestions.set(guild.id, oldsugssize + 1)
		let approveemoji = `👍`
		if (db.has(`customapprove_${guild.id}`)) {
			if (/\p{Emoji}/u.test(db.fetch(`customapprove_${guild.id}`)) == true) approveemoji = db.fetch(`customapprove_${guild.id}`)
			else if (guild.emojis.filter(x => x.name == db.fetch(`customapprove_${guild.id}`).split(':')[0] && x.id == db.fetch(`customapprove_${guild.id}`).split(':')[1]).length != 0) approveemoji = db.fetch(`customapprove_${guild.id}`)
		}
		let denyemoji = `👎`
		if (db.has(`customdeny_${guild.id}`)) {
			if (/\p{Emoji}/u.test(db.fetch(`customdeny_${guild.id}`)) == true) denyemoji = db.fetch(`customdeny_${guild.id}`)
			else if (guild.emojis.filter(x => x.name == db.fetch(`customdeny_${guild.id}`).split(':')[0] && x.id == db.fetch(`customdeny_${guild.id}`).split(':')[1]).length != 0) denyemoji = db.fetch(`customdeny_${guild.id}`)
		}
		if (db.has(`reviewchannel_${guild.id}`) && guild.channels.has(db.fetch(`reviewchannel_${guild.id}`))) {
			if (sendmessage == true) {
				message.channel.createMessage(language == "english" ? `Successfully sent the suggestion to approval queue! When your suggestion get verified, it will show up here.` : `Öneri başarıyla doğrulama sırasına gönderildi! Önerin doğrulandığında, bu kanalda gözükecektir.`).then(async msg =>
					guild.channels.get(db.fetch(`reviewchannel_${guild.id}`)).createMessage({
						embed: {
							title: `Suggestion #${oldsugssize + 1}`,
							description: suggestion,
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
						msgg.addReaction(`✅`)
						msgg.addReaction(`❌`)
						db.set(`suggestion_${guild.id}_${oldsugssize + 1}`, {
							status: 'awaiting approval',
							msgid: msgg.id,
							author: message.author.id,
							suggestion,
							timestamp: Date.now(),
							channel: db.fetch(`reviewchannel_${guild.id}`),
							guild: guild.id,
							approveemoji,
							denyemoji,
							followers: [ message.author.id ],
							attachment: null,
							comments: []
						})
						await sleep(5000)
						return msg.delete()
					}))
			}
			if (sendmessage == false) {
				guild.channels.get(db.fetch(`reviewchannel_${guild.id}`)).createMessage({
					embed: {
						title: `Suggestion #${oldsugssize + 1}`,
						description: suggestion,
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
					msgg.addReaction(`✅`)
					msgg.addReaction(`❌`)
					return db.set(`suggestion_${guild.id}_${oldsugssize + 1}`, {
						status: 'awaiting approval',
						msgid: msgg.id,
						author: message.author.id,
						suggestion,
						timestamp: Date.now(),
						channel: db.fetch(`reviewchannel_${guild.id}`),
						guild: guild.id,
						approveemoji,
						denyemoji,
						followers: [ message.author.id ],
						attachment: null,
						comments: []
					})
				})
			}
		} else {
			guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).createMessage({
				embed: {
					title: language == "english" ? `Suggestion #${oldsugssize + 1}` : `Öneri #${oldsugssize + 1}`,
					description: suggestion,
					color: colorToSignedBit("#00FFFF"),
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
				if (!db.has(`denyvoting_${guild.id}`)) {
					msg.addReaction(approveemoji)
					msg.addReaction(denyemoji)
				}
				db.set(`suggestion_${guild.id}_${oldsugssize + 1}`, {
					status: 'new',
					msgid: msg.id,
					author: message.author.id,
					suggestion,
					timestamp: Date.now(),
					channel: db.fetch(`suggestionchannel_${guild.id}`),
					guild: guild.id,
					approveemoji,
					denyemoji,
					followers: [ message.author.id ],
					attachment: null,
					comments: []
				})
			})
		}
	},
	
	verifySuggestion: async (message, guild, client, language) => {
		const db = client.db
		const sugid = Number(message.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', ''))
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`)
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
		const author = client.users.get(data.author)
		const approveemoji = data.approveemoji;
		const denyemoji = data.denyemoji;
		guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).createMessage({
			embed: {
				title: language == "english" ? `Suggestion #${sugid}` : `Öneri #${sugid}`,
				description: data.suggestion,
				color: colorToSignedBit("#00FFFF"),
				author: {
					name: language == "english" ? `New suggestion - ${message.embeds[0].author.name.split(' - ')[1]}` : `Yeni öneri - ${message.embeds[0].author.name.split(' - ')[1]}`,
					icon_url: message.embeds[0].author.icon_url
				},
				footer: {
					text: client.user.username,
					icon_url: client.user.avatarURL || client.user.defaultAvatarURL
				},
				image: data.attachment == null ? null : {url: data.attachment}
			}
		}).then(async msgg => {
			if (!db.has(`denyvoting_${guild.id}`)) {
				msgg.addReaction(approveemoji)
				msgg.addReaction(denyemoji)
			}
			message.delete()
			db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
			db.set(`suggestion_${guild.id}_${sugid}.channel`, msgg.channel.id)
			db.set(`suggestion_${guild.id}_${sugid}.status`, 'new')
			guild.fetchMembers({userIDs: data.followers})
			for (const id of data.followers) {
				if (!client.users.has(id) || !guild.members.has(id)) return;
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'Followed suggestion has verified!',
						description: `Followed suggestion that in \`${guild.name}\` has verified. It will be shown in suggestions channel now.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
		})
	},
	
	attachImage: async (message, guild, sugid, image, client, language) => {
		const db = client.db
		const data = db.fetch(`suggestion_${guild.id}_${sugid}`)
		if (!client.users.has(data.author)) client.guilds.get(guild.id).fetchMembers({userIDs: [ data.author ]})
		const author = client.users.get(data.author)
		guild.channels.get(data.channel).getMessage(data.msgid).then(async msg => {
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
			if (message != null) message.channel.createMessage({
				content: language == "english" ? `Successful!` : `Başarılı!`,
				messageReference: {
					channelID: message.channel.id,
					messageID: message.id,
					guildID: message.guildID,
					failIfNotExists: false
				}
			})
			db.set(`suggestion_${guild.id}_${sugid}.attachment`, typeof image == "string" ? image : image.url)
			guild.fetchMembers({userIDs: data.followers})
			for (const id of data.followers) {
				if (!client.users.has(id) || !guild.members.has(id)) return;
				if (!db.has(`denydm_${id}`)) client.users.get(id).getDMChannel().then(async ch => ch.createMessage({
					embed: {
						title: 'An image attached to a followed suggestion!',
						description: `An image attached to followed suggestion that in \`${guild.name}\`.\n**Suggestion number:** \`#${sugid}\`\n**Suggestion author:** ${author.username}#${author.discriminator}\n**Suggestion:** \`\`\`${db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`)}\`\`\``,
						color: 6579300,
						footer: {
							text: `You can disable these DMs with using .senddm command in a guild.`,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						image: {url: typeof image == "string" ? image : image.url}
					}
				})).catch(async e => console.log(`Someone's dm is closed (${e})`))
			}
		})
	}
}

const Base = require('eris-sharder').Base;
const Eris = require('eris');
const fs = require('fs');
const settings = require("./settings.json")
const arkdb = require('ark.db');
const db = new arkdb.Database()
const awaitingsuggestions = new Map()
const version = "1.1";
const {manageSuggestion, deleteSuggestion, sendSuggestion, verifySuggestion} = require('./functions')

class Class extends Base {
	constructor(bot) {
		super(bot);
	}
	
	async launch() {
		const client = this.bot
		client.db = db
		client.commands = new Eris.Collection(undefined, undefined);
		client.aliases = new Eris.Collection(undefined, undefined);
		
		function sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		
		function colorToSignedBit(s) {
			return (parseInt(s.substr(1), 16) << 8) / 256;
		}
		
		client.editStatus("online", {name: `.help | .invite | v${version}`, type: 5})
		if (client.guilds.has('662632169277227009')) client.guilds.get('662632169277227009').fetchMembers({userIDs: [ "343412762522812419" ]})
		
		fs.readdir("commands", async (err, files) => {
			const jsfile = files.filter(f => f.split(".").pop() == "js");
			if (jsfile.length <= 0 || err || !files) {
				console.log("Unable to find commands.");
				return process.exit(0)
			}
			for (const f of jsfile) {
				const props = require(`./commands/${f}`);
				console.log(`${f} loaded`);
				client.commands.set(props.help.name, props);
				for (const aliase of props.help.aliase) {
					client.aliases.set(aliase, props)
				}
			}
			console.log("All commands have been loaded successfully.")
		});
		
		client.on("messageCreate", async message => {
			if (message.author.bot) return;
			if (!message.guildID) return message.channel.createMessage(`You can't use commands via DMs in this bot. You can only receive suggestion updates via DMs in this bot.`)
			const prefix = message.guildID ? db.fetch(`prefix_${message.guildID}`) || "." : ".";
			if (!message.content.startsWith(prefix)) return;
			const messageArray = message.content.split('  ').join(' ').split(" ");
			const cmd = messageArray[0];
			let commandfile = client.commands.get(cmd.slice(prefix.length));
			if (!commandfile) commandfile = client.aliases.get(cmd.slice(prefix.length))
			if (!commandfile) return;
			const args = messageArray.slice(1);
			const guild = client.guilds.get(message.guildID)
			guild.fetchMembers({userIDs: [ client.user.id ]})
			const guildme = guild.members.get(client.user.id)
			if (!guildme.permissions.has('sendMessages')) return message.author.getDMChannel().then(ch => ch.createMessage(`That bot doesn't have send messages permission in this guild.`))
			if (!guildme.permissions.has('manageMessages') || !guildme.permissions.has('embedLinks') || !guildme.permissions.has('addReactions')) return message.channel.createMessage(`The bot should have Manage Messages, Embed Links and Add Reactions permissions in order to work properly.`)
			if (commandfile) commandfile.run(client, message, args);
		})
		
		client.on('messageCreate', async message => {
			if (message.author.bot) return;
			if (!message.guildID) return;
			if (!db.has(`suggestionchannel_${message.guildID}`)) return;
			if (db.fetch(`suggestionchannel_${message.guildID}`) != message.channel.id) return;
			if (db.has(`disablemessagechannel_${message.guildID}`)) return;
			const dil = db.fetch(`dil_${message.guildID}`) || "english";
			const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
			if (message.content.startsWith(prefix)) return;
			const guild = client.guilds.get(message.guildID)
			guild.fetchMembers({userIDs: [ client.user.id ]})
			const guildme = guild.members.get(client.user.id)
			if (!guildme.permissions.has('sendMessages')) return message.author.getDMChannel().then(ch => ch.createMessage(`That bot doesn't have send messages permission in this guild.`))
			if (!guildme.permissions.has('manageMessages') || !guildme.permissions.has('embedLinks') || !guildme.permissions.has('addReactions')) return message.channel.createMessage(`The bot should have Manage Messages, Embed Links and Add Reactions permissions in order to work properly.`)
			sendSuggestion(message, message.content.slice(0, 1024), guild, client, dil, true)
			message.delete()
		})
		
		client.on('guildCreate', async guild => {
			let role = null;
			const everyonerole = guild.roles.find(r => r.name.toLowerCase().includes("everyone"))
			if (guild.memberCount >= 5000) role = everyonerole
			else {
				guild.fetchMembers({limit: 5000}).then(async members => {
					for (const r of guild.roles) {
						const currentnumber = members.filter(m => m.roles.includes(r.id)).length;
						if (currentnumber / guild.memberCount >= 0.75) {
							if (role == null) role = r;
							else {
								if (currentnumber > members.filter(m => m.roles.includes(role.id)).length) role = r;
							}
						}
					}
				})
				if (role == null) role = everyonerole
			}
			let channels = guild.channels.filter(c => c.type == 0 && c.permissionOverwrites.has(role.id) && JSON.stringify(c.permissionOverwrites.get(role.id).json).includes('sendMessages') && c.permissionOverwrites.get(role.id).json.sendMessages != false)
			if (channels.length <= 0) channels = guild.channels.filter(c => c.type == 0 && !c.permissionOverwrites.has(role.id) && !c.permissionOverwrites.has(everyonerole.id));
			let channel = 0;
			if (channels.length > 1) {
				let lasttimestamp = 0;
				for (const ch of channels) {
					ch.getMessages({limit: 1}).then(async msg => {
						if (msg[0] && msg[0].timestamp > lasttimestamp) {
							lasttimestamp = msg[0].timestamp
							channel = ch
						}
					})
				}
			}
			if (channels.length == 0) {
				let lasttimestamp = 0;
				for (const ch of guild.channels.filter(c => c.type == 0)) {
					ch.getMessages({limit: 1}).then(async msg => {
						if (msg[0] && msg[0].timestamp > lasttimestamp) {
							lasttimestamp = msg[0].timestamp
							channel = ch
						}
					})
				}
			}
			if (channel == 0) channel = channels[0]
			this.ipc.fetchUser('343412762522812419').then(async user => {
				channel.createMessage({
					embed: {
						title: '**__Thanks for adding Suggestions bot!__**',
						description: `This bot allows you to manage your suggestions in server easily. You can see the possible commands with **.help** command.\nThis bot won't work if you don't set any suggestion channel.\n \n**You can get help about the bot setup** With **.setupinfo** command.\n \n**This bot made by** ${user.username}#${user.discriminator}\n \n**If you have any cool idea for bot** Use **.botsuggest** command to send suggestions to owner.\n \n**Note:** In order to work properly, bot should have Manage Messages, Embed Links and Add Reactions permission.\n \n**Note for Turkish:** Eğer botu Türkçe kullanmak istiyorsanız \`.language turkish\` komuduyla botu Türkçe yapabilirsiniz, Türkçe yaptıktan sonra \`.kurulumbilgi\` ile bilgi alabilirsiniz`,
						color: colorToSignedBit("#2F3136"),
						author: {
							name: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						},
						footer: {
							text: client.user.username,
							icon_url: client.user.avatarURL || client.user.defaultAvatarURL
						}
					}
				})
			})
		})
		
		client.on('messageReactionAdd', async (message, emoji, user) => {
			if (!client.users.has(user.id)) client.guilds.get(message.guildID).fetchMembers({userIDs: [ user.id ]})
			if (client.users.get(user.id).bot) return;
			if (!message.guildID) return;
			if (!db.has(`suggestionchannel_${message.guildID}`)) return;
			if (db.has(`suggestionchannel_${message.guildID}`) && db.fetch(`suggestionchannel_${message.guildID}`) != message.channel.id) return;
			console.log(emoji)
			client.guilds.get(message.guildID).channels.get(message.channel.id).getMessage(message.id).then(async msg => {
				const sugid = Number(msg.embeds[0].title.replace('Suggestion #', '').replace('Öneri #', ''))
				const sugname = `suggestion_${msg.guildID}_${sugid}`
				if (!db.has(sugname)) return;
				const dil = db.fetch(`dil_${msg.guildID}`) || "english";
				let react;
				if (emoji.id) react = emoji.name + ':' + emoji.id
				if (!emoji.id) react = emoji.name
				let reacttype;
				if (!db.has(`customapprove_${message.guildID}`) && react == `👍`) reacttype = 'approve'
				if (!db.has(`customdeny_${message.guildID}`) && react == `👎`) reacttype = 'deny'
				if (db.has(`customapprove_${message.guildID}`) && react == db.fetch(`customapprove_${message.guildID}`)) reacttype = 'approve'
				if (db.has(`customdeny_${message.guildID}`) && react == db.fetch(`customdeny_${message.guildID}`)) reacttype = 'deny'
				let otheremoji;
				if (reacttype == 'approve') {
					if (!db.has(`customdeny_${message.guildID}`)) otheremoji = `👎`
					if (db.has(`customdeny_${message.guildID}`)) otheremoji = db.fetch(`customdeny_${message.guildID}`)
				}
				if (reacttype == 'deny') {
					if (!db.has(`customapprove_${message.guildID}`)) otheremoji = `👍`
					if (db.has(`customapprove_${message.guildID}`)) otheremoji = db.fetch(`customapprove_${message.guildID}`)
				}
				msg.getReaction(react).then(async rec => {
					if (db.has(`ownervoting_${message.guildID}`) && db.fetch(`${sugname}.author`) == user.id && rec.find(x => x.id == user.id)) {
						client.users.get(user.id).getDMChannel().then(async ch => ch.createMessage(`You can't vote to your suggestion in this server.`))
						return msg.removeReaction(react, user.id)
					}
					msg.getReaction(otheremoji).then(async recc => {
						if (db.has(`multiplevoting_${message.guildID}`) && rec.find(x => x.id == user.id) && recc.find(x => x.id == user.id)) {
							client.users.get(user.id).getDMChannel().then(async ch => ch.createMessage(`Multiple voting is not allowed in this server. You must vote in only one reaction.`))
							return msg.removeReaction(react, user.id)
						}
						if (db.has(`autoapprove_${msg.guildID}`) && reacttype == 'approve' && rec.length - 1 >= db.fetch(`autoapprove_${msg.guildID}`)) {
							return manageSuggestion(null, client.guilds.get(msg.guildID), sugid, 'Approved', client, dil, [])
						}
						if (db.has(`autodeny_${msg.guildID}`) && reacttype == 'deny' && rec.length - 1 >= db.fetch(`autodeny_${msg.guildID}`)) {
							return manageSuggestion(null, client.guilds.get(msg.guildID), sugid, 'Denied', client, dil, [])
						}
					})
				})
			})
		})
		
		client.on('messageReactionAdd', async (message, emoji, user) => {
			if (!db.has(`reviewchannel_${message.guildID}`)) return;
			if (db.fetch(`reviewchannel_${message.guildID}`) != message.channel.id) return
			if (!client.users.has(user.id)) client.guilds.get(message.guildID).fetchMembers({userIDs: [ user.id ]})
			if (client.users.get(user.id).bot) return;
			const dil = db.fetch(`dil_${message.guildID}`) || "english";
			const guild = client.guilds.get(message.guildID)
			if (!db.has(`staffrole_${guild.id}`) && !guild.members.get(user.id).permissions.has('manageMessages')) return;
			if (db.has(`staffrole_${guild.id}`) && !guild.members.get(user.id).roles.some(r => db.fetch(`staffrole_${guild.id}`).includes(r)) && !guild.members.get(user.id).permissions.has('administrator')) return;
			guild.channels.get(message.channel.id).getMessage(message.id).then(async msg => {
				if (emoji.name == `✅`) return verifySuggestion(msg, msg.channel.guild, client, dil)
				if (emoji.name == `❌`) return deleteSuggestion(null, client.guilds.get(msg.guildID), Number(msg.embeds[0].title.replace(`Öneri #`, ``).replace(`Suggestion #`, ``)), client, dil, [], false, db.fetch(`reviewchannel_${guild.id}`))
			})
		})
		
		client.on('messageDelete', async message => {
			await sleep(1000)
			const map = new Map(Object.entries(db.all()));
			for (const i of map.keys()) {
				if (i.startsWith(`suggestion_${message.guildID}_`) && db.fetch(`${i}.msgid`) == message.id) {
					deleteSuggestion(null, client.guilds.get(db.fetch(`${i}.guild`)), Number(i.split('_')[2]), client, 'english', [], true, db.fetch(`${i}.channel`))
				}
			}
		})
		
		client.on('guildDelete', async guild => {
			const map = new Map(Object.entries(db.all())).keys();
			for (const i of map) {
				if (i.includes(guild.id)) db.delete(i)
			}
		})
		
		client.on('error', async error => console.error(error.stack))
		
		client.shar
		
		client.connect()
	}
}

module.exports = Class;

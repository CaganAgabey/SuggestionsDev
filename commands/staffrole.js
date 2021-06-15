const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	let indexi;
	const db = client.db
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const guild = client.guilds.get(message.guildID)
	
	if (dil == "english") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
		if (!args[0]) return message.channel.createMessage(`You must provide an option. (\`add\`, \`remove\` or \`list\`)`)
		if (args[0] == "add") {
			const channel = message.roleMentions[0] || args.slice(1).join(' ')
			if (!channel) return message.channel.createMessage(`You must write a role name, mention a role, write a role ID.`)
			let kanal;
			if (message.roleMentions[0]) kanal = message.roleMentions[0]
			if (!message.roleMentions[0] && !isNaN(channel)) kanal = guild.roles.get(channel)
			if (!message.roleMentions[0] && isNaN(channel)) kanal = guild.roles.find(c => c.name.toLowerCase().split(' ').join('').includes(channel.toLowerCase().split(' ').join('')))
			if (!kanal) return message.channel.createMessage(`Can't find a role with this ID/name.`)
			if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`This guild already has this staff role.`)
			db.push(`staffrole_${message.guildID}`, kanal.id)
			message.channel.createMessage(`Successfully added the staff role ${kanal.mention} in this server!`)
		}
		
		if (args[0] == "remove") {
			const channel = message.roleMentions[0] || args.slice(1).join(' ')
			if (!channel) return message.channel.createMessage(`You must write a role name, mention a role, write a role ID.`)
			let kanal;
			if (message.roleMentions[0]) kanal = message.roleMentions[0]
			if (!message.roleMentions[0] && !isNaN(channel)) kanal = guild.roles.get(channel)
			if (!message.roleMentions[0] && isNaN(channel)) kanal = guild.roles.find(c => c.name.toLowerCase().split(' ').join('').includes(channel.toLowerCase().split(' ').join('')))
			if (!kanal) return message.channel.createMessage(`Can't find a role with this ID/name.`)
			if (!db.has(`staffrole_${message.guildID}`) || !db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`This guild doesn't have this staff role.`)
			const array = db.fetch(`staffrole_${message.guildID}`);
			array.splice(array.indexOf(kanal.id), 1)
			db.set(`staffrole_${message.guildID}`, array)
			if (db.fetch(`staffrole_${message.guildID}`).length == 0) db.delete(`staffrole_${message.guildID}`)
			message.channel.createMessage(`Successfully removed the staff role ${kanal.mention} in this server!`)
		}
		
		if (args[0] == "list") {
			if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) return message.channel.createMessage(`This guild doesn't have any staff role.`)
			const staffroles = db.fetch(`staffrole_${message.guildID}`)
			const rolemap = staffroles.map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
			message.channel.createMessage({
				embed: {
					title: `__**Staff roles**__`,
					description: rolemap,
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					},
					color: colorToSignedBit("#2F3136")
				}
			})
		}
		
		if (args[0] != "add" && args[0] != "remove" && args[0] != "list") return message.channel.createMessage(`You must provide a correct option. (\`add\`, \`remove\` or \`list\`)`)
	}
	
	if (dil == "turkish") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		if (!args[0]) return message.channel.createMessage(`Bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
		if (args[0] == "ekle") {
			const channel = message.roleMentions[0] || args.slice(1).join(' ')
			if (!channel) return message.channel.createMessage(`Bir rol ismi, rol IDsi yazmalısın veya rol etiketlemelisin.`)
			let kanal;
			if (message.roleMentions[0]) kanal = message.roleMentions[0]
			if (!message.roleMentions[0] && !isNaN(channel)) kanal = guild.roles.get(channel)
			if (!message.roleMentions[0] && isNaN(channel)) kanal = guild.roles.find(c => c.name.toLowerCase().split(' ').join('').includes(channel.toLowerCase().split(' ').join('')))
			if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir rol bulunamadı.`)
			if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`Bu sunucunun zaten böyle bir yetkili rolü var.`)
			db.push(`staffrole_${message.guildID}`, kanal.id)
			message.channel.createMessage(`Başarıyla bu sunucudaki yetkili rollerine ${kanal.mention} eklendi!`)
		}
		
		if (args[0] == "sil") {
			const channel = message.roleMentions[0] || args.slice(1).join(' ')
			if (!channel) return message.channel.createMessage(`Bir rol ismi, rol IDsi yazmalısın veya rol etiketlemelisin.`)
			let kanal;
			if (message.roleMentions[0]) kanal = message.roleMentions[0]
			if (!message.roleMentions[0] && !isNaN(channel)) kanal = guild.roles.get(channel)
			if (!message.roleMentions[0] && isNaN(channel)) kanal = guild.roles.find(c => c.name.toLowerCase().split(' ').join('').includes(channel.toLowerCase().split(' ').join('')))
			if (!kanal) return message.channel.createMessage(`Bu ID/isim ile herhangi bir rol bulunamadı.`)
			if (!db.has(`staffrole_${message.guildID}`) || !db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(`Bu sunucunun böyle bir yetkili rolü yok.`)
			const array = db.fetch(`staffrole_${message.guildID}`);
			array.splice(array.indexOf(kanal.id), 1)
			db.set(`staffrole_${message.guildID}`, array)
			if (db.fetch(`staffrole_${message.guildID}`).length == 0) db.delete(`staffrole_${message.guildID}`)
			message.channel.createMessage(`Başarıyla bu sunucunun yetkili rollerinden ${kanal.mention} kaldırıldı!`)
		}
		
		if (args[0] == "liste") {
			if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) return message.channel.createMessage(`Bu sunucunun hiçbir yetkili rolü yok.`)
			const staffroles = db.fetch(`staffrole_${message.guildID}`)
			const rolemap = staffroles.map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
			message.channel.createMessage({
				embed: {
					title: `__**Yetkili rolleri**__`,
					description: rolemap,
					footer: {
						text: client.user.username,
						icon_url: client.user.avatarURL || client.user.defaultAvatarURL
					},
					color: colorToSignedBit("#2F3136")
				}
			})
		}
		
		if (args[0] != "ekle" && args[0] != "sil" && args[0] != "liste") return message.channel.createMessage(`Doğru bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
	}
}

module.exports.help = {
	name: "staffrole",
	nametr: "yetkilirol",
	aliase: [ "setstaff", "setstaffrole", "yetkilirol", "yetkilirolseç" ],
	descriptionen: "Sets a staff role to manage suggestions. (if not selected, required permission for staff roles is Manage Messages)",
	descriptiontr: "Önerileri yönetecek bir yetkili rolü seçer. (seçilmediyse, yetkililer için gereken yetki Mesajları Yönetme olacaktır)",
	usageen: "setstaffrole [role name, mention or id]",
	usagetr: "yetkilirol [rol ismi, etiketi veya idsi]",
	category: 'admin'
}

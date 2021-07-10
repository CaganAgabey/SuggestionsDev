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

	if (!message.member.permissions.has('administrator')) return message.channel.createMessage(dil == 'english' ? `You must have Administrator permission to use this command.` : `Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
	if (!args[0]) return message.channel.createMessage(dil == 'english' ? `You must provide an option. (\`add\`, \`remove\` or \`list\`)` : `Bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
	
	const channel = message.roleMentions[0] || args.slice(1).join(' ')
	if (!channel) return message.channel.createMessage(dil == 'english' ? `You must write a role name, mention a role, write a role ID.` : `Bir rol ismi, rol IDsi yazmalısın veya rol etiketlemelisin.`)
	let kanal;
	if (message.roleMentions[0]) kanal = message.roleMentions[0]
	if (!message.roleMentions[0] && !isNaN(channel)) kanal = guild.roles.get(channel)
	if (!message.roleMentions[0] && isNaN(channel)) kanal = guild.roles.find(c => c.name.toLowerCase().split(' ').join('').includes(channel.toLowerCase().split(' ').join('')))
	if (!kanal) return message.channel.createMessage(dil == 'english' ? `Can't find a role with this ID/name.` : `Bu ID/isim ile herhangi bir rol bulunamadı.`)
	switch (args[0]) {
		case 'add':
			if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(dil == 'english' ? `This guild already has this staff role.` : `Bu sunucunun zaten böyle bir yetkili rolü var.`)
			db.push(`staffrole_${message.guildID}`, kanal.id)
			message.channel.createMessage(dil == 'english' ? `Successfully added the staff role ${kanal.mention} in this server!` : `Başarıyla bu sunucudaki yetkili rollerine ${kanal.mention} eklendi!`)
			break;
			
		case 'remove':
			if (!db.has(`staffrole_${message.guildID}`) || !db.fetch(`staffrole_${message.guildID}`).includes(kanal.id)) return message.channel.createMessage(dil == 'english' ? `This guild doesn't have this staff role.` : `Bu sunucunun böyle bir yetkili rolü yok.`)
			const array = db.fetch(`staffrole_${message.guildID}`);
			array.splice(array.indexOf(kanal.id), 1)
			db.set(`staffrole_${message.guildID}`, array)
			if (db.fetch(`staffrole_${message.guildID}`).length == 0) db.delete(`staffrole_${message.guildID}`)
			message.channel.createMessage(dil == 'english' ? `Successfully removed the staff role ${kanal.mention} in this server!` : `Başarıyla bu sunucunun yetkili rollerinden ${kanal.mention} kaldırıldı!`)
			break;
			
		case 'list':
			if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) return message.channel.createMessage(dil == 'english' ? `This guild doesn't have any staff role.` : `Bu sunucunun hiçbir yetkili rolü yok.`)
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
			break;
			
		default:
			message.channel.createMessage(dil == 'english' ? `You must provide a correct option. (\`add\`, \`remove\` or \`list\`)` : `Doğru bir ayar belirtmelisin. (\`ekle\`, \`sil\` veya \`liste\`)`)
			break;
	}
}

module.exports.help = {
	name: "staffrole",
	nametr: "yetkilirol",
	aliase: [ "setstaff", "setstaffrole", "yetkilirolseç" ],
	descriptionen: "Sets a staff role to manage suggestions. (if not selected, required permission for staff roles is Manage Messages)",
	descriptiontr: "Önerileri yönetecek bir yetkili rolü seçer. (seçilmediyse, yetkililer için gereken yetki Mesajları Yönetme olacaktır)",
	usageen: "staffrole [add/remove/list] [role name, mention or id if provided option is add or remove]",
	usagetr: "yetkilirol [ekle/sil/liste] [belirtilen seçenek ekle veya sil ise rol ismi, etiketi veya idsi]",
	category: 'admin'
}

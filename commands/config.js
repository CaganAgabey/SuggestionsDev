const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
		
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		let staffroles;
		if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) staffroles = `None (\`${prefix}staffrole\`)`
		if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).length != 0) staffroles = db.fetch(`staffrole_${message.guildID}`).map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
		let suggestionchannel;
		if (db.has(`suggestionchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`suggestionchannel_${message.guildID}`))) suggestionchannel = `<#${db.fetch(`suggestionchannel_${message.guildID}`)}>`
		if (!db.has(`suggestionchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`suggestionchannel_${message.guildID}`))) suggestionchannel = `None (\`${prefix}setchannel\`)`
		let reviewchannel;
		if (db.has(`reviewchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) reviewchannel = `<#${db.fetch(`reviewchannel_${message.guildID}`)}>`
		if (!db.has(`reviewchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) reviewchannel = `None (\`${prefix}reviewchannel\`)`
		let approvedchannel;
		if (db.has(`approvedchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) approvedchannel = `<#${db.fetch(`approvedchannel_${message.guildID}`)}>`
		if (!db.has(`approvedchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) approvedchannel = `None (\`${prefix}approvedchannel\`)`
		let deniedchannel;
		if (db.has(`deniedchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`))) deniedchannel = `<#${db.fetch(`deniedchannel_${message.guildID}`)}>`
		if (!db.has(`deniedchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`))) deniedchannel = `None (\`${prefix}deniedchannel\`)`
		let invalidchannel;
		if (db.has(`invalidchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`invalidchannel_${message.guildID}`))) invalidchannel = `<#${db.fetch(`invalidchannel_${message.guildID}`)}>`
		if (!db.has(`invalidchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`invalidchannel_${message.guildID}`))) invalidchannel = `None (\`${prefix}invalidchannel\`)`
		let potentialchannel;
		if (db.has(`maybechannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`maybechannel_${message.guildID}`))) potentialchannel = `<#${db.fetch(`maybechannel_${message.guildID}`)}>`
		if (!db.has(`maybechannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`maybechannel_${message.guildID}`))) potentialchannel = `None (\`${prefix}maybechannel\`)`
		let allowvoting;
		if (db.has(`denyvoting_${message.guildID}`)) allowvoting = `Off \`${prefix}allowvoting\``
		if (!db.has(`denyvoting_${message.guildID}`)) allowvoting = `On \`${prefix}allowvoting\``
		let allowsuggestcommand;
		if (db.has(`denysuggestcommand_${message.guildID}`)) allowsuggestcommand = `Off \`${prefix}allowsuggestcommand\``
		if (!db.has(`denysuggestcommand_${message.guildID}`)) allowsuggestcommand = `On \`${prefix}allowsuggestcommand\``
		let allowmessagingchannel;
		if (db.has(`disablemessagechannel_${message.guildID}`)) allowmessagingchannel = `Off \`${prefix}messagingsuggestionchannel\``
		if (!db.has(`disablemessagechannel_${message.guildID}`)) allowmessagingchannel = `On \`${prefix}messagingsuggestionchannel\``
		let ownervoting;
		if (db.has(`ownervoting_${message.guildID}`)) ownervoting = `Off \`${prefix}ownervoting\``
		if (!db.has(`ownervoting_${message.guildID}`)) ownervoting = `On \`${prefix}ownervoting\``
		let multiplevoting;
		if (db.has(`multiplevoting_${message.guildID}`)) multiplevoting = `Off \`${prefix}multiplevoting\``
		if (!db.has(`multiplevoting_${message.guildID}`)) multiplevoting = `On \`${prefix}multiplevoting\``
		let customapprove;
		if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) customapprove = db.fetch(`customapprove_${message.guildID}`)
		if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false) customapprove = '<:' + db.fetch(`customapprove_${message.guildID}`).split(':')[0] + ':' + db.fetch(`customapprove_${message.guildID}`).split(':')[1] + '>'
		if (!db.has(`customapprove_${message.guildID}`)) customapprove = `👍 (default \`${prefix}approveemoji\`)`
		let customdeny;
		if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) customdeny = db.fetch(`customdeny_${message.guildID}`)
		if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false) customdeny = '<:' + db.fetch(`customdeny_${message.guildID}`).split(':')[0] + ':' + db.fetch(`customdeny_${message.guildID}`).split(':')[1] + '>'
		if (!db.has(`customdeny_${message.guildID}`)) customdeny = `👎 (default \`${prefix}denyemoji\`)`
		let autodeny;
		if (db.has(`autodeny_${message.guildID}`)) autodeny = db.fetch(`autodeny_${message.guildID}`)
		if (!db.has(`autodeny_${message.guildID}`)) autodeny = `None (\`${prefix}autodeny\`)`
		let autoapprove;
		if (db.has(`autoapprove_${message.guildID}`)) autoapprove = db.fetch(`autoapprove_${message.guildID}`)
		if (!db.has(`autoapprove_${message.guildID}`)) autoapprove = `None (\`${prefix}autoapprove\`)`
		message.channel.createMessage({
			embed: {
				title: `__**Config**__`,
				description: `**Suggestions channel:** ${suggestionchannel}\n**Suggestion review channel:** ${reviewchannel}\n \n**Approved suggestions channel:** ${approvedchannel}\n**Denied suggestions channel:** ${deniedchannel}\n**Invalid suggestions channel:** ${invalidchannel}\n**Potential suggestions channel:** ${potentialchannel}\n \n**Allow vote on suggestions:** ${allowvoting}\n**Allow suggest command:** ${allowsuggestcommand}\n**Allow messaging to suggestion channel to send suggestion:** ${allowmessagingchannel}\n**Allow multiple voting:** ${multiplevoting}\n**Allow self voting:** ${ownervoting}\n \n**Approve emoji:** ${customapprove}\n**Deny emoji:** ${customdeny}\n \n**Auto approve count:** ${autoapprove}\n**Auto deny count:** ${autodeny}\n \n**__Staff roles (\`${prefix}staffrole\`)__**\n${staffroles}\n \n**Prefix (\`${prefix}prefix\`):** ${prefix}`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
	
	if (dil == "turkish") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		let staffroles;
		if (!db.has(`staffrole_${message.guildID}`) || db.fetch(`staffrole_${message.guildID}`).length == 0) staffroles = `Belirlenmemiş (\`${prefix}yetkilirol\`)`
		if (db.has(`staffrole_${message.guildID}`) && db.fetch(`staffrole_${message.guildID}`).length != 0) staffroles = db.fetch(`staffrole_${message.guildID}`).map(r => `<:rightarrow:709539888411836526> <@&` + r + `>\n`).join('')
		let suggestionchannel;
		if (db.has(`suggestionchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`suggestionchannel_${message.guildID}`))) suggestionchannel = `<#${db.fetch(`suggestionchannel_${message.guildID}`)}>`
		if (!db.has(`suggestionchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`suggestionchannel_${message.guildID}`))) suggestionchannel = `Belirlenmemiş (\`${prefix}kanalseç\`)`
		let reviewchannel;
		if (db.has(`reviewchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) reviewchannel = `<#${db.fetch(`reviewchannel_${message.guildID}`)}>`
		if (!db.has(`reviewchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) reviewchannel = `Belirlenmemiş (\`${prefix}doğrulamakanalı\`)`
		let approvedchannel;
		if (db.has(`approvedchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) approvedchannel = `<#${db.fetch(`approvedchannel_${message.guildID}`)}>`
		if (!db.has(`approvedchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`))) approvedchannel = `Belirlenmemiş (\`${prefix}onaylanmışönerikanal\`)`
		let deniedchannel;
		if (db.has(`deniedchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`))) deniedchannel = `<#${db.fetch(`deniedchannel_${message.guildID}`)}>`
		if (!db.has(`deniedchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`))) deniedchannel = `Belirlenmemiş (\`${prefix}reddedilenönerikanal\`)`
		let invalidchannel;
		if (db.has(`invalidchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`invalidchannel_${message.guildID}`))) invalidchannel = `<#${db.fetch(`invalidchannel_${message.guildID}`)}>`
		if (!db.has(`invalidchannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`invalidchannel_${message.guildID}`))) invalidchannel = `Belirlenmemiş (\`${prefix}geçersizönerikanal\`)`
		let potentialchannel;
		if (db.has(`maybechannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`maybechannel_${message.guildID}`))) potentialchannel = `<#${db.fetch(`maybechannel_${message.guildID}`)}>`
		if (!db.has(`maybechannel_${message.guildID}`) || !message.channel.guild.channels.has(db.fetch(`maybechannel_${message.guildID}`))) potentialchannel = `Belirlenmemiş (\`${prefix}düşünülecekönerikanal\`)`
		let allowvoting;
		if (db.has(`denyvoting_${message.guildID}`)) allowvoting = `Kapalı \`${prefix}oylamaizni\``
		if (!db.has(`denyvoting_${message.guildID}`)) allowvoting = `Açık \`${prefix}oylamaizni\``
        let allowsuggestcommand;
        if (db.has(`denysuggestcommand_${message.guildID}`)) allowsuggestcommand = `Kapalı \`${prefix}önerikomudunukullanma\``
        if (!db.has(`denysuggestcommand_${message.guildID}`)) allowsuggestcommand = `Açık \`${prefix}önerikomudunukullanma\``
        let allowmessagingchannel;
        if (db.has(`disablemessagechannel_${message.guildID}`)) allowmessagingchannel = `Kapalı \`${prefix}önerikanalınamesajgönderme\``
        if (!db.has(`disablemessagechannel_${message.guildID}`)) allowmessagingchannel = `Açık \`${prefix}önerikanalınamesajgönderme\``
		let ownervoting;
		if (db.has(`ownervoting_${message.guildID}`)) ownervoting = `Kapalı \`${prefix}sahipoylama\``
		if (!db.has(`ownervoting_${message.guildID}`)) ownervoting = `Açık \`${prefix}sahipoylama\``
		let multiplevoting;
		if (db.has(`multiplevoting_${message.guildID}`)) multiplevoting = `Kapalı \`${prefix}çokluoylama\``
		if (!db.has(`multiplevoting_${message.guildID}`)) multiplevoting = `Açık \`${prefix}çokluoylama\``
		let customapprove;
		if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) customapprove = db.fetch(`customapprove_${message.guildID}`)
		if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false) customapprove = '<:' + db.fetch(`customapprove_${message.guildID}`).split(':')[0] + ':' + db.fetch(`customapprove_${message.guildID}`).split(':')[1] + '>'
		if (!db.has(`customapprove_${message.guildID}`)) customapprove = `👍 (varsayılan \`${prefix}onayemojisi\`)`
		let customdeny;
		if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) customdeny = db.fetch(`customdeny_${message.guildID}`)
		if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false) customdeny = '<:' + db.fetch(`customdeny_${message.guildID}`).split(':')[0] + ':' + db.fetch(`customdeny_${message.guildID}`).split(':')[1] + '>'
		if (!db.has(`customdeny_${message.guildID}`)) customdeny = `👎 (varsayılan \`${prefix}redemojisi\`)`
		let autodeny;
		if (db.has(`autodeny_${message.guildID}`)) autodeny = db.fetch(`autodeny_${message.guildID}`)
		if (!db.has(`autodeny_${message.guildID}`)) autodeny = `Belirlenmemiş (\`${prefix}otomatikred\`)`
		let autoapprove;
		if (db.has(`autoapprove_${message.guildID}`)) autoapprove = db.fetch(`autoapprove_${message.guildID}`)
		if (!db.has(`autoapprove_${message.guildID}`)) autoapprove = `Belirlenmemiş (\`${prefix}otomatikonay\`)`
		message.channel.createMessage({
			embed: {
				title: `__**Ayarlamalar**__`,
				description: `**Öneri kanalı:** ${suggestionchannel}\n**Öneri doğrulama kanalı:** ${reviewchannel}\n \n**Onaylanmış öneri kanalı:** ${approvedchannel}\n**Reddedilmiş öneri kanalı:** ${deniedchannel}\n**Geçersiz öneri kanalı:** ${invalidchannel}\n**Düşünülecek öneri kanalı:** ${potentialchannel}\n \n**Önerilerde oylama emojileri:** ${allowvoting}\n**Öner komudunu kullanabilme:** ${allowsuggestcommand}\n**Öneri göndermek için öneri kanalına mesaj atma:** ${allowmessagingchannel}\n**Birden fazla oy kullanma:** ${multiplevoting}\n**Kendi önerini oylama:** ${ownervoting}\n \n**Onay emojisi:** ${customapprove}\n**Red emojisi:** ${customdeny}\n \n**Otomatik onay sayısı:** ${autoapprove}\n**Otomatik red sayısı:** ${autodeny}\n \n**__Yetkili rolleri (\`${prefix}yetkilirol\`)__**\n${staffroles}\n \n**Önek (\`${prefix}önek\`):** ${prefix}`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
}

module.exports.help = {
	name: "config",
	nametr: "ayarlar",
	aliase: [ "ayarlar", "ayarlamalar", "botconfig" ],
	descriptionen: "Shows the configs of this server.",
	descriptiontr: "Bu sunucunun ayarlamalarını gösterir.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'admin'
}

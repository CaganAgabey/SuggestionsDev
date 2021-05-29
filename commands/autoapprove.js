const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`You must have Administrator permission to use this command.`)
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		
		if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`You must allow voting in suggestions with \`${prefix}allowvoting\` comand before opening this feature.`)
		
		const sayi = args[0]
		if (!sayi) return message.channel.createMessage(`You must provide a voter size to autoapprove, or write close to close. (Like: if you write 2 and any suggestion's thumbs up emoji pass 2 voters, this suggestion will be approved.)`)
		if (sayi == "delete" || sayi == "close" || sayi == "reset") {
			db.delete(`autoapprove_${message.guildID}`)
			return message.channel.createMessage(`Successfully closed autoapprove feature.`)
		}
		if (isNaN(sayi)) return message.channel.createMessage(`You must provide voter size as **Number**.`)
		if (sayi <= 0) return message.channel.createMessage(`You can't set the autoapprove voter size lower than 1.`)
		if (db.has(`autoapprove_${message.guildID}`) && db.fetch(`autoapprove_${message.guildID}`) == sayi) return message.channel.createMessage(`This guild's autoapprove count is already ${sayi}.`)
		
		db.set(`autoapprove_${message.guildID}`, sayi)
		message.channel.createMessage(`Successfully setted the autoapprove count as ${sayi}. Hereafter when any suggestion's thumbs up vote count pass ${sayi}, this suggestion will get approved.`)
	}
	
	if (dil == "turkish") {
		
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		
		if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`Bu özelliği açmadan önce \`${prefix}oylamaizni\` komuduyla önerilerdeki oylamayı açmalısın.`)
		
		const sayi = args[0]
		if (!sayi) return message.channel.createMessage(`Otomatik onaylanması için bir oylayıcı sayısı belirtmelisin, veya kapatmak için kapat yazmalısın. (Örneğin: 2 yazarsan ve herhangi bir önerinin onay emojisinin oylayıcı sayısı 2'yi geçerse, o öneri otomatik olarak onaylanır.)`)
		if (sayi == "kapat" || sayi == "kapa" || sayi == "sil") {
			db.delete(`autoapprove_${message.guildID}`)
			return message.channel.createMessage(`Başarıyla özellik kapatıldı.`)
		}
		if (isNaN(sayi)) return message.channel.createMessage(`Oylayıcı sayısını **sayı** olarak belirtmelisin.`)
		if (sayi <= 0) return message.channel.createMessage(`Otomatik onay oylayıcı sayısı 1'den az yapamazsın.`)
		if (db.has(`autoapprove_${message.guildID}`) && db.fetch(`autoapprove_${message.guildID}`) == sayi) return message.channel.createMessage(`Bu sunucunun otomatik onay sayısı zaten ${sayi}.`)
		
		db.set(`autoapprove_${message.guildID}`, sayi)
		message.channel.createMessage(`Başarıyla otomatik onay sayısı ${sayi} yapıldı. Bundan sonra herhangi bir önerinin onay emojisinin oylayıcı sayısı ${sayi} geçerse, bu öneri otomatik onaylanacaktır.`)
	}
}

module.exports.help = {
	name: "autoapprove",
	nametr: "otomatikonay",
	aliase: [ "autoapprovation", "otomatikonay" ],
	descriptionen: "Sets if a suggestion can be approved with provided votes. (default: false)",
	descriptiontr: "Belirlenen emoji sayısıyla bir önerinin onaylanıp onaylanmayacağını seçer. (normali: kapalı)",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

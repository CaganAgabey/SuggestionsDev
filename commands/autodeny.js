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
		if (!sayi) return message.channel.createMessage(`You must provide a voter size to autodeny, or write close to close. (Like: if you write 2 and any suggestion's thumbs down emoji pass 2 voters, this suggestion will be denied.)`)
		if (sayi == "delete" || sayi == "close" || sayi == "reset") {
			db.delete(`autodeny_${message.guildID}`)
			return message.channel.createMessage(`Successfully closed autodeny feature.`)
		}
		if (isNaN(sayi)) return message.channel.createMessage(`You must provide voter size as **Number**.`)
		if (sayi <= 0) return message.channel.createMessage(`You can't set the autodeny voter size lower than 1.`)
		if (db.has(`autodeny_${message.guildID}`) && db.fetch(`autodeny_${message.guildID}`) == sayi) return message.channel.createMessage(`This guild's autodeny count is already ${sayi}.`)
		
		db.set(`autodeny_${message.guildID}`, sayi)
		message.channel.createMessage(`Successfully setted the autodeny count as ${sayi}. Hereafter when any suggestion's thumbs down vote count pass ${sayi}, this suggestion will get denied.`)
	}
	
	if (dil == "turkish") {
		if (!message.member.permissions.has('administrator')) return message.channel.createMessage(`Bu komudu kullanmak için Yönetici yetkisine sahip olmalısın.`)
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		
		if (db.has(`denyvoting_${message.guildID}`)) return message.channel.createMessage(`Bu özelliği açmadan önce \`${prefix}oylamaizni\` komuduyla oylama iznini açmalısın.`)
		
		const sayi = args[0]
		if (!sayi) return message.channel.createMessage(`Otomatik reddedilmesi için bir oylayıcı sayısı belirtmelisin, veya kapatmak için kapat yazmalısın. (Örneğin: 2 yazarsan ve herhangi bir önerinin red emojisinin oylayıcı sayısı 2'yi geçerse, o öneri otomatik olarak reddedilir.)`)
		if (sayi == "kapat" || sayi == "kapa" || sayi == "sil") {
			db.delete(`autodeny_${message.guildID}`)
			return message.channel.createMessage(`Başarıyla özellik kapatıldı.`)
		}
		if (isNaN(sayi)) return message.channel.createMessage(`Oylayıcı sayısını **sayı** olarak belirtmelisin.`)
		if (sayi <= 0) return message.channel.createMessage(`Otomatik reddetme oylayıcı sayısını 1'den az yapamazsın.`)
		if (db.has(`autodeny_${message.guildID}`) && db.fetch(`autodeny_${message.guildID}`) == sayi) return message.channel.createMessage(`Bu sunucunun otomatik reddetme oylayıcı sayısı zaten ${sayi}.`)
		
		db.set(`autodeny_${message.guildID}`, sayi)
		message.channel.createMessage(`Başarıyla otomatik reddetme oylayıcı sayısı ${sayi} yapıldı. Bundan sonra herhangi bir önerinin red emojisinin oylayıcı sayısı ${sayi} geçerse, bu öneri otomatik olarak reddedilir.`)
	}
}

module.exports.help = {
	name: "autodeny",
	nametr: "otomatikred",
	aliase: [ "autodenition", "otomatikred" ],
	descriptionen: "Sets if a suggestion can be denied with provided votes.",
	descriptiontr: "Belirlenen oy sayısıyla bir önerinin reddedilip reddedilmeyeceğini seçer.",
	usageen: "allowvote",
	usagetr: "önek [yeni önek]",
	category: 'admin'
}

const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		function destructMS(milli) {
			if (isNaN(milli) || milli < 0) {
				return null;
			}
			
			let d, h, m, s;
			s = Math.floor(milli / 1000);
			m = Math.floor(s / 60);
			s %= 60;
			h = Math.floor(m / 60);
			m %= 60;
			d = Math.floor(h / 24);
			h %= 24;
            let yazi;
            if (d !== 0) yazi = `${d} day(s)`;
			if (h !== 0 && yazi) yazi += `, ${h} hour(s)`;
			if (h !== 0 && !yazi) yazi = `${h} hour(s)`;
			if (m !== 0 && yazi) yazi += `, ${m} minute(s)`;
			if (m !== 0 && !yazi) yazi = `${m} minute(s)`;
			if (s !== 0 && yazi) yazi += `, ${s} second(s)`;
			if (s !== 0 && !yazi) yazi = `${s} second(s)`;
			if (yazi) return yazi;
			if (!yazi) return `1 second(s)`;
		};
		
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`This guild even not has a suggestion channel!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`You must provide a suggestion number to look.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Can't find a suggestion with this suggestion number in this guild.`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`This guild's suggestion channel has been deleted, so you can't look suggestions in this guild until admins setting a new suggestion channel.`)
		message.channel.createMessage({
			embed: {
				title: `Info of Suggestion #${sugid}`,
				description: `**Status:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.status`).replace('awaiting approval', 'awaiting verification')}\n**Author:** <@${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}>\n**Sended at:** ${destructMS(Date.now() - db.fetch(`suggestion_${message.guildID}_${sugid}.timestamp`))}\n**Suggestion:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`)}`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
	
	if (dil == "turkish") {
		
		function destructMSTR(milli) {
			if (isNaN(milli) || milli < 0) {
				return null;
			}
			
			let d, h, m, s;
			s = Math.floor(milli / 1000);
			m = Math.floor(s / 60);
			s %= 60;
			h = Math.floor(m / 60);
			m %= 60;
			d = Math.floor(h / 24);
			h %= 24;
            let yazi;
            if (d !== 0) yazi = `${d} gün`;
			if (h !== 0 && yazi) yazi += `, ${h} saat`;
			if (h !== 0 && !yazi) yazi = `${h} saat`;
			if (m !== 0 && yazi) yazi += `, ${m} dakika`;
			if (m !== 0 && !yazi) yazi = `${m} dakika`;
			if (s !== 0 && yazi) yazi += `, ${s} saniye`;
			if (s !== 0 && !yazi) yazi = `${s} saniye`;
			if (yazi) return yazi;
			if (!yazi) return `1 saniye`;
		};
		
		if (!db.has(`suggestionchannel_${message.guildID}`)) return message.channel.createMessage(`Bu sunucunun daha bir öneri kanalı yok!`)
		const sugid = args[0]
		if (!sugid) return message.channel.createMessage(`Bakmak için bir öneri numarası girmelisin.`)
		if (!db.has(`suggestion_${message.guildID}_${sugid}`)) return message.channel.createMessage(`Bu sunucuda bu öneri numarası ile herhangi bir öneri bulunamadı.`)
		if (!client.guilds.get(message.guildID).channels.get(db.fetch(`suggestionchannel_${message.guildID}`))) return message.channel.createMessage(`Bu sunucunun öneri kanalı silinmiş, bu sebeple yöneticiler yeni bir öneri kanalı seçene kadar önerilere bakamazsın.`)
		message.channel.createMessage({
			embed: {
				title: `Öneri #${sugid} Bilgi`,
				description: `**Durum:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.status`).replace('awaiting approval', 'doğrulama bekliyor').replace('new', 'yeni').replace('approved', 'onaylanmış').replace('denied', 'reddedilmiş').replace('invalid', 'geçersiz').replace('potentional', 'düşünülecek')}\n**Yazar:** <@${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}>\n**Gönderildiği zaman:** ${destructMSTR(Date.now() - db.fetch(`suggestion_${message.guildID}_${sugid}.timestamp`))}\n**Öneri:** ${db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`)}`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
}

module.exports.help = {
	name: "suggestioninfo",
	nametr: "öneribilgi",
	aliase: [ "öneribilgi" ],
	descriptionen: "Allows to look any suggestion's info.",
	descriptiontr: "Herhangi bir öneriye bakmanıza yarar.",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'public'
}

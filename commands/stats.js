const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		message.channel.createMessage({
			embed: {
				title: `**__Bot stats__**`,
				description: `**Users (may not show correct number)** ${client.users.size}\n**Guilds** ${client.guilds.size}\n**If you want to support Suggestions** [Add bot](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Vote Suggestions bot](https://top.gg/bot/709351286922936362/vote)`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
	
	if (dil == "turkish") {
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		message.channel.createMessage({
			embed: {
				title: `**__Bot istatistikleri__**`,
				description: `**Kullanıcılar (doğru sayıyı göstermeyebilir)** ${client.users.size}\n**Sunucular** ${client.guilds.size}\n**Suggestions'u desteklemek isterseniz** [Botu ekle](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Suggestions botu oyla](https://top.gg/bot/709351286922936362/vote)`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
}

module.exports.help = {
	name: "stats",
	nametr: "istatistikler",
	aliase: [ "istatistik", "stat", "istatistikler" ],
	descriptionen: "Shows the bot's stats.",
	descriptiontr: "Botun istatistiklerini gösterir.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'public'
}

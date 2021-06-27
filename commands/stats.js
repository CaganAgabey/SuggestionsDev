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
				description: `**Total shards** ${client.shardCount}\n**Guilds in this shard** ${client.guilds.size}\n**Total guilds** ${db.fetch(`totalservers`)}\n**If you want to support Suggestions** [Add bot](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Vote Suggestions bot](https://top.gg/bot/709351286922936362/vote)`,
				color: colorToSignedBit("#2F3136")
			}
		})
	}
	
	if (dil == "turkish") {
		const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
		message.channel.createMessage({
			embed: {
				title: `**__Bot istatistikleri__**`,
				description: `**Toplam shard sayısı** ${client.shardCount}\n**Bu sharddaki sunucu sayısı** ${client.guilds.size}\n**Toplam sunucu sayısı** ${db.fetch(`totalservers`)}\n**Suggestions'u desteklemek isterseniz** [Botu ekle](https://discord.com/api/oauth2/authorize?client_id=709351286922936362&permissions=8&scope=bot) **|** [Bota oy ver](https://top.gg/bot/709351286922936362/vote)`,
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

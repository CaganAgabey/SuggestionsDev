const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	let dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || "."
		const sug = args.join(" ")
		if (!sug) return message.channel.createMessage(`You must give a suggestion.`)
		client.users.get('343412762522812419').getDMChannel().then(async ch => ch.createMessage({
			embed: {
				title: 'New suggestion',
				description: sug + `\n \n**Sender:** ${message.author.id}\n**Sended in guild:** ${message.guildID}\n**Sended in channel:** ${message.channel.id}`
			}
		}))
		message.channel.createMessage(`Suggestion sent to bot owner successfully!`)
	}
	
	if (dil == "turkish") {
		
		let prefix = db.fetch(`prefix_${message.guildID}`) || "."
		const sug = args.join(" ")
		if (!sug) return message.channel.createMessage(`Bir öneri vermelisin.`)
		client.users.get('343412762522812419').getDMChannel().then(async ch => ch.createMessage({
			embed: {
				title: 'New suggestion',
				description: sug + `\n \n**Sender:** ${message.author.id}\n**Sended in guild:** ${message.guildID}\n**Sended in channel:** ${message.channel.id}`
			}
		}))
		message.channel.createMessage(`Öneri başarıyla bot sahibine gönderildi!`)
	}
}

module.exports.help = {
	name: "botsuggest",
	nametr: "botöneri",
	aliase: [ "botöneri" ],
	descriptionen: "Give a suggestion about bot to developer.",
	descriptiontr: "Geliştiriciye bot hakkında bir öneri ver.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'public'
}

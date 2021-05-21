const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	if (message.author.id != "343412762522812419") return;
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
	const thechangelog = args.join(" ");
	if (!thechangelog) return message.channel.createMessage(`You must provide a changelog.`);
	db.push('changelog', thechangelog);
	const changelogmap = db.fetch(`changelog`).map(c => `<:rightarrow:709539888411836526> ` + c + `\n`).join('');
	message.channel.createMessage({
		content: 'Succesfully added!',
		embed: {
		  title: `**__Update changelog__**`,
          description: changelogmap,
          color: colorToSignedBit("#2F3136")
		}
	})
}

module.exports.help = {
	name: "addchangelog",
	aliase: [ "add-change-log" ],
	descriptionen: "Shows the bot's stats.",
	descriptiontr: "Botun istatistiklerini gösterir.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'owner'
}

const Eris = require("eris");
const db = require('quick.db');

module.exports.run = async (client, message, args) => {
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	
	if (dil == "english") {
	}
	
	if (dil == "turkish") {
	}
}

module.exports.help = {
	name: "suggest",
	nametr: "öner",
	aliase: [ "suggestion", "öner", "öneri", "öneriver", "givesuggestion", "suggestiongive" ],
	descriptionen: "Send a suggestion. (You can simply message your suggestion to the suggestion channel too)",
	descriptiontr: "Öneri gönderme. (Önerinizi direkt öneri kanalına da yazabilirsin)",
	usageen: "prefix [new prefix]",
	usagetr: "önek [yeni önek]",
	category: 'owner'
}

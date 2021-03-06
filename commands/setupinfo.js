const Eris = require("eris");
const arkdb = require('ark.db');

module.exports.run = async (client, message, args) => {
	const db = client.db
	
	function colorToSignedBit(s) {
		return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	
	const dil = db.fetch(`dil_${message.guildID}`) || "english";
	const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
	
	if (dil == "english") {
		message.channel.createMessage({
			embed: {
				title: '__**How to setup the bot**__',
				description: `<:rightarrow:709539888411836526> **1)** You must set a suggestion channel with **${prefix}setchannel** to send suggestions. You can provide a channel name, channel ID or channel mention. When you set this channel, everything is done but you can change extra settings.\n \n<:rightarrow:709539888411836526> **2)** You can allow/deny voting in suggestions with **${prefix}allowvoting**.\n \n<:rightarrow:709539888411836526> **3)** You can set the bot's language with **${prefix}language** command.\n \n<:rightarrow:709539888411836526> **4)** You can set a review channel with **${prefix}reviewchannel** command. When there is a new suggestion, firstly this suggestion will be sent to this channel. When a staff verifies that suggestion, shows up in suggestion channel.\n \n<:rightarrow:709539888411836526> **5)** You can open autoapprove/autodeny with **${prefix}autoapprove** and **${prefix}autodeny**. In autoapprove and autodeny systems when a suggestion's thumbsup or thumbsdown emoji count reaches to provided number, that suggestion will be approved or denied.\n \n<:rightarrow:709539888411836526> **6)** You can set staff roles to manage suggestions with **${prefix}staffrole** command. You can add with \`add\` option, remove with \`remove\` option and list roles with \`list\` option.\n \n<:rightarrow:709539888411836526> **7)** You can set different channels for different suggestion types with **${prefix}approvedchannel**, **${prefix}deniedchannel**, **${prefix}invalidchannel** and **${prefix}potentionalchannel** commands.\n \n<:rightarrow:709539888411836526> **8)** You can set a prefix for the bot with **${prefix}prefix**.\n \nYou can look other settings with **${prefix}admin** command. You can see your server's config with **${prefix}config**.\n \n**IMPORTANT NOTE:** The messages that doesn't start with bot prefix in the suggestion channel will be counted as suggestion. You can close it with \`${prefix}messagingsuggestionchannel\``,
				color: colorToSignedBit("#2F3136"),
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		})
	}
	
	if (dil == "turkish") {
		message.channel.createMessage({
			embed: {
				title: '__**Bu bot nas??l kurulur**__',
				description: `<:rightarrow:709539888411836526> **1) ${prefix}kanalse??** ile ??nerilerin g??nderilece??i bir kanal se??in. Bir kanal ismi, kanal IDsi veya kanal etiketi belirtebilirsiniz. Bu kanal?? se??ti??inizde, kurulum bitmi?? olacakt??r fakat bottaki ekstra ayarlar?? yapabilirsiniz.\n \n<:rightarrow:709539888411836526> **2)** ??nerilerde oylamay?? **${prefix}oylamaizni** ile a????p kapatabilirsiniz.\n \n<:rightarrow:709539888411836526> **3)** Botun dilini **${prefix}dil** ile de??i??tirebilirsiniz.\n \n<:rightarrow:709539888411836526> **4)** **${prefix}do??rulamakanal??** ile bir do??rulama kanal?? se??ebilirsiniz. Bir ??neri gelince ??ncelikle bu kanala g??nderilir. Bu kanalda bir yetkili ??neriyi do??ruland??????nda ??neriler kanal??nda g??sterilir.\n \n<:rightarrow:709539888411836526> **5)** Otomatik onaylamay?? ve otomatik reddetmeyi **${prefix}otomatikonay** ve **${prefix}otomatikred** komutlar?? ile belirleyebilirsiniz. Otomatik onay ve otomatik red sistemlerinde bir ??nerinin onay ve red emoji say??s?? belirledi??iniz say??ya ula????nca ??neri otomatik i??leme al??n??r.\n \n<:rightarrow:709539888411836526> **6)** **${prefix}yetkilirol** komuduyla ??nerileri y??netecek yetkili rolleri se??ebilirsiniz. \`ekle\` se??ene??i ile ekler, \`sil\` se??ene??i ile siler, \`liste\` ile rolleri g??r??nt??lersiniz.\n \n<:rightarrow:709539888411836526> **7)** Belirli ??neri t??rleri i??in **${prefix}onaylanm??????nerikanal??**, **${prefix}reddedilen??nerikanal??**, **${prefix}ge??ersiz??nerikanal??** ve **${prefix}d??????n??lecek??nerikanal??** komutlar??yla ??zel kanallar belirleyebilirsiniz.\n \n<:rightarrow:709539888411836526> **8) ${prefix}??nek** komuduyla bir ??nek belirleyebilirsiniz.\n \nGeri kalan t??m ayarlar, **${prefix}y??netici** men??s??nde vard??r. **${prefix}ayarlar** ile yapt??????n??z ayarlar?? g??r??nt??leyebilirsiniz.\n \n**??NEML?? NOT:** ??neri kanal??na mesaj??n ba????na bot ??neki konulmadan yaz??lan t??m mesajlar ??neri olarak kaydedilecektir. Bunu \`${prefix}??nerikanal??namesajg??nderme\` ile kapatabilirsiniz`,
				color: colorToSignedBit("#2F3136"),
				footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
			}
		})
	}
}

module.exports.help = {
	name: "setupinfo",
	nametr: "kurulumbilgi",
	aliase: [ "kurulumyard??m", "setuphelp", "kurulumbilgi" ],
	descriptionen: "Shows how to setup the bot.",
	descriptiontr: "Botun nas??l kurulaca????n?? g??sterir.",
	usageen: "staff",
	usagetr: "yetkili",
	category: 'help'
}

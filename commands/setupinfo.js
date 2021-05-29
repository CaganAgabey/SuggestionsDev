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
      message.channel.createMessage({embed: {title: '__**How to setup the bot**__', description: `<:rightarrow:709539888411836526> **1)** You must set a suggestion channel with **${prefix}setchannel** to send suggestions. You can provide a channel name, channel ID or channel mention. When you set this channel, everything is done but you can change extra settings.\n \n<:rightarrow:709539888411836526> **2)** You can allow/deny voting in suggestions with **${prefix}allowvoting**.\n \n<:rightarrow:709539888411836526> **3)** You can set the bot's language with **${prefix}language** command.\n \n<:rightarrow:709539888411836526> **4)** You can set a review channel with **${prefix}reviewchannel** command. When there is a new suggestion, firstly this suggestion will be sent to this channel. When a staff verifies that suggestion, shows up in suggestion channel.\n \n<:rightarrow:709539888411836526> **5)** You can open autoapprove/autodeny with **${prefix}autoapprove** and **${prefix}autodeny**. In autoapprove and autodeny systems when a suggestion's thumbsup or thumbsdown emoji count reaches to provided number, that suggestion will be approved or denied.\n \n<:rightarrow:709539888411836526> **6)** You can set staff roles to manage suggestions with **${prefix}staffrole** command. You can add with \`add\` option, remove with \`remove\` option and list roles with \`list\` option.\n \n<:rightarrow:709539888411836526> **7)** You can set different channels for different suggestion types with **${prefix}approvedchannel**, **${prefix}deniedchannel**, **${prefix}invalidchannel** and **${prefix}potentionalchannel** commands.\n \n<:rightarrow:709539888411836526> **8)** You can set a prefix for the bot with **${prefix}prefix**.\n \nYou can look other settings with **${prefix}admin** command. You can see your server's config with **${prefix}setup**.\n**IMPORTANT NOTE:** The messages that doesn't start with bot prefix in the suggestion channel will be counted as suggestion. You can close it with \`${prefix}messagingsuggestionchannel\``, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
  }

  if (dil == "turkish") {
    let prefix = db.fetch(`prefix_${message.guildID}`) || "."
      message.channel.createMessage({embed: {title: '__**Bu bot nasıl kurulur**__', description: `<:rightarrow:709539888411836526> **1) ${prefix}kanalseç** ile önerilerin gönderileceği bir kanal seçin. Bir kanal ismi, kanal IDsi veya kanal etiketi belirtebilirsiniz. Bu kanalı seçtiğinizde, kurulum bitmiş olacaktır fakat bottaki ekstra ayarları yapabilirsiniz.\n \n<:rightarrow:709539888411836526> **2)** Önerilerde oylamayı **${prefix}oylamaizni** ile açıp kapatabilirsiniz.\n \n<:rightarrow:709539888411836526> **3)** Botun dilini **${prefix}dil** ile değiştirebilirsiniz.\n \n<:rightarrow:709539888411836526> **4)** **${prefix}doğrulamakanalı** ile bir doğrulama kanalı seçebilirsiniz. Bir öneri gelince öncelikle bu kanala gönderilir. Bu kanalda bir yetkili öneriyi doğrulandığında öneriler kanalında gösterilir.\n \n<:rightarrow:709539888411836526> **5)** Otomatik onaylamayı ve otomatik reddetmeyi **${prefix}otomatikonay** ve **${prefix}otomatikred** komutları ile belirleyebilirsiniz. Otomatik onay ve otomatik red sistemlerinde bir önerinin onay ve red emoji sayısı belirlediğiniz sayıya ulaşınca öneri otomatik işleme alınır.\n \n<:rightarrow:709539888411836526> **6)** **${prefix}yetkilirol** komuduyla önerileri yönetecek yetkili rolleri seçebilirsiniz. \`ekle\` seçeneği ile ekler, \`sil\` seçeneği ile siler, \`liste\` ile rolleri görüntülersiniz.\n \n<:rightarrow:709539888411836526> **7)** Belirli öneri türleri için **${prefix}onaylanmışönerikanalı**, **${prefix}reddedilenönerikanalı**, **${prefix}geçersizönerikanalı** ve **${prefix}düşünülecekönerikanalı** komutlarıyla özel kanallar belirleyebilirsiniz.\n \n<:rightarrow:709539888411836526> **8) ${prefix}önek** komuduyla bir önek belirleyebilirsiniz.\n \nGeri kalan tüm ayarlar, **${prefix}yönetici** menüsünde vardır. **${prefix}ayarlar** ile yaptığınız ayarları görüntüleyebilirsiniz.\n**ÖNEMLİ NOT:** Öneri kanalına mesajın başına bot öneki konulmadan yazılan tüm mesajlar öneri olarak kaydedilecektir. Bunu \`${prefix}önerikanalınamesajgönderme\` ile kapatabilirsiniz`, color: colorToSignedBit("#2F3136"), footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}}})
  }
}

module.exports.help = {
  name: "setupinfo",
  nametr: "kurulumbilgi",
  aliase: ["kurulumyardım", "setuphelp", "kurulumbilgi"],
  descriptionen: "Shows how to setup the bot.",
  descriptiontr: "Botun nasıl kurulacağını gösterir.",
  usageen: "staff",
  usagetr: "yetkili",
  category: 'help'
}

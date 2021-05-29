const Eris = require("eris");
const arkdb = require('ark.db');

exports.run = async (client, message, args) => {
    const db = client.db
if (message.author.id != "343412762522812419") return;

  if(!args[0]) return
    try {
        const codein = args.join(" ");
        let code = eval(codein);

        if (typeof code !== 'string')
            code = require('util').inspect(code, { depth: 0 });
        message.channel.createMessage(`\`\`\`js\n${code}\n\`\`\``)
    } catch(e) {
        message.channel.createMessage(`\`\`\`js\n${e.stack}\n\`\`\``);
    }
}

module.exports.help = {
    name: "eval",
    aliase: [],
    descriptionen: "Shows the commands.",
    descriptiontr: "Bot gecikmesini gösterir.",
    usageen: "ping",
    usagetr: "ping",
    category: 'owner'
  }

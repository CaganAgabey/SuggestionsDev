const Eris = require('eris');
const fs = require('fs');
const client = new Eris("");
const db = require('quick.db');
client.commands = new Eris.Collection(undefined, undefined);
client.aliases = new Eris.Collection(undefined, undefined);
const DBL = require('dblapi.js')
const dbl = new DBL("")
const awaitingsuggestions = new Eris.Collection(undefined, undefined)
let version = "0.5.2"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function colorToSignedBit(s) {
  return (parseInt(s.substr(1), 16) << 8) / 256;
}

fs.readdir("./commands/", async (err, files) => {
  if (err) console.log(err);
  if (!files) return console.log("Unable to find commands.");
  const jsfile = files.filter(f => f.split(".").pop() == "js");
  if (jsfile.length <= 0) {
    console.log("Unable to find commands.");
    return;
  }
  
  for (const f of jsfile) {
    const props = require(`./commands/${f}`);
    console.log(`${f} loaded`);
    client.commands.set(props.help.name, props);
    for (const aliase of props.help.aliase) {
      client.aliases.set(aliase, props)
    }
  }
  ;
  console.log("All commands have been loaded successfully.")
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  client.editStatus("online", {name: `.help | .invite (v${version})`, type: 5})
  setInterval(async () => dbl.postStats(client.guilds.size), 600000)
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  const prefix = message.guildID ? db.fetch(`prefix_${message.guildID}`) || "." : ".";
  if (!message.content.startsWith(prefix)) return;
  if (!message.guildID) return message.channel.createMessage(`You can't use commands via DMs in this bot. You can only receive suggestion updates via DMs in this bot.`)
  const messageArray = message.content.split('  ').join(' ').split(" ");
  const cmd = messageArray[0];
  const args = messageArray.slice(1);
  
  let commandfile = client.commands.get(cmd.slice(prefix.length));
  if (!commandfile) commandfile = client.aliases.get(cmd.slice(prefix.length))
  if (commandfile) commandfile.run(client, message, args);
})

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guildID) return;
  if (!db.has(`suggestionchannel_${message.guildID}`)) return;
  if (db.fetch(`suggestionchannel_${message.guildID}`) != message.channel.id) return;
  const dil = db.fetch(`dil_${message.guildID}`) || "english";
  const prefix = db.fetch(`prefix_${message.guildID}`) || ".";
  if (message.content.startsWith(prefix)) return;
  message.delete()
  if (dil == "english") {
    if (db.has(`reviewchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) {
      let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
      if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
      awaitingsuggestions.set(message.guildID, oldsugssize + 1)
      let approveemoji = `👍`
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
      let denyemoji = `👎`
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'awaiting approval',
        author: message.author.id,
        suggestion: message.content,
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji
      })
      message.channel.createMessage(`Successfully sent the suggestion to approval queue! When your suggestion get approved, it will show up here.`).then(async msg =>
          message.channel.guild.channels.get(db.fetch(`reviewchannel_${message.guildID}`)).createMessage({
            embed: {
              title: `Suggestion #${oldsugssize + 1} (awaiting approval)`,
              description: message.content.replace(`${prefix}suggest`, '').replace(`${prefix}suggestion`, '').replace(`${prefix}öner`, '').replace(`${prefix}öneri`, ''),
              color: 4934475,
              author: {
                name: `Awaiting suggestion - ${message.author.username}#${message.author.discriminator}`,
                icon_url: message.author.avatarURL || message.author.defaultAvatarURL
              },
              footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
            }
          }).then(async msgg => {
            msgg.addReaction(`✅`)
            await sleep(75)
            msgg.addReaction(`❌`)
            db.set(`suggestion_${message.guildID}_${oldsugssize + 1}.msgid`, msgg.id)
            await sleep(9000)
            msg.delete()
          }))
      return
    }
    let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
    if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
    awaitingsuggestions.set(message.guildID, oldsugssize + 1)
    let approveemoji = `👍`
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
    let denyemoji = `👎`
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
    message.channel.createMessage({
      embed: {
        title: `Suggestion #${oldsugssize + 1}`,
        description: message.content.replace(`${prefix}suggest`, '').replace(`${prefix}suggestion`, '').replace(`${prefix}öner`, '').replace(`${prefix}öneri`, ''),
        color: colorToSignedBit("#00FFFF"),
        author: {
          name: `New suggestion - ${message.author.username}#${message.author.discriminator}`,
          icon_url: message.author.avatarURL || message.author.defaultAvatarURL
        },
        footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
      }
    }).then(async msg => {
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'new',
        msgid: msg.id,
        author: message.author.id,
        suggestion: message.content,
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji
      })
      if (!db.has(`denyvoting_${message.guildID}`)) {
        msg.addReaction(approveemoji)
        await sleep(75)
        msg.addReaction(denyemoji)
      }
    })
  }
  
  if (dil == "turkish") {
    if (db.has(`reviewchannel_${message.guildID}`) && message.channel.guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) {
      let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
      if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
      awaitingsuggestions.set(message.guildID, oldsugssize + 1)
      let approveemoji = `👍`
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
      let denyemoji = `👎`
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'awaiting approval',
        author: message.author.id,
        suggestion: message.content,
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji
      })
      message.channel.createMessage(`Öneri başarıyla doğrulama sırasına gönderildi! Önerin onaylandığında, bu kanalda gözükecektir.`).then(async msg =>
          message.channel.guild.channels.get(db.fetch(`reviewchannel_${message.guildID}`)).createMessage({
            embed: {
              title: `Öneri #${oldsugssize + 1} (doğrulama bekliyor)`,
              description: message.content.replace(`${prefix}suggest`, '').replace(`${prefix}suggestion`, '').replace(`${prefix}öner`, '').replace(`${prefix}öneri`, ''),
              color: 4934475,
              author: {
                name: `Bekleyen öneri - ${message.author.username}#${message.author.discriminator}`,
                icon_url: message.author.avatarURL || message.author.defaultAvatarURL
              },
              footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
            }
          }).then(async msgg => {
            msgg.addReaction(`✅`)
            msgg.addReaction(`❌`)
            db.set(`suggestion_${message.guildID}_${oldsugssize + 1}.msgid`, msgg.id)
            await sleep(9000)
            msg.delete()
          }))
      return
    }
    let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
    if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
    awaitingsuggestions.set(message.guildID, oldsugssize + 1)
    let approveemoji = `👍`
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
    let denyemoji = `👎`
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + message.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
    message.channel.createMessage({
      embed: {
        title: `Öneri #${oldsugssize + 1}`,
        description: message.content.replace(`${prefix}suggest`, '').replace(`${prefix}suggestion`, '').replace(`${prefix}öner`, '').replace(`${prefix}öneri`, ''),
        color: colorToSignedBit("#00FFFF"),
        author: {
          name: `Yeni öneri - ${message.author.username}#${message.author.discriminator}`,
          icon_url: message.author.avatarURL || message.author.defaultAvatarURL
        },
        footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
      }
    }).then(async msg => {
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'new',
        msgid: msg.id,
        author: message.author.id,
        suggestion: message.content.replace(`${prefix}suggest`, '').replace(`${prefix}suggestion`, '').replace(`${prefix}öner`, '').replace(`${prefix}öneri`, ''),
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji
      })
      if (!db.has(`denyvoting_${message.guildID}`)) {
        msg.addReaction(approveemoji)
        msg.addReaction(denyemoji)
      }
    })
  }
})

client.on('guildCreate', async guild => {
  let role = null;
  const everyonerole = guild.roles.find(r => r.name.toLowerCase().includes("everyone"))
  if (guild.memberCount >= 5000) role = everyonerole
  else {
    guild.fetchMembers({limit: 5000}).then(async members => {
      for (const r of guild.roles) {
        let currentnumber = members.filter(m => m.roles.includes(r.id)).length
        if (currentnumber / guild.memberCount >= 0.75) {
          if (role == null) role = r;
          else {
            if (currentnumber > members.filter(m => m.roles.includes(role.id)).length) role = r;
          }
        }
      }
    })
    if (role == null) role = everyonerole
  }
  let channels = guild.channels.filter(c => c.type == 0 && c.permissionOverwrites.has(role.id) && JSON.stringify(c.permissionOverwrites.get(role.id).json).includes('sendMessages') && c.permissionOverwrites.get(role.id).json.sendMessages != false)
  if (channels.length <= 0) channels = guild.channels.filter(c => c.type == 0 && !c.permissionOverwrites.has(role.id) && !c.permissionOverwrites.has(everyonerole.id));
  if (channels.length <= 0) return;
  let lasttimestamp = 0;
  let channel;
  if (channels.length > 1) {
    for (const ch of channels) {
      ch.getMessages({limit: 1}).then(async msg => {
        if (msg[0].timestamp > lasttimestamp) {
          lasttimestamp = msg[0].timestamp
          channel = ch
        }
      })
    }
  }else channel = channels[0]
  if (db.has(`botcekilis`)) channel.createMessage({
    embed: {
      title: '**__Thanks for adding Suggestions bot!__**',
      description: `This bot allows you to manage your suggestions in server easily. You can see the possible commands with **.help** command. This bot won't work if you don't set any suggestion channel.\n \n**You can get help about the setup** With **.setupinfo** command.\n \n**This bot made by** ${client.users.get('343412762522812419').username}#${client.users.get('343412762522812419').discriminator}\n \n**If you have any cool idea for bot** Use **.botsuggest** command to send suggestions to owner.\n \n**Note:** In order to work properly, bot should have manage messages permission.\n \n<:rightarrow:709539888411836526> There is an active giveaway in this bot!\n**Giveaway** ${db.fetch(`botcekilis.english`)}\n**Join with** .giveaway`,
      color: colorToSignedBit("#2F3136"),
      author: {name: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
      footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
    }
  })
  if (!db.has(`botcekilis`)) channel.createMessage({
    embed: {
      title: '**__Thanks for adding Suggestions bot!__**',
      description: `This bot allows you to manage your suggestions in server easily. You can see the possible commands with **.help** command. This bot won't work if you don't set any suggestion channel.\n \n**You can get help about the bot setup** With **.setupinfo** command.\n \n**This bot made by** ${client.users.get('343412762522812419').username}#${client.users.get('343412762522812419').discriminator}\n \n**If you have any cool idea for bot** Use **.botsuggest** command to send suggestions to owner.\n \n**Note:** In order to work properly, bot should have manage messages permission.`,
      color: colorToSignedBit("#2F3136"),
      author: {name: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
      footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
    }
  })
})

client.on('messageReactionAdd', async (message, emoji, user) => {
  if (client.users.get(user.id).bot) return;
  if (!message.guildID) return;
  if (db.has(`suggestionchannel_${message.guildID}`) && db.fetch(`suggestionchannel_${message.guildID}`) != message.channel.id) return;
  if (!db.has(`autoapprove_${message.guildID}`) && !db.has(`autodeny_${message.guildID}`)) return;
  if (db.all().filter(x => x.ID.startsWith(`suggestion_${message.guildID}_`) && db.fetch(`${x.ID}.msgid`) == message.id).length == 0) return;
  const sugname = db.all().filter(x => x.ID.startsWith(`suggestion_${message.guildID}_`) && db.fetch(`${x.ID}.msgid`) == message.id)[0].ID
  client.guilds.get(message.guildID).channels.get(message.channel.id).getMessage(message.id).then(async msg => {
    const dil = db.fetch(`dil_${msg.guildID}`) || "english";
    msg.getReaction(db.fetch(`${sugname}.approveemoji`)).then(async rec => {
      if (!db.has(`autoapprove_${msg.guildID}`)) return;
      if (rec.length - 1 >= db.fetch(`autoapprove_${msg.guildID}`)) {
        if (dil == "english") {
          const sugid = Number(msg.embeds[0].title.replace('Suggestion #', '').replace('Öneri #', ''))
          const user = client.users.get(db.fetch(`suggestion_${message.guildID}_${sugid}.author`))
          if (!db.has(`approvedchannel_${message.guildID}`) || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`)) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id) {
            msg.edit({
              embed: {
                title: `Suggestion #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FFFF000"),
                author: {
                  name: `Approved suggestion - ${user.username}#${user.discriminator}`,
                  icon_url: user.avatarURL || user.defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`approvedchannel_${message.guildID}`) && msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`)) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            msg.channel.guild.channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Suggestion #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FF000"),
                author: {
                  name: `Approved suggestion - ${user.username}#${user.discriminator}`,
                  icon_url: user.avatarURL || user.defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${msg.guildID}_${sugid}.status`, 'approved')
          if (msg) msg.removeReactions()
          if (!db.has(`denydm_${user.id}`)) user.getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Your suggestion has approved!',
              description: `Your suggestion has approved in \`${msg.channel.guild.name}\`.\n**Suggestion:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Suggestion number:** ${sugid}`,
              color: colorToSignedBit("#00FF000")
            }
          }))
        }
        if (dil == "turkish") {
          const sugid = msg.embeds[0].title.replace('Öneri #', '').replace('Suggestion #', '')
          const user = client.users.get(db.fetch(`suggestion_${message.guildID}_${sugid}.author`))
          if (!db.has(`approvedchannel_${message.guildID}`) || !msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`)) || db.fetch(`approvedchannel_${message.guildID}`) == msg.channel.id) {
            msg.edit({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FF000"),
                author: {
                  name: `Onaylanmış öneri - ${user.username}#${user.discriminator}`,
                  icon_url: user.avatarURL || user.defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`approvedchannel_${message.guildID}`) && msg.channel.guild.channels.has(db.fetch(`approvedchannel_${message.guildID}`)) && db.fetch(`approvedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            msg.channel.guild.channels.get(db.fetch(`approvedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FF000"),
                author: {
                  name: `Onaylanmış öneri - ${user.username}#${user.discriminator}`,
                  icon_url: user.avatarURL || user.defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${msg.guildID}_${sugid}.status`, 'approved')
          if (msg) msg.removeReactions()
          if (!db.has(`denydm_${user.id}`)) user.getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Önerin onaylandı!',
              description: `Önerin \`${msg.channel.guild.name}\` adlı sunucuda onaylandı.\n**Öneri:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}`,
              color: colorToSignedBit("#00FF000")
            }
          }))
        }
      }
    })
    msg.getReaction(db.fetch(`${sugname}.denyemoji`)).then(async rec => {
      if (!db.has(`autodeny_${msg.guildID}`)) return;
      if (rec.length - 1 >= db.fetch(`autodeny_${msg.guildID}`)) {
        if (dil == "english") {
          const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace('Öneri #', '')
          const user = client.users.get(db.fetch(`suggestion_${message.guildID}_${sugid}.author`))
          if (!db.has(`deniedchannel_${message.guildID}`) || !msg.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`)) || db.fetch(`deniedchannel_${message.guildID}`) == msg.channel.id) {
            msg.edit({
              embed: {
                title: `Suggestion #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: 16711680,
                author: {
                  name: `Denied suggestion - ${user.username}#${user.discriminator}`,
                  icon_url: user.avatarURL || user.defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`deniedchannel_${message.guildID}`) && db.fetch(`deniedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            msg.channel.guild.channels.get(db.fetch(`deniedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Suggestion #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: 16711680,
                author: {
                  name: `Denied suggestion - ${user.username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${msg.guildID}_${sugid}.status`, 'denied')
          if (msg) msg.removeReactions()
          if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${msg.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Your suggestion has denied!',
              description: `Your suggestion has denied in \`${msg.channel.guild.name}\`.\n**Suggestion:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Suggestion number:** ${sugid}`,
              color: 16711680
            }
          }))
        }
        if (dil == "turkish") {
          const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace('Öneri #', '')
          if (!db.has(`deniedchannel_${message.guildID}`) || db.fetch(`deniedchannel_${message.guildID}`) == msg.channel.id || !msg.channel.guild.channels.has(db.fetch(`deniedchannel_${message.guildID}`))) {
            msg.edit({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: 16711680,
                author: {
                  name: `Reddedilmiş öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            })
            db.set(`suggestion_${message.guildID}_${sugid}.channel`, msg.channel.id)
          }
          if (db.has(`deniedchannel_${message.guildID}`) && db.fetch(`deniedchannel_${message.guildID}`) != msg.channel.id) {
            msg.delete()
            client.guilds.get(message.guildID).channels.get(db.fetch(`deniedchannel_${message.guildID}`)).createMessage({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${message.guildID}_${sugid}.suggestion`),
                color: 16711680,
                author: {
                  name: `Reddedilmiş öneri - ${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).username}#${client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).avatarURL || client.users.find(u => u.id == db.fetch(`suggestion_${message.guildID}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL},
                image: {url: db.fetch(`suggestion_${message.guildID}_${sugid}.attachment`)}
              }
            }).then(async masg => {
              db.set(`suggestion_${message.guildID}_${sugid}.channel`, masg.channel.id)
              db.set(`suggestion_${message.guildID}_${sugid}.msgid`, masg.id)
            })
          }
          db.set(`suggestion_${msg.guildID}_${sugid}.status`, 'denied')
          if (msg) msg.removeReactions()
          if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${msg.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
            embed: {
              title: 'Önerin reddedildi!',
              description: `Önerin \`${msg.channel.guild.name}\` adlı sunucuda reddedildi.\n**Öneri:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}`,
              color: 16711680
            }
          }))
        }
      }
    })
  })
})

client.on('messageReactionAdd', async (message, emoji, userID) => {
  if (client.users.get(userID.id).bot) return;
  const dil = db.fetch(`dil_${message.guildID}`) || "english";
  const guild = client.guilds.find(gc => gc.channels.has(message.channel.id))
  if (db.has(`reviewchannel_${guild.id}`) && db.fetch(`reviewchannel_${guild.id}`) == message.channel.id) {
    guild.channels.get(message.channel.id).getMessage(message.id).then(async msg => {
      msg.getReaction(`✅`).then(async rec => {
        if (!db.has(`staffrole_${guild.id}`) && !guild.members.get(userID.id).permissions.has('manageMessages')) return;
        if (db.has(`staffrole_${guild.id}`) && !guild.members.get(userID.id).roles.some(r => db.fetch(`staffrole_${msg.guildID}`).includes(r)) && !guild.members.get(userID.id).permissions.has('administrator')) return;
        if (rec.length - 1 >= 1) {
          if (dil == "english") {
            const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', '')
            let approveemoji = `👍`
            if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
            if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
            let denyemoji = `👎`
            if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
            if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
            guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).createMessage({
              embed: {
                title: `Suggestion #${sugid}`,
                description: db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FFFF"),
                author: {
                  name: `New suggestion - ${client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).username}#${client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).avatarURL || client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
              }
            }).then(async msgg => {
              db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
              db.set(`suggestion_${guild.id}_${sugid}.status`, 'new')
              db.set(`suggestion_${guild.id}_${sugid}.approveemoji`, approveemoji)
              db.set(`suggestion_${guild.id}_${sugid}.denyemoji`, denyemoji)
              
              if (!db.has(`denyvoting_${guild.id}`)) {
                msgg.addReaction(approveemoji)
                msgg.addReaction(denyemoji)
              }
              msg.delete()
              if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${msg.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
                embed: {
                  title: 'Your suggestion has verified!',
                  description: `Your suggestion has verified in \`${msg.channel.guild.name}\`.\n**Suggestion:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Suggestion number:** ${sugid}`,
                  color: 6579300
                }
              }))
            })
          }
          if (dil == "turkish") {
            const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', '')
            let approveemoji = `👍`
            if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
            if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
            let denyemoji = `👎`
            if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
            if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + msg.channel.guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
            guild.channels.get(db.fetch(`suggestionchannel_${guild.id}`)).createMessage({
              embed: {
                title: `Öneri #${sugid}`,
                description: db.fetch(`suggestion_${guild.id}_${sugid}.suggestion`),
                color: colorToSignedBit("#00FFFF"),
                author: {
                  name: `Yeni öneri - ${client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).username}#${client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).discriminator}`,
                  icon_url: client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).avatarURL || client.users.get(db.fetch(`suggestion_${guild.id}_${sugid}.author`)).defaultAvatarURL
                },
                footer: {text: client.user.username, icon_url: client.user.avatarURL || client.user.defaultAvatarURL}
              }
            }).then(async msgg => {
              db.set(`suggestion_${guild.id}_${sugid}.msgid`, msgg.id)
              db.set(`suggestion_${guild.id}_${sugid}.status`, 'new')
              db.set(`suggestion_${guild.id}_${sugid}.approveemoji`, approveemoji)
              db.set(`suggestion_${guild.id}_${sugid}.denyemoji`, denyemoji)
              if (!db.has(`denyvoting_${guild.id}`)) {
                msgg.addReaction(approveemoji)
                msgg.addReaction(denyemoji)
              }
              msg.delete()
              if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(db.fetch(`suggestion_${msg.guildID}_${sugid}.author`)).getDMChannel().then(async ch => ch.createMessage({
                embed: {
                  title: 'Önerin doğrulandı!',
                  description: `Önerin \`${msg.channel.guild.name}\` sunucusunda doğrulandı.\n**Öneri:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}`,
                  color: 6579300
                }
              }))
            })
          }
        }
      })
      
      if (msg) {
        msg.getReaction(`❌`).then(async rec => {
          if (!db.has(`staffrole_${guild.id}`) && !guild.members.get(userID.id).permissions.has('manageMessages')) return;
          if (db.has(`staffrole_${guild.id}`) && !guild.members.get(userID.id).roles.some(r => db.fetch(`staffrole_${msg.guildID}`).includes(r)) && !guild.members.get(userID.id).permissions.has('administrator')) return;
          if (rec.length - 1 >= 1) {
            if (dil == "english") {
              const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', '')
              const suggesst = msg.embeds[0].description
              const kisiid = db.fetch(`suggestion_${guild.id}_${sugid}.author`)
              db.set(`suggestion_${guild.id}_${sugid}.status`, 'deleted')
              msg.delete()
              if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(kisiid).getDMChannel().then(async ch => ch.createMessage({
                embed: {
                  title: 'Your suggestion has deleted!',
                  description: `Your suggestion has deleted in \`${msg.channel.guild.name}\`.\n**Suggestion:** ${suggesst}\n**Suggestion number:** ${sugid}`,
                  color: 6579300
                }
              }))
            }
            if (dil == "turkish") {
              const sugid = msg.embeds[0].title.replace('Suggestion #', '').replace(' (awaiting approval)', '').replace('Öneri #', '').replace(' (doğrulama bekliyor)', '')
              const suggesst = msg.embeds[0].description
              const kisiid = db.fetch(`suggestion_${guild.id}_${sugid}.author`)
              db.set(`suggestion_${guild.id}_${sugid}.status`, 'deleted')
              msg.delete()
              if (!db.has(`denydm_${db.fetch(`suggestion_${message.guildID}_${sugid}.author`)}`)) client.users.get(kisiid).getDMChannel().then(async ch => ch.createMessage({
                embed: {
                  title: 'Önerin silindi!',
                  description: `Önerin \`${msg.channel.guild.name}\` sunucusunda silindi.\n**Öneri:** ${suggesst}\n**Öneri numarası:** ${sugid}`,
                  color: 6579300
                }
              }))
            }
          }
        })
      }
    })
  }
})

/*
client.on('messageCreate', async message => {
  if (!message.guildID) return;
  if (message.author.bot) return;
  let prefix = db.fetch(`prefix_${message.guildID}`) || ".";
  let dil = db.fetch(`dil_${message.guildID}`) || "english";
  if (!message.content.startsWith(prefix)) return;
  if (dil == "english") {
    if (message.content.startsWith(`${prefix}denyvoting`)) return message.channel.createMessage(`Use **${prefix}allowvoting** instead of this.`)
    if (message.content.startsWith(`${prefix}suggest `) || message.content.startsWith(`${prefix}suggestion `) || message.content.startsWith(`${prefix}öner `) || message.content.startsWith(`${prefix}öneri `)) return message.channel.createMessage(`Write to the suggestion channel of this guild instead of using this command.`)
    if (message.content.startsWith(`${prefix}approve `) || message.content.startsWith(`${prefix}approvesuggestion `) || message.content.startsWith(`${prefix}onayla `) || message.content.startsWith(`${prefix}onay `) || message.content.startsWith(`${prefix}delete `) || message.content.startsWith(`${prefix}deletesuggestion `) || message.content.startsWith(`${prefix}önerisil `) || message.content.startsWith(`${prefix}sil `) || message.content.startsWith(`${prefix}deny `) || message.content.startsWith(`${prefix}denysuggestion `) || message.content.startsWith(`${prefix}reddet `) || message.content.startsWith(`${prefix}red `) || message.content.startsWith(`${prefix}invalid `) || message.content.startsWith(`${prefix}invalidsuggestion `) || message.content.startsWith(`${prefix}maybe `) || message.content.startsWith(`${prefix}maybesuggestion `) || message.content.startsWith(`${prefix}belki `) || message.content.startsWith(`${prefix}massapprove `) || message.content.startsWith(`${prefix}massapprovesuggestion `) || message.content.startsWith(`${prefix}çokluonayla `) || message.content.startsWith(`${prefix}çokluonay `) || message.content.startsWith(`${prefix}attach `) || message.content.startsWith(`${prefix}attachimage `) || message.content.startsWith(`${prefix}resimekle `)) {
      await sleep(1500)
      message.channel.getMessage(message.channel.lastMessageID).then(async msg =>
          msg.getReaction(`✅`).then(async rec =>
              msg.getReaction(`⏲`).then(async reci => {
                if (msg.author.id != client.user.id && !rec[0]) {
                  if (!reci[0]) {
                    message.getReaction(`✅`).then(async recce =>
                        message.getReaction(`⏲`).then(async reccea => {
                          if (!recce[0] && !reccea[0]) return message.channel.createMessage(`This suggestion's message has been deleted, so you can't manage this suggestion.`)
                        }))
                  }
                }
              })))
    }
  }
  if (dil == "turkish") {
    if (message.content.startsWith(`${prefix}oylamareddi`)) return message.channel.createMessage(`Bunun yerine **${prefix}oylamaizni** kullanın.`)
    if (message.content.startsWith(`${prefix}suggest `) || message.content.startsWith(`${prefix}suggestion `) || message.content.startsWith(`${prefix}öner `) || message.content.startsWith(`${prefix}öneri `)) return message.channel.createMessage(`Bu komudu kullanmak yerine sunucunun öneri kanalına yazın.`)
    if (message.content.startsWith(`${prefix}approve `) || message.content.startsWith(`${prefix}approvesuggestion `) || message.content.startsWith(`${prefix}onayla `) || message.content.startsWith(`${prefix}onay `) || message.content.startsWith(`${prefix}delete `) || message.content.startsWith(`${prefix}deletesuggestion `) || message.content.startsWith(`${prefix}önerisil `) || message.content.startsWith(`${prefix}sil `) || message.content.startsWith(`${prefix}deny `) || message.content.startsWith(`${prefix}denysuggestion `) || message.content.startsWith(`${prefix}reddet `) || message.content.startsWith(`${prefix}red `) || message.content.startsWith(`${prefix}invalid `) || message.content.startsWith(`${prefix}invalidsuggestion `) || message.content.startsWith(`${prefix}maybe `) || message.content.startsWith(`${prefix}maybesuggestion `) || message.content.startsWith(`${prefix}belki `) || message.content.startsWith(`${prefix}massapprove `) || message.content.startsWith(`${prefix}massapprovesuggestion `) || message.content.startsWith(`${prefix}çokluonayla `) || message.content.startsWith(`${prefix}çokluonay `) || message.content.startsWith(`${prefix}attach `) || message.content.startsWith(`${prefix}attachimage `) || message.content.startsWith(`${prefix}resimekle `)) {
      await sleep(1500)
      message.channel.getMessage(message.channel.lastMessageID).then(async msg =>
          msg.getReaction(`✅`).then(async rec =>
              msg.getReaction(`⏲`).then(async reci => {
                if (msg.author.id != client.user.id && !rec[0]) {
                  if (!reci[0]) {
                    message.getReaction(`✅`).then(async recce =>
                        message.getReaction(`⏲`).then(async reccea => {
                          if (!recce[0] && !reccea[0]) return message.channel.createMessage(`Bu önerinin mesajı silinmiş, bu sebeple bu öneriyi yönetemezsin.`)
                        }))
                  }
                }
              })))
    }
  }
})
*/

client.on('messageDelete', async message => {
  await sleep(1000)
  const all = db.all().filter(i => i.ID.startsWith(`suggestion_`) && db.fetch(`${i.ID}.msgid`) == message.id)
  if (all.length != 0) {
    for (const i of all) db.set(`${i.ID}.status`, 'deleted')
  }
})

client.connect();

const Eris = require('eris');
const fs = require('fs');
const settings = require("./settings.json")
const client = new Eris(settings.token);
const arkdb = require('ark.db');
const db = new arkdb.Database()
client.commands = new Eris.Collection(undefined, undefined);
client.aliases = new Eris.Collection(undefined, undefined);
const DBL = require('dblapi.js')
const dbl = new DBL(settings.dbltoken)
const awaitingsuggestions = new Map()
const version = "1.0";
const { manageSuggestion, deleteSuggestion } = require('./functions')

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
  client.editStatus("online", {name: `.help | .information (v${version})`, type: 5})
  setInterval(async () => dbl.postStats(client.guilds.size), 600000)
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  const prefix = message.guildID ? db.fetch(`prefix_${message.guildID}`) || "." : ".";
  if (!message.content.startsWith(prefix)) return;
  const messageArray = message.content.replaceAll('  ', ' ').split(" ");
  const cmd = messageArray[0];
  const args = messageArray.slice(1);
  if (!message.guildID) return message.channel.createMessage(`You can't use commands via DMs in this bot. You can only receive suggestion updates via DMs in this bot.`)
  const guildme = client.guilds.get(message.guildID).members.get(client.user.id)
  if (!guildme.permissions.has('sendMessages')) return message.author.getDMChannel().then(ch => ch.createMessage(`That bot doesn't has send messages permission in this guild.`))
  if (!guildme.permissions.has('manageMessages')) return message.channel.createMessage(`The bot should have Manage Messages permission in order to work properly.`)
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
  const guild = client.guilds.get(message.guildID)
  message.delete()
  if (dil == "english") {
    if (db.has(`reviewchannel_${message.guildID}`) && guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) {
      let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
      if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
      awaitingsuggestions.set(message.guildID, oldsugssize + 1)
      const guild = client.guilds.get(message.guildID);
      let approveemoji = `👍`
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
      let denyemoji = `👎`
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'awaiting approval',
        author: message.author.id,
        suggestion: message.content,
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji,
        followers: [ message.author.id ]
      })
      message.channel.createMessage(`Successfully sent the suggestion to approval queue! When your suggestion get approved, it will show up here.`).then(async msg =>
          guild.channels.get(db.fetch(`reviewchannel_${message.guildID}`)).createMessage({
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
    const guild = client.guilds.get(message.guildID);
    let approveemoji = `👍`
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
    let denyemoji = `👎`
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
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
        denyemoji,
        followers: [ message.author.id ]
      })
      if (!db.has(`denyvoting_${message.guildID}`)) {
        msg.addReaction(approveemoji)
        await sleep(75)
        msg.addReaction(denyemoji)
      }
    })
  }
  
  if (dil == "turkish") {
    if (db.has(`reviewchannel_${message.guildID}`) && guild.channels.has(db.fetch(`reviewchannel_${message.guildID}`))) {
      let oldsugssize = db.all().filter(i => i.ID.startsWith(`suggestion_${message.guildID}_`)).length;
      if (awaitingsuggestions.has(message.guildID) && awaitingsuggestions.get(message.guildID) >= oldsugssize) oldsugssize = awaitingsuggestions.get(message.guildID);
      awaitingsuggestions.set(message.guildID, oldsugssize + 1)
      const guild = client.guilds.get(message.guildID);
      let approveemoji = `👍`
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
      if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
      let denyemoji = `👎`
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
      if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
      db.set(`suggestion_${message.guildID}_${oldsugssize + 1}`, {
        status: 'awaiting approval',
        author: message.author.id,
        suggestion: message.content,
        timestamp: Date.now(),
        channel: message.channel.id,
        guild: message.guildID,
        approveemoji,
        denyemoji,
        followers: [ message.author.id ]
      })
      message.channel.createMessage(`Öneri başarıyla doğrulama sırasına gönderildi! Önerin onaylandığında, bu kanalda gözükecektir.`).then(async msg =>
          guild.channels.get(db.fetch(`reviewchannel_${message.guildID}`)).createMessage({
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
    const guild = client.guilds.get(message.guildID);
    let approveemoji = `👍`
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == true) approveemoji = db.fetch(`customapprove_${message.guildID}`)
    if (db.has(`customapprove_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customapprove_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1]).length != 0) approveemoji = guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customapprove_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customapprove_${message.guildID}`).split(':')[1])[0].id
    let denyemoji = `👎`
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == true) denyemoji = db.fetch(`customdeny_${message.guildID}`)
    if (db.has(`customdeny_${message.guildID}`) && /\p{Emoji}/u.test(db.fetch(`customdeny_${message.guildID}`)) == false && guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1]).length != 0) denyemoji = guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].name + ":" + guild.emojis.filter(x => x.name == db.fetch(`customdeny_${message.guildID}`).split(':')[0] && x.id == db.fetch(`customdeny_${message.guildID}`).split(':')[1])[0].id
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
        denyemoji,
        followers: [ message.author.id ]
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
        const currentnumber = members.filter(m => m.roles.includes(r.id)).length;
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
  channel.createMessage({
    embed: {
      title: '**__Thanks for adding Suggestions bot!__**',
      description: `This bot allows you to manage your suggestions in server easily. You can see the possible commands with **.help** command. This bot won't work if you don't set any suggestion channel.\n \n**You can get help about the bot setup** With **.setupinfo** command.\n \n**This bot made by** ${client.users.get('343412762522812419').username}#${client.users.get('343412762522812419').discriminator}\n \n**If you have any cool idea for bot** Use **.botsuggest** command to send suggestions to owner.\n \n**Note:** In order to work properly, bot should have manage messages permission.\n**Note for Turkish:** Eğer botu Türkçe kullanmak istiyorsanız \`.language turkish\` komuduyla botu Türkçe yapabilirsiniz, Türkçe yaptıktan sonra \`.kurulumbilgi\` ile bilgi alabilirsiniz`,
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
    const sugid = Number(msg.embeds[0].title.replace('Suggestion #', '').replace('Öneri #', ''))
    msg.getReaction(db.fetch(`${sugname}.approveemoji`)).then(async rec => {
      if (!db.has(`autoapprove_${msg.guildID}`)) return;
      if (rec.length - 1 >= db.fetch(`autoapprove_${msg.guildID}`)) {
        manageSuggestion(null, msg.channel.guild, sugid, 'Approved', client, dil, [])
      }
    })
    msg.getReaction(db.fetch(`${sugname}.denyemoji`)).then(async rec => {
      if (!db.has(`autodeny_${msg.guildID}`)) return;
      if (rec.length - 1 >= db.fetch(`autodeny_${msg.guildID}`)) {
        manageSuggestion(null, msg.channel.guild, sugid, 'Denied', client, dil, [])
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
                  description: `Your suggestion that in \`${msg.channel.guild.name}\` has verified.\n**Suggestion:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Suggestion number:** ${sugid}`,
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
                  description: `\`${msg.channel.guild.name}\` sunucusundaki önerin doğrulandı.\n**Öneri:** ${db.fetch(`suggestion_${msg.guildID}_${sugid}.suggestion`)}\n**Öneri numarası:** ${sugid}`,
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
            deleteSuggestion(null, msg.channel.guild, Number(msg.embeds[0].title.replace(`Öneri #`, ``).replace(`Suggestion #`, ``)), client, dil, [], false)
          }
        })
      }
    })
  }
})

client.on('messageDelete', async message => {
  await sleep(1000)
  const all = db.all().filter(i => i.ID.startsWith(`suggestion_`) && db.fetch(`${i.ID}.msgid`) == message.id)
  if (all.length != 0) {
    for (const i of all) {
      deleteSuggestion(null, client.guilds.get(db.fetch(`${i.ID}.guild`)), Number(i.ID.split('_')[2]), client, 'english', [], true)
    }
  }
})

client.connect();

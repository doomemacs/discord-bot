'use strict';

const { Client, Intents } = require('discord.js');
const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS'],
  allowedMentions: { repliedUser: true }
});

/// Local
const config = require('../config.json');
const delete_non_replies = require('./lib/delete-non-replies');
const sticky = require('./lib/sticky');
// const qna = require('./lib/qna');

/// Slash Commands
const slash = [
  // require('./commands/moveto.js'),
  // require('./commands/roles.js')
];


// let nlp;
client.once('ready', () => {
  config.guilds.forEach(async (id) => {
    let guild = client.guilds.cache.get(id);
    console.log(`Found guild: ${guild?.name} (${guild?.id})`);

    // nlp = await qna.init(config.qna);
    slash.map(c => c.init(guild, config));
    sticky.init(guild, config.reminders);
  });

  // Clean up stickies before the process bails
  ['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach(sig => {
     process.on(sig, async () => {
       await sticky.destroy();
       await Promise.all(slash.map(c => c.destroy()));
       console.log("Shutting down");
       process.exit();
     });
   });

  console.log(`Logged in as ${client.user.tag}!`);
  console.log("Ready!");
});


client.on('messageCreate', async (message) => {
  if (message.author.bot || message.author.system || message.webhookID)
    return;
  if (!config.guilds.includes(message.guild.id))
    return;

  // Auto-delete messages that don't ping @helpme, aren't a reply to another
  // user, and aren't a direct (or near-enough) follow up to that user's
  // previous messages (within a certain timeframe).
  if (!delete_non_replies(message, config.noReply)) {
    // Keep notice messages at the bottom of the channel, so it won't be missed.
    sticky.message(config.reminders[message.channel.name], message.channel);
  }
});


//
client.login(config.apiKey);

// https://discord.com/oauth2/authorize?client_id=706341689345703967&scope=bot+applications.commands

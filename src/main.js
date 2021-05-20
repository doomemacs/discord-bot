'use strict';

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const config = require('../config.json');

/// Tasks
const delete_non_replies = require('./lib/delete-non-replies')
const sticky = require('./lib/sticky')
// const qna = require('./lib/qna');

// Slash Commands
// const slash = [
//   require('./commands/move.js'),
//   require('./commands/roles.js')
// ];
// slash.forEach(cmd => client.on('interaction', cmd.onInteraction))

let nlp;

client.once('ready', async () => {
  // slash.forEach(cmd => client.application.commands.create(cmd.command));
  // nlp = await qna.init(config.qna);

  console.log("Ready!")
});


client.on('message', async (message) => {
  if (message.author.bot)
    return;

  // Auto-delete messages that don't ping @helpme, aren't a reply to another
  // user, and aren't a direct (or near-enough) follow up to that user's
  // previous messages (within a certain timeframe).
  if (!delete_non_replies(message, config.noReply)) {
    // Keep notice messages at the bottom of the channel, so it won't be missed.
    sticky(message, config.reminders[message.channel.name])
  }
});


//
client.login(config.apiKey);

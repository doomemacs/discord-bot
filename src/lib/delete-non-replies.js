const { Util } = require('discord.js');


function has_elapsed (time, ttl) {
  return (new Date()).getTime() - ttl > time;
}

function is_direct_followup (message, distance, maxAge = 600, history = []) {
  // Is there another post by this message's author within DISTANCE posts?
  return history
    .slice(-distance)
    .some(x => x.name === message.author.tag && has_elapsed(x.time, maxAge));
}

function remove_message(message, reason) {
  message
    .delete()
    .then(msg => {
      console.log(`DOOMBOT :: Delete(${msg.author.tag},#${msg.channel.name}): ${msg.content}`);
      msg.author.send(
        ":warning: **Your message automatically deleted.**\n\n" +
          "**Reason:** " + reason + "\n\n" +
          "**Here is a copy of your message:**\n```\n" +
          Util.escapeMarkdown(msg.content) + "\n```\n" +
          "(Have I made a mistake? Let us know in <#579039716662312990>)"
      ).catch(_ => console.error(`DOOMBOT :: Couldn't notify ${msg.author.name}`));
    }).catch(console.error);
}


const postHistory = {};

/**
 * Maybe remove this message if it isn't a direct (or near-enough) followup to a
 * previous message by the same user within a certain timeframe.
 *
 * @param Message message TODO
 */
module.exports = (message, { maxAge       = 600,
                             distance     = 3,
                             channels     = ['*'],
                             historyLimit = 100,
                             reason       = "" }) =>
{
  const channelName = message.channel.name;
  if (!channels.includes('*') && !channels.includes(channelName))
    return;

  if (!postHistory[channelName])
    postHistory[channelName] = [];

  if (!message.member.deleted
      && !message.mentions.users.first()
      && !message.mentions.roles.first()) {
    const posters = postHistory[channelName];
    if (!is_direct_followup(message, distance, maxAge, posters)) {
      if (!message.deletable || message.deleted) {
        console.log(`DOOMBOT :: ${message.id} is not deletable`);
        return;
      }
      remove_message(message, reason);
      return true;
    }
  }

  postHistory[channelName].push({
    name: message.author.tag,
    time: (new Date()).getTime()
  });
  if (postHistory[channelName].length > 50) {
    postHistory[channelName].shift();
  }
}

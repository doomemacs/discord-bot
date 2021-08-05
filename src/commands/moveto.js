const { Util } = require('discord.js');

const command = {
  name: 'moveto',
  description: "Move a message to another channel and let the user know it's happened",
  options: [
    {
      name: 'channel',
      type: 'CHANNEL',
      description: 'What channel should this be moved to',
      required: true
    },
    {
      name: 'message',
      type: 'STRING',
      description: 'Message ID',
      required: true
    },
    {
      name: 'reason',
      type: 'STRING',
      description: 'Explanation for the move, to inform the authors with',
    }
  ]
};

let webhooks = [];

async function onInteraction (event) {
  if (!event.isCommand()) return;

  if (event.commandName === 'moveto') {
    const channel = event.options.getChannel('channel');
    const message = event.options.getString('message').split('-').slice(-1)[0];
    const reason  = event.options.getString('reason');

    if (channel.id === event.channel.id) {
      event.reply({ content: "I can't move a message to the same channel!", ephemeral: true });
      return;
    }

    const msg = (event.channel.messages.cache.get(message) || await event.channel.messages.fetch(message));
    if (msg.author.bot || msg.author.system) {
      event.reply({ content: "Can't move a bot or system message, sorry!", ephemeral: true });
      return;
    }

    let author = msg.author.username;
    let webhook = (await channel.fetchWebhooks()).find(w => w.name === author);
    if (!webhook) {
      console.log(`DOOMBOT :: Created webhook: ${author}`)
      webhook = await channel.createWebhook(author);
    }
    webhooks.push(webhook);
    webhook.send({
      username:  author,
      content:   msg.content,
      avatarURL: msg.author.avatarURL()
    }).then(async _ => {
      await msg.delete()
        .then(async m => {
          console.log(`DOOMBOT :: Deleted ${m.id} by ${m.author.username}`);
          if (m.author.id !== event.user.id) {
            await m.author.createDM().send(
              `:warning: **Your message was moved from <#${msg.channel.name}> to <#${channel.name}>.**\n\n` +
                (reason ? "**Reason:** " + reason + "\n\n" : "") +
                "**Here is a copy of your message:**\n```\n" +
                Util.escapeMarkdown(m.content) + "\n```\n" +
                "(If something went wrong, let us know in <#579039716662312990>)"
            );
          }
          await event.reply({
            content: "Message successfully moved!",
            ephemeral: true
          });
        });
    }).catch(async err => {
      console.error(err);
      await event.reply({
        content: `Failed to move message because:\n\n\`\`\`\n${Util.escapeMarkdown(err)}\n\`\`\``,
        ephemeral: true
      });
    }).finally(async _ => {
      console.log(`DOOMBOT :: Removed webhook: ${author}`);
      await webhook.delete().catch(e => undefined);
    });
  }
}

module.exports.init = async (guild, config = {}) => {
  if (!guild.client.application?.owner)
    await guild.client.application?.fetch();

  config.guilds.forEach(g => {
    guild.client.on('interactionCreate', onInteraction);
    guild.commands.create(command);
  });
}

module.exports.destroy = () => webhooks.map(w => {
  return w.delete().then(wh => {
    console.log(`DOOMBOT :: Deleted webhook: ${wh.name}`);
  });
})

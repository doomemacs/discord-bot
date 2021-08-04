
const lastReminder = {};
const posting = {};

/**
 * Make sure certain message is always at the bottom of the channel.
 *
 * @param Message message TODO
 * @param string|object embed TODO
 */
async function stickyMessage (message, channel) {
  if (message) {
    const name = channel.name;
    if (!posting[name]) {
      posting[name] = true;

      let content = typeof message === 'string' ? message : { embed: message };
      let fn = (_) => {
        channel.send(content)
          .then(m => lastReminder[name] = m)
          .catch(console.error)
          .finally(() => posting[name] = false)
      };
      if (lastReminder[name] && !lastReminder[name].deleted) {
        await lastReminder[name].delete().then(fn);
        delete lastReminder[name];
      } else {
        fn();
      }
    }
  }
}


//
module.exports.message = stickyMessage;

module.exports.init = (guild, config = {}) => {
  // Create initial stickies on startup
  for (let channelName in config) {
    let channel = guild.channels.cache.find(c => c.name.toLowerCase() === channelName);
    if (channel) {
      stickyMessage(config[channelName], channel);
    }
  }
}

module.exports.destroy = () => Promise.all(
  Object.entries(lastReminder)
    .filter(([_name, msg]) => !msg.deleted)
    .map(([name, msg]) => msg.delete().then(m => {
      console.log(`DOOMBOT :: Deleted sticky in #${name}`)
    })));

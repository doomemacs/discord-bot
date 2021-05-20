
const lastReminder = {};
const posting = {};

/**
 * Make sure certain message is always at the bottom of the channel.
 *
 * @param Message message TODO
 * @param string|object embed TODO
 */
module.exports = async (message, embed) => {
  if (embed) {
    let channel = message.channel.name;
    if (!posting[channel]) {
      posting[channel] = true;

      if (lastReminder[channel] && !lastReminder[channel].deleted) {
        await lastReminder[channel].delete();
      }

      let content = typeof embed === 'string' ? embed : { embed: embed };
      message.channel
             .send(content)
             .then(m => lastReminder[channel] = m)
             .catch((e) => console.error(e))
             .finally(() => posting[channel] = false);
    }
  }
}

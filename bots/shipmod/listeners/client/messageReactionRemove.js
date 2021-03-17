// howto
//https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// code example
//https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/12/uncached-messages.js

const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const commandVars = require.main.require('./common').commandVars(__filename);

class CustomListener extends Listener {
	constructor() {
		super('messageReactionRemove', {
			emitter: 'client',
			event: 'messageReactionRemove',
			category: 'client',
		});
	}

  async exec( reaction, user ) {
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
      }
    }
    console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
	}
}

module.exports = CustomListener;

messageReactionAdd

const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const common = require.main.require('./common');

class ReadyListener extends Listener {
	constructor() {
		super(common.commandName(__filename), {
			emitter: 'client',
			event: common.commandName(__filename),
			category: common.commandCategory(__filename),
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
    console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
	}
}

module.exports = ReadyListener;

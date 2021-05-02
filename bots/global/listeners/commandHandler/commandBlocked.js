const { Listener } = require('discord-akairo');
const util = require.main.require('./util');
const config = util.config;
const commandVars = util.commandVars(__filename);

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandStarted
class CustomListener extends Listener {
	constructor() {
		super('global/'+commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

    exec(message, command, reason) {
        console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CustomListener;

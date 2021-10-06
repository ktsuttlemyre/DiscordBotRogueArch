const {Listener} = require("discord-akairo");
const {reactions, defaultAvatar} = require.main.require("./common");
const config = require.main.require("./config");
const commandVars = require.main.require("./common").commandVars(__filename);

class CustomListener extends Listener {
	constructor() {
		super(commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec() {
		var client = this.client;
		// Log that the bot is online.
		//client.logger.info(`${client.user.tag}, ready to serve ${client.users.size} users in ${client.guilds.size} servers.`, 'ready');
		// Set the bot status
		//client.user.setActivity(process.env.ACTIVITY||'Type '+client.commandHandler.prefix+'help to get started', { type: 'PLAYING' });
		//iter guilds
		const Guild = client.guilds.cache.forEach(function(Guild){ //.get("690661623831986266"); // Getting the guild.

		}); //end guilds
	} //end exec
}

module.exports = CustomListener;

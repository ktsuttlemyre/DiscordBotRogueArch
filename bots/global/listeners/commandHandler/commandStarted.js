const debug = true;
const {Listener} = require("discord-akairo");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);
const {reactions, defaultAvatar} = require.main.require("./common");

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandStarted
class CustomListener extends Listener {
	constructor() {
		super("global/" + commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	exec(message, command, args) {
		message.react(reactions.shipwash);
		debug && console.log('User',(message.member.displayName||message.user.tag),' requested command execution: ',message.content,' in location ',message.channel.name,message.channel.type)
		this.client.memory.channelSet(
			message,
			`${message.id}_promise`,
			new Promise((resolve) => {
				this.client.memory.channelSet(message, `${message.id}_resolve`, resolve);
			})
		);
	}
}

module.exports = CustomListener;

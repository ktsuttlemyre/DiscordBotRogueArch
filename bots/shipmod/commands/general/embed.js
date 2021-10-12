const common = require.main.require("./common");
const {Command} = require("discord-akairo");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const yaml = require("js-yaml");

class CustomCommand extends Command {
	constructor() {
		super(commandVars.id, {
			description: {content: "creates an announcement on your behaf"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
			args: [
				{
					id: "input",
					default: "",
					match: "content",
				},
			],
			channelRestriction: "guild",
		});
	}

	// 	userPermissions(message) {
	// 		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
	// 			return 'Admin';
	// 		}
	// 		return null;
	// 	}

	async exec(message, {input}) {
		let opts = {
			user:message.user,
			member:message.member
		}
		await util.messages.encapsulate(message, input, opts);
	}
}

module.exports = CustomCommand;

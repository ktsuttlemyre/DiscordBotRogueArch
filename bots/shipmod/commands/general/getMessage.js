const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const emotes = {error: ":error:"};
const {reactions, defaultAvatar} = require.main.require("./common");
const _ = require("lodash");
const path = require("path");
const util = require.main.require("./util");
const commandVars = util.commandVars(__filename);

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "fetchall"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					id: "search",
					default: "",
					match: "content",
				},
			],
			channelRestriction: "guild",
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === "Admin")) {
			return "Admin";
		}
		return null;
	}

	async exec(message, {search}) {
		//let messages = await util.getMessages(message.channel);
		//message.channel.send(`got ${messages.length} messages`);

		let id = search;
		let found = null;
		await util.message.fetchForEach(message.channel, function (message, index, messages, gIndex) {
			if (message.id == search) {
				return true;
			}
		});

		message.channel.send("```" + JSON.stringify(found) + "```");
	}
}

module.exports = CustomCommand;

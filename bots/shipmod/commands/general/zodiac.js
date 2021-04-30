const {Client, Collection} = require("discord.js");
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const common = require.main.require("./common");
const commandVars = common.commandVars(__filename);
const util = require.main.require("./util");
const _ = require("lodash");
const roomMap = require.main.require("./config").eventRoomMap;
const escapeMD = require("markdown-escape");

class CustomCommand extends Command {
	constructor() {
		super(commandVars.id, {
			description: {content: "Get the zodiac for today or a birthday/date"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
			// 		args: [
			// 			 {
			// 			 	id: 'birthday',
			// 			 	default: '',
			// 			 	match: 'content',
			// 			 },
			// 			],
			channelRestriction: "guild",
		});
	}

	async exec(message) {
		let sign = util.zodiac();
		let birthday = "today";
		return {
			title: "Zodiac sign for: " + birthday,
			description: `${sign.emoji} ${sign.name} - The ${sign.form} element of ${sign.element}`,
			//footer: {
			//	text: `type \`!rsvp ${queue.toLowerCase()}\` to be added to the queue!`,
			//	//icon_url: 'https://i.imgur.com/wSTFkRM.png',
			//},
			// 			fields: [
			// 					{
			// 					//name: '\u200b',
			// 					name: 'Event starts @ 9pm EST',
			// 					value: `Type \`!rsvp${suffix}\` to be added to the queue!`,
			// 					inline: true,
			// 					},
			// 				]
		};
	}
}

module.exports = CustomCommand;

let debug = true;
const {Client, Collection} = require("discord.js");
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const common = require.main.require("./common");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const roomMap = require.main.require("./config").eventRoomMap;
const escapeMD = require("markdown-escape");

class CustomCommand extends Command {
	constructor() {
		super(commandVars.id, {
			description: {content: "Gets a user avatar by id"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
				args: [
					 {
						id: 'arg',
						default: '',
						match: 'content',
					 },
					],
			channelRestriction: "guild",
		});
	}

	parseInput(message) {}

	async exec(message, {arg} ) {
		let isAdmin = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'admin');
		let isMod = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'mod');
		
		let client = this.client;
		let mentions = await util.resolveMentions(message,arg);
    		const user = await client.users.fetch(arg, { cache: true });
		if(mentions.user){
			return mentions.user.displayAvatarURL
		}else{
			return 'Could not find user '+arg
		}
	}
}

module.exports = CustomCommand;

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
			description: {content: "Sets guest stream avatar to whatever you give me here"},
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
		let memory = client.memory
		
		let user = mentions.args[0]
		//user=user.user || user
		memory.set(message,'gueststream',user)
		memory.set(message,'gueststreamgame',mentions.args[1])
    		return {
			title:mentions.content,
			description:"set guest to: "+user.displayName||user.tag+'\nset game to:'+mentions.args[1]+'\n',
			thumbnail: {
			      "url": (user.user||user).displayAvatarURL()
			    }
		}
	}
}

module.exports = CustomCommand;

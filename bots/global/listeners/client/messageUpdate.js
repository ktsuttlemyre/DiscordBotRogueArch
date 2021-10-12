/* Emitted whenever the client sees a message get edited.
PARAMETER    TYPE         DESCRIPTION
oldMessage   Message
newMessage   Message
*/

let debug = true;
const Discord = require("discord.js");
const YAML = require("js-yaml");
const _ = require("lodash");

const {Listener} = require("discord-akairo");
const {reactions, defaultAvatar} = require.main.require("./common");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);


const sortAlphaNum = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
let mapToArray = function(map){
	return Array.from(map, ([name, value]) => (value.displayName));
}

class CustomListener extends Listener {
	constructor() {
		super("global/" + commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}
	  

	async exec(oldMessage, newMessage) {
		


			let settings = await util.parseSettingsFromGuild(newMessage.guild);
	

    
// 			let logChannel = guild.channels.resolve(config.actionLogChannel);
// 			let gameChannel = guild.channels.resolve(config.gameChannel);
// 			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 				logChannel.send(`${client.user.tag} woke up`);
// 			}
			

			

	} //end exec
}


module.exports = CustomListener;

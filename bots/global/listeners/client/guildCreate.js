/* Emitted whenever the client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild
*/

let debug = true;
const Discord = require("discord.js");


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
	  

	async exec(guild) {
		
		let client = this.client;
		if(!guild.available){
			debug && console.log(`Bot ${client.user.tag} tried to join guild ${guild.name} and failed`);
			return; // Stops if unavailable
		}
		debug && console.log(`Bot ${client.user.tag} joined guild ${guild.name}`);


		let settings = await util.parseSettingsFromGuild(guild);


    
    
    
// 			let logChannel = guild.channels.resolve(config.actionLogChannel);
// 			let gameChannel = guild.channels.resolve(config.gameChannel);
// 			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 				logChannel.send(`${client.user.tag} woke up`);
// 			}
			

			
		

		debug && console.log(`Bot ${client.user.tag} configured guild ${guild.name} with settings ${JSON.stringify(settings,null,2)}`);
	} //end exec
}


module.exports = CustomListener;

let debug = false;
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
	
	

	async exec() {
		let client = this.client;

		var env = process.env.ENVIRONMENT;
		if (env != "production") {
			return;
		}

		//trigger listeners
		/* devnote
		 * Loop through all guilds
		 * loop through all channels we have permission to in those guilds
		 * emit voice channel changes for voice-to-text channel linking
		 * check if there are any commands that were not executed
		 */
		client.guilds.cache.forEach(async function (guild) {
			//.get("690661623831986266"); // Getting the guild.
			console.log("checking guild", guild.name, guild.id);

			let logChannel = guild.channels.resolve(config.actionLogChannel);
			let gameChannel = guild.channels.resolve(config.gameChannel);
			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
				logChannel.send(`${client.user.tag} woke up`);
			}
			
			let gamePrefix="🎮";
			if(client.user.tag =="ShipMod"){

				let gameRoles = guild.roles.cache.filter((x) => x.name.indexOf(gamePrefix)===0); //find a role with game prefix
				if(gameRoles){
					gameRoles = gameRoles.sorted(sortAlphaNum)
					
					
					let games = Array.from(gameRoles, ([name, value]) => ({ game:value.name, members:mapToArray(value.members) }));
				
					gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && gameChannel.send(gameRoles)
					//TODO print the games
				}
			}
			
		}); //end guilds
		


		console.log(`ready rutine is complete for ${client.user.tag}`);
	} //end exec
}


module.exports = CustomListener;

let debug = false;
const Discord = require("discord.js");

const {Listener} = require("discord-akairo");
const {reactions, defaultAvatar} = require.main.require("./common");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);
const YAML = require('js-yaml');


const sortAlphaNum = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
let mapToArray = function(map){
	return Array.from(map, ([name, value]) => (value.displayName));
}

class CustomListener extends Listener {
	constructor() {
		super("shipmod/" + commandVars.id, {
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
			console.log("Custom Ready rutine running for ",client.user.tag," checking guild ", guild.name, guild.id);

			let logChannel = guild.channels.resolve(config.actionLogChannel);
			let gameChannel = guild.channels.resolve(config.gameChannel);
			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
				logChannel.send(`${client.user.tag} woke up`);
			}
			
			let gamePrefix="🎮";

			let gameRoles = guild.roles.cache.filter((x) => x.name.indexOf(gamePrefix)===0); //find a role with game prefix
			console.log('gameRoles found =',gameRoles.size)
			if(gameRoles.size){
				gameRoles = gameRoles.sorted(sortAlphaNum)


				let games = Array.from(gameRoles, ([name, value]) => ({ game:value.name, members:mapToArray(value.members) }));
				//let json = JSON.stringify(games,null,2)
				let data = YAML.dump(games,{noArrayIndent :true,flowLevel:1,sortKeys:true,forceQuotes:true,quotingType:'"'}) //https://www.npmjs.com/package/js-yaml
				console.log(data)
				data=data.replace('"','`')

				if(gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES")){
					Discord.Util.splitMessage(data,{maxLength:1900}).forEach(function(mess){
						gameChannel.send(mess);
					})
				}
				
			}
			
			
		}); //end guilds
		


		console.log(`Custom Ready rutine is complete for ${client.user.tag}`);
	} //end exec
}


module.exports = CustomListener;

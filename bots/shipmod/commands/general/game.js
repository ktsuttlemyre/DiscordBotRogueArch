const {Command} = require("discord-akairo");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "join a voice chat"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				// {
				// 	id: 'search',
				// 	default: '',
				// 	match: 'content',
				// },
			],
			channelRestriction: "guild",
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === config.systemRoles.admin)) {
			return config.sytemRoles.admin;
		}
		return null;
	}

	async exec(message) {
		let client = this.client; 
		let guild = message.guild;

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
			data=data.replace(/\-\s\{\"game\":\s/g,"```").replace(/,\s\"members\":\s\[/g,'\n Players: ').replace(/\]\}/g,'```') .replace(/"/g,'')

			if(gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES")){
				Discord.Util.splitMessage(data,{maxLength:1900}).forEach(function(mess){
					gameChannel.send(mess);
				})
			}

		}
	}
}

module.exports = CustomCommand;

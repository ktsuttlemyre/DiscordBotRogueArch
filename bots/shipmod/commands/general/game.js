const {Command} = require("discord-akairo");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);
const YAML = require('js-yaml');

const sortAlphaNum = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
let mapToArray = function(map){
	return Array.from(map, ([name, value]) => (value.displayName));
}

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "join a voice chat"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					id: 'keyword',
					default: '',
					match: 'content',
				},
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
	
// 	async getUserFromMention(mention) {
// 		// The id is the first and only match found by the RegEx.
// 		const matches = mention.match(/^<@!?(\d+)>$/);

// 		// If supplied variable was not a mention, matches will be null instead of an array.
// 		if (!matches) return;

// 		// However, the first element in the matches array will be the entire mention, not just the ID,
// 		// so use index 1.
// 		const id = matches[1];

// 		return client.users.cache.get(id);
// 	}

	
	async exec(message,{keyword}) {
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
// 		if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 			logChannel.send(`${client.user.tag} woke up`);
// 		}

		let gamePrefix="🎮";

		let gameRoles = guild.roles.cache.filter((x) => x.name.indexOf(gamePrefix)===0); //find all roles with game prefix
			
		if(keyword == 'all'){
			console.log('gameRoles found =',gameRoles.size)
			gameRoles = gameRoles.sorted(sortAlphaNum)


			let games = Array.from(gameRoles, ([name, value]) => ({ game:value.name, members:mapToArray(value.members) }));
			//let json = JSON.stringify(games,null,2)
			let data = YAML.dump(games,{noArrayIndent :true,flowLevel:1,sortKeys:true,forceQuotes:true,quotingType:'"'}) //https://www.npmjs.com/package/js-yaml
			//console.log(data)
			data=data.replace(/\-\s\{\"game\":\s/g,"```").replace(/,\s\"members\":\s\[/g,'\n Players: ').replace(/\]\}/g,'```') .replace(/"/g,'')

			if(gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES")){
				Discord.Util.splitMessage(data,{maxLength:1900}).forEach(function(mess){
					gameChannel.send(mess);
				})
			}

		}else if(keyword){
			let mentions = await util.resolveMentions(keyword);
			message.send('got user:'+mentions.user)
		}else{
			message.send('Invalid keyword')
		}
	}
}

module.exports = CustomCommand;

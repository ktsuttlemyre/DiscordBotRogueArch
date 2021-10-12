/* Emitted whenever the client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild
*/

let debug = false;
const Discord = require("discord.js");
const YAML = require("js-yaml");

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
		let settingsChannelName='ettings-shipbot'
		let client = this.client;
		if(!guild.available){
			debug && console.log(`Bot ${client.me.tag} tried to join guild ${guild.name} and failed`);
			return; // Stops if unavailable
		}
		debug && console.log(`Bot ${client.me.tag} joined guild ${guild.name}`);

		let owner = guild.owner.user
		if(!owner){
			owner = await guild.members.fetch(guild.ownerID) // Fetches owner
			owner = owner.user || owner.member || owner;
		}

		let channel = guild.channels.cache.find(function(channel){
			return channel.name.includes(settingsChannelName);
		})

		let settingsMessages = channel.messages.fetch({ limit: 100 });
		let messages = settingsMessages.sorted(function(a, b) {         
			return b.createdTimestamp - a.createdTimestamp;
		}); //sort oldest date created


		let settings = {}
		for(var i=0,l=messages.length;i<l;i++){
			let message = messages[i]
			await message.reactions.removeAll().catch(function(error){
			      owner.send('❌ Failed to clear reactions on settings messages: '+error);
			      message.react('❌');
			});
			let yaml=message.content.trim().replace(/^```/).replace(/```$/).trim();
			let section;
			try{
				section = YAML.load(yaml);
			}catch{
				owner.send('❌ Error parsing settings on message id: '+message.id)
				message.react('❌');
				return
			}
			_.merge(settings,section)
			message.react('✅');
		}



    
    
    
// 			let logChannel = guild.channels.resolve(config.actionLogChannel);
// 			let gameChannel = guild.channels.resolve(config.gameChannel);
// 			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 				logChannel.send(`${client.user.tag} woke up`);
// 			}
			

			
		

		debug && console.log(`guild ${guild.name} is now configured`);
	} //end exec
}


module.exports = CustomListener;

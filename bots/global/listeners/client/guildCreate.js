/* Emitted whenever the client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild
*/

let debug = true;
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
		
		let client = this.client;
		if(!guild.available){
			debug && console.log(`Bot ${client.user.tag} tried to join guild ${guild.name} and failed`);
			return; // Stops if unavailable
		}
		debug && console.log(`Bot ${client.user.tag} joined guild ${guild.name}`);

		
		async function setSettings(){
			let settingsChannelName='settings-shipbot'
			let owner = guild.owner.user
			let settings = {}
			
			if(!owner){
				owner = await guild.members.fetch(guild.ownerID) // Fetches owner
				owner = owner.user || owner.member || owner;
			}

			let channel = guild.channels.cache.find(function(channel){
				return channel.name.includes(settingsChannelName);
			})
			if(!channel){
				debug && console.log(`${guild.name} has no settings channel`)
				return settings
			}

			let settingsMessages = await channel.messages.fetch({ limit: 100 });
			debug && console.log('messages found',settingsMessages.size)
			let messages = settingsMessages.sorted(function(a, b) {         
				return b.createdTimestamp - a.createdTimestamp;
			}); //sort oldest date created


			for (const message of messages) {
				if(message.reactions){
					await message.reactions.removeAll().catch(function(error){
					      owner.send('❌ Failed to clear reactions on settings messages: '+error);
					      message.react('❌');
					});
				}
				if(!message.content){
					debug && console.log(`no message content for ${message.id}`)
					continue
				}
				debug && console.log('got message content',message.content)
				let yaml=message.content.trim().replace(/^```/,'').replace(/```$/,'').trim();
				try{
					_.merge(settings,YAML.load(yaml));
					message.react('✅');
				}catch{
					owner.send('❌ Error parsing settings on message id: '+message.id)
					message.react('❌');
					continue
				}
				debug && console.log('Settings now look like this',JSON.stringify(settings,null,2))


			}
			return settings
		}
		let settings = await setSettings();


    
    
    
// 			let logChannel = guild.channels.resolve(config.actionLogChannel);
// 			let gameChannel = guild.channels.resolve(config.gameChannel);
// 			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 				logChannel.send(`${client.user.tag} woke up`);
// 			}
			

			
		

		debug && console.log(`Bot ${client.user.tag} configured guild ${guild.name} with settings ${JSON.stringify(settings,null,2)}`);
	} //end exec
}


module.exports = CustomListener;

const Discord = require('discord.js');

const { Listener } = require('discord-akairo');
const {reactions,defaultAvatar} = require.main.require('./common');
const util = require.main.require('./util');
const config = util.config;
const commandVars = util.commandVars(__filename);

class ReadyListener extends Listener {
	constructor() {
		super('global/'+commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec() {
		let client = this.client;
		// Log that the bot is online.
		client.logger.info(`${client.user.tag}, ready to serve ${client.users.size} users in ${client.guilds.size} servers.`, 'ready');
		// Set the bot status
		client.user.setActivity(process.env.ACTIVITY||'Type '+client.commandHandler.prefix+'help to get started', { type: 'PLAYING' });
		//trigger listeners
		
		/* devnote
		 * Loop through all guilds
		 * loop through all channels we have permission to in those guilds
		 * emit voice channel changes for voice-to-text channel linking
		 * check if there are any commands that were not executed
		 */
		const Guild = client.guilds.cache.forEach(async function(Guild){ //.get("690661623831986266"); // Getting the guild.
			let voiceChannels = Guild.channels.cache.filter(c => c.type == 'voice').array();
			voiceChannels.forEach(function(channel){
				if(channel.id === Guild.afkChannelID){
					return false
				}
				Guild.members.cache.forEach(function(member){
				//channel.members.forEach(function(member){
					if(member.user.bot){
						return false;
					}
					// The member is connected to a voice channel.
					//console.log('user in voice, triggering voicestateupdate for ',member);
							
					for (const [voice, text] of Object.entries(config.voiceTextLinkMap)) {
						client.emit('voiceStateUpdate',{channelID:voice},member.voice);
					}
					
				}) //end members
			}); //end voicechannels
			

			//read all previous commands
			let textChannels = Guild.channels.cache.filter(c => c.type == 'text').array();
			console.log('checking old commands');
			let commandMessagesQueue=[];
			await textChannels.forEach(async function(channel){
				if(!(channel.permissionsFor(Guild.me).has("VIEW_CHANNEL"))){
					return;
				}
				if(util.devChannelGate({channel})){return}
				console.log('testing',channel.name);
				
				let messages = await channel.messages.fetch();
				await messages.some(async function(message){
					//stop once you find a message that this bot has sent
					if(client.user.id == message.author.id){
						return true; //end some loop
					}
					if(message.author.bot){
						return
					}
					let users = await getReactedUsers(message,reactions.shipwash);
					if(!users.get(client.user.id)){
					   	console.log('processing this message v')
						commandMessagesQueue.push(message);
					}
					console.log(message.id,message.content,'reacted with shipwash',users);

				}) //end messages
			}) //end textchannels
			
			console.log('sorting command messages queue')
			//sort
			commandMessagesQueue.sort(function(a,b){
				return a.createdTimestamp-b.createdTimestamp;
			})//execute
			.forEach(function(message){
				console.log('executing message with command',message.content)
				client.commandHandler.handle(message);
			})




// 			var memory=client.memory
// 			if(!memory){return}
// 			var player=memory.get({guild}, 'player');
// 			if(!player){return}
// 			var queues=memory.get({guild}, 'queues')||[];
// 			queues.forEach(function(queue){
// 				var message = queue.firstMessage
// 				if(player.isPlaying(message)){
// 				  common.nowPlaying(message,null,'I have crashed or gone to sleep!')
// 				}	
 			}); //end guilds

	} //end exec

}

async function getReactedUsers(msg, emoji,callback) {
	let reactions = msg.reactions.resolve(emoji)
	if(!reactions){
		return new Discord.Collection();
	}
	let userList = await reactions.users.fetch();
	return userList; //(userList.map((user) => user.id));
}

module.exports = ReadyListener;

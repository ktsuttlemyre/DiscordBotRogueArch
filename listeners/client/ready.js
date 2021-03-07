const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client',
		});
	}

	async exec() {
		// Log that the bot is online.
		this.client.logger.info(`${this.client.user.tag}, ready to serve ${this.client.users.size} users in ${this.client.guilds.size} servers.`, 'ready');
		// Set the bot status
		this.client.user.setActivity(process.env.ACTIVITY||'Type '+this.client.commandHandler.prefix+'help to get started', { type: 'PLAYING' });
		//trigger listeners
		
		
		const Guild = client.guilds.cache.forEach(function(Guild){ //.get("690661623831986266"); // Getting the guild.
			let voiceChannels = Guild.channels.cache.filter(c => c.type == 'voice').array();
			voiceChannels.forEach(function(channel){
				if(channel.id === Guild.afkChannelID){
					return false
				}
				channel.members.forEach(function(member){
					if(member.user.bot){
						return false;
					}
					// The member is connected to a voice channel.
					this.client.emit('voiceStateUpdate',member.voice,member.voice);
				}) //end members
			}); //end voicechannels
			

			//read all previous commands
			let textchannels = Guild.channels.cache.filter(c => c.type == 'text').array();
			textChannels.forEach(function(channel){
				if(!(channel.permissionsFor(Guild.me).has("VIEW_CHANNEL"))){
					return;
				}
				
// 				var p=channel.messages.fetch()
// 				.then(function(messages){
// 				    messages.forEach(function(message){
// 				      if(message.author.bot){
// 					return
// 				      }
// 				      if((Date.now() - message.createdAt) < ttl) { //is user active in the last 30 minutes?
// 					 keepAlive('Last message to guild was <'+ttlm+' minutes in channel['+channel.name+'] from user['+ message.author.username+']');
// 				      }
// 				    })
// 				})
// 				.catch(console.error);
			}) //end textchannels




// 			var memory=client.memory
// 			if(!memory){return}
// 			var player=memory.get(guild, 'player');
// 			if(!player){return}
// 			var queues=memory.get(guild, 'queues')||[];
// 			queues.forEach(function(queue){
// 				var message = queue.firstMessage
// 				if(player.isPlaying(message)){
// 				  common.nowPlaying(message,null,'I have crashed or gone to sleep!')
// 				}	
 			}); //end guilds

	} //end exc

}

module.exports = ReadyListener;

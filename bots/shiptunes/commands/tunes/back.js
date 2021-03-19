const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');

class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'back'},
		aliases: ['back'],
		category: path.basename(path.dirname(__filename)),
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			// {
			// 	id: 'search',
			// 	default: '',
			// 	match: 'content',
			// },
			],
		channelRestriction: 'guild', 
		});
	}
	
	userPermissions(message) {
		let isDJ = message.member.roles.cache.find(role => role.name === 'DJ')
		//DJ bypass
		if(isDJ){return }
		let channel = message.member.voice.channel;
		//Check they are in a voice channel
		if (!message.member.voice.channel) return `${emotes.error} - You're not in a voice channel !`;
		//Check they are in the same voice channel as the bot
		if (message.guild.me.voice.channel && channel.id !== message.guild.me.voice.channel.id) return `${emotes.error} - You are not in the same voice channel !`;
		//if the user is the only one in the channel then allow action
		if(channel){
			let members = channel.members.filter(member => !member.user.bot);
			if(members.size==1){
				return ;
			}
			//do voting (optional)
		}
		
		//isDJ required?
 		if (!isDJ){return 'DJ';}
		return ;
	}
	
	async exec(message) {
		var player = this.client.memory.channelGet(message, 'player')
		if(!player){
			return this.handler.emit('commandBlocked',message,this,'No player playing to act on');
		}
		
		//ensure playing
		var queue=player.getQueue(message);
		if(queue && (queue.paused || queue.stopped)){
			if(player.resume(message)){
				await GUIMessages.nowPlaying(message,player,"Continuing where we left off "+common.randomMusicEmoji());
			}else{
				await GUIMessages.nowPlaying(message,player,"Error resuming queue");
			}
		}
		
		var track = player.nowPlaying(message);
		if(track){
			await GUIMessages.nowPlaying(message,player,'Skipped: '+track.title)
		}else{
			await GUIMessages.nowPlaying(message,player,'Skipped: last track');
		}
		player.back(message);
	}
}

module.exports = CustomCommand;

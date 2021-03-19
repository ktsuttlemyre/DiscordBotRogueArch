const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const emotes={error:":warning:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');
const path = require('path');
const util = require.main.require('./util');
//TODO convert
/*
player.init
player.backgroundplaylist
queue.
*/


class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'plays [name/URL]'},
		aliases: [commandVars.name,'add','queue'],
		category: commandVars.category,
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			{
				id: 'search',
				default: '',
				match: 'content',
			},
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
		if(channel && channel.members.size==1){
			return ;
		}
		//do voting (optional)
		
		//isDJ required?
 		//if (!isDJ){return 'DJ';}
		return ;
	}
	
	async exec(message, { search }) {
		var player = this.client.memory.channelGet(message, 'player') || this.client.memory.channelSet(message, 'player', util.player.create(message,this.client));
		
		var queue=player.getQueue(message);
		if(queue){
			if(queue.paused || queue.stopped){
				if(player.resume(message)){
					await GUIMessages.nowPlaying(message,player,"Continuing where we left off "+common.randomMusicEmoji());
					return
				}else{
					let track = player.nowPlaying(message);
					if(track){
						await player.play(message,player.nowPlaying(message));
					}else{
						//do background
						await util.player.playBackgroundPlaylist(message,player);
					}
				}
				return //it was paused or stopped so we should have fixed it by now
			}
		}
		if(player.isPlaying(message)){
			if(!search && !message.attachments){
				return message.channel.send(`${emotes.error} - Please indicate the title of a song!`);
			}
		}else{
			if(!search && !message.attachments){
				await util.player.play
				Playlist(message,player);
				return
			}
		}
		
			

		if(message.attachments){
			await player.play(message, search, { isAttachment:true });
		}else{
			await player.play(message, search, { firstResult: true });
		}
		//The player was originallly in background mode
		//so advance past the backgroud music and start playing the users' requests
		if(player.backgroundPlaylist){
			player.backgroundPlaylist=false;
			await player.skip(message);
		}
	}
}

module.exports = CustomCommand;


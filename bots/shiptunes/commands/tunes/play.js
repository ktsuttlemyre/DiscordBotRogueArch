const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const emotes={error:":warning:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
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
		super(path.parse(__filename).name, {
		description: { content: 'plays [name/URL]'},
		aliases: ['play','add','queue'],
		category: path.basename(path.dirname(__filename)),
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

	requirements(message,player){
		let blocked = '';
		if (!message.member.voice.channel) blocked = `${emotes.error} - You're not in a voice channel !`;
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) blocked = `${emotes.error} - You are not in the same voice channel !`;
		//if(!player){blocked = 'No player currently playing';}
		this.handler.emit('commandBlocked',message,this,blocked);
		return blocked
	}
	
	async exec(message, { search }) {
		if(this.requirements(message)){
			return;
		}
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
			if(!search){
				return message.channel.send(`${emotes.error} - Please indicate the title of a song!`);
			}
		}else{
			if(!search){
				await util.player.play
				Playlist(message,player);
				return
			}
		}
		
			

		if(!message.attachments){
			await player.play(message, search, { firstResult: true });
		}else{
			await player.play(message, search, { isAttachment:true });
		}
		//background playlist handle
		if(player.backgroundPlaylist){
			player.backgroundPlaylist=false;
			await player.skip(message);
		}
	}
}

module.exports = CustomCommand;


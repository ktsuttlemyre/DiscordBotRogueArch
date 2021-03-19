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
		description: { content: 'skip'},
		aliases: ['skip','next'],
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
		let channel = message.member.voice.channel;
		if (!message.member.voice.channel) return `${emotes.error} - You're not in a voice channel !`;
		if (message.guild.me.voice.channel && channel.id !== message.guild.me.voice.channel.id) return `${emotes.error} - You are not in the same voice channel !`;
		
		if(channel && channel.members.size==1){
			return ;
		}
		//TODO implement voting

		if (!message.member.roles.cache.some(role => role.name === 'DJ')) {
			return 'DJ';
		}
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
		player.skip(message);
	}
}

module.exports = CustomCommand;


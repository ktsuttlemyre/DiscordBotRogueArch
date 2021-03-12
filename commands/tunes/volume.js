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
		description: { content: 'volume'},
		aliases: ['volume'],
		category: path.basename(path.dirname(_filename)),
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			{
				id: 'volume',
				default: '',
				match: 'number',
			},
		],
		channelRestriction: 'guild', 
		});
	}
	
	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'DJ')) {
			return 'DJ';
		}
		return null;
	}

	async exec(message, {volume} ) {
		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		var player = this.client.memory.get(message, 'player')
		if(!player){
			return message.channel.send('No player playing to act on')
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
		player.volume(message,volume);
	}
}

module.exports = CustomCommand;

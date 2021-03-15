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
		description: { content: 'restart'},
		aliases: ['restart','reboot'],
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
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message) {
// 		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
// 		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
// 		var player = this.client.memory.get(message.guild, 'player')
// 		if(!player){
// 			return message.channel.send('No player playing to act on')
// 		}
		
// 		var track = player.nowPlaying(message);
// 		if(track){
// 			await GUIMessages.nowPlaying(message,player,'Skipped: '+track.title)
// 		}else{
// 			await GUIMessages.nowPlaying(message,player,'Skipped: last track');
// 		}
// 		player.skip(message);
   		// process.exit(0);
		process.kill(process.pid, 'SIGTERM');
	}
}

module.exports = CustomCommand;

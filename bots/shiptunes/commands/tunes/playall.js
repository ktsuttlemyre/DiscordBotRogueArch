const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');


class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'pause the music'},
		//aliases: [commandVars.name],
		category: commandVars.category,
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
		if (!message.member.roles.cache.some(role => role.name === 'DJ')) {
			return 'DJ';
		}
		return null;
	}
  
	requirements(message,player){
		let blocked = '';
		if (!message.member.voice.channel) blocked = `${emotes.error} - You're not in a voice channel !`;
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) blocked = `${emotes.error} - You are not in the same voice channel !`;
		if(!player){blocked = 'No player currently playing';}
		return blocked
	}

	async exec(message) {
		let player = this.client.memory.get(message, 'player')
		let blocked = requirements(message,player);
		if(blocked){
			return this.handler.emit('commandBlocked',message,this,blocked);
		}
		var command = this.client.commandHandler.findCommand('play');
		await GUIMessages.nowPlaying(message,player,'paused');
	}
}

module.exports = CustomCommand;

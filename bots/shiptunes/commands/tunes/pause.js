const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');
const path = require('path');

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'pause'},
		aliases: [commandVars.name,'stop'],
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
		return util.player.commandPermissions(message,true);
	}
	
	async exec(message) {
		var player = this.client.memory.channelGet(message, 'player')
		if(!player){
			return this.handler.emit('commandBlocked',message,this,'No player playing to act on');
		}
		
		//if it is playing then do nothing
		var queue=player.getQueue(message);
		if(queue && (queue.paused || queue.stopped)){
			return
		}
		
		player.pause(message);
		await GUIMessages.nowPlaying(message,player,'paused')
	}
}

module.exports = CustomCommand;

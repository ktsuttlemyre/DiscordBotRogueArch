const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const util = require.main.require('./util');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');
const path = require('path');

const embedCommand = require.main.require('./bots/shipmod/commands/general/embed');
class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'back'},
		aliases: [commandVars.name,'prev','previous'],
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
		var player = this.client.memory.channelGet(message, 'player');
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
		
		//Notify the user what we are doing
		let track = queue.previousTracks[queue.previousTracks.length-1];
		if(!track){
			return GUIMessages.nowPlaying(message,player,'Can\'t go back any further');
		}
		let response='Back to previous track: '+track.title;
		await GUIMessages.nowPlaying(message,player,response);

		if(player.back(message)){
			return util.messages.encapsulate(message,{description:response});
			//this.handler.modules['embed'].exec(message,)	
		}
		this.handler.emit('commandBlocked',message,this,'Sending back command to player failed');
	}
}

module.exports = CustomCommand;

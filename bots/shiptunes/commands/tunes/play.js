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
		description: { content: 'plays [name/URL]'+
			      'This command will search Youtube for songs using your keywords!\n'+
				'In addition this command also accepts links that point to:\n'+
				' - Spotify song\n'+
				' - Spotify playlist (Must have DJ role)\n '+
				' - Youtube playlist (Must have DJ role)\n'+
				' - Youtube video\n'+
				' - Soundcloud song\n'+
				' - Vimeo\n'+
				' - Facebook\n'+
				' - Reverbnation\n'+
				'You can also upload your own files as attachments to the message and will be played as requests\n'
			     },
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
		//simple playlist filter
		//youtube uses list= as a url param and spotify uses /playlist/ endpoint
		if(message.content.includes('list=') || message.content.includes('/playlist/')){
		   return 'DJ';
		}
		return util.player.commandPermissions(message);
	}
	
	async exec(message, { search }) {
		var player = this.client.memory.channelGet(message, 'player') || this.client.memory.channelSet(message, 'player', util.player.create(message,this.client));
		let hasAttachments = message.attachments && !!message.attachments.size;
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
			if(!search && !hasAttachments){
				!message.deleted && message.delete();
				return GUIMessages.nowPlaying(message,player,`${emotes.error} - Please indicate the title of a song!`);
			}
		}else{
			if(!search && !hasAttachments){
				await util.player.playBackgroundPlaylist(message, player);
				return
			}
		}
		
			

		await player.play(message, search, true, hasAttachments);
		//The player was originallly in background mode
		//so advance past the backgroud music and start playing the users' requests
		if(player.backgroundPlaylist){
			player.backgroundPlaylist=false;
			await player.skip(message);
		}
	}
}

module.exports = CustomCommand;


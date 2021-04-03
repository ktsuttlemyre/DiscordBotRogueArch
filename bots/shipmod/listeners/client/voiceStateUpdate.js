const { Listener } = require('discord-akairo');
const util = require.main.require('./util');
const config = util.config;
const commandVars = util.commandVars(__filename);

class CustomListener extends Listener {
	constructor() {
		super(commandVars.name, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec( oldstate, newstate, manuallyTriggered ) {
		var env = process.env.ENVIRONMENT
        	//if(env != 'production'){
		//	return;
		//}
		let thisMember = newstate.member;
		if(thisMember.user.bot){
			return
		}
		let guild = newstate.guild;
		let client = this.client;
		
		
		// voice-text-channel-link
		let roomChanged = ((oldstate.channelID || newstate.channelID) && oldstate.channelID !== newstate.channelID);
		let channelMap = config.voiceTextLinkMap;
		
		let permissionsNeeded = ['VIEW_CHANNEL','MANAGE_CHANNELS'];
		
		config.debug && console.info('voiceStateUpdate',oldstate.channelID,newstate.channelID,roomChanged,thisMember.displayName);
		    
		//enter new chatroom
		let textChannelID = channelMap[newstate.channelID];
		let textChannel = guild.channels.cache.get(textChannelID);
		let permissions;
		if(textChannel){
			permissions = textChannel.permissionsFor(guild.me)
			if(permissions.has(permissionsNeeded)){
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: true
				});
			}else{
				console.log('bot does not have permission to change permissions in '+textChannel.name)
			}
		}
		if(!manuallyTriggered){
			await util.playClip({channel:newstate.channel},thisMember.id);
			//client.commandHandler.runCommand(message,client.commandHandler.findCommand('clip'),thisMember.id);
		}
		
		//leave old chatroom (if they left a room)
		textChannelID = channelMap[oldstate.channelID];
		textChannel = guild.channels.cache.get(textChannelID);
		if(roomChanged && textChannel){ //if they actually left a channel because the id changed			
			permissions = textChannel.permissionsFor(guild.me)
			//console.log(permissions.toArray())
			if(permissions.has(permissionsNeeded)){
				//leave private rooms
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: false
				});
			}else{
				console.log('bot does not have permission to change permissions in '+textChannel.name)
			}
		}
		
		
		//handle amongus mute mode
		let muteChanged = oldstate.selfMute!=newstate.selfMute
		let muted= newstate.selfMute;
		if(newstate.channel && muteChanged){
			let amongusMode = this.client.memory.channelGet(newstate, 'amongusMode');
			//mute handler
			if(amongusMode){
				newstate.channel.members.forEach(function(member){
					if(member.id == thisMember.id){return}
					member.voice.setMute(muted);
				}); //end members

			}
		}
		
		
		
	    
	}
}

module.exports = CustomListener;

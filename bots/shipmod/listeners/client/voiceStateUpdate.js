var debug = true; 
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

	async exec( oldstate, newstate, startupTriggered ) {
		console.log('voicestateupdate!')
		if(oldstate.partial || newstate.partial){
			return
		}
		var env = process.env.ENVIRONMENT
        	if(env != 'production'){
			return;
		}
		let thisMember = newstate.member;
		if(thisMember.user.bot){
			return
		}
		let guild = newstate.guild;
		let client = this.client;
		
		
		let changed ={	
			channelID: oldstate.channelID !== newstate.channelID,
			deaf: oldstate.deaf !== newstate.deaf,
			mute: oldstate.mute !== newstate.mute,
			selfDeaf: oldstate.selfDeaf !== newstate.selfDeaf,
			selfMute: oldstate.selfMute !== newstate.selfMute,
			selfVideo: oldstate.selfVideo !== newstate.selfVideo,
			serverDeaf: oldstate.serverDeaf !== newstate.serverDeaf,
			serverMute: oldstate.serverMute !== newstate.serverMute,
			speaking: oldstate.speaking !== newstate.speaking,
			streaming: oldstate.streaming !== newstate.streaming
		}
		debug && console.log(`voiceStateUpdate Triggered for user ${thisMember.tag} with state`,changed)
		
		// voice-text-channel-link
		let roomChanged = ((oldstate.channelID || newstate.channelID) && oldstate.channelID !== newstate.channelID);
		let channelMap = config.voiceTextLinkMap;
		
		let permissionsNeeded = ['VIEW_CHANNEL','MANAGE_CHANNELS'];
		
		debug && console.info('voiceStateUpdate',oldstate.channelID,newstate.channelID,roomChanged,thisMember.displayName);
		    
		//enter new chatroom
		let textChannelID = channelMap[newstate.channelID];
		let textChannel = guild.channels.cache.get(textChannelID);
		let permissions;
		if(textChannel){
			debug && console.log('entering a hidden channel',textChannelID)
			permissions = textChannel.permissionsFor(guild.me)
			if(permissions.has(permissionsNeeded)){
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: true
				});
				debug && console.log('showed hidden channel',textChannelID)
			}else{
				console.log('bot does not have permission to change permissions in '+textChannel.name)
			}
		}

		
		//leave old chatroom (if they left a room)
		textChannelID = channelMap[oldstate.channelID];
		textChannel = guild.channels.cache.get(textChannelID);
		if(roomChanged && textChannel){ //if they actually left a channel because the id changed
			debug && console.log('leaving a hidden channel',textChannelID)
			permissions = textChannel.permissionsFor(guild.me)
			//console.log(permissions.toArray())
			if(permissions.has(permissionsNeeded)){
				//leave private rooms
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: false
				});
				debug && console.log('hide hidden channel',textChannelID)
			}else{
				console.log('bot does not have permission to change permissions in '+textChannel.name)
			}
		}
		
		/************************ End startup Trigger **************/
		if(startupTriggered){
			return
		}
		//handle amongus mute mode
// 		if(newstate.channelID && changed.selfMute){ //if in a channel and mute state changed
// 			let amongusMode = this.client.memory.channelGet(newstate, 'amongusMode');
// 			//mute handler
// 			if(amongusMode){
// 				newstate.channel.members.forEach(function(member){
// 					if(member.id == thisMember.id){return}
//					if(member.user.bot){return}
// 					member.voice.setMute(newstate.mute);
// 				}); //end members

// 			}
// 		}
				
		let joinLeaveConfig=config.voiceJoinLeave
		
		
		
		//only work if this is a real event and the channel has changed
		if(changed.channelID){ //channel changed
			permissions = newstate.channel.permissionsFor(guild.me);
			//reset the users status removing serverMute and serverDeafen if they do not have the voicemute or voicedeaf role
			if(!newstate.member.user.bot && (joinLeaveConfig.resetUserState || oldstate.channelID == oldstate.guild.afkChannelID)){
				if(permissions.has(['MUTE_MEMBERS'])){
					!thisMember.roles.cache.some(role => role.name === config.roles.VoiceMute) && newstate.setMute(false);
				}else{
					console.log(`${guild.me} does not have permissions to set mute state to ${thisMember} in ${newstate.channel.name}`)
				}
				if(permissions.has('DEAFEN_MEMBERS'])){
					!thisMember.roles.cache.some(role => role.name === config.roles.VoiceDeaf) && newstate.setDeaf(false);
				}else{
					console.log(`${guild.me} does not have permissions to set deafen state to ${thisMember} in ${newstate.channel.name}`)
				}
			}
			//mute if entering afkChannel
			if(newstate.channelID == newstate.guild.afkChannelID){
				if(permissions.has(['MUTE_MEMBERS']){
				   newstate.setMute(true);
				}else{
					console.log(`${guild.me} does not have permissions to mute ${thisMember} in ${newstate.channel.name}`)
				}
				if(permissions.has(['DEAFEN_MEMBERS'])){
					newstate.setDeaf(true);
				}else{
					console.log(`${guild.me} does not have permissions to deafen ${thisMember} in ${newstate.channel.name}`)
				}
			}
			
			// play themetones
			if(joinLeaveConfig.tones && joinLeaveConfig.tones.on){
				if(oldstate.channelID != oldstate.guild.afkChannelID){
					await util.playThemeTone(oldstate.channel,joinLeaveConfig.tones.defaultLeaveTone);
				}
				if(newstate.channelID != newstate.guild.afkChannelID){
					await util.playThemeTone(newstate.channel,thisMember.id);
				}
			}
			//client.commandHandler.runCommand(message,client.commandHandler.findCommand('clip'),thisMember.id);
		}
		
		
		
	    
	}
}

module.exports = CustomListener;

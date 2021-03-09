const { Listener } = require('discord-akairo');
const config = require.main.require('./config')

class ReadyListener extends Listener {
	constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: 'client',
		});
	}

	async exec( oldstate, newstate ) {
		let thisMember = newstate.member;
		if(thisMember.user.bot){
			return
		}
		let guild = newstate.guild;
		
		// voice-text-channel-link
		let roomChanged = oldstate.channelID != newstate.channelID
		let channelMap=config.voiceTextLinkMap;
		    
		//enter new chatroom
		let textChannelID=channelMap[newstate.channelID];
		let textChannel=guild.channels.cache.get(textChannelID);
		if(textChannel){
			let permissions= textChannel.permissionsFor(guild.me)
			if(permissions.has(['VIEW_CHANNEL','MANAGE_CHANNELS'],false)){
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: true
				});
			}else{
				console.log('bot does not have permission to change permissions in '+textChannelID)
			}
		}
		
		//leave old chatroom (if they left a room)
		if(oldstate.channelID && oldstate.channelID !== newstate.channelID){ //if they actually left a channel because the id changed
			textChannelID=channelMap[oldstate.channelID];
			textChannel=guild.channels.cache.get(textChannelID);
			if(textChannel){
				let permissions= textChannel.permissionsFor(guild.me)
				//console.log(permissions.toArray())
				if(permissions.has(['VIEW_CHANNEL','MANAGE_CHANNELS'],false)){
					//leave private rooms
					textChannel.updateOverwrite(thisMember, {
					    //SEND_MESSAGES: false,
					    VIEW_CHANNEL: false
					});
				}else{
					console.log('bot does not have permission to change permissions in '+textChannelID)
				}
			}
		}
		
		
		if(newstate.channel){
			let amongusMode = this.client.memory.channelGet(newstate, 'amongusMode');
			//mute handler
			if(amongusMode){
				let muteChanged = oldstate.selfMute!=newstate.selfMute
				let muted= newstate.selfMute;
				if(muteChanged){
					let channel = newstate.channel;
					channel.members.forEach(function(member){
						if(member.id == thisMember.id){return}
						member.voice.setMute(muted);
					}); //end members

				}
			}
		}
	    
	}
}

module.exports = ReadyListener;

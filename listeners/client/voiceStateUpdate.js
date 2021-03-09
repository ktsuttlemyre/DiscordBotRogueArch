const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
	constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: 'client',
		});
	}

	async exec( oldstate, newstate ) {
		var thisMember = newstate.member;
		if(thisMember.user.bot){
			return
		}
		var guild = newstate.guild;
		
		
		var amongusMode = this.client.memory.channelGet(newstate, 'amongusMode');
		//mute handler
		if(amongusMode){
			var muteChanged = oldstate.selfMute!=newstate.selfMute
			var muted= newstate.selfMute;
			if(muteChanged){
				let channel = newstate.channel;
				channel.members.forEach(function(member){
					if(member.id == thisMember.id){return}
					member.voice.setMute(muted);
				}); //end members

			}
		}

		// voice-text-channel-link
		var roomChanged = oldstate.channelID != newstate.channelID
		var channelMap={
			//general: shiptunes
			'799879532856475648':'805549728099860480',
			//social groovy
			'690661623831986270':'800007831251189821',
		}
		
		if(oldstate.channelID !== newstate.channelID){ //if they actually left a channel because the id changed
			var textChannelID=channelMap[oldstate.channelID];
			var textChannel=guild.channels.cache.get(textChannelID);
			if(textChannel){
				var permissions= textChannel.permissionsFor(guild.me)
				if(permissions.has('MANAGE_CHANNELS')){
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

		textChannelID=channelMap[newstate.channelID];
		textChannel=guild.channels.cache.get(textChannelID);
		if(textChannel){
			var permissions= textChannel.permissionsFor(guild.me)
			if(permissions.has('MANAGE_CHANNELS')){
				textChannel.updateOverwrite(thisMember, {
				    //SEND_MESSAGES: false,
				    VIEW_CHANNEL: true
				});
			}else{
				console.log('bot does not have permission to change permissions in '+textChannelID)
			}
		}
	    
	}
}

module.exports = ReadyListener;

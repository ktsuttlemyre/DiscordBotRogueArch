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
    
    
	    var user = newstate.member;
	    var muteChanged = oldstate.selfMute!=newstate.selfMute
	    var muted= newstate.selfMute;

	    var roomChanged = oldstate.channelID != newstate.channelID
	    
	    var guild = newstate.guild;

	    if(muteChanged){
		let channel = user.voiceChannel;
		for (var i=0,l=channel.members.length;i<l;i++) {
			var member = channel.members[i];
			if(member.id == user.id){continue}
			member.setMute(muted)
		}
		
	    }
		
	    var channelMap={
		//general: shiptunes
		'799879532856475648':'805549728099860480',
		//social groovy
		'690661623831986270':'800007831251189821',
	    }
		
	    if(roomChanged){
		var textChannelID=channelMap[oldstate.channelID];
		var textChannel=guild.channels.cache.get(textChannelID);
		if(textChannel){
			//leave private rooms
			textChannel.updateOverwrite(user, {
			    //SEND_MESSAGES: false,
			    VIEW_CHANNEL: false
			});
		}
		    
		textChannelID=channelMap[newstate.channelID];
		textChannel=guild.channels.cache.get(textChannelID);
		if(textChannel){
			//join private rooms
			textChannel.updateOverwrite(user, {
			    //SEND_MESSAGES: false,
			    VIEW_CHANNEL: true
			});
		}
	    }
	}
}

module.exports = ReadyListener;

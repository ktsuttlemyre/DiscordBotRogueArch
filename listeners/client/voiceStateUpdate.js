const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
	constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: 'client',
		});
	}

	async exec( oldState, newState ) {
    
    
    
    //(oldstate.member.id
    if(old
      let channel = message.member.voiceChannel;
      for (let member of channel.members) {
        member[1].setMute(true)
      }
    
    
	// Log that the bot is online.
		this.client.logger.info(`${this.client.user.tag}, ready to serve ${this.client.users.size} users in ${this.client.guilds.size} servers.`, 'ready');
		// Set the bot status
		this.client.user.setActivity('Akiro Boilerplate v1.0.0', { type: 'PLAYING' });
	}
}

module.exports = ReadyListener;

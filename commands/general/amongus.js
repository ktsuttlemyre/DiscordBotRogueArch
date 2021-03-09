const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
var _ = require('lodash');

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class PlayCommand extends Command {
	constructor() {
		super('amongus', {
		description: { content: 'sets amongus muting'},
		aliases: [''],
		category: 'general',
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			 {
			 	id: 'bool',
			 	default: '',
			 	match: '/^(yes|no|true|false|\d+|on|off|null|undefined|nan|toggle|switch|flip|!+)$/',
			 },
			],
		channelRestriction: 'guild', 
		});
	}
	
	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message, bool) {
    var varName = 'amongusMode';
    
    if(!bool.length){ //query current value
      return message.send('Current value is: ' + this.client.memory.channelGet(message.guild, message.channel, varName));
    }
    
    var toggle = bool.match(/^(toggle|switch|flip|!+)$/);
    if(toggle){
      var value = this.client.memory.channelSet(message.guild, message.channel varName, !!this.client.memory.channelGet(message.guild, message.channel, varName) );
      return message.send('Toggled value to: ' + value);
    }

    var value = (bool.match(/^(no|false|0|off|null|undefined|nan)$/))?false:true;
		this.client.memory.channelSet(message.guild, message.channel, varName, value );
    return message.send('Changed value to:'+ value)
	}
}

module.exports = PlayCommand;



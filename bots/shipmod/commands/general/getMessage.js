const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');
const util= require.main.require('./util');
const commandVars = util.commandVars(__filename);

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'fetchall'},
		aliases: [commandVars.name],
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
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message, {search}) {

	    //let messages = await common.getMessages(message.channel);
	    //message.channel.send(`got ${messages.length} messages`);
		
		let id = search
	await common.fetchMessages(message.channel,function(message,index,messages,gIndex){
		if(message.id == search){
      return 
    }
	})

 message.channel.send('```'+JSON.stringify(message)+'```')

    
	}
}

module.exports = CustomCommand;

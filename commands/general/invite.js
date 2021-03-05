const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
var _ = require('lodash');

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class CustomCommand extends Command {
	constructor() {
		super('invite', {
		description: { content: 'invite'},
		aliases: ['invite'],
		category: 'general',
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
  
	async exec(message) {
    return message.member
      .send(`https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=70282305&scope=bot`)
      .catch(console.error);
	}
}

module.exports = CustomCommand;

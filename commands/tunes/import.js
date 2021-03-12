const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
var _ = require('lodash');
var path = require('path');


class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'import'},
		aliases: ['import'],
		category: path.basename(path.dirname(filename)),
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
	
	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message) {

  //  common.fetchMessages(message.channel,{},function(message,index,messages,gIndex){
    //  var match = message.content.match(/added/:/[(.*?)/]/);

//       if(match){
//         spreadsheet.insert(match[1]);
//       }

//     })
// 	    let messages = await common.getMessages(message.channel);
// 	    message.channel.send(`got ${messages.length} messages`);
    
    
	}
}

module.exports = CustomCommand;

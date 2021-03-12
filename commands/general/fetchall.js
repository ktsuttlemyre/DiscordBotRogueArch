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
		super('fetchall', {
		description: { content: 'fetchall'},
		aliases: ['fetchall'],
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
	
	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message) {

	    //let messages = await common.getMessages(message.channel);
	    //message.channel.send(`got ${messages.length} messages`);
		
		
	var iArray=[]
	var gArray=[]
	var array=[]
	await common.fetchMessages(message.channel,function(message,index,messages,gIndex){
		iArray.push(index)
		gArray.push(gIndex)
		array.push(message)
	})
	message.channel.send(`got ${gArray.length} messages`);
	console.log(iArray)
	console.log(gArray)
		
// 	common.fetchMessages(message.channel,{},function(message,index,messages,gIndex){
// 		var match = message.content.match(/added/:/[(.*?)/]/);

// 		if(match){
// 			spreadsheet.insert(match[1]);
// 		}

// 	})	
    
    
	}
}

module.exports = PlayCommand;

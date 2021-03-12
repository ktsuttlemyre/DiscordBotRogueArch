const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');
const web = require.main.require('./web');

class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'fetchall'},
		aliases: ['fetchall'],
		category: path.basename(path.dirname(__filename)),
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
	var hash={}
	var embeds=[]
	var embed = []
	var added=[]
	var youtubeLinks=[]
	await common.fetchMessages(message.channel,function(message,index,messages,gIndex){
		
		if(message.embeds.length){
			let text = JSON.stringify({embeds:message.embeds,content:message.content},null,2)
			if(text){
				text=text.split(/\s+/);
				//console.log("text",text)
				text.forEach(function(word){
					if(word.length<11){
						return
					}
					let youtube = web.getYoutubeHash(word);
					if(youtube){
						youtubeLinks.push(youtube)
					}
				})
			}
			embeds.push(message)
		}
		if(message.embed){
			embed.push(message)
		}
// 		if(common.findInMessage(message,'added')){
// 		   added.push(message)
// 		}
		iArray.push(index)
		gArray.push(gIndex)
		
		if(hash[message.id]){
			message.channel.send('found duplicate')
			return true;
		}else{
			hash[message.id]=1
		}
		array.push(message)
	})
	message.channel.send(`got ${gArray.length} messages`);
	console.log(iArray)
	console.log(iArray.length)
	console.log(gArray)
	console.log(gArray.length)
	console.log(array.length)
	console.log('embeds messages',embeds.length)
		console.log('embed messages',embed.length)
		console.log('added messages',added.length)
		console.log('total youtube links',youtubeLinks.length,'unique=',_.uniq(youtubeLinks).length,youtubeLinks.join(' '))
		
		
// 	common.fetchMessages(message.channel,{},function(message,index,messages,gIndex){
// 		var match = message.content.match(/added/:/[(.*?)/]/);

// 		if(match){
// 			spreadsheet.insert(match[1]);
// 		}

// 	})	
    
    
	}
}

module.exports = CustomCommand;

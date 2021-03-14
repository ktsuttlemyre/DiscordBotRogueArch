const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');


class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'sets amongus muting'},
		aliases: ['amongusq','amongusqueue','amongusadd'],
		category: path.basename(path.dirname(__filename)),
		clientPermissions: ['SEND_MESSAGES'],
//		args: [
// 			 {
// 			 	id: 'user',
// 			 	default: '',
// 			 	match: 'content',
// 			 },
// 			],
		channelRestriction: 'guild', 
		});
	}

	async exec(message) {
	    let amongEmojis=['<:AmongUsDeadOrange:800120891857829919>','<:AmongButton:800807792193306684>','<:among_us_report:800804847728853022>','<:amongusshhhhh:800119749056921640>']
	    let varName = 'amongusq'
	    let q = this.client.memory.get(message, varName) || [];
	    let lastMessage = this.client.memory.get(message, 'lastAmongusQ');
	    let person = message.member||message.author
	    let name = person.displayName || person.tag
	    if(q.indexOf(name)<0){
	    	q.push(name);
	    }
	    if(lastMessage){
		    lastMessage.delete()
	    }
	    message.delete();
	    this.client.memory.set(message, varName, q);
	    
	    lastMessage = await message.channel.send({embed:{
		    			title:'<:amongus:800119041452146731> AmongUs Queue '+_.sample(amongEmojis),
					description:q.join('\n'),
					footer: {
						text: 'type !amongusadd to be added to the queue!',
						//icon_url: 'https://i.imgur.com/wSTFkRM.png',
					},
	    			}});
	    this.client.memory.set(message, 'lastAmongusQ', lastMessage);
	}
}

module.exports = CustomCommand;


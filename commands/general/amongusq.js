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
		aliases: ['amongusq','amongusqueue'],
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
	    let varName = 'amongusq'
	    let q = this.client.memory.get(message, varName) || [];
	    let person = message.member||message.author
	    let name = person.displayName || person.tag
	    if(q.indexof(name)<0){
	    	q.push(name);
	    }
	    message.delete()
	    message.channel.send({embed:{title:'AmongUs Queue',description:q.join('\n')}});
	    this.client.memory.set(message, varName, q);
	}
}

module.exports = CustomCommand;


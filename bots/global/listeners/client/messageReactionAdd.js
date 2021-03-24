// howto
//https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// code example
//https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/12/uncached-messages.js
const { MessageEmbed } = require('discord.js');
const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const commandVars = require.main.require('./common').commandVars(__filename);
const util = require.main.require('./util');
const _ = require('lodash');


class CustomListener extends Listener {
	constructor() {
		super(commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}


	async exec( reaction, user ) {
		if(user.bot){
			return
		}

		//make sure message is resolved
		let message = await util.messages.resolve(reaction.message);
		
		let member = message.guild.member(user) || user;
		let name = member.displayName || member.username || member.tag;
		
		let sendToUser = /*message.guild.member(message.member.user) ||*/ message.member;
		
		this.client.emit('rogueReactionAdd',message,reaction,member) //handle the reaction
// 		if(sendToUser.bot || sendToUser.user.bot){
// 			//Do bot application functions here
// 			if(sendToUser.id == this.client.user.id){ //shipmod
// 				console.log('emmiting')
// 			}
// 		}
	}
}
module.exports = CustomListener;

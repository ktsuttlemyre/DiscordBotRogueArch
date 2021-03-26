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


	async exec( message, reaction, member ) {
// 		//note don't do bot check here because we already did it on the global messaeReacitonAdd.
// 		if(sendToUser.bot || sendToUser.user.bot){
// 			//Do bot application functions here
// 			if(sendToUser.id == this.client.user.id){ //shipmod
// 				console.log('emmiting')
				
// 			}
// 		}
		
		
		let name = member.displayName || member.username || member.tag;
		
		let sendToUser = /*message.guild.member(message.member.user) ||*/ message.member;
		
		let mEmbed = message.embed || message.embeds[0];
		let messagePreview = message.content || mEmbed.title || mEmbed.description || '<preview unavailable>';
		messagePreview = _.truncate(message.content);
		messagePreview = messagePreview || '<preview unavailable>';
		
		console.log(`${name} reacted with "${reaction.emoji.name}" to ${sendToUser.displayName}'s ${message.id} with content ${messagePreview}.`);
			
		//render
		let embed = new MessageEmbed();
		embed.setAuthor(`${name} reacted ${reaction.emoji.name}`, ((member.user)?member.user.displayAvatarURL():member.displayAvatarURL()) || common.defaultAvatar, `https://discordapp.com/users/${member.id}`);
		let permalink = util.messages.permalink(message);
		embed.setDescription(`channel: [${message.channel.name}](${permalink})\nmessage: [${messagePreview}](${permalink})`)
			.setFooter(`ID: ${message.id}`)
			.setTimestamp()
			
		let logChannel=message.guild.channels.resolve(config.actionLogChannel);
		logChannel && logChannel.send(embed);
		
		//see if user wants notificaiton
		console.log(sendToUser.roles.cache)
		let notify = sendToUser.roles.cache.find(r => r.name === "ReceiveReactAlert");
		notify && sendToUser.user.send(embed);
	}
}
module.exports = CustomListener;

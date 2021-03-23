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
		super(commandVars.name, {
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
		let mEmbed = message.embed || message.embeds[0];
		let messagePreview = message.content || mEmbed.title || mEmbed.description || '<preview unavailable>';
		messagePreview = _.truncate(message.content);
		messagePreview = messagePreview || '<preview unavailable>';
		let sendToUser = /*message.guild.member(message.member.user) ||*/ message.member;
		
		console.log(`${name} reacted with "${reaction.emoji.name}" to ${sendToUser.displayName}'s ${message.id} with content ${messagePreview}.`);
			
		//render
		let embed = new MessageEmbed();
		embed.setAuthor(`${name} reacted ${reaction.emoji.name}`, user.displayAvatarURL() || common.defaultAvatar, `https://discordapp.com/users/${user.id}`);
		let permalink = util.messages.permalink(message);
		embed.setDescription(`channel: [${message.channel.name}](${permalink})\nmessage: [${messagePreview}](${permalink})`)
			.setFooter(`ID: ${message.id}`)
			.setTimestamp()
			
		let logChannel=message.guild.channels.resolve(config.actionLogChannel);
		logChannel && logChannel.send(embed);
		
		//see if user wants notificaiton
		console.log(sendToUser.roles)
		let notify = sendToUser.roles.cache.find(r => r.name === "ReceiveReactAlert");
		notify && sendToUser.user.send(embed);
	}
}
module.exports = CustomListener;

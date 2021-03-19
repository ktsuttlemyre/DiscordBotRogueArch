// howto
//https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// code example
//https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/12/uncached-messages.js

const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const commandVars = require.main.require('./common').commandVars(__filename);

let optomized = false

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
		let sendToUser=reaction.message.member;
		let notify = null;

		if(optomized){
			if(sendToUser){
				notify = userWantsEmojiNotifications();
				if(notify === false){
					return
				}
			}
		}

		//load partial
		if (reaction.message.partial) {
			try {
				await reaction.message.fetch();
			} catch (error) {
				console.error('Something went wrong when fetching the message: ', error);
			}
		}

		let message = reaction.message
		let member = convert(user to member) || user;
		let name = member.displayName || member.username || member.tag;

		console.log(`${name} reacted with "${reaction.emoji.name}" to ${message.id} with content ${message.content}.`);

		//see if user wants notificaiton
		sendToUser=reaction.message.member;
		if(notify==null){
			notify = userWantsEmojiNotifications()
		}
		if(notify!==true){
			return
		}

		//render
		let embed = new Discord.MessageEmbed();
		embed.setAuthor(name, user.displayAvatarURL() || common.defaultAvatar, `https://discordapp.com/users/${user.id}`);
		let messageContent=_.truncate(message.content);
		embed.setDiscription(`Reacted with ${reaction.emoji.name} to your message ${messageContent}`);
		sendToUser.send(embed);
	}
}
module.exports = CustomListener;

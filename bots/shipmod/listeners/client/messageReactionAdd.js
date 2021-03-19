// howto
//https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// code example
//https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/12/uncached-messages.js

const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const commandVars = require.main.require('./common').commandVars(__filename);



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


 		//this is off because it is probably a bad idea to use a partial before calling .fetch()
		//let optomized = false;
		// if(optomized){
		// 	if(sendToUser){
		// 		notify = userWantsEmojiNotifications();
		// 		if(notify === false){
		// 			return
		// 		}
		// 	}
		// }


		//make sure message is resolved
		let message = await util.messages.resolve(reaction.message);
		let member = /* //todoconvert(user to member) || */user;
		let name = member.displayName || member.username || member.tag;
		let messageContent=_.truncate(message.content);

		console.log(`${name} reacted with "${reaction.emoji.name}" to ${sendtoUser}'s ${message.id} with content ${messageContent}.`);

		//see if user wants notificaiton
		let sendToUser = message.member;
		let notify = userWantsEmojiNotifications()
		if(notify!==true){
			return ;
		}

		//render
		let embed = new Discord.MessageEmbed();
		embed.setAuthor(name, user.displayAvatarURL() || common.defaultAvatar, `https://discordapp.com/users/${user.id}`);
		embed.setDiscription(`Reacted with ${reaction.emoji.name} to your message ${messageContent}`);
		sendToUser.send(embed);
	}
}
module.exports = CustomListener;

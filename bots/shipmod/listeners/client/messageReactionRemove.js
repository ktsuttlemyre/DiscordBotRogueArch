// howto
//https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// code example
//https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/12/uncached-messages.js

const {MessageEmbed} = require("discord.js");
const {Listener} = require("discord-akairo");
const config = require.main.require("./config");
const commandVars = require.main.require("./common").commandVars(__filename);
const util = require.main.require("./util");
const _ = require("lodash");

class CustomListener extends Listener {
	constructor() {
		super(commandVars.name, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec(reaction, user) {
		if (reaction.partial) {
			return;
		}
		var env = process.env.ENVIRONMENT;
		if (env != "production") {
			return;
		}
		if (user.bot) {
			return;
		}
		let client = this.client;

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

		/** Information gathering **/
		//make sure message is resolved
		let message = await util.messages.resolve(reaction.message);

		let member = message.guild.member(user) || user;
		let name = member.displayName || member.username || member.tag;
		let userID = member.id || member.user.id;

		let sendToUser = /*message.guild.member(message.member.user) ||*/ message.member;

		let mEmbed = message.embed || message.embeds[0] || {};
		let messagePreview = message.content || mEmbed.title || mEmbed.description || "<preview unavailable>";
		messagePreview = _.truncate(message.content);
		messagePreview = messagePreview || "<preview unavailable>";

		console.log(`${name} removed reaction "${reaction.emoji.name}" on ${sendToUser.displayName}'s ${message.id} with content ${messagePreview}.`);

		/** Emoji alerts **/
		let key = `${message.id}/${userID}`;
		let cache = this.client.memory.channelGet(message, "reactionCache", {});
		//let cacheFunctions = this.client.memory.channelGet(message,'reactionListener',{});

		let entry = cache[key] || (cache[key] = []);
		_.remove(entry, function (obj) {
			return obj.emoji.name === reaction.emoji.name;
		});

		//render
		let embed = new MessageEmbed();
		embed.setAuthor(
			`${name} removed reaction ${reaction.emoji.name}`,
			user.displayAvatarURL() || common.defaultAvatar,
			`https://discordapp.com/users/${user.id}`
		);
		let permalink = util.messages.permalink(message);
		let string = `channel: [${message.channel.name}](${permalink})\nmessage: [${messagePreview}](${permalink})`
		if(!_.random(0,5)){
			string += '\nto unsubscribe from alerts type `!unsubscribe`'
		}
		embed
			.setDescription(string)
			.setFooter(`ID: ${message.id}`)
			.setTimestamp();

		//sendToUser.send(embed);

		let logChannel = message.guild.channels.resolve("800748408741953576"); //cache.get('800748408741953576');
		if (logChannel) {
			logChannel.send(embed);
		}

		//see if user wants notificaiton
		let notify = sendToUser.roles.cache.find((r) => r.name === "🔣📥");
		if(notify && !sendToUser.roles.cache.find((r) => r.name === "⛔🤖📥")){ //make sure not to bother people explicitly asking for no inbox
			sendToUser.user.send(embed);
		}

		/** Reaction router **/
		//util.messages.ractionRouter(reaction,message,member);
		this.client.emit("reactionRemoveEvent", message, reaction, member);

		/** role reactions **/
		//config.roleReaction
	}
}

module.exports = CustomListener;

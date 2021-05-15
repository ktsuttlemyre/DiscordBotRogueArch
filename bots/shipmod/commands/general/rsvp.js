let debug = true;
const {Client, Collection} = require("discord.js");
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const common = require.main.require("./common");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const roomMap = require.main.require("./config").eventRoomMap;
const escapeMD = require("markdown-escape");

class CustomCommand extends Command {
	constructor() {
		super(commandVars.id, {
			description: {content: "Manages event queue"},
			aliases: [commandVars.name, "eventq", "eventqueue", "eventadd", "event"],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
			// 		args: [
			// 			 {
			// 			 	id: 'queue',
			// 			 	default: '',
			// 			 	match: 'content',
			// 			 },
			// 			],
			channelRestriction: "guild",
		});
	}

	parseInput(message) {}

	async exec(message) {
		let client = this.client;
		let queueTitle = roomMap[message.channel.id] || message.channel.name;
		queueTitle = queueTitle.trim().toUpperCase();

		let randomEmoji = [];
		let title = `${queueTitle} Event Queue `;
		
		let messages = await message.channel.messages.fetch({ limit: 100 });
		debug && console.log('got messages',messages.size)
		let today = Date.now();
		let lastPost = messages.find(function(post){
			debug && console.log('post',post)
			if(post.embed && post.embed.title.indexOf('Event Queue') >= 0){
				let date = post.createdAt;
				let isSameDay = (date.getDate() === today.getDate() 
					&& date.getMonth() === today.getMonth()
					&& date.getFullYear() === today.getFullYear());
				return isSameDay;
			}
		})
		debug && console.log('got lastpost',lastPost.embed)
		
		let queue = new Collection();
		//good we found a message. Lets parse out the names
		if(lastPost){
			let userIDs=[]
			lastPost.embed.description.replace(/https:\/\/discordapp\.com\/users\/(\d*)/g,(element,userID) => {
			   userIDs.push(userID);
			});
			debug && console.log('got userIDs',userIDs)
			for(let i=0,l=userIDs;i<l;i++){
				let userID = userIDs[i]
				let users = await client.users.fetch(userID, { cache: true });
				queue.set(userID,users)
			}
		}
		debug && console.log('got queue',queue)
		
		
		
		let varName = queueTitle + "_queue";
		//let queue = this.client.memory.get(message, varName) || new Collection();
		let lastMessageID = varName + "LastMessage";
		let lastMessage = this.client.memory.get(message, lastMessageID);
		let user = message.member || message.author;
		switch (queueTitle) {
			case "AMONGUS":
				randomEmoji = [
					"<:AmongUsDeadOrange:800120891857829919>",
					"<:AmongButton:800807792193306684>",
					"<:among_us_report:800804847728853022>",
					"<:amongusshhhhh:800119749056921640>",
				];
				title = "<:amongus:800119041452146731> AmongUs Event Queue " + _.sample(randomEmoji);
				break;
			default:

			//message.channel.send('No queue associated with '+queueTitle);
		}
		if (!queue.get(user)) {
			queue.set(user.id, user);
		}

		lastMessage && lastMessage.delete();
		message.delete();
		//this.client.memory.set(message, varName, queue);

		//Render
		let qDisplay = [];
		queue.each(function (user) {
			//let inGame = (message.author||message.member).voice.channel.members.
			let name = user.displayName || user.tag;
			let voiceChannel = user.voice.channel;
			let notAFK = null;
			let inGuildChannel = null;
			if (voiceChannel) {
				notAFK = message.guild.afkChannelID != voiceChannel.id;
				inGuildChannel = voiceChannel.guild.id == message.guild.id;
			}
			name = escapeMD(name);
			qDisplay.push(
				"\t " +
					common.reactions[(voiceChannel && notAFK && inGuildChannel ? "green" : user.presence.status === "online" ? "yellow" : "red") + "-circle"] +
					` [${name}]( https://discordapp.com/users/${user.id})`
			);
		});

		let suffix = ""; //((roomMap[message.channel.id]||'').toLowerCase()==queueTitle.toLowerCase())? '' : ' '+queueTitle.toLowerCase();
		//Send
		lastMessage = await message.channel.send({
			embed: {
				title: title,
				description: qDisplay.join("\n"),
				//footer: {
				//	text: `type \`!rsvp ${queueTitle.toLowerCase()}\` to be added to the queue!`,
				//	//icon_url: 'https://i.imgur.com/wSTFkRM.png',
				//},
				fields: [
					{
						//name: '\u200b',
						name: "Event starts @ 9pm EST",
						value: `Type \`!rsvp${suffix}\` to be added to the queue!`,
						inline: true,
					},
				],
			},
		});
		//save old message to delete leater
		//this.client.memory.set(message, lastMessageID, lastMessage);
	}
}

module.exports = CustomCommand;

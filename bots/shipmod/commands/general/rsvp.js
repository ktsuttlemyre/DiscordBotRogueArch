let debug = false;
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
				args: [
					 {
						id: 'arg',
						default: '',
						match: 'content',
					 },
					],
			channelRestriction: "guild",
		});
	}

	parseInput(message) {}

	async exec(message, {arg} ) {
		let isAdmin = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'admin');
		let isMod = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'mod');
		
		let client = this.client;
		let queueTitle = roomMap[message.channel.id] || message.channel.name;
		queueTitle = queueTitle.trim().toUpperCase();

		let user = message.member || message.author;
		
		let queue = new Collection();
		
		let randomEmoji = [];
		let title = `${queueTitle} Event Queue `;
		
		let messages = await message.channel.messages.fetch({ limit: 100 });
		debug && console.log('got messages',messages.size)
		let today = new Date().getTime();
		let forceGlob = false



		if((isAdmin || isMod) && arg){
			arg = arg.trim()
			if (arg == "glob"){ //TODO this currently only accepts one that was posted 16 hours ago. have it sort them and choose the most recent
				forceGlob=true;
			}else{
				let args = arg.split(' ');
				args[0]=args[0].toUpperCase();
				if(args[0] == 'ADD'){
					let mentions = await util.resolveMentions(message,arg);
					user = mentions['member'] || mentions['user'] || user;
				}else if (args[0] =='remove'){
					throw 'implement remove funciton'
				}
			}
		}


		let lastPost = messages.find(function(post){
			if(post.author.id != message.guild.me.id){ //make sure it is from me
				return
			}
			let embed = post.embeds && post.embeds.length && post.embeds[0];
			debug && console.log('post',embed,post.createdAt)
			if(embed && embed.title && embed.title.indexOf('Event Queue') >= 0){
				if(forceGlob){
					return true; //if glob command was given then force accept the first found message
				}
				debug && console.log('checking post date',post.createdAt)
				let date = post.createdAt.getTime();
				let diff = Math.abs(date - today);
				let diffInHours = diff/1000/60/60;
				if(diffInHours < 16 ){
					return true
				}
				return false;
			}
		});



		//good we found a message. Lets parse out the names
		if(lastPost){
			let lastEmbed = lastPost.embeds && lastPost.embeds.length && lastPost.embeds[0];
			debug && console.log('got lastEmbed',lastEmbed)
			let userIDs=[]
			lastEmbed.description.replace(/https:\/\/discordapp\.com\/users\/(\d*)/g,(element,userID) => {
			   userIDs.push(userID);
			});
			debug && console.log('got userIDs',userIDs)
			for(let i=0,l=userIDs.length;i<l;i++){
				let userID = userIDs[i]
				let users = await message.guild.members.fetch(userID, { cache: true });
				queue.set(userID,users)
			}
		}else{
			console.log('no last embed. Using empty rsvp queue')
		}
		debug && console.log('got queue',queue)
		
		
		
		let varName = queueTitle + "_queue";
		//let queue = this.client.memory.get(message, varName) || new Collection();
		//let lastMessageID = varName + "LastMessage";
		//let lastMessage = this.client.memory.get(message, lastMessageID);
		
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



		//Render
		let qDisplay = [];
		queue.each(function (user) {
			//let inGame = (message.author||message.member).voice.channel.members.
			let name = user.displayName || user.tag;
			let voiceChannel = user.voice && user.voice.channel;
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
		let response = await message.channel.send({
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
						name: "Event starts @ 10pm EST",
						value: `Type \`!rsvp${suffix}\` to be added to the queue!`,
						inline: true,
					},
				],
			},
		});
		
		lastPost && lastPost.delete();
		message.delete();
		//this.client.memory.set(message, varName, queue);
		
		//save old message to delete leater
		//this.client.memory.set(message, lastMessageID, lastMessage);
	}
}

module.exports = CustomCommand;

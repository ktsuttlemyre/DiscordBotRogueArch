const { Client, Collection } = require ('discord.js')
const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const common = require.main.require('./common');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');
const roomMap = require.main.require('./config').eventRoomMap;
const escapeMD = require('markdown-escape')

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
		description: { content: 'Manages event queue'},
		aliases: [commandVars.name,'eventq','eventqueue','eventadd', 'rsvp'],
		category: commandVars.category,
		clientPermissions: ['SEND_MESSAGES','MANAGE_MESSAGES'],
// 		args: [
// 			 {
// 			 	id: 'queue',
// 			 	default: '',
// 			 	match: 'content',
// 			 },
// 			],
		channelRestriction: 'guild', 
		});
	}

	async exec(message) {
		let queue = roomMap[message.channel.id] || message.channel.name;
		queue = queue.trim().toUpperCase();
		
		let randomEmoji = [];
		let title = `${queue} Event Queue `
		let varName = queue+'_queue';
		let q = this.client.memory.get(message, varName) || new Collection();
		let lastMessageID = varName+'LastMessage'
		let lastMessage = this.client.memory.get(message, lastMessageID);
		let user = message.member||message.author
		switch(queue){
			case 'AMONGUS':
				randomEmoji = ['<:AmongUsDeadOrange:800120891857829919>',
					       '<:AmongButton:800807792193306684>',
					       '<:among_us_report:800804847728853022>',
					       '<:amongusshhhhh:800119749056921640>'
					      ]
				title = '<:amongus:800119041452146731> AmongUs Event Queue '+_.sample(randomEmoji)
				break;
			default:
				
				//message.channel.send('No queue associated with '+queue);

		}
		if(!q.get(user)){
			q.set(user.id, user);
		}
		
		lastMessage && lastMessage.delete()
		message.delete();
		this.client.memory.set(message, varName, q);
		
		//Render
		let qDisplay = []
		q.each(function(user){
			//let inGame = (message.author||message.member).voice.channel.members.
			let name = user.displayName || user.tag;
			let voiceChannel = user.voice.channel;
			let notAFK=null;
			let inGuildChannel=null;
			if(voiceChannel){
				notAFK = message.guild.afkChannelID != voiceChannel.id
				inGuildChannel = voiceChannel.guild.id == message.guild.id
			}
			name = escapeMD(name);
			qDisplay.push("\t "+common.reactions[((voiceChannel && notAFK && inGuildChannel)?'green':(user.presence.status === 'online')?'yellow':'red')+'-circle']+` [${name}]( https://discordapp.com/users/${user.id})` )
		})
		
		
		let suffix = ((roomMap[message.channel.id]||'').toLowerCase()==queue.toLowerCase())? '' : queue.toLowerCase();
		//Send
		lastMessage = await message.channel.send({embed:{
					title:title,
					description:qDisplay.join('\n'),
					//footer: {
					//	text: `type \`!rsvp ${queue.toLowerCase()}\` to be added to the queue!`,
					//	//icon_url: 'https://i.imgur.com/wSTFkRM.png',
					//},
					fields: [
							{
								name: '\u200b',
								value: `type \`!rsvp ${suffix}\` to be added to the queue!`,
								inline: false,
							},
						]
					}
				});
		//save old message to delete leater
		this.client.memory.set(message, lastMessageID, lastMessage);
	}
}

module.exports = CustomCommand;


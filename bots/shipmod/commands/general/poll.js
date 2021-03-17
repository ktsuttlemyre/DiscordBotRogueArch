const { Client, Collection } = require ('discord.js')
const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const common = require.main.require('./common');
const _ = require('lodash');
const roomMap = require.main.require('./config').eventRoomMap;

class CustomCommand extends Command {
	constructor() {
		super(common.commandName(__filename), {
		description: { content: 'Creates a poll'},
		aliases: [common.commandName(__filename)],
		category: common.commandCategory(__filename),
		clientPermissions: ['SEND_MESSAGES','MANAGE_MESSAGES'],
		args: [
			 {
			 	id: 'anon',
			 	default: '',
			 	match: 'content',
			 },
			],
		channelRestriction: 'guild', 
		});
	}

	async exec(message, { anon }) {
		let id = message.id;
		let user = message.member||message.author
		
		let randomEmoji = [];
		let varName = user.id+'_poll';
		let pollObj = this.client.memory.getChannel(message, varName) || {};
		
		
		//new Collection()
		
// 		if(!q.get(user)){
// 			q.set(user.id, user);
// 		}
		if(pollObj.lastMessage){
			pollObj.lastMessage.delete();
		}
		message.delete && message.delete();
		this.client.memory.set(message, varName, pollObj);
		
		//Render
// 		let qDisplay = []
// 		q.each(function(user){
// 			//let inGame = (message.author||message.member).voice.channel.members.
// 			let name = user.displayName || user.tag;
// 			let voiceChannel = user.voice.channel;
// 			let notAFK=null;
// 			let inGuildChannel=null;
// 			if(voiceChannel){
// 				notAFK = message.guild.afkChannelID != voiceChannel.id
// 				inGuildChannel = voiceChannel.guild.id == message.guild.id
// 			}
// 			qDisplay.push("\t "+common.reactions[((voiceChannel && notAFK && inGuildChannel)?'green':(user.presence.status === 'online')?'yellow':'red')+'-circle']+` [${name}]( https://discordapp.com/users/${user.id})` )
// 		})
		
		let embed = {
			title:title,
			description:qDisplay.join('\n'),
			//footer: {
			//	text: `type \`!rsvp ${queue.toLowerCase()}\` to be added to the queue!`,
			//	//icon_url: 'https://i.imgur.com/wSTFkRM.png',
			//},
			fields: [
					{
						name: '\u200b',
						value: `React to this message to vote. Poll is ${(anon)} `,
						inline: false,
					},
				]
			}
		//Send
		lastMessage = await message.channel.send({embed:embed});
		//save old message to delete leater
		this.client.memory.set(message, lastMessageID, lastMessage);
	}
}

module.exports = CustomCommand;

const { Client, Collection } = require ('discord.js')
const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');


class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'Manages Amongus queue'},
		aliases: ['amongusq','amongusqueue','amongusadd'],
		category: path.basename(path.dirname(__filename)),
		clientPermissions: ['SEND_MESSAGES'],
//		args: [
// 			 {
// 			 	id: 'user',
// 			 	default: '',
// 			 	match: 'content',
// 			 },
// 			],
		channelRestriction: 'guild', 
		});
	}

	async exec(message) {
	    let amongEmojis=['<:AmongUsDeadOrange:800120891857829919>','<:AmongButton:800807792193306684>','<:among_us_report:800804847728853022>','<:amongusshhhhh:800119749056921640>']
	    let varName = 'amongusq'
	    let q = this.client.memory.get(message, varName) || new Collection();
	    let lastMessage = this.client.memory.get(message, 'lastAmongusQ');
	    let user = message.member||message.author
	   
	    
	    if(!q.get(user)){
	    	q.set(user.id, user);
	    }
	    if(lastMessage){
		    lastMessage.delete()
	    }
	    message.delete();
	    this.client.memory.set(message, varName, q);
		
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
	    	qDisplay.push("> "+common.reactions[((voiceChannel && notAFK && inGuildChannel)?'green':(user.presence.status === 'online')?'yellow':'red')+'-circle']+` (${name})[https://discord.com/channels/@me/${user.id}]` )
	    })
	    
	    lastMessage = await message.channel.send({embed:{
		    			title:'<:amongus:800119041452146731> AmongUs Queue '+_.sample(amongEmojis),
					description:qDisplay.join('\n'),
					footer: {
						text: 'type !amongusadd to be added to the queue!',
						//icon_url: 'https://i.imgur.com/wSTFkRM.png',
					},
	    			}});
	    this.client.memory.set(message, 'lastAmongusQ', lastMessage);
	}
}

module.exports = CustomCommand;


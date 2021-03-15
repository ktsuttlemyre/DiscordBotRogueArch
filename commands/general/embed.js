const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const web = require.main.require('./web');
const yaml = require('js-yaml');

class CustomCommand extends Command {
	constructor() {
		super(common.commandName(__filename), {
		description: { content: 'creates an announcement on your behaf'},
		aliases: [common.commandName(__filename)],
		category: common.commandCategory(__filename),
		clientPermissions: ['SEND_MESSAGES','MANAGE_MESSAGES'],
		args: [
			{
				id: 'input',
				default: '',
				match: 'content',
			},
			],
		channelRestriction: 'guild', 
		});
	}
	
// 	userPermissions(message) {
// 		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
// 			return 'Admin';
// 		}
// 		return null;
// 	}

	async exec(message,{ input }) {
	    let doc=null;
	    // Get document, or throw exception on error
	    try {
	      doc = yaml.load(input);
	    } catch (e) {
	      console.error(e);
	      message.channel.send(e.toString())
	    }
	    console.log(doc)
	    if(typeof doc == 'string'){
		    let split = input.split('\n');
		    doc = {};
		    doc.title = '> '+split.shift();
		    doc.description = split.join('\n')
		    
	    }
	    let user = message.member || message.author
	    let author = {
	      name: user.displayName || user.tag,
	      icon_url: message.author.avatarURL() || common.defaultAvatar,
	      url: ` https://discordapp.com/users/${user.id}`,
	    }
	    doc.author=author;
	    message.channel.send({embed:doc});
	}
}

module.exports = CustomCommand;

const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const _ = require('lodash');
const path = require('path');
const web = require.main.require('./web');
const yaml = require('js-yaml');

class CustomCommand extends Command {
	constructor() {
		super(path.parse(__filename).name, {
		description: { content: 'creates an announcement on your behaf'},
		//aliases: ['fetchall'],
		category: path.basename(path.dirname(__filename)),
		clientPermissions: ['SEND_MESSAGES','MANAGE_MESSAGES'],
		args: [
			{
				id: 'yaml',
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

	async exec(message,yaml) {
	    let doc=null;
	    // Get document, or throw exception on error
	    try {
	      doc = yaml.load(yaml);
	    } catch (e) {
	      message.channel.send(e.toString())
	    }
	    let user = message.member||message.author
	    let author = {
	      name: user.displayName || user.tag,
	      icon_url: user.avatarURL() || common.defaultAvatar,
	      url: ` https://discordapp.com/users/${user.id}`,
	    }
	    doc.author=author;
	    message.channel.send(doc);
	}
}

module.exports = CustomCommand;

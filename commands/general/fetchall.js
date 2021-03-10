const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
var _ = require('lodash');

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class PlayCommand extends Command {
	constructor() {
		super('fetchall', {
		description: { content: 'fetchall'},
		aliases: ['fetchall'],
		category: 'general',
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			// {
			// 	id: 'search',
			// 	default: '',
			// 	match: 'content',
			// },
			],
		channelRestriction: 'guild', 
		});
	}
	
	userPermissions(message) {
		if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
			return 'Admin';
		}
		return null;
	}

	async exec(message) {
    /*async function lots_of_messages_getter(channel, limit = 500) {
        const sum_messages = [];
        let last_id;

        while (true) {
            const options = { limit: 100 };
            if (last_id) {
                options.before = last_id;
            }

            const messages = await channel.fetchMessages(options);
            sum_messages.push(...messages.array());
            last_id = messages.last().id;

            if (messages.size != 100 || sum_messages >= limit) {
                break;
            }
        }

        return sum_messages;
    }
    lots_of_messages_getter(message.channel,Infinity);
    */
    
    async function getMessages(channel, limit) {
      if(!limit){
	limit=Infinity
      }
      let out= []
//       if (limit <= 100) {
//         let messages = await channel.messages.fetch({ limit: limit })
//         out.push.apply(out,messages.array())
//       } else {
        let rounds = (limit / 100) + (limit % 100 ? 1 : 0)
        let last_id = ""
        for (let x = 0; x < rounds; x++) {
          const options = {
            limit: 100
          }
          if (last_id.length > 0) {
            options.before = last_id
          }
          const messages = await channel.messages.fetch(options);
          const messageArray = messages.array();
          if(!messageArray.length){
		  break
	  }
	  out.push.apply(out,messageArray)
          //console.log('messages.length',messageArray.length)
	  last_id = messageArray[(messageArray.length - 1)].id
        }
      //}
      return out
    }
    let messages = await getMessages(message.channel);
    message.channel.send(`got ${messages.length} messages`);
    
    
    
    
    
	}
}

module.exports = PlayCommand;

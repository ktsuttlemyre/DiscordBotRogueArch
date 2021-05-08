const {Inhibitor} = require("discord-akairo");
const util = require.main.require('./util');
const commandVars = util.commandVars(__filename);
const common = require.main.require('./common')
const reactions = common.reactions

class CustomInhibitor extends Inhibitor {
	constructor() {
		super(commandVars.name, {
			reason: "command already claimed by other bot instance",
			type: "all",
		});
	}

	async exec(message) {
		let client = this.client;
    //https://stackoverflow.com/questions/59988625/discord-js-fetchmessage-reactions-get-cannot-get-users
    
//    let users = await message.reactions.cache.users.fetch()
//      // I'm not quite sure what you were trying to accomplish with the original lines
//   reaction.cache.map((item) => item.users.cache.array())
    
    
//     var reaction = message.reactions.get(reactions.shipwash)
//     reaction.fetchUsers();

//     for (const user of reaction.users.values()) {
//       const id = user.id;
//       if(id == client.user.id){
//         return true
//       }
// 		return false;
// 	}
	let users = util.messages.getReactedUsers(message,reactions.shipwash);
	console.log('got users for message/command about to be processed ',users)
		
	}
}

module.exports = CustomInhibitor;

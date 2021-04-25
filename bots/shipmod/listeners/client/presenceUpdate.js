//https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-presenceUpdate
/*
presenceUpdate
Emitted whenever a guild member's presence (e.g. status, activity) is changed.

PARAMETER	TYPE	DESCRIPTION
oldPresence	?Presence	
The presence before the update, if one at all

newPresence	Presence	
The presence after the update
*/

const { MessageEmbed } = require('discord.js');
const { Listener } = require('discord-akairo');
const config = require.main.require('./config');
const commandVars = require.main.require('./common').commandVars(__filename);
const util = require.main.require('./util');
const _ = require('lodash');

class CustomListener extends Listener {
	constructor() {
		super(commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}


	async exec( oldPresence, newPresence) {
		if(reaction.partial){ //ignore partials
			return
		}
    
    let member = newPresence.member || newPresence.user
    let user = newPresence.user
    let client = this.client;
   
    if(user.bot){ //ignore bots
      return
    }
    
		//var env = process.env.ENVIRONMENT
    //if(env != 'production'){ //only work on production
		//	return;
		//}
    
		/** Information gathering **/
		//make sure message is resolved
		let message = await util.messages.resolve(reaction.message);

		let name = member.displayName || member.username || member.tag;
		let userID = member.id || member.user.id;
    
    let presence = newPresence.activities.filter(x=>x.type === "PLAYING") //outputs the presence which the user is playing
    let game = presence[0].name // will give the name of the game 
    let roleName = `🎮${game}`
    
    //if the role doesn't exist make it
    let role = await message.guild.roles.create({
        data:{
          name: roleName,
          color: "DEFAULT",
          mentionable: true
        },
        reason:"Game Activity"
    })
    
    //if the user doesn't have the role then add it
    if (! member.roles.cache.some(role => role.name === roleName)) {
      member.roles.add(role)
    }
    
    //log
    
	}
}
module.exports = CustomListener;

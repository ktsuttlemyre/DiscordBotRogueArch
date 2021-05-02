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


	async exec( oldPresence, newPresence, manuallyTriggered) {
		if((oldPresence && oldPresence.partial) || newPresence.partial){ //ignore partials
			return
		}
    		
		let member = null
		try{
			member = newPresence.member 
		} catch {
			try{
				member = newPresence.user
			}catch{
				member = null
			}
		}
		if (!member){
			return
		}
		let user = newPresence.user
		let client = this.client;
		let guild = newPresence.guild;

		if(user.bot){ //ignore bots
		return
		}

		let env = process.env.ENVIRONMENT
		if(env != 'production'){ //only work on production
			return;
		}

		/** Information gathering **/
		let name = member.displayName || member.username || member.tag;
		let userID = member.id || member.user.id;

		let presence = newPresence.activities.filter(x=>x.type === "PLAYING") //outputs the presence which the user is playing
		if(!presence || !presence.length){return}
		let game = (presence[0] || presence).name // will give the name of the game 
		if(!game){return}
		let roleName = `🎮${game}`

		//if the role doesn't exist make it
		let role = guild.roles.cache.find(x => x.name === roleName);
		if (!role) {
			// Role doesn't exist, safe to create
			if(!guild.me.hasPermission("MANAGE_ROLES")){
				consol.log(`${guild.me.displayName} does not have permissions to create roles`)
				return
			}
			role = await guild.roles.create({
				data:{
					name: roleName,
					color: "DEFAULT",
					mentionable: true
				},
				reason:"Game Activity"
			})
		}

		//if the user doesn't have the role then add it
		if (! member.roles.cache.some(role => role.name === roleName)) {
			member.roles.add(role)
		}

		//log

	}
}
module.exports = CustomListener;

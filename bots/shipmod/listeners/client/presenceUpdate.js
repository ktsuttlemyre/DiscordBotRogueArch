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
const yaml = require("js-yaml");
const debug = true;
const {MessageEmbed} = require("discord.js");
const {Listener} = require("discord-akairo");
const config = require.main.require("./config");
const commandVars = require.main.require("./common").commandVars(__filename);
const util = require.main.require("./util");
const _ = require("lodash");

const filterApps = {
	'Google Chrome':1,
	'SteamVR':1,
	'Drawful 2':1
};

const gamingLogChannelID = "858459656058044426"

const routerMap = {
	"Fall Guys":/Fall Guys.*/i,
	"Resident Evil [Franchise]": /resident evil.*/i,
	"Jackbox Party Pack":/Jackbox Party Pack.*/i,
	"Grand Theft Auto [Franchise]":/Grand Theft Auto.*/i,
	"Age of Empires [Franchise]":/Age of Empires.*/i,
	"Tekken [Franchise]":/Tekken.*/i,
	"Far Cry [Franchise]":/Far Cry.*/i,
	"Halo [Franchise]":/Halo.*/i,
	"Arma [Franchise]":/Arma.*/i,
	"Star Wars [Franchise]":/Star Wars.*/i,
	"The Sims [Franchise]":/The Sims.*/i,
	"Football Manager [Franchise]":/Football Manager.*/i,
	"Assassin's Creed [Franchise]":/Assassin\'s Creed.*/i,
	"FINAL FANTASY [Franchise]":/FINAL FANTASY.*/i,
	"Mass Effect [Franchise]":/Mass Effect.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	//"Tekken [Franchise]":/Tekken.*/i,
	"Call of Duty [Franchise]": /Call of Duty.*/i
}
//"You don't know jack":/.*Jackbox Party Pack.*/i
const routerKeys = Object.keys(routerMap)

class CustomListener extends Listener {
	constructor() {
		super(commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec(oldPresence, newPresence, manuallyTriggered) {
		if ((oldPresence && oldPresence.partial) || newPresence.partial) {
			//ignore partials
			return;
		}

		let member = null;
		try {
			member = newPresence.member;
		} catch {
			try {
				member = newPresence.user;
			} catch {
				member = null;
			}
		}
		if (!member) {
			return;
		}
		let user = newPresence.user;
		let client = this.client;
		let guild = newPresence.guild;

		if (user.bot) {
			//ignore bots
			return;
		}

		let env = process.env.ENVIRONMENT;
		if (env != "production") {
			//only work on production
			return;
		}

		/** Information gathering **/
		let name = member.displayName || member.username || member.tag;
		let userID = member.id || member.user.id;

		let presence = newPresence.activities.filter((x) => x.type === "PLAYING"); //outputs the presence which the user is playing
		if (!presence || !presence.length) {
			return;
		}
		let game = (presence[0] || presence).name; // will give the name of the game
		if (!game) {
			return;
		}
		
		//remove tm and other weird characters because they don't work right as roles
		game = game.replace(/[^\w\s]/gi,'');
		
		//if it is a sequal or spin off of a franchise just get the franchise
		game = game.split(':')[0]
		
		if(!game){
			return
		}
		game = game.trim();
			
		
		//filter out non-games
		if(filterApps[game]){
		   return
		}
		//condense games together via pattern matching
		game = routerKeys.find(function(key){
			let pattern = routerMap[key]
			if(game.match(pattern)){
				return key
			}
		}) || game;
		
		
		let roleName = `🎮${game}`;
		
		let logChannel = guild.channels.resolve(config.actionLogChannel);


		//if the role doesn't exist make it
		let role = guild.roles.cache.find((x) => x.name === roleName);
		if (!role) {
			// Role doesn't exist, safe to create
			if (!guild.me.hasPermission("MANAGE_ROLES")) {
				console.log(`${guild.me.displayName} does not have permissions to create roles`);
				return;
			}
			
			
			role = await guild.roles.create({
				data: {
					name: roleName,
					color: "DEFAULT",
					mentionable: true,
				},
				reason: "Game Activity",
			});
			
			logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send(`Created role ${role}`)
		}

		//if the user doesn't have the role then add it
		if (!member.roles.cache.some((role) => role.name === roleName)) {
			member.roles.add(role);
			logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send(`Assigned role ${role} to ${member}`)
		}
		
		//look for last message and see if it was posted already today
		
		/*
		let messages = await message.channel.messages.fetch({ limit: 100 });
		debug && console.log('got messages',messages.size)
		let today = new Date().getTime();
		let lastPost = messages.find(function(post){
// 			//filter
			if(post.author.id != message.guild.me.id){ //make sure it is from me
				return
			}
// 			let embed = post.embeds && post.embeds.length && post.embeds[0];
// 			debug && console.log('post',embed,post.createdAt)
// 			if(embed && embed.title && embed.title.indexOf('Event Queue') >= 0){
				let date = post.createdAt.getTime();
// // 				let isSameDay = (date.getDate() === today.getDate() 
// // 					&& date.getMonth() === today.getMonth()
// // 					&& date.getFullYear() === today.getFullYear());
				let diff = Math.abs(date - today);
				let diffInHours = diff/1000/60/60;
				if(diffInHours < 16 ){
					return true
				}
// 				debug && console.log('checking post date',post.createdAt)
 				return false //isSameDay;
// 			}
		})
		//parse
		json = yaml.load(body);
		*/
		/*
		let channel = guild.channels.resolve(gamingLogChannelID);
		if(channel && channel.permissionsFor(guild.me).has("SEND_MESSAGES")){
		   let displayName = member.displayName
		   channel.send(`\`${displayName}\` is playing \`${game}\` `)
		}*/


	}
}
module.exports = CustomListener;

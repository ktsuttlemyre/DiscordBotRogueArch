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
const debug = false;
const {MessageEmbed} = require("discord.js");
const {Listener} = require("discord-akairo");
const config = require.main.require("./config");
const commandVars = require.main.require("./common").commandVars(__filename);
const util = require.main.require("./util");
const _ = require("lodash");
const Discord = require('discord.js');

const filterApps = {
	'Google Chrome':1,
	'SteamVR':1,
	'Drawful':1,
	'Screen Share doesnt play sound  Discord  Mozilla Firefox':1,
};

const gamingLogChannelID = "858459656058044426"
const gamingActvityLogID = "918297882854031411"

const routerMap = {
	"New World":/New World Open Beta/i,
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
	"Halflife 2 [Franchise]":/Halflife 2.*/i,
	"PUBG BATTLEGROUNDS":/PLAYERUNKNOWNS BATTLEGROUNDS.*/i,
	
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

let lock=false; //TODO THIS LOCK IS A GLOBAL ACROSS ALL GUILDS PLEASE EDIT THIS IN THE FUTURE! TO BE GUILD LOCAL

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
		let rawGameName;
		let game = rawGameName = (presence[0] || presence).name; // will give the name of the game
		if(!game){
			return
		}
		game = game.trim();
		
		//remove tm and other weird characters because they don't work right as roles
		game = game.replace(/[^\w\s]/gi,'');
		game = game.trim();
		
		//if it is a sequal or spin off of a franchise just get the franchise
		game = game.split(':')[0]
		game = game.trim();
		
		//if it is a sequential release remove the number from the end
		game=game.replace(/\s\d+$/, "")
		game = game.trim();
		if(!game){
			return
		}
		
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
		
		let gamePrefix="🎮"
		let gameRoleName = `${gamePrefix}${game}`;
		
		let logChannel = guild.channels.resolve(config.actionLogChannel);
		let activityLogChannel = guild.channels.resolve(gamingActvityLogID)

		let gameRole = guild.roles.cache.find((x) => x.name === gameRoleName);
		
		///save current game to memory
		let gameActivity = client.memory.get({guild:guild},'gameActivity')
		if(!gameActivity){
			gameActivity = {}
			client.memory.set({guild:guild},'gameActivity',gameActivity)
		}
		gameActivity[member.id]=rawGameName
		
		//can this bot manage roles?
		if (!guild.me.hasPermission("MANAGE_ROLES")) {
			console.log(`${guild.me.displayName} does not have permissions to create roles`);
			return
		}
		
		//if too many roles. Find the oldest one with the fewest members and delete
		if(!lock && guild.roles.cache.size >= 245){
			lock = true;
			let roles = guild.roles.cache.sorted(function(a, b) {          
				if (a.members.size === b.members.size) {
					// time is only important when members are the same
					return a.createdTimestamp - b.createdTimestamp;
				}
				return a.members.size-b.members.size;
			}); //sort lowest number of members and oldest date created

			let oldestGameRole = roles.find((x) => x.name.indexOf(gamePrefix)===0); //find a role with game prefix
			if(oldestGameRole && !oldestGameRole.deleted){
				let memberPopulation = oldestGameRole.members.size
				await oldestGameRole.delete().then(function(value,error){
					if(error){
						throw error
					}
					logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send("Removed old GameRole `"+oldestGameRole.name+"` with only "+ memberPopulation+ " members")
				});
				
			}
			lock = false;
		}
		
		
		if (!gameRole) { // Role doesn't exist, safe to create
			gameRole = await guild.roles.create({
				data: {
					name: gameRoleName,
					color: "DEFAULT",
					mentionable: true,
				},
				reason: "Game Activity",
			});

			logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send(`Created GameRole \`${gameRole.name}\``)
		}
		
		
		//now add the role to the user if they arent already a part
		if (!member.roles.cache.some((role) => role.name === gameRoleName)) {
			member.roles.add(gameRole);
			logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send(`Assigned GameRole \`${gameRole.name}\` to \`${member.displayName||member.tag}\``)
		}
		
		//todo make embed and use 3 horisontal fields
		//also check to see if previous messages are repeats for the day? hour or smething?
		//activityLogChannel && activityLogChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && activityLogChannel.send(`\`${member.displayName||member.tag}\` \t\t\tis playing\t\t\t \`${gameRole.name}\``)
		
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

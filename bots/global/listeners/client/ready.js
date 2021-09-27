let debug = false;
const Discord = require("discord.js");

const {Listener} = require("discord-akairo");
const {reactions, defaultAvatar} = require.main.require("./common");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);


const sortAlphaNum = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
let mapToArray = function(map){
	return Array.from(map, ([name, value]) => (value.displayName));
}

class CustomListener extends Listener {
	constructor() {
		super("global/" + commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}
	
	
	
	

	async exec() {
		let client = this.client;
		let statement = `${client.user.tag}, waking up to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`;
		console.log(statement);

		// Log that the bot is online.
		client.logger.info(statement, "ready");
		// Set the bot status

		client.user.setActivity(process.env.ACTIVITY || " @" + (client.user.username || client.user.tag) + " help to get started", {type: "LISTENING"});

		var env = process.env.ENVIRONMENT;
		if (env != "production") {
			return;
		}

		//trigger listeners
		/* devnote
		 * Loop through all guilds
		 * loop through all channels we have permission to in those guilds
		 * emit voice channel changes for voice-to-text channel linking
		 * check if there are any commands that were not executed
		 */
		client.guilds.cache.forEach(async function (guild) {
			//.get("690661623831986266"); // Getting the guild.
			console.log("checking guild", guild.name, guild.id);
			if (!guild.channels) {
				return;
			}
			let voiceChannels = guild.channels.cache.filter((c) => c.type == "voice").array();
			guild.members.cache.forEach(function (member) {
				if (member.user.bot) {
					return false;
				}
				//Emit voiceUpdate for each member and channel
				//console.log('user in voice, triggering voicestateupdate for ',member);
				voiceChannels.forEach(function (channel) {
					if (channel.id === guild.afkChannelID) {
						return;
					}
					for (const [voice, text] of Object.entries(config.voiceTextLinkMap)) {
						//oldVoiceState, newVoiceState, startupFlag
						client.emit("voiceStateUpdate", {channelID: voice}, member.voice, true); //true for manually triggered
					}
				}); //end voicechannels

				//oldPresence, newPresencem, startupFlag
				client.emit("presenceUpdate", null, member.user.presence, true); //true for manually triggered
			}); //end members

			//read all previous commands
			let textChannels = guild.channels.cache.filter((c) => c.type == "text").array();
			debug && console.log("checking old commands");
			let commandMessagesQueue = [];
			for (const channel of textChannels) {
				if (!channel.permissionsFor(guild.me).has("VIEW_CHANNEL")) {
					continue;
				}
				if (util.devChannelGate({channel})) {
					continue;
				}
				debug && console.log("testing", channel.name);

				let messages = await channel.messages.fetch(); //TODO make this use the util.messages.fetch function so it reads further into the history
				messages = Array.from(messages.values());
				for (const message of messages) {
					//stop once you find a message that this bot has sent
					debug && console.log("id check", guild.me.id, (message.member || message.author).id);
					if (guild.me.id == (message.member || message.author).id) {
						break; //end loop
					}
					if (message.author.bot) {
						continue;
					}
					let users = await util.messages.getReactedUsers(message, reactions.shipwash);
					if (!users.get(Guild.me.id)) {
						//console.log('processing this message v')
						commandMessagesQueue.push(message);
					}
					//console.log(message.id,message.content,'reacted with shipwash',users);
				} //end messages
			} //end textchannels

			console.log("sorting command messages queue");
			//sort
			commandMessagesQueue
				.sort(function (a, b) { //sort the commands by time
					return a.createdTimestamp - b.createdTimestamp;
				})
				.forEach(function (message) { //execute
					debug && console.log("executing message with command", message.content);
					client.commandHandler.handle(message);
				});

			// 			var memory=client.memory
			// 			if(!memory){return}
			// 			var player=memory.get({guild}, 'player');
			// 			if(!player){return}
			// 			var queues=memory.get({guild}, 'queues')||[];
			// 			queues.forEach(function(queue){
			// 				var message = queue.firstMessage
			// 				if(player.isPlaying(message)){
			// 				  common.nowPlaying(message,null,'I have crashed or gone to sleep!')
			// 				}

			let logChannel = guild.channels.resolve(config.actionLogChannel);
			let gameChannel = guild.channels.resolve(config.gameChannel);
			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
				logChannel.send(`${client.user.tag} woke up`);
			}
			
			let gamePrefix="🎮";
			if(client.user.tag =="ShipMod"){

				let gameRoles = guild.roles.cache.filter((x) => x.name.indexOf(gamePrefix)===0); //find a role with game prefix
				if(gameRoles){
					gameRoles = gameRoles.sorted(sortAlphaNum)
					
					
					let games = Array.from(gameRoles, ([name, value]) => ({ game:value.name, members:mapToArray(value.members) }));
				
					gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && gameChannel.send(gameRoles)
					//TODO print the games
				}
			}
			
		}); //end guilds
		


		console.log(`ready rutine is complete for ${client.user.tag}`);
	} //end exec
}


module.exports = CustomListener;

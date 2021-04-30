const {Client, Collection} = require("discord.js");
const TOKEN = process.env.TOKEN_SHIPMOD;
const util = require.main.require("./util");

const client = new Client({
	//disableMentions: "everyone",
	//restTimeOffset: 0
});

client.login(TOKEN);

/**
 * Client Events
 */
client.on("ready", () => {
	//console.log(`${client.user.username} ready!`);
	//client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
	wakeHandler(client);
	//client.destroy();
});
client.on("warn", (info) => {
	console.log(info);
});
client.on("error", (e) => {
	console.error(e);
	process.exit(1);
});

let pinging = false;

//wake handler
function wakeHandler(client) {
	const Guild = client.guilds.cache.some(function (Guild) {
		//.get("690661623831986266"); // Getting the guild.
		//   const owners = process.env.OWNERS.split(','); // Getting shipwash
		//   for(var i=0,l=owners.length;i<l;i++){
		//     //check user activity status
		//     var member=Guild.members.cache.get(owners[i]);
		//     if(member.presence.status == 'online'){
		//       util.wakeupPing(member.displayName+' is online',true);
		//       return true
		//     }
		//   }

		//iterate members
		//Guild.members.cache.some(function(member){
		//})

		//iterate voice channels
		let voiceChannels = Guild.channels.cache.filter((c) => c.type == "voice").array();
		var stayAwake = voiceChannels.some(function (channel) {
			if (channel.id === Guild.afkChannelID) {
				return false;
			}
			return channel.members.some(function (member) {
				if (member.user.bot) {
					return false;
				}
				// The member is connected to a voice channel.
				// https://discord.js.org/#/docs/main/stable/class/VoiceState
				pinging = true;
				util.wakeupPing(member.displayName + " is in " + member.voice.channel.name + " voice channel", true);
				return true;
			});
		}); //end some
		if (stayAwake) {
			return true;
		}

		//see if theres a message in a text channel that is less than 30 minutes old
		var ttlm = 20;
		var ttl = ttlm * 60 * 1000;
		let textChannels = Guild.channels.cache.filter((c) => c.type == "text").array();

		var promises = [];
		for (let channel of textChannels) {
			if (!channel.permissionsFor(Guild.me).has("VIEW_CHANNEL")) {
				continue;
			}
			var p = channel.messages
				.fetch()
				.then(function (messages) {
					messages.forEach(function (message) {
						if (message.author.bot) {
							return;
						}
						if (Date.now() - message.createdAt < ttl) {
							//is user active in the last 30 minutes?
							pinging = true;
							util.wakeupPing(
								"Last message to guild was <" + ttlm + " minutes in channel[" + channel.name + "] from user[" + message.author.username + "]",
								true
							);
						}
					});
				})
				.catch(console.error);
			promises.push(p);
		} //test

		Promise.all(promises).then((values) => {
			//console.log('Checked all available channels.')
			if (!pinging) {
				process.exit(0);
			}
		});
	});
}

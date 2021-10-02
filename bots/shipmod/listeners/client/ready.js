let debug = true;
const Discord = require("discord.js");

const {Listener} = require("discord-akairo");
const {reactions, defaultAvatar} = require.main.require("./common");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);
const YAML = require('js-yaml');


const TwitchApi = require("node-twitch").default;
const twitch = new TwitchApi({
	client_id: process.env.twitchID,
	client_secret: process.env.twitchSecret
});

const liveEmoji = {
	on:'🔴',
	off:'⏺️'
}
const isEmoji = function(str){
	return   /\p{Extended_Pictographic}/u.test(str)
}

const sortAlphaNum = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
let mapToArray = function(map){
	return Array.from(map, ([name, value]) => (value.displayName));
}

class CustomListener extends Listener {
	constructor() {
		super("shipmod/" + commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}
	
	

	async exec() {
		let client = this.client;

		var env = process.env.ENVIRONMENT;
		if (env != "production") {
			return;
		}
		
		//start cron tasks
		setInterval(function(){
			console.log('checking live status')
			//twitch api response if there is a user match and they are live			
			//{
			//   "data": [
			//     {
			//       "id": "43910445405",
			//       "user_id": "37402112",
			//       "user_login": "shroud",
			//       "user_name": "shroud",
			//       "game_id": "493597",
			//       "game_name": "New World",
			//       "type": "live",
			//       "title": "GRIND DROPS . | @shroud FOLLOW ME!!",
			//       "viewer_count": 82826,
			//       "started_at": "2021-10-01T18:45:17Z",
			//       "language": "en",
			//       "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud-{width}x{height}.jpg",
			//       "tag_ids": [
			//         "6ea6bca4-4712-4ab9-a906-e3336a9d8039",
			//         "c2542d6d-cd10-4532-919b-3d19f30a768b"
			//       ],
			//       "is_mature": false
			//     }
			//   ],
			//   "pagination": {}
			// }
			
			let guild = client.guilds.cache.get('690661623831986266');
			let streamChannels = [guild.channels.cache.get('851980759203315732')];
			
			async function getStream(){
			  const streams = await twitch.getStreams({ channel: "shipwash" });
				debug && console.log(JSON.stringify(streams,null,2))
				streamChannels.forEach(function(streamChannel){

					let name = streamChannel.name
					let live = streams && streams.data && streams.data.length && streams.data[0].type=='live'

					debug && console.log('updating '+name)
					if(!streamChannel.permissionsFor(guild.me).has("MANAGE_CHANNELS")){
						console.log('do not have permission to edit name of channel '+name)
					}
					if(name.indexOf(liveEmoji.off)==0 || name.indexOf(liveEmoji.on)==0){
						name = name.substring(1);
					}
					
					if(live){
						name = liveEmoji.on+name
					}else{
						//isEmoji(name.substring(0,1))
						name = liveEmoji.off+name; 
					}

					if(name != streamChannel.name){
						console.log('live status has changed to '+(live)?'live':'offline')
						streamChannel.setName(name);
					}
				})
           		 }

			getStream();
		},60000)
		
		
		
		


// 		//trigger listeners
// 		/* devnote
// 		 * Loop through all guilds
// 		 * loop through all channels we have permission to in those guilds
// 		 * emit voice channel changes for voice-to-text channel linking
// 		 * check if there are any commands that were not executed
// 		 */
// 		client.guilds.cache.forEach(async function (guild) {
// 			//.get("690661623831986266"); // Getting the guild.
// 			console.log("Custom Ready rutine running for ",client.user.tag," checking guild ", guild.name, guild.id);

// 			let logChannel = guild.channels.resolve(config.actionLogChannel);
// 			let gameChannel = guild.channels.resolve(config.gameChannel);
// 			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
// 				logChannel.send(`${client.user.tag} woke up`);
// 			}
			
// 			let gamePrefix="🎮";

// 			let gameRoles = guild.roles.cache.filter((x) => x.name.indexOf(gamePrefix)===0); //find a role with game prefix
// 			console.log('gameRoles found =',gameRoles.size)
// 			if(gameRoles.size){
// 				gameRoles = gameRoles.sorted(sortAlphaNum)


// 				let games = Array.from(gameRoles, ([name, value]) => ({ game:value.name, members:mapToArray(value.members) }));
// 				//let json = JSON.stringify(games,null,2)
// 				let data = YAML.dump(games,{noArrayIndent :true,flowLevel:1,sortKeys:true,forceQuotes:true,quotingType:'"'}) //https://www.npmjs.com/package/js-yaml
// 				console.log(data)
// 				data=data.replace(/\-\s\{\"game\":\s/g,"```").replace(/,\s\"members\":\s\[/g,'\n Players: ').replace(/\]\}/g,'```') .replace(/"/g,'')

// 				if(gameChannel && gameChannel.permissionsFor(guild.me).has("SEND_MESSAGES")){
// 					Discord.Util.splitMessage(data,{maxLength:1900}).forEach(function(mess){
// 						gameChannel.send(mess);
// 					})
// 				}
				
// 			}
			
			
// 		}); //end guilds
		


// 		console.log(`Custom Ready rutine is complete for ${client.user.tag}`);
	} //end exec
}


module.exports = CustomListener;

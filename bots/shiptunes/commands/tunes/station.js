const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const emotes = {error: ":error:"};
const {reactions, defaultAvatar} = require.main.require("./common");
const common = require.main.require("./common");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const path = require("path");

const embedCommand = require.main.require("./bots/shipmod/commands/general/embed");
class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "set background playlist"},
			aliases: [
				commandVars.name,
				"backgroundplaylist",
				"background",
				"setbackground",
				"setbackgroundplaylist",
				"setradio",
				"setstation",
				"radio",
				"radiostation",
			],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					id: "subreddit",
					default: "",
					match: "content",
				},
			],
			channelRestriction: "guild",
		});
	}

	userPermissions(message) {
		return util.player.commandPermissions(message, true);
	}

	async exec(message, {subreddit}) {
		// 		var player = this.client.memory.get(message, 'player');
		// 		if(!player){
		// 			return this.handler.emit('commandBlocked',message,this,'No player playing to act on');
		// 		}

		// 		//ensure playing
		// 		var queue = player.getQueue(message);
		// 		if(queue && (queue.paused || queue.stopped)){
		// 			if(player.resume(message)){
		// 				await GUIMessages.nowPlaying(message,player,"Continuing where we left off "+common.randomMusicEmoji());
		// 			}else{
		// 				await GUIMessages.nowPlaying(message,player,"Error resuming queue");
		// 			}
		// 		}
		// 		let track = player.nowPlaying(message);

		let fetcher = util.playlists.fetchShift(subreddit);
		message.client.memory.channelSet(message, "backgroundPlaylistFetcher", fetcher);
		//		this.handler.emit('commandBlocked', message, this, 'Sending skip command to player failed');
	}
}

module.exports = CustomCommand;

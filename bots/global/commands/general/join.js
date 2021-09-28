const {Command} = require("discord-akairo");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "join a voice chat"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				// {
				// 	id: 'search',
				// 	default: '',
				// 	match: 'content',
				// },
			],
			channelRestriction: "guild",
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === config.systemRoles.admin)) {
			return "Admin";
		}
		return null;
	}

	async exec(message) {
		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		// 		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		// 		var player = this.client.memory.get(message.guild, 'player')
		// 		if(!player){
		// 			return message.channel.send('No player playing to act on')
		// 		}

		// 		var track = player.nowPlaying(message);
		// 		if(track){
		// 			await GUIMessages.nowPlaying(message,player,'Skipped: '+track.title)
		// 		}else{
		// 			await GUIMessages.nowPlaying(message,player,'Skipped: last track');
		// 		}
		// 		player.skip(message);
		// process.exit(0);
		let connection = await message.member.voice.channel.join();
		message.guild.me.voice.setSelfMute(false);
		message.guild.me.voice.setSelfDeaf(false);

		connection.voice.setSelfMute(false);
		connection.voice.setSelfDeaf(false);

		connection.voice.setMute(false);
		connection.voice.setDeaf(false);

		message.guild.me.voice.setMute(false);
		message.guild.me.voice.setDeaf(false);
	}
}

module.exports = CustomCommand;

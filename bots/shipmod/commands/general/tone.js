const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const emotes = {error: ":error:"};
const {reactions, defaultAvatar} = require.main.require("./common");
const common = require.main.require("./common");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const config = require.main.require("./config");
const map = config.voiceJoinLeave.tones.custom;
const Tone = require("tone");
const AudioContext = require("web-audio-engine").StreamAudioContext;
const context = new AudioContext();

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "clip"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					id: "arg",
					default: "",
					match: "content",
				},
			],
			channelRestriction: "guild",
		});
	}

	// 	userPermissions(message) {
	// 		if (!message.member.roles.cache.some(role => role.name === 'DJ')) {
	// 			return 'DJ';
	// 		}
	// 		return null;
	// 	}

	async exec(message, {arg}) {
		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		// 		var player = this.client.memory.get(message, 'player')
		// 		if(!player){
		// 			return message.channel.send('No player playing to act on')
		// 		}

		Tone.setContext(context);

		//create a synth and connect it to the main output (your speakers)
		const synth = new Tone.Synth(); //.toDestination();

		// Set the output for audio streaming
		context.pipe(process.stdout);

		// If you want to playback sound directly in this process, you can use 'node-speaker'.
		// const Speaker = require("speaker");
		// context.pipe(new Speaker());

		// Start to render audio
		context.resume();

		// composeWith(context);

		let dispatcher;
		try {
			var connection = await message.member.voice.channel();
			dispatcher = connection.play(context);
			dispatcher
				.on("start", () => {
					//channel.leave();
					console.log("context set");
				})
				.on("finish", () => {
					console.log("context disconnected from discord");
					//channel.leave();
				})
				.on("error", (err) => {
					console.log("context disconnected from discord due to error");
					console.error(err);
					//error(err)
					//channel.leave();
				});
		} catch (err) {
			console.log("context didnt connect to discord due to error");
			console.error(err);
			//error(err)
			return err;
		}

		//play a middle 'C' for the duration of an 8th note
		synth.triggerAttackRelease("C4", "8n");

		//  	 	    const { channel } = message.member.voice;
		// 		    console.log('arg',arg)
		// 		    arg = (arg||'').match(/(\<\@\!)?(\d+)(>)?/)[2]||arg;
		// 		    console.log('arg after match',arg);
		// 		    arg = map[arg]||arg;
		// 	            console.log('arg after map',arg)
		// 		    arg = (arg || '').trim() || null
		// 		    await uti.playClip(message,arg)
	}
}

module.exports = CustomCommand;

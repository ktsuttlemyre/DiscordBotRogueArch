const moment = require("moment");
const {MessageEmbed} = require("discord.js");
const util = require.main.require("./util");
/* 
		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setTitle('About Discord Akairo Boilerplate')
			.addField('Creator', [
				'**Discord**: Snipey#0001',
				'**Twitter**: https://twitter.com/snipeydev',
				'**Patreon**: https://patreon.com/snipeydev',
				'**Github**: https://github.com/snipey',
			], true);

		return message.channel.send(embed);
    */
const common = require.main.require("./common");

var cache = {};

const presentTitle = (exports.presentTitle = function (string) {
	string = string || "";
	// replace (official music video) || (official video)
	var after = string.replace(/[\[\(]\W*(official)?\W*(music)?\W*(video|audio)\W*(version)?\W*[\)\]]/i, "");
	string = string.length != after.length ? after + " 🌟" : after;
	// replace (lyrics)
	after = string.replace(/[\[\(]\W*(with)?\W*lyrics\W*[\)\]]/i, "");
	string = string.length != after.length ? after + " 💬" : after;

	return string;
});

exports.nowPlaying = async (message, player, announce) => {
	return await nowPlayingOverloaded(message, player, announce);
};

var nowPlayingPageinated = function (message, player, announce) {
	const Pagination = require("discord-paginationembed");

	const FieldsEmbed = new Pagination.FieldsEmbed()
		.setArray([{name: "John Doe"}, {name: "Jane Doe"}])
		.setAuthorizedUsers([message.author.id])
		.setChannel(message.channel)
		.setElementsPerPage(1)
		// Initial page on deploy
		.setPage(2)
		.setPageIndicator(true)
		.formatField("Name", (i) => i.name)
		// Deletes the embed upon awaiting timeout
		.setDeleteOnTimeout(true)
		// Disable built-in navigation emojis, in this case: 🗑 (Delete Embed)
		.setDisabledNavigationEmojis(["delete"])
		// Set your own customised emojis
		.setFunctionEmojis({
			"🔄": (user, instance) => {
				const field = instance.embed.fields[0];

				if (field.name === "Name") field.name = user.tag;
				else field.name = "Name";
			},
		})
		// Similar to setFunctionEmojis() but this one takes only one emoji
		.addFunctionEmoji("🅱", (_, instance) => {
			const field = instance.embed.fields[0];

			if (field.name.includes("🅱")) field.name = "Name";
			else field.name = "Na🅱e";
		})
		// Sets whether function emojis should be deployed after navigation emojis
		.setEmojisFunctionAfterNavigation(false);

	FieldsEmbed.embed.setColor(0xff00ae).setDescription("Test Description");

	return FieldsEmbed.build();
};

var nowPlayingOverloaded = async (message, player, announce) => {
	cache[message.guild.id] = cache[message.guild.id] || {};
	let lastNowPlayingMessage = cache[message.guild.id].lastNowPlayingMessage;
	if (lastNowPlayingMessage && !lastNowPlayingMessage.deleted) {
		await lastNowPlayingMessage.delete();
	}

	let announceObj = {};
	if (typeof announce == "object") {
		announceObj = announce;
		announce = announce.text || announce.string;
		announceObj.description = announceObj.description.length >= 2048 ? `${announceObj.description.substr(0, 2045)}...` : undefined;
	}

	announce = announce || cache[message.guild.id].announce;
	cache[message.guild.id].announce = announce;

	let track = player.nowPlaying(message);
	let match = (player.createProgressBar(message, {queue: true, timecodes: true}) || "").match(/(\d|:)+/g);
	let duration = moment.duration("00:00:00");
	if (match && match.length == 2) {
		duration = moment.duration(match[1]).subtract(moment.duration(match[0]));
	}

	var queue = track.queue;
	if (!queue) {
		queue = {
			stopped: true,
			paused: true,
			repeatMode: false,
			loopMode: false,
			volume: 0,
			tracks: [],
		};
	}

	let stateButton = queue.stopped ? ":stop_button:" : queue.paused ? ":pause_button:" : ":arrow_forward:";
	let stateString =
		(!queue.repeatMode ? ":blue_square:" : ":repeat:") +
		" Repeat " +
		(!queue.loopMode ? ":blue_square:" : ":infinity:") +
		" Loop " +
		(!queue.loopMode ? ":blue_square:" : ":twisted_rightwards_arrows:") +
		" Shuffle ";

	// 	var volumeLevel=':mute:';
	// 	if(queue.volume){
	// 		if(queue.volume<=30){
	// 			volumeLevel=':speaker:';
	// 		}else if(queue.volume<=80){
	// 			volumeLevel=':sound:';
	// 		}else{
	// 			volumeLevel=':loud_sound:'
	// 		}
	// 	}

	let volumeLevel = common.progressString("vertical-bar", queue.volume);
	let progressBar = (player.createProgressBar(message, {queue: false, timecodes: true}) || "")
		.replace("▬", "")
		.replace("🔘", stateButton)
		.replace("┃ ", "|")
		.replace(" ┃", "|");

	let trackDiscordMessage = await util.messages.retrieveTrackMessage(message, track);
	let permalink = trackDiscordMessage ? trackDiscordMessage.permalink : "";
	announce = announce != null ? "```" + announce + "```" : "‎";
	let jumpToQueue = `[🡅](${permalink})`; //⮝🠉🠝🡅🡹🢁⏫

	let nextTrack = queue.tracks[1];
	let nextSong = nextTrack ? `[${nextTrack.title}](${nextTrack.url})\n*Requested by:*` : "Add more songs!";

	let title = presentTitle(track.title);
	title = title ? `> ${title}` : "Shiptunes";

	let embedJSON = {
		title: title,
		//"description": `Author:${track.author}\n${track.description}`,
		//"description": `[${track.title}](${track.url})`,
		//"description": progressBar +` [⏫](${permalink})`,
		description: announceObj.description,
		url: track.url,
		color: 5814783,
		fields: [
			{
				name: "‎",
				value: `${progressBar} ${volumeLevel} ${jumpToQueue}`,
				inline: false,
			},
			// 		{
			// 		  "name": "‎",
			// 		  "value": stateButton+player.createProgressBar(message,{queue:false,timecodes:true}),
			// 		  "inline": false
			// 		},
			// 		//{
			// 		//  "name": "Next song:",
			// 		//  "value": '>>> '+(queue.tracks[1])?`[${queue.tracks[1].title}](${queue.tracks[1].url})`:'Add more songs!',
			// 		//  "inline": false
			// 		//},
			// 		{
			// 		  "name": "Player:",
			// 		  "value": stateString,
			// 		  "inline": true
			// 		},
			// 		{
			// 		  "name": "‎",
			// 		  "value": ((!queue.loopMode)?':bell:':':bell:')+'Attention '+volumeLevel+' '+((queue.volume>=100)?':100:':queue.volume),
			// 		  "inline": true
			// 		},

			// 		{ //queue length
			// 		  "name": `Queue:`,
			// 		  "value": stateButton+player.createProgressBar(message,{queue:true,timecodes:false}).replace('▬', '').replace('▬', ''),
			// 		  "inline": true
			// 		},

			// 		{
			// 		  "name": "‎",
			// 		  "value": 'Remaining\n'+moment.utc(duration).format("HH:mm:ss"),
			// 		  "inline": true
			// 		},
			// 		{
			// 		  "name": "‎",
			// 		  "value": 'Tracks\n'+`${queue.tracks.length}`,
			// 		  "inline": true
			// 		},
			// 		{
			//  		  "name": "‎",
			//  		  "value": " progressBar +` [⏫](${permalink})`",
			//  		  "inline": true
			// 		},
			// 		{
			//  		  "name": "‎",
			//  		  "value": "‎",
			//  		  "inline": true
			// 		},
			{
				name: "‎",
				value: announce,
				inline: false,
			},
			{
				name: "‎",
				value: `*Next Song:*\n> ${nextSong}`,
				inline: false,
			},
		],
		//"image":{
		//    url:track.requestedBy.displayAvatarURL({size:32})||common.defaultAvatar
		//},
		thumbnail: {
			url: track.thumbnail || common.defaultAvatar,
		},
		//image: {
		//  url: ${track.thumbnail||common.defaultAvatar,
		//},
	};

	if (!player.backgroundPlaylist && track.requestedBy) {
		//let urlTag=(track.requestedBy.tag||'').replace('#','')||
		let name = encodeURIComponent(track.requestedBy.displayName || track.requestedBy.tag);
		let URI = encodeURI(`https://shiptunes.shipwa.sh/${track.requestedBy.id}`);

		if (name) {
			URI = encodeURI(`https://shiptunes.shipwa.sh/${track.requestedBy.id}#?name=${name}`);
		}
		embedJSON.author = {
			name: `${track.requestedBy.username} is playing`,
			url: URI,
			icon_url: track.requestedBy.avatarURL() || common.defaultAvatar,
		};
	}

	if (nextTrack) {
		//let nextTrackDiscordMessage = await retrieveTrackMessage(message,nextTrack);
		//let nextSongURL=(nextTrack)?(nextTrackDiscordMessage.permalink||nextTrack.url):'';

		embedJSON.footer = {
			text: `${nextTrack.requestedBy.username}`,
			icon_url: nextTrack.requestedBy.avatarURL() || common.defaultAvatar, //"https://shipwa.sh/img/logo/shipwash_avatar.png"
		};
	}

	cache[message.guild.id].lastNowPlayingMessage = await message.channel.send({
		embed: embedJSON,
	});
};

var nowPlayingSegments = function (message, track, player) {
	var match = (player.createProgressBar(message, {queue: true, timecodes: true}) || "").match(/(\d|:)+/g);
	var duration = moment.duration("00:00:00");
	if (match && match.length == 2) {
		duration = moment.duration(match[1]).subtract(moment.duration(match[0]));
	}
	var stateButton = track.queue.stopped ? ":stop_button:" : track.queue.paused ? ":pause_button:" : ":arrow_forward:";
	var stateString =
		(!track.queue.repeatMode ? ":blue_square:" : ":repeat:") +
		" Repeat " +
		(!track.queue.loopMode ? ":blue_square:" : ":infinity:") +
		" Loop " +
		(!track.queue.loopMode ? ":blue_square:" : ":twisted_rightwards_arrows:") +
		" Shuffle ";
	var volumeLevel = ":mute:";
	if (track.queue.volume) {
		if (track.queue.volume <= 30) {
			volumeLevel = ":speaker:";
		} else if (track.queue.volume <= 80) {
			volumeLevel = ":sound:";
		} else {
			volumeLevel = ":loud_sound:";
		}
	}
	var embeds = [];

	var nowPlaying = {
		title: `${track.title}`,
		//"description": `Author:${track.author}\n${track.description}`,
		//"description": `[${track.title}](${track.url})`,
		description: "‎",
		url: `${track.url}`,
		color: 5814783,
		footer: {
			text: track.requestedBy.username + " requested current song",
			icon_url: track.requestedBy.avatarURL(), //"https://shipwa.sh/img/logo/shipwash_avatar.png"
		},
		// 	      "thumbnail": {
		// 		"url": `${track.thumbnail}`
		// 	      }
		image: {
			url: `${track.thumbnail}`,
		},
	};
	embeds.push(nowPlaying);

	if (track.queue.tracks[1]) {
		var nextPlaying = {
			title: "Next Song:",
			description: `>>> [${track.queue.tracks[1].title}](${track.queue.tracks[1].url})`,
			color: 5814783,
			footer: {
				text: track.queue.tracks[1].requestedBy.username + " requested current song",
				icon_url: track.queue.tracks[1].requestedBy.avatarURL(), //"https://shipwa.sh/img/logo/shipwash_avatar.png"
			},
			thumbnail: {
				url: `${track.queue.tracks[1].thumbnail}`,
			},
			//image: {
			//  url: `${track.thumbnail}`,
			//},
		};
		embeds.push(nextPlaying);
	}

	var playerState = {
		title: "Player",
		description: "‎",
		//"url": `${track.url}`,
		color: 5814783,
		fields: [
			//{
			//  "name": "Next song:",
			//  "value": '>>> '+(track.queue.tracks[1])?`[${track.queue.tracks[1].title}](${track.queue.tracks[1].url})`:'Add more songs!',
			//  "inline": false
			//},
			{
				name: "Player:",
				value: stateString,
				inline: true,
			},
			{
				name: "‎",
				value:
					(!track.queue.loopMode ? ":bell:" : ":bell:") + "Attention " + volumeLevel + " " + (track.queue.volume >= 100 ? ":100:" : track.queue.volume),
				inline: true,
			},
			{
				name: `Queue:`,
				value: stateButton + player.createProgressBar(message, {queue: true, timecodes: false}),
				inline: false,
			},
			{
				name: "‎",
				value: "Remaining\n" + moment.utc(duration).format("HH:mm:ss"),
				inline: true,
			},
			{
				name: "‎",
				value: "Tracks\n" + `${track.queue.tracks.length}`,
				inline: true,
			},
		],
		// 	      "footer": {
		// 		"text": track.requestedBy.username+' requested current song',
		// 		"icon_url":  track.requestedBy.avatarURL() //"https://shipwa.sh/img/logo/shipwash_avatar.png"
		// 	      },
		// 	      "thumbnail": {
		// 		"url": `${track.thumbnail}`
		// 	      }
		//image: {
		//  url: `${track.thumbnail}`,
		//},
	};
	embeds.push(playerState);
	message.channel.send({embeds: embeds});
};

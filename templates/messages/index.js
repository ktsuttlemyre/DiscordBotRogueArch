const moment = require("moment");
const { MessageEmbed } = require('discord.js');
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
const common = require.main.require('./common');

var cache={}
exports.NowPlayingOverloaded=function(message,player,announce){
    
    var track=player.nowPlaying(message);
    var match = (player.createProgressBar(message,{queue:true,timecodes:true})||'').match(/(\d|:)+/g);
	var duration=moment.duration('00:00:00');
	if(match && match.length==2){
		duration = moment.duration(match[1]).subtract(moment.duration(match[0]));
	}
	var stateButton=((track.queue.stopped)?':stop_button:':((track.queue.paused)?':pause_button:':':arrow_forward:'));
	var stateString=((!track.queue.repeatMode)?':blue_square:':':repeat:')+' Repeat '+
			((!track.queue.loopMode)?':blue_square:':':infinity:')+' Loop '+
			((!track.queue.loopMode)?':blue_square:':':twisted_rightwards_arrows:')+' Shuffle ';
	var volumeLevel=':mute:';
	if(track.queue.volume){
		if(track.queue.volume<=30){
			volumeLevel=':speaker:';
		}else if(track.queue.volume<=80){
			volumeLevel=':sound:';
		}else{
			volumeLevel=':loud_sound:'
		}
	}

        var nextSongURL=(track.queue.tracks[1])?(track.queue.tracks[1].messageLink||track.queue.tracks[1].url):'';
	announce=(announce!=null)?"\n```"+announce+"```":'‎';
	var embedJSON={
	      "title": `> ${track.title}`,
	      //"description": `Author:${track.author}\n${track.description}`,
	      //"description": `[${track.title}](${track.url})`,
	      "description": `[queue](${track.messageLink})\n`+announce,
	      "url": track.url,
	      "color": 5814783,
	      "author": {
	        "name": track.requestedBy.username+' is playing',
	        "url": 'https://shiptunes.shipwa.sh/'+track.requested.id,
	        "icon_url": track.requestedBy.avatarURL()||common.defaultAvatar
	      },
	      "fields": [
// 		//{
// 		//  "name": "Next song:",
// 		//  "value": '>>> '+(track.queue.tracks[1])?`[${track.queue.tracks[1].title}](${track.queue.tracks[1].url})`:'Add more songs!',
// 		//  "inline": false
// 		//},
// 		{
// 		  "name": "Player:",
// 		  "value": stateString,
// 		  "inline": true
// 		},
// 		{
// 		  "name": "‎",
// 		  "value": ((!track.queue.loopMode)?':bell:':':bell:')+'Attention '+volumeLevel+' '+((track.queue.volume>=100)?':100:':track.queue.volume),
// 		  "inline": true
// 		},
// 		{
// 		  "name": "‎",
// 		  "value": "‎",
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
// 		  "value": 'Tracks\n'+`${track.queue.tracks.length}`,
// 		  "inline": true
// 		},
		{
 		  "name": "‎",
 		  "value": stateButton+player.createProgressBar(message,{queue:false,timecodes:true}),
 		  "inline": false
			
		},
		{
		  "name": "‎",
		  "value": '*Next Song:*\n> '+((track.queue.tracks[1])?`[${track.queue.tracks[1].title}](${track.queue.tracks[1].url})\n*Requested by:*`:'Add more songs!'),
		  "inline": false
		}
	      ],
	      "thumbnail": {
		"url": `${track.thumbnail}`
	      }
		//image: {
		//  url: `${track.thumbnail}`,
		//},
	}
	
	if(track.queue.tracks[1]){
		track=track.queue.tracks[1];
		embedJSON.footer= {
			"text": track.requestedBy.username,
			"icon_url":  track.requestedBy.avatarURL()||common.defaultAvatar //"https://shipwa.sh/img/logo/shipwash_avatar.png"
	      	};
	}
	
	cache[message.guild.id]=cache[message.guild.id]||{};
	if(cache[message.guild.id].lastNowPlayingMessage){
		cache[message.guild.id].lastNowPlayingMessage.delete()
	}
	message.channel.send({embed:embedJSON}).then(function(sentMessage) {
	    cache[message.guild.id].lastNowPlayingMessage=sentMessage;
	});
     }



exports.NowPlaying=function(message,track,player){
    var match = (player.createProgressBar(message,{queue:true,timecodes:true})||'').match(/(\d|:)+/g);
	var duration=moment.duration('00:00:00');
	if(match && match.length==2){
		duration = moment.duration(match[1]).subtract(moment.duration(match[0]));
	}
	var stateButton=((track.queue.stopped)?':stop_button:':((track.queue.paused)?':pause_button:':':arrow_forward:'));
	var stateString=((!track.queue.repeatMode)?':blue_square:':':repeat:')+' Repeat '+
			((!track.queue.loopMode)?':blue_square:':':infinity:')+' Loop '+
			((!track.queue.loopMode)?':blue_square:':':twisted_rightwards_arrows:')+' Shuffle ';
	var volumeLevel=':mute:';
	if(track.queue.volume){
		if(track.queue.volume<=30){
			volumeLevel=':speaker:';
		}else if(track.queue.volume<=80){
			volumeLevel=':sound:';
		}else{
			volumeLevel=':loud_sound:'
		}
	}
	var embeds=[];
	
	var nowPlaying={
	      "title": `${track.title}`,
	      //"description": `Author:${track.author}\n${track.description}`,
	      //"description": `[${track.title}](${track.url})`,
	      "description": "‎",
	      "url": `${track.url}`,
	      "color": 5814783,
	      "footer": {
		"text": track.requestedBy.username+' requested current song',
		"icon_url":  track.requestedBy.avatarURL() //"https://shipwa.sh/img/logo/shipwash_avatar.png"
	      },
// 	      "thumbnail": {
// 		"url": `${track.thumbnail}`
// 	      }
		image: {
		  url: `${track.thumbnail}`,
		},
	}
	embeds.push(nowPlaying);

	if(track.queue.tracks[1]){
		var nextPlaying={
		      "title": 'Next Song:',
		      "description": `>>> [${track.queue.tracks[1].title}](${track.queue.tracks[1].url})`,
		      "color": 5814783,
		      "footer": {
			"text": track.queue.tracks[1].requestedBy.username+' requested current song',
			"icon_url":  track.queue.tracks[1].requestedBy.avatarURL() //"https://shipwa.sh/img/logo/shipwash_avatar.png"
		      },
		      "thumbnail": {
			"url": `${track.queue.tracks[1].thumbnail}`
		      }
			//image: {
			//  url: `${track.thumbnail}`,
			//},
			}
		embeds.push(nextPlaying);
	}
	
	var playerState={
	      "title": "Player",
	      "description": "‎",
	      //"url": `${track.url}`,
	      "color": 5814783,
	      "fields": [
		//{
		//  "name": "Next song:",
		//  "value": '>>> '+(track.queue.tracks[1])?`[${track.queue.tracks[1].title}](${track.queue.tracks[1].url})`:'Add more songs!',
		//  "inline": false
		//},
		{
		  "name": "Player:",
		  "value": stateString,
		  "inline": true
		},
		{
		  "name": "‎",
		  "value": ((!track.queue.loopMode)?':bell:':':bell:')+'Attention '+volumeLevel+' '+((track.queue.volume>=100)?':100:':track.queue.volume),
		  "inline": true
		},
		{
		  "name": `Queue:`,
		  "value": stateButton+player.createProgressBar(message,{queue:true,timecodes:false}),
		  "inline": false
		},
		{
		  "name": "‎",
		  "value": 'Remaining\n'+moment.utc(duration).format("HH:mm:ss"),
		  "inline": true
		},
		{
		  "name": "‎",
		  "value": 'Tracks\n'+`${track.queue.tracks.length}`,
		  "inline": true
		}
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
	}
	embeds.push(playerState);
	message.channel.send({embeds:embeds});
  }

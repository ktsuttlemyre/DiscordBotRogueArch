const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":warning:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
var _ = require('lodash');

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class PlayCommand extends Command {
	constructor() {
		super('play', {
		description: { content: 'plays [name/URL]'},
		aliases: ['play','add','queue'],
		category: 'tunes',
		clientPermissions: ['SEND_MESSAGES'],
		args: [
			{
				id: 'search',
				default: '',
				match: 'content',
			},
			],
		channelRestriction: 'guild', 
		});
	}

	async exec(message, { search }) {
		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		var player = this.client.memory.get(message.guild, 'player')
		if (!search && player){
			var queue=player.getQueue(message);
			if(queue && (queue.paused || queue.stopped)){
				if(player.resume(message)){
					await GUIMessages.nowPlaying(message,player,"Continuing where we left of :-D");
				}else{
					await GUIMessages.nowPlaying(message,player,"Error resuming queue");
				}
				return;
			}else if(player.isPlaying(message)){
				return message.channel.send(`${emotes.error} - Please indicate the title of a song!`);
			}

		}

		if(!player){
			player = this.client.memory.set(message.guild, 'player', createPlayer(message,this.client));
			if(!search){
				await playBackgroundPlaylist(message,player);
				init(message,player)
				return
			}
		}

		

		if(!message.attachments){
			await player.play(message, search, { firstResult: true });
		}else{
			await player.play(message, search, { isAttachment:true });
		}
		//background playlist handle
		if(player.backgroundPlaylist){
			player.backgroundPlaylist=false;
			await player.skip(message);
		}
		//player.emit('trackAdd',message,player.queue,player.queue.tracks[0])
				

	}
}


function playBackgroundPlaylist(message,player){
	var backgrounds=[//'chill nintendo beats',
		'https://www.youtube.com/watch?v=oS-A-wqZ2RI',
		'https://www.youtube.com/watch?v=AEuQcjHT_f4',
		'https://www.youtube.com/watch?v=oUHvYOYMNJk',
		'https://www.youtube.com/watch?v=C37VQ99xh6U',
		'https://www.youtube.com/watch?v=3t4qrROblcc',
		'https://www.youtube.com/watch?v=680ETor7pns',
		'https://www.youtube.com/watch?v=e6RHPoLimHI',
		'https://www.youtube.com/watch?v=xTUlPXmclFk',
		'https://www.youtube.com/watch?v=aAw_0a6aHo0',
		'https://www.youtube.com/watch?v=8JEvxdAYjSo',
		'https://www.youtube.com/watch?v=rDcYN1THMZY',
		'https://www.youtube.com/watch?v=SLgms78JVo0',
		'https://www.youtube.com/watch?v=sfyvAQemik4',
		'https://www.youtube.com/watch?v=iXFpdYQTzVo',
		'https://www.youtube.com/watch?v=lqNc1ky_Xoc',
		'https://www.youtube.com/watch?v=p9a-AQQJ8Aw',
		'https://www.youtube.com/watch?v=UkjFV-66E2c',
		'https://www.youtube.com/watch?v=9W9Wg_bp0ns',
		'https://www.youtube.com/watch?v=ZNf0D-BXi18',
		'https://www.youtube.com/watch?v=iJwE7PwJirs',
		'https://www.youtube.com/watch?v=5hZa1jb7MLg',
		'https://www.youtube.com/watch?v=ELljh9xfuuw',
		'https://www.youtube.com/watch?v=dM103L2tErY',
		'https://www.youtube.com/watch?v=CLLC1aPs0-Q',
		'https://www.youtube.com/watch?v=UOaNOZ4_qtw',
		'https://www.youtube.com/watch?v=iRdi1O94BNs',
		'https://www.youtube.com/watch?v=qZGwRz8wnSY',
		'https://www.youtube.com/watch?v=lqNc1ky_Xoc', //https://www.youtube.com/watch?app=desktop&v=lqNc1ky_Xoc&list=PLtSSR9Mvq5GpfHT5kiM8OdJbXsNSL33QG&index=8
		'https://www.youtube.com/watch?v=CNh1uSiAHRQ',
		'https://www.youtube.com/watch?v=rJlY1uKL87k',
		'https://www.youtube.com/watch?v=GdzrrWA8e7A',
		'https://www.youtube.com/watch?v=Y1nv35y886Y',
		'https://www.youtube.com/watch?v=c7rAknLeT-s',
		'https://www.youtube.com/watch?v=26l103sNnwM',
		'https://www.youtube.com/watch?v=7BgoXsZEuQ0',
		'https://www.youtube.com/watch?v=Lm6mrELlBtE',
		'https://www.youtube.com/watch?v=kyRZzzzjBxw', //https://www.youtube.com/watch?app=desktop&v=kyRZzzzjBxw&list=PLMeD3sfITven2bLRKPRhxga26VSeG5cAs&index=19&t=0s
		'https://youtu.be/2ed5QQ7exzw',
		'https://www.youtube.com/watch?v=5hqf5_3tLt0',
		'https://youtu.be/YtWrrI_A0e0',
		'https://youtu.be/RMCvF1sG2FA',
		'https://youtu.be/A-jjpax28uE',
		'https://youtu.be/30JZylPUmz0',
		'https://youtu.be/omZ4-wFlScE',
		'https://youtu.be/TO7z2FYB_mo',
		'https://youtu.be/CsQAaareXU8',
		'https://youtu.be/hHlXohfUFEI',
		'https://www.youtube.com/watch?v=ynVKsMS2ZZg',
		//'https://youtu.be/UkjFV-66E2c',
		'https://www.youtube.com/watch?v=CHfhIZf2SGg',
		'https://www.youtube.com/watch?v=MLLgrrPrdbQ',
		'https://www.youtube.com/watch?v=q_rxsPa_YCk',
		]
	var selection = _.sample(backgrounds)
	player.backgroundPlaylist=true;
	return player.play(message, selection, { firstResult: true });
}

function createPlayer(message,client){
	//https://discord-player.js.org/global.html#PlayerOptions
	let options={
		leaveOnEnd:false,
		leaveOnEndCooldown:300,
		leaveOnStop:false,
		leaveOnEmpty:false,
		leaveOnEmptyCooldown:300,	
		autoSelfDeaf:true,
		quality:'high',
		enableLive: false,	    
	}
	var player = new Player(client,options);
	player.init=false;

	player.on("trackStart",function(message, track){
		if(track.skip){
			player.skip(message);
			//alert the user of what is now playing
			GUIMessages.nowPlaying(message,player,"Skipping ${track.name} for reason:${track.skip}");
		}

		init(message,player)
		
				/*
		//complidated init event to add volume and filters
		if(!player.isPlaying(message)){
			player.on('queueCreate',function(message,queue){
				var init=false
				player.on('trackStart',function(message, track){
					if(init){
						return;
					}
					init=setInterval(function(){
						if(!player.isPlaying(message)){
							return
						}
						try{
							//https://discord-player.js.org/global.html#Filters
							player.setFilters(message, {
							 normalizer: true
							});
							player.setVolume(message, 20);
							clearInterval(init);
						}catch(e){
						}
					},10);
				})
			});
		}*/
		
	})
	// Send a message when something is added to the queue
	.on('trackAdd', async (message, queue, track) =>{
		if(!message || message.deleted){
			//GUIMessages.nowPlaying(message,player,`${user.username} likes ${track.title}`);
			return
		}
		message.react(reactions.shipwash); //THIS should be handled elsewhere
		message.delete();

		var embed={
			"author": {
				"name": track.requestedBy.username,
				"url": `https://shiptunes.shipwa.sh/${track.requestedBy.id}`,
				"icon_url": track.requestedBy.avatarURL()||defaultAvatar
			},
			//"title":+`\n>>>${message.content}`
			"description":/*'> '+message.content.split('\n').join('\n> ')+`\n*/`Added: [${track.title}](${track.url})`,
			"thumbnail": {
				"url": `${track.thumbnail}`
			}
		}

		var reply = await message.channel.send({embed:embed}) //content:message.content

		//add custom properties 
		//to track
		track.messageCommand=message
		track.messageQEntry=reply

		//add custom properties permalinks to entries			
		//message.permalink=common.permalinkMessage(message.guild,message.channel,reply);
		reply.permalink=common.permalinkMessage(reply.guild,reply.channel,reply);

		await reply.react(reactions.upvote);
		await reply.react(reactions.downvote);

		const collector = reply.createReactionCollector((reaction, user) => {
			return [reactions.upvote, reactions.downvote].includes(reaction.emoji.name) 
		}); //{ time: 15000 }

		collector.on('collect', (reaction, user) => {
			if(reaction.emoji.name === reactions.downvote){ //if downvote
				if(user.id === track.messageCommand.author.id){ //if original poster
					//delete message
					reply.delete();

					//set it to be skipped
					track.skip=true;

					//if it is currently playing then skip
					var nowPlaying=player.nowPlaying(message)
					if(nowPlaying && nowPlaying===track){ //or message maybe?
						player.skip(message);
					}else{ //if it isn't playing then delete it
						player.remove(message,track);
					}

					//delete track from queue
// 							common.filterInPlace(track.queue.tracks,function(o) {
// 							   console.log('comparing',o.url,track.url)
// 							   return o.url !== track.url;
// 							});


					//alert everyone
					GUIMessages.nowPlaying(message,player,`${user.username} removed ${track.title}`);
				}else{ //these are just users that don't like the song and we will pass on their message
					GUIMessages.nowPlaying(message,player,`${user.username} does not like ${track.title}`);
				}
			}else if(reaction.emoji.name === reactions.upvote){ //these are users that like the song and we will pass on their message
				GUIMessages.nowPlaying(message,player,`${user.username} likes ${track.title}`);
			}
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		});

// 				collector.on('end', collected => {
// 					console.log(`Collected ${collected.size} items`);
// 				});

		GUIMessages.nowPlaying(message,player,`${message.member.displayName} has added ${track.title}`);
	})
	.on('playlistAdd',function(message, queue, playlist){
		message.react(reactions.shipwash);
		//message.react('☑️');
		GUIMessages.nowPlaying(message,player,`${message.member.displayName} has added playlist ${playlist.title}`);
	})
	// Send messages to format search results
	.on('searchResults', (message, query, tracks) => {

	    const embed = new Discord.MessageEmbed()
	    .setAuthor(`Here are your search results for ${query}!`)
	    .setDescription(tracks.map((t, i) => `${i}. ${t.title}`))
	    .setFooter('Send the number of the song you want to play!')
	    message.channel.send(embed);

	})
	.on('searchInvalidResponse', (message, query, tracks, content, collector) => {

	    if (content === 'cancel') {
		collector.stop()
		return message.channel.send('Search cancelled!')
	    }

	    message.channel.send(`You must send a valid number between 1 and ${tracks.length}!`)

	})
	.on('searchCancel', (message, query, tracks) => message.channel.send('You did not provide a valid response... Please send the command again!'))
	.on('noResults', (message, query) => message.channel.send(`No results found on YouTube for ${query}!`))

	// Send a message when the music is stopped
	.on('queueEnd',async function(message, queue){
		player.init=false
		playBackgroundPlaylist(message,player)
		init(message,player,'Playing background music until I get a new request') //'Music stopped. There no more music in the queue!'
	})
	.on('channelEmpty',function(message, queue){
		GUIMessages.nowPlaying(message,player,'I am alone in the voice channel. :frowning:');
		var channel=message.guild.me.voiceChannel.leave();
		if(channel){
			channel.leave();
		}
	})
	.on('botDisconnect',function(message){
		GUIMessages.nowPlaying(message,player,'Music stopped. I have been disconnected from the channel!');
	})

	// Error handling
	.on('error', (error, message) => {
	    switch(error){
// 		case 'NotPlaying':
// 		    console.error(error);
// 		    break;
		case 'NotConnected':
		    message.channel.send('You are not connected in any voice channel!')
		    break;
		case 'UnableToJoin':
		    message.channel.send('I am not able to join your voice channel, please check my permissions!')
		    break;
		case 'LiveVideo':
		    message.channel.send('YouTube lives are not supported!')
		    break;
		case 'VideoUnavailable':
		    message.channel.send('This YouTube video is not available!');
		    break;
		case 'Error: input stream: Status code: 429':
		    process.exit(1); 
		    message.channel.send(`Youtube ratelimit hit. Restarting...`)
		default:
	            console.error(error);
		    message.channel.send(`Something went wrong... ${error}`)
	    }
	})
	return player
}
function init(message,player,announce){
		if(!player.init){
			var toID=setInterval(function(){
				var queue=player.getQueue(message);
				if(!queue){return}
				var voiceConnection= queue.voiceConnection;
				if(!voiceConnection){return}
				var dispatcher = voiceConnection.dispatcher;
				if(!dispatcher){return}
				player.setFilters(message, {
				 normalizer: true
				});
				player.setVolume(message, 50);
				console.log('set volume and filter properly')
				clearInterval(toID);
				GUIMessages.nowPlaying(message,player,announce);
			})
			player.init=true;
		}else{
			GUIMessages.nowPlaying(message,player,announce);
		}
}
module.exports = PlayCommand;


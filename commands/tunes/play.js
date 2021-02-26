const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');

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

	exec(message, { search }) {
		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		if (!search) return message.channel.send(`${emotes.error} - Please indicate the title of a song !`);
		var player = this.client.memory.get(message.guild, 'player', player)
		if(!player){
			//https://discord-player.js.org/global.html#PlayerOptions
			let options={
				leaveOnEnd:true,
				leaveOnEndCooldown:300,
				leaveOnStop:false,
				leaveOnEmpty:true,
				leaveOnEmptyCooldown:300,	
				autoSelfDeaf:true,
				quality:'high',
				enableLive: true,	    
			}
			player = this.client.memory.set(message.guild, 'player', new Player(this.client,options));
						
			player.on("trackStart",function(message, track){
				//alert the user of what is now playing
				GUIMessages.NowPlayingOverloaded(message,player);
				//message.channel.send(`Now playing ${track.title} requested by @${track.requestedBy.username} `)
			})
			// Send a message when something is added to the queue
			.on('trackAdd',async (message, queue, track) =>{
				message.react(reactions.shipwash); //THIS should be handled elsewhere
				message.delete();

				var embed={
					"author": {
						"name": track.requestedBy.username,
						"url": `https://shiptunes.shipwa.sh/${track.requestedBy.id}`,
						"icon_url": track.requestedBy.avatarURL()||defaultAvatar
					},
					//"title":+`\n>>>${message.content}`
					"description":'> '+message.content.split('\n').join('\n> ')+`\nAdded: [${track.title}](${track.url})\nto the queue.`,
					"thumbnail": {
						"url": `${track.thumbnail}`
					}
				}
				
				var reply = await message.channel.send({embed:embed}) //content:message.content
				track.messageLink=common.permalinkMessage(message.guild,message.channel,reply);
				
				await reply.react(reactions.upvote);
				await reply.react(reactions.downvote);
				
				GUIMessages.NowPlayingOverloaded(message,player,`${message.member.displayName} has added ${track.title}`);
			})
			.on('playlistAdd',function(message, queue, playlist){
				message.react(reactions.shipwash);
				//message.react('☑️');
				GUIMessages.NowPlayingOverloaded(message,player,`${message.member.displayName} has added playlist ${playlist.title}`);
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
			.on('queueEnd',function(message, queue){
				GUIMessages.NowPlayingOverloaded(message,player,'Music stopped as there is no more music in the queue!');
			})
			.on('channelEmpty',function(message, queue){
				message.channel.send('Music stopped as there is no more member in the voice channel!')
			})
			.on('botDisconnect',function(message){
				message.channel.send('Music stopped as I have been disconnected from the channel!')
			})

			// Error handling
			.on('error', (error, message) => {
			    switch(error){
				case 'NotPlaying':
				    message.channel.send('There is no music being played on this server!')
				    break;
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
				default:
				    message.channel.send(`Something went wrong... Error: ${error}`)
			    }
			})
		}
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
		var g = async () => {
			if(!message.attachments){
				await player.play(message, search, { firstResult: true });
			}else{
				await player.play(message, search, { isAttachment:true });
			}
			player.emit('trackAdd',message,player.queue,player.queue.tracks[0])
		};
		g();
		

	}
}

module.exports = PlayCommand;


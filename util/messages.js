const GUIMessages = require.main.require('./templates/messages');
const { Command } = require('discord-akairo');
const { Player } = require("discord-player");
const emotes={error:":error:"}
const {reactions,defaultAvatar} = require.main.require('./common');
const common = require.main.require('./common');
const commandVars = common.commandVars(__filename);
const _ = require('lodash');
const web = require.main.require('./web');
const yaml = require('js-yaml');



module.exports.retrieveTrackMessage = function(message,track){
	var id = message.client.memory.channelGet(message, web.getYoutubeHash(track.url)+'_'+track.requestedBy.id+'_'+message); // || this.client.memory.channelSet(message, 'player', util.player.create(message,this.client));
	return message.channel.messages.fetch(id);
}

module.exports.embedParser = async function(message){
	let embed= message.embed || message.embeds[0];
	var author = embed.author
	if(author){
		//shiptunes embed url
		//encodeURI(`https://shiptunes.shipwa.sh/${track.requestedBy.id}#?name=${name}`);
		//normal encapsulate url
		//https://discordapp.com/users/${user.id}
		let id = author.url.match(/urldiscordapp.com\/users\/(\d+)$/)[1]; //discordapp.com url
		let type = 'encapsulate';
		if(!id){ // see if it is shiptunes.shipwa.sh url
			id = author.url.match(/\/shiptunes\.shipwa\.sh\/(\d+)#.name=/)[1];
			type = 'shiptunes';
			if(!id){ //idk what type this is
				type = 'undefined'
			}
		}
		//https://stackoverflow.com/questions/60676210/how-to-find-user-by-his-id-in-discord-js
		//https://stackoverflow.com/questions/63107193/discord-js-how-do-i-convert-user-id-to-member
		let user = await message.client.users.fetch(id);
		let member = message.guild(user);
		return {member:member}
	}
}

module.exports.encapsulate = async function(message,override,dontDelete){
	if(!override){
		override=message.content;
	}

	let doc = override || {}
	var type = typeof doc;
	if(type == 'string'){
		let split = doc.split('\n');
		doc = {};
		if(split.length==1){
			doc.title = '\t '+split[0];
		}else{
		doc.title = split.shift();
		doc.description = split.join('\n')
		}
	}else if(Array.isArray(doc)){
		return message.channel.send('Can not process arrays');
	}
	
	//set author if needed
	let user = message.member || message.author
	let author = {
		name: user.displayName || user.tag,
		icon_url: message.author.avatarURL() || common.defaultAvatar,
		url: `https://discordapp.com/users/${user.id}`,
	}
	doc.author=author;
	
	//if user is admin and requests anon then 
	let isAdmin = message.member.roles.cache.find(role => role.name === config.DJ_Role)@@@@@@
	if(isAdmin && doc.anon || doc.anonymous){
		doc.author = undefined;
		delete doc.author;
	}
	//if channel is set then
	let channel = message.channel;
	if(isAdmin && doc.channel){
		channel = await message.client.channels.fetch(doc.channel)
	}
	
	let reply;
	if(isAdmin && doc.edit){
		message = await channel.messages.fetch(doc.edit)
		reply = await message.edit({embed:doc});
	}else{
		reply = await channel.send({embed:doc});
	}
	
	//if reactions are set then
	if(isAdmin && doc.reactions){
		for(const reaction in doc.reactions){
			await reply.react(reaction);
		}
	}
	
	
	//dont delete original source
	if((!dontDelete || !doc.dontDelete) && !message.deleted){
		await message.delete();
	}
}

module.exports.permalink=function(message){
	return `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
}

let permalinkRegex = /(discord.com)\/(channels)\/(\d+)\/(\d+)\/(\d+)/;
module.exports.parsePermalink=function(link){
	let match = (link||'').match(permalinkRegex);
	if(match[0] && match[1] && match[2] && match[3] && match[4] && match[5]){
		return {guild:match[3],
			channel:match[4],
			message:match[5],
			0:match[3],
			1:match[4],
			2:match[5]
		}
	}
}



module.exports.resolve=async function(message){
	//load partial
	if (message.partial) {
		try {
			return message.fetch();
		} catch (error) {
			console.error(`Something went wrong when fetching the message: ${message.id}`, error);
			return message;
		}
	}
	return message;
}




exports.getMessages = async function getMessages(channel, limit) {
		if(!limit){
			limit=Infinity
		}
		let out= []
		// if (limit <= 100) {
		//   let messages = await channel.messages.fetch({ limit: limit })
		//   out.push.apply(out,messages.array())
		// } else {
		let rounds = (limit / 100) + (limit % 100 ? 1 : 0)
		let last_id = ""
		for (let x = 0; x < rounds; x++) {
			const options = {
				limit: 100
			}
			if (last_id.length > 0) {
				options.before = last_id
			}
			const messages = await channel.messages.fetch(options);
			const messageArray = messages.array();
			if(!messageArray.length){
				break
			}
			out.push.apply(out,messageArray)
			//console.log('messages.length',messageArray.length)
			last_id = messageArray[(messageArray.length - 1)].id
		}
		//}
		return out
	}
		
module.exports.fetchMessagesLegacy = async function fetchMessages(channel, options, callback) {
		if(!options.limit){
			options.limit=Infinity
		}

		let rounds = (options.limit / 100) //+ (options.limit % 100 ? 1 : 0);
		var opts={};
		opts.limit = (options.limit<100)?options.limit:100;

		let gIndex=0;
		for (let x = 0; x < rounds; rounds--) {
			if(rounds<1){
				opts.limit = (options.limit!=Infinity)?options.limit % 100:100;
			}
			const messages = await channel.messages.fetch(opts,false);
			const messagesArray = messages.array();

			if(!messagesArray.length){
				break;
			}

			messagesArray.some(function(current,index,array){
				if(gIndex>=options.limit){
					return true;
				}
				return callback(current,index,array,gIndex++);
			});

			opts.before = messagesArray[(messagesArray.length - 1)].id
		}
	}

module.exports.fetch = async function fetchMessages(channel, options, callback) {
	    if(typeof options == 'function'){
	    	callback=options
	    	options={}
	    }
		let opts={limit:20};

		let loadedAllMessages = false; //denote all messages are loaded
		let breakOut = false;  //stop loading any more messages

		let gIndex=0;
		let gOffset=0;
		let nBuffer=5;

		const array = [];

		let _processTick=async function(resolve){
			console.log('processing tick');
			if(breakOut){return resolve('resolved');}
				
			for(let index=gIndex+gOffset,l=array.length; (loadedAllMessages || index<l-nBuffer) && index<l; index++, gIndex++){
				console.log('calling callback with',index,gIndex)
				let response = await callback(array[index], index, array, gIndex);
				//console.log('got response',response);
				if(typeof response == 'number'){
					index=response-1
					continue;
				}
				if(response){
					breakOut=true;
					return resolve('resolved');
				}
			};
			
			if(loadedAllMessages){
				return resolve('resolved');
			}


			//test length and delete the beginning of the array to clean up
			if(array.length>(nBuffer*2)+1){
				let remove = array.length-((nBuffer*2)+1);
				gOffset-= remove;  //array.length-(nBuffer)
				array.splice(0,remove);	
			}
			
		}

		let _fetchMessages=function(resolve){
			if(breakOut){return resolve('resolved');}
			//https://discord.js.org/#/docs/main/master/class/MessageManager?scrollTo=fetch
			channel.messages.fetch(opts,false,true).then(function(messages){ 
				console.log('fetched messages',messages.length)
				if(breakOut){return resolve('resolved');}
				const messagesArray = messages.array();

				if(!messagesArray.length){
					loadedAllMessages=true;
				}else{
					array.push.apply(array,messagesArray);
					opts.before = messagesArray[(messagesArray.length - 1)].id
					_fetchMessages(resolve);
				}
				_processTick(resolve);
			});
		}
		

		return new Promise(resolve => {
			console.log('started promise')
			_fetchMessages(resolve);
		});
	}



/*
https://stackoverflow.com/questions/53201455/how-to-get-discord-bot-to-read-embed/53206377
      message {Discord.Message}: the message you want to search in
      target {string}: the string you're looking for
      {
        caseSensitive {boolean}: whether you want the search to be case case-sensitive
        author {boolean}: whether you want to search in the author's name
        description {boolean}: whether you want to search in the description
        footer {boolean}: whether you want to search in the footer
        title {boolean}: whether you want to search in the title
        fields {boolean}: whether you want to search in the fields
      }
     */
module.exports.findInMessage = function findInMessage(message, target, opts) {
  if (!target || !message) return null;
    opts = opts ||{};
    opts.caseSensitive = (opts.caseSensitive==null)?true:false;
    opts.author = (opts.author==null)?true:false;
    opts.description = (opts.description==null)?true:false;
    opts.footer = (opts.footer==null)?true:false;
    opts.title = (opts.title==null)?true:false;
    opts.fields = (opts.fields==null)?true:false;

	
  let str = opts.caseSensitive ? target : target.toLowerCase();

  if ((opts.caseSensitive && message.content.includes(str)) ||
    (!opts.caseSensitive && message.content.toLowerCase().includes(str))) return true;

  for (let embed of message.embeds) {
    if ((opts.caseSensitive && (
        (opts.author && (embed.author||'').includes(str)) ||
        (opts.description && (embed.description||'').includes(str)) ||
        (opts.footer && (embed.footer||'').includes(str)) ||
        (opts.title && (embed.title||'').includes(str)))) ||
      (!opts.caseSensitive && (
        (opts.author && (embed.author||'').toLowerCase().includes(str)) ||
        (opts.description && (embed.description||'').toLowerCase().includes(str)) ||
        (opts.footer && (embed.footer||'').toLowerCase().includes(str)) ||
        (opts.title && (embed.title||'').toLowerCase().includes(str))))
    ) return true;

    if (opts.fields)
      for (let field of embed.fields) {
        if ((opts.caseSensitive && [(field.name||''), (field.value||'')].includes(str)) ||
          (!opts.caseSensitive && [(field.name||'').toLowerCase(), (field.value||'').toLowerCase()].includes(str))) return true;
      }
  }

  return false;
}

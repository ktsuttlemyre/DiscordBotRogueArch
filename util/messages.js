const debug = false;
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const emotes = {error: ":error:"};
const {reactions, defaultAvatar} = require.main.require("./common");
const common = require.main.require("./common");
const commandVars = common.commandVars(__filename);
const config = require.main.require("./config");
const _ = require("lodash");
const web = require.main.require("./web");
const yaml = require("js-yaml");
const Discord = require('discord.js');



module.exports.getReactedUsers = async function(msg, emoji) {
	let reactions = msg.reactions.resolve(emoji);
	if (!reactions) {
		return new Discord.Collection();
	}
	debug && console.log('reactions',reactions)
	let userList = null;
	try{
		userList = await reactions.users.fetch().catch((err) => {
			throw err;
		});
	} catch (err) {
		console.error('caught a error in util.messages.getReactedusers:',err);
	}

	return userList || new Discord.Collection(); //(userList.map((user) => user.id));
}
// 				.filter(async function(message){ //filter out commands that have this bot using the shipwash reaction
// 				    let reaction = await message.reactions.cache.get(reactions.shipwash)
// 				    if(!reaction){
// 					return false;
// 				    }
// 				    reaction.fetch() //TODO only gets 100
// 				    let users = reaction.users.fetch(); //TODO only gets 100

// 				    for (const user of users) {
// 				      const id = user.id;
// 				      if(id == client.user.id){
// 					return false
// 				      }
// 						return true;
// 					}
// 				})


module.exports.retrieveTrackMessage = function (message, track) {
	var id = message.client.memory.channelGet(message, web.getYoutubeHash(track.url) + "_" + track.requestedBy.id + "_" + message); // || this.client.memory.channelSet(message, 'player', util.player.create(message,this.client));
	return message.channel.messages.fetch(id);
};

module.exports.embedParser = async function (message) {
	let embed = message.embed || message.embeds[0];
	var author = embed.author;
	if (author) {
		//shiptunes embed url
		//encodeURI(`https://shiptunes.shipwa.sh/${track.requestedBy.id}#?name=${name}`);
		//normal encapsulate url
		//https://discordapp.com/users/${user.id}
		let id = author.url.match(/urldiscordapp.com\/users\/(\d+)$/)[1]; //discordapp.com url
		let type = "encapsulate";
		if (!id) {
			// see if it is shiptunes.shipwa.sh url
			id = author.url.match(/\/shiptunes\.shipwa\.sh\/(\d+)#.name=/)[1];
			type = "shiptunes";
			if (!id) {
				//idk what type this is
				type = "undefined";
			}
		}
		//https://stackoverflow.com/questions/60676210/how-to-find-user-by-his-id-in-discord-js
		//https://stackoverflow.com/questions/63107193/discord-js-how-do-i-convert-user-id-to-member
		let user = null
		try{
			user = await message.client.users.fetch(id).catch((err) => {
				throw err;
			});
		} catch (err) {
			console.error('caught an error in util.messages.embedParser:',err);
		}
		let member = message.guild(user);
		return {member: member};
	}
};

module.exports.encapsulate = async function (message, doc, opts) {
	/*
	opts is a special object usually passed via the !encapsulate command
	includes member/user who requested the encapluate function
	
	doc.style = style such as info, error, log, etc
	doc.dm, doc.dms, doc.private = sends the response as a private message
	doc.delete = false (can be passed to keep the orignal from being deleted)
	doc.anon, doc.anonymous = original requester wont be shown
	*/
	opts = opts || {}
	if (!doc) {
		doc = message.content;
	}
	
	debug && console.log("pre parsed encapsulation", doc);
	
	//convert doc to embed obj
	if (Array.isArray(doc)) {
		doc = doc.join('\n');
	}
	
	let type = typeof doc;
	if (type == "string") {
		let split = doc.split("\n");
		doc = {};
		if (split.length == 1) {
			doc.title = "\t " + split[0];
		} else {
			doc.title = split.shift();
			doc.description = split.join("\n");
		}
	}		
	//add any default attributes to doc
	doc.style = doc.style || 'default'
	
	// note these use bootstrap 4 colors
	switch(doc.style.error){
		case 'error':
			doc.color = "dc3545"
			break;
		case 'warning':
			doc.color = "ffc107"
			break;
		case 'info':
		case 'information':
			doc.color = "17a2b8"
			break;
		case 'log':
		case 'primary':
			doc.color = "#007bff"
			break;
		case 'success':
			doc.color = "28a745"
			break;
	}
	
	//set aliases
	doc.anonymous = doc.anon || doc.anonymous;
	doc.dm = doc.dm || doc.dms || doc.private;


	//set author if needed
	let author = message.member || message.author;
	doc.author = {
		name: author.displayName || author.tag,
		icon_url: message.author.avatarURL() || common.defaultAvatar,
		url: `https://discordapp.com/users/${author.id}`,
	};

	//if requester is admin and requests anon then
	let onBehalf = opts.member || opts.user
	let isAdmin = (!onBehalf)?true:onBehalf && onBehalf.roles && onBehalf.roles.cache.find((role) => config.encapsulateAdminRoles.includes(role.name));
	
	//if this isn't an admin request then delete all admin options
	if(!isAdmin){
		doc.anonymous = doc.channel = doc.edit = doc.dm = doc.reactions = doc.delete = undefined;
	}
	
	if (doc.anonymous) {
		doc.author = undefined;
		delete doc.author;
	}
	//if channel is set then
	let channel = message.channel;
	if (doc.channel) {
		channel = await message.client.channels.fetch(doc.channel.toString());
		delete doc.channel;
	}

	let reply;
	if(doc.edit) {
		if(doc.edit !== true){
			message = await channel.messages.fetch(doc.edit);		
		}
		reply = await message.edit({embed: doc});
	}else if(doc.dm){
		const shouldReply = message.guild && message.channel.permissionsFor(message.client.user).has('SEND_MESSAGES');

		try {
			await message.author.send({ embed });
			if (shouldReply) embed.content= 'I\'ve sent you a DM with the requested information.';
		}catch (err) {
			if (shouldReply) embed.content = 'I could not send you the command list in DMs.';
		}
	}

	reply = await channel.send({embed: doc});
	

	//if reactions are set then
	if (doc.reactions) {
		for (var i = 0, l = doc.reactions.length; i < l; i++) {
			let reaction = doc.reactions[i];
			reaction = reaction.trim();
			debug && console.log("reacting to encapsulated message", reaction);
			await reply.react(reaction);
		}
	}

	//if doc.delete is false then dont delete
	//also dont delete original source if it's already deleted
	if (doc.delete !== false && !message.deleted) {
		await message.delete().catch(function(error){
			console.error(error);
		});
	}
	return reply;
};

module.exports.permalink = function (message) {
	return `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
};

let permalinkRegex = /(discord.com)\/(channels)\/(\d+)\/(\d+)\/(\d+)/;
module.exports.parsePermalink = function (link) {
	let match = (link || "").match(permalinkRegex);
	if (match[0] && match[1] && match[2] && match[3] && match[4] && match[5]) {
		return {
			guild: match[3],
			channel: match[4],
			message: match[5],
			0: match[3],
			1: match[4],
			2: match[5],
		};
	}
};

module.exports.resolve = async function (message) {
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
};

exports.getMessages = async function getMessages(channel, limit) {
	if (!limit) {
		limit = Infinity;
	}
	let out = [];
	// if (limit <= 100) {
	//   let messages = await channel.messages.fetch({ limit: limit })
	//   out.push.apply(out,messages.array())
	// } else {
	let rounds = limit / 100 + (limit % 100 ? 1 : 0);
	let last_id = "";
	for (let x = 0; x < rounds; x++) {
		const options = {
			limit: 100,
		};
		if (last_id.length > 0) {
			options.before = last_id;
		}
		const messages = await channel.messages.fetch(options);
		const messageArray = messages.array();
		if (!messageArray.length) {
			break;
		}
		out.push.apply(out, messageArray);
		//console.log('messages.length',messageArray.length)
		last_id = messageArray[messageArray.length - 1].id;
	}
	//}
	return out;
};

module.exports.fetchMessagesLegacy = async function fetchMessages(channel, options, callback) {
	if (!options.limit) {
		options.limit = Infinity;
	}

	let rounds = options.limit / 100; //+ (options.limit % 100 ? 1 : 0);
	var opts = {};
	opts.limit = options.limit < 100 ? options.limit : 100;

	let gIndex = 0;
	for (let x = 0; x < rounds; rounds--) {
		if (rounds < 1) {
			opts.limit = options.limit != Infinity ? options.limit % 100 : 100;
		}
		const messages = await channel.messages.fetch(opts, false);
		const messagesArray = messages.array();

		if (!messagesArray.length) {
			break;
		}

		messagesArray.some(function (current, index, array) {
			if (gIndex >= options.limit) {
				return true;
			}
			return callback(current, index, array, gIndex++);
		});

		opts.before = messagesArray[messagesArray.length - 1].id;
	}
};

module.exports.fetchForEach = async function fetchMessages(channel, options, callback) {
	if (typeof options == "function") {
		callback = options;
		options = {};
	}
	let opts = {limit: 20};

	let loadedAllMessages = false; //denote all messages are loaded
	let breakOut = false; //stop loading any more messages

	let gIndex = 0;
	let gOffset = 0;
	let nBuffer = 5;

	const array = [];

	let _processTick = async function (resolve) {
		console.log("processing tick");
		if (breakOut) {
			return resolve("resolved");
		}

		for (let index = gIndex + gOffset, l = array.length; (loadedAllMessages || index < l - nBuffer) && index < l; index++, gIndex++) {
			console.log("calling callback with", index, gIndex);
			let response = await callback(array[index], index, array, gIndex);
			//console.log('got response',response);
			if (typeof response == "number") {
				let delta = index - response;
				gOffset += delta;
				gIndex += delta;
				index += response;
				continue;
			}
			if (response) {
				breakOut = true;
				return resolve("resolved");
			}
		}

		if (loadedAllMessages) {
			return resolve("resolved");
		}

		//test length and delete the beginning of the array to clean up
		if (array.length > nBuffer * 2 + 1) {
			let remove = array.length - (nBuffer * 2 + 1);
			gOffset -= remove; //array.length-(nBuffer)
			array.splice(0, remove);
		}
	};

	let _fetchMessages = function (resolve) {
		if (breakOut) {
			return resolve("resolved");
		}
		//https://discord.js.org/#/docs/main/master/class/MessageManager?scrollTo=fetch
		channel.messages.fetch(opts, false, true).then(function (messages) {
			console.log("fetched messages", messages.length);
			if (breakOut) {
				return resolve("resolved");
			}
			const messagesArray = messages.array();

			if (!messagesArray.length) {
				loadedAllMessages = true;
			} else {
				array.push.apply(array, messagesArray);
				opts.before = messagesArray[messagesArray.length - 1].id;
				_fetchMessages(resolve);
			}
			_processTick(resolve);
		});
	};

	return new Promise((resolve) => {
		console.log("started promise");
		_fetchMessages(resolve);
	});
};

module.exports.fetchShift = async function fetchMessages(channel, options) {
	if (typeof options == "function") {
		//callback=options
		options = {};
	}
	let opts = {limit: 20};

	let loadedAllMessages = false; //denote all messages are loaded

	let gIndex = 0;
	let gOffset = 0;
	let nBuffer = 5;

	const array = [];

	return function () {
		return new Promise(async (resolve) => {
			let index = gIndex + gOffset;

			let messagesArray = [];
			if (!loadedAllMessages && index > array.length - nBuffer) {
				//if we have messages on the server and getting close to buffer then
				//https://discord.js.org/#/docs/main/master/class/MessageManager?scrollTo=fetch
				let messages = await channel.messages.fetch(opts, false, true);
				//console.log('fetched messages',messages.length)
				messagesArray = messages.array();
				if (!messagesArray.length) {
					loadedAllMessages = true;
				} else {
					array.push.apply(array, messagesArray);
					opts.before = messagesArray[messagesArray.length - 1].id;
				}
			}
			console.log("processing tick");

			if (loadedAllMessages && index > array.length) {
				//no more results. return nothing free memory
				array.length = 0;
				array = null;
				return resolve(undefined);
			}

			console.log("calling callback with", index, gIndex);
			let response = array[index]; //await callback(array[index], index, array, gIndex);

			index++;
			gIndex++;

			//test length and delete the beginning of the array to clean up
			if (array.length > nBuffer * 2 + 1) {
				let remove = array.length - (nBuffer * 2 + 1);
				gOffset -= remove; //array.length-(nBuffer)
				array.splice(0, remove);
			}

			resolve(response);
		});
	};
};
/*example
let fetcher = uti.messages.stepFetch(options stuff here)
...
let message = await fetcher()

*/

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
	opts = opts || {};
	opts.caseSensitive = opts.caseSensitive == null ? true : false;
	opts.author = opts.author == null ? true : false;
	opts.description = opts.description == null ? true : false;
	opts.footer = opts.footer == null ? true : false;
	opts.title = opts.title == null ? true : false;
	opts.fields = opts.fields == null ? true : false;

	let str = opts.caseSensitive ? target : target.toLowerCase();

	if ((opts.caseSensitive && message.content.includes(str)) || (!opts.caseSensitive && message.content.toLowerCase().includes(str))) return true;

	for (let embed of message.embeds) {
		if (
			(opts.caseSensitive &&
				((opts.author && (embed.author || "").includes(str)) ||
					(opts.description && (embed.description || "").includes(str)) ||
					(opts.footer && (embed.footer || "").includes(str)) ||
					(opts.title && (embed.title || "").includes(str)))) ||
			(!opts.caseSensitive &&
				((opts.author && (embed.author || "").toLowerCase().includes(str)) ||
					(opts.description && (embed.description || "").toLowerCase().includes(str)) ||
					(opts.footer && (embed.footer || "").toLowerCase().includes(str)) ||
					(opts.title && (embed.title || "").toLowerCase().includes(str))))
		)
			return true;

		if (opts.fields)
			for (let field of embed.fields) {
				if (
					(opts.caseSensitive && [field.name || "", field.value || ""].includes(str)) ||
					(!opts.caseSensitive && [(field.name || "").toLowerCase(), (field.value || "").toLowerCase()].includes(str))
				)
					return true;
			}
	}

	return false;
};

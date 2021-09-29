var debug = false;
const {Command} = require("discord-akairo");

const path = require("path");
const {access} = require("fs/promises");
const {constants} = require("fs");

module.exports.player = require("./player");
module.exports.playlists = require("./playlists");
module.exports.messages = require("./messages");
module.exports.commandVars = require.main.require("./common").commandVars; //TODO move commandVars here and delete common
const config = require.main.require("./config");
module.exports.config = config;
const PromiseQueue = (module.exports.PromiseQueue = require.main.require("./util/PromiseQueue"));
const ytdl = require("ytdl-core");
const soundMap = config.voiceJoinLeave.tones.custom;

const _ = require("lodash");

const request = require("request");

const {EventEmitter} = require("events");
//create an object of EventEmitter class by using above reference
module.exports.frameworkEmitter = new EventEmitter();

let lastKeepAlive = null;
let pinging = false;
module.exports.wakeupPing = _.debounce(
	function (string, forceEnd) {
		pinging = true;
		let website = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/heartbeat`;
		console.log(`wake.js - Pinging ${website} for reason:${string}`);
		request(website, function (err, res, body) {
			if (err) {
				console.error("wake.js", err);
				forceEnd && process.exit(1);
			}
			console.log("wake.js - Successfully pinged");
			lastKeepAlive = Date.now();
			forceEnd && process.exit(0);
			//console.log(body.url);
			//console.log(body.explanation);
		});
	},
	1 * 60 * 1000,
	{maxWait: 25 * 60 * 1000, trailing: false, leading: true}
);

module.exports.devChannelGate = function (message, env) {
	env = env || process.env.ENVIRONMENT;

	if (env == "production") {
		if (message.channel.id === config.devChannelID) {
			return true;
		}
		return false;
	} else {
		if (message.channel.id === config.devChannelID) {
			return false;
		}
		return true;
	}
};

//accepts message or client
module.exports.commandPrefix = function (client, name) {};

//accepts message and name||command
module.exports.commandFormat = function (message, name) {
	let client = message.client;

	let command = name;
	if (name instanceof Command) {
		name = (command.id || command.filepath).split("/").pop();
	} else if(name.split){
		command = client.commandHandler.findCommand(name.split("/").pop());
	}else{
		return null
	}

	let prefix = command.prefix;
	if (!prefix && command.handler && command.handler.prefix) {
		prefix = command.handler.prefix.call ? command.handler.prefix(message) : command.handler.prefix;
	}
	if (!prefix) {
		//fix any null and undefined
		prefix = "";
	}

	var string = Array.isArray(prefix) ? JSON.stringify(prefix) : prefix;
	string += name;
	return string;
};

let web = {};
web.RegExp = {
	alphabetical: /[a-zA-Z]/g,
	majorAtoms: /[a-gi-zA-GI-Z]/g,
	commaSeperatedTrimSplit: /\s*,\s*/,
	blockQuotes: /\*.*\*/,
	leadingWhitespace: /^\s+/,
	trailingWhitespace: /\s+$/,
	getYoutubeHash: /(youtu\.be|youtube\.com|youtube-nocookie\.com|youtube\.googleapis\.com)\/(.*?(v\/|u\/\w+\/|embed\/|v=|v%3D|watch\/|attribution_link|e\/))?([a-zA-Z0-9_-]{11,})/,
	//				/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|watch\/)([a-zA-Z0-9_-]*).*/
	//				/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
	//Char syntax	(ignore) (assign(no &)) optional
	queryStringParser: /([^?=&]+)(=([^&]*))?/g,
	partitonAlphaNumericalNegitives: /[-\d.]+|(([^\s\d])((?!\d)))+|([^\s\d])+/g,
	partitonAlphaNumerical: /[-\d.]+|([^\s\d])+/g,
	validate: {
		zipCode: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
		JSASCIIIdentifier: /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,
		YoutubeHash: /^[a-zA-Z0-9_-]{11,}$/,
	},
};

//TODO validate
//http://stackoverflow.com/questions/2742813/how-to-validate-youtube-video-ids

//http://stackoverflow.com/questions/3717115/regular-expression-for-youtube-links
//inspiration: http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
const getYoutubeHash = (module.exports.getYoutubeHash = function (url) {
	if (!url) {
		return "";
	}
	if (url.length < 11) {
		return "";
	}
	//if(!web.isString(url)){return ''}
	if (url.includes("/user/")) {
		console.warn("skipping a youtube user page");
	}
	var match = url.match(web.RegExp.getYoutubeHash);
	var hash = match ? match[4].trim() : "";
	if (web.RegExp.validate.YoutubeHash.test(hash)) {
		return hash;
		// 			}else if(web.startsWith(hash,'v=')){
		// 				return hash.slice(2)
		// 			}else if(web.endsWith(hash,'/')){
		// 				return hash.slice(0,-1)
		// 			}else{ //now we will either just get the u= variable or the v= variablel //in that order yeah it isn't right but I do it
		// 				//http://www.youtube.com/attribution_link?a=5X4P22YNTKU&amp;u=%2Fwatch%3Fv%3DT2NUk5AFImw%26feature%3Dshare
		// 				var v = web.queryString(web.queryString(web.unescapeHTML(url),'u')||web.unescapeHTML(url),'v')
		// 				if(v&&web.RegExp.validate.YoutubeHash.test(v)){
		// 					return v
		// 				}else{ //just trim off the url and see if the value is at the end of the url
		// 					v = web.deepTrimLeft(url,'/')
		// 					if(v&&web.RegExp.validate.YoutubeHash.test(v)){
		// 						return v
		// 					}else{
		// 						if(!(/[\W]/).test(v)){
		// 							v = v.slice(0,11)
		// 							console.warn("truncating youtube hash from expected youtube url "+url+' hashvalue =\''+hash+'\' length'+hash.length);
		// 							return v
		// 						}
		// 					}
		// 				}
	}
	//			console.warn("Possible incorect hash from expected youtube url "+url+' hashvalue =\''+hash+'\' length'+hash.length);
	//			return hash
	return "";
});
/*tests*/
/*(function(tests){
			console.warn('!!!!unit testing for web.getYoutubeHash')
			_.forEach(tests,function(answer,url,urls){
				var hash = web.getYoutubeHash(url);
				console.assert(hash==answer,"input: "+url+" web returned "+hash+" but it should have been "+answer)
			})
		})
		({		//Tests																								Answers
		//pCoWDoGG tests (mine!)
		"http://www.youtube.com/attribution_link?a=5X4P22YNTKU&amp;u=%2Fwatch%3Fv%3DT2NUk5AFImw%26feature%3Dshare"	:'T2NUk5AFImw',
		"https://www.youtube.com/watch?feature=player_embedded&amp;v=E-byfKGQkbA"									:'E-byfKGQkbA',
		"http://www.youtube.com/attribution_link?a=5Q59r0-mo4w&u=%2Fwatch%3Fv%3D4AbuSKtrDzU%26feature%3Dshare"		:'4AbuSKtrDzU',
		"https://www.youtube.com/watch?v=fii99coWGvc#t=1586"														:'fii99coWGvc', //good for time checking too	
		//Lasnv http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'										:'0zM3nApSvMg',
		'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o'										:'QdK8U-VIH_o',
		'http://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0'											:'0zM3nApSvMg',
		'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'														:'0zM3nApSvMg',
		'http://www.youtube.com/embed/0zM3nApSvMg?rel=0'															:'0zM3nApSvMg',
		'http://www.youtube.com/watch?v=0zM3nApSvMg'																:'0zM3nApSvMg',
		'http://youtu.be/0zM3nApSvMg'																				:'0zM3nApSvMg',
		//Jeffreypriebe
		//'http://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0'											:'0zM3nApSvMg',
		//'http://www.youtube.com/embed/0zM3nApSvMg?rel=0'															:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'										:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg'																:'0zM3nApSvMg',
		//'http://youtu.be/0zM3nApSvMg'																				:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'														:'0zM3nApSvMg',
		//'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o'										:'QdK8U-VIH_o',
		//xronosiam
		'http://www.youtube.com/v/0zM3nApSvMg?fs=1&hl=en_US&rel=0'													:'0zM3nApSvMg',
		//'http://www.youtube.com/embed/0zM3nApSvMg?rel=0'															:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'										:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg'																:'0zM3nApSvMg',
		//'http://youtu.be/0zM3nApSvMg'																				:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'														:'0zM3nApSvMg',
		'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/KdwsulMb8EQ'										:'KdwsulMb8EQ',
		'http://youtu.be/dQw4w9WgXcQ'																				:'dQw4w9WgXcQ',
		'http://www.youtube.com/embed/dQw4w9WgXcQ'																	:'dQw4w9WgXcQ',
		'http://www.youtube.com/v/dQw4w9WgXcQ'																		:'dQw4w9WgXcQ',
		'http://www.youtube.com/e/dQw4w9WgXcQ'																		:'dQw4w9WgXcQ',
		'http://www.youtube.com/watch?v=dQw4w9WgXcQ'																:'dQw4w9WgXcQ',
		'http://www.youtube.com/?v=dQw4w9WgXcQ'																		:'dQw4w9WgXcQ',
		'http://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ'										:'dQw4w9WgXcQ',
		'http://www.youtube.com/?feature=player_embedded&v=dQw4w9WgXcQ'												:'dQw4w9WgXcQ',
		'http://www.youtube.com/user/IngridMichaelsonVEVO#p/u/11/KdwsulMb8EQ'										:'KdwsulMb8EQ',
		'http://www.youtube-nocookie.com/v/6L3ZvIMwZFM?version=3&hl=en_US&rel=0'									:'6L3ZvIMwZFM',
		// suya
		//'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'										:'0zM3nApSvMg',
		//'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o'										:'QdK8U-VIH_o',
		'http://youtube.googleapis.com/v/0zM3nApSvMg?fs=1&hl=en_US&rel=0'											:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'														:'0zM3nApSvMg',
		'http://www.youtube.com/embed/0zM3nApSvMg?rel=0"'															:'0zM3nApSvMg',
		//'http://www.youtube.com/watch?v=0zM3nApSvMg'																:'0zM3nApSvMg',
		//'http://youtu.be/0zM3nApSvMg'																				:'0zM3nApSvMg',
		'http://www.youtube.com/watch?v=0zM3nApSvMg/'																:'0zM3nApSvMg',
		'http://www.youtube.com/watch?feature=player_detailpage&v=8UVNT4wvIGY'										:'8UVNT4wvIGY',
		//Poppy Deejay
		'http://www.youtube.com/watch?v=iwGFalTRHDA '																:'iwGFalTRHDA',
		'https://www.youtube.com/watch?v=iwGFalTRHDA '																:'iwGFalTRHDA',
		'http://www.youtube.com/watch?v=iwGFalTRHDA&feature=related '												:'iwGFalTRHDA',
		'http://youtu.be/iwGFalTRHDA '																				:'iwGFalTRHDA',
		'http://www.youtube.com/embed/watch?feature=player_embedded&v=iwGFalTRHDA'									:'iwGFalTRHDA',
		'http://www.youtube.com/embed/watch?v=iwGFalTRHDA'															:'iwGFalTRHDA',
		'http://www.youtube.com/embed/v=iwGFalTRHDA'																:'iwGFalTRHDA',
		'http://www.youtube.com/watch?feature=player_embedded&v=iwGFalTRHDA'										:'iwGFalTRHDA',
		'http://www.youtube.com/watch?v=iwGFalTRHDA'																:'iwGFalTRHDA',
		'www.youtube.com/watch?v=iwGFalTRHDA '																		:'iwGFalTRHDA',
		'www.youtu.be/iwGFalTRHDA '																					:'iwGFalTRHDA',
		'youtu.be/iwGFalTRHDA '																						:'iwGFalTRHDA',
		'youtube.com/watch?v=iwGFalTRHDA '																			:'iwGFalTRHDA',
		'http://www.youtube.com/watch/iwGFalTRHDA'																	:'iwGFalTRHDA',
		'http://www.youtube.com/v/iwGFalTRHDA'																		:'iwGFalTRHDA',
		'http://www.youtube.com/v/i_GFalTRHDA'																		:'i_GFalTRHDA',
		'http://www.youtube.com/watch?v=i-GFalTRHDA&feature=related '												:'i-GFalTRHDA',
		'http://www.youtube.com/attribution_link?u=/watch?v=aGmiw_rrNxk&feature=share&a=9QlmP1yvjcllp0h3l0NwuA'		:'aGmiw_rrNxk',
		'http://www.youtube.com/attribution_link?a=fF1CWYwxCQ4&u=/watch?v=qYr8opTPSaQ&feature=em-uploademail'		:'qYr8opTPSaQ',
		'http://www.youtube.com/attribution_link?a=fF1CWYwxCQ4&feature=em-uploademail&u=/watch?v=qYr8opTPSaQ'		:'qYr8opTPSaQ',
		//jrom
		'//www.youtube.com/watch?v=iwGFalTRHDA'																		:'iwGFalTRHDA',
		'//www.youtube.com/watch?v=iwGFalTRHDA&feature=related'														:'iwGFalTRHDA',
		'http://youtu.be/iwGFalTRHDA'																				:'iwGFalTRHDA',
		'http://youtu.be/n17B_uFF4cA'																				:'n17B_uFF4cA',
		'http://www.youtube.com/embed/watch?feature=player_embedded&v=r5nB9u4jjy4'									:'r5nB9u4jjy4',
		'http://www.youtube.com/watch?v=t-ZRX8984sc'																:'t-ZRX8984sc',
		'http://youtu.be/t-ZRX8984sc'																				:'t-ZRX8984sc'
		}) */

const zodiacSigns = [
	{name: "Aries", form: "Ram", emoji: "♈", element: "fire"},
	{name: "Taurus", form: "Bull", emoji: "♉", element: "earth"},
	{name: "Gemini", form: "Twins", emoji: "♊", element: "air"},
	{name: "Cancer", form: "Crab", emoji: "♋", element: "water"},
	{name: "Leo", form: "Lion", emoji: "♌", element: "fire"},
	{name: "Virgo", form: "Virgin", emoji: "♍", element: "earth"},
	{name: "Libra", form: "Scales", emoji: "♎", element: "air"},
	{name: "Scorpio", form: "Scorpion", emoji: "♏", element: "water"},
	{name: "Sagittarius", form: "Archer", emoji: "♐", element: "fire"},
	{name: "Capricorn", form: "Goat", emoji: "♑", element: "earth"},
	{name: "Aquarius", form: "Water Bearer", emoji: "♒", element: "air"},
	{name: "Pisces", form: "Fish", emoji: "♓", element: "water"},
];
//https://medium.com/@Saf_Bes/get-the-zodiac-sign-for-a-date-in-javascript-797305d75869
module.exports.zodiac = function (birthday) {
	let sign =
		Number(
			new Intl.DateTimeFormat("fr-TN-u-ca-persian", {
				month: "numeric",
			}).format(Date.now())
		) - 1;
	return zodiacSigns[sign];
};
module.exports.resolveMentions = async function(message,string){
		let guild = message.guild
		//test string
		//"I think we should add <@86890631690977280> to the <@&134362454976102401> role for the channel <#222197033908436994> and here is a random nickname <@!86890631690977280>"
		
		let mentionObj={users:[],roles:[],channels:[],content:string,context:[]}
		
		const usernames = string.match(/<@!?(\d+)>/g); //<@username> mention (or <@!nickname> mention)
		const rolenames = string.match(/<@&(\d+)>/g); //<@&rolename mention>
		const channelnames = string.match(/<#(\d+)>/g); //<#channelname> mention
		
		let promises = null;
		let response = null;
		
		//users
		if(usernames){
			promises = [];
			usernames.forEach(function(id){
				promises.push(guild.users.fetch(id));
			})
			response = await Promise.all(promises);
			mentionObj['user']=response[0];
			mentionObj['usernames']=response
		}
	
		//roles
		if(rolenames){
			promises = [];
			rolenames.forEach(function(id){
				promises.push(guild.roles.fetch(id));
			})
			response = await Promise.all(promises);
			mentionObj['role']=response[0];
			mentionObj['roles']=response
		}
		//channels
		if(channelnames){
			promises = [];
			channelnames.forEach(function(id){
				promises.push(guild.channels.fetch(id));
			})
			response = await Promise.all(promises);
			mentionObj['channel']=response[0];
			mentionObj['channels']=response;
		}
	
		return mentionObj;
	}
	

let playThemeTone = (module.exports.playThemeTone = async function (channel, id, opts) {
	let dir = config.voiceJoinLeave.tones.location;
	let location = id == "default" ? config.voiceJoinLeave.tones.defaultJoinTone : soundMap[id];

	if (Array.isArray(location)) {
		location = _.sample(location);
	}

	if (!location) {
		location = `${id}.mp3`;
	}
	if (location.indexOf("http") != 0) {
		if (dir.indexOf("http") != 0) {
			location = path.resolve(dir, location);
		} else {
			location = `${dir}${location}`;
		}
	}
	if (location.indexOf("http") != 0) {
		try {
			await access(location, constants.F_OK);
		} catch (error) {
			if (id == "default") {
				throw Error("default theme tone not found");
				return;
			}
			return await playThemeTone(channel, "default", opts);
		}
	}

	return await playSound(channel, location, opts);
});

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


const playQueue = new PromiseQueue();
const playSound = (module.exports.playSound = async function (channel, location, opts) {
	playQueue.enqueue(async function (resolve, error) {
		opts = opts || {volume: 0.5};
		if (!channel) {
			resolve("resolved");
			return;
		}

		let hash = getYoutubeHash(location);
		let endTime = parseInt(getParameterByName('end',location));
		endTime = (endTime)?endTime*1000:null; //convert milliseconds to seconds
		let startTime = parseInt(getParameterByName('t',location) || getParameterByName('start',location) ) //not used
		startTime = (startTime)?startTime*1000:null; //convert millseconds to seconds
		console.log("Queing Sound", location, "with hash", hash);
		if (hash) {
			//is youtube link
			location = ytdl(location, {filter: "audioonly"});
			//ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', { quality: 'highestaudio', volume: 0.5})
		} else if (location.indexOf("http") != 0) {
			//is local resource
			try {
				await access(location, constants.F_OK);
			} catch (err) {
				console.error(err);
				error(err);
				return err;
			}
		}

		let dispatcher;
		try {
			//check to see if anyone is in the channel
			if(!channel.members.find(member => !member.user.bot)){
				resolve("resolved: noone in chat to hear sound");
				return
			}
			
			//connect to channel
			if (!channel.joinable) {
				resolve("resolved: "+channel.guild.me.displayName+" not allowed in "+channel.name);
				return
			}
			var connection = await channel.join();
			
			//after connecting check to see if anyone is here to listen
			if(!channel.members.find(member => !member.user.bot)){
				resolve("resolved: noone in chat to hear sound");
				return
			}
			
			
			dispatcher = connection.play(location, {volume: opts.volume});	
			let intervalID = 0;
			if(endTime!=null){
				intervalID = setInterval(function(){
					let time = dispatcher.time||dispatcher.totalStreamTime
					console.log('checking dispatcher.time=',time)
					if(time>endTime){
						dispatcher.end('forcedTimeEnd');
						clearInterval(intervalID);
					}
				},100);
			}
			
			
			dispatcher
				.on("start", () => {
					//channel.leave();
					debug && console.log("Playing Sound", location);
				})
				.on("finish", () => {
					resolve("resolved");
					endTime && clearInterval(intervalID);
					//channel.leave();
				})
				.on("error", (err) => {
					console.error(err);
					error(err);
					endTime && clearInterval(intervalID);
					//channel.leave();
				});
		} catch (err) {
			console.error(err);
			error(err);
			return err;
		}
		//return dispatcher
	});
	return;
});

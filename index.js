const http = require("http");
const fs = require("fs");
const path = require("path");
const BoilerplateClient = require(path.join(__dirname, "/client/BoilerplateClient"));
require("dotenv").config();
const Sentry = require("@sentry/node");
const i18n = require("i18n");
const GUIMessages = require.main.require("./templates/messages");
const util = require.main.require("./util");

const config = require.main.require("./config");

// overall application Logger
const Logger = require.main.require("./util/logger");

const bots = {};

//https://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
// const { readdirSync } = require('fs')
// const getDirectories = source =>
//   readdirSync(source, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => dirent.name);
// const botDirectories = getDirectories('./bots');

// botDirectories.forEach(function(name){
// 	let envVar=name.toUpperCase();
// 	bots[name]=new BoilerplateClient({ owner: process.env.OWNER, token: process.env[`TOKEN_${envVar}`], botPath: `./bots/${name}` });
// })

//you can make multiple bots via creating environment vars in the format of
// TOKEN_SHIPTUNES = '9h8eh5gi8ayfawe'
// TOKEN_SHIPTUNES_1 = '8dno8dskfjai'
// TOKEN_SHIPTUNES_2 = '448sdjslladf'
Object.keys(process.env).forEach(function (key) {
	let split = key.split("_");
	let name = (split[1] || "").toLowerCase();
	if (name && split[0] == "TOKEN") {
		bots[name] = new BoilerplateClient({
			owner: process.env.OWNER,
			token: process.env[key],
			botPath: `./bots/${name}`,
		});
	}
});

function init(client) {
	// Load Logger
	if (process.env.SENTRY_URL) {
		try {
			client.logger.log("Sentry Monitoring Loading...");
			Sentry.init({
				dsn: process.env.SENTRY_URL,
				environment: process.env.NODE_ENV,
			});
			client.logger.info("Sentry Monitoring Loaded and Ready!");
		} catch (e) {
			client.logger.error(e);
		}
	}

	client
		.on("disconnect", () => client.logger.warn("Connection lost..."))
		.on("reconnect", () => client.logger.info("Attempting to reconnect..."))
		.on("error", (err) => {
			console.log("got error on client:");
			client.logger.error(err)
		})
		//.on("debug", console.log)
		.on("warn", (info) => client.logger.warn(info));

	//wakup ping for any activity
	[
		"channelCreate",
		"channelDelete",
		"channelPinsUpdate",
		"channelUpdate",
		//'debug',
		"emojiCreate",
		"emojiDelete",
		"emojiUpdate",
		//'error',
		"guildBanAdd",
		"guildBanRemove",
		"guildCreate",
		"guildDelete",
		"guildIntegrationsUpdate",
		"guildMemberAdd",
		//'guildMemberAvailable',
		"guildMemberRemove",
		//'guildMembersChunk',
		"guildMemberSpeaking",
		"guildMemberUpdate",
		//'guildUnavailable',
		"guildUpdate",
		//'invalidated',
		"inviteCreate",
		"inviteDelete",
		"message",
		"messageDelete",
		"messageDeleteBulk",
		"messageReactionAdd",
		"messageReactionRemove",
		"messageReactionRemoveAll",
		"messageReactionRemoveEmoji",
		"messageUpdate",
		//'presenceUpdate',
		//'rateLimit',
		//'ready',
		"roleCreate",
		"roleDelete",
		"roleUpdate",
		//'shardDisconnect',
		//'shardError',
		//'shardReady',
		//'shardReconnecting',
		//'shardResume',
		//'typingStart',
		//'userUpdate',
		"voiceStateUpdate",
		//'warn',
		"webhookUpdate",
	].forEach(function (event) {
		client.on(event, function () {
			util.wakeupPing("wakeup ping for event:" + event);
		});
	});

	client.start();
}

Object.keys(bots).forEach((name) => {
	init(bots[name]);
});

i18n.configure({
	locales: ["en", "es", "ko", "fr", "tr", "pt_br", "zh_cn", "zh_tw"],
	directory: path.join(__dirname, "locales"),
	defaultLocale: "en",
	objectNotation: true,
	register: global,

	logWarnFn: function (msg) {
		console.log("warn", msg);
	},

	logErrorFn: function (msg) {
		console.log("error", msg);
	},

	missingKeyFn: function (locale, value) {
		return value;
	},

	mustacheConfig: {
		tags: ["{{", "}}"],
		disable: false,
	},
});

//shutdown gracefully and clean up
//Heroku sends SIGTERM when you restart dynos
process
	.on("unhandledRejection", (err, p) => {
		Logger.error("An unhandled promise rejection occured at: Promise");
		console.log(p);
		Logger.stacktrace(err);
	})
	.on("warning", (e) => console.warn(e.stack))
	//now for the shutdown signals
	.on("SIGTERM", shutdown("SIGTERM"))
	.on("SIGINT", shutdown("SIGINT"))
	.on("uncaughtException", shutdown("uncaughtException")); //it is not safe to resume normal operation after 'uncaughtException', because the system becomes corrupted:

function shutdown(signal) {
	return (err) => {
		console.log(`Shutting down with signal: ${signal}`);

		let reason = err;
		switch (signal) {
			case "SIGTERM": //heroku sends sigterm for restarting dynos and sleep
				reason = "Going to sleep or restarting";
				err = "";
			case "SIGINT":
				reason = "Killed";
			//err = '';
			case "uncaughtException":
			default:
				reason = err || "unknown event";
		}

		if (err) {
			console.error("Error:", err.stack || err);
		}

		//if(signal=='uncaughtException'){
		/*
			2021-03-19T08:19:00.635185+00:00 app[web.1]: Shutting down with signal: uncaughtException
			2021-03-19T08:19:00.635303+00:00 app[web.1]: Error: Error: input stream: Status code: 429
			2021-03-19T08:19:00.635304+00:00 app[web.1]:     at ClientRequest.<anonymous> (/app/node_modules/miniget/dist/index.js:204:31)
			2021-03-19T08:19:00.635305+00:00 app[web.1]:     at Object.onceWrapper (events.js:422:26)
			2021-03-19T08:19:00.635305+00:00 app[web.1]:     at ClientRequest.emit (events.js:315:20)
			2021-03-19T08:19:00.635306+00:00 app[web.1]:     at ClientRequest.EventEmitter.emit (domain.js:467:12)
			2021-03-19T08:19:00.635306+00:00 app[web.1]:     at HTTPParser.parserOnIncomingClient (_http_client.js:641:27)
			2021-03-19T08:19:00.635307+00:00 app[web.1]:     at HTTPParser.parserOnHeadersComplete (_http_common.js:126:17)
			2021-03-19T08:19:00.635307+00:00 app[web.1]:     at TLSSocket.socketOnData (_http_client.js:509:22)
			2021-03-19T08:19:00.635308+00:00 app[web.1]:     at TLSSocket.emit (events.js:315:20)
			2021-03-19T08:19:00.635308+00:00 app[web.1]:     at TLSSocket.EventEmitter.emit (domain.js:467:12)
			2021-03-19T08:19:00.635308+00:00 app[web.1]:     at addChunk (internal/streams/readable.js:309:12)
			2021-03-19T08:19:00.635309+00:00 app[web.1]:     at readableAddChunk (internal/streams/readable.js:284:9)
			2021-03-19T08:19:00.635309+00:00 app[web.1]:     at TLSSocket.Readable.push (internal/streams/readable.js:223:10)
			2021-03-19T08:19:00.635310+00:00 app[web.1]:     at TLSWrap.onStreamRead (internal/stream_base_commons.js:188:23)
			2021-03-19T08:19:00.760089+00:00 heroku[web.1]: Process exited with status 1
			2021-03-19T08:19:00.965776+00:00 heroku[web.1]: State changed from up to crashed
			*/
		//}

		// Do logging and user awareness messages
		let shipmod = bots["shipmod"] || bots[Object.keys(bots)[0]]; //get shipmod or any other first defined bot
		shipmod.guilds.cache.forEach(function (guild) {
			//iter guilds
			console.log("checking guild", guild.name, guild.id);
			//guild.members.cache.some(function(member){ //iter members
			// 	if(member.user.bot){ //ignore bots
			// 		return false;
			// 	}
			// 	if(member.voice.serverMute){
			// 		console.log('unServerMuting', member.displayName);
			// 		member.voice.setMute(false); //unmute
			// 	}

			// 	if(member.voice.serverDeaf){
			// 		console.log('unServerDeafening', member.displayName);
			// 		member.voice.setDeaf(false); //undefen
			// 	}
			// }); //end iter members
			let logChannel = guild.channels.resolve(config.actionLogChannel);
			if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
				logChannel.send(`Going to sleep for reason ${reason}`);
			}
		}); //end iter guilds

		//music bots
		let musicBots = [bots["shiptunes"]]; //TODO figure a better way to find all music bots
		musicBots.forEach(function (musicBot) {
			console.log("shutting down music bot");
			musicBot.guilds.cache.forEach(function (guild) {
				//iter guilds
				console.log("shutting down guild" + guild.name);
				let memory = musicBot.memory;
				let player = memory ? memory.get({guild: guild}, "player") : null;
				if (!player) {
					return;
				}
				player.queues &&
					player.queues.forEach(function (queue) {
						console.log("alerting queue with tracks", queue.tracks.length);
						var message = queue.firstMessage;
						if (player.isPlaying(message)) {
							GUIMessages.nowPlaying(message, null, `Music will stop. Reason:${reason}`);
						}
					}); //end iter queues
				let logChannel = guild.channels.resolve(config.actionLogChannel);
				if (logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
					logChannel.send(`Going to sleep for reason ${reason}`);
				}
			}); //end iter guilds
		}); //end iter musicbots

		//clean up clients and disconnect
		Object.keys(bots).forEach((name) => {
			bots[name].destroy();
		});
		return process.exit(err ? 1 : 0);
	}; //end graceful shutdown
} //end shudown Wrapper

(function server() {
	const requestListener = function (req, res) {
		if (req.url == "/heartbeat") {
			res.writeHead(200);
			res.end("Hello, World!");
			return;
		}

		if (req.url == "/") {
			res.redirect('https://shipwa.sh/discord');
		}
		if(req.url='/gueststream'){
			let memory = bots['shipmod'].memory
			if(!memory){
				return res.end('no memory accessable')
			}
			let guest = memory.get({guild: "690661623831986266"}, "gueststream");
			if(!guest){
				return res.end('no guest set')
			}
			guest=guest.user||guest;
			res.end('<html><head><style>html,body,img{margin:0,border:0;width:100%;height:100%}</style></head><body><img src="'+guest.displayAvatarURL()+'"></body></html>')
		}
		if(req.url='/listen'){
			let file = fs.readFileSync(path.join(".", "site", "index.html"), "utf-8");
			res.write(file);
			res.end();
			return;
		}
		if (req.url.indexof("movie") >= 0) {
			let player = bot.memory.get({guild: "690661623831986266"}, "player");
			let queue = player.queues[0];
			let stream = queue.stream;
			stream
				.on("open", function () {
					stream.pipe(res);
				})
				.on("error", function (err) {
					res.end(err);
				});

			//       var fs = require("fs"),
			//       http = require("http"),
			//       url = require("url"),
			//       path = require("path");

			//           var file = path.resolve(__dirname,"movie.mp4");
			//           fs.stat(file, function(err, stats) {
			//             if (err) {
			//               if (err.code === 'ENOENT') {
			//                 // 404 Error if file not found
			//                 return res.sendStatus(404);
			//               }
			//             res.end(err);
			//             }
			//             var range = req.headers.range;
			//             if (!range) {
			//              // 416 Wrong range
			//              return res.sendStatus(416);
			//             }
			//             var positions = range.replace(/bytes=/, "").split("-");
			//             var start = parseInt(positions[0], 10);
			//             var total = stats.size;
			//             var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
			//             var chunksize = (end - start) + 1;

			//             res.writeHead(206, {
			//               "Content-Range": "bytes " + start + "-" + end + "/" + total,
			//               "Accept-Ranges": "bytes",
			//               "Content-Length": chunksize,
			//               "Content-Type": "video/mp4"
			//             });

			//             var stream = fs.createReadStream(file, { start: start, end: end })
			//               .on("open", function() {
			//                 stream.pipe(res);
			//               }).on("error", function(err) {
			//                 res.end(err);
			//               });
			//           }); //fs stat
		}

		var filePath = path.join(".", "site", req.url);
		//       if(filePath.endsWith('/')){
		//         filePath.path.join(filePath,'index.html');
		//       }
		// Browser will autorequest 'localhost:8000/favicon.ico'
		if (!req.url.endsWith("favicon.ico")) {
			let file = fs.readFileSync(filePath, "utf-8");
			res.write(file);
		}
		res.end();
	};

	const server = http.createServer(requestListener);
	server.listen(process.env.PORT || 80);
})();

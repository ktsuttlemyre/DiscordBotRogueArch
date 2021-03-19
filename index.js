const http = require('http');
const fs = require('fs');
const path = require('path');
const BoilerplateClient = require(path.join(__dirname,'/client/BoilerplateClient'));
require('dotenv').config();
const Sentry = require('@sentry/node');
const i18n = require("i18n");

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
Object.keys(process.env).forEach(function(key){
	let split = key.split('_');
	let name=(split[1]||'').toLowerCase();
	if(name && split[0]=='TOKEN'){
		bots[name]=new BoilerplateClient({ owner: process.env.OWNER, token: process.env[key], botPath: `./bots/${name}` });
	}
});

function init(client){
	// Load Logger
	if (process.env.SENTRY_URL) {
		try {
			client.logger.log('Sentry Monitoring Loading...');
			Sentry.init({ dsn: process.env.SENTRY_URL, environment: process.env.NODE_ENV });
			client.logger.info('Sentry Monitoring Loaded and Ready!');
		}
		catch (e) {
			client.logger.error(e);
		}
	}

	client.on('disconnect', () => client.logger.warn('Connection lost...'))
		.on('reconnect', () => client.logger.info('Attempting to reconnect...'))
		.on('error', err => client.logger.error(err))
		.on('warn', info => client.logger.warn(info));
	client.start();
}

Object.keys(bots).forEach(name => {
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
      disable: false
    }
  });

  //shutdown gracefully and clean up 
  //Heroku sends SIGTERM when you restart dynos
process.on('unhandledRejection', err => {
	Object.keys(bots).forEach(name => {
		let client = bots[name];
		client.logger.error('An unhandled promise rejection occured');
		client.logger.stacktrace(err);
	})
   })
  .on('SIGTERM', shutdown('SIGTERM'))
  .on('SIGINT', shutdown('SIGINT'))
  .on('uncaughtException', shutdown('uncaughtException'));

function shutdown(signal) {
    return (err) => {
	console.log(`Shutting down with signal: ${ signal }`);
	if (err){
		console.error('Error:',err.stack || err);
	}

	// do cleanup
	bots['shipmod'].guilds.cache.forEach(function(guild){ //iter guilds
		switch(signal){
			case 'SIGTERM': //heroku sends sigterm for restarting dynos and sleep
			case 'SIGINT':
				guild.members.cache.some(function(member){ //iter members
					if(member.user.bot){ //ignore bots
						return false;
					}
					if(member.voice.serverMute){
						console.log('unServerMuting', member.displayName);
						member.voice.setMute(false); //unmute
					}

					if(member.voice.serverDeaf){
						console.log('unServerDeafening', member.displayName);
						member.voice.setDeaf(false); //undefen
					}
				}); //end iter members
			
			default:
				//TODO!!!! this needs to access the memory of shiptunes
				var memory=bots['shiptunes'].memory
				if(!memory){return}
				var player=memory.get({guild}, 'player');
				if(!player){return}
				var queues=memory.get({guild}, 'queues')||[];
				queues.forEach(function(queue){
					var message = queue.firstMessage
					if(player.isPlaying(message)){
					  common.nowPlaying(message,null,'I have crashed or gone to sleep!')
					}	
				});
		}
      }); //end iter guilds
      if(signal == 'SIGTERM'){
	      return process.exit(0);
      }
      process.exit(err ? 1 : 0);

    };
}//end graceful shutdown


(function server(){
  const requestListener = function (req, res) {

    if(req.url=='/heartbeat'){
         res.writeHead(200);
         res.end('Hello, World!');
         return
    }
    
    if(req.url=='/'){
        let file = fs.readFileSync(path.join('.','site','index.html'),'utf-8')
        res.write(file)
        res.end()
        return
    }
    if(req.url.indexof('movie')>=0){
      let player = bot.memory.get({guild:'690661623831986266'}, 'player');
      let queue = player.queues[0]
      let stream= queue.stream
      stream.on("open", function() {
           stream.pipe(res);
         }).on("error", function(err) {
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
    
    
      var filePath = path.join('.','site',req.url);
//       if(filePath.endsWith('/')){
//         filePath.path.join(filePath,'index.html');
//       }
      // Browser will autorequest 'localhost:8000/favicon.ico'
      if ( !(req.url.endsWith("favicon.ico")) ) {
        let file = fs.readFileSync(filePath,'utf-8')
        res.write(file)
      }
      res.end();
    
  }

  const server = http.createServer(requestListener);
  server.listen(process.env.PORT||80);
})();

const _ = require('lodash');

exports.reactions={	      
	      upvote:'✅',
	      downvote:'❌',
	      shipwash:'802028980739768320'
	     }
exports.defaultAvatar='https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png';

exports.permalinkMessage=function(guild,channel,message){
  return `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`;
}

exports.filterInPlace=function (a, condition) {
  let i = 0, j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
}

//https://www.fileformat.info/info/unicode/char/search.htm?q=block&preview=entity
//example
//progressString('vertical-block',40);
var bars={
	"vertical-bar":[
		{"name":"Zero",							"unicode":"",		"glyph":"▕  ▏", "percent":0},
		{"name":"LOWER ONE EIGHTH BLOCK",		"unicode":"U+2581",	"glyph":"▕▁▏", "percent":12.5},
		{"name":"LOWER ONE QUARTER BLOCK",		"unicode":"U+2582",	"glyph":"▕▂▏", "percent":25},
		{"name":"LOWER THREE EIGHTHS BLOCK",	"unicode":"U+2583",	"glyph":"▕▃▏", "percent":37.5},
		{"name":"LOWER HALF BLOCK",		"unicode":"U+2584",	"glyph":"▕▄▄▏", "percent":50},
		{"name":"LOWER FIVE EIGHTHS BLOCK",		"unicode":"U+2585",	"glyph":"▕▅▏", "percent":62.5},
		{"name":"LOWER THREE QUARTERS BLOCk",	"unicode":"U+2586",	"glyph":"▕▆▏", "percent":75},
		{"name":"LOWER SEVEN EIGHTHS BLOCK",	"unicode":"U+2587",	"glyph":"▕▇▏", "percent":87.5},
		{"name":"FULL BLOCK",					"unicode":"U+2588",	"glyph":" ██", "percent":100},
	]
}
exports.progressString=function progressString(type,percent){
	for(var i=0,l=bars[type].length;i<l;i++){
		var entry=bars[type][i]
		if(entry.percent>=percent){
			return entry.glyph
		}
	}

}

exports.randomMusicEmoji=function(){
	return _.sample['🎵','🎶','🎼']
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
		
exports.fetchMessages = async function fetchMessages(channel, options, callback) {
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

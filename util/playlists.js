const fetch = require("node-fetch");
const util = require.main.require("./util");


var g = function(json){
	let youtubeLinks=[]  
	let text = JSON.stringify(json,null,2).replace(/(\r\n|\n|\r)/gm,"\n");
	if(text){
	text=text.split(/\s+/);
		//console.log("text",text)
		text.forEach(function(word){
			if(word.length<11){
				return
			}
			let youtube = util.getYoutubeHash(word);
			if(youtube){
				youtubeLinks.push(youtube);
			}
		}); //forEach
	}
	return youtubeLinks;
}


module.exports.fetchShift = async function fetchMessages(channel, options) {
	if(typeof options == 'function'){
		//callback=options
		options={}
	}
	let opts={limit:20};

	let loadedAllMessages = false; //denote all messages are loaded

	let gIndex=0;
	let gOffset=0;
	let nBuffer=5;

	const array = [];

	return function(){
		return new Promise(async (resolve) => {
			let index=gIndex+gOffset;
			
			let messagesArray = [];
			if(!loadedAllMessages && index>array.length-nBuffer){ //if we have messages on the server and getting close to buffer then
				//https://discord.js.org/#/docs/main/master/class/MessageManager?scrollTo=fetch
				let messages = await channel.messages.fetch(opts,false,true);
				//console.log('fetched messages',messages.length)
				messagesArray = messages.array();
				if(!messagesArray.length){
					loadedAllMessages=true;
				}else{
					array.push.apply(array,messagesArray);
					opts.before = messagesArray[(messagesArray.length - 1)].id
				}
			}
			console.log('processing tick');
			
			if(loadedAllMessages && index>array.length){ //no more results. return nothing free memory
				array.length = 0
				array = null;
				return resolve(undefined);
			}
			
			console.log('calling callback with',index,gIndex)
			let response = array[index]; //await callback(array[index], index, array, gIndex);

			index++;
			gIndex++;

			//test length and delete the beginning of the array to clean up
			if(array.length>(nBuffer*2)+1){
				let remove = array.length-((nBuffer*2)+1);
				gOffset-= remove;  //array.length-(nBuffer)
				array.splice(0,remove);	
			}

			resolve(response);
			});
		}
	}

//https://www.reddit.com/dev/api#GET_new
var subredditBatch = module.exports.subredditBatch = function(subreddit,sort){
	sort=(sort||'new').toLowerCase();
	if(Array.isArray(subreddit)){
		subreddit=subreddit.join('+');
	}
	let url = `https://api.reddit.com/r/${subreddit}/${sort}.json?limit=100`;
	if(before){
		url+'&before='+before;
	}
	return new Promise(resolve => {
		fetch(url) //?sort=top&t=day&limit=1`)
			.then(response => response.json())
			.then(response => resolve(response));
	});
}


// var playlistPool = await fetchSubreddit('lofi');


// player.queue.on('end',function(){
// 	var url = fetcher()
// 	player.play(url)
// }

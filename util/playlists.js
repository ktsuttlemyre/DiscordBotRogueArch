const fetch = require("node-fetch");



function(json){
	let youtubeLinks=[]  
	let text = JSON.stringify(json,null,2).replace(/(\r\n|\n|\r)/gm,"\n");
	if(text){
	text=text.split(/\s+/);
		//console.log("text",text)
		text.forEach(function(word){
			if(word.length<11){
				return
			}
			let youtube = web.getYoutubeHash(word);
			if(youtube){
				youtubeLinks.push(youtube);
			}
		}); //forEach
	}
	return youtubeLinks;
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



module.exports.subredditPool = async function fetchMessages(subreddit, options, callback) {
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

		let _fetchMessages=async function(resolve){
			if(breakOut){return resolve('resolved');}
			//https://discord.js.org/#/docs/main/master/class/MessageManager?scrollTo=fetch
			await subredditBatch(subreddit,sort,before,function(messages){ 
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
			_fetchMessages(resolve);
		});
	}





var playlistPool = await fetchSubreddit('lofi');


player.queue.on('end',function(){
	var url = fetcher()
	player.play(url)
}

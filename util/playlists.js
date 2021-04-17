const fetch = require("node-fetch");
const util = require.main.require("./util");


let g = function(json){
	//console.log('json',json);
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


module.exports.fetchShift = function (subreddit, options) {
	if(typeof options == 'function'){
		//callback=options
		options={}
	}
	let opts={limit:20};

	let loadedAllItemss = false; //denote all items are loaded

	let gIndex=0;
	let gOffset=0;
	let nBuffer=5;

	const items = [];

	return function(){
		return new Promise(async (resolve) => {
			let index=gIndex+gOffset;
			
			let itemsResponse = null;;
			if(!loadedAllItemss && index>items.length-nBuffer){ //if we have items on the server and getting close to buffer then
				itemsResponse = await subredditBatch(subreddit,opts);
				if(!itemsResponse || !itemsResponse.data || !itemsResponse.data.children || !itemsResponse.data.children.length){
					loadedAllItems=true;
				}else{
					items.push.apply(items,itemsResponse.data.children);
					opts.before = itemsRepsonse.data.after //itemsResponse[(itemsResponse.length - 1)].id
				}
			}
			console.log('processing tick');
			
			if(loadedAllItems && index>items.length){ //no more results. return nothing free memory
				items.length = 0
				items = null;
				return resolve(undefined);
			}
			
			console.log('calling callback with',index,gIndex)
			console.log('itemsResponse',itemsResponse)
			console.log('items',items)
			
			let response = g(items[index])[0]; //await callback(items[index], index, items, gIndex);
			
			index++;
			gIndex++;

			//test length and delete the beginning of the items to clean up
			if(items.length>(nBuffer*2)+1){
				let remove = items.length-((nBuffer*2)+1);
				gOffset-= remove;  //items.length-(nBuffer)
				items.splice(0,remove);	
			}

			resolve(response);
			});
		}
	}

//https://www.reddit.com/dev/api#GET_new
let subredditBatch = module.exports.subredditBatch = function(subreddit,opts){
	opts = opts || {};
	opts.sort=(opts.sort||'new').toLowerCase(); //default to new and lowercase all sort
	opts.before = opts.before || ''
	
	if(Array.isArray(subreddit)){ //turn arry into string
		subreddit=subreddit.join('+');
	}
	let url = `https://api.reddit.com/r/${subreddit}/${opts.sort}.json?limit=100`;
	if(opts.before){
		url+'&before='+opts.before;
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

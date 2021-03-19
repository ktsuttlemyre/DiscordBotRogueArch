const fetch = require("node-fetch");

//https://www.reddit.com/dev/api#GET_new
module.exports.subredditArray = function(subreddit,sort,before,callback){
  if(typeof before == 'function'){
    callback=before;
    before='';
  } 
  sort=(sort||'new').toLowerCase();
  if(Array.isArray(subreddit)){
    subreddit=subreddit.join('+');
  }
  return fetch(`https://api.reddit.com/r/${subreddit}/${sort}.json?limit=100`) //?sort=top&t=day&limit=1`)
    .then(response => response.json())
    .then(response => function(json){
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
    });
}






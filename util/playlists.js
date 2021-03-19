const fetch = require("node-fetch");

//https://www.reddit.com/dev/api#GET_new
let 
module.exports.subreddit = function(subreddit,sort,before,callback){
  if(typeof before == 'function'){
    callback=before;
    before='';
  } 
  sort=(sort||'new').toLowerCase();
  if(Array.isArray(subreddit)){
    subreddit=subreddit.join('+');
  }
  return fetch(`https://api.reddit.com/r/${subreddit}/${sort}.json?limit=100`); //?sort=top&t=day&limit=1`)
    .then(response => response.json())
    .then(response => callback);
}

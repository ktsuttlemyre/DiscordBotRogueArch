//a subset of web.js from 
//https://github.com/ktsuttlemyre/WebJS/blob/master/web.js

let web = {}

		web.RegExp={alphabetical:/[a-zA-Z]/g
					,majorAtoms:/[a-gi-zA-GI-Z]/g
					,commaSeperatedTrimSplit:/\s*,\s*/
					,blockQuotes:/\*.*\*/
					,leadingWhitespace:/^\s+/
					,trailingWhitespace:/\s+$/
					,getYoutubeHash:/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|watch\/)([^#\&\?]*).*/
					//				/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
					//Char syntax	(ignore) (assign(no &)) optional
					,queryStringParser:/([^?=&]+)(=([^&]*))?/g
					,partitonAlphaNumericalNegitives:/[-\d.]+|(([^\s\d])((?!\d)))+|([^\s\d])+/g
					,partitonAlphaNumerical:/[-\d.]+|([^\s\d])+/g
					,validate:{
						zipCode:/(^\d{5}$)|(^\d{5}-\d{4}$)/
						,JSASCIIIdentifier:/^[a-zA-Z_$][0-9a-zA-Z_$]*$/
						,YoutubeHash:/^[a-zA-Z0-9_-]{11}$/
					}
				}



		web.isValue=function(o){
			return o!=null;
		}

		//TODO validate
		//http://stackoverflow.com/questions/2742813/how-to-validate-youtube-video-ids

		//http://stackoverflow.com/questions/3717115/regular-expression-for-youtube-links
		//inspiration: http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		web.getYoutubeHash=function(url){
			if(!url){return ''}
			if(web.contains('/user/')){console.warn('skipping a youtube user page')}
			var match = url.match(web.RegExp.getYoutubeHash);
			var hash=(match)?match[2].trim():'';
			if(web.RegExp.validate.YoutubeHash.test(hash)){
				return hash;
			}else if(web.startsWith(hash,'v=')){
				return hash.slice(2)
			}else if(web.endsWith(hash,'/')){
				return hash.slice(0,-1)
			}else{ //now we will either just get the u= variable or the v= variablel //in that order yeah it isn't right but I do it
				//http://www.youtube.com/attribution_link?a=5X4P22YNTKU&amp;u=%2Fwatch%3Fv%3DT2NUk5AFImw%26feature%3Dshare
				var v = web.queryString(web.queryString(web.unescapeHTML(url),'u')||web.unescapeHTML(url),'v') 
				if(v&&web.RegExp.validate.YoutubeHash.test(v)){
					return v
				}else{ //just trim off the url and see if the value is at the end of the url
					v = web.deepTrimLeft(url,'/')
					if(v&&web.RegExp.validate.YoutubeHash.test(v)){
						return v
					}else{
						if(!(/[\W]/).test(v)){
							v = v.slice(0,11)
							console.warn("truncating youtube hash from expected youtube url "+url+' hashvalue =\''+hash+'\' length'+hash.length);
							return v
						}
					}
				}
			}
			console.warn("Possible incorect hash from expected youtube url "+url+' hashvalue =\''+hash+'\' length'+hash.length);
			return hash
		};
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


		//to use as seen in web.pubSub
		//blocking = varSwap(namespace, namespace = blocking)
		//Inspiration http://stackoverflow.com/questions/16201656/how-to-swap-two-variables-in-javascript
		//http://jsperf.com/swap-array-vs-variable/18
		//Example: b=varSwap(a,a=b)
		var varSwap=web.varSwap=function(x){
			return x;
		}
		web.isRegExp=function(o){
			return o instanceof RegExp
		}

		web.not=function(fn){
			if(web.isFunction(fn)){
				return function(){!fn}
			}else{ //maybe dont do this?
				return !fn
			}
		}
		//web.trimStart('    butter scotch berry scout  ') =>  'butter scotch berry scout  '
		//web.trimStart('    butter scotch berry scout  ',6) => 'tter scotch berry scout  '
		//web.trimStart('    butter scotch berry scout  ','sc') => 'otch berry scout  '
		//web.trimStart('    butter scotch berty scout  ','sc',true) => 'scotch berry scout  '
		//web.trimStart('    butter scotch berry scout  ','sc',2) => 'out  '
		//web.trimStart('    butter scotch berry scout  ','sc',2,true) => 'scout  '
		//web.trimStart('    butter scotch berry scout  ','sc',-2,) => 'otch berry scout  '
		//web.trimStart('    butter scotch berry scout  ','sc',-2,true) => 'scotch berry scout  '

		//strict counting (consume whole string if we are not satisfied)
		//web.trimStart('    butter scotch berry scout  ','sc','3=') => ''
		//loose counting (take what you can get)
		//web.trimStart('    butter scotch berry scout  ','sc','3<') => 'out  '
		//all or none (match instance count or return string) //numbers act this way by default
		//web.trimStart('    butter scotch berry scout  ','sc','3!') => '    butter scotch berry scout  '

		//if instance is positive count starting from start
		//if instance is negitive count starting from end
		web.trimStart=function(str,word,instance,keepMatchChars){ // instance=-1=deep negitive numbers count from lastindexof
			if(!word){ //then trim start whitespace
				return str.replace(web.RegExp.leadingWhitespace, '');
			}

			var countType;
			if(web.isString(instance)){ //instance expected to be a number 5 (strict) or '5<' (loose count) or '5!' (n or no trim)
				countType=instance.charAt(instance.length-1)
				instance=parseFloat(instance)
			}
			countType=countType||'!'; //set counttype default value 

			if(instance==null){
				instance=1
			}

	
			var type = typeof word;
			if(type=='string'){
				//TODO turn this code into web.indexOf()
				var i,h,direction=(instance<0)?1:-1;
				while(instance!=0){
					h=i
					i=(instance<0)?str.lastIndexOf(word):str.indexOf(word);
					if(i<0){ //was not found
						if(countType=='<'){ //return last answer or '' if instances where more than found ins tring
							i=h
							break
						}else if(countType=='='){
							return ''
						}else if(countType=='!'){
							return str
						}else{
							throw 'error countType in trimStart is unknown symbol'+countType
						}
					}
					instance=instance+direction
				}//end while
				//end of web.indexOf
				str=str.slice( i + ((keepMatchChars)?0:word.length))
			}else if(type=='number'){
				return str.slice(word)
			}else if(web.isRegExp(word)){
				throw 'Not implmented because idk how it should work'
				// var index=0;
				// return str.replace(word,function(match,offset,str){
				// 	if(index==-1){return match}
				// 	if(offset==index){
				// 		//this will run as long as we find expected indexes
				// 	}
				// })
			}else if(type=='function'){
				var n = 0
				while(n<str.length){
					if(!word(str.charAt(n))){
						return str.slice(n)
					}
					n++
				}
			}
			return str
		}
		web.trimEnd=function(str,word,instance,keepMatchChars){
			if(!word){
				//todo faster implementation for long strings
				return str.replace(web.RegExp.trailingWhitespace, '');
			}
			var countType;
			if(web.isString(instance)){ //instance expected to be a number 5 (strict) or '5<' (loose count) or '5!' (n or no trim)
				countType=instance.charAt(instance.length-1)
				instance=parseFloat(instance)
			}
			countType=countType||'!'; //set counttype default value 

			if(instance==null){
				instance=1
			}

			var type = typeof word;
			if(type=='string'){
				//TODO turn this code into web.indexOf()
				var i,h,direction=(instance<0)?1:-1;
				while(instance!=0){
					h=i
					i=(instance<0)?str.lastIndexOf(word):str.indexOf(word);
					if(i<0){ //was not found
						if(countType=='<'){ //return last answer or '' if instances where more than found ins tring
							i=h
							break
						}else if(countType=='='){
							return ''
						}else if(countType=='!'){
							return str
						}else{
							throw 'error countType in trimEnd is unknown symbol'+countType
						}
					}
					instance=instance+direction
				}//end while
				//end of web.indexOf
				str= str.slice( 0, (i + ((keepMatchChars)?word.length:0)))
			}else if(type=='number'){
				return str.slice(0,word)
			}else if(web.isRegExp(word)){
				throw 'Not implmented because idk how it should work'
			}
			return str
		}


		//TODO add regular expression that trims characters that test positive for regexp
		web.trimLeft=function(str,word,keep,deep){
			web.depricated('use web.trimStart')
			if(!word){
				return str.replace(web.RegExp.leadingWhitespace, '');
			}
			var type = typeof word;
			if(type=='string'){
				var i=((deep)?str.lastIndexOf(word):str.indexOf(word))
				if(i<0){return str;}
				return str.slice( i + ((keep)?0:word.length))
			}
			if(type=='number'){
				return str.slice(Math.abs(word))
			}
			if(web.isRegExp(str)){
				throw 'Not implmented because idk how it should work'
				// var index=0;
				// return str.replace(str,function(match,offset,str){
				// 	if(index==-1){return match}
				// 	if(offset==index){
				// 		//this will run as long as we find expected indexes
				// 	}
				// })
			}
		}
		web.trimRight=function(str,word,keep,deep){ //TODO make deep not boolean but rather number. so we can choose to cut at the 4th instance of a character etc
			web.depricated('use web.trimEnd')
			if(!word){
				//todo faster implementation for long strings
				return str.replace(web.RegExp.trailingWhitespace, '');
			}
			var type = typeof word;
			if(type=='string'){
				var i = ((deep)?str.indexOf(word):str.lastIndexOf(word))
				if(i<0){return str;}
				return str.slice( 0, i + ((keep)?word.length:0))
			}
			if(type=='number'){
				return str.slice(0,-Math.abs(word))
			}
			if(web.isRegExp(str)){
				throw 'Not implmented because idk how it should work'
			}

		}
		web.deepTrimRight=function(str,word,keep){ //todo possible rename to slash? maybe confusing though
			return web.trimRight(str,word,keep,true)
		}
		web.deepTrimLeft=function(str,word,keep){
			return web.trimLeft(str,word,keep,true)
		}

		web.trim=function(str){
			//todo faster implementatoins
			//http://blog.stevenlevithan.com/archives/faster-trim-javascript
			//http://yesudeep.wordpress.com/2009/07/31/even-faster-string-prototype-trim-implementation-in-javascript/
			if(web.isArray(trim)){
				for(var i=0,l=str.length;i<l;i++){
					str[i]=str[i].trim()
				}
				return str;
			}
			return str.trim()

		}
		/*tests
		web.trimLeft('#JustGirlThings','Girl')
		"Things"
		web.trimLeft('#JustGirlThings','Girl',true)
		"GirlThings"
		web.trimRight('#JustGirlThings','Girl')
		"#Just"
		web.trimRight('#JustGirlThings','Girl',true)
		"#JustGirl"*/



		/*
		NOTE: if you want to process the querystring alone it should start with a '?'
		In browser:
			() returns query object (a hashmap of values. if mutli values are found returns them as an array)
			(url [String]) returns query object
			(url [String], variable[value]) returns that variable value.
			(url [undefined||String], variable[value]) like above url is location.href
			(url [undefined||String], variable[value], replace[value]) variable will be replaced in url and returned
		In NodeJS:
			()returns arguments as object
		*/
		web.queryString=function(url,variable,replace) {
			var query;
			//if(!web.isValue(variable) && !web.isValue(replace)){
			//	variable = varSwap(url, url=variable);//catch url on the next check
			//}
			if(!url){
				if(web.isNode()){
					return require('minimist')(process.argv.slice(2));
				}
				url=web.global.location.href
				query=web.global.location.search.substring(1);
			}else{
				query=web.trimLeft(url,'?') //don't keep ? this time
			}

			query = web.deepTrimRight(query,'#')

			if(web.isValue(replace)){ //http://stackoverflow.com/questions/5413899/search-and-replace-specific-query-string-parameter-value-in-javascript
				return url.replace(new RegExp('('+variable+'=)[^\&]+'), '$1' + encodeURIComponent(replace));
			}else if(web.isValue(variable)){ //http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
				var vars = query.split('&');
				for (var i = 0; i < vars.length; i++) {
					var pair = vars[i].split('=');
					if (decodeURIComponent(pair[0]) == variable) {
						return decodeURIComponent(pair[1]);
					}
				}
				return ''
				//console.warn('web.queryString did not find variable %s in %s', variable,url);
			}else{ //inspiration http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
							/*the browser does a simple trim left.
								test http://127.0.0.1:1234/IDMetabolite.html?ggks=6h=%22s#dfs"#lkjsdf=9
								location.search
								"?ggks=6h=%22s"
								location.hash
								"#dfs"#lkjsdf=9"
								*/
				return queryStringParser(query)
			}
		}


		var queryStringParser=function(value /*,assignment,delimiter */){ //setting assigment and delimiter not really good
			var q={}
			value.replace(web.RegExp.queryStringParser
				,function($0, $1, $2, $3) { 
					if(q[$1]){
						if(web.isArray(q[$1])){
							q[$1].push(decodeURIComponent($3));
						}else{
							q[$1]=[q[$1],decodeURIComponent($3)]
						}
					}else{
						q[$1]=decodeURIComponent($3); 
					}
					return ''
				});
			return q;
		}

		web.isSecure=function(){
			return location.protocol === 'https:'
		}

	web.urlAddProtocol=function(url){
		web.depricated('web.urlAddProtocol will be depricated soon and will be integrated to web.url')
		var protocol = window.location.protocol||'http:'
		if(web.startsWith(url,'//')){
			url=protocol+url
		}else if(! (web.startsWith(url,'http://')||web.startsWith(url,'https://'))){
			url=protocol+'//'+url
		}
		return url
	}

	web.toAbsoluteURL= function(url){ //TODO any callls to this web.toAbsoulteURL should use toAbsoluteURL if they are within web.js closure or use web.url if they are outside (aka in a project)
		web.depricated('web.toAbsoluteURL will be depricated soon and will be integrated to web.url')
		return toAbsoluteURL(url)
	}
	var toAbsoluteURL =	function(url) { //TODO update or remove this
		if(!url){return} //url||location.href; i dont think i should do this just return undefined

		//if already absolute then return
		if((/^\w+:\/\//).test(url)){
			return url
		}
		if(document){//if browser then use this
			var link = document.createElement("a");
			link.href = url;
			return (link.protocol+"//"+link.host+link.pathname+link.search+link.hash);
		}else{
			//inspiration http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
			var stack = url.split("/")
			if(url.slice(0,2)=='//'){
				return stack.shift()+url
			}else if(url.charAt(0)=='/'){
				return web.origin()+url
			}
			var parts = url.split("/");

			stack.pop(); // remove current file name (or empty string)
						 // (omit if "base" is the current folder without trailing slash)
			for (var i=0; i<parts.length; i++) {
				if (parts[i] == ".")
					continue;
				if (parts[i] == "..")
					stack.pop();
				else
					stack.push(parts[i]);
			}
			return stack.join("/");
		}
	}

	var plusEncodeMap={'0':' ','b':'+'}
	var plusDecodeMap={' ':'0','+':'b'}
	web.formURLEncode=web.plusEncode=function(s){
		return encodeURIComponent(s).replace(/%2(0|b)/g, function(match,group1,index,str){
			return plusEncodeMap[group1]
		})
	}
	web.formURLDecode=web.plusDecode=function(s){
		s= s.replace(/\ +|\ /g, function(match,index,str){
			return '%2'+plusEncodeMap[match]
		})
		return decodeURIComponent(s)
	}

		//TODO
		//http://127.0.0.1:1234/IDMetabolite.html?ggks=6h=%22s#dfs"#lkjsdf=9
		/*
		{
		'protocol':						//not implemented
		'://':								//not implemented
		'hostname':
		'.'
		'domain':						//not implemented
		'//':							//not implemented
		'port':							//not implemented
		':'								//not implemented
		'path':							//not implemented
		'/':							//not implemented
		'query':						//not implemented
		'?':{key:'value',pairs:true}
		'fragement':					//not implemented
		'#':'bare word'					//not implemented
		'fragmentPath':					//not implemented
		'#!':							//not implemented
		'fragmentQuery':				//not implemented
		'#?':{key:'value',pairs:true}
		'@'
		}
		*/
		//currently only returns object with ? and # 


		web.url=function(url,cmd1,cmd2){
			//handle file drop (file drop object convert to native file object)
			if(web.instanceOf(url,fd&&fd.File)){
				url=url.nativeFile
			}

			url=(url==='')?'':(url||web.global.location.href)
			if(!web.isString(url)){ //if(type=='Location'){url=url.href}

				this.resource=url

				url=this.resource.href
				url=this.resource.src||url
				url=this.resource.toString()

				if(!url){
					throw 'error creating url'
				}
			}
			var rawURL=url;

			url = toAbsoluteURL(url)


			if(cmd1){
				cmd1=cmd1.toUpperCase && cmd1.toUpperCase()
				//handle native (browser) file
				if(web.instanceOf(url,window.File)||web.instanceOf(url,window.Blob)){
					if(web.startsWith(cmd1,'data',true)){ //todo figure out what this should be called. just take anything as true
						return web.toDataURI(url)
					}else{
						return URL.createObjectURL(url)
					}
				}


				if(cmd1=='DOMAIN'){
					return web.url.prototype.domain.call(url)
				}else if(cmd1=='PROTOCOL'){
					return web.url.prototype.protocol.call(url)
				}else if(cmd1=='SAMEORIGIN'){
					return (web.url(url,'domain')==web.url(cmd2,'domain'))
				}else if(cmd1=='BASE'){
					console.warn('base no longer has trailing /')
					return location.protocol + "//" + location.hostname + (location.port && ":" + location.port);
				}else if(web.startsWith(cmd1,'data')){
					if(web.isURL(url)){
						return web.toDataURI('<html><meta http-equiv="Refresh" content="0; url='+url+'"></html>','text/html')
					}else{
						web.toDataURI(url)
					}
				}
			}
			

			if(!(this instanceof web.url)){return new web.url(url,cmd1,cmd2)}





			// if(web.isObject(cmd1)){
			// 		url.addSearch(queryData);
			// 	if(web.isObject(cmd2)){
			// 		url.addFragment(hashData);
			// 	}
			// }


			var uri = new URI(url)




			url = /*web.unescapeHTML(*/ uri.toString() //) //idk if web.unescapeHTML should be a part of this?


			this.url=url

								/*the browser does a simple trim left.
									test http://127.0.0.1:1234/IDMetabolite.html?ggks=6h=%22s#dfs"#lkjsdf=9
									location.search
									"?ggks=6h=%22s"
									location.hash
									"#dfs"#lkjsdf=9"
									*/
			this.apply=function(part,data,replace){ //TODO implement replace
							if(part===''){
								throw 'not implmented'
							}else if (part=="//"){
								throw 'not implmented'
							}else if (part==":"){
								throw 'not implmented'
							}else if (part=="/"){
								throw 'not implemented'
							}else if(part=='?'){
								this.url = uri.addSearch(data).toString()
								this['?']=queryStringParser(web.deepTrimRight(web.trimLeft(this.url,'?'),'#'))  //NOTE this is how the browser does it!	
							}else if(part=='#'){
								throw 'not implmented'
							}else if(part=='#?'){
								this.url = uri.addFragment(data).toString()
								this['#?']=queryStringParser(web.trimLeft(this.url,'#')) //NOTE this is how the browser does it!	//'?'+location.hash.slice(1) //added a ? just to make parsing easier
							}else if(part=='#!'){
								throw 'not implemented'
							}else{

							}
							return this
						}
			this.replace=function(part,data){
							return this.apply(part,data,true)
						}
			this.remove=function(part){
							return this.apply(part,'',true)
						}
			this.request=function(type,callback){ //TODO add options
				if(web.isFunction(type)){
					callback=type
					type='GET'
				}
				type=type.toUpperCase()
				if(type=='GET'){
					return $.get(this.url.toString(),callback)
				}else if(type=='POST'){
					return $.post(this.url.toString(),callback)
				}else if(type=='PUT'){
					throw 'Not implemented'
					return 
				}else if(type=='DELETE'){
					throw 'Not implemented'
					return 
				}
			}


			this['?']=queryStringParser(web.trimEnd(web.trimStart(url,'?'),'#',-1)) //web.deepTrimRight(web.trimLeft(url,'?'),'#')

			this['#?']=queryStringParser(web.trimStart(url,'#'))
			this['//']=web.url(url,'domain')


			if(uri['//']=='youtube.com'||uri['//']=='youtu.be'){
				uri.slug=web.getYoutubeHash(url.toString())
				return uri
			}

			url = undefined
		}
		web.url.prototype.toString=function(){
			return this.url.toString()
		}
		web.url.prototype.valueOf=function(){
			return this.url.toString()
		}
		web.url.prototype.domain=function(set){
			var url=this.url||this //(web.isString(this):this:this.url
			if(set){
				url = this.URI || new URI(url)
				url.domain(set)
				return this
			}
			//http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
			url=url.toString()
			var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
			return (matches && matches[1])||new URI(url).domain();  // domain will be null if no match is found
		}
		web.url.prototype.port=function(set){
			var url=this.url||this //(web.isString(this):this:this.url
			url = this.URI || new URI(url)
			if(set){
				url.port(set)
				return this
			}
			return url.port()
		}
		web.url.prototype.path=function(set){
			var url=this.url||this //(web.isString(this):this:this.url
			url = this.URI || new URI(url)
			if(set){
				url.path(set)
				return this
			}
			return url.path()
		}
// 		web.baseURL=location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/"; //web.url(null,'BASE')
// 		web.base=function(){
// 			return web.url(web.baseURL)
// 		}

		web.Object=web.Object||{};
		web.Object.putAdd=function(obj,key,value){
			obj[key]=(obj[key]!==undefined)?obj[key]+value:value;
			return obj;
		}

		/*
		see if an object equals any of the other types
		*/
		web.isA=function(obj,arg0,arg1,arg2,arg3,arg4){
			var args=(type( arg0 ) === 'Array')?arg0:[arg0,arg1,arg2,arg3,arg4];

			return args.some(function(e){
				return (typeof e == 'string')?typeof obj == e:obj instanceof e;
			})
		}


		web.join=function(delimiter /*args*/){
			var string='';
			delimiter=Array.prototype.shift.call(arguments)
			var last=Array.prototype.pop.call(arguments)
			if(typeof delimiter =='string'){
				for(var i=0,l=arguments.length;i<l;i++){
					string+=arguments[i]+delimiter;
				}
				return string+last;
			}

		}
		web.toDataString=function(str,fallback){
			var dataString= (str==null)?fallback:str.toString();
			return dataString
		}




		web.onlyOne=function(target,silentForce){
			return (target.length==1||silentForce)?
					target[0]:
					console.error("Expected to get only one ouput for the array",target)
		}
		web.top=function(){
			
		}
		var containsBank={} //TODO ensure this does not get too big!
		web.contains=function(str,word,caseInsensitive){ //
			if(!str){
				return false
			}
			if(caseInsensitive){
				if(web.isString(word)){
					var bank = containsBank[word]
					if(!bank){ //Using reg-ex because http://jsperf.com/case-sensitive-regex-vs-case-insensitive-regex/3
						word = containsBank[word]=new RegExp(word,'i')
					}else{
						word=bank
					}
				}
				return word.test(str) //str.search(word)>=0   //http://jsperf.com/regexp-test-vs-match-m5/4
			}
			if(!web.isString(str)){
				str = web.toString(str)	
			}
			return (str.indexOf(word)>=0)
		}
		web.equalsWord=function(str,word,caseInsensitive){
			if(str.length==word.length){ //Using reg-ex because http://jsperf.com/case-sensitive-regex-vs-case-insensitive-regex/3
				return web.contains(str,word,caseInsensitive)
			}
		}

		var startsWith=function(str,prefix,caseInsensitive){ //note calling this externally helps prevent recursive array searching on prefix
			if(str&&prefix&&web.isString(str)){
				if(caseInsensitive){
					str=str.toLowerCase()
					prefix=prefix.toLowerCase();
				}
				if(str.length==prefix.length){
					return str==prefix
				}
				return str.slice(0, prefix.length) == prefix; //does chop string but shouldnt iterate though whole string
			}
		}
		web.startsWith=function(str,prefix,caseInsensitive,ignoreWhitespace){
			str=(ignoreWhitespace)?str.trim():str;
			if(web.isArray(prefix)){
				for(var i=0,l=prefix.length;i<l;i++){
					if(startsWith(str,prefix[i],caseInsensitive)){
						return true
					}
				}
				return false
			}
			return startsWith(str,prefix,caseInsensitive)
		};

		var endsWith=function(str,suffix,caseInsensitive){ //note calling this externally helps prevent recursive array searching on prefix
			if(str&&suffix){
				if(caseInsensitive){
					str=str.toLowerCase()
					suffix=suffix.toLowerCase();
				}
				if(str.length==suffix.length){
					return str==suffix
				}
				//return str.slice(0, prefix.length) == prefix;
				return str.indexOf(suffix, str.length - suffix.length) !== -1; //does not chop up string. should be faster
			}
		}

		web.endsWith=function(str,suffix,caseInsensitive,ignoreWhitespace) {
			str=(ignoreWhitespace)?str.trim():str;
			if(web.isArray(suffix)){
				for(var i=0,l=suffix.length;i<l;i++){
					if(endsWith(str,suffix[i],caseInsensitive)){
						return true
					}
				}
				return false
			}
			return endsWith(str,suffix,caseInsensitive)
		};

		web.caseInsensitive=function(w,w2){
			return w.toUpperCase()==w2.toUpperCase()
		}



		//TODO cache will definately help
		web.isArrayHash=function(obj,level){
			if(!level){
				web.isArray(obj) && obj.every(function(o){return web.isObject(o)})
			}
			return (web.isArray(obj) && web.isObject(obj[0]) && web.isObject(obj[web.toInt(obj.length/2)]) && web.isObject(obj[obj.length-1]))
		}
		web.isArrayMatix=function(obj,level){
			if(!level){
				web.isArray(obj) && obj.every(function(o){return web.isArray(o)})
			}
			return (web.isArray(obj) && web.isArray(obj[0]) && web.isArray(obj[web.toInt(obj.length/2)]) && web.isArray(obj[obj.length-1]))
		}

		//http://jsperf.com/checking-previously-typed-object
		web.isObject=function(obj,level){
			if(!level){
				return isType(obj) =="Object" /*excludes array and null and regexp and HTMLelment etc*/ //Object.getPrototypeOf(obj) ===Object.prototype 
			}else{
				return obj === Object(obj);
			}
		}
		web.isNumber=function(o){
			return typeof o=='number';
		}
		web.isNumeric=function(o){
			return !isNaN(o);
		}
		web.toNumber=function(o){
			return parseFloat(o);
		}
		web.isjQuery=function(o){
			return (o instanceof jQuery)
		}
		web.isCollection=web.isContainer=function(obj){
			return web.isObject(obj) || web.isArray(obj)
		}

		web.isEmpty=function(o){
			if(web.isType(o,'String')){
				return (o=='')
			}else if(web.isType(o,'Object')){
				return (web.keys(o).length==0)
			}else if(web.isType('Array')){
				return (o.length==0)
			}else{
					throw 'idk how to see if this is empty'
			}
		}

		//https://www.inkling.com/read/javascript-definitive-guide-david-flanagan-6th/chapter-7/array-like-objects
		// Determine if o is an array-like object.
		// Strings and functions have numeric length properties, but are 
		// excluded by the typeof test. In client-side JavaScript, DOM text
		// nodes have a numeric length property, and may need to be excluded 
		// with an additional o.nodeType != 3 test.
		web.isArrayLike=function(o) {
			if (o &&								// o is not null, undefined, etc.
				typeof o === "object" &&			// o is an object
				isFinite(o.length) &&				// o.length is a finite number
				o.length >= 0 &&					// o.length is non-negative
				o.length===Math.floor(o.length) &&	// o.length is an integer
				o.length < 4294967296){				// o.length < 2^32
				return true;						// Then o is array-like
			}else{
				return false;						// Otherwise it is not
			}
		}

		web.duckType=function(obj,compare,threshold){
			var score=0,total=0,properties=(web.isArray(compare))?compare:web.keys(compare);
			if(threshold==null||threshold==1){
				for(var i=0,l=properties.length;i<l;i++){
					if(!obj[properties[i]]){
						return false
					}
				}
				return true
			}
			for(var i=0,l=properties.length;i<l;i++){
				total++
				if(obj[properties[i]]){
					score++
				}
			}
			return (threshold)?(score/total)>threshold:(score/total)
		}

module.exports=web;

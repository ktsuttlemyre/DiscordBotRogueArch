const fetch = require('node-fetch');

let config = {
	"development": {
		"dialect": "sqlite",
		"storage": "./database.sqlite3"
	},
	"test": {
		"dialect": "sqlite",
		"storage": ":memory"
	},
	"production": {
		"dialect": "sqlite",
		"storage": "./database.sqlite3",
		"actionLogChannel": "800748408741953576",
	},
	
}
let defaults={
	roles:{
		VoiceMute:"VoiceMute",
		VoiceDeaf:"VoiceDeaf"
	},
	voiceJoinLeave:{
		resetUserState:true,
		tones:{
			on:true,
			defaultJoinTone: "https://www.youtube.com/watch?v=RtCt5gKMBMw", //"https://www.youtube.com/watch?v=QFewaD67FEY", //currently not used
			defaultLeaveTone: "https://www.youtube.com/watch?v=ea44CKOKlP8", //'https://youtu.be/xk093ODaNjc',
			location: 'https://shipwa.sh/discord/tones/',//'http://s3.amazonaws.com/shiptunes/tones/', //'./sounds/'
			externalMap: 'https://shipwa.sh/discord/tones/index.yaml',
			externalMapUpdateInterval:0,
			enableCustom:true,
			custom:{}
		}	
	},
	encapsulateAdminRoles:'Admin',
	DJ_Role:'DJ',
	voiceTextLinkMap:{
		//general: shiptunes
		'799879532856475648':'805549728099860480',
		//social groovy
		'690661623831986270':'800007831251189821',
	},
	eventRoomMap:{
		'789704651414306817':'AMONGUS',
		'799429356605800458':'MOVIE',
		'801473602611445790':'SOCIAL',
		'':'SPEEDRUN',
	},
	devChannelID:'814518995755335773',
}


let loadToneMap = async function(configInstance){
	console.log('loading external tone map')
	
	let url = configInstance.voiceJoinLeave.tones.externalMap

	const response = await fetch(url,{ method: "Get" });
	const body = await response.text();
	let json = {}
	try { //TODO test yaml
		json = yaml.load(body);
	} catch (e) {
		console.error(e);
	}
	if(!json){
		console.error('external tone map not available')
		return
	}
	console.log('applying external tone map')
	configInstance.voiceJoinLeave.tones.custom = Object.assign(configInstance.voiceJoinLeave.tones.custom, json)
}

const env = process.env.NODE_ENV || process.env.ENVIRONMENT || 'development';
let configInstance = Object.assign(defaults, config[env]);
if(configInstance.voiceJoinLeave && configInstance.voiceJoinLeave.tones && configInstance.voiceJoinLeave.tones.externalMap){
	let fn = function(){loadToneMap(configInstance)}
	setInterval(fn,configInstance.voiceJoinLeave.tones.externalMapUpdateInterval||15*60*1000); //15 minutes
	fn()
}
module.exports = configInstance;

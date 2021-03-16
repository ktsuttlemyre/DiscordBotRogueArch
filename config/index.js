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
		"storage": "./database.sqlite3"
	},
	
}
let defaults={
	voiceTextLinkMap:{
		//general: shiptunes
		'799879532856475648':'805549728099860480',
		//social groovy
		//'690661623831986270':'800007831251189821',
	},
	eventRoomMap:{
		'789704651414306817':'AMONGUS',
		'799429356605800458':'MOVIE',
		'801473602611445790':'SOCIAL',
		'':'SPEEDRUN',
	},
	devChannelID:'814518995755335773',
}
const env = process.env.NODE_ENV || process.env.ENVIRONMENT || 'development';
module.exports =  Object.assign(defaults, config[env]);

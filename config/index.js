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
			enableCustom:true,
			custom:{
			  "125821419308318720":"seinfeld.mp3", //wholius
			  "217497619537068032":"nickelodeon.mp3", //nick monger
			  "692186689946255490":"nickelodeon.mp3", //nick monger2
			  "146013495153000449":"wassup_dude.mp3", //waveofbabies newguy
			  "171438444466274306":"Caw.mp3", //munk
			  "759895781708136448":"Poots_on_Newts-Adventure_Time.mp3",
			  "679077100707381263":"Gummys_Theme.mp3", //Gummy
			  "489174943200837632":"Team_Fortress_2_Soundtrack_-_Ending_Flourish.mp3", //crowsair
			  "141026440782020608":"Show_me_that_smile.mp3", //troy
			  "218890918764347393":"TRUMPETS.mp3", //enzan
			  "337441260992200706":["garzon1.mp3","garzon2.mp3"], //garzon
			  "116021432894357511":"shipmod-joelseph.mp3", //joel
			  "":"",
			  "500468522468507648":"WhoCanItBeNow.mp3", //shipwash
			  "500467960914116609":"WhoCanItBeNow.mp3" //streamwash
			}
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
const env = process.env.NODE_ENV || process.env.ENVIRONMENT || 'development';
module.exports =  Object.assign(defaults, config[env]);

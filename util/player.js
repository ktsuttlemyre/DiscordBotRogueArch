const {Player} = require("discord-player");
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const emotes = {error: ":warning:"};
const {reactions, defaultAvatar} = require.main.require("./common");
const common = require.main.require("./common");
const _ = require("lodash");
const path = require("path");
const util = require.main.require("./util");
const config = require.main.require("./config");

//if this returns null then it is a hard allow action
//if this returns a string it will be prestented to the user as the missing permission/qualification
//if undefined it will default to allow but can be used by other dynamic permission functions to determine if this rutine explicit gave permission or not
module.exports.commandPermissions = function (message, requireDJ) {
	if (message.webhookID) {
		//all webhooks are allowed for now
		return null;
	}
	let isDJ = message.member.roles.cache.find((role) => role.name === config.DJ_Role);
	//DJ bypass
	if (isDJ) {
		return null;
	}
	let channel = message.member.voice.channel;
	//Check they are in a voice channel
	if (!message.member.voice.channel) return `${emotes.error} - You're not in a voice channel !`;
	//Check they are in the same voice channel as the bot
	if (message.guild.me.voice.channel && channel.id !== message.guild.me.voice.channel.id) return `${emotes.error} - You are not in the same voice channel !`;
	//if the user is the only one in the channel then allow action
	if (channel && channel.members.filter((member) => !member.user.bot).size == 1) {
		return null;
	}
	//do voting (optional)

	//isDJ required?
	if (requireDJ && !isDJ) {
		return config.DJ_Role;
	}
	return undefined;
};

let playlistName = "pogo";

let library = {
	"chill nintendo beats": [
		"https://www.youtube.com/watch?v=oS-A-wqZ2RI",
		"https://www.youtube.com/watch?v=AEuQcjHT_f4",
		"https://www.youtube.com/watch?v=oUHvYOYMNJk",
		"https://www.youtube.com/watch?v=C37VQ99xh6U",
		"https://www.youtube.com/watch?v=3t4qrROblcc",
		"https://www.youtube.com/watch?v=680ETor7pns",
		"https://www.youtube.com/watch?v=e6RHPoLimHI",
		"https://www.youtube.com/watch?v=xTUlPXmclFk",
		"https://www.youtube.com/watch?v=aAw_0a6aHo0",
		"https://www.youtube.com/watch?v=8JEvxdAYjSo",
		"https://www.youtube.com/watch?v=rDcYN1THMZY",
		"https://www.youtube.com/watch?v=SLgms78JVo0",
		"https://www.youtube.com/watch?v=sfyvAQemik4",
		"https://www.youtube.com/watch?v=iXFpdYQTzVo",
		"https://www.youtube.com/watch?v=lqNc1ky_Xoc",
		"https://www.youtube.com/watch?v=p9a-AQQJ8Aw",
		"https://www.youtube.com/watch?v=UkjFV-66E2c",
		"https://www.youtube.com/watch?v=9W9Wg_bp0ns",
		"https://www.youtube.com/watch?v=ZNf0D-BXi18",
		"https://www.youtube.com/watch?v=iJwE7PwJirs",
		"https://www.youtube.com/watch?v=5hZa1jb7MLg",
		"https://www.youtube.com/watch?v=ELljh9xfuuw",
		"https://www.youtube.com/watch?v=dM103L2tErY",
		"https://www.youtube.com/watch?v=CLLC1aPs0-Q",
		"https://www.youtube.com/watch?v=UOaNOZ4_qtw",
		"https://www.youtube.com/watch?v=iRdi1O94BNs",
		"https://www.youtube.com/watch?v=qZGwRz8wnSY",
		"https://www.youtube.com/watch?v=lqNc1ky_Xoc", //https://www.youtube.com/watch?app=desktop&v=lqNc1ky_Xoc&list=PLtSSR9Mvq5GpfHT5kiM8OdJbXsNSL33QG&index=8
		"https://www.youtube.com/watch?v=CNh1uSiAHRQ",
		"https://www.youtube.com/watch?v=rJlY1uKL87k",
		"https://www.youtube.com/watch?v=GdzrrWA8e7A",
		"https://www.youtube.com/watch?v=Y1nv35y886Y",
		"https://www.youtube.com/watch?v=c7rAknLeT-s",
		"https://www.youtube.com/watch?v=26l103sNnwM",
		"https://www.youtube.com/watch?v=7BgoXsZEuQ0",
		"https://www.youtube.com/watch?v=Lm6mrELlBtE",
		"https://www.youtube.com/watch?v=kyRZzzzjBxw", //https://www.youtube.com/watch?app=desktop&v=kyRZzzzjBxw&list=PLMeD3sfITven2bLRKPRhxga26VSeG5cAs&index=19&t=0s
		"https://youtu.be/2ed5QQ7exzw",
		"https://www.youtube.com/watch?v=5hqf5_3tLt0",
		"https://youtu.be/YtWrrI_A0e0",
		"https://youtu.be/RMCvF1sG2FA",
		"https://youtu.be/A-jjpax28uE",
		"https://youtu.be/30JZylPUmz0",
		"https://youtu.be/omZ4-wFlScE",
		"https://youtu.be/TO7z2FYB_mo",
		"https://youtu.be/CsQAaareXU8",
		"https://youtu.be/hHlXohfUFEI",
		"https://www.youtube.com/watch?v=ynVKsMS2ZZg",
		//'https://youtu.be/UkjFV-66E2c',
		"https://www.youtube.com/watch?v=CHfhIZf2SGg",
		"https://www.youtube.com/watch?v=MLLgrrPrdbQ",
		"https://www.youtube.com/watch?v=q_rxsPa_YCk",
	],
};


const exportedYTDLPlaylists = {
	"pogo":[{"url": "pAwR6w2TgxY", "view_count": null, "duration": 165.0, "title": "Alice", "id": "pAwR6w2TgxY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "qs1bG6BIYlo", "view_count": null, "duration": 211.0, "title": "Wishery", "id": "qs1bG6BIYlo", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "JVxe5NIABsI", "view_count": null, "duration": 154.0, "title": "Upular", "id": "JVxe5NIABsI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vOreqez4v9Y", "view_count": null, "duration": 169.0, "title": "Forget", "id": "vOreqez4v9Y", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "t_htoSaQFf4", "view_count": null, "duration": 171.0, "title": "Bloom", "id": "t_htoSaQFf4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "0W1ULoLs6Cg", "view_count": null, "duration": 216.0, "title": "Boo Bass", "id": "0W1ULoLs6Cg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "bl5TUw7sUBs", "view_count": null, "duration": 197.0, "title": "Data & Picard", "id": "bl5TUw7sUBs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "a4NCnH7RPZY", "view_count": null, "duration": 163.0, "title": "Jaaam", "id": "a4NCnH7RPZY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "mbD5ke7xqww", "view_count": null, "duration": 219.0, "title": "Toyz Noize", "id": "mbD5ke7xqww", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "FRSr0GprIIw", "view_count": null, "duration": 194.0, "title": "The Trouble", "id": "FRSr0GprIIw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "ttQSs35Z7nE", "view_count": null, "duration": 217.0, "title": "Living Island", "id": "ttQSs35Z7nE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "Fv80DLlUwNQ", "view_count": null, "duration": 194.0, "title": "Alohomora", "id": "Fv80DLlUwNQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "3Za-V_lhwGg", "view_count": null, "duration": 191.0, "title": "Expialidocious", "id": "3Za-V_lhwGg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "C0u0bOw4hi8", "view_count": null, "duration": 165.0, "title": "SquareBob SpongeMix", "id": "C0u0bOw4hi8", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "0Fk2BaM1la0", "view_count": null, "duration": 97.0, "title": "Wizard Of Meh", "id": "0Fk2BaM1la0", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "F7Ad1AuHriI", "view_count": null, "duration": 218.0, "title": "Lead Breakfast", "id": "F7Ad1AuHriI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "65PiKsNhCsc", "view_count": null, "duration": 206.0, "title": "Bangarang", "id": "65PiKsNhCsc", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "sy4IhE-KAEg", "view_count": null, "duration": 206.0, "title": "Boy & Bear", "id": "sy4IhE-KAEg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "XJfGnqKoXYY", "view_count": null, "duration": 175.0, "title": "Murmurs Of Middle-Earth", "id": "XJfGnqKoXYY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "2CYaZFydbA4", "view_count": null, "duration": 177.0, "title": "Grow Fonder", "id": "2CYaZFydbA4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "yZd_gS-Gm0E", "view_count": null, "duration": 169.0, "title": "White Magic", "id": "yZd_gS-Gm0E", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "70ZyU62pAXk", "view_count": null, "duration": 172.0, "title": "Catchatronic", "id": "70ZyU62pAXk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "UlS_Rnb5WM4", "view_count": null, "duration": 286.0, "title": "Skynet Symphonic", "id": "UlS_Rnb5WM4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "1vx3_2ks5qQ", "view_count": null, "duration": 146.0, "title": "Trumpular", "id": "1vx3_2ks5qQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "pwvflO3QKrI", "view_count": null, "duration": 207.0, "title": "Muppet Mash", "id": "pwvflO3QKrI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "F1jmhbw3JHw", "view_count": null, "duration": 239.0, "title": "Scrumdiddlyumptious", "id": "F1jmhbw3JHw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "lrsNeqANI3k", "view_count": null, "duration": 193.0, "title": "Hermione Mix", "id": "lrsNeqANI3k", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "L5w6XI5lfdg", "view_count": null, "duration": 179.0, "title": "What I Likes", "id": "L5w6XI5lfdg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "tZp6IgveE5o", "view_count": null, "duration": 212.0, "title": "Nicey Nicey", "id": "tZp6IgveE5o", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "g_D4wGMDqQw", "view_count": null, "duration": 270.0, "title": "Carpet Ride", "id": "g_D4wGMDqQw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "SMQnC71dHMk", "view_count": null, "duration": 137.0, "title": "Buzzwing", "id": "SMQnC71dHMk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vtr5q6dn7CA", "view_count": null, "duration": 150.0, "title": "Time Machine", "id": "vtr5q6dn7CA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "PUon3SvWfZs", "view_count": null, "duration": 189.0, "title": "Bite Size Candies", "id": "PUon3SvWfZs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "WpnveTg2wqw", "view_count": null, "duration": 147.0, "title": "Sugarella", "id": "WpnveTg2wqw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "aGogidkqUsQ", "view_count": null, "duration": 210.0, "title": "Psycho Soup", "id": "aGogidkqUsQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "cBN-CAhOYQ0", "view_count": null, "duration": 205.0, "title": "Gardyn", "id": "cBN-CAhOYQ0", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "VtvYiFk6X78", "view_count": null, "duration": 180.0, "title": "Gruve", "id": "VtvYiFk6X78", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "XKyop_elE6Y", "view_count": null, "duration": 213.0, "title": "Homarge", "id": "XKyop_elE6Y", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "X2-gHbSh2AY", "view_count": null, "duration": 133.0, "title": "SplurgenShitter", "id": "X2-gHbSh2AY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vm1Ky_hEfIw", "view_count": null, "duration": 116.0, "title": "Scoobystep", "id": "vm1Ky_hEfIw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "991rzjaPQQU", "view_count": null, "duration": 181.0, "title": "I Want...", "id": "991rzjaPQQU", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "bs66ORnV5jU", "view_count": null, "duration": 189.0, "title": "Joburg Jam", "id": "bs66ORnV5jU", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "6k0JeEKR3Do", "view_count": null, "duration": 193.0, "title": "Hoo Ba Ba Kanda", "id": "6k0JeEKR3Do", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "5GkjMZu2FrQ", "view_count": null, "duration": 287.0, "title": "Mary's Magic", "id": "5GkjMZu2FrQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "P4jmB9fdZc8", "view_count": null, "duration": 221.0, "title": "Whisperlude", "id": "P4jmB9fdZc8", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "6mIQjxvKSqw", "view_count": null, "duration": 260.0, "title": "Mellow Brick Road", "id": "6mIQjxvKSqw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "MJSoZa2aTrE", "view_count": null, "duration": 2182.0, "title": "Kindred Shadow (Full Album)", "id": "MJSoZa2aTrE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "-tCc4abTuaE", "view_count": null, "duration": 148.0, "title": "Kadinchey", "id": "-tCc4abTuaE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "5tOAZkrkuVA", "view_count": null, "duration": 221.0, "title": "There You Are", "id": "5tOAZkrkuVA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "lkuMeu8F3TY", "view_count": null, "duration": 168.0, "title": "Crimson", "id": "lkuMeu8F3TY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "BwyY5LdpECA", "view_count": null, "duration": 2587.0, "title": "Weightless", "id": "BwyY5LdpECA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "5HvnEX0uqQM", "view_count": null, "duration": 163.0, "title": "Davyd", "id": "5HvnEX0uqQM", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "_DvWP9hzEsc", "view_count": null, "duration": 163.0, "title": "Snow White remixed live", "id": "_DvWP9hzEsc", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "G8pptpmkHXg", "view_count": null, "duration": 259.0, "title": "redruM", "id": "G8pptpmkHXg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "J8YQoY5CyUs", "view_count": null, "duration": 178.0, "title": "Absoblume", "id": "J8YQoY5CyUs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "bCcyVuSvWEw", "view_count": null, "duration": 144.0, "title": "Roarcraft", "id": "bCcyVuSvWEw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vJCA7OVkUMk", "view_count": null, "duration": 214.0, "title": "Aye Aye", "id": "vJCA7OVkUMk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "X4_gElRkPjo", "view_count": null, "duration": 107.0, "title": "Kenya Chords", "id": "X4_gElRkPjo", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "kkdXjAtE4eY", "view_count": null, "duration": 301.0, "title": "Mazel Tov", "id": "kkdXjAtE4eY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "s1bkY9ZsHkI", "view_count": null, "duration": 202.0, "title": "Zoo Zoo", "id": "s1bkY9ZsHkI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "PuZ5tzr11Eo", "view_count": null, "duration": 241.0, "title": "Anna", "id": "PuZ5tzr11Eo", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "xyU5g5sIg4g", "view_count": null, "duration": 195.0, "title": "J'adore Juin", "id": "xyU5g5sIg4g", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "Zkf8G-QvP_A", "view_count": null, "duration": 179.0, "title": "One Day With You", "id": "Zkf8G-QvP_A", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "yv0pybgUcV8", "view_count": null, "duration": 134.0, "title": "iCarly Mix", "id": "yv0pybgUcV8", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "NhEXRQ5ndI0", "view_count": null, "duration": 208.0, "title": "HorrorLand", "id": "NhEXRQ5ndI0", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "UxSBzlL3Lmg", "view_count": null, "duration": 196.0, "title": "Bambino", "id": "UxSBzlL3Lmg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "MVxh92lf_EU", "view_count": null, "duration": 2418.0, "title": "Ascend (Full Album)", "id": "MVxh92lf_EU", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "7jGsC1pKX5g", "view_count": null, "duration": 246.0, "title": "Smooth Cream", "id": "7jGsC1pKX5g", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "dqSEox9t4Bw", "view_count": null, "duration": 231.0, "title": "Doubtfire", "id": "dqSEox9t4Bw", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "LJWPCtnlOk4", "view_count": null, "duration": 192.0, "title": "Reach (Official Video)", "id": "LJWPCtnlOk4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "qpPki21NV_4", "view_count": null, "duration": 181.0, "title": "Tiggerific", "id": "qpPki21NV_4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "y2oLbP7tvMk", "view_count": null, "duration": 186.0, "title": "Wings For Dreamers", "id": "y2oLbP7tvMk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "TCKeMlC6nYg", "view_count": null, "duration": 4784.0, "title": "POGO Live 18.01.19", "id": "TCKeMlC6nYg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "Oe-X-Or36iI", "view_count": null, "duration": 237.0, "title": "Moonlake", "id": "Oe-X-Or36iI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "TT0FsWk3Zfs", "view_count": null, "duration": 204.0, "title": "Just Blue Fairy", "id": "TT0FsWk3Zfs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "BTxQY_Jea6U", "view_count": null, "duration": 129.0, "title": "Perthection", "id": "BTxQY_Jea6U", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "aqWTPFSgqb4", "view_count": null, "duration": 118.0, "title": "Eleven", "id": "aqWTPFSgqb4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "9yqROg79mFY", "view_count": null, "duration": 188.0, "title": "Do You", "id": "9yqROg79mFY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "nXJ5_m_lmiM", "view_count": null, "duration": 118.0, "title": "The Ghan", "id": "nXJ5_m_lmiM", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "9LdS1XkSjoM", "view_count": null, "duration": 170.0, "title": "Happee", "id": "9LdS1XkSjoM", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "Q_hQ1h1Arl4", "view_count": null, "duration": 210.0, "title": "Hot Ziggity", "id": "Q_hQ1h1Arl4", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "W9xLMT-kplQ", "view_count": null, "duration": 170.0, "title": "Don't Wish", "id": "W9xLMT-kplQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "DkIl24t3cbE", "view_count": null, "duration": 123.0, "title": "Perth Milks It", "id": "DkIl24t3cbE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vtfKVoUYzyE", "view_count": null, "duration": 57.0, "title": "Fmaa", "id": "vtfKVoUYzyE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "oElutHj9WaA", "view_count": null, "duration": 232.0, "title": "Go Out And Love Someone", "id": "oElutHj9WaA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "RJ6ueesXx1k", "view_count": null, "duration": 115.0, "title": "Indian Pacific", "id": "RJ6ueesXx1k", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "OWAfzfJCmUE", "view_count": null, "duration": 227.0, "title": "Glowflake", "id": "OWAfzfJCmUE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "DqDbBej2unk", "view_count": null, "duration": 212.0, "title": "Kaleidogorgon", "id": "DqDbBej2unk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "b0JUwNlXSLA", "view_count": null, "duration": 163.0, "title": "Vasna", "id": "b0JUwNlXSLA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "2O4e3yRS3Sc", "view_count": null, "duration": 171.0, "title": "G'Day G'Day (Whatslively in Sydney)", "id": "2O4e3yRS3Sc", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "nSlBiBu6-fs", "view_count": null, "duration": 511.0, "title": "Pogo's Tips", "id": "nSlBiBu6-fs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "bXepo7x3r6M", "view_count": null, "duration": 1106.0, "title": "How I Remix Movies", "id": "bXepo7x3r6M", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "32cnJhNh-Yo", "view_count": null, "duration": 188.0, "title": "Reach", "id": "32cnJhNh-Yo", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "Guz6jpb5Zck", "view_count": null, "duration": 298.0, "title": "Ganbatte", "id": "Guz6jpb5Zck", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "hpx-742y_IY", "view_count": null, "duration": 199.0, "title": "Vision", "id": "hpx-742y_IY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "EjyO-B_0t2A", "view_count": null, "duration": 87.0, "title": "LG Home Appliances Mashup", "id": "EjyO-B_0t2A", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "vC-PMIE3JjY", "view_count": null, "duration": 159.0, "title": "Closure", "id": "vC-PMIE3JjY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "HhD_eRSEVTA", "view_count": null, "duration": 153.0, "title": "People", "id": "HhD_eRSEVTA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "O2QxxXoRQfQ", "view_count": null, "duration": 245.0, "title": "Be Kind To Your Donkey", "id": "O2QxxXoRQfQ", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "qJaO8BUsnWk", "view_count": null, "duration": 111.0, "title": "Get More Into Music", "id": "qJaO8BUsnWk", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "nlQyWCBBTLo", "view_count": null, "duration": 115.0, "title": "Remixing Aladdin", "id": "nlQyWCBBTLo", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "_dUbnb8mFCg", "view_count": null, "duration": 1980.0, "title": "Cultures (Full Album)", "id": "_dUbnb8mFCg", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "i1uz_gj-6fE", "view_count": null, "duration": 194.0, "title": "Yoga special", "id": "i1uz_gj-6fE", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "a4fsh9qIpLI", "view_count": null, "duration": 197.0, "title": "Prop My Sky", "id": "a4fsh9qIpLI", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "3aMtjwkDMw8", "view_count": null, "duration": 199.0, "title": "Supremo", "id": "3aMtjwkDMw8", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "hHGHE03sVSA", "view_count": null, "duration": 135.0, "title": "Eyes And Thighs", "id": "hHGHE03sVSA", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "rx94fy3rOMs", "view_count": null, "duration": 255.0, "title": "Making HorrorLand", "id": "rx94fy3rOMs", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null},
{"url": "cxwgBLBTSBY", "view_count": null, "duration": 248.0, "title": "Polka Dot Positive", "id": "cxwgBLBTSBY", "uploader": "Pogo", "_type": "url", "ie_key": "Youtube", "description": null}]
}

library['pogo']=[]
exportedYTDLPlaylists["pogo"].forEach(function(e){library['pogo'].push(e.url)})

const defaultFetcher = function () {
	let playlist = library[playlistName];
	//if(!playlist){
	//	playlist = await util.playlists.subredditArray(playlistName,'top');
	//}
	if (!playlist) {
		playlist = library['chill nintendo beats'];
	}
	return _.sample(playlist);
};

let playBackgroundPlaylist = (module.exports.playBackgroundPlaylist = async (message, player, notice) => {
	init(message, player, notice);

		let fetchNext = message.client.memory.channelGet(message, "backgroundPlaylistFetcher") || defaultFetcher;
	let selection = await fetchNext();
	console.log("background playing", selection);

	player.backgroundPlaylist = true;
	return player.play(message, selection, {firstResult: true});
});

var create = (module.exports.create = function (message, client) {
	//https://discord-player.js.org/global.html#PlayerOptions
	let options = {
		leaveOnEnd: false,
		leaveOnEndCooldown: 300,
		leaveOnStop: false,
		leaveOnEmpty: false,
		leaveOnEmptyCooldown: 300,
		autoSelfDeaf: true,
		quality: "high",
		enableLive: false,
	};
	var player = new Player(client, options);
	player.init = false;

	player
		.on("trackStart", function (message, track) {
			if (track.skip) {
				player.skip(message);
				//alert the user of what is now playing
				GUIMessages.nowPlaying(message, player, "Skipping ${track.name} for reason:${track.skip}");
			}

			init(message, player, function () {
				if (!player.backgroundPlaylist) {
					player.emit("trackAdd", message, player.getQueue(message), player.nowPlaying(message));
				}
			});

			GUIMessages.nowPlaying(message, player);

			/*
		//complidated init event to add volume and filters
		if(!player.isPlaying(message)){
			player.on('queueCreate',function(message,queue){
				var init=false
				player.on('trackStart',function(message, track){
					if(init){
						return;
					}
					init=setInterval(function(){
						if(!player.isPlaying(message)){
							return
						}
						try{
							//https://discord-player.js.org/global.html#Filters
							player.setFilters(message, {
							 normalizer: true
							});
							player.setVolume(message, 20);
							clearInterval(init);
						}catch(e){
						}
					},10);
				})
			});
		}*/
		})
		// Send a message when something is added to the queue
		.on("trackAdd", async (message, queue, track) => {
			if (!message || message.deleted) {
				//GUIMessages.nowPlaying(message,player,`${user.username} likes ${track.title}`);
				return;
			}

			let resolve = message.client.memory.channelGet(message, `${message.id}_resolve`);
			if (!resolve) {
				return;
			}

			var title = GUIMessages.presentTitle(track.title);
			var embed = {
				author: {
					name: track.requestedBy.username,
					url: `https://shiptunes.shipwa.sh/${track.requestedBy.id}`,
					icon_url: track.requestedBy.avatarURL() || defaultAvatar,
				},
				//"title":+`\n>>>${message.content}`
				description: /*'> '+message.content.split('\n').join('\n> ')+`\n*/ `Added: [${title}](${track.url})`,
				thumbnail: {
					url: `${track.thumbnail}`,
				},
				reactions: [reactions.upvote, reactions.downvote],
				callback: async function (reply) {
					//save track/message association in memory for quick queue jump back functionaity
					await message.client.memory.channelSet(message, util.getYoutubeHash(track.url) + "_" + track.requestedBy.id + "_" + message, reply.id);

					await reply.react(reactions.upvote);
					await reply.react(reactions.downvote);
					//add custom properties permalinks to entries
					//message.permalink=common.permalinkMessage(message.guild,message.channel,reply);
					reply.permalink = common.permalinkMessage(reply.guild, reply.channel, reply);

					const collector = reply.createReactionCollector((reaction, user) => {
						return [reactions.upvote, reactions.downvote].includes(reaction.emoji.name);
					}); //{ time: 15000 }

					collector.on("collect", async (reaction, user) => {
						if (reaction.emoji.name === reactions.downvote) {
							//if downvote
							let originalPoster = (reply.embed || reply.embeds[0]).author;
							if (!originalPoster) {
								return; //reaction.channel.send('not able to act upon this request')
							}
							let ogPosterID = (originalPoster.url || "").split("#").shift().split("/").pop();
							if (user.id === ogPosterID) {
								//if original poster
								//delete message
								await reply.delete();

								//set it to be skipped
								track.skip = true;

								//if it is currently playing then skip
								var nowPlaying = player.nowPlaying(message);
								if (nowPlaying && nowPlaying === track) {
									//or message maybe?
									player.skip(message);
								} else {
									//if it isn't playing then delete it
									player.remove(message, track);
								}

								//delete track from queue
								// 							common.filterInPlace(track.queue.tracks,function(o) {
								// 							   console.log('comparing',o.url,track.url)
								// 							   return o.url !== track.url;
								// 							});

								//alert everyone
								GUIMessages.nowPlaying(message, player, `${user.username} removed ${track.title}`);
							} else {
								//these are just users that don't like the song and we will pass on their message
								GUIMessages.nowPlaying(message, player, `${user.username} does not like ${track.title}`);
							}
						} else if (reaction.emoji.name === reactions.upvote) {
							//these are users that like the song and we will pass on their message
							GUIMessages.nowPlaying(message, player, `${user.username} likes ${track.title}`);
						}
						console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					});

					// 				collector.on('end', collected => {
					// 					console.log(`Collected ${collected.size} items`);
					// 				});

					GUIMessages.nowPlaying(message, player, `${message.member.displayName} has added ${track.title}`);
				},
			};
			let returnResolve = await resolve(embed);
			console.log("returnResolve", returnResolve);
		})
		.on("playlistAdd", function (message, queue, playlist) {
			message.react(reactions.shipwash);
			//message.react('☑️');
			GUIMessages.nowPlaying(message, player, `${message.member.displayName} has added playlist ${playlist.title}`);
		})
		// Send messages to format search results
		.on("searchResults", (message, query, tracks) => {
			const embed = new Discord.MessageEmbed()
				.setAuthor(`Here are your search results for ${query}!`)
				.setDescription(tracks.map((t, i) => `${i}. ${t.title}`))
				.setFooter("Send the number of the song you want to play!");
			message.channel.send(embed);
		})
		.on("searchInvalidResponse", (message, query, tracks, content, collector) => {
			if (content === "cancel") {
				collector.stop();
				return message.channel.send("Search cancelled!");
			}

			message.channel.send(`You must send a valid number between 1 and ${tracks.length}!`);
		})
		.on("searchCancel", (message, query, tracks) => message.channel.send("You did not provide a valid response... Please send the command again!"))
		.on("noResults", (message, query) => util.messages.encapsulate(message,`No results found on YouTube for:\n${query}`))

		// Send a message when the music is stopped
		.on("queueEnd", async function (message, queue) {
			//'Music stopped. There no more music in the queue!'
			player.init = false;
			playBackgroundPlaylist(message, player, "Playing background music until I get a new request");
		})
		.on("channelEmpty", function (message, queue) {
			GUIMessages.nowPlaying(message, player, "I am alone in the voice channel. :frowning:");
			var channel = message.guild.me.voiceChannel.leave();
			if (channel) {
				channel.leave();
			}
		})
		.on("botDisconnect", function (message) {
			GUIMessages.nowPlaying(message, player, "Music stopped. I have been disconnected from the channel!");
		})

		// Error handling
		.on("error", (error, message) => {
			switch (error) {
				// 		case 'NotPlaying':
				// 		    console.error(error);
				// 		    break;
				case "NotConnected":
					message.channel.send("You are not connected in any voice channel!");
					break;
				case "UnableToJoin":
					message.channel.send("I am not able to join your voice channel, please check my permissions!");
					break;
				case "LiveVideo":
					message.channel.send("YouTube lives are not supported!");
					break;
				case "VideoUnavailable":
					message.channel.send("This YouTube video is not available!");
					break;
				case "Error: input stream: Status code: 429":
					process.exit(1);
					message.channel.send(`Youtube ratelimit hit. Restarting...`);
				default:
					console.error(error);
					util.messages.encapsulate(message,error);
			}
		});
	return player;
});
var init = (module.exports.init = function (message, player, callback) {
	if (!player.init) {
		var toID = setInterval(function () {
			var queue = player.getQueue(message);
			if (!queue) {
				return;
			}
			var voiceConnection = queue.voiceConnection;
			if (!voiceConnection) {
				return;
			}
			var dispatcher = voiceConnection.dispatcher;
			if (!dispatcher) {
				return;
			}
			player.setFilters(message, {
				normalizer: true,
			});
			player.setVolume(message, 56);
			console.log("set volume and filter properly");

			if (player.backgroundPlaylist) {
				//background list init
				var track = player.nowPlaying(message);
				if (track.durationMS > 10 * 60 * 1000) {
					//if track is longer than 10 minutes then jump randomly to a location
					player.seek(message, _.random(0, track.duration));
				}
			}

			clearInterval(toID);
			if (callback) {
				return callback.call ? callback() : GUIMessages.nowPlaying(message, player, callback);
			}
			GUIMessages.nowPlaying(message, player);
		});
		player.init = true;
		return;
	}
	setTimeout(function () {
		if (callback) {
			return callback.call ? callback() : GUIMessages.nowPlaying(message, player, callback);
		}
		GUIMessages.nowPlaying(message, player);
	}, 1);
});

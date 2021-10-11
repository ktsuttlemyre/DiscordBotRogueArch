const {Command, version: akairoVersion} = require("discord-akairo");
const {MessageEmbed, version: djsVersion} = require("discord.js");
const packageJSON = require.main.require("./package.json");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const config = util.config;
const botVersion = packageJSON.version;
const blank = "‎"

const osu = require('node-os-utils');
const YAML = require("js-yaml");
YAML.stringify = function(yaml){
	return YAML.dump(yaml,{noArrayIndent :true,flowLevel:1,sortKeys:true,forceQuotes:true,quotingType:'"'}) //https://www.npmjs.com/package/js-yaml
}


//https://stackoverflow.com/questions/12941083/execute-and-get-the-output-of-a-shell-command-in-node-js
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const getVersions = async function getVersions () {
  const output = await exec('npm list --depth=0')
  //const email = await exec('git config --global user.email')
  return output
};

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats"],
			category: "general",
			clientPermissions: ["EMBED_LINKS"],
			description: {content: "Displays Shipbot's statistics."},
		});
	}
	
	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === config.systemRoles.admin)) {
			return config.systemRoles.admin;
		}
		return null;
	}

	formatMilliseconds(ms) {
		let x = Math.floor(ms / 1000);
		let seconds = x % 60;

		x = Math.floor(x / 60);
		let minutes = x % 60;

		x = Math.floor(x / 60);
		let hours = x % 24;

		let days = Math.floor(x / 24);

		seconds = `${"0".repeat(2 - seconds.toString().length)}${seconds}`;
		minutes = `${"0".repeat(2 - minutes.toString().length)}${minutes}`;
		hours = `${"0".repeat(2 - hours.toString().length)}${hours}`;
		days = `${"0".repeat(Math.max(0, 2 - days.toString().length))}${days}`;

		return `${days === "00" ? "" : `${days}:`}${hours}:${minutes}:${seconds}`;
	}
	
// 	requireAll(){ //old method of importing all and guessing how to access the version
// 		let obj = {}
// 		let dep = packageJSON.dependencies
// 		Object.keys(dep).forEach(function(key){
// 			let lib = require(key);
// 			let version = lib.version || lib.vers || undefined;
// 			obj[key]={requested:dep[key]:imported:version}	
// 		});
// 		return obj;
// 	}

	async exec(message) {		
		//returns cpu average and count
		let cpu = osu.cpu
		let cpuAverage = cpu.average()
		let cpuCount = cpu.count()
		//returns cpu usage
		//let usage = await cpu.usage();

		//returns drive info
		//let driveInfo = await osu.drive.info();
		//returns memory info
		let mem = osu.mem
		//let memInfo = await mem.info()
		
		let res = await Promise.all([cpu.usage(),osu.drive.info(),mem.info()]);
		let cpuUsage = res[0];
		let driveInfo = res[1];
		let memInfo = res[2];
		
		let dep = await getVersions()
		dep = ((dep || {}).stdout || '')
		let list = dep.replace(/\+\-\-/ig,'').replace(/\`\-\-/ig,'').trim().split('\n')
		const half = Math.ceil(list.length / 2);    

		const firstHalf = list.slice(0, half)
		const secondHalf = list.slice(half+1)
		
		
		const client = this.client;
		
		const embed = new MessageEmbed()
			.setColor(0xffac33)
			.setTitle("Shipbot Statistics")
		        //.setDescription(`**dependencies**:\n${dep.stdout}`)
		        .addField('Dependencies',firstHalf.join('\n'),true)
			.addField(blank,secondHalf.join('\n'),true)
			.addField(blank,blank,true)
			.addField(
				"Discord",
				[
					`**Guilds**: ${client.guilds.cache.size}`,
				 	`**Channels**: ${client.channels.cache.size}`,
				 	`**Users**: ${client.users.cache.size}`,
					
				],
				true
			)
		        .addField(blank,blank,true)
			.addField(
				"Version Info",
				[
					`**Architecture**: ${process.arch}`,  
					`**PID**: ${process.pid}`,
					`**Platform**: ${process.platform}`,
					`**Node Version**: ${process.version}`, 
					`**Discord.js**: ${djsVersion}`,
					`**Akairo**: ${akairoVersion}`,
				],
				true
			)
			.addField(
				"Technical",
				[
					`**Uptime**: ${this.formatMilliseconds(this.client.uptime)}`,
					`**CPU usage**: ${YAML.stringify(cpuUsage)}`,
				],
				true
			)
			.addField(
				"Disk",
				[`${YAML.stringify(driveInfo)}`],
				true
			)
			.addField(
				"Memory",
				[
					`${YAML.stringify(memInfo)}`,					
					`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
				],
				true
			)
			.setFooter("Shipbot v" + botVersion);

		return embed;
	}
}

module.exports = StatsCommand;

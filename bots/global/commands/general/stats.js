const {Command, version: akairoVersion} = require("discord-akairo");
const {MessageEmbed, version: djsVersion} = require("discord.js");
const {version: botVersion} = require.main.require("./package.json");
const osu = require('node-os-utils');

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats"],
			category: "general",
			clientPermissions: ["EMBED_LINKS"],
			description: {content: "Displays Shipbot's statistics."},
		});
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
		
		
		const client = this.client;
		
		const embed = new MessageEmbed()
			.setColor(0xffac33)
			.setTitle("Akairo Boilerplate Statistics")
			.addField(
				"Discord",
				[`**Guilds**: ${client.guilds.cache.size}`, `**Channels**: ${client.channels.cache.size}`, `**Users**: ${client.users.cache.size}`],
				true
			)
			.addField(
				"Technical",
				[
					`**Uptime**: ${this.formatMilliseconds(this.client.uptime)}`,
					`**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
					`**Discord.js**: v${djsVersion}`,
					`**Akairo**: v${akairoVersion}`,
				],
				true
			)
			.addField(
				"Technical2",
				[
					`**cpu usage**: ${JSON.stringify(cpuUsage)}`,
					`**disk**: ${JSON.stringify(driveInfo)}`,
					`**memory**: ${JSON.stringify(memInfo)}`
				],
				true
			)
			.setFooter("Shipbot v" + botVersion);

		return embed;
	}
}

module.exports = StatsCommand;

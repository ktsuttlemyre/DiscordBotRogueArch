//https://github.com/Decicus/discord-server-change/blob/master/index.js

const DiscordJs = require("discord.js");
const Permissions = DiscordJs.Permissions.FLAGS;

const {Command} = require("discord-akairo");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const commandVars = util.commandVars(__filename);

/**
 * Region aliases
 */
const aliases = {
	use: "us-east",
	usw: "us-west",
	usc: "us-central",
	uss: "us-south",
	eu: "europe",
	ru: "russia",
	sy: "sydney",
	in: "india",
	ja: "japan",
};

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "kill"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				// {
				// 	id: 'search',
				// 	default: '',
				// 	match: 'content',
				// },
			],
			channel: "guild",
			ownerOnly: true,
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === "Admin")) {
			return "Admin";
		}
		return null;
	}

	async exec(message) {
		// 		if (!message.member.voice.channel) return message.channel.send(`${emotes.error} - You're not in a voice channel !`);
		// 		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${emotes.error} - You are not in the same voice channel !`);
		// 		var player = this.client.memory.get(message.guild, 'player')
		// 		if(!player){
		// 			return message.channel.send('No player playing to act on')
		// 		}

		// 		var track = player.nowPlaying(message);
		// 		if(track){
		// 			await GUIMessages.nowPlaying(message,player,'Skipped: '+track.title)
		// 		}else{
		// 			await GUIMessages.nowPlaying(message,player,'Skipped: last track');
		// 		}
		// 		player.skip(message);
		const user = message.author;
		const guild = message.guild;
		// Use `v` because region aliases.
		const cmd = "v";
		const guildId = guild.id;

		try {
			let text = `${region} by ${user.username}#${user.discriminator}.`;
			await guild.setRegion(region, `Voice region updated to ${text}`);
			console.log(`Voice region updated for ${guild.name} [${guild.id}] to ${text}`);
			await message.reply(`Voice region updated to: ${text}`);
		} catch (err) {
			await message.reply("Error updating region.");
			console.error(`Could not update voice region on server ${guild.name} [${guild.id}] to ${region}.`);
			console.error(err);
		}

		await updateCooldown(guildId, cmd);
	}

	//     const guild = message.guild;
	//     let regions;
	//     try {
	//         regions = await guild.fetchVoiceRegions();
	//     } catch (err) {
	//         console.error(err);
	//     }

	//     let region = guild.region;

	//     if (regions !== undefined) {
	//         const findRegion = regions.get(region);
	//         region = findRegion.name;

	//         if (findRegion.deprecated) {
	//             region += ' [Deprecated]';
	//         }

	//         if (findRegion.vip) {
	//             region += ' [VIP]';
	//         }
	//     }

	//     return (`Current server region: ${region}`);

	// 	}
}

module.exports = CustomCommand;

// /**
//  * Change voice region
//  */
// cmds.v = async (message, params) => {
//     const user = message.author;
//     const guild = message.guild;
//     let regions;
//     try {
//         regions = await guild.fetchVoiceRegions();
//     } catch (err) {
//         await message.reply(`Unable to get voice regions.`);
//         console.error(err);
//         return;
//     }

//     /**
//      * Sort deprecated regions as last.
//      */
//     regions = regions.sort((first, second) => {
//         return first.deprecated - second.deprecated;
//     });

//     const formatRegions = regions.map((region) => {
//         let format = `${region.name} [${region.id}]`;

//         if (region.deprecated) {
//             format += ' [Deprecated!]';
//         }

//         if (region.vip) {
//             format += ' [VIP]';
//         }

//         return format;
//     });

//     const selectedRegion = params[1];
//     const listRegions = `**Available regions - 'Region name [Region ID]':**\n${codeTicks}- ${formatRegions.join(
//         '\n- '
//     )}${codeTicks}\n\n**Usage:** \`!v region-id\``;

//     if (!selectedRegion) {
//         await message.reply(listRegions);
//         return;
//     }

//     const getRegion = regions.get(selectedRegion);
//     if (!getRegion) {
//         await message.reply('**Invalid region specified**\n' + listRegions);
//         return;
//     }

//     try {
//         await guild.setRegion(
//             getRegion.id,
//             `Voice region updated to ${selectedRegion} by ${user.username}#${user.discriminator}.`
//         );

//         console.log(
//             `Voice region updated for ${guild.name} [${guild.id}] to ${selectedRegion} by ${user.username}#${user.discriminator}.`
//         );

//         await message.reply(
//             `Voice region updated to: ${getRegion.name} [${getRegion.id}]`
//         );
//     } catch (err) {
//         await message.reply('Error updating region.');

//         console.error(
//             `Could not update voice region on server ${guild.name} [${guild.id}].`
//         );

//         console.error(err);
//     }
// };

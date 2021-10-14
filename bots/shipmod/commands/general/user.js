//https://stackoverflow.com/questions/53053334/how-to-get-guildmember-data-from-a-user-through-a-mention/53111684

const {Command} = require("discord-akairo");
const emotes = {error: ":error:"};
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);

class CustomCommand extends Command {
	constructor() {
		super(commandVars.name, {
			description: {content: "join a voice chat"},
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
			channelRestriction: "guild",
		});
	}

	userPermissions(message) {
		if (!message.member.roles.cache.some((role) => role.name === config.systemRoles.admin)) {
			return config.systemRoles.admin;
		}
		return null;
	}

	async exec(message) {
      //ex `member @Rinkky
      let rMember = message.guild.member(message.mentions.users.first()) // Takes the user mentioned, or the ID of a user
      let micon = rMember.displayAvatarURL // Gets their Avatar

        if(!rMember) {
          return message.reply("Who that user? I dunno him.") // if there is no user mentioned, or provided, it will say this
        }
          let memberembed = new Discord.RichEmbed()
          .setDescription("__**Member Information**__")
          .setColor(0x15f153)
          .setThumbnail(micon) // Their icon
          .addField("Name", `${rMember.username}#${rMember.discriminator}`) // Their name, I use a different way, this should work
          .addField("ID", rMember.id) // Their ID
          .addField("Joined at", rMember.joinedAt) // When they joined

          return memberembed
	}
}

module.exports = CustomCommand;

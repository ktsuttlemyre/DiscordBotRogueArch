let debug = true;
const {Client, Collection} = require("discord.js");
const GUIMessages = require.main.require("./templates/messages");
const {Command} = require("discord-akairo");
const {Player} = require("discord-player");
const common = require.main.require("./common");
const util = require.main.require("./util");
const config = util.config;
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const roomMap = require.main.require("./config").eventRoomMap;
const escapeMD = require("markdown-escape");

class CustomCommand extends Command {
	constructor() {
		super(commandVars.id, {
			description: {content: "Subscribes you to specific alerts"},
			aliases: [commandVars.name],
			category: commandVars.category,
			clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
				args: [
					 {
						id: 'arg',
						default: '',
						match: 'content',
					 },
					],
			channelRestriction: "guild",
		});
	}

	parseInput(message) {}    
  
	async exec(message, {arg} ) {
		let isAdmin = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'admin');
		let isMod = message.member.roles.cache.find((role) => (role.name||'').toLowerCase() === 'mod');
		
		let client = this.client;
    const user = await client.users.fetch(arg, { cache: true });
    
    // https://stackoverflow.com/questions/62827582/discord-js-get-common-servers-between-two-users
    var guilds = await Promise.all(
      client.guilds.cache.map(async guild => [
          guild.id,
          await guild.members.fetch(message.author).catch(() => null)
      ])
    )
    guilds = guilds.filter(g => g[1]).map(guild => client.guilds.resolve(guild[0]));
    
                                          
    guilds.forEach(function(guild){
      let member = guild.members.resolve(message.author);
      let logChannel = guild.channels.resolve(config.actionLogChannel);
      
      let roleName = "⛔🤖📥";
      let role = guild.roles.cache.find((x) => x.name === roleName);

        //can this bot manage roles?
        if (guild.me.hasPermission("MANAGE_ROLES")) {
          //now add the role to the user if they arent already a part
          if (member.roles.cache.some((role) => role.name === roleName)) {
            member.roles.remove(role);
            logChannel && logChannel.permissionsFor(guild.me).has("SEND_MESSAGES") && logChannel.send(`Removed role ${role} from ${member}`)
          }
        }
    })
	}
}

module.exports = CustomCommand;

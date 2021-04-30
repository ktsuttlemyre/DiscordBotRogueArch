const GUIMessages = require.main.require("./templates/messages");
const { Command } = require("discord-akairo");
const { Player } = require("discord-player");
const emotes = { error: ":error:" };
const { reactions, defaultAvatar } = require.main.require("./common");
const common = require.main.require("./common");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const path = require("path");
const web = require.main.require("./web");

class CustomCommand extends Command {
  constructor() {
    super(commandVars.name, {
      description: { content: "deleted all messages up till a specific id" },
      //aliases: [''],
      category: commandVars.category,
      clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
      args: [
        {
          id: "id",
          default: "",
          match: "content",
        },
      ],
      channelRestriction: "guild",
    });
  }

  userPermissions(message) {
    if (!message.member.roles.cache.some((role) => role.name === "Admin")) {
      return "Admin";
    }
    return null;
  }

  async exec(message, id) {
    var messagesToDelete = [];
    await common.fetchMessages(
      message.channel,
      async function (message, index, messages, gIndex) {
        if (message.id != id) {
          messagesToDelete.push(message);
        }
      }
    );
    message.channel.send(`got ${gArray.length} messages`);
  }
}

module.exports = CustomCommand;

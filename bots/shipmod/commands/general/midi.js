const GUIMessages = require.main.require("./templates/messages");
const { Command } = require("discord-akairo");
const { Player } = require("discord-player");
const emotes = { error: ":error:" };
const { reactions, defaultAvatar } = require.main.require("./common");
const common = require.main.require("./common");
const util = require.main.require("./util");
const commandVars = common.commandVars(__filename);
const _ = require("lodash");
const config = require.main.require("./config");
const scribble = require("scribbletune");

/**
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * //https://stackoverflow.com/questions/47089230/how-to-convert-buffer-to-stream-in-nodejs
 */
const Readable = require("stream").Readable;

function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}

//sound effects https://www.youtube.com/channel/UCok6P4rwxBMun9ghaIV4ufQ

class CustomCommand extends Command {
  constructor() {
    super(commandVars.name, {
      description: { content: "clip" },
      aliases: [commandVars.name],
      category: commandVars.category,
      clientPermissions: ["SEND_MESSAGES"],
      args: [
        {
          id: "arg",
          default: "",
          match: "content",
        },
      ],
      channelRestriction: "guild",
    });
  }

  // 	userPermissions(message) {
  // 		if (!message.member.roles.cache.some(role => role.name === 'DJ')) {
  // 			return 'DJ';
  // 		}
  // 		return null;
  // 	}

  async exec(message, { arg }) {
    if (!message.member.voice.channel)
      return message.channel.send(
        `${emotes.error} - You're not in a voice channel !`
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return message.channel.send(
        `${emotes.error} - You are not in the same voice channel !`
      );
    // 		var player = this.client.memory.get(message, 'player')
    // 		if(!player){
    // 			return message.channel.send('No player playing to act on')
    // 		}

    // Sample Clip that renders the C Major scale
    const c = scribble.clip({
      notes: scribble.scale("C4 major"),
      pattern: "x".repeat(7),
    });

    // Get hold of the bytes from the scribble.midi method
    // (passing null as the second argument returns bytes)
    const b = scribble.midi(c, null);

    //     // Convert bytes to array buffer
    //     // Ref: Accepted answer on https://stackoverflow.com/questions/35038884/download-file-from-bytes-in-javascript
    //     var bytes = new Uint8Array(b.length);
    //     for (var i = 0; i < b.length; i++) {
    //       var ascii = b.charCodeAt(i);
    //       bytes[i] = ascii;
    //     }

    let dispatcher;
    try {
      var connection = await message.member.voice.channel.join();
      dispatcher = connection.play(bufferToStream(b));
      dispatcher
        .on("start", () => {
          //channel.leave();
          console.log("context set");
        })
        .on("finish", () => {
          console.log("context disconnected from discord");
          //channel.leave();
        })
        .on("error", (err) => {
          console.log("context disconnected from discord due to error");
          console.error(err);
          //error(err)
          //channel.leave();
        });
    } catch (err) {
      console.log("context didnt connect to discord due to error");
      console.error(err);
      return err;
    }

    //  	 	    const { channel } = message.member.voice;
    // 		    console.log('arg',arg)
    // 		    arg = (arg||'').match(/(\<\@\!)?(\d+)(>)?/)[2]||arg;
    // 		    console.log('arg after match',arg);
    // 		    arg = map[arg]||arg;
    // 	            console.log('arg after map',arg)
    // 		    arg = (arg || '').trim() || null
    // 		    await uti.playClip(message,arg)
  }
}

module.exports = CustomCommand;

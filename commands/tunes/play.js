const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');

class PlayCommand extends Command {
	constructor() {
		super('play', {
      description: { content: 'plays [name/URL]'},
			aliases: ['play','add','queue'],
      category: 'tunes',
			clientPermissions: ['SEND_MESSAGES'],
      args: [
				{
					id: 'search',
					default: '',
				},
			],
			channelRestriction: 'guild', 
		});
	}

	exec(message) {
	if (!message.member.voice.channel) return message.channel.send(`${client.emotes.error} - You're not in a voice channel !`);
	if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${client.emotes.error} - You are not in the same voice channel !`);
	if (!args[0]) return message.channel.send(`${client.emotes.error} - Please indicate the title of a song !`);
	var player = client.memory.get(client.guild, player) || client.memory.set(client.guild, new Player(client));
	player.play(message, args.join(" "), { firstResult: true });
        
        
 /* 
		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setTitle('About Discord Akairo Boilerplate')
			.addField('Creator', [
				'**Discord**: Snipey#0001',
				'**Twitter**: https://twitter.com/snipeydev',
				'**Patreon**: https://patreon.com/snipeydev',
				'**Github**: https://github.com/snipey',
			], true);

		return message.channel.send(embed);
    */
	}
}

module.exports = PlayCommand;


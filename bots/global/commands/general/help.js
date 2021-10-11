const { Command } = require('discord-akairo');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'halp', 'h'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'Which command do you need help with?',
						retry: 'Please provide a valid command.',
						optional: true,
					},
				},
			],
			description: {
				content: 'Displays a list of commands or information about a command.',
				usage: '[command]',
			},
		});
	}

	async exec(message, { command }) {
		let embed = this.client.util.embed()
			.setColor(0xFFAC33)
		
		if (!command){
			embed = this.execCommandList(message,embed);
		}else{
			embed = this.execCommandQuery(message,embed,command);
		}

		embed.private = true;
		return embed
	}

	execCommandQuery(message,embed,command) {
			const prefix = this.handler.prefix(message);
		
			const description = Object.assign({
				content: 'No description available.',
				usage: '',
				examples: [],
				fields: [],
			}, command.description);

			embed
				.setTitle(`\`${prefix}${command.aliases[0]} ${description.usage}\``)
				.addField('Description', description.content);

			for (const field of description.fields) embed.addField(field.name, field.value);

			if (description.examples.length) {
				const text = `${prefix}${command.aliases[0]}`;
				embed.addField('Examples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
			}

			if (command.aliases.length > 1) {
				embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
			}
		return embed
	}
	
	
	execCommandList(message,embed) {
		const prefix = this.handler.prefix(message);
		embed.addField('Command List',
				[
					'This is a list of commands.',
					`The bots prefix is \`${prefix}\``,
					'To view the guide which explains how to use BoilerplateBot in depth, use `;guide`.',
				]);

		for (const category of this.handler.categories.values()) {
			const title = {
				general: '📝\u2000General',
			}[category.id]||category.id;

			embed.addField(title, `\`${category.map(cmd => cmd.aliases[0]).join('` `')}\``);
		}


		return embed;
	}
}

module.exports = HelpCommand;

const {Command} = require("discord-akairo");

class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "halp", "h"],
			category: "general",
			clientPermissions: ["EMBED_LINKS"],
			args: [
				{
					id: "command",
					type: "commandAlias",
					prompt: {
						start: "Which command do you need help with?",
						retry: "Please provide a valid command.",
						optional: true,
					},
				},
			],
			description: {
				content: "Displays a list of commands or information about a command.",
				usage: "[command]",
			},
		});
	}

	async exec(message, {command}) {
		let embed;
		if (!command){
			embed = this.execCommandList(message);
		}

		
		if(!embed){
			const prefix = this.handler.prefix(message);
			const description = Object.assign(
				{
					content: "No description available.",
					usage: "",
					examples: [],
					fields: [],
				},
				command.description
			);
			embed = this.client.util
				.embed()
				.setColor(0xffac33)
				.setTitle(`\`${prefix}${command.aliases[0]} ${description.usage}\``)
				.addField("Description", description.content);

			for (const field of description.fields) embed.addField(field.name, field.value);

			if (description.examples.length) {
				const text = `${prefix}${command.aliases[0]}`;
				embed.addField("Examples", `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
			}

			if (command.aliases.length > 1) {
				embed.addField("Aliases", `\`${command.aliases.join("` `")}\``, true);
			}
		}


// 		const canReply = message.guild && message.channel.permissionsFor(this.client.user).has("SEND_MESSAGES");
// 		try {
// 			await message.author.send({embed});
// 			if (canReply) return message.util.reply("I've sent you a DM with the command list.");
// 		} catch (err) {
// 			await message.channel.send({embed});
// 			if (canReply) return message.util.reply("I could not send you the command list in DMs.");
// 		}
		
		return message.util.send({embed});
	}

	async execCommandList(message) {
		const prefix = this.handler.prefix(message);

		const embed = this.client.util
			.embed()
			.setColor(0xffac33)
			.addField("Command List", [
				"This is a list of commands.",
				`The bot\'s prefix is \`${prefix}\``,
				//"To view the guide which explains how to use this Bot in depth, use `${prefix}guide`.",
			]);

		for (const category of this.handler.categories.values()) {
			const title = {
				general: "📝 General",
			}[category.id] || category.id;

			embed.addField(title, "`" + category.map((cmd) => cmd.aliases[0]).join("` `") + "`");
		}

		return embed;
	}
}

module.exports = HelpCommand;

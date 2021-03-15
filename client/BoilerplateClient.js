// Discord Stuff
const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
// Import the database settings
const Database = require('../client/Database');
// Providers
const SettingsProvider = require('../client/providers/SettingsProvider');
const MemoryCache = require('../client/providers/MemoryCache');
const path = require('path');

// Models
const Setting = require('../models/settings');
// Logger
const Logger = require('../util/logger');

// Node Modules
const path = require('path');
require('dotenv').config();


function isSubdir (parent,dir){
	const relative = path.relative(parent, dir);
	const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function loadFilter (path,botPath,folderName,){
	const commands = path.join(botPath,folderName);
	const generalCommands = path.join(config.botPath,'../general',folderName);
	return isSubdir(commands,path) || isSubdir(generalCommands,path);
}

class BoilerplateClient extends AkairoClient {
	constructor(config) {
		super({
			ownerID: '',
			disabledEvents: ['TYPING_START'],
			commandUtilLifetime: 600000,
		});
		// Init config
		this.config = config;
		// Init Logger
		this.logger = Logger;
		// Init Command Handler
		this.commandHandler = new CommandHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,config.botPath,'commands'),
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild, 'prefix', '!'),
			allowMention: true,
			fetchMembers: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			commandUtilSweepInterval: 9e5,
			handleEdits: true,
			defaultCooldown: 2500,
			argumentDefaults: {
				prompt: {
					modifyStart: (msg, text) => text && `${msg.author} **::** ${text}\nType \`cancel\` to cancel this command.`,
					modifyRetry: (msg, text) => text && `${msg.author} **::** ${text}\nType \`cancel\` to cancel this command.`,
					timeout: msg => `${msg.author} **::** Time ran out, command has been cancelled.`,
					ended: msg => `${msg.author} **::** Too many retries, command has been cancelled.`,
					cancel: msg => `${msg.author} **::** Command has been cancelled.`,
					retries: 4,
					time: 30000,
				},
			},
		});
		// Init Listener Handler
		this.listenerHandler = new ListenerHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,config.botPath,'listeners'),
		});
		// Init Inhibitor Handler
		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,config.botPath,'inhibitors'),
		});
		// Init Setting
		this.settings = new SettingsProvider(Setting);
		this.memory = new MemoryCache();
		// Init client embed
		this.embed = MessageEmbed;
		// Run setup
		this.setup();
	}

	// Setup all our handlers/listeners/inhibitors
	setup() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});
		// Load all handlers
		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}
	// Start The Bot
	async start() {
		await Database.authenticate();
		await this.settings.init();
		return this.login(this.config.token);
	}
}

module.exports = BoilerplateClient;

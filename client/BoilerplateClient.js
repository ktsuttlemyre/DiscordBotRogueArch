// Discord Stuff
const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
// Import the database settings
const Database = require('../client/Database');
// Providers
const SettingsProvider = require('../client/providers/SettingsProvider');
const MemoryCache = require('../client/providers/MemoryCache');

// Models
const Setting = require('../models/settings');
// Logger
const Logger = require('../util/logger');

// Node Modules
const path = require('path');
require('dotenv').config();

const util = require.main.require('./util');
const config = util.config;

//https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
function isSubdir (parent,dir){
	const relative = path.relative(parent, dir);
	const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
	return isSubdir;
}

function loadFilter (botPath,folderName,dir){
	const commands = path.join(botPath,folderName);
	const globalCommands = path.join(botPath,'../global',folderName);
	const load = isSubdir(commands,dir) || isSubdir(globalCommands,dir);
	config.debug && console.info(`botPath=${botPath} folderName=${folderName} dir=${dir} load=${load}`)
	return load;
}


class BoilerplateClient extends AkairoClient {
	constructor(opts) {
		super({
			ownerID: opts.owner,
			//disabledEvents: ['TYPING_START'],
			//commandUtilLifetime: 600000,
		},{ //Discord.js options https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
			messageCacheMaxSize:20, //Maximum number of messages to cache per channel (-1 or Infinity for unlimited - don't do this without message sweeping, otherwise memory usage will climb indefinitely)
			messageCacheLifetime:60, //How long a message should stay in the cache until it is considered sweepable (in seconds, 0 for forever)
			messageSweepInterval:60, //How frequently to remove messages from the cache that are older than the message cache lifetime (in seconds, 0 for never)
			//disableMentions: "everyone",
			//restTimeOffset: 0
		});
		// Init config
		this.config = opts;
		// Init Logger
		this.logger = Logger;
		// Init Command Handler
		this.commandHandler = new CommandHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,opts.botPath,'commands'),
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild, 'prefix', '!'),
			allowMention: true,
			fetchMembers: true,
			//commandUtil: false,
			//commandUtilLifetime: 3e5,
			//commandUtilSweepInterval: 9e5,
			//handleEdits: true,
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
		this.commandHandler.on('commandBlocked',function(message,command,reason){
					let prefix = util.commandFormat(message,command);
					let commandName = command.id.split('/').pop();
					message.channel.send(`\`${prefix}${commandName}\` failed because ${reason}`);
				})
				.on('commandCancelled',function(message,command,retryMessage){
					let prefix = util.commandFormat(message,command);
					let commandName = command.id.split('/').pop();
					message.channel.send(`\`${prefix}${commandName}\` cancelled`);
				}) //retryMessage is optional
				.on('commandDisabled',function(message,command){
					let prefix = util.commandFormat(message,command);
					let commandName = command.id.split('/').pop();
					message.channel.send(`\`${prefix}${commandName}\` disabled`);
				})
				//.on('commandFinished',function(){})
				//.on('commandStarted',function(){})
				.on('cooldown',function(message,command,remaining){
					let prefix = util.commandFormat(message,command);
					let commandName = command.id.split('/').pop();
					message.channel.send(`\`${prefix}${commandName}\` is in cooldown`);
					//TODO add time remaining for long running cooldowns
				})
				.on('error',function(error,message,command){
					let prefix = util.commandFormat(message,command);
					let commandName = command.id.split('/').pop();
					if(command){		
						message.channel.send(`\`${prefix}${commandName}\` got error ${error.name}: ${error.message}`);
					}else{
						message.channel.send(`Got error ${error.name}: ${error.message}`);
					}
					console.error(error);
				})
				.on('inPrompt',function(message){
					let user = message.member||message.author;
					let name = user.displayName || user.tag;
					message.channel.send(`Currently talking to ${name} please wait for them to finish.`);
				})
				//.on('load',function(){})
				//.on('messageBlocked',function(message,reason){message.channel.send(`Message blocked due to ${reason}`);})
				//.on('messageInvalid',function(message){message.channel.send(`Message invalid`);})
				.on('missingPermissions',function(message,command,type,missing){
					let user = message.member||message.author;
					let name = user.displayName || user.tag;
					let prefix = util.commandFormat(message,command);
					let search = (missing||'').toLowerCase();
					let isRole = message.guild.roles.cache.find(role => missing == role.name.toLowerCase());
					let commandName = command.id.split('/').pop();
					if(isRole){
						return message.channel.send(`${type} must have permission ${missing} role in order to execute \`${prefix}${commandName}\``);
					}
					message.channel.send(`${type} must have permission ${missing} in order to execute \`${prefix}${commandName}\``);		
				});
				//.on('remove',function(command){});
		// Init Listener Handler
		this.listenerHandler = new ListenerHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,opts.botPath,'listeners'),
		});
		// Init Inhibitor Handler
		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: './bots',
			loadFilter:loadFilter.bind(loadFilter,opts.botPath,'inhibitors'),
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

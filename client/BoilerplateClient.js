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
	console.log(`botPath=${botPath} folderName=${folderName} dir=${dir} load=${load}`)
	return load;
}

function prefixFormat(message,command){
	let prefix = command.prefix || (command.handler.prefix.call)?command.handler.prefix(message):command.handler.prefix;
	return (Array.isArray(prefix))?JSON.stringify(prefix):prefix; 
}

class BoilerplateClient extends AkairoClient {
	constructor(config) {
		super({
			ownerID: config.owner,
			//disabledEvents: ['TYPING_START'],
			//commandUtilLifetime: 600000,
		},{ //Discord.js options https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
			//disableMentions: "everyone",
			//restTimeOffset: 0
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
					let prefix = prefixFormat(message,command);
					message.channel.send(`\`${prefix}${command.id}\` failed because ${reason}`);
				})
				.on('commandCancelled',function(message,command,retryMessage){
					let prefix = prefixFormat(message,command);
					message.channel.send(`\`${prefix}${command.id}\` cancelled`);
				}) //retryMessage is optional
				.on('commandDisabled',function(message,command){
					let prefix = prefixFormat(message,command);
					message.channel.send(`\`${prefix}${command.id}\` disabled`);
				})
				//.on('commandFinished',function(){})
				//.on('commandStarted',function(){})
				.on('cooldown',function(message,command,remaining){
					let prefix = prefixFormat(message,command);
					message.channel.send(`\`${prefix}${command.id}\` is in cooldown`);
					//TODO add time remaining for long running cooldowns
				})
				.on('error',function(error,message,command){
					let prefix = prefixFormat(message,command);
					if(command){		
						message.channel.send(`\`${prefix}${command.id}\` got error ${error.name}: ${error.message}`);
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
					let prefix = prefixFormat(message,command);
					let search = (missing||'').toLowerCase();
					let isRole = message.guild.roles.cache.find(role => missing == role.name.toLowerCase());
					if(isRole){
						return message.channel.send(`${type} must have permission ${missing} role in order to execute \`${prefix}${command.id}\``);
					}
					message.channel.send(`${type} must have permission ${missing} in order to execute \`${prefix}${command.id}\``);		
				});
				//.on('remove',function(command){});
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

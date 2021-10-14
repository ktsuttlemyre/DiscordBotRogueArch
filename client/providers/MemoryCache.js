const {Guild, Channel} = require("discord.js");
const Discord = require("discord.js");
const cache = {};

class MemoryCache {
	constructor() {
		//		super(table, {
		//			idColumn: 'guildID',
		//			dataColumn: 'settings',
		//		});
	}

	// channelGet(message, key, defaultValue) {
	// 	let id = this.constructor.getGuildID(message.guild);
	// 	if (!message.channel) {
	// 		throw new Error("Memory ChannelGet needs to have a message with a proper channel object passed to it");
	// 	}
	// 	const channelID = this.constructor.getChannelID(message.channel);
	// 	if (!channelID) {
	// 		throw new Error("Channel.id must be specified if you want to get a channel value in memory");
	// 	}
	// 	id = `${id}/${channelID}`;
	// 	let value = cache[id] ? cache[id][key] : (cache[id] = {}) && undefined;
	// 	if (value === undefined) {
	// 		return (cache[id][key] = defaultValue);
	// 	}
	// 	return value;
	// }

	// channelSet(message, key, value) {
	// 	let id = this.constructor.getGuildID(message.guild);
	// 	if (!message.channel) {
	// 		throw new Error("Memory ChannelSet needs to have a message with a proper channel object passed to it");
	// 	}
	// 	const channelID = this.constructor.getChannelID(message.channel);
	// 	if (!channelID) {
	// 		throw new Error("Channel.id must be specified if you want to set a channel value in memory");
	// 	}
	// 	id = `${id}/${channelID}`;
	// 	if (!cache[id]) {
	// 		cache[id] = {};
	// 	}
	// 	return (cache[id][key] = value);
	// }

	get(obj, key, defaultValue) {
		const id = this.constructor.getID(obj);
		let value = cache[id] ? cache[id][key] : (cache[id] = {}) && undefined;
		if (value === undefined) {
			return (cache[id][key] = defaultValue);
		}
		return value;
	}

	set(obj, key, value) {
		const id = this.constructor.getID(obj);
		if (!cache[id]) {
			cache[id] = {};
		}
		return (cache[id][key] = value);
	}

	delete(obj, key) {
		const id = this.constructor.getID(obj);
		cache[id][key] = undefined;
		delete cache[id][key];
		return undefined;
	}

	clear(obj) {
		const id = this.constructor.getID(obj);
		return (cache[id] = {});
	}

	static getID(obj){
		let channelID='', guildID='';

		if(obj instanceof Discord.Message){
			throw "Trying to store an item in memory using a message as the identifier isn\'t currently allowed"
		}else if(obj instanceof Discord.GuildChannel){
			channelID = this.constructor.getChannelID(obj);
			guildID = this.constructor.getGuildID(obj.guild);
		}else if(obj instanceof Discord.Channel){
			channelID = this.constructor.getChannelID(obj);
			guildID = this.constructor.getGuildID(obj.guild);
		}else if(obj instanceof Discord.Guild){
			guildID = this.constructor.getGuildID(obj);
		}

		if(typeof obj.guild == 'string'){
			guildID = this.constructor.getGuildID(obj.guild);
		}
		if(typeof obj.channel == 'string'){
			channelID = this.constructor.getChannelID(obj.guild);
		}

		if(guildID && !channelID){
			return `${guildID}`;
		}else if(guildID && channelID){
			return `${guildID}/${channelID}`;
		}
		throw "couldn\'t construct an id for obj to store in memory"
	}

	static getGuildID(guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === "global" || guild === null) return "global";
		let id = guild.id || guild;
		if (typeof id === "string" && /^\d+$/.test(id)) return id;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
	static getChannelID(channel) {
		if (channel instanceof Channel) return channel.id;
		//if (guild === 'global' || guild === null) return 'global';
		let id = channel.id || channel;
		if (typeof id === "string" && /^\d+$/.test(id)) return id;
		throw new TypeError("Invalid channel specified. Must be a Channel instance"); //, guild ID, "global", or null.');
	}
}

module.exports = MemoryCache;

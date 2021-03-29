const { Guild, Channel} = require('discord.js');
const cache = {};

class MemoryCache {
	constructor() {
//		super(table, {
//			idColumn: 'guildID',
//			dataColumn: 'settings',
//		});
	}

	channelGet(message, key, defaultValue) {
		let id = this.constructor.getGuildID(message.guild);
		const channelID = this.constructor.getChannelID(message.channel);
		if(!channelID){
			throw new Error('Channel.id must be specified if you want to get a channel value in memory')
		}
		id=`${id}/${channelID}`;
		let value = (cache[id])?cache[id][key]:(cache[id]={}) && undefined;
		if(value === undefined){
			return cache[id][key]=defaultValue;;
		}
		return value;
	}
	

	channelSet(message, key, value) {
		let id = this.constructor.getGuildID(message.guild);
		const channelID = this.constructor.getChannelID(message.channel);
		if(!channelID){
			throw new Error('Channel.id must be specified if you want to set a channel value in memory')
		}
		id=`${id}/${channelID}`;
		if(!cache[id]){
			cache[id]={};
		}
		return cache[id][key]=value;
	}


	get(message, key, defaultValue) {
		const id = this.constructor.getGuildID(message.guild);
		let value = (cache[id])?cache[id][key]:(cache[id]={}) && undefined;
		if(value === undefined){
			return cache[id][key]=defaultValue;
		}
		return value;
	}

	set(message, key, value) {
		const id = this.constructor.getGuildID(message.guild);
		if(!cache[id]){
			cache[id]={};
		}
		return cache[id][key]=value;
	}

	delete(message, key) {
		const id = this.constructor.getGuildID(message.guild);
		cache[id][key]=undefined;
		delete cache[id][key];
		return undefined;
	}

	clear(message) {
		const id = this.constructor.getGuildID(message.guild);
		return cache[id]={};
	}

	static getGuildID(guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return 'global';
		let id = guild.id || guild;
		if (typeof id === 'string' && /^\d+$/.test(id)) return id;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
	static getChannelID(channel){
		if (channel instanceof Channel) return channel.id;
		//if (guild === 'global' || guild === null) return 'global';
		let id = channel.id || channel;
		if (typeof id === 'string' && /^\d+$/.test(id)) return id;
		throw new TypeError('Invalid channel specified. Must be a Channel instance'); //, guild ID, "global", or null.');
	}
}

module.exports = MemoryCache;

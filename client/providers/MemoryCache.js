const { Guild } = require('discord.js');
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
		const channelID = (typeof message.channel == 'string')?message.channel:message.channel.id;
		id=`${id}/${channelID}`;
		let value = (cache[id])?cache[id][key]:(cache[id]={}) && undefined;
		if(value === undefined){
			return defaultValue;
		}
		return value;
	}
	

	channelSet(message, key, value) {
		let id = this.constructor.getGuildID(message.guild);
		const channelID = (typeof message.channel == 'string')?message.channel:message.channel.id;
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
			return defaultValue;
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
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}

module.exports = MemoryCache;

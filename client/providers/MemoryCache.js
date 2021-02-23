const { Guild } = require('discord.js');
const cache = {};

class MemoryCache {
	constructor() {
//		super(table, {
//			idColumn: 'guildID',
//			dataColumn: 'settings',
//		});
	}

	get(guild, key, defaultValue) {
		const id = this.constructor.getGuildID(guild);
		let value = (cache[id])?cache[id][key]:(cache[id]={}) && undefined;
		if(value === undefined){
			return defaultValue;
		}
		return value;
	}

	set(guild, key, value) {
		const id = this.constructor.getGuildID(guild);
		if(!cache[id]){
			cache[id]={};
		}
		return cache[id][key]=value;
	}

	delete(guild, key) {
		const id = this.constructor.getGuildID(guild);
		cache[id][key]=undefined;
		delete cache[id][key];
		return undefined;
	}

	clear(guild) {
		const id = this.constructor.getGuildID(guild);
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

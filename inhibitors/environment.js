const { Inhibitor } = require('discord-akairo');

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('blacklist', {
            reason: 'environment',
            type: 'all'
        });
    }

    exec(message) {
        // Still a meanie!
        const blacklist = ['81440962496172032'];
        return blacklist.includes(message.author.id);
    }
}

module.exports = BlacklistInhibitor;

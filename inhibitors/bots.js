const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('bots', {
            reason: 'ignore bots',
            type: 'all'
        });
    }

    exec(message) {
        return message.member.bot;
    }
}

module.exports = CustomInhibitor;

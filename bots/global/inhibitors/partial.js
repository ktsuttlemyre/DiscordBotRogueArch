const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('partial', {
            reason: 'ignore partials for commands',
            type: 'all'
        });
    }

    exec(message) {
        let member = message.member;
        let partial = message.partial;
        return partial;
    }
}

module.exports = CustomInhibitor;

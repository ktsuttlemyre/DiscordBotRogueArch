const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('self', {
            reason: 'ignore self',
            type: 'all'
        });
    }

    exec(message) {
        return message.guild.me.id == message.member.id
    }
}

module.exports = CustomInhibitor;

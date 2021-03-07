const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('bots', {
            reason: 'ignore bots',
            type: 'all'
        });
    }

    exec(message) {
        var member = message.member;
        if(member && member.user && member.user.bot){
            return true
        }
        return false;
    }
}

module.exports = CustomInhibitor;

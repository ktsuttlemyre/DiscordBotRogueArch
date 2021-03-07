const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('self', {
            reason: 'ignore self',
            type: 'all'
        });
    }

    exec(message) {
        var me = message.guild.me;
        if(me && me.id){
            return me.id == message.member.id
        }
    }
}

module.exports = CustomInhibitor;

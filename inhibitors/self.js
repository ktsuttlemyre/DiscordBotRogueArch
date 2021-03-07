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
            var member = message.member;
            if(member){
                return me.id == member.id
            }
        }
    }
}

module.exports = CustomInhibitor;

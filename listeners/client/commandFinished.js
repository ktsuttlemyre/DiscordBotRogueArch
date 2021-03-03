const { Listener } = require('discord-akairo');
const {reactions,defaultAvatar} = require.main.require('./common');

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandFinished
class CommandBlockedListener extends Listener {
    constructor() {
        super('commandFinished', {
            emitter: 'commandHandler',
            event: 'commandFinished'
        });
    }

    exec(message, command, reason) {
        //message.react(reactions.shipwash); //THIS should be handled elsewhere
        //console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;

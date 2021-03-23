const { Listener } = require('discord-akairo');
const {reactions,defaultAvatar} = require.main.require('./common');
const commandVars = require.main.require('./common').commandVars(__filename);

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandStarted
class CommandBlockedListener extends Listener {
    constructor() {
        super('global/'+commandVars.id, {
            emitter: 'commandHandler',
            event: 'commandStarted'
        });
    }

    exec(message, command, reason) {
        message.react(reactions.shipwash); //THIS should be handled elsewhere
        //console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;

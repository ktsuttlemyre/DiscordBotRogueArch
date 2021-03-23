const { Listener } = require('discord-akairo');
const commandVars = requre.main.require.commandVars(__filename);

class CommandBlockedListener extends Listener {
    constructor() {
        super('global/'+commandVars.id, {
            emitter: 'commandHandler',
            event: 'commandBlocked'
        });
    }

    exec(message, command, reason) {
        console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;

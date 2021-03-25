const { Listener } = require('discord-akairo');
const util = require.main.require('./util');
const commandVars = util.commandVars(__filename);

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandFinished
class CommandBlockedListener extends Listener {
    constructor() {
        super('global/'+commandVars.id, {
            emitter: 'commandHandler',
            event: 'commandFinished'
        });
    }

    async exec(message, command, args, returnValue) {
        if(returnValue.call){
            returnValue = await returnValue();
        }
        if(message && !message.deleted){
           await util.messages.encapsulate(message,returnValue);
        }
    }
}

module.exports = CommandBlockedListener;

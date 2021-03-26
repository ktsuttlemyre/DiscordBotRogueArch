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
        let promise = this.client.memory.channelGet(message,`${message.id}_promise`);
        let resolve = this.client.memory.channelGet(message,`${message.id}_resolve`);
        
        if(returnValue !== undefined){ // && returnValue.call){
            returnValue = await returnValue;
            setTimeout(function(){
                resolve(returnValue);
            },1)
            returnValue = await promise
        }
        
        if(returnValue === undefined){
            returnValue = await promise;
        }
        
        this.client.memory.channelSet(message,`${message.id}_promise`, null);
        this.client.memory.channelSet(message,`${message.id}_resolve`, null);
        
        if(message && !message.deleted){
           await util.messages.encapsulate(message,returnValue);
        }
    }
}

module.exports = CommandBlockedListener;

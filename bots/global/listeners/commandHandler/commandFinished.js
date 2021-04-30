const { Listener } = require("discord-akairo");
const util = require.main.require("./util");
const config = util.config;
const commandVars = util.commandVars(__filename);

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandStarted
class CustomListener extends Listener {
  constructor() {
    super("global/" + commandVars.id, {
      emitter: commandVars.category,
      event: commandVars.name,
      category: commandVars.category,
    });
  }

  async exec(message, command, args, returnValue) {
    let promise = this.client.memory.channelGet(
      message,
      `${message.id}_promise`
    );
    let resolve = this.client.memory.channelGet(
      message,
      `${message.id}_resolve`
    );

    if (returnValue !== undefined) {
      // && returnValue.call){
      returnValue = await returnValue;
      setTimeout(function () {
        resolve(returnValue);
      }, 1);
      returnValue = await promise;
    }

    if (returnValue === undefined) {
      returnValue = await promise;
    }

    //delete the entry
    this.client.memory.channelSet(message, `${message.id}_promise`, null);
    this.client.memory.channelSet(message, `${message.id}_resolve`, null);

    //respond
    if (message && !message.deleted) {
      //if they deleted the message then don't do anything
      let reply = await util.messages.encapsulate(message, returnValue);
      let callback = returnValue.callback;
      if (callback) {
        callback.call && callback(reply);
      }
    }
  }
}

module.exports = CustomListener;

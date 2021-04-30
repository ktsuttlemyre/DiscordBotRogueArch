const { Inhibitor } = require("discord-akairo");

class CustomInhibitor extends Inhibitor {
  constructor() {
    super("self", {
      reason: "ignore self",
      type: "all",
    });
  }

  exec(message) {
    let me = message.client.user;
    if (me && me.id) {
      let user = message.author || message.member;
      if (user) {
        return me.id == user.id;
      }
    }
  }
}

module.exports = CustomInhibitor;

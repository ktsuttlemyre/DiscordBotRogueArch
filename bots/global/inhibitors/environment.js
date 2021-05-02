const { Inhibitor } = require('discord-akairo');
const util = require.main.require('./util');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('environment', {
            reason: 'environment',
            type: 'all'
        });
    }

    exec(message) {
        return util.devChannelGate(message);
    }
}

module.exports = CustomInhibitor;

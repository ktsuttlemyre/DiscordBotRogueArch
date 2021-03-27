const { Inhibitor } = require('discord-akairo');
const { devChannelID } = require.main.require('./config');
const util = require.main.require('./util');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('environment', {
            reason: 'environment',
            type: 'all'
        });
    }

    exec(message) {
        return util.environmentDisallowed();
    }
}

module.exports = CustomInhibitor;

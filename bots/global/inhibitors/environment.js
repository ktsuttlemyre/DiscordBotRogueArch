const { Inhibitor } = require('discord-akairo');

class CustomInhibitor extends Inhibitor {
    constructor() {
        super('environment', {
            reason: 'environment',
            type: 'all'
        });
    }

    exec(message) {
        var devChannelID='814518995755335773';
        
        var env = process.env.ENVIRONMENT
        if(env == 'production'){
            if(message.channel.id === devChannelID){
                return true;
            }
            return false;
        }else{
            if(message.channel.id === devChannelID){
                return false
            }
            return true;
        }
    }
}

module.exports = CustomInhibitor;

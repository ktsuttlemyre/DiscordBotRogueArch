const { Listener } = require('discord-akairo');
const util = require.main.require('./util');
const config = util.config;
const commandVars = util.commandVars(__filename);

// https://discord-akairo.github.io/#/docs/main/master/class/CommandHandler?scrollTo=e-commandStarted
class CustomListener extends Listener {
	constructor() {
		super(commandVars.name, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}
    
    async exec(user,speaking) {
//         message.react(reactions.shipwash); //THIS should be handled elsewhere
//         //console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
            
//         this.client.memory.channelSet(message,`${message.id}_promise`,new Promise(resolve => {
//             this.client.memory.channelSet(message,`${message.id}_resolve`,resolve);
//         }));
      
      return
      
       if (speaking.bitfield == 0 || user.bot) {
            return
        }
        console.log(`I'm listening to ${user.username}`)
        // this creates a 16-bit signed PCM, stereo 48KHz stream
        const audioStream = this.receiver.createStream(user, { mode: 'pcm' }) //TODO this expected to be voice_connection
        audioStream.on('error',  (e) => { 
            console.log('audioStream: ' + e)
        });
        let buffer = [];
        audioStream.on('data', (data) => {
            buffer.push(data)
        })
        audioStream.on('end', async () => {
            buffer = Buffer.concat(buffer)
            const duration = buffer.length / 48000 / 4;
            console.log("duration: " + duration)

            if (duration < 1.0 || duration > 19) { // 20 seconds max dur
                console.log("TOO SHORT / TOO LONG; SKPPING")
                return;
            }

            try {
                let new_buffer = await convert_audio(buffer)
                let out = await transcribe(new_buffer);
                if (out != null)
                    process_commands_query(out, mapKey, user.id); //mapkey is information on what commands map to what functions
            } catch (e) {
                console.log('tmpraw rename: ' + e)
            }


        })
      
      
      
    }
}

module.exports = CustomListener;






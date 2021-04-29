const { Listener } = require('discord-akairo');
const {reactions,defaultAvatar} = require.main.require('./common');
const config = require.main.require('./config')
const commandVars = require.main.require('./common').commandVars(__filename);

const Discord = require("discord.js");
const SILENCE=new Discord.Speaking(0);


//original atteniton code https://github.com/ktsuttlemyre/evobot/blob/attention-volume/index.js
class CustomListener extends Listener {
	constructor() {
		super(commandVars.id, {
			emitter: commandVars.category,
			event: commandVars.name,
			category: commandVars.category,
		});
	}

	async exec (member,speaking) {
		return
		var client = this.client;
		if(member.bot){
			return
		}
		const queue = member.guild.client.memory.get(member.guild,'musicPlayer);
							     
		const attention = queue.attention;
		if (!queue) return message.reply(i18n.__("volume.errorNotQueue")).catch(console.error);  

		if(speaking.equals(SILENCE) || member.voice.mute){ // || member.voice.streaming){ //not talking
			console.log('not speaking',queue.speaking)
			attention.speaking=Math.max(--attention.speaking,0);
		}else{
			attention.patience_ticks=attention.attention_patience * attention.fps; // seconds*fps
			console.log('speaking',attention.speaking)
			//count the speaking population
			attention.speaking++;


			//create setInterval function
			if(attention.on && !attention.toID){
			//save original volume
			attention.original_volume=queue.volume;

			attention.toID = setInterval(function(){
			  if(attention.speaking>0){
			    console.log('speaking interval',attention.speaking);
			    //if(queue.volume == attention.original_volume){
				//attention.tolerance_ticks--
			    //}
			    if(attention.start_sample_ticks>0){
			      attention.start_sample_ticks--;
			      return;
			    }
			    if(queue.volume>attention.min_volume){
			      console.log('vol down',attention.speaking,queue.volume)
			      //get volume
			      let vol = queue.volume-((attention.original_volume - attention.min_volume)/(attention.decrescendo_time * attention.fps));
			      //clamp value
			      vol = Math.min(100,Math.max(attention.min_volume,vol));
			      //set volume
			      queue.volume=vol;
			      queue.connection.dispatcher.setVolumeLogarithmic(vol / 100);
			    }
			  }else{//not speaking
			    console.log('not speaking interval',attention.speaking)
			    if(attention.speaking<=0){
				attention.start_sample_ticks=4; //one second
			    }
			    if(queue.volume<attention.original_volume){
			      if(queue.volume == attention.min_volume && attention.patience_ticks>0){
				attention.patience_ticks--;
				console.log('dampened wait')
				return
			      }
			      console.log('vol up',attention.speaking,queue.volume)
			      // get and add
			      let volume=queue.volume+((attention.original_volume - attention.min_volume)/(attention.crescendo_time * attention.fps));;
			      // set
			      queue.volume=volume;
			      queue.connection.dispatcher.setVolumeLogarithmic(volume / 100);
			    }else{
			      clearInterval(attention.toID);
			      attention.toID=0;
			    }
			  }
			},1000/attention.fps);
			}
		}

	} //end exec

}


module.exports = CustomListener;

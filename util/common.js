
exports.reactions={	      
	      upvote:'✅',
	      downvote:'❌',
	      shipwash:'802028980739768320'
	     }
exports.defaultAvatar='https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png';

exports.permalinkMessage=function(guild,channel,message){
  return `https://discord.com/channels/${guild.id}/${channel.id}/{message.id}`;
}

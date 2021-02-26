exports.reactions={	      
	      upvote:'✅',
	      downvote:'❌',
	      shipwash:'802028980739768320'
	     }
exports.defaultAvatar='https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png';

exports.permalinkMessage=function(guild,channel,message){
  return `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`;
}

exports.filterInPlace=function (a, condition) {
  let i = 0, j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
}

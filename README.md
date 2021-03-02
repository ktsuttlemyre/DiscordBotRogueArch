# Discord Akiro Boilerplate Bot

I made this bot to play music, utalize heroku sleep, and run various managment rutines.

It runs 2 instances of discord.js clients. (Shiptunes and Shipmod)
So far it doesn't need a database and uses emojis to process commands that were sent during sleep.

## Features
 - Bot sleeps unless:
   - someone is in a voice channel
   - owner's status is active in discord
   - someone sent a message <30 minutes ago to the guild
- Created with [Discord.js](https://discord.js.org/), [akairo](https://discord-akairo.github.io/), and [discord-akairo-boilerplate](https://github.com/Snipey/discord-akairo-boilerplate)
- Basic commands to get you started
- Database handler for sequelize (pg support only right now. soon™)
- Custom logger for console


 ## Envorinment Variables
 - ACTIVITY
 - ATTENTION_VOLUME
 - DISCORD_TOKEN
 - ENVIRONMENT
 - HEROKU_APP_NAME
 - MAX_PLAYLIST_SIZE
 - OWNERS
 - POSTGRES_DB
 - POSTGRES_HOST
 - POSTGRES_PASSWSORD
 - POSTGRES_PORT
 - POSTGRES_URL
 - POSTGRES_USER
 - PREFIX
 - SHIPMOD_TOKEN
 - SOUNDCLOUD_CLIENT_ID
 - TOKEN
 - YOUTUBE_API_KEY


## Commands
- Help
- Stats
- About
- Prefix



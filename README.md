# ShipBots Infrastructre projet

I made this project to make creating bots easy. Just create a bot file using your bot's name in `bots/` and add subfolders such as
 -  `commands/<category>`
 -  `listeners`
 -  `inhibitors`
 -  etc to add functions to your bot
After creating a bot folder with bot code be sure to add an enviornment variable `TOKEN_<BOTNAME>` to the environment
`./bots/global` are common commands that will be added to every bot you put into `./bots/`

# Current Architecture Features
 - music
 - utalize heroku
 - support heroku sleep
 - voice to text linking rooms 
 - sessions (defined between times of wake and sleep)
 - run various managment rutines.
 - So far it doesn't need a database and uses emojis to process commands that were sent during sleep.
 - Bot sleeps unless:
   - someone is in a voice channel
   - owner's status is active in discord
   - someone sent a message <30 minutes ago to the guild
 - Created with [Discord.js](https://discord.js.org/), [akairo](https://discord-akairo.github.io/), and [discord-akairo-boilerplate](https://github.com/Snipey/discord-akairo-boilerplate)
 - Basic commands to get you started
 - Database handler for sequelize (pg support only right now. soon™)
 - Custom logger for console
 - wake.js
   - use wake.js in a heroku scheduler task.
   - Set it to run every 10min and it will log into discord, check for activity and use the HEROKU_APP_NAME variable to ping the app (ex: https://<HEROKU_APP_NAME>.herokuapp.com/)

## Curently implemented 2 bots (Shiptunes & Shipmod) but can be easily extended for more
 - Shiptunes = Music player that searches youtube, rips the sound and streams it to discord.
 - Shipmod = mod bot with useful commands, toys, and utilites


 ## Envorinment Variables
 - ACTIVITY
 - ATTENTION_VOLUME
 - NODE_ENV or ENVIRONMENT
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
 - TOKEN<BOTNAME>
 - SOUNDCLOUD_CLIENT_ID
 - YOUTUBE_API_KEY


## Commands
- see `./bots/<BOTNAME>/commands/<CATEGORY>/*` for a list
- Help
- Stats
- About
- Prefix


## Installation
Curently supports heroku with Procfile. Can be ran as a web or worker instance. 
Web instances support sleeping and need to have heroku scheduler configured to run `wake.js` every 10 minutes in order to wake the bot up
If you don't care about sleeping just use worker dynos.

## Usage


```Run the bot and run !help for help.```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.


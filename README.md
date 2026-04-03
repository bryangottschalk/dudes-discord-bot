# Dudes Discord bot

- Discord announcer bot that plays user-specific audio clips when members join/leave the designated server's voice channels, announcing their presence.
- Plays mp3 sound clips from a certain pointed-to directory.
- Announces local League of Legends game events and plays sound clips.

Based on https://github.com/walworob/dpr-discobot

### Software requirements

Make sure Node.js 20 or 22 LTS and npm are installed on your machine. <br/> <br/>
https://nodejs.org/en/ <br/>
https://www.npmjs.com/

### Setup

Copy `.env.sample` to `.env`, then replace the placeholder values before starting the bot. `DISCORD_BOT_TOKEN` comes from the Bot section of https://discord.com/developers/applications.

### Starting the Application

`npm install` to install dependencies <br/>
`npm start` to run the server

### Adding a clip to play when you join a voice channel

Upload a short audio file to your clips folder (path stored in the environment variable PATH_TO_CLIPS) and append your username and the filename you uploaded to the `discordUserAnnouncementDictionary`.

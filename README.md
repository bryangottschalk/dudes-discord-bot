# Dudes Discord bot

Discord announcer bot that plays user-specific audio clips when members join/leave the designated server's voice channels, announcing their presence.

Based on https://github.com/walworob/dpr-discobot

### Software requirements

Make sure NodeJS and the Yarn package manager are installed on your machine. <br/> <br/>
https://nodejs.org/en/ <br/>
https://classic.yarnpkg.com/lang/en/docs/install

### Setup

Create a `.env` file and copy/paste the contents of `.env.sample` into it to get started. `DISCORD_BOT_TOKEN` is required from the Bot section of https://discord.com/developers/applications.

### Starting the Application

`yarn install` to install dependencies <br/>
`yarn dev` to run the server

### Adding a clip to play when you join a voice channel

Upload a short audio file to `/clips` and append your username and the filename you uploaded to the `discordUserAnnouncementDictionary`

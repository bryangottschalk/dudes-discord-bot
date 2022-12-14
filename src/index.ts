import express, { Request, Response } from 'express';
import fs from 'fs';
import {
  Client,
  GatewayIntentBits,
  GuildBasedChannel,
  GuildMember,
  Partials,
  VoiceBasedChannel
} from 'discord.js';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  entersState,
  getVoiceConnection
} from '@discordjs/voice';
import {
  PresenceState,
  annouceUnhandledUser,
  annouceUserIsStreaming,
  connectToChannel,
  playClip,
  presenceIndicatesPlayingLeagueOfLegends
} from './helpers';
import {
  pollCurrentGame,
  setCachedEvents,
  setCachedGame
} from './league-of-legends-api/poll-current-game';
import { BotCommands } from './types';

const app = express();

// Grab environment variables from the .env file
const PORT = process.env.PORT || 8081;
const DISCORD_BOT_TOKEN: string = process.env.DISCORD_BOT_TOKEN || '';
const IS_LOL_ANNOUNCER_ENABLED: boolean =
  Boolean(process.env.LEAGUE_OF_LEGENDS_ANNOUNCER_ENABLED) ?? false;
const PATH_TO_CLIPS: string = process.env.PATH_TO_CLIPS || '';
const GUILD_ID: string = process.env.GUILD_ID || '';

// Create the bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});
// Create the audio player
const audioPlayer = createAudioPlayer();
// Create the array of bot usernames
const botUsernames: string[] = ['Big Announcer Dude#0867', 'dpr-DiscoBot#6636'];
// Create the announcement dictionary
const discordUserAnnouncementDictionary: { [key: string]: string } = {
  'kyhole#3631': 'shutUpKyle.mp3',
  'robborg#4693': 'RobbieHasArrived.mp3',
  'Jenkinz94#4030': 'NickHasArrived.mp3',
  'mr.barron#9498': 'AlexHasArrived.mp3',
  'Snapps#5034': 'SAMMMMM.mp3',
  'bryborg#3434': 'thebryansong.mp3',
  'Dru#7852': 'Dr_Dru_v2.mp3',
  'lKoNFlicTl#3922': 'This_is_Patrick.mp3',
  'NutDragSwag#0374': 'alexander_the_great.mp3'
};

// The VoiceBasedChannel the bot is connected to (null if not connected)
let channel: VoiceBasedChannel | null | undefined = null;
// The interval ID for polling the League of Legends Live Game Client API (null if not polling)
let leagueOfLegendsPollIntervalId: NodeJS.Timer | null = null;

// Event triggered when there is an error with the audio player
audioPlayer.on('error', (error) => {
  console.log('Error with audio player:', error);
});

// Event triggered when the client becomes ready to start working
client.once('ready', async (client) => {
  // Get the guild this bot is in
  const guild = await client.guilds.fetch(GUILD_ID);
  // If the bot starts in a VoiceChannel, find out which channel it is
  guild.channels.cache.forEach((curChannel: GuildBasedChannel) => {
    if (curChannel.isVoiceBased() && curChannel.members.has(client.user.id)) {
      // Set the channel this bot is in
      channel = curChannel;
      // If a member in this channel is in the middle of a LoL game and the announcer is enabled, start polling
      curChannel.members.forEach((member: GuildMember) => {
        if (
          member.presence &&
          presenceIndicatesPlayingLeagueOfLegends(member.presence) &&
          member.presence.activities[0].state === PresenceState.IN_GAME &&
          IS_LOL_ANNOUNCER_ENABLED
        ) {
          console.log('Polling game...');
          leagueOfLegendsPollIntervalId = pollCurrentGame(curChannel, audioPlayer, PATH_TO_CLIPS);
          return;
        }
      });
    }
  });
});

// Event triggered when a message is sent in a text channel
client.on('messageCreate', async (message) => {
  // Commands are represented by a '!'
  if (message.content.charAt(0) === '!') {
    const userCommand = message.content.split('!')[1].toLowerCase();
    channel = message.member?.voice.channel;

    if (channel) {
      if (userCommand === BotCommands.CMERE) {
        const connection = await connectToChannel(channel);
        connection?.subscribe(audioPlayer);

        // Check if playing league
        if (
          message.member?.presence &&
          presenceIndicatesPlayingLeagueOfLegends(message.member.presence) &&
          message.member.presence.activities[0].state === PresenceState.IN_GAME &&
          IS_LOL_ANNOUNCER_ENABLED
        ) {
          console.log('Polling game...');
          leagueOfLegendsPollIntervalId = pollCurrentGame(channel, audioPlayer, PATH_TO_CLIPS);
          return;
        }
      } else if (userCommand === BotCommands.GTFO) {
        // Clear LoL interval ID and game data if they were assigned previously
        if (leagueOfLegendsPollIntervalId !== null) {
          clearInterval(leagueOfLegendsPollIntervalId);
          console.log('Polling stopped.');
          setCachedEvents([]);
          setCachedGame(null);
        }
        // Stop the audio player if it's playing. This will cause the bot
        // to disconnect from the voice channel as well
        if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
          audioPlayer.stop(true);

          // Return when the audio player signals it's idle
          await entersState(audioPlayer, AudioPlayerStatus.Idle, 5000);
          return;
        } else {
          // If not playing anything, simply disconnect from the voice channel
          const connection = getVoiceConnection(channel.guild.id);
          connection?.destroy();
        }
      } else {
        fs.readdir(PATH_TO_CLIPS, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            files.forEach((file) => {
              if (file.split('.')[0].toLowerCase() === userCommand) {
                playClip(`${PATH_TO_CLIPS}${file}`, channel as VoiceBasedChannel, audioPlayer);
              }
            });
          }
        });
      }
    }
  }
});

// Event triggered when a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes, etc.
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Only process if the audio player currently is idle
  if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
    // User joins channel.

    // Set the channel for the bot to join
    channel = newState.channel;
    if (channel) {
      // Grab the username of the user who joined
      const username = newState?.member?.user.tag as string;
      const usernameNoHash = username.slice(0, username.length - 5);
      if (!oldState.streaming && newState.streaming) {
        annouceUserIsStreaming(channel, audioPlayer, usernameNoHash);
      }
      // The voiceStateUpdate callback is triggered for a variety of reasons, but we only care about some of them for intros.
      const DONT_INTRO = [
        (oldState.streaming && !newState.streaming) || (!oldState.streaming && newState.streaming),
        (oldState.selfDeaf && !newState.selfDeaf) || (!oldState.selfDeaf && newState.selfDeaf),
        (oldState.selfMute && !newState.selfMute) || (!oldState.selfMute && newState.selfMute),
        (oldState.serverDeaf && !newState.serverDeaf) ||
          (!oldState.serverDeaf && newState.serverDeaf),
        (oldState.serverMute && !newState.serverMute) ||
          (!oldState.serverMute && newState.serverMute)
      ];
      const isSwitchingChannel = Boolean(oldState.channel && newState.channel);
      const isJoiningChannel = oldState.channel === null && newState.channel !== null;
      if (
        DONT_INTRO.every((condition) => condition === false) &&
        (isJoiningChannel || isSwitchingChannel)
      ) {
        // Play a clip based on the username
        if (discordUserAnnouncementDictionary[username]) {
          playClip(
            `${PATH_TO_CLIPS}${discordUserAnnouncementDictionary[username]}`,
            channel,
            audioPlayer
          );
        } else {
          if (!botUsernames.includes(username)) {
            console.log('Unhandled user joined a voice channel. Announcing...');
            annouceUnhandledUser(channel, audioPlayer, usernameNoHash);
          }
        }
      }
      // User (not a bot) exits channel with users still in it
      else if (
        oldState.channel !== null &&
        newState.channel === null &&
        !oldState?.member?.user.bot &&
        oldState.channel.members.size !== 0 // don't bother playing if no one is still in the channel
      ) {
        // Bot will join the channel the user left
        channel = oldState.channel;
        await playClip(`${PATH_TO_CLIPS}seeyalata.mp3`, channel, audioPlayer);
      }
    }
  }
});

// Event triggered when a user's presence (e.g. status, activity, etc.) is changed.
client.on('presenceUpdate', async (_, newPresence) => {
  // Make sure this update is for someone present in the same VoiceChannel as the bot
  const member = newPresence.member;
  if (
    member &&
    channel &&
    member.voice.channelId === channel.id &&
    presenceIndicatesPlayingLeagueOfLegends(newPresence)
  ) {
    // Determine the state of the activity
    const activity = newPresence.activities[0];
    console.log(activity.state);
    switch (activity.state) {
      case PresenceState.IN_LOBBY:
      case PresenceState.IN_QUEUE:
      case PresenceState.IN_CHAMP_SELECT: {
        break;
      }
      case PresenceState.IN_GAME: {
        if (leagueOfLegendsPollIntervalId === null && IS_LOL_ANNOUNCER_ENABLED) {
          console.log('Polling game...');
          leagueOfLegendsPollIntervalId = pollCurrentGame(channel, audioPlayer, PATH_TO_CLIPS);
        }
        break;
      }
      default: {
        // Clear LoL interval ID and game data if they were assigned previously
        if (leagueOfLegendsPollIntervalId !== null) {
          clearInterval(leagueOfLegendsPollIntervalId);
          console.log('No longer in game, polling stopped.');
          setCachedEvents([]);
          setCachedGame(null);
          leagueOfLegendsPollIntervalId = null;
        }
        break;
      }
    }
  }
});

try {
  client.login(DISCORD_BOT_TOKEN);
} catch (err) {
  console.log(`Error logging in with Discord token: ${err}`);
}

app.get('/', (_: Request, res: Response): void => {
  res.send(`Listening for Discord events on the server...`);
});

app.listen(PORT, (): void => {
  console.log(`app running on port ${PORT}`);
});

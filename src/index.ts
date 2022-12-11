import express, { Request, Response } from 'express';
import {
  Client,
  GatewayIntentBits,
  Partials,
  VoiceBasedChannel
} from 'discord.js';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  getVoiceConnection
} from '@discordjs/voice';
import {
  annouceUnhandledUser,
  annouceUserIsStreaming,
  playClip
} from './helpers';

const PORT = process.env.PORT || 8081;
const app = express();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Create the bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

try {
  client.login(DISCORD_BOT_TOKEN);
} catch (err) {
  console.log(`Error logging in with Discord token: ${err}`);
}

let channel: VoiceBasedChannel;

client.once('ready', (client): void => {
  console.log('Ready!');
});

// Create the audio player
const audioPlayer = createAudioPlayer();

// Event triggered when the audio player goes idle (i.e. not playing anything)
audioPlayer.on(AudioPlayerStatus.Idle, () => {
  const connection = getVoiceConnection(channel.guild.id);
  connection?.destroy() ?? console.log('No connection found.');
});

// Event triggered when there is an error with the audio player
audioPlayer.on('error', (error) => {
  console.log('Error with audio player:', error);
});

const botUsernames: string[] = ['Big Announcer Dude#0867', 'dpr-DiscoBot#6636'];

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

// Event triggered when a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes, etc.
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Only process if the audio player currently is idle
  if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
    // User joins channel.

    // Set the channel for the bot to join
    channel = newState.channel as VoiceBasedChannel;
    // Grab the username of the user who joined
    const username = newState?.member?.user.tag as string;
    const usernameNoHash = username.slice(0, username.length - 5);
    const isStreaming = !oldState.streaming && newState.streaming;
    if (isStreaming) {
      annouceUserIsStreaming(channel, audioPlayer, usernameNoHash);
    }

    // The voiceStateUpdate callback is triggered for a variety of reasons, but we only care about some of them for intros.
    const DONT_INTRO = [
      (oldState.streaming && !newState.streaming) ||
        (!oldState.streaming && newState.streaming),
      (oldState.selfDeaf && !newState.selfDeaf) ||
        (!oldState.selfDeaf && newState.selfDeaf),
      (oldState.selfMute && !newState.selfMute) ||
        (!oldState.selfMute && newState.selfMute),
      (oldState.serverDeaf && !newState.serverDeaf) ||
        (!oldState.serverDeaf && newState.serverDeaf),
      (oldState.serverMute && !newState.serverMute) ||
        (!oldState.serverMute && newState.serverMute)
    ];
    const isSwitchingChannel = Boolean(oldState.channel && newState.channel);
    const isJoiningChannel =
      oldState.channel === null && newState.channel !== null;
    if (
      DONT_INTRO.every((condition) => condition === false) &&
      (isJoiningChannel || isSwitchingChannel)
    ) {
      // Play a clip based on the username
      if (discordUserAnnouncementDictionary[username]) {
        playClip(
          discordUserAnnouncementDictionary[username],
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
      await playClip('seeyalata.mp3', channel, audioPlayer);
    }
  }
});

app.get('/', (req: Request, res: Response): void => {
  res.send(`Listening for Discord events on the server...`);
});

app.listen(PORT, (): void => {
  console.log(`app running on port ${PORT}`);
});

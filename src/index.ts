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
import { playClip } from './helpers';

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

// Event triggered when a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes, etc.
client.on('voiceStateUpdate', async (oldState, newState) => {
  const introsEnabled = true;
  // Only process if the audio player currently is idle
  if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
    // User joins channel.
    const isChangingStreamingState =
      (oldState.streaming && !newState.streaming) ||
      (!oldState.streaming && newState.streaming);
    if (isChangingStreamingState) {
      // for some reason this voiceStateUpdate callback is triggered when people start/stop steaming. we need to do nothing when this occurs.
      return;
    }
    const isSwitchingChannel = oldState.channel && newState.channel;
    const isJoiningChannel =
      oldState.channel === null && newState.channel !== null;
    if (introsEnabled && (isJoiningChannel || isSwitchingChannel)) {
      // Set the channel for the bot to join
      channel = newState.channel;

      // Grab the username of the user who joined
      const username = newState?.member?.user.tag as string;

      // Play a clip based on the username
      switch (username) {
        case 'kyhole#3631':
          await playClip('shutUpKyle.mp3', channel, audioPlayer);
          break;
        case 'robborg#4693':
          await playClip('RobbieHasArrived.mp3', channel, audioPlayer);
          break;
        case 'Jenkinz94#4030':
          await playClip('NickHasArrived.mp3', channel, audioPlayer);
          break;
        case 'mr.barron#9498':
          await playClip('AlexHasArrived.mp3', channel, audioPlayer);
          break;
        case 'Snapps#5034':
          await playClip('SAMMMMM.mp3', channel, audioPlayer);
          break;
        case 'bryborg#3434':
          await playClip('thebryansong.mp3', channel, audioPlayer);
          break;
        case 'Dru#7852':
          await playClip('Dr_Dru_v2.mp3', channel, audioPlayer);
          break;
        case 'lKoNFlicTl#3922':
          await playClip('This_is_Patrick.mp3', channel, audioPlayer);
          break;
        default:
          console.log('Unhandled user joined a voice channel.');
      }
    }
    // User (not a bot) exits channel with users still in it
    else if (
      oldState.channel !== null &&
      newState.channel === null &&
      !oldState?.member?.user.bot &&
      oldState.channel.members.size !== 0
    ) {
      // Bot will join the channel the user left
      channel = oldState.channel;
      await playClip('seeyalata.mp3', channel, audioPlayer);
    }
  }
});

app.get('/', (req: Request, res: Response): void => {
  res.send(`Listening for members to join/leave the designated channel...`);
});

app.listen(PORT, (): void => {
  console.log(`app running on port ${PORT}`);
});

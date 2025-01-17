import express, { Request, Response } from 'express';
import {
  Client,
  GatewayIntentBits,
  GuildBasedChannel,
  GuildMember,
  Partials,
  VoiceBasedChannel
} from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer } from '@discordjs/voice';
import {
  PresenceState,
  announceUnhandledUser,
  annouceUserIsStreaming,
  connectToChannel,
  playClip,
  presenceIndicatesPlayingLeagueOfLegends,
  disconnectFromChannel,
  stopPlayingClip,
  findClipRecursively,
  playRandomClipFromFolder
} from './helpers';
import {
  isPolling,
  startPollingLoLGame,
  stopPollingLoLGame
} from './league-of-legends-api/poll-current-game';
import { BotCommands } from './types';
import {
  PORT,
  DISCORD_BOT_TOKEN,
  IS_LOL_ANNOUNCER_ENABLED,
  PATH_TO_CLIPS,
  GUILD_ID,
  EventFiles
} from './constants';

const app = express();

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

// The VoiceBasedChannel the bot is connected to (null if not connected)
let channel: VoiceBasedChannel | null | undefined = null;

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
      // Reconnect to the channel
      connectToChannel(channel);
      // If a member in this channel is in the middle of a LoL game and the announcer is enabled, start polling
      channel.members.forEach((member: GuildMember) => {
        if (
          member.presence &&
          presenceIndicatesPlayingLeagueOfLegends(member.presence) &&
          member.presence.activities[0].state === PresenceState.IN_GAME &&
          IS_LOL_ANNOUNCER_ENABLED
        ) {
          startPollingLoLGame(channel as VoiceBasedChannel, audioPlayer);
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
          startPollingLoLGame(channel, audioPlayer);
          return;
        }
      } else if (userCommand === BotCommands.GTFO) {
        // Stop polling LoL client (does nothing if not currently polling)
        stopPollingLoLGame();
        // Stop playing a clip (does nothing if not currently playing a clip)
        await stopPlayingClip(audioPlayer);
        // Disconnect from the channel
        disconnectFromChannel(channel);
      } else if (userCommand === BotCommands.POLL) {
        // Stop polling if already polling. Otherwise, start polling
        if (isPolling()) {
          stopPollingLoLGame();
        } else {
          startPollingLoLGame(channel, audioPlayer);
        }
      } else {
        const clip = findClipRecursively(PATH_TO_CLIPS, userCommand);

        // If the clip was found, play it.
        if (clip) {
          playClip(clip, channel as VoiceBasedChannel, audioPlayer);
        } else {
          console.log('command ' + userCommand + ' not found.');
        }
      }
    }
  }
});

// Event triggered when a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes, etc.
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Only process if the audio player currently is idle
  if (audioPlayer.state.status !== AudioPlayerStatus.Idle) {
    return;
  }

  // Set the channel for the bot to join
  channel = newState.channel;
  if (channel) {
    // Grab the username of the user who joined
    const username = newState?.member?.user.tag as string;
    const usernameNoHash = username?.split('#')[0] ?? '';
    const usernameNoSpecialChars = usernameNoHash.replace(/[^a-zA-Z0-9 ]/g, '');
    if (!oldState.streaming && newState.streaming) {
      annouceUserIsStreaming(channel, audioPlayer, usernameNoSpecialChars);
    }
    // The voiceStateUpdate callback is triggered for a variety of reasons, but we only care about some of them for intros.
    const DONT_INTRO = [
      (oldState.streaming && !newState.streaming) || (!oldState.streaming && newState.streaming),
      (oldState.selfDeaf && !newState.selfDeaf) || (!oldState.selfDeaf && newState.selfDeaf),
      (oldState.selfMute && !newState.selfMute) || (!oldState.selfMute && newState.selfMute),
      (oldState.serverDeaf && !newState.serverDeaf) ||
        (!oldState.serverDeaf && newState.serverDeaf),
      (oldState.serverMute && !newState.serverMute) || (!oldState.serverMute && newState.serverMute)
    ];
    const isSwitchingChannel = Boolean(oldState.channel && newState.channel);
    const isJoiningChannel = oldState.channel === null && newState.channel !== null;
    if (
      DONT_INTRO.every((condition) => condition === false) &&
      (isJoiningChannel || isSwitchingChannel)
    ) {
      // Look for a folder for the user. If there is one, play a random clip from it.
      if (!botUsernames.includes(username)) {
        const success = await playRandomClipFromFolder(
          `${EventFiles.DIS_USER_ENTER}${usernameNoSpecialChars}`,
          channel,
          audioPlayer
        );

        if (!success) {
          console.log('Unhandled user joined a voice channel. Announcing...');
          await announceUnhandledUser(channel, audioPlayer);
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
      await playRandomClipFromFolder(EventFiles.DIS_USER_LEAVE, channel, audioPlayer);
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
      case PresenceState.IN_GAME: {
        if (IS_LOL_ANNOUNCER_ENABLED) {
          startPollingLoLGame(channel, audioPlayer);
        }
        break;
      }
      default: {
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

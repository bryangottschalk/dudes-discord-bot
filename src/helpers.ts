import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  getVoiceConnection,
  StreamType
} from '@discordjs/voice';
import { ActivityType, Presence, VoiceBasedChannel } from 'discord.js';
import discordTTS from 'discord-tts';
import { LEAGUE_OF_LEGENDS, PATH_TO_CLIPS } from './constants';
import { Event, RootGameObject } from 'league-of-legends-api/types/index';

export enum PresenceState {
  IN_CHAMP_SELECT = 'In Champion Select',
  IN_GAME = 'In Game',
  IN_LOBBY = 'In Lobby',
  IN_QUEUE = 'In Queue'
}

export const connectToChannel = async (channel: VoiceBasedChannel) => {
  // Create the connection to the voice channel
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });
  // Return when the voice connection is ready, or destroy it if it never gets to that state
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 5000);
    return connection;
  } catch (error) {
    connection.destroy();
    console.log('Error:', error);
  }
};

export const disconnectFromChannel = (channel: VoiceBasedChannel | null | undefined) => {
  // If the channel is defined, kill the connection
  if (channel) {
    const connection = getVoiceConnection(channel.guild.id);
    connection?.destroy();
  }
};

export const playClip = async (
  filePathToClip: string,
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  const connection = await connectToChannel(channel);

  connection?.subscribe(audioPlayer);

  const resource = createAudioResource(filePathToClip, {
    inputType: StreamType.Arbitrary
  });

  audioPlayer.play(resource);

  // Return when the audio player signals it's playing
  return entersState(audioPlayer, AudioPlayerStatus.Playing, 5000);
};

export const stopPlayingClip = async (audioPlayer: AudioPlayer) => {
  // Stop the audio player
  audioPlayer.stop(true);

  // Return when the audio player signals it's idle
  await entersState(audioPlayer, AudioPlayerStatus.Idle, 5000);
};

export const annouceUnhandledUser = async (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer,
  username: string
) => {
  const connection = await connectToChannel(channel);

  connection?.subscribe(audioPlayer);

  const stream = discordTTS.getVoiceStream(
    `Aww shit we got ${username} up in here. That's a big ass guy!`
  );

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true
  });
  audioPlayer.play(audioResource);
};

export const annouceUserIsStreaming = async (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer,
  username: string
) => {
  const connection = await connectToChannel(channel);

  connection?.subscribe(audioPlayer);

  const stream = discordTTS.getVoiceStream(`${username} is streaming! Can I get a hoy yah?`);

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true
  });
  audioPlayer.play(audioResource);
};

export const presenceIndicatesPlayingLeagueOfLegends = (presence: Presence) => {
  const activity = presence.activities[0];
  return activity && activity.type === ActivityType.Playing && activity.name === LEAGUE_OF_LEGENDS;
};

export const setIntervalImmediately = (func: { (): Promise<void>; (): void }, interval: number) => {
  func();
  return setInterval(func, interval);
};

export const playRandomClipFromList = async (
  clipOptions: string[],
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  const clip = clipOptions[Math.floor(Math.random() * clipOptions.length)];
  return await playClip(`${PATH_TO_CLIPS}${clip}`, channel, audioPlayer);
};

export enum EnemyOrAlly {
  ENEMY = 'enemy',
  ALLY = 'ally'
}

export enum TeamNames {
  CHAOS = 'CHAOS',
  ORDER = 'ORDER'
}

export const enemyOrAllyKilled = (
  game: RootGameObject,
  newEvent: Event,
  activePlayerTeam: string
): EnemyOrAlly => {
  if (Object.prototype.hasOwnProperty.call(newEvent, 'AcingTeam')) {
    // If the active player (person running the bot) is on the acing team, an enemy was killed last.
    return activePlayerTeam === newEvent.AcingTeam ? EnemyOrAlly.ENEMY : EnemyOrAlly.ALLY;
  }

  const victimSummonerName = newEvent?.VictimName;
  const victimTeam = game.allPlayers.find((p) => p.summonerName === victimSummonerName)?.team;

  return activePlayerTeam === victimTeam ? EnemyOrAlly.ALLY : EnemyOrAlly.ENEMY;
};

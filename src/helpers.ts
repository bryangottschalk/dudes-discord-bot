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
import { EventFiles, LEAGUE_OF_LEGENDS, PATH_TO_CLIPS, TIMEOUTS } from './constants';
import { Event, RootGameObject } from 'league-of-legends-api/types/index';
import { TimeoutManager } from './services/TimeoutManager';
import fs from 'fs';
import path from 'path';

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
    await entersState(connection, VoiceConnectionStatus.Ready, TIMEOUTS.CONNECTION_TIMEOUT_MS);
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

  // Reset timeout when a clip is played
  const timeoutManager = TimeoutManager.getInstance();
  timeoutManager.resetTimeout();

  // Return when the audio player signals it's playing
  return entersState(audioPlayer, AudioPlayerStatus.Playing, TIMEOUTS.AUDIO_TIMEOUT_MS);
};

export const stopPlayingClip = async (audioPlayer: AudioPlayer) => {
  // Stop the audio player
  audioPlayer.stop(true);

  // Return when the audio player signals it's idle
  await entersState(audioPlayer, AudioPlayerStatus.Idle, TIMEOUTS.AUDIO_TIMEOUT_MS);
};

// If no intro folder was found for a user, use the unknown folder
export const announceUnhandledUser = async (channel: VoiceBasedChannel, audioPlayer: AudioPlayer) =>
  await playRandomClipFromFolder(`${EventFiles.DIS_USER_ENTER}unknown`, channel, audioPlayer);

export const annouceUserIsStreaming = async (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer,
  username: string
) => {
  const connection = await connectToChannel(channel);

  connection?.subscribe(audioPlayer);

  const stream = discordTTS.getVoiceStream(`${username} is streaming!`);

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

export const playRandomClipFromFolder = async (
  clipsFolder: string,
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  try {
    const dir = `${PATH_TO_CLIPS}${clipsFolder}`;

    // Read the directory contents and grab the paths to the .mp3 and .wav files.
    const clips = fs.readdirSync(dir).filter((fileOrDir) => {
      const fullPath = path.join(dir, fileOrDir);
      return (
        fs.statSync(fullPath).isFile() && (fileOrDir.endsWith('.mp3') || fileOrDir.endsWith('.wav'))
      );
    });

    // If no files are found, no clips can be played!
    if (clips.length === 0) {
      console.log('No clips found in ' + dir);
      return;
    }

    // Pick a random clip and play it.
    const clip = clips[Math.floor(Math.random() * clips.length)];
    return await playClip(`${dir}/${clip}`, channel, audioPlayer);
  } catch (error) {
    // console.error('Error reading directory:', error); <-- this error is very extra, not sure if we wanna keep or not.
    return null;
  }
};

export const findClipRecursively = (directory: string, command: string): string | null => {
  try {
    const contents = fs.readdirSync(directory);

    for (const fileOrDir of contents) {
      const fullPath = path.join(directory, fileOrDir);

      // Check if it's the target file. Return it if if is.
      if (fs.statSync(fullPath).isFile() && fileOrDir.split('.')[0].toLowerCase() === command) {
        return fullPath;
      }

      // If it's a directory, recurse into it.
      if (fs.statSync(fullPath).isDirectory()) {
        const result = findClipRecursively(fullPath, command);

        // Return the file if found in the subdirectory.
        if (result) {
          return result;
        }
      }
    }

    // The file was not found if reach here. Return null to signify not found.
    return null;
  } catch (error) {
    console.error('Error while searching for the file:', error);
    return null;
  }
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
  const victimTeam = game.allPlayers.find((p) => p.riotIdGameName === victimSummonerName)?.team;

  return activePlayerTeam === victimTeam ? EnemyOrAlly.ALLY : EnemyOrAlly.ENEMY;
};

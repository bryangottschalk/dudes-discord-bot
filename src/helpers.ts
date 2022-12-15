import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  StreamType
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
const discordTTS = require('discord-tts');

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

  const stream = discordTTS.getVoiceStream(
    `${username} is streaming! Can I get a hoy yah?`
  );

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true
  });
  audioPlayer.play(audioResource);
};

export const setIntervalImmediately = (func: Function, interval: number) => {
  func();
  return setInterval(func, interval);
};

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

export const annouceUserIsStreaming = async (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer,
  username: string
) => {
  // Connect the bot to the channel
  const connection = await connectToChannel(channel);

  // Subscribe to the audio player
  connection?.subscribe(audioPlayer);

  const stream = discordTTS.getVoiceStream(
    `${username.slice(
      0,
      username.length - 5
    )} is streaming! Can I get a hoy yah?`
  );

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true
  });
  audioPlayer.play(audioResource);
};

export const playClip = async (
  clipName: string,
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  // Connect the bot to the channel
  const connection = await connectToChannel(channel);

  // Subscribe to the audio player
  connection?.subscribe(audioPlayer);

  // Create the audio resource
  const resource = createAudioResource('./clips/' + clipName, {
    inputType: StreamType.Arbitrary
  });

  // Play the clip
  audioPlayer.play(resource);

  // Return when the audio player signals it's playing
  return entersState(audioPlayer, AudioPlayerStatus.Playing, 5000);
};

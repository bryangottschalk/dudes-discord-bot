import axios, { AxiosError, AxiosResponse } from 'axios';
import { VoiceBasedChannel } from 'discord.js';
import { playClip, setIntervalImmediately } from '../helpers';
import fs from 'fs';
import { AudioPlayer } from '@discordjs/voice';
import { Event, LoLClientEvent, RootEventsObject } from './types/index';
const https = require('https');

const LOL_GAME_CLIENT_API = 'https://127.0.0.1:2999/liveclientdata';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('src/league-of-legends-api/riotgames.pem')
});

let cachedEvents: Event[] = [];

export const pollCurrentGame = (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  return setIntervalImmediately(async () => {
    try {
      const {
        data: { Events: currentEvents }
      }: AxiosResponse<RootEventsObject> = await axios.get(
        `${LOL_GAME_CLIENT_API}/eventdata`,
        { httpsAgent }
      );
      if (currentEvents.length > cachedEvents.length) {
        let newEvent = currentEvents[currentEvents.length - 1];
        switch (newEvent?.EventName) {
          case LoLClientEvent.GAME_START: {
            console.log('game start!');
            await playClip('halo_slayer.mp3', channel, audioPlayer);
            break;
          }
          case LoLClientEvent.FIRST_BLOOD: {
            console.log('first blood!');
            await playClip('firstblood.mp3', channel, audioPlayer);
            break;
          }
          case LoLClientEvent.CHAMPION_KILL: {
            console.log('kill occured!');
            await playClip('PUNCH.mp3', channel, audioPlayer);
            break;
          }
          case LoLClientEvent.MULTI_KILL: {
            if (newEvent.KillStreak === 2) {
              console.log('doublekill occured!');
              await playClip('halo_doublekill.mp3', channel, audioPlayer);
            } else if (newEvent.KillStreak === 3) {
              console.log('triplekill occured!');
              await playClip('halo_triplekill.mp3', channel, audioPlayer);
            } else if (newEvent.KillStreak === 4) {
              console.log('quadrakill occured!');
              await playClip('halo_killtacular.mp3', channel, audioPlayer);
            } else if (newEvent.KillStreak === 5) {
              console.log('pentakill occured!');
              await playClip(
                'halo_unfreakinbelievable.mp3',
                channel,
                audioPlayer
              );
            }
            break;
          }
          case LoLClientEvent.ACE: {
            console.log('ace occured!');
            await playClip(
              'halo_unfreakinbelievable.mp3',
              channel,
              audioPlayer
            );
            break;
          }
          case LoLClientEvent.GAME_END: {
            if (newEvent?.Result === 'Win') {
              console.log('victory!');
              await playClip('halo_victory_grunt.mp3', channel, audioPlayer);
            } else {
              console.log('defeat!');
              await playClip('loser_spongebob.mp3', channel, audioPlayer);
            }
            break;
          }
          default: {
            console.log('unhandled case in switch:', currentEvents);
            break;
          }
        }
      }
      cachedEvents = currentEvents;
    } catch (err: unknown | AxiosError) {
      let ERROR_MSG: string = '';
      if (axios.isAxiosError(err)) {
        if (err.cause?.message.includes('ECONNREFUSED')) {
          ERROR_MSG =
            'Error getting active game connection. You must be in a live game with LEAGUE_OF_LEGENDS_ANNOUNCER_ENABLED=true in your .env for this to work.';
        }
      }
      if (!ERROR_MSG) {
        ERROR_MSG = `Error occured when getting live game data: ${err}`;
      }
      console.log(ERROR_MSG);
    }
  }, 200);
};

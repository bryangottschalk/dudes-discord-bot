import axios, { AxiosError, AxiosResponse } from 'axios';
import { VoiceBasedChannel } from 'discord.js';
import { playClip, setIntervalImmediately } from '../helpers';
import fs from 'fs';
import { AudioPlayer } from '@discordjs/voice';
import { Event, Player, RootEventsObject, RootGameObject } from './types/index';
const https = require('https');

const LOL_GAME_CLIENT_API = 'https://127.0.0.1:2999/liveclientdata';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('src/league-of-legends-api/riotgames.pem')
});

let cachedEvents: Event[];

export const pollCurrentGame = async (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer
) => {
  setIntervalImmediately(async () => {
    try {
      const {
        data: { Events: currentEvents }
      }: AxiosResponse<RootEventsObject> = await axios.get(
        `${LOL_GAME_CLIENT_API}/eventdata`,
        { httpsAgent }
      );
      console.log('currentEvents:', currentEvents);
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

import axios, { AxiosError, AxiosResponse } from 'axios';
import { VoiceBasedChannel } from 'discord.js';
import {
  EnemyOrAlly,
  enemyOrAllyKilled,
  playRandomClipFromFolder,
  setIntervalImmediately
} from '../helpers';
import fs from 'fs';
import { AudioPlayer } from '@discordjs/voice';
import { Event, LoLClientEvent, RootEventsObject, RootGameObject } from './types/index';
import https from 'https';
import { EventFiles } from '../constants';

const LOL_GAME_CLIENT_API = 'https://127.0.0.1:2999/liveclientdata';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('src/league-of-legends-api/riotgames.pem')
});

// The interval ID for polling the League of Legends Live Game Client API (null if not polling)
let leagueOfLegendsPollTimer: NodeJS.Timeout | null = null;
let cachedEvents: Event[] = [];
let cachedGame: RootGameObject | null = null;
let activePlayerSummonerName: string, activePlayerTeam: string; // active player refers to the person running the bot

export const getAllGameData = async () => {
  try {
    const { data: rootGameObject }: AxiosResponse<RootGameObject> = await axios.get(
      `${LOL_GAME_CLIENT_API}/allgamedata`,
      {
        httpsAgent
      }
    );
    cachedGame = rootGameObject;
    activePlayerSummonerName = cachedGame.activePlayer.summonerName;
    activePlayerTeam =
      cachedGame.allPlayers.find((p) => p.summonerName === activePlayerSummonerName)?.team ?? '';
  } catch (err: unknown | AxiosError) {
    console.log(`Error occured when getting all game data: ${err}`);
  }
};

export const startPollingLoLGame = (channel: VoiceBasedChannel, audioPlayer: AudioPlayer) => {
  if (leagueOfLegendsPollTimer === null) {
    console.log('Polling game..');
    leagueOfLegendsPollTimer = setIntervalImmediately(async () => {
      try {
        if (!cachedGame) {
          getAllGameData();
        }
        const {
          data: { Events: currentEvents }
        }: AxiosResponse<RootEventsObject> = await axios.get(`${LOL_GAME_CLIENT_API}/eventdata`, {
          httpsAgent
        });
        if (currentEvents.length > cachedEvents.length) {
          const newEvent = currentEvents[currentEvents.length - 1];
          switch (newEvent?.EventName) {
            case LoLClientEvent.GAME_START: {
              console.log('game start!');
              await playRandomClipFromFolder(EventFiles.LOL_GAME_START, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.FIRST_BLOOD: {
              console.log('first blood!');
              await playRandomClipFromFolder(EventFiles.LOL_FIRST_BLOOD, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.CHAMPION_KILL: {
              if (cachedGame) {
                const whoWasKilled = enemyOrAllyKilled(cachedGame, newEvent, activePlayerTeam);
                console.log(`someone on the ${whoWasKilled} team died...`);
                whoWasKilled === EnemyOrAlly.ALLY
                  ? await playRandomClipFromFolder(EventFiles.LOL_ENEMY_KILL, channel, audioPlayer)
                  : await playRandomClipFromFolder(EventFiles.LOL_TEAM_KILL, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.MULTI_KILL: {
              if (newEvent.KillStreak === 2) {
                console.log('doublekill occured!');
                await playRandomClipFromFolder(EventFiles.LOL_DOUBLE_KILL, channel, audioPlayer);
              } else if (newEvent.KillStreak === 3) {
                console.log('triplekill occured!');
                await playRandomClipFromFolder(EventFiles.LOL_TRIPLE_KILL, channel, audioPlayer);
              } else if (newEvent.KillStreak === 4) {
                console.log('quadrakill occured!');
                await playRandomClipFromFolder(EventFiles.LOL_QUADRA_KILL, channel, audioPlayer);
              } else if (newEvent.KillStreak === 5) {
                console.log('pentakill occured!');
                await playRandomClipFromFolder(EventFiles.LOL_PENTA_KILL, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.ACE: {
              if (cachedGame) {
                const whoWasKilled = enemyOrAllyKilled(cachedGame, newEvent, activePlayerTeam);
                console.log(`the ${whoWasKilled} team was aced!`);
                whoWasKilled === EnemyOrAlly.ALLY
                  ? await playRandomClipFromFolder(EventFiles.LOL_ENEMY_ACE, channel, audioPlayer)
                  : await playRandomClipFromFolder(EventFiles.LOL_TEAM_ACE, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.MINIONS_SPAWNING: {
              console.log('minions spawning...');
              await playRandomClipFromFolder(EventFiles.LOL_MINIONS_SPAWNING, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.FIRST_TOWER: {
              console.log('first turret destroyed!');
              await playRandomClipFromFolder(EventFiles.LOL_FIRST_TOWER, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.TURRET_KILLED: {
              console.log('turret killed!');
              await playRandomClipFromFolder(EventFiles.LOL_TURRET_KILLED, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.INHIB_KILLED: {
              console.log('inhib killed!');
              await playRandomClipFromFolder(EventFiles.LOL_INHIB_KILLED, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.INHIB_RESPAWNED: {
              console.log('inhib respawned...');
              await playRandomClipFromFolder(EventFiles.LOL_INHIB_RESPAWNED, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.DRAGON_KILLED: {
              if (newEvent.Stolen === 'True') {
                console.log('dragon stolen!');
                await playRandomClipFromFolder(
                  EventFiles.LOL_OBJECTIVE_STEAL,
                  channel,
                  audioPlayer
                );
              } else {
                console.log('dragon killed!');
                await playRandomClipFromFolder(EventFiles.LOL_DRAGON_KILLED, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.HERALD_KILLED: {
              if (newEvent.Stolen === 'True') {
                console.log('herald stolen!');
                await playRandomClipFromFolder(
                  EventFiles.LOL_OBJECTIVE_STEAL,
                  channel,
                  audioPlayer
                );
              } else {
                console.log('herald killed!');
                await playRandomClipFromFolder(EventFiles.LOL_HERALD_KILLED, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.VOIDGRUB_KILLED: {
              if (newEvent.Stolen === 'True') {
                console.log('voidgrub stolen!');
                await playRandomClipFromFolder(
                  EventFiles.LOL_OBJECTIVE_STEAL,
                  channel,
                  audioPlayer
                );
              } else {
                console.log('voidgrub killed!');
                await playRandomClipFromFolder(
                  EventFiles.LOL_VOIDGRUB_KILLED,
                  channel,
                  audioPlayer
                );
              }
              break;
            }
            case LoLClientEvent.BARON_KILLED: {
              if (newEvent.Stolen === 'True') {
                console.log('baron stolen!');
                await playRandomClipFromFolder(
                  EventFiles.LOL_OBJECTIVE_STEAL,
                  channel,
                  audioPlayer
                );
              } else {
                console.log('baron killed!');
                await playRandomClipFromFolder(EventFiles.LOL_BARON_KILLED, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.GAME_END: {
              if (newEvent?.Result === 'Win') {
                console.log('victory!');
                await playRandomClipFromFolder(EventFiles.LOL_GAME_WON, channel, audioPlayer);
              } else {
                console.log('defeat!');
                await playRandomClipFromFolder(EventFiles.LOL_GAME_LOSS, channel, audioPlayer);
              }
              cachedEvents = [];
              cachedGame = null;
              stopPollingLoLGame();
              break;
            }
            default: {
              console.log('unhandled event in switch:', newEvent);
              break;
            }
          }
        }
        cachedEvents = currentEvents;
      } catch (err: unknown | AxiosError) {
        console.log(`Error occured when getting game event data: ${err}`);
      }
    }, 400);
  }
};

export const stopPollingLoLGame = () => {
  // Stop polling if there is currently a valid polling timer
  if (leagueOfLegendsPollTimer) {
    clearInterval(leagueOfLegendsPollTimer);
    console.log('Stopping polling..');
    cachedEvents = [];
    cachedGame = null;
    leagueOfLegendsPollTimer = null;
    activePlayerSummonerName = '';
    activePlayerTeam = '';
  }
};

export const isPolling = (): boolean => leagueOfLegendsPollTimer !== null;

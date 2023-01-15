import axios, { AxiosError, AxiosResponse } from 'axios';
import { VoiceBasedChannel } from 'discord.js';
import { playClip, setIntervalImmediately } from '../helpers';
import fs from 'fs';
import { AudioPlayer } from '@discordjs/voice';
import { Event, LoLClientEvent, RootEventsObject, RootGameObject } from './types/index';
import https from 'https';

const LOL_GAME_CLIENT_API = 'https://127.0.0.1:2999/liveclientdata';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync('src/league-of-legends-api/riotgames.pem')
});

// The interval ID for polling the League of Legends Live Game Client API (null if not polling)
let leagueOfLegendsPollTimer: NodeJS.Timer | null = null;
let cachedEvents: Event[] = [];
let cachedGame: RootGameObject | null = null;

export const getAllGameData = async () => {
  try {
    const { data: rootGameObject }: AxiosResponse<RootGameObject> = await axios.get(
      `${LOL_GAME_CLIENT_API}/allgamedata`,
      {
        httpsAgent
      }
    );
    cachedGame = rootGameObject;
  } catch (err: unknown | AxiosError) {
    console.log(`Error occured when getting all game data: ${err}`);
  }
};

export const startPollingLoLGame = (
  channel: VoiceBasedChannel,
  audioPlayer: AudioPlayer,
  pathToClips: string
) => {
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
              await playClip(`${pathToClips}halo_slayer.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.FIRST_BLOOD: {
              console.log('first blood!');
              await playClip(`${pathToClips}firstblood.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.CHAMPION_KILL: {
              if (cachedGame) {
                // Determine who is on the active player's team
                const activePlayerSummonerName = cachedGame.activePlayer.summonerName;
                const activePlayerTeam = cachedGame.allPlayers.find(
                  (p) => p.summonerName === activePlayerSummonerName
                )?.team;
                const victimSummonerName = newEvent?.VictimName;
                const victimTeam = cachedGame.allPlayers.find(
                  (p) => p.summonerName === victimSummonerName
                )?.team;

                if (activePlayerTeam === victimTeam) {
                  console.log('someone on your team died...');
                  // Someone on your team died
                  await playClip(`${pathToClips}bugsplat2.mp3`, channel, audioPlayer);
                } else {
                  console.log('your team killed an enemy!');
                  // Someone on enemy team died
                  await playClip(`${pathToClips}PUNCH.mp3`, channel, audioPlayer);
                }
              } else {
                await playClip(`${pathToClips}PUNCH.mp3`, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.MULTI_KILL: {
              if (newEvent.KillStreak === 2) {
                console.log('doublekill occured!');
                await playClip(`${pathToClips}halo_doublekill.mp3`, channel, audioPlayer);
              } else if (newEvent.KillStreak === 3) {
                console.log('triplekill occured!');
                await playClip(`${pathToClips}halo_triplekill.mp3`, channel, audioPlayer);
              } else if (newEvent.KillStreak === 4) {
                console.log('quadrakill occured!');
                await playClip(`${pathToClips}halo_killtacular.mp3`, channel, audioPlayer);
              } else if (newEvent.KillStreak === 5) {
                console.log('pentakill occured!');
                await playClip(`${pathToClips}halo_unfreakinbelievable.mp3`, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.ACE: {
              console.log('ace occured!');
              await playClip(`${pathToClips}halo_unfreakinbelievable.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.MINIONS_SPAWNING: {
              console.log('minions spawning...');
              await playClip(`${pathToClips}minions_laugh.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.FIRST_TOWER: {
              console.log('first turret destroyed!');
              await playClip(`${pathToClips}illdoitagain.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.TURRET_KILLED: {
              console.log('turret killed!');
              await playClip(`${pathToClips}illdoitagain.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.INHIB_KILLED: {
              console.log('inhib killed!');
              await playClip(`${pathToClips}goofy_garsh.mp3`, channel, audioPlayer);
              break;
            }
            case LoLClientEvent.INHIB_RESPAWNED: {
              console.log('inhib respawned...');
              break;
            }
            case LoLClientEvent.DRAGON_KILLED: {
              if (newEvent.Stolen === 'True') {
                console.log('dragon stolen!');
                await playClip(`${pathToClips}steal_kims_convenience.mp3`, channel, audioPlayer);
              } else {
                console.log('dragon killed!');
                await playClip(`${pathToClips}dracarys.mp3`, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.HERALD_KILLED: {
              console.log('herald killed!');
              if (newEvent.Stolen === 'True') {
                console.log('herald stolen!');
                await playClip(`${pathToClips}steal_kims_convenience.mp3`, channel, audioPlayer);
              } else {
                await playClip(`${pathToClips}goofy_garsh.mp3`, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.BARON_KILLED: {
              console.log('baron killed!');
              if (newEvent.Stolen === 'True') {
                console.log('baron stolen!');
                await playClip(`${pathToClips}steal_kims_convenience.mp3`, channel, audioPlayer);
              } else {
                await playClip(`${pathToClips}goofy_garsh.mp3`, channel, audioPlayer);
              }
              break;
            }
            case LoLClientEvent.GAME_END: {
              if (newEvent?.Result === 'Win') {
                console.log('victory!');
                await playClip(`${pathToClips}halo_victory_grunt.mp3`, channel, audioPlayer);
              } else {
                console.log('defeat!');
                await playClip(`${pathToClips}loser_spongebob.mp3`, channel, audioPlayer);
              }
              cachedEvents = [];
              cachedGame = null;
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
    }, 200);
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
  }
};

export const isPolling = (): boolean => leagueOfLegendsPollTimer !== null;

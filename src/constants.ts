// Environment variables from the .env file
export const PORT = process.env.PORT || 8081;
export const DISCORD_BOT_TOKEN: string = process.env.DISCORD_BOT_TOKEN || '';
export const IS_LOL_ANNOUNCER_ENABLED: boolean =
  Boolean(process.env.LEAGUE_OF_LEGENDS_ANNOUNCER_ENABLED) ?? false;
export const PATH_TO_CLIPS: string = process.env.PATH_TO_CLIPS || '';
export const GUILD_ID: string = process.env.GUILD_ID || '';

// Simple constant strings for comparison logic
export const LEAGUE_OF_LEGENDS = 'League of Legends';

export enum EventFiles {
  DIS_USER_ENTER = 'events/discord/channel/enter/',
  DIS_USER_LEAVE = 'events/discord/channel/leave/',
  DIS_USER_START_STREAM = 'events/discord/stream/start/',
  DIS_USER_END_STREAM = 'events/discord/stream/end/',
  LOL_GAME_START = 'events/league/game/start/',
  LOL_GAME_WON = 'events/league/game/end/win/',
  LOL_GAME_LOSS = 'events/league/game/end/loss/',
  LOL_MINIONS_SPAWNING = 'events/league/game/minions/',
  LOL_FIRST_BLOOD = 'events/league/kill/first/',
  LOL_TEAM_KILL = 'events/league/kill/team/',
  LOL_ENEMY_KILL = 'events/league/kill/enemy/',
  LOL_DOUBLE_KILL = 'events/league/kill/team/multi/double',
  LOL_TRIPLE_KILL = 'events/league/kill/team/multi/triple',
  LOL_QUADRA_KILL = 'events/league/kill/team/multi/quadra',
  LOL_PENTA_KILL = 'events/league/kill/team/multi/penta',
  LOL_TEAM_ACE = 'events/league/kill/team/ace/',
  LOL_ENEMY_ACE = 'events/league/kill/enemy/ace/',
  LOL_BARON_KILLED = 'events/league/objective/baron/',
  LOL_DRAGON_KILLED = 'events/league/objective/dragon/',
  LOL_HERALD_KILLED = 'events/league/objective/herald/',
  LOL_INHIB_KILLED = 'events/league/objective/inhib/kill/',
  LOL_INHIB_RESPAWNED = 'events/league/objective/inhib/respawn/',
  LOL_OBJECTIVE_STEAL = 'events/league/objective/steal/',
  LOL_FIRST_TOWER = 'events/league/objective/turret/first/',
  LOL_TURRET_KILLED = 'events/league/objective/turret/',
  LOL_VOIDGRUB_KILLED = 'events/league/objective/voidgrub/',
  NO_EVENTS_TIMEOUT = 'events/league/timeout/no-events/'
}

// Timeout constants
export const TIMEOUTS = {
  NO_EVENTS_MS: 2 * 60 * 1000, // 2 minutes in milliseconds
  CONNECTION_TIMEOUT_MS: 5000,
  AUDIO_TIMEOUT_MS: 5000,
  LEAGUE_POLLING_INTERVAL_MS: 400 // League of Legends API polling interval
} as const;

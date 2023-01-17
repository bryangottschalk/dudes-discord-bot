// Environment variables from the .env file
export const PORT = process.env.PORT || 8081;
export const DISCORD_BOT_TOKEN: string = process.env.DISCORD_BOT_TOKEN || '';
export const IS_LOL_ANNOUNCER_ENABLED: boolean =
  Boolean(process.env.LEAGUE_OF_LEGENDS_ANNOUNCER_ENABLED) ?? false;
export const PATH_TO_CLIPS: string = process.env.PATH_TO_CLIPS || '';
export const GUILD_ID: string = process.env.GUILD_ID || '';

// Simple constant strings for comparison logic
export const LEAGUE_OF_LEGENDS = 'League of Legends';

// Clip options for playRandomClipFromList to handle
export const KILL_CLIP_OPTIONS: string[] = ['PUNCH.mp3', 'shotgun-firing.mp3', 'bye_im_paul.mp3'];

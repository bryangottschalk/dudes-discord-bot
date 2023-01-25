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
export const TEAMMATE_KILL_CLIP_OPTIONS: string[] = [
  'PUNCH.mp3',
  'shotgun-firing.mp3',
  'bye_im_paul.mp3',
  'weo_BOOM.mp3',
  'who_gettin_money_this_brain.mp3'
];

export const TEAMMATE_DIED_CLIP_OPTIONS: string[] = [
  'bugsplat2.mp3',
  'this_guy_stinks.mp3',
  'spongebob_steel_sting.mp3',
  'uhh-eww.mp3',
  'bruh.mp3'
];

export const GAME_START_CLIP_OPTIONS: string[] = [
  'halo_slayer.mp3',
  'halo_assault.mp3',
  'halo_king_of_the_hill.mp3',
  'halo_capture_the_flag.mp3',
  'halo_oddball.mp3'
];

export const GAME_WON_CLIP_OPTIONS: string[] = ['halo_victory_grunt.mp3', 'sweet_victory.mp3'];

export const GAME_LOST_CLIP_OPTIONS: string[] = [
  'loser_spongebob.mp3',
  'smallest_violin_remix.mp3',
  'mm_whatcha_say.mp3'
];

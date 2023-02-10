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
  'who_gettin_money_this_brain.mp3',
  'OK.mp3',
  'your_time_is_up.mp3',
  'got-eem.mp3',
  'rpreplay_final1626232154.mp3',
  `SquidwardGood.mp3`
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
  'halo_oddball.mp3',
  'goo_lagoon.mp3'
];

export const TURRET_KILLED_CLIP_OPTIONS: string[] = ['illdoitagain.mp3', 'OK.mp3'];

export const GAME_WON_CLIP_OPTIONS: string[] = [
  'halo_victory_grunt.mp3',
  'sweet_victory.mp3',
  'twerk_like_miley.mp3',
  'running.mp3'
];

export const GAME_LOST_CLIP_OPTIONS: string[] = [
  'loser_spongebob.mp3',
  'smallest_violin_remix.mp3',
  'mm_whatcha_say.mp3'
];

export const STEAL_CLIP_OPTIONS: string[] = ['you_can_have_it.mp3', 'steal_kims_convenience.mp3'];

export const TEAMMATE_ACE_CLIP_OPTIONS: string[] = [
  'goo_lagoon.mp3',
  'halo_unfreakinbelievable.mp3',
  'i_like_have_fun.mp3',
  'KAZOO.mp3',
  'twerk_like_miley.mp3',
  'somebody-suck-me.mp3'
];

export const ENEMY_ACE_CLIP_OPTIONS: string[] = ['WTF.wav'];

export const DRAGON_KILLED_CLIP_OPTIONS: string[] = ['giraffe.mp3', 'dracarys.mp3'];

export const HERALD_KILLED_CLIP_OPTIONS: string[] = ['giraffe.mp3', 'goofy_garsh.mp3'];

export const BARON_KILLED_CLIP_OPTIONS: string[] = ['giraffe.mp3', 'goofy_garsh.mp3'];

import { VoiceBasedChannel } from 'discord.js';
import { AudioPlayer } from '@discordjs/voice';
import { playRandomClipFromFolder } from '../helpers';
import { EventFiles, TIMEOUTS } from '../constants';

/**
 * Singleton class that manages the no-events timeout feature that plays clips after periods of inactivity during League of Legends polling
 */
export class TimeoutManager {
  private static instance: TimeoutManager | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private channel: VoiceBasedChannel | null = null;
  private audioPlayer: AudioPlayer | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of TimeoutManager
   */
  public static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  /**
   * Start the timeout manager (called when League of Legends polling starts)
   * @param channel - The voice channel to play clips in
   * @param audioPlayer - The audio player to use
   */
  public start(channel: VoiceBasedChannel, audioPlayer: AudioPlayer): void {
    this.channel = channel;
    this.audioPlayer = audioPlayer;
    this.isActive = true;
    this.resetTimeout();
    console.log('League timeout manager started - will play clip after 2 minutes of no League events');
  }

  /**
   * Stop the timeout manager and clear any pending timeouts (called when League polling stops)
   */
  public stop(): void {
    this.isActive = false;
    this.clearTimeout();
    this.channel = null;
    this.audioPlayer = null;
    console.log('League timeout manager stopped');
  }

  /**
   * Reset the timeout timer (call this when any League of Legends event occurs)
   */
  public resetTimeout(): void {
    if (!this.isActive || !this.channel || !this.audioPlayer) {
      return;
    }

    this.clearTimeout();
    this.timeoutId = setTimeout(async () => {
      await this.handleTimeout();
    }, TIMEOUTS.NO_EVENTS_MS);

    console.log('League timeout reset - 2 minutes until next timeout clip');
  }

  /**
   * Clear the current timeout without starting a new one
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Handle the timeout event by playing a random clip
   */
  private async handleTimeout(): Promise<void> {
    if (!this.isActive || !this.channel || !this.audioPlayer) {
      return;
    }

    console.log('No League events timeout reached - playing timeout clip');
    
    try {
      await playRandomClipFromFolder(EventFiles.NO_EVENTS_TIMEOUT, this.channel, this.audioPlayer);
      // Reset the timeout after playing the clip
      this.resetTimeout();
    } catch (error) {
      console.error('Error playing timeout clip:', error);
      // Still reset the timeout even if clip failed
      this.resetTimeout();
    }
  }

  /**
   * Check if the timeout manager is currently active
   */
  public isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Update the channel and audio player (useful when bot moves to a different channel)
   */
  public updateChannel(channel: VoiceBasedChannel, audioPlayer: AudioPlayer): void {
    this.channel = channel;
    this.audioPlayer = audioPlayer;
  }

  /**
   * Get the current channel
   */
  public getChannel(): VoiceBasedChannel | null {
    return this.channel;
  }

  /**
   * Get the current audio player
   */
  public getAudioPlayer(): AudioPlayer | null {
    return this.audioPlayer;
  }
}

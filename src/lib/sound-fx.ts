/**
 * Web Audio API Synthesizer for tactile UI acoustic feedback.
 * Zero external audio files, zero bundle weight, <5ms latency, offline-ready.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("ui-sound-muted");
      this.isMuted = savedMute === "true";
    }
  }

  private initContext() {
    if (this.ctx && this.ctx.state !== "closed") {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
      this.isInitialized = true;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sound-muted", String(this.isMuted));
    }
    if (!this.isMuted) {
      this.playTap();
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sound-muted", String(this.isMuted));
    }
  }

  /**
   * Subtle modern UI tap
   */
  public playTap() {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playClickForTheme(_theme?: string | null) {
    this.playTap();
  }

  public playThemeSwitch(_theme?: string) {
    this.playTap();
  }
}

export const sound = new SoundEngine();

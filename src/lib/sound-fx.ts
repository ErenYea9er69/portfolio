/**
 * Web Audio API Synthesizer for tactile UI acoustic feedback.
 * Inspired by kobra.systems sound architecture.
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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Subtle modern UI tap (kobra style)
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

  /**
   * Japanese Katana sword slash effect:
   * Air whoosh + metallic razor ring + sheathe click
   */
  public playKatanaSlash() {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Air whoosh (filtered noise sweep)
      const bufferSize = this.ctx.sampleRate * 0.16;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 3.5;
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.16);

      // 2. High metallic blade resonance
      const metal = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metal.type = "sine";
      metal.frequency.setValueAtTime(3200, now);
      metal.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

      metalGain.gain.setValueAtTime(0.12, now);
      metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      metal.connect(metalGain);
      metalGain.connect(this.ctx.destination);

      metal.start(now);
      metal.stop(now + 0.12);
    } catch {
      // safe ignore
    }
  }

  /**
   * Minecraft 8-bit block-break / hit sound:
   * Crisp square wave stepped tone + crunch burst
   */
  public playMinecraftHit() {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Square wave 8-bit stepped pitch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.03);
      osc.frequency.setValueAtTime(80, now + 0.06);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);

      // Pixelated crunch
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() > 0.5 ? 1 : -1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // safe ignore
    }
  }

  /**
   * Electric Cyberpunk high-voltage arc discharge:
   * Electric spark crackle + sawtooth buzzing frequency drop
   */
  public playElectricZap() {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Sawtooth electric spark
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Noise crackle
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;

      noise.connect(hp);
      hp.connect(gain);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.12);
      noise.stop(now + 0.08);
    } catch {
      // safe ignore
    }
  }

  /**
   * Expedition 33 Belle Epoque crystal chime
   */
  public playE33Chime() {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [659.25, 987.77].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch {
      // safe ignore
    }
  }

  /**
   * Plays the designated click sound based on active theme
   */
  public playClickForTheme(theme: string | null | undefined) {
    switch (theme) {
      case "japanese":
        this.playKatanaSlash();
        break;
      case "minecraft":
        this.playMinecraftHit();
        break;
      case "cyberpunk":
        this.playElectricZap();
        break;
      case "e33":
        this.playE33Chime();
        break;
      default:
        this.playTap();
        break;
    }
  }

  /**
   * Plays rich chord sequence when swapping to a theme
   */
  public playThemeSwitch(theme: string) {
    if (this.isMuted || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      let notes = [261.63, 329.63, 392.0]; // C Major
      let wave: OscillatorType = "sine";

      if (theme === "japanese") {
        notes = [293.66, 311.13, 392.0, 440.0];
        wave = "triangle";
        this.playKatanaSlash();
      } else if (theme === "minecraft") {
        notes = [261.63, 329.63, 392.0, 523.25];
        wave = "square";
      } else if (theme === "cyberpunk") {
        notes = [110.0, 220.0, 440.0, 880.0];
        wave = "sawtooth";
        this.playElectricZap();
      } else if (theme === "e33") {
        notes = [329.63, 440.0, 659.25, 880.0];
        wave = "sine";
      }

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch {
      // safe ignore
    }
  }
}

export const sound = new SoundEngine();

// Web Audio API - Sıfır konsol uyarısı (Yalnızca kullanıcı etkileşiminde başlar)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.playClick();
    }
    return this.enabled;
  }

  playShoot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== "running") return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio fail-safe
    }
  }

  playFall() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== "running") return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.38);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fail-safe
    }
  }

  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== "running") return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.07;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // Audio fail-safe
    }
  }

  playMiss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== "running") return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio fail-safe
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== "running") return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fail-safe
    }
  }
}

export const soundFX = new SoundFX();

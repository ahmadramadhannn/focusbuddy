/**
 * Web Audio API procedural sound engine for DeskToy & Focus Buddy.
 * Generates realistic punch impacts, glass shatters, mop squeaks, water drops, 
 * bubble pops, cat meows, focus bells, and ambient soundscapes with 0 network latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: { stop: () => void } | null = null;
  private muted: boolean = false;
  private volume: number = 0.8;
  private currentAmbient: 'off' | 'rain' | 'lofi' | 'brown_noise' = 'off';

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- SOUND EFFECTS ---

  /** Punch Impact: Bass thump + transient impact punch */
  public playPunch(intensity: number = 1.0) {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    
    // Sub-bass thump oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.18);

    oscGain.gain.setValueAtTime(0.9 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);

    // Punch transient noise crack
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 * intensity, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * intensity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  /** Glass Crack: High-frequency crystalline fracture */
  public playGlassCrack() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;

    // High crunch noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.12));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200 + Math.random() * 1200, t);
    filter.Q.setValueAtTime(6, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    // Glass chime harmonic ping
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(2400 + Math.random() * 800, t);
    chime.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
    chimeGain.gain.setValueAtTime(0.2, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    chime.connect(chimeGain);
    chimeGain.connect(this.masterGain);
    chime.start(t);
    chime.stop(t + 0.25);
  }

  /** Major Glass Shatter: Multi-frequency cascade */
  public playGlassShatter() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    
    // Crack core
    this.playPunch(1.2);
    this.playGlassCrack();

    // Shard scatter burst
    const freqs = [1850, 2600, 3400, 4200, 5600];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const delay = idx * 0.03 + Math.random() * 0.04;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 400 - 200), t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + delay + 0.25);

      g.gain.setValueAtTime(0.25 / (idx + 1), t + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.3);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.35);
    });
  }

  /** Mop / Sapu Swish: Cloth sweeping friction */
  public playMopSwish() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const dur = 0.22;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const env = Math.sin(progress * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(1400, t + dur * 0.5);
    filter.frequency.linearRampToValueAtTime(600, t + dur);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /** Squeegee / Glass Clean Squeak: Rubber friction */
  public playSqueegeeSqueak() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    const startFreq = 1200 + Math.random() * 800;
    const endFreq = startFreq + (Math.random() > 0.5 ? 600 : -500);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.16);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Water Splash / Droplet: Plop & liquid bubble */
  public playWaterDrip() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const base = 700 + Math.random() * 400;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 2.2, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Paint Splat: Low squelch impact */
  public playPaintSplat() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.14);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);

    // Wet splash noise
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  /** Bubble Wrap Pop: Crisp snap */
  public playBubblePop() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const pitch = 450 + Math.random() * 300;
    osc.frequency.setValueAtTime(pitch * 2, t);
    osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.04);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Cat Meow: Melodic cute meow */
  public playCatMeow(happy: boolean = true) {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc2.type = 'triangle';

    const startFreq = happy ? 520 : 420;
    const peakFreq = happy ? 840 : 620;
    const endFreq = happy ? 640 : 380;
    const dur = 0.38;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(peakFreq, t + dur * 0.4);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

    osc2.frequency.setValueAtTime(startFreq * 2, t);
    osc2.frequency.linearRampToValueAtTime(peakFreq * 2, t + dur * 0.4);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 2, t + dur);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  /** Cat Purr: Gentle rumble pulse */
  public playCatPurr() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, t);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(25, t); // 25Hz purr flutter
    lfoGain.gain.setValueAtTime(0.12, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    lfo.connect(gain.gain);
    osc.connect(gain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);

    gain.connect(filter);
    filter.connect(this.masterGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 1.3);
    osc.stop(t + 1.3);
  }

  /** Focus Gong / Bell: Resonant warm singing bowl */
  public playFocusGong() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const baseFreq = 528; // 528Hz clarity frequency
    const harmonics = [528, 1056, 1584, 2112];
    const dur = 2.8;

    harmonics.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), t);

      const amp = 0.3 / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur / (idx * 0.5 + 1));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  }

  /** Whistle / Nag Coach Alert */
  public playWhistle() {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.linearRampToValueAtTime(1900, t + 0.1);
    osc.frequency.setValueAtTime(1900, t + 0.25);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.setValueAtTime(0.3, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  // --- AMBIENT SOUND GENERATOR ---

  public setAmbient(type: 'off' | 'rain' | 'lofi' | 'brown_noise') {
    this.init();
    if (this.ambientNodes) {
      this.ambientNodes.stop();
      this.ambientNodes = null;
    }
    this.currentAmbient = type;

    if (type === 'off' || !this.ctx || !this.ambientGain) return;

    if (type === 'rain') {
      // Pink noise + continuous soft rain filter
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      noise.start();

      this.ambientNodes = {
        stop: () => {
          try { noise.stop(); } catch { /* noop */ }
        }
      };
    } else if (type === 'brown_noise') {
      // Deep soothing brown noise for ultra concentration
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      noise.connect(this.ambientGain);
      noise.start();

      this.ambientNodes = {
        stop: () => {
          try { noise.stop(); } catch { /* noop */ }
        }
      };
    } else if (type === 'lofi') {
      // Procedural warm lofi progression (Cmaj7 -> Am7 -> Dm7 -> G7)
      const chordNotes = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ];
      let step = 0;
      let activeOscs: OscillatorNode[] = [];
      let intervalId: number | null = null;

      const playChord = () => {
        if (!this.ctx || !this.ambientGain) return;
        activeOscs.forEach(o => {
          try { o.stop(); } catch { /* noop */ }
        });
        activeOscs = [];

        const notes = chordNotes[step % chordNotes.length];
        const t = this.ctx.currentTime;

        notes.forEach(freq => {
          if (!this.ctx || !this.ambientGain) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.035, t + 0.6);
          g.gain.linearRampToValueAtTime(0.02, t + 3.0);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 3.9);

          osc.connect(g);
          g.connect(this.ambientGain);
          osc.start(t);
          osc.stop(t + 4.0);
          activeOscs.push(osc);
        });

        step++;
      };

      playChord();
      intervalId = window.setInterval(playChord, 3800);

      this.ambientNodes = {
        stop: () => {
          if (intervalId) clearInterval(intervalId);
          activeOscs.forEach(o => {
            try { o.stop(); } catch { /* noop */ }
          });
        }
      };
    }
  }

  public getAmbient(): 'off' | 'rain' | 'lofi' | 'brown_noise' {
    return this.currentAmbient;
  }
}

export const sound = new SoundEngine();

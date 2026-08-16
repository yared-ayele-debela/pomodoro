// Web Audio API Sound Generator for Pomodoro Timer
// This module synthesizes all sounds offline, so no assets are downloaded.

class PomodoroAudio {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private loFiInterval: any = null;
  private activeOscillators: OscillatorNode[] = [];
  private customAudio: HTMLAudioElement | null = null;

  private initCtx() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a soft bell chime when the timer finishes
  playAlarm(volume: number = 0.5, soundType: string = 'digital') {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);

      if (soundType === 'bell' || soundType === 'chime') {
        // Synthesizing a resonant bell sound
        // Fundamental and partial frequencies
        const fund = 440;
        const ratios = [1, 1.5, 2, 2.6, 3, 3.7, 4.2];
        const gains = [0.5, 0.25, 0.2, 0.15, 0.1, 0.05, 0.02];

        ratios.forEach((ratio, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fund * ratio, now);
          
          // Bells have immediate attack and long exponential decay
          gainNode.gain.setValueAtTime(gains[i], now);
          // Decay faster for higher partials to sound natural
          const decay = 2.5 / (ratio * 0.7);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);
          
          osc.connect(gainNode);
          gainNode.connect(masterGain);
          
          osc.start(now);
          osc.stop(now + decay + 0.1);
        });
      } else if (soundType === 'digital') {
        // High-pitched retro double beep
        const playBeep = (time: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, time);
          
          gainNode.gain.setValueAtTime(0.3, time);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
          
          osc.connect(gainNode);
          gainNode.connect(masterGain);
          
          osc.start(time);
          osc.stop(time + 0.15);
        };

        playBeep(now);
        playBeep(now + 0.18);
      } else {
        // Soft synth swell (calm alarm)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(329.63, now); // E4
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now); // A4
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.6);
        osc2.stop(now + 1.6);
      }
    } catch (e) {
      console.error('Failed to play alarm sound', e);
    }
  }

  // Play gentle harmonic tone for breathing phases (inhale, hold, exhale, hold2, complete)
  playBreathingCue(phase: 'inhale' | 'hold' | 'exhale' | 'hold2' | 'finish', volume: number = 0.2) {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);

      if (phase === 'inhale') {
        // Soft rising dual tone (D4 -> F#4)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(293.66, now);
        osc.frequency.exponentialRampToValueAtTime(369.99, now + 0.6);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.0);
      } else if (phase === 'hold' || phase === 'hold2') {
        // High soft Tibetan singing bowl crystal tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.3);
      } else if (phase === 'exhale') {
        // Soft descending dual tone (F#4 -> D4)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(369.99, now);
        osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.7);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.1);
      } else if (phase === 'finish') {
        // Soothing 3-note chime chord
        const notes = [293.66, 369.99, 440.00]; // D - F# - A
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.4);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.5);
        });
      }
    } catch (e) {
      console.error('Failed to play breathing sound cue', e);
    }
  }

  // Play subtle sound on completed stretch / action
  playActivityComplete(volume: number = 0.2) {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.error('Failed to play activity complete sound', e);
    }
  }

  // Set current ambient volume dynamically
  setAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = volume;
    }
  }

  // Play ambient background sounds
  startAmbient(type: 'none' | 'rain' | 'white-noise' | 'lo-fi' | 'custom', volume: number = 0.3, customUrl?: string) {
    this.stopAmbient();
    if (type === 'none') return;

    if (type === 'custom') {
      if (!customUrl) return;
      try {
        this.customAudio = new Audio(customUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = volume;
        this.customAudio.play().catch(e => {
          console.error("Failed to play custom audio URL", e);
        });
      } catch (e) {
        console.error("Error playing custom audio", e);
      }
      return;
    }

    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume, now);
      this.ambientGain.connect(ctx.destination);

      if (type === 'white-noise') {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        // Low pass filter to make it softer and less harsh
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        source.connect(filter);
        filter.connect(this.ambientGain);
        source.start(now);
        this.ambientSource = source;

      } else if (type === 'rain') {
        // Rain is brown noise with random high-passed crackles
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brownian noise filter formula
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Gain compensation
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Bandpass filter to sculpt the rain sound
        const bpFilter = ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(500, now);
        bpFilter.Q.setValueAtTime(1.0, now);

        // Lowpass filter to smooth the high frequencies
        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(1200, now);

        source.connect(bpFilter);
        bpFilter.connect(lpFilter);
        lpFilter.connect(this.ambientGain);
        source.start(now);
        this.ambientSource = source;

        // Generate tiny random crackles for raindrops on window
        const playRaindrops = () => {
          if (!this.ambientGain) return;
          const dropTime = ctx.currentTime;
          
          const osc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1500 + Math.random() * 1000, dropTime);
          
          dropGain.gain.setValueAtTime(0.005 * Math.random(), dropTime);
          dropGain.gain.exponentialRampToValueAtTime(0.00001, dropTime + 0.03);
          
          osc.connect(dropGain);
          dropGain.connect(this.ambientGain);
          
          osc.start(dropTime);
          osc.stop(dropTime + 0.05);

          // Schedule next raindrop
          const delay = 40 + Math.random() * 150;
          this.loFiInterval = setTimeout(playRaindrops, delay);
        };
        playRaindrops();

      } else if (type === 'lo-fi') {
        // Mellow analog chords playing a simple lofi loop
        // Progressions: Fmaj7 (F3, A3, C4, E4) -> Am7 (A3, C4, E4, G4) -> G6 (G3, B3, D4, E4) -> Em7 (E3, G3, B3, D4)
        const chords = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
          [196.00, 246.94, 293.66, 329.63], // G6
          [164.81, 196.00, 246.94, 293.66]  // Em7
        ];

        let chordIndex = 0;
        
        // Lowpass filter to make it mellow and warm
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.connect(this.ambientGain);

        const playChord = () => {
          if (!this.ambientGain) return;
          const chordTime = ctx.currentTime;
          const notes = chords[chordIndex];
          chordIndex = (chordIndex + 1) % chords.length;

          const oscs: OscillatorNode[] = [];
          const gains: GainNode[] = [];

          notes.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle'; // triangle has few harmonics, very soft
            osc.frequency.setValueAtTime(freq, chordTime);
            
            // Subtle detune for analog warm chorusing
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, chordTime);

            // Chord envelope: slow attack, sustain, slow decay
            gain.gain.setValueAtTime(0, chordTime);
            gain.gain.linearRampToValueAtTime(0.04, chordTime + 2.0); // slow fade in
            gain.gain.setValueAtTime(0.04, chordTime + 6.0);
            gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 7.9); // slow fade out

            osc.connect(gain);
            gain.connect(filter);
            
            osc.start(chordTime);
            osc.stop(chordTime + 8.0);

            oscs.push(osc);
            gains.push(gain);
          });

          this.activeOscillators = oscs;

          this.loFiInterval = setTimeout(playChord, 8000);
        };

        playChord();
      }
    } catch (e) {
      console.error('Failed to start ambient sound', e);
    }
  }

  stopAmbient() {
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch {}
      this.customAudio = null;
    }
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch {}
      this.ambientSource = null;
    }
    
    // Clear lo-fi or rain loops
    if (this.loFiInterval) {
      clearTimeout(this.loFiInterval);
      this.loFiInterval = null;
    }

    // Stop active lo-fi chord oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    this.activeOscillators = [];
    this.ambientGain = null;
  }
}

export const audio = new PomodoroAudio();

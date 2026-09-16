/**
 * Web Audio API procedural sound synthesizer for VidyaYatra.
 * Generates organic temple bells, singing bowl resonances, and cosmic chords
 * with zero external asset dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTempleBell() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fundamental = 528; // Solfeggio Love / Transformation frequency

    // Main Bell strike
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamental, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamental * 2.02, now); // slightly detuned harmonic

    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(fundamental * 2.98, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 2.6);
    osc2.stop(now + 2.6);
    osc3.stop(now + 2.6);
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

export function playCautionaryGong() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = 110; // Deep low gong

    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 3);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(baseFreq / 2, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    // Lowpass filter for deep solemn warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 3.3);
    sub.stop(now + 3.3);
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

export function playCelestialChord() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A Major

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 2.1);
    });
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

export function playTap() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

/**
 * Plays a single crystalline metallic chime note with harmonics and natural decay.
 */
export function playChimeNote(frequency: number, volume = 0.12, duration = 2.4, pan = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental chime tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    // High metallic harmonic overtone (~2.756x ratio typical of tubular metal chimes)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2.756, now);

    // Sparkle partial (~5.404x) for initial strike shimmer
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(frequency * 5.404, now);

    // Master gain for this note
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Harmonic gain (dies faster)
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(volume * 0.45, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

    // Sparkle gain (very brief strike click/ting)
    const strikeGain = ctx.createGain();
    strikeGain.gain.setValueAtTime(volume * 0.25, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc1.connect(gainNode);
    osc2.connect(overtoneGain);
    overtoneGain.connect(gainNode);
    osc3.connect(strikeGain);
    strikeGain.connect(gainNode);

    // Spatial panner if available for immersive stereo field
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      gainNode.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration * 0.6 + 0.1);
    osc3.stop(now + 0.2);
  } catch (err) {
    console.debug('Chime error:', err);
  }
}

/**
 * Melodic pentatonic frequencies for celestial wind chimes (in Hz)
 */
const CELESTIAL_CHIME_FREQS = [
  528,   // Solfeggio Miracles / Transformation
  594,   // D5
  660,   // E5
  792,   // G5
  880,   // A5
  1056,  // C6 (octave above 528)
  1188,  // D6
  1320,  // E6
  1584,  // G6
];

const CAUTIONARY_CHIME_FREQS = [
  220, 261.63, 311.13, 370, 440, 523.25
];

/**
 * Plays a shimmering cascade of celestial chimes (entrance flurry)
 */
export function playChimeCascade(tier = 'common') {
  const isCautionary = tier === 'cautionary';
  const scale = isCautionary ? CAUTIONARY_CHIME_FREQS : CELESTIAL_CHIME_FREQS;

  // Pick 4 to 6 notes for a musical flourish
  const noteSequence = isCautionary
    ? [220, 311.13, 261.63, 370]
    : tier === 'rare'
    ? [528, 792, 1056, 1320, 1584, 1056]
    : [660, 880, 1056, 1320, 880];

  noteSequence.forEach((freq, idx) => {
    const delay = idx * 110; // ms
    const pan = (idx / (noteSequence.length - 1)) * 1.4 - 0.7; // sweep across stereo
    setTimeout(() => {
      playChimeNote(freq, 0.14, 2.5, pan);
    }, delay);
  });
}

/**
 * Initiates continuous atmospheric wind chimes during character encounters.
 * Plays gentle, intermittent chime tones as long as the encounter is active.
 * Returns a cleanup function to gracefully stop the chimes.
 */
export function startEncounterChimeLoop(tier = 'common'): () => void {
  let isRunning = true;
  let nextTimer: ReturnType<typeof setTimeout> | null = null;

  const isCautionary = tier === 'cautionary';
  const scale = isCautionary ? CAUTIONARY_CHIME_FREQS : CELESTIAL_CHIME_FREQS;

  // 1. Play grand initial announcement cascade
  playChimeCascade(tier);

  // 2. Schedule gentle recurring breeze chimes
  const scheduleNextChime = () => {
    if (!isRunning) return;

    // Random interval between 2.2 and 3.6 seconds (like natural gentle wind)
    const intervalMs = 2200 + Math.random() * 1400;

    nextTimer = setTimeout(() => {
      if (!isRunning) return;

      // Randomly choose 1, 2, or 3 chime notes
      const count = Math.random() > 0.65 ? 2 : 1;

      for (let i = 0; i < count; i++) {
        const noteDelay = i * (90 + Math.random() * 80);
        setTimeout(() => {
          if (!isRunning) return;
          const randomPitch = scale[Math.floor(Math.random() * scale.length)];
          const randomPan = (Math.random() * 1.6) - 0.8;
          const gentleVol = 0.06 + Math.random() * 0.05;
          const duration = 2.0 + Math.random() * 1.2;
          playChimeNote(randomPitch, gentleVol, duration, randomPan);
        }, noteDelay);
      }

      // Schedule next burst
      scheduleNextChime();
    }, intervalMs);
  };

  // Start the background ambient chimes after the opening cascade finishes
  nextTimer = setTimeout(() => {
    scheduleNextChime();
  }, 1400);

  // Return stopper
  return () => {
    isRunning = false;
    if (nextTimer) {
      clearTimeout(nextTimer);
      nextTimer = null;
    }
  };
}

/**
 * ============================================================================
 * SACRED OM (PRANAVA) AMBIENT AUDIO ENGINE
 * ============================================================================
 * Procedurally synthesized Cosmic Octave Om vibration tuned to 136.10 Hz
 * (the fundamental Earth frequency / Sadja in Indian Classical music), layered
 * with rich warm harmonics (272.2 Hz, 408.3 Hz, 544.4 Hz), subtle binaural chorus,
 * and a deep meditative breathing LFO volume swell.
 * 
 * Runs continuously in the background with zero external network audio files,
 * zero bandwidth, and seamless fading.
 */

interface OmDroneState {
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  lfoGain: GainNode;
  lfoOsc: OscillatorNode;
  intervalTimer: ReturnType<typeof setInterval> | null;
}

let activeOmDrone: OmDroneState | null = null;
let targetOmVolume = 0.22; // Gentle, relaxing volume suitable for study

export function isOmPlaying(): boolean {
  return activeOmDrone !== null;
}

export function setOmVolume(volume: number) {
  targetOmVolume = Math.max(0, Math.min(1, volume));
  if (activeOmDrone) {
    const ctx = getAudioContext();
    if (ctx) {
      activeOmDrone.masterGain.gain.setTargetAtTime(targetOmVolume, ctx.currentTime, 0.2);
    }
  }
}

export function startOmAmbient(volume = targetOmVolume) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (activeOmDrone) {
      // Already running; simply ramp to target volume
      setOmVolume(volume);
      return;
    }

    const now = ctx.currentTime;
    targetOmVolume = volume;

    // Master drone gain with gentle 2.5 second fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetOmVolume), now + 2.8);

    // Warm Lowpass Filter (eliminates digital harshness, produces warm organic temple resonance)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(680, now);
    lowpass.Q.setValueAtTime(2.2, now);

    // 136.10 Hz: The sacred frequency of Om (Cosmic Octave / Year of the Earth)
    const fundamental = 136.1;

    // Harmonics configuration:
    // [Frequency, WaveType, Relative Gain, Stereo Pan, Fine Detune in Cents]
    const voiceConfigs: Array<{
      freq: number;
      type: OscillatorType;
      gain: number;
      pan: number;
      detune: number;
    }> = [
      // Deep sub-octave foundation (68.05 Hz)
      { freq: fundamental * 0.5, type: 'sine', gain: 0.45, pan: 0, detune: 0 },
      // Fundamental 136.1 Hz (Tanpura/Drone root)
      { freq: fundamental, type: 'sine', gain: 0.65, pan: -0.25, detune: -2 },
      { freq: fundamental, type: 'sine', gain: 0.65, pan: 0.25, detune: +2.5 },
      // First harmonic 272.2 Hz (Octave overtone)
      { freq: fundamental * 2, type: 'triangle', gain: 0.35, pan: -0.4, detune: +1 },
      // Fifth harmonic 408.3 Hz (Pancham / Sacred 5th note)
      { freq: fundamental * 3, type: 'sine', gain: 0.22, pan: 0.35, detune: -1.5 },
      // High subtle vocal shimmer (A-U-M nasal resonance 544.4 Hz)
      { freq: fundamental * 4, type: 'sine', gain: 0.12, pan: 0, detune: +0.8 },
    ];

    const oscillators: OscillatorNode[] = [];

    voiceConfigs.forEach((cfg) => {
      const osc = ctx.createOscillator();
      const vGain = ctx.createGain();

      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, now);
      osc.detune.setValueAtTime(cfg.detune, now);
      vGain.gain.setValueAtTime(cfg.gain, now);

      osc.connect(vGain);

      if (typeof ctx.createStereoPanner === 'function') {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(cfg.pan, now);
        vGain.connect(panner);
        panner.connect(lowpass);
      } else {
        vGain.connect(lowpass);
      }

      osc.start(now);
      oscillators.push(osc);
    });

    // Meditative Breath LFO: very slow 0.08 Hz modulation (~12 second full respiratory cycle)
    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(0.08, now); // ~12s breath rhythm

    // Modulation depth: subtle volume swell of ~25%
    lfoGain.gain.setValueAtTime(0.2, now);

    lfoOsc.connect(lfoGain.gain);
    lfoOsc.start(now);

    lowpass.connect(masterGain);
    masterGain.connect(ctx.destination);

    activeOmDrone = {
      masterGain,
      oscillators,
      lfoGain,
      lfoOsc,
      intervalTimer: null,
    };
  } catch (err) {
    console.debug('Failed to start Sacred Om drone:', err);
  }
}

export function stopOmAmbient(fadeDuration = 2.0) {
  if (!activeOmDrone) return;

  try {
    const ctx = getAudioContext();
    const current = activeOmDrone;
    activeOmDrone = null;

    if (ctx) {
      const now = ctx.currentTime;
      current.masterGain.gain.setTargetAtTime(0.0001, now, fadeDuration / 3);

      setTimeout(() => {
        try {
          current.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // already stopped
            }
          });
          current.lfoOsc.stop();
          current.lfoOsc.disconnect();
          current.masterGain.disconnect();
        } catch {
          // cleanup
        }
      }, (fadeDuration + 0.3) * 1000);
    }
  } catch (err) {
    console.debug('Error stopping Om drone:', err);
  }
}


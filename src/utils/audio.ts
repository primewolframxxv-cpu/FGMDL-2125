// Procedural Web Audio API sound generator
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Realistic crisp cracking sound of a fortune cookie snapping in half
 * Natural acoustic dry wafer fracture without cartoon synth pitch sweeps
 */
export function playCookieCrunch(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;

    // Instantaneous brittle fracture noise burst (very brief, ~50ms total)
    const duration = 0.052;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      // Primary snap impulse followed by immediate crumb fracture at 11ms
      const snap1 = Math.exp(-t / 0.006);
      const snap2 = t > 0.011 ? Math.exp(-(t - 0.011) / 0.008) * 0.65 : 0;
      data[i] = (Math.random() * 2 - 1) * (snap1 + snap2);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass captures the brittle acoustic resonance of dry baked pastry
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2600, now);
    bandpass.Q.setValueAtTime(1.1, now);

    // Highpass removes muddy sub-frequencies, keeping the snap crisp and dry
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1100, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.38, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start(now);

    // Subtle low mechanical "thud" of hollow dry shell snapping (fixed frequency, no sweeping synth)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(185, now);

    thudGain.gain.setValueAtTime(0.16, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.026);
  } catch {
    // Ignore audio errors silently
  }
}

/**
 * Soft snap chime for puzzle pieces
 */
export function playSnapChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch {}
}

/**
 * Gentle victory chime
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch {}
}

// Dedicated December Avenue chorus melody loop
let songLoopTimer: number | null = null;
let isPlayingSong = false;

/**
 * Plays a warm, emotional acoustic melody rendition of the chorus of December Avenue's
 * "In My Arms Where I'll Keep You"
 */
export function togglePlayDecemberAvenueChorus(onStateChange?: (playing: boolean) => void): boolean {
  if (isPlayingSong) {
    stopDecemberAvenueChorus();
    onStateChange?.(false);
    return false;
  }

  try {
    const ctx = getAudioContext();
    isPlayingSong = true;
    onStateChange?.(true);

    // Chorus motif: C -> G/B -> Am7 -> F
    // Melody notes & gentle guitar arpeggio timing
    const chorusMelody = [
      // "In my arms..."
      { note: 523.25, time: 0.0, dur: 0.45 },   // C5
      { note: 587.33, time: 0.5, dur: 0.4 },    // D5
      { note: 659.25, time: 0.95, dur: 0.8 },   // E5
      { note: 587.33, time: 1.8, dur: 0.4 },    // D5
      { note: 523.25, time: 2.25, dur: 0.7 },   // C5
      // "...where I'll keep you"
      { note: 440.00, time: 3.1, dur: 0.45 },   // A4
      { note: 523.25, time: 3.6, dur: 0.9 },    // C5
      { note: 392.00, time: 4.6, dur: 0.8 },    // G4
      // "Safe and sound..."
      { note: 523.25, time: 5.6, dur: 0.45 },   // C5
      { note: 659.25, time: 6.1, dur: 0.5 },    // E5
      { note: 783.99, time: 6.7, dur: 0.9 },    // G5
      { note: 659.25, time: 7.7, dur: 0.5 },    // E5
      { note: 587.33, time: 8.25, dur: 0.6 },   // D5
      { note: 523.25, time: 8.9, dur: 1.1 },    // C5
    ];

    // Warm bass accompaniment
    const bassNotes = [
      { note: 130.81, time: 0.0, dur: 2.5 },  // C3
      { note: 123.47, time: 2.6, dur: 2.4 },  // B2
      { note: 110.00, time: 5.1, dur: 2.5 },  // A2
      { note: 87.31, time: 7.6, dur: 2.5 },   // F2
    ];

    const playSequence = () => {
      if (!isPlayingSong) return;
      const startTime = ctx.currentTime + 0.05;

      // Play melody
      chorusMelody.forEach(({ note, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm mellow Rhodes/celesta acoustic tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, startTime + time);

        gain.gain.setValueAtTime(0, startTime + time);
        gain.gain.linearRampToValueAtTime(0.14, startTime + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + time + dur + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime + time);
        osc.stop(startTime + time + dur + 0.3);
      });

      // Play bass warmth
      bassNotes.forEach(({ note, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, startTime + time);

        gain.gain.setValueAtTime(0, startTime + time);
        gain.gain.linearRampToValueAtTime(0.08, startTime + time + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime + time);
        osc.stop(startTime + time + dur + 0.1);
      });
    };

    playSequence();
    songLoopTimer = window.setInterval(playSequence, 10500);
    return true;
  } catch {
    isPlayingSong = false;
    onStateChange?.(false);
    return false;
  }
}

export function stopDecemberAvenueChorus(): void {
  if (songLoopTimer !== null) {
    clearInterval(songLoopTimer);
    songLoopTimer = null;
  }
  isPlayingSong = false;
}

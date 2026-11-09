// Sound, made on the spot with the browser's Web Audio (no sound files): footsteps, a door's thud and
// creak, a soft wind, birds by day and crickets at night. Browsers only allow sound after the player has
// pressed something, so nothing starts until `unlock()` is called from a key or pointer press.

export function createSound() {
  let context = null;
  let master = null;
  let noise = null;
  let enabled = true;
  let volume = 0.6;
  let nextChirp = 2;
  let rainGain = null; // the rain's loudness (0 until it rains)

  function apply() {
    if (!master || !context) return;
    master.gain.setTargetAtTime(enabled ? volume * 0.5 : 0, context.currentTime, 0.1);
  }

  /** Creates the audio graph on the first press (browsers refuse sound before one). */
  function unlock() {
    if (context) {
      if (context.state === "suspended") void context.resume();
      return;
    }
    const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      context = new AudioContextClass();
    } catch {
      context = null; // no audio on this device: the game stays silent
      return;
    }
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    // Two seconds of white noise, reused by footsteps, doors and the wind.
    noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    // The wind: looping noise through a low filter whose loudness drifts.
    const wind = context.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 380;
    const windGain = context.createGain();
    windGain.gain.value = 0.05;
    const drift = context.createOscillator();
    drift.frequency.value = 0.07;
    const driftGain = context.createGain();
    driftGain.gain.value = 0.03;
    drift.connect(driftGain).connect(windGain.gain);
    wind.connect(low).connect(windGain).connect(master);
    wind.start();
    drift.start();
    // Rain: the same noise, high and hissing, with a softer patter under it; silent until it rains.
    const rain = context.createBufferSource();
    rain.buffer = noise;
    rain.loop = true;
    rain.playbackRate.value = 0.83; // out of step with the wind's copy of the noise
    const hiss = context.createBiquadFilter();
    hiss.type = "bandpass";
    hiss.frequency.value = 2600;
    hiss.Q.value = 0.5;
    const patter = context.createBiquadFilter();
    patter.type = "lowpass";
    patter.frequency.value = 900;
    rainGain = context.createGain();
    rainGain.gain.value = 0;
    rain.connect(hiss).connect(rainGain);
    rain.connect(patter).connect(rainGain);
    rainGain.connect(master);
    rain.start();
    apply();
  }

  /** A short burst of filtered noise. */
  function burst({ frequency, q = 1.2, length = 0.07, gain = 0.3, type = "bandpass", at = 0 }) {
    if (!context || !enabled) return;
    const start = context.currentTime + at;
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
    source.connect(filter).connect(envelope).connect(master);
    source.start(start, Math.random() * 1.5, length + 0.05);
  }

  /** A short tone sliding from one pitch to another. */
  function tone({ from, to, length, gain, type = "sine", at = 0 }) {
    if (!context || !enabled) return;
    const start = context.currentTime + at;
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + length);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
    oscillator.connect(envelope).connect(master);
    oscillator.start(start);
    oscillator.stop(start + length + 0.05);
  }

  return {
    unlock,
    setEnabled(on) {
      enabled = on;
      apply();
    },
    setVolume(value) {
      volume = value;
      apply();
    },
    /** A footstep `distance` metres away (0 for the player); running steps are harder. */
    footstep(distance = 0, running = false) {
      const loudness = Math.max(0, 1 - distance / 14);
      if (loudness <= 0) return;
      burst({
        frequency: 500 + Math.random() * 300,
        length: running ? 0.09 : 0.07,
        gain: (running ? 0.45 : 0.3) * loudness,
      });
    },
    /** A door: a creak, then a soft thud. */
    door() {
      tone({ from: 220, to: 140, length: 0.35, gain: 0.05, type: "sawtooth" });
      burst({ frequency: 120, q: 0.8, length: 0.18, gain: 0.5, type: "lowpass", at: 0.3 });
    },
    /** Birds by day, crickets at night, every so often. `dark` is 0 (day) … 1 (night). */
    tick(dt, { dark = 0, inside = false, rain = 0 } = {}) {
      // Rain on the roof is quieter indoors.
      rainGain?.gain.setTargetAtTime(rain * (inside ? 0.04 : 0.14), context.currentTime, 0.8);
      if (!context || !enabled || inside || rain > 0.4) return; // no birdsong in the rain
      nextChirp -= dt;
      if (nextChirp > 0) return;
      if (dark > 0.6) {
        for (let i = 0; i < 3; i++) tone({ from: 4300, to: 4200, length: 0.04, gain: 0.025, at: i * 0.07 });
        nextChirp = 0.6 + Math.random() * 1.6;
      } else if (dark < 0.4) {
        const base = 2200 + Math.random() * 1400;
        const notes = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < notes; i++) {
          tone({ from: base * (1 + i * 0.08), to: base * (1.25 + i * 0.05), length: 0.09, gain: 0.03, at: i * 0.12 });
        }
        nextChirp = 3 + Math.random() * 6;
      } else {
        nextChirp = 2;
      }
    },
    dispose() {
      void context?.close();
      context = null;
    },
  };
}

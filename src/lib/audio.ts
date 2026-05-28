// Lightweight Web Audio synth — no samples, no network, no dependencies.
// The AudioContext is created lazily on first use so it's created inside a
// user gesture (browsers block it otherwise).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function tone(
  c: AudioContext,
  freq: number,
  startAt: number,
  durationS: number,
  type: OscillatorType = "triangle",
  peak = 0.18
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  // Quick attack, exponential decay — feels chime-y.
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0008, startAt + durationS);
  osc.connect(gain).connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + durationS + 0.05);
}

/** A warm chime at the pitch of the correctly-identified note. */
export function playPitch(midi: number) {
  const c = getCtx();
  if (!c) return;
  const f = midiToFreq(midi);
  const now = c.currentTime;
  tone(c, f, now, 0.7, "triangle", 0.2);
  // Subtle octave overtone gives it a bell-like sheen.
  tone(c, f * 2, now, 0.45, "sine", 0.06);
}

/** A short major arpeggio for streak milestones. */
export function playMilestone() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // C5, E5, G5, C6 — bright and obviously celebratory.
  [72, 76, 79, 84].forEach((m, i) => {
    tone(c, midiToFreq(m), now + i * 0.08, 0.5, "triangle", 0.18);
  });
}

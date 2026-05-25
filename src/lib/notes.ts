export type Clef = "treble" | "bass";
export type ClefMode = "treble" | "bass" | "both";
export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export const LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];

const LETTER_INDEX: Record<Letter, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

export interface Pitch {
  letter: Letter;
  octave: number;
}

/** A monotonically increasing value across the diatonic scale, for range math. */
function diatonicStep(p: Pitch): number {
  return p.octave * 7 + LETTER_INDEX[p.letter];
}

function pitchFromStep(step: number): Pitch {
  const octave = Math.floor(step / 7);
  const idx = ((step % 7) + 7) % 7;
  const letter = LETTERS[idx];
  return { letter, octave };
}

/** VexFlow key, e.g. { C, 4 } -> "c/4". */
export function toVexKey(p: Pitch): string {
  return `${p.letter.toLowerCase()}/${p.octave}`;
}

/**
 * Natural-note ranges per clef. "core" stays on the five staff lines and
 * their spaces; "full" adds a few ledger-line notes above and below.
 */
const RANGES: Record<Clef, { core: [Pitch, Pitch]; full: [Pitch, Pitch] }> = {
  treble: {
    core: [{ letter: "E", octave: 4 }, { letter: "F", octave: 5 }],
    full: [{ letter: "C", octave: 4 }, { letter: "A", octave: 5 }],
  },
  bass: {
    core: [{ letter: "G", octave: 2 }, { letter: "A", octave: 3 }],
    full: [{ letter: "E", octave: 2 }, { letter: "C", octave: 4 }],
  },
};

function naturalsInRange(min: Pitch, max: Pitch): Pitch[] {
  const lo = diatonicStep(min);
  const hi = diatonicStep(max);
  const out: Pitch[] = [];
  for (let s = lo; s <= hi; s++) out.push(pitchFromStep(s));
  return out;
}

export function pitchPool(clef: Clef, includeLedger: boolean): Pitch[] {
  const [min, max] = includeLedger ? RANGES[clef].full : RANGES[clef].core;
  return naturalsInRange(min, max);
}

export interface Question {
  clef: Clef;
  pitch: Pitch;
}

export function randomQuestion(
  mode: ClefMode,
  includeLedger: boolean,
  previous?: Question
): Question {
  const clef: Clef =
    mode === "both" ? (Math.random() < 0.5 ? "treble" : "bass") : mode;
  const pool = pitchPool(clef, includeLedger);

  let pitch = pool[Math.floor(Math.random() * pool.length)];
  // Avoid repeating the exact same question twice in a row when possible.
  if (
    previous &&
    previous.clef === clef &&
    pool.length > 1
  ) {
    let guard = 0;
    while (
      pitch.letter === previous.pitch.letter &&
      pitch.octave === previous.pitch.octave &&
      guard < 20
    ) {
      pitch = pool[Math.floor(Math.random() * pool.length)];
      guard++;
    }
  }
  return { clef, pitch };
}

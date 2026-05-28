import { useCallback, useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Music4,
  Check,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Staff } from "@/components/Staff";
import { Burst } from "@/components/Burst";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LETTERS,
  pitchToMidi,
  randomQuestion,
  toVexKey,
  type ClefMode,
  type Letter,
  type Question,
} from "@/lib/notes";
import { playMilestone, playPitch } from "@/lib/audio";

type Status = "idle" | "correct" | "wrong";

interface Stats {
  correct: number;
  total: number;
  streak: number;
  best: number;
}

const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0 };

// Playful rainbow palette for the answer keys.
const LETTER_COLORS: Record<Letter, string> = {
  C: "#ef4444",
  D: "#f97316",
  E: "#eab308",
  F: "#22c55e",
  G: "#06b6d4",
  A: "#6366f1",
  B: "#d946ef",
};

const CLEF_OPTIONS: { value: ClefMode; label: string }[] = [
  { value: "treble", label: "Treble" },
  { value: "bass", label: "Bass" },
  { value: "both", label: "Both" },
];

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [dark, setDark] = useState<boolean>(() =>
    loadJSON("sr.dark", false)
  );
  const [mode, setMode] = useState<ClefMode>(() =>
    loadJSON<ClefMode>("sr.mode", "treble")
  );
  const [includeLedger, setIncludeLedger] = useState<boolean>(() =>
    loadJSON("sr.ledger", false)
  );
  const [stats, setStats] = useState<Stats>(() =>
    loadJSON<Stats>("sr.stats", EMPTY_STATS)
  );

  const [sound, setSound] = useState<boolean>(() => loadJSON("sr.sound", true));

  const [question, setQuestion] = useState<Question>(() =>
    randomQuestion(loadJSON<ClefMode>("sr.mode", "treble"), loadJSON("sr.ledger", false))
  );
  const [status, setStatus] = useState<Status>("idle");
  const [picked, setPicked] = useState<Letter | null>(null);
  const [correctTrigger, setCorrectTrigger] = useState(0);
  const [milestoneTrigger, setMilestoneTrigger] = useState(0);
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const milestoneTimerRef = useRef<number | null>(null);

  // Persist settings & stats.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("sr.dark", JSON.stringify(dark));
  }, [dark]);
  useEffect(() => localStorage.setItem("sr.mode", JSON.stringify(mode)), [mode]);
  useEffect(
    () => localStorage.setItem("sr.ledger", JSON.stringify(includeLedger)),
    [includeLedger]
  );
  useEffect(
    () => localStorage.setItem("sr.stats", JSON.stringify(stats)),
    [stats]
  );
  useEffect(
    () => localStorage.setItem("sr.sound", JSON.stringify(sound)),
    [sound]
  );

  const nextQuestion = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus("idle");
    setPicked(null);
    setQuestion((prev) => randomQuestion(mode, includeLedger, prev));
  }, [mode, includeLedger]);

  // Regenerate when settings change so the new clef/range applies immediately.
  useEffect(() => {
    setStatus("idle");
    setPicked(null);
    setQuestion((prev) => randomQuestion(mode, includeLedger, prev));
  }, [mode, includeLedger]);

  const answer = useCallback(
    (letter: Letter) => {
      if (status !== "idle") return;
      const correct = letter === question.pitch.letter;
      setPicked(letter);
      setStatus(correct ? "correct" : "wrong");

      const newStreak = correct ? stats.streak + 1 : 0;
      setStats((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
        streak: correct ? s.streak + 1 : 0,
        best: Math.max(s.best, correct ? s.streak + 1 : 0),
      }));

      if (correct) {
        if (sound) playPitch(pitchToMidi(question.pitch));
        setCorrectTrigger((t) => t + 1);

        if (newStreak > 0 && newStreak % 5 === 0) {
          setMilestoneTrigger((m) => m + 1);
          setMilestoneStreak(newStreak);
          if (milestoneTimerRef.current) {
            clearTimeout(milestoneTimerRef.current);
          }
          milestoneTimerRef.current = window.setTimeout(
            () => setMilestoneStreak(null),
            1400
          );
          if (sound) playMilestone();
        }

        timerRef.current = window.setTimeout(nextQuestion, 850);
      }
    },
    [status, question, stats.streak, sound, nextQuestion]
  );

  // Keyboard shortcuts: letter keys to answer, space/enter to advance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (status === "wrong" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        nextQuestion();
        return;
      }
      if (LETTERS.includes(key as Letter)) {
        answer(key as Letter);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, status, nextQuestion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    };
  }, []);

  const resetStats = () => setStats(EMPTY_STATS);

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const correctLetter = question.pitch.letter;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/40 via-background to-secondary/40">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Music4 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Sight Reading Trainer
              </h1>
              <p className="text-xs text-muted-foreground">
                Name the note on the staff
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSound((s) => !s)}
              aria-label={sound ? "Mute sound" : "Unmute sound"}
            >
              {sound ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatBox label="Score" value={`${stats.correct}/${stats.total}`} />
          <StatBox label="Streak" value={`${stats.streak}🔥`} />
          <StatBox label="Accuracy" value={`${accuracy}%`} />
        </div>

        {/* Main practice card */}
        <Card className="mt-5 overflow-hidden border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="capitalize text-muted-foreground">
                {question.clef} clef
              </span>
              {status === "correct" && (
                <span className="flex animate-pop items-center gap-1 font-bold text-success">
                  <Check className="h-5 w-5" /> Nice!
                </span>
              )}
              {status === "wrong" && (
                <span className="flex items-center gap-1 font-bold text-destructive">
                  <X className="h-5 w-5" /> It was {correctLetter}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "relative rounded-xl bg-white p-2",
                status === "wrong" && "animate-shake"
              )}
            >
              <Staff
                clef={question.clef}
                noteKey={toVexKey(question.pitch)}
                color={
                  status === "wrong"
                    ? "#e11d48"
                    : status === "correct"
                    ? "#16a34a"
                    : "#7c3aed"
                }
              />
              <Burst trigger={correctTrigger} />
              <Burst trigger={milestoneTrigger} big />
              {milestoneStreak !== null && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <div className="animate-pop rounded-full bg-gradient-to-r from-primary to-destructive px-5 py-2 text-lg font-extrabold text-white shadow-xl">
                    🔥 {milestoneStreak} streak!
                  </div>
                </div>
              )}
            </div>

            {/* Answer keys */}
            <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
              {LETTERS.map((letter) => {
                const isCorrect = letter === correctLetter;
                const isPicked = letter === picked;
                const answered = status !== "idle";
                return (
                  <button
                    key={letter}
                    onClick={() => answer(letter)}
                    disabled={answered}
                    style={
                      !answered
                        ? { backgroundColor: LETTER_COLORS[letter] }
                        : undefined
                    }
                    className={cn(
                      "flex h-14 items-center justify-center rounded-xl text-xl font-extrabold text-white shadow-md transition-all",
                      "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95",
                      "disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-md",
                      answered && isCorrect && "bg-success ring-4 ring-success/30",
                      answered &&
                        isPicked &&
                        !isCorrect &&
                        "bg-destructive ring-4 ring-destructive/30",
                      answered &&
                        !isCorrect &&
                        !isPicked &&
                        "bg-muted text-muted-foreground opacity-60"
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Next button (after a wrong answer) */}
            <div className="mt-4 h-12">
              {status === "wrong" && (
                <Button
                  size="lg"
                  className="w-full animate-pop"
                  onClick={nextQuestion}
                >
                  Next note →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mt-5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Clef
              </span>
              <div className="flex rounded-lg border bg-muted/50 p-1">
                {CLEF_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-semibold transition-colors",
                      mode === opt.value
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={includeLedger}
                onChange={(e) => setIncludeLedger(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Ledger lines
            </label>

            <Button variant="ghost" size="sm" onClick={resetStats}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </CardContent>
        </Card>

        <footer className="mt-auto pt-6 text-center text-xs text-muted-foreground">
          Tip: use your keyboard — press{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">A</kbd>–
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">G</kbd> to
          answer, <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Space</kbd>{" "}
          for the next note.
        </footer>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 bg-card p-3 text-center shadow-sm">
      <div className="text-lg font-extrabold tabular-nums">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

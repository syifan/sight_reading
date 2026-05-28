import { useEffect, useState, type CSSProperties } from "react";

const SMALL_EMOJIS = ["🎉", "⭐", "✨", "🎵", "💫"];
const BIG_EMOJIS = ["🎉", "🎊", "⭐", "✨", "🌟", "💫", "🎵", "🎶", "🏆", "🔥"];

interface Particle {
  emoji: string;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  size: number;
}

function makeParticles(count: number, big: boolean): Particle[] {
  const pool = big ? BIG_EMOJIS : SMALL_EMOJIS;
  return Array.from({ length: count }, () => ({
    emoji: pool[Math.floor(Math.random() * pool.length)],
    dx: (Math.random() - 0.5) * (big ? 360 : 220),
    dy: -(40 + Math.random() * (big ? 200 : 110)),
    rot: (Math.random() - 0.5) * 540,
    delay: Math.random() * 90,
    size: big ? 28 + Math.random() * 14 : 22 + Math.random() * 10,
  }));
}

interface BurstProps {
  /** Increment this to fire a new burst. */
  trigger: number;
  big?: boolean;
}

export function Burst({ trigger, big = false }: BurstProps) {
  const [parts, setParts] = useState<Particle[]>([]);
  useEffect(() => {
    if (trigger <= 0) return;
    setParts(makeParticles(big ? 18 : 11, big));
    const t = window.setTimeout(() => setParts([]), 1200);
    return () => window.clearTimeout(t);
  }, [trigger, big]);

  if (parts.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      <div className="absolute left-1/2 top-1/2">
        {parts.map((p, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-burst select-none"
            style={
              {
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--rot": `${p.rot}deg`,
                animationDelay: `${p.delay}ms`,
                fontSize: `${p.size}px`,
                lineHeight: 1,
              } as CSSProperties
            }
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

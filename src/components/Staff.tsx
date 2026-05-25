import { useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} from "vexflow";
import type { Clef } from "@/lib/notes";

interface StaffProps {
  clef: Clef;
  noteKey: string;
  /** Color of the note head, e.g. when showing the correct answer. */
  color?: string;
}

const WIDTH = 320;
const HEIGHT = 220;

export function Staff({ clef, noteKey, color = "#7c3aed" }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // VexFlow appends an <svg>; clear any previous render (incl. StrictMode).
    el.innerHTML = "";

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(WIDTH, HEIGHT);
    const context = renderer.getContext();

    const stave = new Stave(2, 60, WIDTH - 4);
    stave.addClef(clef);
    stave.setContext(context).draw();

    const note = new StaveNote({ clef, keys: [noteKey], duration: "w" });
    note.setStyle({ fillStyle: color, strokeStyle: color });

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], WIDTH - 120);
    voice.draw(context, stave);

    return () => {
      el.innerHTML = "";
    };
  }, [clef, noteKey, color]);

  return (
    <div
      ref={containerRef}
      className="vf-stave flex justify-center"
      aria-hidden="true"
    />
  );
}

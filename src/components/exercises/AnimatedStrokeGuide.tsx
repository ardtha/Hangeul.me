import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  PenTool,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { WritingGlyphGuide } from '../../data/hangeulData';

export type StrokePlaybackSpeed = 0.7 | 1 | 1.5;

interface MeasuredStroke {
  length: number;
  startPoint: { x: number; y: number };
  badgePoint: { x: number; y: number };
  tipAngleDeg: number;
}

export interface UseStrokePlaybackOptions {
  glyphId: string;
  strokeCount: number;
  autoPlay?: boolean;
  loop?: boolean;
  pausedByUserAction?: boolean;
}

export function useStrokePlayback({
  glyphId,
  strokeCount,
  autoPlay = true,
  loop = true,
  pausedByUserAction = false,
}: UseStrokePlaybackOptions) {
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<StrokePlaybackSpeed>(1);
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [pathLengths, setPathLengths] = useState<number[]>([]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setActiveStrokeIdx(0);
    setStrokeProgress(prefersReducedMotion ? 1 : 0);
    setPlaying(autoPlay && !prefersReducedMotion);
  }, [glyphId, autoPlay, prefersReducedMotion]);

  useEffect(() => {
    if (!playing || pausedByUserAction || strokeCount <= 0) return;

    if (prefersReducedMotion) {
      setStrokeProgress(1);
      return;
    }

    let rafId = 0;
    let phase: 'drawing' | 'gap' | 'endPause' = 'drawing';
    let phaseStart = performance.now();

    const currentLen = pathLengths[activeStrokeIdx] ?? 120;
    const drawDuration = Math.max(460, Math.min(1100, currentLen * 4.2)) / speed;
    const gapDuration = 240 / speed;
    const endPauseDuration = 900 / speed;

    const tick = (now: number) => {
      const elapsed = now - phaseStart;

      if (phase === 'drawing') {
        const rawT = Math.min(1, elapsed / drawDuration);
        // Smooth easeInOutCubic for natural brush movement
        const eased =
          rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
        setStrokeProgress(eased);

        if (rawT >= 1) {
          if (activeStrokeIdx + 1 < strokeCount) {
            phase = 'gap';
            phaseStart = now;
          } else {
            phase = 'endPause';
            phaseStart = now;
          }
        }
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (phase === 'gap') {
        if (elapsed >= gapDuration) {
          setActiveStrokeIdx((idx) => (idx + 1 < strokeCount ? idx + 1 : 0));
          setStrokeProgress(0);
          return;
        }
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (phase === 'endPause') {
        if (elapsed >= endPauseDuration) {
          if (loop) {
            setActiveStrokeIdx(0);
            setStrokeProgress(0);
          } else {
            setPlaying(false);
          }
          return;
        }
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    playing,
    pausedByUserAction,
    activeStrokeIdx,
    strokeCount,
    speed,
    loop,
    pathLengths,
    prefersReducedMotion,
  ]);

  const replay = useCallback(() => {
    setActiveStrokeIdx(0);
    setStrokeProgress(prefersReducedMotion ? 1 : 0);
    setPlaying(!prefersReducedMotion);
  }, [prefersReducedMotion]);

  const stepPrev = useCallback(() => {
    setPlaying(false);
    setActiveStrokeIdx((prev) => (prev - 1 + strokeCount) % Math.max(1, strokeCount));
    setStrokeProgress(1);
  }, [strokeCount]);

  const stepNext = useCallback(() => {
    setPlaying(false);
    setActiveStrokeIdx((prev) => (prev + 1) % Math.max(1, strokeCount));
    setStrokeProgress(1);
  }, [strokeCount]);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => (prev === 0.7 ? 1 : prev === 1 ? 1.5 : 0.7));
  }, []);

  return {
    playing,
    setPlaying,
    speed,
    setSpeed,
    cycleSpeed,
    activeStrokeIdx,
    setActiveStrokeIdx,
    strokeProgress,
    setPathLengths,
    replay,
    stepPrev,
    stepNext,
  };
}

interface AnimatedStrokeSvgProps {
  glyph: WritingGlyphGuide;
  activeStrokeIdx: number;
  strokeProgress: number;
  showBlueprint?: boolean;
  showStrokeNumbers?: boolean;
  dimmed?: boolean;
  onMeasureLengths?: (lengths: number[]) => void;
}

export const AnimatedStrokeSvg: React.FC<AnimatedStrokeSvgProps> = ({
  glyph,
  activeStrokeIdx,
  strokeProgress,
  showBlueprint = true,
  showStrokeNumbers = true,
  dimmed = false,
  onMeasureLengths,
}) => {
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [measured, setMeasured] = useState<MeasuredStroke[]>([]);

  useLayoutEffect(() => {
    const next: MeasuredStroke[] = [];
    const placedBadges: Array<{ x: number; y: number }> = [];

    glyph.strokes.forEach((_, idx) => {
      const el = pathRefs.current[idx];
      if (!el) {
        next.push({
          length: 120,
          startPoint: { x: 100, y: 100 },
          badgePoint: { x: 100, y: 100 },
          tipAngleDeg: 0,
        });
        return;
      }

      const length = Math.max(1, el.getTotalLength());
      const startPoint = el.getPointAtLength(0);
      const ahead = el.getPointAtLength(Math.min(length, 18));
      const angle = (Math.atan2(ahead.y - startPoint.y, ahead.x - startPoint.x) * 180) / Math.PI;

      // Avoid badge collisions when strokes originate from the same corner
      let badgePoint = { x: startPoint.x, y: startPoint.y };
      const collides = placedBadges.some(
        (b) => Math.hypot(b.x - badgePoint.x, b.y - badgePoint.y) < 22
      );
      if (collides) {
        const shifted = el.getPointAtLength(Math.min(length * 0.45, 28));
        badgePoint = { x: shifted.x, y: shifted.y };
      }
      placedBadges.push(badgePoint);

      next.push({
        length,
        startPoint: { x: startPoint.x, y: startPoint.y },
        badgePoint,
        tipAngleDeg: angle,
      });
    });

    setMeasured(next);
    if (onMeasureLengths) {
      onMeasureLengths(next.map((m) => m.length));
    }
  }, [glyph.id, glyph.strokes, onMeasureLengths]);

  const activeEl = pathRefs.current[activeStrokeIdx];
  const activeMeasured = measured[activeStrokeIdx];
  let nibPos: { x: number; y: number } | null = null;

  if (activeEl && activeMeasured && strokeProgress > 0 && strokeProgress < 1) {
    const pt = activeEl.getPointAtLength(activeMeasured.length * strokeProgress);
    nibPos = { x: pt.x, y: pt.y };
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={`w-full h-full pointer-events-none select-none transition-opacity duration-200 ${
        dimmed ? 'opacity-35' : 'opacity-100'
      }`}
    >
      {/* Hidden measurement paths + soft dashed blueprint */}
      {glyph.strokes.map((pathD, sIdx) => (
        <path
          key={`${glyph.id}-bp-${sIdx}`}
          ref={(el) => {
            pathRefs.current[sIdx] = el;
          }}
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 6"
          className={
            showBlueprint
              ? 'text-slate-300/80 dark:text-slate-600/55'
              : 'text-transparent'
          }
        />
      ))}

      {/* Previously completed strokes in soft accent */}
      {glyph.strokes.map((pathD, sIdx) => {
        if (sIdx >= activeStrokeIdx) return null;
        return (
          <path
            key={`${glyph.id}-done-${sIdx}`}
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-400/55 dark:text-sky-400/40"
          />
        );
      })}

      {/* Active animated stroke */}
      {glyph.strokes[activeStrokeIdx] && (
        <path
          key={`${glyph.id}-active-${activeStrokeIdx}`}
          d={glyph.strokes[activeStrokeIdx]}
          fill="none"
          stroke="currentColor"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={measured[activeStrokeIdx]?.length ?? 200}
          strokeDashoffset={
            (measured[activeStrokeIdx]?.length ?? 200) * (1 - strokeProgress)
          }
          className="text-indigo-600/85 dark:text-sky-400/90"
        />
      )}

      {/* Moving brush tip indicator */}
      {nibPos && (
        <g transform={`translate(${nibPos.x}, ${nibPos.y})`}>
          <circle
            r="11"
            className="fill-indigo-500/20 dark:fill-sky-400/25"
          />
          <circle
            r="6"
            className="fill-indigo-600 dark:fill-sky-300 stroke-white dark:stroke-slate-900"
            strokeWidth="2"
          />
        </g>
      )}

      {/* Numbered stroke origin markers */}
      {showStrokeNumbers &&
        measured.map((m, sIdx) => {
          const isCurrent = sIdx === activeStrokeIdx;
          const isDone = sIdx < activeStrokeIdx;
          return (
            <g
              key={`${glyph.id}-num-${sIdx}`}
              transform={`translate(${m.badgePoint.x}, ${m.badgePoint.y})`}
            >
              <circle
                r={isCurrent ? 10.5 : 8.5}
                className={
                  isCurrent
                    ? 'fill-indigo-600 dark:fill-sky-500 stroke-white dark:stroke-slate-950'
                    : isDone
                    ? 'fill-emerald-600/85 dark:fill-emerald-500/85 stroke-white dark:stroke-slate-950'
                    : 'fill-slate-400/80 dark:fill-slate-600/90 stroke-white dark:stroke-slate-950'
                }
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="0.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isCurrent ? '10.5' : '9'}
                fontWeight="800"
                className="fill-white"
              >
                {sIdx + 1}
              </text>
            </g>
          );
        })}
    </svg>
  );
};

interface AnimatedStrokeGuideProps {
  glyphs: WritingGlyphGuide[];
  sourceLabel?: string;
  onPracticeChar?: (char: string) => void;
}

export const AnimatedStrokeGuide: React.FC<AnimatedStrokeGuideProps> = ({
  glyphs,
  sourceLabel,
  onPracticeChar,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    setSelectedIdx(0);
  }, [glyphs]);

  const activeGlyph = glyphs[selectedIdx % Math.max(1, glyphs.length)];

  const {
    playing,
    setPlaying,
    speed,
    cycleSpeed,
    activeStrokeIdx,
    strokeProgress,
    setPathLengths,
    replay,
    stepPrev,
    stepNext,
  } = useStrokePlayback({
    glyphId: activeGlyph?.id ?? 'none',
    strokeCount: activeGlyph?.strokes.length ?? 0,
    autoPlay: true,
    loop: true,
  });

  if (!activeGlyph) return null;

  return (
    <section
      aria-label="Panduan urutan goresan animasi"
      data-testid="animated-stroke-guide"
      className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Panduan Goresan · {activeGlyph.category} · {activeGlyph.strokeCount} Goresan
          </div>
          <h3 className="mt-0.5 font-display text-base font-extrabold text-slate-900 dark:text-white truncate">
            {activeGlyph.char} · {activeGlyph.name}
          </h3>
          {sourceLabel && glyphs.length > 1 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Huruf pembentuk "{sourceLabel}"
            </p>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
          Goresan {activeStrokeIdx + 1}/{activeGlyph.strokes.length}
        </span>
      </div>

      {/* Character component selector when card contains multiple Hangeul letters */}
      {glyphs.length > 1 && (
        <div
          role="group"
          aria-label="Pilih huruf pembentuk"
          className="flex flex-wrap gap-1.5"
        >
          {glyphs.map((item, idx) => {
            const isActive = idx === selectedIdx % glyphs.length;
            return (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`btn-tactile min-w-[38px] h-9 px-2.5 rounded-xl border text-sm font-display font-extrabold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-800 text-white'
                    : 'bg-white/65 dark:bg-white/[0.07] border-white/75 dark:border-white/12 text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/15'
                }`}
              >
                {item.char}
              </button>
            );
          })}
        </div>
      )}

      {/* Animated SVG stage */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-44 h-44 rounded-3xl bg-white/80 dark:bg-slate-950/75 border border-white/80 dark:border-white/15 shadow-inner overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
              backgroundSize: '88px 88px',
            }}
          />
          <AnimatedStrokeSvg
            glyph={activeGlyph}
            activeStrokeIdx={activeStrokeIdx}
            strokeProgress={strokeProgress}
            showBlueprint
            showStrokeNumbers
            onMeasureLengths={setPathLengths}
          />
        </div>

        {/* Transport & speed controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Jeda animasi goresan' : 'Putar animasi goresan'}
            className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-b-2 border-indigo-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{playing ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            type="button"
            onClick={stepPrev}
            aria-label="Goresan sebelumnya"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/20 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={stepNext}
            aria-label="Goresan berikutnya"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/20 shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={replay}
            aria-label="Ulangi animasi goresan"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulang</span>
          </button>

          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Kecepatan animasi ${speed}x`}
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0"
          >
            {speed}×
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {activeGlyph.tips}
      </p>

      {onPracticeChar && (
        <button
          type="button"
          onClick={() => onPracticeChar(activeGlyph.char)}
          className="btn-tactile w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Latih Menulis "{activeGlyph.char}" di Kanvas</span>
        </button>
      )}
    </section>
  );
};

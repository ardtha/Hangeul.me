import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  PenTool,
  Play,
  RotateCcw,
  Undo2,
  Volume2,
} from 'lucide-react';
import {
  ALL_WRITING_GLYPHS,
  WRITING_GLYPHS,
  type WritingGlyphGuide,
} from '../../data/hangeulData';
import { evaluateWritingPattern } from '../../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../../lib/speech';
import { AnimatedStrokeSvg, useStrokePlayback } from './AnimatedStrokeGuide';

export type WritingTargetRequest = string | { char: string; nonce: number };

interface WritingCanvasDrillProps {
  targetChar?: WritingTargetRequest | null;
  onWritingCompleted: (glyph: WritingGlyphGuide, xpEarned: number) => void;
}

interface StrokeSegment {
  points: Array<{ x: number; y: number }>;
}

export const WritingCanvasDrill: React.FC<WritingCanvasDrillProps> = ({
  targetChar,
  onWritingCompleted,
}) => {
  const [showAll40, setShowAll40] = useState(false);
  const [glyphIndex, setGlyphIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<StrokeSegment[]>([]);
  const [result, setResult] = useState<{
    passed: boolean;
    scorePct: number;
    feedback: string;
    xpEarned?: number;
  } | null>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const activeStrokeRef = useRef<StrokeSegment | null>(null);

  const activeGlyphList = showAll40 ? ALL_WRITING_GLYPHS : WRITING_GLYPHS;
  const activeGlyph = activeGlyphList[glyphIndex % activeGlyphList.length];

  const {
    playing: animPlaying,
    setPlaying: setAnimPlaying,
    speed: animSpeed,
    cycleSpeed: cycleAnimSpeed,
    activeStrokeIdx,
    strokeProgress,
    setPathLengths,
    replay: replayAnim,
    stepPrev: stepAnimPrev,
    stepNext: stepAnimNext,
  } = useStrokePlayback({
    glyphId: activeGlyph.id,
    strokeCount: activeGlyph.strokes.length,
    autoPlay: true,
    loop: true,
    pausedByUserAction: isDrawing,
  });

  const redrawCanvas = useCallback((segments: StrokeSegment[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0f172a';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const seg of segments) {
      if (seg.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(seg.points[0].x, seg.points[0].y);
      if (seg.points.length === 1) {
        ctx.lineTo(seg.points[0].x + 0.5, seg.points[0].y + 0.5);
      } else {
        for (let i = 1; i < seg.points.length; i++) {
          ctx.lineTo(seg.points[i].x, seg.points[i].y);
        }
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  const getPointerCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getPointerCoords(e);
    isDrawingRef.current = true;
    setIsDrawing(true);
    const newSeg: StrokeSegment = { points: [pt] };
    activeStrokeRef.current = newSeg;
    setStrokes((prev) => [...prev, newSeg]);
    setResult(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const pt = getPointerCoords(e);
    activeStrokeRef.current.points.push(pt);
    const activeList = strokes.includes(activeStrokeRef.current)
      ? strokes
      : [...strokes, activeStrokeRef.current];
    redrawCanvas(activeList);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    activeStrokeRef.current = null;
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    setResult(null);
  };

  const handleClear = () => {
    setStrokes([]);
    redrawCanvas([]);
    setResult(null);
  };

  const handleSelectGlyph = useCallback((idx: number) => {
    setGlyphIndex(idx);
    setStrokes([]);
    redrawCanvas([]);
    setResult(null);
  }, [redrawCanvas]);

  const targetGlyphChar = typeof targetChar === 'string' ? targetChar : targetChar?.char ?? null;
  const targetGlyphNonce = typeof targetChar === 'object' && targetChar !== null ? targetChar.nonce : 0;

  useEffect(() => {
    if (!targetGlyphChar) return;
    const coreIdx = WRITING_GLYPHS.findIndex((g) => g.char === targetGlyphChar);
    if (coreIdx >= 0) {
      setShowAll40(false);
      setGlyphIndex(coreIdx);
      setStrokes([]);
      redrawCanvas([]);
      setResult(null);
      return;
    }
    const allIdx = ALL_WRITING_GLYPHS.findIndex((g) => g.char === targetGlyphChar);
    if (allIdx >= 0) {
      setShowAll40(true);
      setGlyphIndex(allIdx);
      setStrokes([]);
      redrawCanvas([]);
      setResult(null);
    }
  }, [targetGlyphChar, targetGlyphNonce, redrawCanvas]);

  const handleVerify = () => {
    const evalRes = evaluateWritingPattern(
      strokes.map((s) => s.points),
      activeGlyph.strokes,
      280
    );

    if (evalRes.passed) {
      speakKorean(activeGlyph.char);
      const earned = completedIds[activeGlyph.id] ? 4 : 8;
      if (!completedIds[activeGlyph.id]) {
        setCompletedIds((prev) => ({ ...prev, [activeGlyph.id]: true }));
      }
      onWritingCompleted(activeGlyph, earned);

      const nextIdx = (glyphIndex + 1) % activeGlyphList.length;
      const nextGlyph = activeGlyphList[nextIdx];
      setGlyphIndex(nextIdx);
      setStrokes([]);
      redrawCanvas([]);
      setResult({
        passed: true,
        scorePct: evalRes.scorePct,
        xpEarned: earned,
        feedback: `Benar! Huruf "${activeGlyph.char}" tepat (Skor ${evalRes.scorePct}%). Lanjut ke "${nextGlyph.char}" (${nextGlyph.name})!`,
      });
      return;
    }

    // Pola salah: langsung riset kanvas huruf ini saja, tetap di huruf yang sama
    setStrokes([]);
    redrawCanvas([]);
    setResult({
      passed: false,
      scorePct: evalRes.scorePct,
      feedback: evalRes.feedback,
    });
  };

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <PenTool className="w-4 h-4" />
            <span>Kanvas Menulis Hangeul · Urutan Goresan</span>
          </div>
          <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Latih Menulis Huruf "{activeGlyph.char}" ({activeGlyph.name})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Pilih cakupan huruf"
            className="inline-flex rounded-xl p-0.5 bg-white/60 dark:bg-white/[0.06] border border-white/75 dark:border-white/12"
          >
            <button
              type="button"
              onClick={() => {
                setShowAll40(false);
                setGlyphIndex((prev) => prev % WRITING_GLYPHS.length);
                setStrokes([]);
                redrawCanvas([]);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                !showAll40
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dasar (16)
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAll40(true);
                setStrokes([]);
                redrawCanvas([]);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                showAll40
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({ALL_WRITING_GLYPHS.length})
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            Selesai:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {activeGlyphList.filter((g) => completedIds[g.id]).length}
            </strong>
            /{activeGlyphList.length} huruf
          </div>
        </div>
      </div>

      {/* Glyph Selector Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        {activeGlyphList.map((glyph, idx) => {
          const active = idx === glyphIndex % activeGlyphList.length;
          const done = Boolean(completedIds[glyph.id]);
          return (
            <button
              key={glyph.id}
              type="button"
              onClick={() => handleSelectGlyph(idx)}
              className={`btn-tactile min-w-[44px] h-11 px-2.5 rounded-2xl border border-b-2 text-sm font-display font-extrabold transition-colors shrink-0 backdrop-blur-md ${
                active
                  ? 'bg-indigo-600 border-indigo-800 text-white'
                  : done
                  ? 'bg-emerald-50/75 dark:bg-emerald-950/45 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white/60 dark:bg-white/[0.07] border-white/70 dark:border-white/12 text-slate-800 dark:text-slate-200 hover:bg-white/85 dark:hover:bg-white/15'
              }`}
            >
              {glyph.char}
            </button>
          );
        })}
      </div>

      {/* Main Two-Zone Canvas + Guide Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Canvas Pad */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-[280px] h-[280px] rounded-[28px] bg-white/75 dark:bg-slate-950/70 backdrop-blur-xl border-2 border-white/80 dark:border-white/15 overflow-hidden shadow-inner">
            {/* Crosshair grid guides */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
                backgroundSize: '140px 140px',
              }}
            />

            {/* Animated SVG Stroke Order Vector Underlay */}
            {showGuide && (
              <div className="absolute inset-0 pointer-events-none">
                <AnimatedStrokeSvg
                  glyph={activeGlyph}
                  activeStrokeIdx={activeStrokeIdx}
                  strokeProgress={strokeProgress}
                  showBlueprint
                  showStrokeNumbers
                  dimmed={isDrawing}
                  onMeasureLengths={setPathLengths}
                />
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              data-testid="writing-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative z-10 w-full h-full touch-none cursor-crosshair"
            />
          </div>

          {/* Animated Stroke Playback Controls */}
          {showGuide && (
            <div
              data-testid="writing-stroke-controls"
              className="mt-3 flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <button
                type="button"
                onClick={() => setAnimPlaying((v) => !v)}
                aria-label={animPlaying ? 'Jeda urutan goresan' : 'Putar urutan goresan'}
                className="btn-tactile inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-b-2 border-indigo-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
              >
                {animPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{animPlaying ? 'Jeda' : 'Putar'}</span>
              </button>

              <button
                type="button"
                onClick={stepAnimPrev}
                aria-label="Langkah goresan sebelumnya"
                className="inline-flex items-center justify-center w-7 h-7 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-slate-700 dark:text-slate-200 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums px-1 shrink-0">
                {activeStrokeIdx + 1}/{activeGlyph.strokes.length}
              </span>

              <button
                type="button"
                onClick={stepAnimNext}
                aria-label="Langkah goresan berikutnya"
                className="inline-flex items-center justify-center w-7 h-7 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-slate-700 dark:text-slate-200 shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={replayAnim}
                aria-label="Ulangi animasi goresan"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ulang</span>
              </button>

              <button
                type="button"
                onClick={cycleAnimSpeed}
                aria-label={`Kecepatan animasi ${animSpeed}x`}
                className="inline-flex items-center justify-center px-2 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0"
              >
                {animSpeed}×
              </button>
            </div>
          )}

          {/* Canvas Action Controls */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowGuide((v) => !v)}
              aria-label={showGuide ? 'Sembunyikan panduan' : 'Tampilkan panduan'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
            >
              {showGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showGuide ? 'Panduan Aktif' : 'Panduan Mati'}</span>
            </button>
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 whitespace-nowrap"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Urungkan</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              aria-label="Bersihkan kanvas"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Instruction & Verification Column */}
        <div className="md:col-span-6 space-y-4">
          <div className="ios-glass-well rounded-2xl bg-white/52 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeGlyph.category} · {activeGlyph.strokeCount} Goresan
              </span>
              {canSpeakKorean() && (
                <button
                  type="button"
                  onClick={() => speakKorean(activeGlyph.char)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/75 dark:bg-white/10 border border-white/75 dark:border-white/12 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Dengar "{activeGlyph.char}"</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/15 flex items-center justify-center font-display text-4xl font-extrabold text-slate-900 dark:text-white shrink-0">
                {activeGlyph.char}
              </div>
              <div>
                <div className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                  {activeGlyph.name}
                </div>
                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Bunyi: "{activeGlyph.roman}"
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeGlyph.tips}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleVerify}
              className="btn-tactile flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 text-white text-sm font-bold whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Periksa Tulisan</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectGlyph((glyphIndex + 1) % activeGlyphList.length)}
              className="btn-tactile inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-950 text-slate-800 dark:text-slate-100 text-sm font-bold whitespace-nowrap"
            >
              <span>Huruf Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {result && (
            <div
              role="status"
              className={`rounded-2xl p-4 border text-xs space-y-1 ${
                result.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center justify-between tabular-nums">
                <span>
                  {result.passed
                    ? `Pola Benar! (+${result.xpEarned ?? 8} XP)`
                    : `Pola Salah — Kanvas "${activeGlyph.char}" Direset`}
                </span>
                <span>Skor Goresan: {result.scorePct}%</span>
              </div>
              <p>{result.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

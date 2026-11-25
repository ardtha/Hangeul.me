export interface WritingCoverageEvaluation {
  passed: boolean;
  scorePct: number;
  feedback: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export function evaluateWritingCoverage(
  inkSamples: number,
  boundingRatio: number
): WritingCoverageEvaluation {
  const safeInk = Math.max(0, inkSamples);
  const safeBound = Math.max(0, Math.min(1, boundingRatio));
  const rawScore = Math.round(Math.min(100, safeInk * 1.4 + safeBound * 55));

  if (safeInk < 18 || safeBound < 0.16) {
    return {
      passed: false,
      scorePct: rawScore,
      feedback: 'Goresan masih terlalu pendek. Ikuti garis panduan huruf dari awal hingga akhir.',
    };
  }

  return {
    passed: true,
    scorePct: Math.max(72, rawScore),
    feedback: 'Bentuk huruf Hangeul terlihat rapi & proporsional!',
  };
}

function appendLineSamples(
  out: Point2D[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  step = 6
): void {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const count = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
  }
}

export function sampleSvgPathPoints(pathD: string): Point2D[] {
  const tokens = pathD.match(/[a-zA-Z]|[-+]?\d*\.?\d+/g);
  if (!tokens) return [];

  const points: Point2D[] = [];
  let i = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === 'Z' || cmd === 'z') {
        if (Math.hypot(sx - cx, sy - cy) > 1) {
          appendLineSamples(points, cx, cy, sx, sy);
        }
        cx = sx;
        cy = sy;
        continue;
      }
    }

    if (cmd === 'M') {
      cx = num();
      cy = num();
      sx = cx;
      sy = cy;
      points.push({ x: cx, y: cy });
      cmd = 'L';
    } else if (cmd === 'L') {
      const x1 = num();
      const y1 = num();
      appendLineSamples(points, cx, cy, x1, y1);
      cx = x1;
      cy = y1;
    } else if (cmd === 'Q') {
      const qx = num();
      const qy = num();
      const x1 = num();
      const y1 = num();
      const steps = 20;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const inv = 1 - t;
        points.push({
          x: inv * inv * cx + 2 * inv * t * qx + t * t * x1,
          y: inv * inv * cy + 2 * inv * t * qy + t * t * y1,
        });
      }
      cx = x1;
      cy = y1;
    } else if (cmd === 'A') {
      let rx = Math.abs(num());
      let ry = Math.abs(num());
      const phiDeg = num();
      const largeArc = num();
      const sweep = num();
      const x2 = num();
      const y2 = num();

      if (rx > 0 && ry > 0 && (cx !== x2 || cy !== y2)) {
        const phi = (phiDeg * Math.PI) / 180;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);
        const dx2 = (cx - x2) / 2;
        const dy2 = (cy - y2) / 2;
        const x1p = cosP * dx2 + sinP * dy2;
        const y1p = -sinP * dx2 + cosP * dy2;

        const rx2 = rx * rx;
        const ry2 = ry * ry;
        const x1p2 = x1p * x1p;
        const y1p2 = y1p * y1p;
        const lambda = x1p2 / rx2 + y1p2 / ry2;
        if (lambda > 1) {
          const s = Math.sqrt(lambda);
          rx *= s;
          ry *= s;
        }
        const rx2u = rx * rx;
        const ry2u = ry * ry;
        const denom = rx2u * y1p2 + ry2u * x1p2;
        const sq = denom > 0 ? Math.max(0, (rx2u * ry2u - denom) / denom) : 0;
        const coef = (largeArc === sweep ? -1 : 1) * Math.sqrt(sq);
        const cxp = coef * ((rx * y1p) / ry);
        const cyp = coef * (-(ry * x1p) / rx);
        const arcCx = cosP * cxp - sinP * cyp + (cx + x2) / 2;
        const arcCy = sinP * cxp + cosP * cyp + (cy + y2) / 2;

        const vecAng = (ux: number, uy: number, vx: number, vy: number) => {
          const dot = ux * vx + uy * vy;
          const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
          const ratio = len > 0 ? Math.max(-1, Math.min(1, dot / len)) : 1;
          const ang = Math.acos(ratio);
          return ux * vy - uy * vx < 0 ? -ang : ang;
        };

        const vx1 = (x1p - cxp) / rx;
        const vy1 = (y1p - cyp) / ry;
        const vx2 = (-x1p - cxp) / rx;
        const vy2 = (-y1p - cyp) / ry;

        const theta1 = vecAng(1, 0, vx1, vy1);
        let dTheta = vecAng(vx1, vy1, vx2, vy2);
        if (sweep === 0 && dTheta > 0) dTheta -= 2 * Math.PI;
        if (sweep === 1 && dTheta < 0) dTheta += 2 * Math.PI;

        const steps = 32;
        for (let s = 0; s <= steps; s++) {
          const t = theta1 + (dTheta * s) / steps;
          const px = rx * Math.cos(t);
          const py = ry * Math.sin(t);
          points.push({
            x: cosP * px - sinP * py + arcCx,
            y: sinP * px + cosP * py + arcCy,
          });
        }
      }
      cx = x2;
      cy = y2;
    } else {
      i++;
    }
  }

  return points;
}

export function evaluateWritingPattern(
  userStrokes: Point2D[][],
  guideSvgPaths: string[],
  canvasSize = 280
): WritingCoverageEvaluation {
  const rawPts = userStrokes.flat();
  if (rawPts.length < 2) {
    return {
      passed: false,
      scorePct: 0,
      feedback: 'Goresan masih terlalu pendek. Tulis pola huruf lengkap sesuai panduan!',
    };
  }

  const scale = 200 / Math.max(1, canvasSize);
  const resampledUser: Point2D[] = [];
  for (const stroke of userStrokes) {
    if (stroke.length === 0) continue;
    for (let k = 0; k < stroke.length; k++) {
      const p0 = { x: stroke[k].x * scale, y: stroke[k].y * scale };
      if (k === 0) {
        resampledUser.push(p0);
      } else {
        const prev = { x: stroke[k - 1].x * scale, y: stroke[k - 1].y * scale };
        appendLineSamples(resampledUser, prev.x, prev.y, p0.x, p0.y, 6);
      }
    }
  }

  if (resampledUser.length < 10) {
    return {
      passed: false,
      scorePct: 12,
      feedback: 'Pola goresan belum cukup lengkap. Ikuti garis panduan huruf!',
    };
  }

  const guidePts = guideSvgPaths.flatMap((d) => sampleSvgPathPoints(d));
  if (guidePts.length === 0) {
    return {
      passed: false,
      scorePct: 0,
      feedback: 'Panduan pola huruf tidak ditemukan.',
    };
  }

  const tolSq = 28 * 28;

  let guideHits = 0;
  for (const gp of guidePts) {
    for (const up of resampledUser) {
      const dx = gp.x - up.x;
      const dy = gp.y - up.y;
      if (dx * dx + dy * dy <= tolSq) {
        guideHits++;
        break;
      }
    }
  }

  let userHits = 0;
  for (const up of resampledUser) {
    for (const gp of guidePts) {
      const dx = gp.x - up.x;
      const dy = gp.y - up.y;
      if (dx * dx + dy * dy <= tolSq) {
        userHits++;
        break;
      }
    }
  }

  const recall = guideHits / guidePts.length;
  const precision = userHits / resampledUser.length;
  const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  const scorePct = Math.round(f1 * 100);

  if (recall < 0.62 || precision < 0.6) {
    return {
      passed: false,
      scorePct,
      feedback:
        recall < 0.62
          ? 'Pola huruf belum lengkap atau melenceng — kanvas huruf ini direset, silakan tulis ulang!'
          : 'Goresan terlalu keluar dari pola huruf — kanvas huruf ini direset, silakan coba lagi!',
    };
  }

  return {
    passed: true,
    scorePct: Math.max(72, scorePct),
    feedback: 'Pola huruf tepat & proporsional!',
  };
}

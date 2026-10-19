import { Easing, interpolate } from 'remotion';

export const inOut = Easing.bezier(0.45, 0, 0.55, 1);
export const out = Easing.bezier(0.2, 0.7, 0.2, 1);

// valor 0→1 entre dos fotogramas, con easing
export function prog(frame, start, dur, easing = inOut) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// entrada de texto: aparece con un desplazamiento corto hacia arriba
export function enter(frame, start, { dur = 20, dist = 28, exit, exitDur = 14 } = {}) {
  const p = prog(frame, start, dur, out);
  let o = p;
  let y = (1 - p) * dist;
  if (exit !== undefined) {
    const q = prog(frame, exit, exitDur, inOut);
    o *= 1 - q;
    y -= q * dist * 0.5;
  }
  return { opacity: o, transform: `translateY(${y}px)` };
}

export const lerp = (a, b, t) => a + (b - a) * t;

// generador pseudoaleatorio determinista
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

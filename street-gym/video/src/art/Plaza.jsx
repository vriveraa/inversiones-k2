import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { C, shade } from '../theme';
import { lerp, rng } from '../util';

// Cordillera: línea de cumbres con picos y valles deterministas
function ridge(seed, base, peakMin, peakMax, valMin, valMax, step) {
  const r = rng(seed);
  const pts = [];
  let peak = r() > 0.5;
  for (let x = -260; x <= 2200; x += step * (0.7 + r() * 0.6)) {
    const h = peak ? peakMin + r() * (peakMax - peakMin) : valMin + r() * (valMax - valMin);
    pts.push([x, base - h]);
    peak = !peak;
  }
  return pts;
}

function Range({ seed, base, peak, val, step, color, snow, snowLine, shadeAmt = -0.1, id }) {
  const pts = useMemo(() => ridge(seed, base, peak[0], peak[1], val[0], val[1], step), [seed, base, step]);
  const poly = [[-260, 1080], ...pts, [2200, 1080]].map(p => p.join(',')).join(' ');
  const snowPts = useMemo(() => {
    const r = rng(seed + 7);
    const edge = [];
    for (let x = -260; x <= 2200; x += 34) edge.push([x, snowLine + (r() - 0.5) * 34 + (x % 3) * 2]);
    return [[-260, 0], ...edge, [2200, 0]].map(p => p.join(',')).join(' ');
  }, [seed, snowLine]);
  // caras en sombra: de cada pico al valle siguiente
  const faces = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const [qx, qy] = pts[i + 1];
    if (py < qy) faces.push(`${px},${py} ${qx},${qy} ${qx + 40},${base + 40} ${px + (qx - px) * 0.25},${base + 40}`);
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <polygon points={poly} />
        </clipPath>
      </defs>
      <polygon points={poly} fill={color} />
      <g clipPath={`url(#${id})`}>
        {snow && <polygon points={snowPts} fill={snow} />}
        {faces.map((f, i) => (
          <polygon key={i} points={f} fill="#4E6A7D" opacity={-shadeAmt * 2.2} />
        ))}
      </g>
    </g>
  );
}

function City({ y }) {
  const r = rng(91);
  const bs = [];
  let x = 180;
  while (x < 1800) {
    const w = 38 + r() * 60;
    const h = 30 + r() * 80 + (r() > 0.88 ? 110 : 0);
    bs.push([x, w, h]);
    x += w + 4 + r() * 26;
  }
  return (
    <g fill="#B7CAD5">
      {bs.map(([bx, w, h], i) => (
        <rect key={i} x={bx} y={y - h} width={w} height={h + 40} rx={2} />
      ))}
      <rect x={1180} y={y - 250} width={46} height={290} rx={3} fill="#AFC3CF" />
      <polygon points={`1180,${y - 250} 1226,${y - 250} 1203,${y - 282}`} fill="#AFC3CF" />
    </g>
  );
}

export function Tree({ x, y, s = 1, dark = C.leaf, mid = C.leaf2, light = C.grass, sway = 0 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={30} cy={4} rx={150} ry={16} fill={C.ink} opacity={0.1} />
      <path d="M-10,0 L-6,-150 L-30,-205 L-22,-210 L0,-172 L10,-230 L20,-228 L12,-150 L12,0 Z" fill={C.trunk} />
      <g transform={`rotate(${sway},0,-150)`}>
        <circle cx={-70} cy={-250} r={85} fill={dark} />
        <circle cx={60} cy={-265} r={95} fill={dark} />
        <circle cx={-5} cy={-330} r={100} fill={dark} />
        <circle cx={-30} cy={-345} r={70} fill={mid} />
        <circle cx={70} cy={-300} r={62} fill={mid} />
        <circle cx={-95} cy={-270} r={50} fill={mid} />
        <circle cx={-10} cy={-390} r={34} fill={light} opacity={0.75} />
        <circle cx={85} cy={-330} r={24} fill={light} opacity={0.6} />
      </g>
    </g>
  );
}

export function Bench({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={130} ry={10} fill={C.ink} opacity={0.12} />
      <rect x={-110} y={-70} width={220} height={14} rx={4} fill="#7A5A3A" />
      <rect x={-110} y={-100} width={220} height={12} rx={4} fill="#8A6A48" />
      <rect x={-118} y={-46} width={236} height={14} rx={4} fill="#8A6A48" />
      <rect x={-96} y={-110} width={10} height={110} rx={3} fill={C.ink} />
      <rect x={86} y={-110} width={10} height={110} rx={3} fill={C.ink} />
    </g>
  );
}

export function Lamp({ x, y, s = 1, on = 0 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {on > 0 && <ellipse cx={0} cy={-300} rx={70} ry={70} fill="#FFF1C2" opacity={0.35 * on} />}
      <rect x={-5} y={-300} width={10} height={300} fill={C.ink} />
      <rect x={-14} y={-14} width={28} height={14} rx={3} fill={C.ink} />
      <path d="M-26,-300 L26,-300 L16,-330 L-16,-330 Z" fill={C.ink} />
      <rect x={-18} y={-302} width={36} height={8} rx={2} fill={on ? '#FFF1C2' : '#E6E0CF'} />
    </g>
  );
}

// Plaza completa por capas. drift: desplazamiento de cámara en px (parallax).
export function Plaza({ drift = 0, dawn = 1, sunRise = 1, children, fg = true, props = true, warm = 0 }) {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 38) * 1.2;
  const sunY = lerp(560, 230, sunRise);
  const skyTop = dawn < 1 ? mix('#9FC3DA', '#BFDDEB', dawn) : '#BFDDEB';
  const skyBot = mix('#F7D9B8', '#F4EEDF', dawn);
  const L = f => `translate(${-drift * f},0)`;
  const grain = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 260 }, () => [r() * 2200 - 140, 760 + Math.pow(r(), 0.8) * 320, 1 + r() * 2.2]);
  }, []);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.62" stopColor={C.sky} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#FFE7B8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFE7B8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="light" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9C7" stopOpacity={0.35 + warm * 0.2} />
          <stop offset="0.6" stopColor="#FFE9C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#sky)" />
      <g transform={L(0.08)}>
        <circle cx={1420} cy={sunY} r={300} fill="url(#sunGlow)" />
        <circle cx={1420} cy={sunY} r={62} fill="#FFF3D6" />
      </g>
      <g transform={L(0.12)}>
        <Range id="farR" seed={11} base={600} peak={[210, 330]} val={[90, 160]} step={130} color="#A9BFCD" snow="#F6F8F3" snowLine={380} />
      </g>
      <g transform={L(0.2)}>
        <Range id="nearR" seed={23} base={650} peak={[110, 190]} val={[40, 90]} step={150} color="#8EA7B6" snow="#E7EEF2" snowLine={500} shadeAmt={-0.08} />
      </g>
      <g transform={L(0.3)}>
        <City y={700} />
      </g>
      <g transform={L(0.45)}>
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={-200 + i * 82} cy={712 - (i % 3) * 10} r={56 + (i % 4) * 9} fill={i % 2 ? C.leaf2 : '#6E9F69'} opacity={0.75} />
        ))}
      </g>
      <g transform={L(0.7)}>
        <rect x={-300} y={720} width={2600} height={400} fill={C.grass} />
        <path d="M-300,770 C300,748 1500,748 2300,772 L2300,1120 L-300,1120 Z" fill={C.maicillo} />
        <path d="M-300,770 C300,748 1500,748 2300,772" stroke={C.maicilloDark} strokeWidth={4} fill="none" />
        {grain.map(([gx, gy, gr], i) => (
          <circle key={i} cx={gx} cy={gy} r={gr} fill={i % 3 ? C.maicilloDark : C.maicilloLight} opacity={0.8} />
        ))}
        {props && (
          <>
            <Bench x={260} y={800} s={0.75} />
            <Lamp x={430} y={792} s={0.95} />
            <Lamp x={1660} y={792} s={0.95} />
          </>
        )}
      </g>
      <g transform={L(1)}>{children}</g>
      {fg && (
        <g transform={L(1.25)}>
          <Tree x={-30} y={1000} s={1.25} sway={sway} />
          <Tree x={1980} y={1010} s={1.35} sway={-sway} />
        </g>
      )}
      <rect width={1920} height={1080} fill="url(#light)" pointerEvents="none" />
    </svg>
  );
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map(sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, t)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

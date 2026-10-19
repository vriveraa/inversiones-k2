import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { IconClock } from '../art/Icons';
import { C } from '../theme';
import { Kicker, Pill, Title } from '../ui/Text';
import { lerp, out, prog } from '../util';

// Ruta larga con vueltas entre la casa y el gimnasio (coordenadas del mapa)
const ROUTE = [
  [110, 520], [110, 430], [250, 430], [250, 330], [170, 330], [170, 210], [330, 210],
  [330, 120], [470, 120], [470, 260], [560, 260], [560, 170], [690, 170], [690, 90],
];

function along(pts, t) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  let d = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const u = d / seg[i];
      return { p: [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)], i };
    }
    d -= seg[i];
  }
  return { p: pts[pts.length - 1], i: seg.length - 1 };
}

function MapCard({ f }) {
  const t = prog(f, 26, 100);
  const { p, i } = along(ROUTE, t);
  const drawn = [...ROUTE.slice(0, i + 1), p];
  const pts = a => a.map(q => q.join(',')).join(' ');
  return (
    <g transform="translate(1010,280) scale(0.88)">
      <rect x={0} y={0} width={800} height={600} rx={28} fill={C.maicilloLight} stroke={C.ink} strokeWidth={5} />
      <clipPath id="mapclip"><rect x={0} y={0} width={800} height={600} rx={28} /></clipPath>
      <g clipPath="url(#mapclip)">
        <rect x={380} y={300} width={160} height={120} rx={10} fill={C.grass} />
        <rect x={40} y={60} width={100} height={90} rx={10} fill={C.grass} />
        <rect x={600} y={330} width={160} height={180} rx={10} fill={C.grass} />
        <path d="M-20,560 C180,500 260,600 420,520 S700,470 820,520" stroke="#8CCAD2" strokeWidth={30} fill="none" />
        {[50, 130, 210, 290, 370, 450, 530].map(y => <line key={y} x1={0} y1={y} x2={800} y2={y} stroke="#fff" strokeWidth={10} />)}
        {[60, 170, 250, 330, 410, 470, 560, 690, 760].map(x => <line key={x} x1={x} y1={0} x2={x} y2={600} stroke="#fff" strokeWidth={10} />)}
        <polyline points={pts(drawn)} fill="none" stroke={C.orange} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts(drawn)} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="10 14" strokeLinejoin="round" />
        <circle cx={p[0]} cy={p[1]} r={14} fill={C.ink} stroke="#fff" strokeWidth={5} />
      </g>
      <g transform="translate(110,520)">
        <circle r={44} fill={C.orange} />
        <path d="M-20,2 L0,-18 L20,2 M-13,-4 L-13,18 L13,18 L13,-4" stroke="#fff" strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      <g transform={`translate(690,90) scale(${prog(f, 110, 14, out)})`}>
        <circle r={46} fill={C.ink} />
        <rect x={-22} y={-4} width={44} height={8} rx={4} fill="#fff" />
        <rect x={-28} y={-14} width={10} height={28} rx={3} fill={C.orange} />
        <rect x={18} y={-14} width={10} height={28} rx={3} fill={C.orange} />
      </g>
    </g>
  );
}

export function S4Tiempo() {
  const f = useCurrentFrame();
  const spin = f + Math.pow(prog(f, 0, 150), 1.4) * 260;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={500} cy={560} r={290} fill={C.sky} />
        <g transform={`translate(${500 - 200},${560 - 200 + (1 - prog(f, 6, 20, out)) * 30}) scale(4)`} opacity={prog(f, 6, 20, out)}>
          <IconClock t={spin} speed={5} />
        </g>
        <g opacity={prog(f, 14, 20, out)} transform={`translate(0,${(1 - prog(f, 14, 20, out)) * 30})`}>
          <MapCard f={f} />
        </g>
      </svg>
      <Kicker label="El problema · Tiempo y distancia" element="Problema" />
      <Title start={10} size={96} width={1500}>Sin tiempo y con el gimnasio lejos</Title>
      <Pill x={500} y={790} start={40} anchor="center">Horarios que no calzan</Pill>
      <Pill x={1362} y={790} start={96} anchor="center">Una ruta larga</Pill>
    </AbsoluteFill>
  );
}

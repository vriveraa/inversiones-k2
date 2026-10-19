import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Person } from '../art/Person';
import { C, FONT_BODY, FONT_DISPLAY } from '../theme';
import { Kicker, Title } from '../ui/Text';
import { lerp, out, prog } from '../util';

function Storefront({ f }) {
  const shutter = prog(f, 18, 34); // la cortina baja
  const signIn = prog(f, 50, 16, out);
  const swing = Math.exp(-Math.max(0, f - 58) / 14) * Math.sin(Math.max(0, f - 58) / 4) * 9;
  const top = 430;
  const bottom = 842;
  const h = lerp(0, bottom - top, shutter);
  return (
    <g>
      <rect x={760} y={210} width={1100} height={640} fill={C.maicilloLight} />
      <rect x={760} y={210} width={1100} height={26} fill="#D8CDB6" />
      <rect x={830} y={280} width={960} height={110} rx={8} fill={C.ink} />
      <text x={1310} y={358} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={76} letterSpacing="0.1em" fill="#fff">GIMNASIO</text>
      <rect x={860} y={top} width={900} height={bottom - top} fill="#1F2D3B" />
      {[0, 1, 2].map(i => (
        <g key={i} opacity={0.5}>
          <rect x={900 + i * 290} y={560} width={200} height={14} rx={7} fill="#3A4B5C" />
          <circle cx={910 + i * 290} cy={567} r={34} fill="#3A4B5C" />
          <circle cx={1090 + i * 290} cy={567} r={34} fill="#3A4B5C" />
        </g>
      ))}
      <rect x={860} y={top} width={900} height={h} fill="#A5AFB7" />
      {Array.from({ length: Math.floor(h / 22) }, (_, i) => (
        <rect key={i} x={860} y={top + h - 22 * (i + 1)} width={900} height={3} fill="#8C979F" />
      ))}
      {h > 4 && <rect x={860} y={top + h - 14} width={900} height={14} fill="#6E7A83" />}
      <rect x={848} y={top - 12} width={924} height={22} rx={4} fill="#5C6770" />
      <rect x={760} y={846} width={1100} height={18} fill="#CFC3A8" />
      <g opacity={signIn} transform={`translate(1310,${lerp(470, 520, signIn)}) rotate(${swing})`}>
        <line x1={-90} y1={-60} x2={0} y2={-120} stroke={C.ink} strokeWidth={4} />
        <line x1={90} y1={-60} x2={0} y2={-120} stroke={C.ink} strokeWidth={4} />
        <rect x={-190} y={-62} width={380} height={130} rx={14} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={86} letterSpacing="0.06em" fill={C.orange}>CERRADO</text>
      </g>
    </g>
  );
}

function Gym({ x, y, s, tags, f, start }) {
  const p = prog(f, start, 18, out);
  const grow = prog(f, start + 14, 30);
  const bob = Math.sin((f - start) / 9) * 6 * grow;
  return (
    <g transform={`translate(${x},${y + (1 - p) * 40}) scale(${s})`} opacity={p}>
      <rect x={-130} y={-230} width={260} height={230} fill={C.ink} rx={6} />
      <rect x={-100} y={-200} width={200} height={50} rx={6} fill={C.teal} />
      <rect x={-56} y={-180} width={112} height={10} rx={5} fill="#fff" />
      <rect x={-64} y={-190} width={14} height={30} rx={3} fill="#fff" />
      <rect x={50} y={-190} width={14} height={30} rx={3} fill="#fff" />
      <rect x={-100} y={-125} width={80} height={60} fill="#3A5266" />
      <rect x={20} y={-125} width={80} height={60} fill="#3A5266" />
      <rect x={-30} y={-90} width={60} height={90} fill="#0E1823" />
      <g transform={`translate(0,${-300 - grow * 30})`}>
        <path d={`M${-34 - tags * 22},-44 L${34 + tags * 22},-44 L${54 + tags * 22},0 L${34 + tags * 22},44 L${-34 - tags * 22},44 Z`} fill={C.orange} />
        <circle cx={-14 - tags * 22} cy={0} r={9} fill="#fff" />
        <text x={14} y={24} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={66} fill="#fff">
          {'$'.repeat(tags)}
        </text>
      </g>
      <g transform={`translate(${86 + tags * 22},${-360 - grow * 30 + bob})`} opacity={grow}>
        <path d="M0,-40 L26,-8 L10,-8 L10,30 L-10,30 L-10,-8 L-26,-8 Z" fill={C.ink} />
      </g>
    </g>
  );
}

export function S3Precio() {
  const f = useCurrentFrame();
  const B = 108; // cambio a la segunda parte
  const toB = prog(f, B - 6, 16);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect width={1920} height={1080} fill="#D6EBF3" />
        <rect y={864} width={1920} height={216} fill={C.maicillo} />
        <g opacity={1 - toB} transform={`translate(${-toB * 240},0)`}>
          <Storefront f={f} />
          <Person
            k={330} o={[520, 900]} face={1}
            hip={[0, 0.92]} sh={[0.03, 1.46]}
            hands={[[0.14, 0.72], [-0.08, 0.7]]}
            feet={[[0.08, 0.06], [-0.1, 0.06]]}
            armBend={[1, -1]} legBend={1}
          />
          <rect x={608} y={700} width={110} height={70} rx={18} fill={C.orange} />
          <path d="M630,700 Q663,664 696,700" stroke={C.ink} strokeWidth={8} fill="none" />
        </g>
        <g opacity={toB} transform={`translate(${(1 - toB) * 240},0)`}>
          <Gym x={560} y={860} s={1.05} tags={2} f={f} start={B + 10} />
          <Gym x={960} y={860} s={1.05} tags={3} f={f} start={B + 20} />
          <Gym x={1360} y={860} s={1.05} tags={4} f={f} start={B + 30} />
        </g>
      </svg>
      <Kicker label="El problema · Precio" element="Problema" />
      <Title start={12} exit={B - 12} size={90} width={620}>Tu gimnasio cerró</Title>
      <Title start={B + 8} size={100} width={1500}>Los que quedan cuestan bastante más</Title>
    </AbsoluteFill>
  );
}

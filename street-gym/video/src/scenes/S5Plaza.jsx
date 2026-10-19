import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Person } from '../art/Person';
import { Plaza } from '../art/Plaza';
import { C } from '../theme';
import { Kicker, Pill, Title } from '../ui/Text';
import { lerp, prog } from '../util';

const TUBE = '#6D8E93';
const SEAT = '#D3DBD5';

// Máquina típica de plaza: asiento fijo y brazos que empujan sin peso
export function OldPress({ k, o, m, wobble = 0, person = true }) {
  const P = p => [o[0] + p[0] * k, o[1] - p[1] * k];
  const ln = (a, b, w, c) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w * k} strokeLinecap="round" />;
  };
  const hx = lerp(0.42, 0.5, m);
  const hand = [hx, 0.98];
  return (
    <g transform={`rotate(${wobble},${o[0]},${o[1]})`}>
      <ellipse cx={o[0]} cy={o[1] + 6} rx={0.6 * k} ry={0.05 * k} fill={C.ink} opacity={0.14} />
      {ln([-0.12, 0], [-0.12, 1.42], 0.09, TUBE)}
      {ln([-0.22, 0], [0.02, 0], 0.06, TUBE)}
      {ln([-0.12, 1.42], [0.1, 1.42], 0.08, TUBE)}
      {ln([0.1, 1.42], [hx - 0.02, 1.0], 0.06, TUBE)}
      {ln([hx - 0.04, 1.0], [hx + 0.06, 0.94], 0.06, C.ink)}
      {ln([-0.12, 0.44], [0.2, 0.44], 0.1, SEAT)}
      {ln([-0.22, 0.56], [-0.26, 1.06], 0.1, SEAT)}
      {person && (
        <Person k={k} o={o} face={1} hip={[0.0, 0.56]} sh={[-0.15, 1.08]} hands={[hand, [hand[0] - 0.02, hand[1] + 0.01]]} feet={[[0.4, 0.06], [0.34, 0.06]]} armBend={[-1, -1]} legBend={1} />
      )}
    </g>
  );
}

// Caminadora aérea: dos péndulos
export function AirWalker({ k, o, t }) {
  const P = p => [o[0] + p[0] * k, o[1] - p[1] * k];
  const ln = (a, b, w, c) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w * k} strokeLinecap="round" />;
  };
  const a = Math.sin(t / 16) * 0.14;
  const leg = s => [Math.sin(a * s) * 0.9, 1.35 - Math.cos(a * s) * 0.9];
  return (
    <g>
      <ellipse cx={o[0]} cy={o[1] + 6} rx={0.6 * k} ry={0.05 * k} fill={C.ink} opacity={0.12} />
      {ln([-0.45, 0], [0, 1.45], 0.08, TUBE)}
      {ln([0.45, 0], [0, 1.45], 0.08, TUBE)}
      {ln([0, 1.35], leg(1), 0.06, TUBE)}
      {ln([0, 1.35], leg(-1), 0.06, shade2(TUBE))}
      {ln([leg(1)[0] - 0.12, leg(1)[1]], [leg(1)[0] + 0.12, leg(1)[1]], 0.07, SEAT)}
      {ln([leg(-1)[0] - 0.12, leg(-1)[1]], [leg(-1)[0] + 0.12, leg(-1)[1]], 0.07, SEAT)}
      {ln([-0.2, 1.45], [0.2, 1.45], 0.07, TUBE)}
    </g>
  );
}
const shade2 = c => '#5A777C';

export function S5Plaza() {
  const f = useCurrentFrame();
  const m = 0.5 - 0.5 * Math.cos((f / 30) * Math.PI * 2);
  const wob = Math.sin(f / 5.5) * 1.6 * prog(f, 50, 20);
  return (
    <AbsoluteFill>
      <Plaza drift={30 + prog(f, 0, 225) * 50} props={false}>
        <AirWalker k={260} o={[1660, 900]} t={f} />
        <OldPress k={300} o={[1050, 905]} m={m} wobble={wob} />
        {/* líneas de movimiento: poca estabilidad */}
        <g opacity={prog(f, 50, 16)} stroke={C.orange} strokeWidth={6} strokeLinecap="round">
          <path d="M940,830 q-26,-16 0,-32" fill="none" />
          <path d="M914,840 q-34,-26 0,-52" fill="none" />
        </g>
        {/* recorrido corto */}
        <g opacity={prog(f, 92, 14)} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d="M1166,575 L1222,575 M1176,563 L1164,575 L1176,587 M1212,563 L1224,575 L1212,587" />
        </g>
      </Plaza>
      <Kicker label="El problema · La plaza actual" element="Problema" />
      <Title start={10} size={96} width={1400}>La plaza no sirve para ganar músculo</Title>
      <Pill x={1100} y={400} start={34}>Sin peso ajustable</Pill>
      <Pill x={520} y={760} start={58}>Poca estabilidad</Pill>
      <Pill x={1250} y={530} start={96}>Recorrido corto</Pill>
    </AbsoluteFill>
  );
}

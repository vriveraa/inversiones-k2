import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Person } from '../art/Person';
import { C } from '../theme';
import { Kicker, Pill, Title } from '../ui/Text';
import { lerp, prog } from '../util';

// Máquina de press de pecho de un gimnasio, vista de lado
function ChestPress({ k, o, m }) {
  const P = p => [o[0] + p[0] * k, o[1] - p[1] * k];
  const ln = (a, b, w, c) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w * k} strokeLinecap="round" />;
  };
  const r = (x0, y0, x1, y1, fill, rx = 0.01) => {
    const [ax, ay] = P([x0, y1]);
    return <rect x={ax} y={ay} width={(x1 - x0) * k} height={(y1 - y0) * k} fill={fill} rx={rx * k} />;
  };
  const hx = lerp(0.24, 0.56, m);
  const lift = 0.28 * m;
  return (
    <g>
      <ellipse cx={P([0, 0])[0]} cy={P([0, 0])[1] + 8} rx={1.3 * k} ry={0.08 * k} fill={C.ink} opacity={0.25} />
      {r(-1.05, 0.04, -0.6, 1.75, '#1D2A38', 0.02)}
      {Array.from({ length: 12 }, (_, i) => r(-0.98, 0.12 + i * 0.05 + (i >= 7 ? lift : 0), -0.67, 0.16 + i * 0.05 + (i >= 7 ? lift : 0), i >= 7 ? '#7C8790' : '#5B666F', 0.005))}
      {ln([-0.82, 0.1], [-0.82, 1.6], 0.012, C.steel)}
      <circle cx={P([-0.67, 0.12 + 7 * 0.05 + lift + 0.02])[0]} cy={P([0, 0.12 + 7 * 0.05 + lift + 0.02])[1]} r={0.025 * k} fill={C.orange} />
      {ln([-0.8, 1.7], [0.14, 1.7], 0.05, '#2E363E')}
      {ln([-0.5, 0.05], [-0.5, 1.7], 0.06, '#2E363E')}
      {ln([-0.5, 0.05], [0.7, 0.05], 0.06, '#2E363E')}
      {ln([0.14, 1.7], [0.14, 1.52], 0.05, '#2E363E')}
      {ln([0.14, 1.52], [hx, 0.98], 0.045, '#3A444E')}
      {ln([hx, 0.98], [hx + 0.02, 0.88], 0.05, C.orange)}
      {ln([0, 0.06], [0, 0.42], 0.06, '#2E363E')}
      {r(-0.22, 0.42, 0.22, 0.5, '#1D2731', 0.03)}
      {ln([-0.27, 0.55], [-0.33, 1.25], 0.1, '#1D2731')}
      {ln([-0.38, 0.4], [-0.5, 0.4], 0.04, '#2E363E')}
      {ln([0.42, 0.06], [0.42, 0.14], 0.04, '#2E363E')}
    </g>
  );
}

export function S2Usuario() {
  const f = useCurrentFrame();
  const m = 0.5 - 0.5 * Math.cos(((f - 6) / 66) * Math.PI * 2);
  const k = 330;
  const o = [1330, 905];
  const hand = [lerp(0.24, 0.56, m) + 0.02, 0.93];
  const drift = prog(f, 0, 195) * 40;
  return (
    <AbsoluteFill style={{ background: '#DCE9E6' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${-drift * 0.3},0)`}>
          <rect x={980} y={120} width={980} height={430} rx={10} fill="#CFE3EC" />
          <polygon points="980,470 1120,330 1210,390 1330,270 1450,380 1560,300 1700,410 1800,340 1960,430 1960,550 980,550" fill="#A9BFCD" />
          <polygon points="1290,310 1330,270 1370,308 1350,318 1330,300 1310,322" fill="#F6F8F3" />
          <polygon points="1530,322 1560,300 1592,326 1575,334 1560,320 1545,336" fill="#F6F8F3" />
          <rect x={980} y={480} width={980} height={70} fill="#B7CAD5" />
          {[1220, 1470, 1720].map(x => <rect key={x} x={x} y={120} width={14} height={430} fill="#2A3A4A" />)}
          <rect x={970} y={112} width={1000} height={16} fill="#2A3A4A" />
          <rect x={970} y={546} width={1000} height={16} fill="#2A3A4A" />
        </g>
        <g transform={`translate(${-drift * 0.6},0)`} fill="#13202E" opacity={0.14}>
          <rect x={150} y={420} width={22} height={480} />
          <rect x={430} y={420} width={22} height={480} />
          <rect x={130} y={540} width={340} height={14} />
          <rect x={560} y={760} width={360} height={18} rx={9} />
          {[600, 680, 760, 840].map(x => <circle key={x} cx={x} cy={740} r={26} />)}
          <rect x={560} y={700} width={10} height={200} />
          <rect x={910} y={700} width={10} height={200} />
        </g>
        <rect x={0} y={880} width={1920} height={200} fill="#2A3A4A" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 - drift} y={880} width={4} height={200} fill="#1F2D3B" />)}
        <g transform={`translate(${-drift},0)`}>
          <ChestPress k={k} o={o} m={m} />
          <Person k={k} o={o} face={1} hip={[0.02, 0.56]} sh={[-0.2, 1.08]} hands={[hand, [hand[0] - 0.02, hand[1] + 0.01]]} feet={[[0.47, 0.08], [0.41, 0.08]]} armBend={[-1, -1]} legBend={1} />
        </g>
      </svg>
      <Kicker label="El usuario" element="Usuario" />
      <Title start={12} size={96} width={860}>
        Esta es la rutina de miles de exusuarios de Energy
      </Title>
      <Pill x={120} y={610} start={40} dot={C.teal}>20 a 30 años</Pill>
      <Pill x={120} y={700} start={52} dot={C.teal}>Entrena hipertrofia</Pill>
    </AbsoluteFill>
  );
}

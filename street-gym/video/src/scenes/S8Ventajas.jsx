import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { IconAnyTime, IconFree, IconHome, IconNoDig, IconSolar } from '../art/Icons';
import { Tree } from '../art/Plaza';
import { C, FONT_DISPLAY } from '../theme';
import { Kicker, Pill, Title } from '../ui/Text';
import { out, prog } from '../util';

const ITEMS = [
  [['Gratis'], IconFree],
  [['Cerca de', 'tu casa'], IconHome],
  [['A cualquier', 'hora'], IconAnyTime],
  [['Luz solar'], IconSolar],
  [['Sin excavar'], IconNoDig],
];

export function S8Ventajas() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.maicilloLight }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect y={900} width={1920} height={180} fill={C.maicillo} />
        <g opacity={0.35}>
          <Tree x={-60} y={960} s={0.9} />
          <Tree x={1990} y={960} s={1.0} />
        </g>
        {ITEMS.map(([label, Icon], i) => {
          const st = 16 + i * 12;
          const p = prog(f, st, 22, out);
          const cx = 960 + (i - 2) * 344;
          return (
            <g key={label[0]} opacity={p} transform={`translate(${cx},${470 + (1 - p) * 40})`}>
              <circle r={128} fill="#fff" stroke={C.ink} strokeWidth={7} />
              <circle r={128} fill="none" stroke={C.orange} strokeWidth={7} strokeDasharray={`${p * 804} 804`} transform="rotate(-90)" />
              <g transform="translate(-80,-80) scale(1.6)">
                <Icon t={Math.max(0, f - st)} />
              </g>
              <text y={204} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={54} fill={C.ink}>
                {label.map((l, j) => <tspan key={l} x={0} dy={j ? 54 : 0}>{l}</tspan>)}
              </text>
            </g>
          );
        })}
      </svg>
      <Kicker label="La solución · Ventajas" element="Solución" />
      <Title start={8} size={96} width={1600}>Hecha para tu plaza</Title>
      <Pill x={960} y={800} start={92} anchor="center" dot={C.teal} size={38}>Bajo mantenimiento para el municipio</Pill>
    </AbsoluteFill>
  );
}

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Lockup } from '../art/Logo';
import { Plaza } from '../art/Plaza';
import { LatUser, PressUser, Station } from '../art/Station';
import { C } from '../theme';
import { Sub, Title } from '../ui/Text';
import { enter, lerp, prog } from '../util';

export function S9Cierre() {
  const f = useCurrentFrame();
  const m = 0.5 - 0.5 * Math.cos((f / 54) * Math.PI * 2);
  const m2 = 0.5 - 0.5 * Math.cos(((f + 24) / 50) * Math.PI * 2);
  const latY = lerp(1.6, 1.18, m2);
  const k = 178;
  const o = [1420, 905];
  return (
    <AbsoluteFill>
      <Plaza drift={prog(f, 0, 240) * 50} props={false} warm={1}>
        <Station k={k} o={o} press={m} lat={latY} />
        <PressUser k={k} o={o} m={m} />
        <LatUser k={k} o={o} latY={latY} />
      </Plaza>
      <div style={{ position: 'absolute', left: 72, top: 214, width: 860, height: 520, borderRadius: 32, background: 'rgba(246,248,243,0.9)', boxShadow: '0 16px 48px rgba(19,32,46,0.12)', ...enter(f, 14, { dist: 20 }) }} />
      <Title start={24} y={250} size={180} width={900}>¿La usarías?</Title>
      <div style={{ position: 'absolute', left: 120, top: 520, ...enter(f, 52) }}>
        <Lockup size={92} />
      </div>
      <Sub start={66} y={650} size={36} weight={600} width={780} color={C.ink2}>CD1201 · Ingeniería, Universidad de Chile</Sub>
    </AbsoluteFill>
  );
}

import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Plaza } from '../art/Plaza';
import { Station } from '../art/Station';
import { C } from '../theme';
import { Kicker, Sub, Title } from '../ui/Text';
import { inOut, out, prog } from '../util';
import { AirWalker, OldPress } from './S5Plaza';

const STEPS = [
  ['slab', 18], ['tower', 32], ['left', 48], ['bench', 60], ['right', 70], ['seat', 82], ['solar', 92],
];

export function S6Revelacion() {
  const f = useCurrentFrame();
  const gone = prog(f, 0, 22, inOut);
  const parts = Object.fromEntries(STEPS.map(([n, s]) => [n, prog(f, s, 20, out)]));
  const to3d = prog(f, 140, 22);
  return (
    <AbsoluteFill>
      <Plaza drift={80 + prog(f, 0, 225) * 30} props={false}>
        <g opacity={1 - gone} transform={`translate(0,${gone * 80})`}>
          <AirWalker k={260} o={[1660, 900]} t={f + 210} />
          <OldPress k={300} o={[1050, 905]} m={0.5} />
        </g>
        <Station k={190} o={[1068, 925]} parts={parts} led={prog(f, 104, 20)} />
      </Plaza>
      <AbsoluteFill style={{ opacity: to3d }}>
        <Sequence from={130} layout="none">
          <OffthreadVideo src={staticFile('clips/overview.mp4')} muted />
        </Sequence>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(246,248,243,0.92) 0%, rgba(246,248,243,0.75) 26%, rgba(246,248,243,0) 42%)' }} />
      </AbsoluteFill>
      <Kicker label="La solución" element="Solución" start={56} center />
      <Title start={64} y={150} x={0} width={1920} align="center" size={124}>Estación Street GYM</Title>
      <Sub start={80} y={286} x={0} width={1920} style={{ textAlign: 'center' }} size={46}>Gratis y en tu plaza</Sub>
    </AbsoluteFill>
  );
}

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plaza } from '../art/Plaza';
import { Title } from '../ui/Text';
import { prog } from '../util';

export function S1Gancho() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Plaza drift={prog(f, 0, 165) * 70} dawn={prog(f, 0, 120)} sunRise={0.25 + prog(f, 0, 150) * 0.75} />
      <Title start={28} y={190} size={150} width={1100}>
        Entrenar no debería ser un lujo
      </Title>
    </AbsoluteFill>
  );
}

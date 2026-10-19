import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { C } from './theme';
import { OVERLAP, SCENES } from './timeline.mjs';
import { Subtitles } from './ui/Subtitles';
import { prog } from './util';
import { S1Gancho } from './scenes/S1Gancho';
import { S2Usuario } from './scenes/S2Usuario';
import { S3Precio } from './scenes/S3Precio';
import { S4Tiempo } from './scenes/S4Tiempo';
import { S5Plaza } from './scenes/S5Plaza';
import { S6Revelacion } from './scenes/S6Revelacion';
import { S7Funciones } from './scenes/S7Funciones';
import { S8Ventajas } from './scenes/S8Ventajas';
import { S9Cierre } from './scenes/S9Cierre';

const COMPONENTS = {
  gancho: S1Gancho, usuario: S2Usuario, precio: S3Precio, tiempo: S4Tiempo, plaza: S5Plaza,
  revelacion: S6Revelacion, funciones: S7Funciones, ventajas: S8Ventajas, cierre: S9Cierre,
};

function FadeIn({ children, first }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: first ? 1 : prog(f, 0, OVERLAP) }}>{children}</AbsoluteFill>;
}

export function Video() {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {SCENES.map((s, i) => {
        const Comp = COMPONENTS[s.id];
        if (!Comp) return null;
        const last = i === SCENES.length - 1;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from + (last ? 0 : OVERLAP)} name={`${s.n}. ${s.titulo}`}>
            <FadeIn first={i === 0}>
              <Comp scene={s} />
            </FadeIn>
          </Sequence>
        );
      })}
      <Subtitles />
    </AbsoluteFill>
  );
}

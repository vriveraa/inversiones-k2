import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT_BODY, FONT_DISPLAY } from '../theme';
import { enter, prog } from '../util';

const XF = 10; // fundido entre tomas

function Shot({ shot, index, total }) {
  const f = useCurrentFrame();
  const fade = index === 0 ? 1 : prog(f, 0, XF);
  const zoom = 1 + prog(f, 0, shot.len + XF) * 0.035;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile(`clips/${shot.clip}.mp4`)} muted />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute', left: 96, top: 0, display: 'flex', flexDirection: 'column', gap: 6,
          background: '#FFFFFF', borderRadius: '0 0 24px 24px', padding: '64px 38px 28px 34px',
          borderTop: `12px solid ${C.orange}`, boxShadow: '0 12px 36px rgba(19,32,46,0.16)', maxWidth: 1000,
          ...enter(f, index === 0 ? 16 : 6, { dist: 22, exit: shot.len - 4, exitDur: 10 }),
        }}
      >
        <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: C.teal }}>
          {index + 1}/{total} · {shot.ejercicio}
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 76, lineHeight: 1, color: C.ink, textWrap: 'balance' }}>
          {shot.atributo}
        </span>
      </div>
    </AbsoluteFill>
  );
}

export function S7Funciones({ scene }) {
  const f = useCurrentFrame();
  const shots = scene.shots;
  return (
    <AbsoluteFill style={{ background: C.sky }}>
      {shots.map((s, i) => (
        <Sequence key={s.clip} from={s.from} durationInFrames={s.len + (i < shots.length - 1 ? XF : 14)} layout="none">
          <Shot shot={s} index={i} total={shots.length} />
        </Sequence>
      ))}
      <div
        style={{
          position: 'absolute', right: 96, top: 0, padding: '40px 26px 14px', borderRadius: '0 0 18px 18px',
          background: C.ink, color: '#fff', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 30,
          ...enter(f, 16, { dist: 14 }),
        }}
      >
        Prototipo 3D
      </div>
    </AbsoluteFill>
  );
}

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, FONT_BODY } from '../theme';
import { CUES, FPS } from '../timeline.mjs';
import { prog } from '../util';

// Subtítulos quemados: banda inferior, máximo dos líneas
export function Subtitles() {
  const f = useCurrentFrame();
  const cue = CUES.find(c => c.burn !== false && f >= c.a * FPS && f < c.b * FPS);
  if (!cue) return null;
  const a = cue.a * FPS;
  const b = cue.b * FPS;
  const o = Math.min(prog(f, a, 6), 1 - prog(f, b - 6, 6));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div
        style={{
          maxWidth: 1460, padding: '14px 30px 16px', borderRadius: 16,
          background: 'rgba(19,32,46,0.86)', color: '#fff', textAlign: 'center',
          fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.22, textWrap: 'balance',
        }}
      >
        {cue.t}
      </div>
    </div>
  );
}

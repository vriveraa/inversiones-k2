import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, FONT_BODY, FONT_DISPLAY } from '../theme';
import { enter } from '../util';

const ELEMENT_COLOR = { Problema: C.orange, Usuario: C.teal, Solución: C.leaf, Ventajas: C.leaf, Validación: C.orange };

// Etiqueta de sección arriba a la izquierda: "EL PROBLEMA · PRECIO"
export function Kicker({ label, element, start = 4, exit, x = 120, y = 104, dark = false, center = false }) {
  const f = useCurrentFrame();
  const e = enter(f, start, { exit, dist: 16 });
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap: 14, ...e }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: ELEMENT_COLOR[element] || C.orange }} />
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: '0.14em', textTransform: 'uppercase', color: dark ? '#fff' : C.ink }}>
        {label}
      </span>
    </div>
  );
}

export function Title({ children, start = 10, exit, x = 120, y = 152, size = 104, width = 1150, color = C.ink, align = 'left', style }) {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, textAlign: align,
        fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.96,
        letterSpacing: '0.002em', color, textWrap: 'balance',
        ...enter(f, start, { exit }), ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Sub({ children, start = 20, exit, x = 120, y, size = 44, width = 1000, color = C.ink2, weight = 600, style }) {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, fontFamily: FONT_BODY, fontWeight: weight, fontSize: size, lineHeight: 1.2, color, ...enter(f, start, { exit, dist: 20 }), ...style }}>
      {children}
    </div>
  );
}

// Etiqueta tipo píldora con punto naranjo (como en el prototipo)
export function Pill({ children, x, y, start, exit, size = 40, anchor = 'left', bg = '#fff', color = C.ink, dot = C.orange }) {
  const f = useCurrentFrame();
  const e = enter(f, start, { exit, dist: 18 });
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y,
        transform: `${anchor === 'center' ? 'translateX(-50%) ' : anchor === 'right' ? 'translateX(-100%) ' : ''}${e.transform}`,
        opacity: e.opacity, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap',
        background: bg, color, border: `3px solid ${C.ink}`, borderRadius: 999, padding: '10px 26px 10px 20px',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: size, lineHeight: 1.1,
        boxShadow: '0 8px 24px rgba(19,32,46,0.12)',
      }}
    >
      <span style={{ width: size * 0.38, height: size * 0.38, borderRadius: 99, background: dot, flex: 'none' }} />
      {children}
    </div>
  );
}

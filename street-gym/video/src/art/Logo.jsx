import React from 'react';
import { C, FONT_DISPLAY } from '../theme';

export function Mark({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="10" fill={C.ink} />
      <rect x="9" y="17" width="22" height="6" rx="2" fill="#FFFFFF" />
      <rect x="7" y="11" width="5" height="18" rx="2" fill={C.orange} />
      <rect x="28" y="11" width="5" height="18" rx="2" fill={C.orange} />
    </svg>
  );
}

export function Lockup({ size = 120, color = C.ink, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28, ...style }}>
      <Mark size={size} />
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: size * 0.95, lineHeight: 1, color, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
        Street GYM
      </span>
    </div>
  );
}

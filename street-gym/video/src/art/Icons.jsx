import React from 'react';
import { C } from '../theme';

// Íconos de línea en una caja de 100×100. t: fotograma local para la animación en bucle.
const S = { fill: 'none', stroke: C.ink, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconFree({ t = 0 }) {
  const r = Math.sin(t / 10) * 4;
  return (
    <g transform={`rotate(${r},50,50)`}>
      <path d="M18,48 L48,18 L82,18 L82,52 L52,82 Z" {...S} fill="#fff" />
      <circle cx={70} cy={30} r={5} fill={C.ink} />
      <text x={51} y={64} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={34} fill={C.ink}>$</text>
      <line x1={34} y1={70} x2={68} y2={36} stroke={C.orange} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
}

export function IconHome({ t = 0 }) {
  const b = Math.abs(Math.sin(t / 9)) * -7;
  return (
    <g>
      <path d="M18,52 L50,26 L82,52" {...S} />
      <path d="M26,46 L26,82 L74,82 L74,46" {...S} />
      <rect x={43} y={60} width={14} height={22} rx={2} fill={C.ink} />
      <g transform={`translate(0,${b})`}>
        <path d="M70,6 C80,6 86,13 86,21 C86,31 70,44 70,44 C70,44 54,31 54,21 C54,13 60,6 70,6 Z" fill={C.orange} />
        <circle cx={70} cy={21} r={5.5} fill="#fff" />
      </g>
    </g>
  );
}

export function IconAnyTime({ t = 0 }) {
  const a = (t * 6) % 360;
  return (
    <g>
      <circle cx={50} cy={52} r={34} {...S} />
      <path d="M50,18 A34,34 0 0 1 50,86 Z" fill={C.ink} opacity={0.12} />
      <line x1={50} y1={52} x2={50} y2={30} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a},50,52)`} />
      <line x1={50} y1={52} x2={64} y2={52} stroke={C.orange} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a / 12},50,52)`} />
      <circle cx={50} cy={52} r={4} fill={C.ink} />
      <path d="M80,10 A10,10 0 1 0 90,24 A8,8 0 1 1 80,10 Z" fill={C.ink} />
      <circle cx={14} cy={16} r={7} fill={C.orange} />
    </g>
  );
}

export function IconSolar({ t = 0 }) {
  const a = (t * 1.5) % 360;
  return (
    <g>
      <g transform={`rotate(${a},74,24)`}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={74} y1={8} x2={74} y2={2} stroke={C.orange} strokeWidth={4} strokeLinecap="round" transform={`rotate(${i * 45},74,24)`} />
        ))}
      </g>
      <circle cx={74} cy={24} r={11} fill={C.orange} />
      <path d="M12,60 L66,60 L58,82 L4,82 Z" {...S} fill="#fff" />
      <line x1={30} y1={60} x2={22} y2={82} stroke={C.ink} strokeWidth={4} />
      <line x1={48} y1={60} x2={40} y2={82} stroke={C.ink} strokeWidth={4} />
      <line x1={8} y1={71} x2={62} y2={71} stroke={C.ink} strokeWidth={4} />
      <line x1={35} y1={82} x2={35} y2={94} {...S} />
    </g>
  );
}

export function IconNoDig({ t = 0 }) {
  const d = Math.max(0, Math.sin(t / 7)) * 5;
  return (
    <g>
      <rect x={10} y={66} width={80} height={16} rx={3} fill={C.ink} opacity={0.15} />
      <rect x={10} y={66} width={80} height={16} rx={3} {...S} />
      {[28, 72].map(x => (
        <g key={x} transform={`translate(0,${d})`}>
          <line x1={x} y1={40} x2={x} y2={70} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <rect x={x - 9} y={36} width={18} height={9} rx={2} fill={C.orange} />
        </g>
      ))}
      <circle cx={50} cy={28} r={18} fill="#fff" stroke={C.orange} strokeWidth={5} />
      <path d="M50,16 L50,34 M44,34 L56,34 L54,40 L46,40 Z" stroke={C.ink} strokeWidth={3.5} fill={C.ink} strokeLinejoin="round" />
      <line x1={37} y1={41} x2={63} y2={15} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

export function IconClock({ t = 0, speed = 14 }) {
  return (
    <g>
      <circle cx={50} cy={50} r={44} fill="#fff" stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={50} y1={10} x2={50} y2={i % 3 ? 15 : 19} stroke={C.ink} strokeWidth={i % 3 ? 2.5 : 4} strokeLinecap="round" transform={`rotate(${i * 30},50,50)`} />
      ))}
      <line x1={50} y1={50} x2={50} y2={18} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${t * speed},50,50)`} />
      <line x1={50} y1={50} x2={50} y2={30} stroke={C.orange} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(t * speed) / 12},50,50)`} />
      <circle cx={50} cy={50} r={4.5} fill={C.ink} />
    </g>
  );
}

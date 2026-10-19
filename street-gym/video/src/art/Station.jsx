import React from 'react';
import { C, FONT_DISPLAY, shade } from '../theme';
import { lerp } from '../util';
import { Person } from './Person';

// Estación Street GYM en vista frontal plana. Medidas en metros, como el prototipo 3D.
// k: px por metro · o: origen (x=0 al centro de la torre, y=0 al piso) en px.
// parts: progreso de armado (0→1) de cada pieza.
const SX = -1.38;
const PIV = [SX, 0.95];
const PX = 1.3;

export const stationGeom = { SX, PIV, PX };

export function pressHands(m) {
  const d = [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)];
  const s = lerp(-0.05, 0.42, m);
  return [PIV[0] + d[0] * s, PIV[1] + d[1] * s];
}

export function Station({ k, o, parts = {}, press = null, lat = null, led = 0, shadow = true }) {
  const P = p => [o[0] + p[0] * k, o[1] - p[1] * k];
  const part = (name, children, drop = 0.5) => {
    const p = parts[name] ?? 1;
    if (p <= 0) return null;
    return (
      <g key={name} opacity={Math.min(1, p * 1.6)} transform={`translate(0,${-(1 - p) * drop * k})`}>
        {children}
      </g>
    );
  };
  const rect = (x0, y0, x1, y1, fill, extra = {}) => {
    const [ax, ay] = P([x0, y1]);
    return <rect x={ax} y={ay} width={(x1 - x0) * k} height={(y1 - y0) * k} fill={fill} {...extra} />;
  };
  const ln = (a, b, w, color, extra = {}) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w * k} strokeLinecap="round" {...extra} />;
  };
  const circ = (c, r, fill, extra = {}) => {
    const [x, y] = P(c);
    return <circle cx={x} cy={y} r={r * k} fill={fill} {...extra} />;
  };
  const poly = (pts, fill, extra = {}) => <polygon points={pts.map(P).map(p => p.join(',')).join(' ')} fill={fill} {...extra} />;

  const frame = '#2E363E';
  const mPress = press ?? 0;
  const latY = lat ?? 1.6;
  const d = [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)];
  const car = pressHands(mPress);
  const railA = [PIV[0] - d[0] * 0.8, PIV[1] - d[1] * 0.8];
  const railB = [PIV[0] + d[0] * 0.92, PIV[1] + d[1] * 0.92];
  const plateLift = (m, on) => (on ? 0.3 * m : 0);
  const liftL = plateLift(mPress, press !== null);
  const liftR = plateLift(lat !== null ? (1.6 - latY) / 0.45 : 0, lat !== null);

  const plates = (x0, lift) =>
    Array.from({ length: 16 }, (_, i) => {
      const y = 0.2 + i * 0.045 + (i >= 10 ? lift : 0);
      return rect(x0, y, x0 + 0.22, y + 0.038, i >= 10 ? '#6B7780' : '#59646D', { key: i, rx: 0.006 * k });
    });

  // banco del press: respaldo inclinado y asiento
  const back = { c: [-1.55, 0.74], a: -0.62, l: 0.9 };
  const bx = Math.cos(back.a) * back.l / 2;
  const by = Math.sin(back.a) * back.l / 2;

  return (
    <g>
      {shadow && (parts.slab ?? 1) > 0 && (
        <ellipse cx={P([-0.3, 0])[0]} cy={P([0, 0])[1] + 0.06 * k} rx={2.5 * k} ry={0.16 * k} fill={C.ink} opacity={0.14 * (parts.slab ?? 1)} />
      )}
      {part('slab', rect(-2.45, 0, 1.85, 0.06, C.slab, { rx: 0.02 * k }), 0.2)}

      {part('solar', (
        <g>
          {ln([0, 2.3], [0, 2.52], 0.05, frame)}
          {poly([[-0.5, 2.5], [0.5, 2.5], [0.46, 2.64], [-0.46, 2.64]], C.solar)}
          {[-0.25, 0, 0.25].map(x => ln([x, 2.51], [x * 0.92, 2.63], 0.008, '#5571A6', { key: x }))}
          {ln([-0.48, 2.57], [0.48, 2.57], 0.008, '#5571A6')}
          {ln([-0.5, 2.5], [0.5, 2.5], 0.02, frame)}
        </g>
      ), 1.2)}

      {part('right', (
        <g>
          {ln([0.3, 2.25], [PX + 0.08, 2.25], 0.07, frame)}
          {ln([0.3, 1.6], [0.9, 2.25], 0.045, frame)}
          {ln([PX, 2.19], [PX, latY], 0.012, '#20262C')}
          {circ([PX, 2.19], 0.075, C.orange)}
          {circ([PX, 2.19], 0.028, frame)}
          {ln([PX - 0.34, latY + 0.05], [PX + 0.34, latY + 0.05], 0.035, lat !== null ? C.orange : C.steel)}
          {ln([PX - 0.34, latY + 0.05], [PX - 0.42, latY - 0.03], 0.035, lat !== null ? C.orange : C.steel)}
          {ln([PX + 0.34, latY + 0.05], [PX + 0.42, latY - 0.03], 0.035, lat !== null ? C.orange : C.steel)}
          {ln([0.36, 0.38], [0.62, 0.42], 0.012, '#20262C')}
          {circ([0.36, 0.38], 0.06, C.orange)}
          {rect(0.32, 0.05, 1.7, 0.1, frame)}
          {ln([0.72, 0.1], [0.82, 0.36], 0.05, frame)}
        </g>
      ), 0.8)}

      {part('seat', (
        <g>
          {ln([1.3, 0.1], [1.3, 0.47], 0.06, frame)}
          {rect(1.1, 0.46, 1.5, 0.55, '#1D2731', { rx: 0.03 * k })}
          {ln([1.12, 0.62], [1.12, 0.78], 0.04, frame)}
          {circ([1.12, 0.79], 0.06, '#1D2731')}
        </g>
      ), 0.8)}

      {part('tower', (
        <g>
          {rect(-0.33, 0.05, 0.33, 2.38, C.ink, { rx: 0.02 * k })}
          {rect(-0.28, 0.18, 0.28, 1.56, '#2B4A5C')}
          {plates(-0.26, liftL)}
          {plates(0.04, liftR)}
          {ln([-0.15, 0.2], [-0.15, 1.5], 0.01, C.steel)}
          {ln([0.15, 0.2], [0.15, 1.5], 0.01, C.steel)}
          {circ([-0.04, 0.2 + 10 * 0.045 + liftL + 0.02], 0.03, C.orange)}
          {circ([0.26, 0.2 + 10 * 0.045 + liftR + 0.02], 0.03, C.orange)}
          {rect(-0.28, 0.18, 0.28, 1.56, '#BFE3EA', { opacity: 0.14 })}
          {ln([-0.2, 1.45], [0.05, 1.2], 0.03, '#FFFFFF', { opacity: 0.18 })}
          {rect(-0.28, 1.62, 0.28, 2.28, '#0E1823')}
          {rect(-0.28, 2.22, 0.28, 2.28, C.orange)}
          <text x={P([-0.22, 0])[0]} y={P([0, 1.98])[1]} fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={0.16 * k} fill="#fff">STREET</text>
          <text x={P([-0.22, 0])[0]} y={P([0, 1.82])[1]} fontFamily={FONT_DISPLAY} fontWeight={800} fontSize={0.16 * k} fill="#fff">GYM</text>
          <text x={P([-0.22, 0])[0]} y={P([0, 1.69])[1]} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={0.075 * k} fill="#FFC96F">USO GRATUITO</text>
          {led > 0 && (
            <g>
              <ellipse cx={P([0, 0])[0]} cy={P([0, 1.9])[1]} rx={0.9 * k} ry={1.1 * k} fill="#FFF1C2" opacity={0.18 * led} />
              {rect(-0.26, 2.3, 0.26, 2.33, '#FFF1C2')}
            </g>
          )}
        </g>
      ), 0.9)}

      {part('left', (
        <g>
          {ln([SX, 0.06], [SX, PIV[1]], 0.09, frame)}
          {ln([SX - 0.42, 0.06], [SX, PIV[1] - 0.25], 0.05, frame)}
          {ln([SX + 0.42, 0.06], [SX, PIV[1] - 0.25], 0.05, frame)}
          {rect(SX - 0.5, 0.05, SX + 0.5, 0.1, frame)}
          {ln(railA, railB, 0.06, C.steel)}
          {ln(railA, railB, 0.018, '#E5E9EC')}
          {circ(PIV, 0.15, C.orange)}
          {circ(PIV, 0.05, frame)}
          {(() => {
            const [cx, cy] = P(car);
            return (
              <g transform={`rotate(30,${cx},${cy})`}>
                <rect x={cx - 0.07 * k} y={cy - 0.1 * k} width={0.14 * k} height={0.2 * k} rx={0.02 * k} fill={frame} />
              </g>
            );
          })()}
          {circ([car[0] + 0.1, car[1] - 0.02], 0.045, press !== null ? C.orange : '#1D2731')}
          {ln([SX, 0.95], [-0.33, 0.25], 0.012, '#20262C')}
        </g>
      ), 0.8)}

      {part('bench', (
        <g>
          {ln([-1.6, 0.08], [-1.6, 0.6], 0.06, frame)}
          {ln([-0.98, 0.08], [-0.98, 0.42], 0.06, frame)}
          {rect(-2.2, 0.06, -0.95, 0.11, frame)}
          {ln([back.c[0] - bx, back.c[1] - by], [back.c[0] + bx, back.c[1] + by], 0.1, '#1D2731')}
          {ln([-1.16, 0.46], [-0.8, 0.46], 0.1, '#1D2731')}
        </g>
      ), 0.6)}
    </g>
  );
}

// Personas sobre la estación: press inclinado (polera turquesa) y jalón (polera naranja)
export function PressUser({ k, o, m, shirt = C.teal, skin = C.skin }) {
  const h = pressHands(m);
  const hand = [h[0] + 0.1, h[1] - 0.02];
  return (
    <Person
      k={k} o={o} face={1}
      hip={[-1.06, 0.6]} sh={[-1.5, 0.92]}
      hands={[hand, [hand[0] - 0.02, hand[1] + 0.01]]}
      feet={[[-0.62, 0.1], [-0.56, 0.1]]}
      armBend={[-1, -1]} legBend={1}
      shirt={shirt} skin={skin}
    />
  );
}

export function LatUser({ k, o, latY, shirt = C.orange, skin = C.skin2 }) {
  const m = (1.6 - latY) / 0.45;
  return (
    <Person
      k={k} o={o} face={-1}
      hip={[1.32, 0.6]} sh={[lerp(1.38, 1.44, m), lerp(1.12, 1.1, m)]}
      hands={[[PX - 0.3, latY + 0.04], [PX + 0.3, latY + 0.04]]}
      feet={[[0.95, 0.1], [0.9, 0.1]]}
      armBend={[1, -1]} legBend={-1}
      shirt={shirt} skin={skin} shoes={C.ink}
    />
  );
}

export { shade };

import React from 'react';
import { C, shade } from '../theme';

// Personaje plano, sin rostro, de perfil. Coordenadas en metros (y hacia arriba)
// que se proyectan con escala k (px/m) y origen o=[x,y] en px.
const L = { ua: 0.29, fa: 0.28, th: 0.43, sh: 0.43 };

export function ik2(a, b, l1, l2, bend) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let d = Math.hypot(dx, dy);
  const ux = dx / (d || 1);
  const uy = dy / (d || 1);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.02), l1 + l2 - 0.002);
  const a1 = (l1 * l1 + d * d - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a1 * a1));
  return {
    mid: [a[0] + ux * a1 - uy * h * bend, a[1] + uy * a1 + ux * h * bend],
    end: [a[0] + ux * d, a[1] + uy * d],
  };
}

export function Person({
  k, o, hip, sh, hands, feet,
  armBend = [1, 1], legBend = 1, face = 1,
  shirt = C.teal, shorts = C.ink, skin = C.skin, shoes = C.orange, hair = C.hair,
  bag,
}) {
  const P = p => [o[0] + p[0] * k, o[1] - p[1] * k];
  const line = (a, b, w, color, key) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w * k} strokeLinecap="round" />;
  };
  const up = [sh[0] - hip[0], sh[1] - hip[1]];
  const ul = Math.hypot(up[0], up[1]);
  const un = [up[0] / ul, up[1] / ul];
  const head = [sh[0] + un[0] * 0.24, sh[1] + un[1] * 0.24];
  const neckTop = [sh[0] + un[0] * 0.13, sh[1] + un[1] * 0.13];

  const limb = (i, back) => {
    const dim = back ? -0.18 : 0;
    const s = [sh[0] - face * 0.02 * (back ? 1 : -1), sh[1] - 0.03];
    const arm = ik2(s, hands[i], L.ua, L.fa, armBend[i]);
    const hp = [hip[0], hip[1]];
    const leg = ik2(hp, feet[i], L.th, L.sh, legBend);
    const footEnd = [leg.end[0] + face * 0.13, leg.end[1] - 0.01];
    return {
      leg: [
        line(hp, leg.mid, 0.135, shade(shorts, dim), 'th' + i),
        line(leg.mid, leg.end, 0.1, shade(skin, dim), 'sh' + i),
        line([leg.end[0] - face * 0.02, leg.end[1] - 0.02], footEnd, 0.075, shade(shoes, dim), 'ft' + i),
      ],
      arm: [
        line(s, arm.mid, 0.095, shade(shirt, dim), 'ua' + i),
        line(arm.mid, arm.end, 0.078, shade(skin, dim), 'fa' + i),
        <circle key={'hd' + i} cx={P(arm.end)[0]} cy={P(arm.end)[1]} r={0.05 * k} fill={shade(skin, dim)} />,
      ],
    };
  };
  const far = limb(1, true);
  const near = limb(0, false);
  const [hx, hy] = P(head);
  const hr = 0.108 * k;
  // pelo: casquete en la parte de atrás y arriba de la cabeza
  const ang = Math.atan2(-un[1], un[0]);
  const back = ang + (face > 0 ? -Math.PI * 0.62 : Math.PI * 0.62);
  const front = ang + (face > 0 ? Math.PI * 0.12 : -Math.PI * 0.12);
  const arc = (a1, r) => [hx + Math.cos(a1) * r, hy + Math.sin(a1) * r];
  const [ax, ay] = arc(back, hr * 1.04);
  const [bx, by] = arc(front, hr * 1.04);
  return (
    <g>
      {far.leg}
      {far.arm}
      {bag}
      {line(hip, [sh[0] - un[0] * 0.02, sh[1] - un[1] * 0.02], 0.27, shirt, 'torso')}
      {line([hip[0] - un[0] * 0.02, hip[1] - un[1] * 0.02], [hip[0] + un[0] * 0.08, hip[1] + un[1] * 0.08], 0.29, shorts, 'pelvis')}
      {line(sh, neckTop, 0.08, skin, 'neck')}
      {near.leg}
      <circle cx={hx} cy={hy} r={hr} fill={skin} />
      <path d={`M${ax},${ay} A${hr * 1.04},${hr * 1.04} 0 0 ${face > 0 ? 1 : 0} ${bx},${by} Q${hx},${hy} ${ax},${ay} Z`} fill={hair} />
      {near.arm}
    </g>
  );
}

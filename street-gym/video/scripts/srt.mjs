// Genera subtitulos.srt a partir de los subtítulos de timeline.mjs
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CUES } from '../src/timeline.mjs';

const ts = s => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(r).padStart(3, '0')}`;
};

// parte el texto en dos líneas equilibradas si pasa de 42 caracteres
function wrap(t) {
  if (t.length <= 42) return t;
  const words = t.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { score, txt: a + '\n' + b };
  }
  return best.txt;
}

const out = resolve(process.argv[2] || '../entrega/subtitulos.srt');
const body = CUES.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${wrap(c.t)}\n`).join('\n');
writeFileSync(out, body);
console.log('OK', out);

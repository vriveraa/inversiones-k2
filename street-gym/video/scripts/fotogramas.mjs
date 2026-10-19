// Renderiza el fotograma clave de cada escena (o los fotogramas indicados).
// Uso: node scripts/fotogramas.mjs [escala] [salida] [frame ...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FPS, SCENES } from '../src/timeline.mjs';

const scale = Number(process.argv[2] || 0.5);
const outDir = resolve(process.argv[3] || 'out/fotogramas');
const extra = process.argv.slice(4).map(Number);
mkdirSync(outDir, { recursive: true });

const browserExecutable = process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: resolve('src/index.js') });
const composition = await selectComposition({ serveUrl, id: 'StreetGym', browserExecutable });

const jobs = extra.length
  ? extra.map(fr => ({ name: `f${String(fr).padStart(4, '0')}`, frame: fr }))
  : SCENES.map(s => ({ name: `escena-${s.n}`, frame: s.from + Math.round(s.key * FPS) }));

for (const j of jobs) {
  const output = join(outDir, j.name + '.png');
  await renderStill({ composition, serveUrl, output, frame: j.frame, scale, browserExecutable, chromiumOptions: { gl: 'swiftshader' } });
  console.log(j.name, 'frame', j.frame, '->', output);
}

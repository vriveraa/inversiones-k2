// Extrae del video renderizado el fotograma clave de cada escena (1920×1080, PNG).
// Uso: node scripts/claves-desde-video.mjs <video.mp4> <carpeta>
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FPS, SCENES } from '../src/timeline.mjs';

const [video = '../entrega/video_street_gym.mp4', dir = 'out/claves'] = process.argv.slice(2);
mkdirSync(resolve(dir), { recursive: true });
for (const s of SCENES) {
  const frame = s.from + Math.round(s.key * FPS);
  const out = join(resolve(dir), `escena-${s.n}.png`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', resolve(video), '-vf', `select=eq(n\\,${frame})`, '-vsync', 'vfr', '-frames:v', '1', out]);
  console.log(`escena ${s.n}: fotograma ${frame}`);
}

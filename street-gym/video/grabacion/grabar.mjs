// Graba las tomas del prototipo 3D fotograma a fotograma (reloj falso a 30 fps)
// y las convierte en clips H.264 dentro de video/public/clips.
// Uso: node grabacion/grabar.mjs [modo ...]   (sin argumentos graba todos)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const html = join(here, 'estacion-grabacion.html');
const three = join(root, 'node_modules', 'three', 'build', 'three.min.js');
const outDir = join(root, 'public', 'clips');
const tmpDir = process.env.FRAMES_DIR || join(root, '.frames');
const FPS = 30;
const CYC = 3.6; // duración de una repetición en el prototipo

// segundos de asentamiento tras cambiar de pestaña y duración del clip.
// El asentamiento es una repetición completa para que el clip empiece al inicio de una.
const SHOTS = {
  overview: { settle: 2.0, secs: 7.0 },
  press: { settle: CYC, secs: 7.2 },
  remoAlto: { settle: CYC, secs: 7.2 },
  jalon: { settle: CYC, secs: 7.2 },
  remoH: { settle: CYC, secs: 7.2 },
  dual: { settle: CYC, secs: 7.2 },
};
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);

const CLEAN_CSS = `
  .top,.sec-head,.tabs,.howto,.drag-hint,.ctrls,.labels,.stage-title,.phase,.band.maicillo{display:none!important}
  html,body{margin:0!important;overflow:hidden!important;background:#D6EBF3!important}
  .band,.player-band{padding:0!important}
  .wrap{max-width:none!important;padding:0!important}
  .player{display:block!important}
  #stage{position:fixed!important;left:0;top:0;width:1920px!important;height:1080px!important;
    border-radius:0!important;border:0!important;aspect-ratio:auto!important;min-height:0!important}
`;

// Reloj falso: requestAnimationFrame y performance.now solo avanzan con window.__step().
const FAKE_CLOCK = `
  (() => {
    let now = 0; let queue = [];
    const t0 = Date.now();
    performance.now = () => now;
    Date.now = () => t0 + Math.round(now);
    window.requestAnimationFrame = cb => { queue.push(cb); return queue.length; };
    window.cancelAnimationFrame = () => {};
    window.__step = (n = 1) => {
      for (let i = 0; i < n; i++) {
        now += 1000 / ${FPS};
        const q = queue; queue = [];
        for (const cb of q) cb(now);
      }
    };
  })();
`;

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.route('**/three.min.js', r => r.fulfill({ path: three, contentType: 'application/javascript' }));
await page.addInitScript(FAKE_CLOCK);
page.on('pageerror', e => console.error('pageerror:', e.message));
await page.goto('file://' + html);
await page.addStyleTag({ content: CLEAN_CSS });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
if (await page.evaluate(() => document.getElementById('stage').classList.contains('nogl'))) {
  throw new Error('WebGL no disponible');
}
await page.evaluate(() => window.__step(2));

mkdirSync(outDir, { recursive: true });
for (const mode of wanted) {
  const shot = SHOTS[mode];
  if (!shot) throw new Error('Modo desconocido: ' + mode);
  const dir = join(tmpDir, mode);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  await page.evaluate(m => document.getElementById('tab-' + m).click(), mode);
  await page.evaluate(n => window.__step(n), Math.round(shot.settle * FPS));
  const frames = Math.round(shot.secs * FPS);
  if (process.env.PREVIEW) {
    // solo revisa el encuadre: un fotograma al inicio y otro a media repetición
    await page.screenshot({ path: join(tmpDir, mode + '-a.jpg'), quality: 80 });
    await page.evaluate(n => window.__step(n), Math.round(1.2 * FPS));
    await page.screenshot({ path: join(tmpDir, mode + '-b.jpg'), quality: 80 });
    console.log('preview', mode);
    continue;
  }
  for (let i = 0; i < frames; i++) {
    await page.evaluate(() => window.__step(1));
    await page.screenshot({ path: join(dir, String(i).padStart(4, '0') + '.png') });
  }
  const out = join(outDir, mode + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, '%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log(`${mode}: ${frames} fotogramas -> ${out}`);
}
await browser.close();

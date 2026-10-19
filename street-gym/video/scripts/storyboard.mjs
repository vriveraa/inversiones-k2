// Arma el storyboard en PDF: portada + una página por escena con su fotograma clave.
// Uso: node scripts/storyboard.mjs <carpeta-fotogramas> <salida.pdf> [--borrador]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { CUES, FPS, SCENES } from '../src/timeline.mjs';

const [framesDir = 'out/fotogramas', outPdf = '../entrega/storyboard.pdf'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const draft = process.argv.includes('--borrador');
const TEAM = process.env.SG_EQUIPO || '[completar: integrantes del equipo]';

const font = (pkg, file) => readFileSync(resolve('node_modules/@fontsource', pkg, 'files', file)).toString('base64');
const faces = [
  ['Barlow', 400, font('barlow', 'barlow-latin-400-normal.woff2')],
  ['Barlow', 600, font('barlow', 'barlow-latin-600-normal.woff2')],
  ['Barlow', 700, font('barlow', 'barlow-latin-700-normal.woff2')],
  ['Barlow Condensed', 700, font('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2')],
  ['Barlow Condensed', 800, font('barlow-condensed', 'barlow-condensed-latin-800-normal.woff2')],
].map(([f, w, b]) => `@font-face{font-family:'${f}';font-weight:${w};src:url(data:font/woff2;base64,${b}) format('woff2')}`).join('\n');

const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const MARK = `<svg viewBox="0 0 40 40" width="72" height="72"><rect x="2" y="2" width="36" height="36" rx="10" fill="#13202E"/><rect x="9" y="17" width="22" height="6" rx="2" fill="#fff"/><rect x="7" y="11" width="5" height="18" rx="2" fill="#E24E17"/><rect x="28" y="11" width="5" height="18" rx="2" fill="#E24E17"/></svg>`;
const ELEMENTS = ['Problema', 'Usuario', 'Solución'];
const COLOR = { Problema: '#E24E17', Usuario: '#0B7F8A', Solución: '#2F6B3A' };

const pages = SCENES.map(s => {
  const a = s.from / FPS;
  const b = s.to / FPS;
  const img = readFileSync(join(framesDir, `escena-${s.n}.png`)).toString('base64');
  const pitch = CUES.filter(c => c.a >= a - 0.01 && c.a < b).map(c => c.t).join(' ');
  const chips = ELEMENTS.map(e => {
    const on = s.element.includes(e);
    return `<span class="chip${on ? ' on' : ''}" style="--c:${COLOR[e]}">${e}</span>`;
  }).join('');
  return `
  <section class="page scene">
    <div class="frame"><img src="data:image/png;base64,${img}"></div>
    <aside>
      <div class="num">Escena ${s.n}<span>${mmss(a)}–${mmss(b)} · ${Math.round((b - a) * 10) / 10} s</span></div>
      <h2>${esc(s.titulo)}</h2>
      <div class="chips">${chips}</div>
      <h3>Acción</h3><p>${esc(s.accion)}</p>
      <h3>Texto en pantalla</h3><p class="screen">${esc(s.texto).split(' · ').map(t => `<span>${t}</span>`).join('')}</p>
      <h3>Pitch en vivo</h3><p class="pitch">${esc(pitch)}</p>
    </aside>
  </section>`;
}).join('');

const html = `<!doctype html><html lang="es"><meta charset="utf-8"><style>
${faces}
@page{size:338.67mm 190.5mm;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:'Barlow',sans-serif;color:#13202E;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:338.67mm;height:190.5mm;page-break-after:always;position:relative;overflow:hidden;background:#F6F8F3}
.cover{background:#13202E;color:#fff;padding:22mm 24mm;display:flex;flex-direction:column;justify-content:space-between}
.cover .brand{display:flex;align-items:center;gap:16px;font-family:'Barlow Condensed';font-weight:800;font-size:40px}
.cover h1{font-family:'Barlow Condensed';font-weight:800;font-size:92px;line-height:.92;margin:0 0 18px}
.cover h1 em{font-style:normal;color:#E24E17}
.cover p{font-size:24px;color:#C9D6E0;margin:0;max-width:62ch}
.cover .meta{display:flex;gap:48px;font-size:20px;color:#C9D6E0}
.cover .meta b{display:block;color:#fff;font-family:'Barlow Condensed';font-size:26px;font-weight:700}
.cover .legend{display:flex;gap:12px}
.draft{position:absolute;top:10mm;right:12mm;background:#E24E17;color:#fff;font-weight:700;padding:6px 14px;border-radius:99px;font-size:16px}
.scene{display:grid;grid-template-columns:215mm 1fr;gap:9mm;padding:10mm}
.frame{align-self:center;border-radius:4mm;overflow:hidden;box-shadow:0 2mm 6mm rgba(19,32,46,.18);aspect-ratio:16/9}
.frame img{width:100%;height:100%;display:block;object-fit:cover}
aside{display:flex;flex-direction:column;gap:7px;padding-top:2mm}
.num{font-family:'Barlow Condensed';font-weight:700;font-size:20px;letter-spacing:.12em;text-transform:uppercase;color:#E24E17;display:flex;flex-direction:column}
.num span{color:#4F5D69;letter-spacing:.04em;font-size:17px}
h2{font-family:'Barlow Condensed';font-weight:800;font-size:38px;line-height:1;margin:2px 0 4px}
h3{font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:#4F5D69;margin:8px 0 0}
p{margin:0;font-size:14.5px;line-height:1.38}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{font-weight:700;font-size:13px;padding:3px 10px;border-radius:99px;border:2px solid #D6DDD3;color:#9AA5AD}
.chip.on{background:var(--c);border-color:var(--c);color:#fff}
.screen{display:flex;flex-direction:column;gap:3px}
.screen span{font-family:'Barlow Condensed';font-weight:700;font-size:18px;line-height:1.1}
.pitch{font-style:italic;color:#2A3A4A}
</style><body>
<section class="page cover">
  ${draft ? '<div class="draft">Borrador para revisión</div>' : ''}
  <div class="brand">${MARK}Street GYM</div>
  <div>
    <h1>Storyboard y<br><em>Elevator Pitch</em></h1>
    <p>Primera Parte · Estación Street GYM: una estación de entrenamiento gratuita en la plaza para ganar masa muscular.</p>
  </div>
  <div class="meta">
    <div><b>Curso</b>CD1201 · Ingeniería, Universidad de Chile</div>
    <div><b>Equipo</b>Street GYM · ${esc(TEAM)}</div>
    <div><b>Video</b>${mmss(SCENES[SCENES.length - 1].to / FPS)} · 1920×1080 · 30 fps</div>
  </div>
  <div class="legend">${ELEMENTS.map(e => `<span class="chip on" style="--c:${COLOR[e]}">${e}</span>`).join('')}</div>
</section>
${pages}
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: resolve(outPdf), width: '338.67mm', height: '190.5mm', printBackground: true });
await browser.close();
writeFileSync(resolve('out/storyboard.html'), html);
console.log('OK', resolve(outPdf));

import { continueRender, delayRender } from 'remotion';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';

const handle = delayRender('Cargando tipografías Barlow');
Promise.all(
  [
    '400 40px Barlow', '500 40px Barlow', '600 40px Barlow', '700 40px Barlow',
    '600 40px "Barlow Condensed"', '700 40px "Barlow Condensed"', '800 40px "Barlow Condensed"',
  ].map(f => document.fonts.load(f, 'ÁÉÍÓÚÑáéíóúñ¿?'))
).then(() => continueRender(handle));

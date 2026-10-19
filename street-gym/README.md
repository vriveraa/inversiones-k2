# Street GYM · Primera Parte: Storyboard y Elevator Pitch

Material del equipo Street GYM (CD1201, Ingeniería U. de Chile).

## Entregables (`entrega/`)

- `storyboard.pdf`: portada y una página por escena, con su fotograma clave.
- `video_street_gym.mp4`: 1920×1080, 30 fps, H.264, sin voz en off y con subtítulos quemados.
- `subtitulos.srt`: los mismos subtítulos en un archivo aparte.
- `elevator_pitch.md`: guion sincronizado con el video y preguntas de validación.

## Cómo se produce (`video/`)

Requisitos: Node 22, ffmpeg y Chromium (Playwright).

```bash
cd video
npm install
node grabacion/generar-copia.mjs    # copia del prototipo 3D ajustada para grabar
node grabacion/grabar.mjs           # tomas 3D fotograma a fotograma -> public/clips/*.mp4
node scripts/fotogramas.mjs 1       # fotogramas clave de cada escena -> out/fotogramas
node scripts/storyboard.mjs out/fotogramas ../entrega/storyboard.pdf
node scripts/srt.mjs                # ../entrega/subtitulos.srt
npx remotion render StreetGym ../entrega/video_street_gym.mp4
```

- `src/timeline.mjs` es la fuente única de las escenas, los tiempos, los subtítulos y los textos del storyboard.
- `estacion-street-gym.html` es el prototipo original. No se modifica: la grabación usa una copia generada (`video/grabacion/estacion-grabacion.html`) que sube 0,2 m las cámaras de los ejercicios y agrega la toma de dos personas. three.js r128 se carga desde npm solo al grabar.
- Si Chromium está en otra ruta, usa la variable `REMOTION_CHROME`.

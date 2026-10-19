import { Config } from '@remotion/cli/config';

// Chromium preinstalado (Remotion no puede descargar el suyo en este entorno)
Config.setBrowserExecutable(process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setChromiumOpenGlRenderer('swiftshader');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setEntryPoint('./src/index.js');

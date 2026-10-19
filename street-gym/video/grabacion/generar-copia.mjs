// Genera estacion-grabacion.html: copia del prototipo con los ajustes para grabar.
// - Sube 0,2 m el punto de mira de las cámaras de ejercicios (sin panel de controles).
// - Agrega el modo "dual": press inclinado + jalón a la vez, con una segunda persona.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'estacion-street-gym.html');
let html = readFileSync(src, 'utf8');

function rep(from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) throw new Error(`Se esperaba 1 coincidencia y hay ${n}: ${from.slice(0, 70)}`);
  html = html.replace(from, to);
}

// 1. Cámaras: punto de mira +0,2 m y nueva cámara para el plano dual.
rep(
  "press:{t:V(-1.3,0.72,0),r:4.2,th:0.75,ph:1.25},remoAlto:{t:V(-1.55,0.72,0),r:4.0,th:-0.85,ph:1.2},jalon:{t:V(1.15,0.85,0),r:3.6,th:-0.32,ph:1.36},remoH:{t:V(1.05,0.55,0),r:3.4,th:-0.3,ph:1.36}};",
  "press:{t:V(-1.3,0.92,0),r:4.2,th:0.75,ph:1.25},remoAlto:{t:V(-1.55,0.92,0),r:4.0,th:-0.85,ph:1.2},jalon:{t:V(1.15,1.05,0),r:3.6,th:-0.32,ph:1.36},remoH:{t:V(1.05,0.75,0),r:3.4,th:-0.3,ph:1.36},dual:{t:V(-0.2,1.0,0),r:5.4,th:0.45,ph:1.22}};"
);

// La toma general deja espacio arriba para el título del video
rep("const CAM={overview:{t:V(-0.2,1.0,0),r:6.3,th:0.5,ph:1.15}", "const CAM={overview:{t:V(-0.2,1.75,0),r:7.4,th:0.5,ph:1.2}");

// 2. Pestaña oculta para el modo dual y textos mínimos.
rep(
  '<button class="tab" role="tab" id="tab-remoH"',
  '<button class="tab" role="tab" id="tab-dual" data-mode="dual" aria-selected="false" aria-controls="player" hidden>Dos personas</button>\n      <button class="tab" role="tab" id="tab-remoH"'
);
rep(
  "    remoH:{title:'Remo horizontal'",
  "    dual:{title:'Dos personas',h:'Dos personas a la vez',works:'',steps:[],tip:'',up:'',down:''},\n    remoH:{title:'Remo horizontal'"
);

// 3. Segunda persona (polera naranja) construida con la misma función.
rep(
  "skin:M(0xC99472,{roughness:.7,metalness:0}), shirt:M(0x0B7F8A,{roughness:.7,metalness:0}),",
  "skin:M(0xC99472,{roughness:.7,metalness:0}), skin2:M(0x9A6648,{roughness:.7,metalness:0}), shirt:M(0x0B7F8A,{roughness:.7,metalness:0}), shirt2:M(0xE24E17,{roughness:.7,metalness:0}),"
);
rep('const man=new THREE.Group();scene.add(man);', 'const man=new THREE.Group();scene.add(man);let curMan=man;');
rep('s.userData.r=r;man.add(s);return s;}', 's.userData.r=r;curMan.add(s);return s;}');
rep('s.scale.setScalar(r);s.castShadow=true;man.add(s);return s;}', 's.scale.setScalar(r);s.castShadow=true;curMan.add(s);return s;}');
{
  const start = html.indexOf('  const body={torso:');
  const endMark = 'body.ft.forEach(f=>{f.castShadow=true;man.add(f);});';
  const end = html.indexOf(endMark) + endMark.length;
  if (start < 0 || end < endMark.length) throw new Error('No se encontró la construcción del cuerpo');
  let block = html.slice(start, end);
  block = block
    .replace('  const body={', '  function makeBody(shirtM,skinM,grp){curMan=grp;const body={')
    .replaceAll('mat.shirt', 'shirtM')
    .replaceAll('mat.skin', 'skinM')
    .replace(endMark, 'body.ft.forEach(f=>{f.castShadow=true;grp.add(f);});return body;}\n  const bodyMain=makeBody(mat.shirt,mat.skin,man);\n  const man2=new THREE.Group();scene.add(man2);man2.visible=false;const body2=makeBody(mat.shirt2,mat.skin2,man2);');
  html = html.slice(0, start) + block + html.slice(end);
}
rep('function setMan(P){', 'function setMan(P,bd){const body=bd||bodyMain;');

// 4. Estado por modo.
rep("if(m==='press')alphaGoal=30;", "if(m==='press'||m==='dual')alphaGoal=30;");
rep("gripMat.color.set(m==='press'||m==='remoAlto'?", "gripMat.color.set(m==='press'||m==='remoAlto'||m==='dual'?");
rep("latMat.color.set(m==='jalon'?", "latMat.color.set(m==='jalon'||m==='dual'?");
rep("man.visible=m!=='overview';", "man.visible=m!=='overview';man2.visible=m==='dual';");
rep("const arm=mode==='press'||mode==='remoAlto';", "const arm=mode==='press'||mode==='remoAlto'||mode==='dual';");

// 5. Animación: la segunda persona va desfasada 1,6 s.
rep(
  "const tc=clock%CYC;const [m,ph]=mode==='overview'?[0,0]:repAt(tc);",
  "const tc=clock%CYC;const [m,ph]=mode==='overview'?[0,0]:repAt(tc);const m2=mode==='dual'?repAt((clock+1.6)%CYC)[0]:m;"
);
rep(
  "benchT=lerp(benchT,mode==='remoAlto'?1:(mode==='press'?0:benchT),kk);",
  "benchT=lerp(benchT,mode==='remoAlto'?1:(mode==='press'||mode==='dual'?0:benchT),kk);"
);
rep(
  "seatT=lerp(seatT,mode==='remoH'?1:(mode==='jalon'?0:seatT),kk);",
  "seatT=lerp(seatT,mode==='remoH'?1:(mode==='jalon'||mode==='dual'?0:seatT),kk);"
);
rep("const leftOn=mode==='press'||mode==='remoAlto';", "const leftOn=mode==='press'||mode==='remoAlto'||mode==='dual';");
rep(
  "const latY=mode==='jalon'?lerp(1.58,1.15,m):1.6;",
  "const latY=mode==='jalon'?lerp(1.58,1.15,m):(mode==='dual'?lerp(1.58,1.15,m2):1.6);"
);
rep(
  "(key==='right'&&(mode==='jalon'||mode==='remoH'));",
  "(key==='right'&&(mode==='jalon'||mode==='remoH'||mode==='dual'));"
);
rep("const lift=act?0.3*m:0;", "const lift=act?0.3*(key==='right'&&mode==='dual'?m2:m):0;");
rep("if(mode==='press'){", "if(mode==='press'||mode==='dual'){");
rep(
  "    renderer.render(scene,camera);",
  "    if(mode==='dual'){\n      setMan({hip:V(1.33,0.6,0),sh:V(lerp(1.42,1.47,m2),lerp(1.1,1.08,m2),0),hands:[V(PX,latY,-0.4),V(PX,latY,0.4)],feet:[V(0.92,0.09,-0.15),V(0.92,0.09,0.15)],armPole:sg=>V(0.3,-1,sg*1.2),legPole:V(-1,0.4,0),footDir:-1},body2);\n    }\n    renderer.render(scene,camera);"
);

const out = join(here, 'estacion-grabacion.html');
writeFileSync(out, html);
console.log('OK', out);

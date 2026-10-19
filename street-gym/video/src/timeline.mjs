// Fuente única de verdad: escenas, subtítulos y datos del storyboard.
// La usan el video (Remotion), el .srt y el storyboard en PDF.
export const FPS = 30;
export const OVERLAP = 14; // fotogramas de fundido entre escenas

const s = sec => Math.round(sec * FPS);

export const SCENES = [
  {
    id: 'gancho', n: 1, from: s(0), to: s(5), element: ['Problema'],
    titulo: 'Gancho',
    accion: 'Amanece en una plaza de Santiago con la cordillera nevada de fondo. El sol sube detrás de los cerros y la cámara avanza despacio entre los árboles.',
    texto: 'Entrenar no debería ser un lujo',
    key: 3.4,
  },
  {
    id: 'usuario', n: 2, from: s(5), to: s(11), element: ['Usuario'],
    titulo: 'El usuario',
    accion: 'Un joven de unos 24 años entrena en una máquina de press de pecho en un gimnasio. Las placas suben y bajan con cada repetición.',
    texto: 'Esta es la rutina de miles de ex usuarios de Energy · 20 a 30 años',
    key: 3.6,
  },
  {
    id: 'precio', n: 3, from: s(11), to: s(18), element: ['Problema', 'Usuario'],
    titulo: 'Problema: el precio',
    accion: 'Frente al gimnasio, baja la cortina y cuelga el letrero "Cerrado". Luego aparecen otros gimnasios con etiquetas de precio que crecen y flechas hacia arriba.',
    texto: 'Tu gimnasio cerró · Los que quedan cuestan bastante más',
    key: 5.3,
  },
  {
    id: 'tiempo', n: 4, from: s(18), to: s(24), element: ['Problema'],
    titulo: 'Problema: horario y distancia',
    accion: 'Un reloj gira rápido a la izquierda. A la derecha, en un mapa, se dibuja una ruta larga y con vueltas desde la casa hasta el gimnasio.',
    texto: 'Sin tiempo y con el gimnasio lejos · Horarios que no calzan · Una ruta larga',
    key: 4.2,
  },
  {
    id: 'plaza', n: 5, from: s(24), to: s(31), element: ['Problema'],
    titulo: 'Problema: la plaza actual',
    accion: 'En la plaza, el joven intenta entrenar en una máquina típica: se tambalea y el recorrido es corto. Aparecen tres etiquetas con sus fallas.',
    texto: 'La plaza no sirve para ganar músculo · Sin peso ajustable · Poca estabilidad · Recorrido corto',
    key: 5.0,
  },
  {
    id: 'revelacion', n: 6, from: s(31), to: s(38), element: ['Solución'],
    titulo: 'Solución: revelación',
    accion: 'Las máquinas viejas salen de cuadro y la Estación Street GYM se arma por piezas: losa, torre de placas, brazos guiados, banco, torre de poleas y panel solar. Termina en el prototipo 3D girando.',
    texto: 'Estación Street GYM · Gratis y en tu plaza',
    key: 4.3,
  },
  {
    id: 'funciones', n: 7, from: s(38), to: s(57), element: ['Solución'],
    titulo: 'Solución: funcionalidades',
    accion: 'Tomas del prototipo 3D: press inclinado, remo espalda alta, jalón y remo horizontal. Cierra con un plano general donde dos personas entrenan a la vez, cada una a su ritmo.',
    texto: 'Brazos guiados independientes · Ángulo ajustable atrás y hacia adentro · Placas de 5 a 80 kg con pasador · Poleas alta y baja · Dos personas a la vez',
    key: 16.0,
    shots: [
      { clip: 'press', from: 0, len: s(3.5), ejercicio: 'Press inclinado', atributo: 'Brazos guiados independientes' },
      { clip: 'remoAlto', from: s(3.5), len: s(3.5), ejercicio: 'Remo espalda alta', atributo: 'Ángulo ajustable atrás y hacia adentro' },
      { clip: 'jalon', from: s(7), len: s(3.3), ejercicio: 'Jalón', atributo: 'Placas de 5 a 80 kg con pasador' },
      { clip: 'remoH', from: s(10.3), len: s(3.3), ejercicio: 'Remo horizontal', atributo: 'Poleas alta y baja' },
      { clip: 'dual', from: s(13.6), len: s(5.4), ejercicio: 'Press inclinado + jalón', atributo: 'Dos personas a la vez' },
    ],
  },
  {
    id: 'ventajas', n: 8, from: s(57), to: s(64.5), element: ['Solución'],
    titulo: 'Ventajas',
    accion: 'Cinco íconos entran uno a uno y cada uno se anima en su sitio. Abajo aparece la ventaja para el municipio.',
    texto: 'Gratis · Cerca de tu casa · A cualquier hora · Luz solar · Sin excavar · Bajo mantenimiento para el municipio',
    key: 5.6,
  },
  {
    id: 'cierre', n: 9, from: s(64.5), to: s(72), element: ['Usuario', 'Solución'],
    titulo: 'Cierre y validación',
    accion: 'De vuelta en la plaza, el joven entrena en la Estación Street GYM mientras otra persona usa las poleas. Aparece la pregunta al público y el logo.',
    texto: '¿La usarías? · Street GYM',
    key: 5.5,
  },
];

export const DURATION = SCENES[SCENES.length - 1].to;

// Subtítulos: el elevator pitch que se dice en vivo.
// burn:false = no se quema en el video porque el mismo texto ya está en pantalla como título.
export const CUES = [
  { a: 0.6, b: 4.6, t: 'Entrenar no debería ser un lujo.', burn: false },
  { a: 5.3, b: 10.7, t: 'Piensen en un joven de 24 años que entrenaba hipertrofia en Energy, como miles de personas.' },
  { a: 11.3, b: 17.5, t: 'Cuando Energy quebró, se quedó sin gimnasio: los que quedan cuestan bastante más.' },
  { a: 18.3, b: 23.7, t: 'Además, sus horarios no le calzan y el gimnasio más cercano le queda lejos.' },
  { a: 24.3, b: 27.5, t: '¿Y la plaza? Sus máquinas no permiten ajustar el peso,' },
  { a: 27.5, b: 30.7, t: 'son inestables y tienen un recorrido corto: no sirven para ganar masa muscular.' },
  { a: 31.4, b: 37.5, t: 'Por eso creamos la Estación Street GYM: gratuita, en la plaza y financiada por la municipalidad.' },
  { a: 38.4, b: 44.8, t: 'Tiene brazos guiados independientes con ángulo ajustable,' },
  { a: 45.0, b: 51.4, t: 'placas de 5 a 80 kilos que se eligen con un pasador y poleas alta y baja:' },
  { a: 51.7, b: 56.6, t: 'cuatro ejercicios de tren superior, para dos personas a la vez.' },
  { a: 57.3, b: 60.9, t: 'Es gratis, queda cerca de la casa y se usa a cualquier hora con luz solar.' },
  { a: 60.9, b: 64.3, t: 'Se instala sin excavar y tiene bajo mantenimiento para el municipio.' },
  { a: 65.0, b: 71.6, t: 'Si estuviera en su plaza, ¿la usarían?', burn: false },
];

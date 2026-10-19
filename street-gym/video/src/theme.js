// Paleta y tipografía de la marca Street GYM
export const C = {
  ink: '#13202E',
  ink2: '#2A3A4A',
  orange: '#E24E17',
  teal: '#0B7F8A',
  leaf: '#2F6B3A',
  leaf2: '#4E8B57',
  grass: '#A7C98A',
  maicillo: '#E9DDC3',
  sky: '#D6EBF3',
  paper: '#F6F8F3',
  white: '#FFFFFF',
  // derivados para sombras y profundidad
  maicilloDark: '#D8C8A6',
  maicilloLight: '#F4EEDF',
  steel: '#B9C1C7',
  slab: '#4A535B',
  trunk: '#6B4E33',
  solar: '#1B2F55',
  skin: '#C99472',
  skin2: '#9A6648',
  hair: '#1E2228',
};

export const FONT_DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif";
export const FONT_BODY = "'Barlow', system-ui, sans-serif";

// Mezcla un color hex con negro (amt<0) o blanco (amt>0)
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)
  );
  return '#' + ch.map(c => c.toString(16).padStart(2, '0')).join('');
}

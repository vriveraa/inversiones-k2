import { useState } from 'react'

/**
 * Isotipo K2: montaña verde + edificio dorado.
 * Se usa como respaldo si el archivo del logo no está disponible.
 */
export function LogoMark({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true" fill="none">
      <rect x="43" y="12" width="7" height="32" fill="#C9A24B" />
      <rect x="52" y="5" width="8" height="39" fill="#7A5C2E" />
      <rect x="34" y="22" width="7" height="22" fill="#C9A24B" />
      <rect x="44.5" y="16" width="4" height="3" fill="#F7F5EF" opacity="0.7" />
      <rect x="44.5" y="23" width="4" height="3" fill="#F7F5EF" opacity="0.7" />
      <polygon points="8,84 48,32 88,84" fill="#0E4B3A" />
      <polygon points="48,32 70,60 61,84 48,64" fill="#1B6B4F" />
      <polygon points="48,32 40,43 56,43" fill="#C9A24B" />
    </svg>
  )
}

/**
 * Isotipo real de la marca (montaña + edificio), recortado del logo original.
 * Es el mismo que aparece en el preloader al iniciar la web.
 * Si el archivo no carga, cae al SVG de respaldo.
 */
export function LogoIcon({ className = 'h-12 w-auto' }) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) return <LogoMark className={className} />

  return (
    <img
      src="/logo-k2-mark.png"
      alt=""
      className={`${className} object-contain`}
      onError={() => setUseFallback(true)}
    />
  )
}

/**
 * Logo Inversiones K2.
 * Usa el lockup horizontal en versión clara (`/logo-k2-dark.png`,
 * marfil + dorado con fondo transparente, pensado para fondos oscuros).
 * Existe además `/logo-k2.png` (versión verde) para contextos claros.
 * Si el archivo no carga, se muestra un respaldo SVG + texto.
 */
export default function Logo({ compact = false, className = '' }) {
  const [useFallback, setUseFallback] = useState(false)

  if (!useFallback) {
    return (
      <img
        src="/logo-k2-dark.png"
        alt="Inversiones K2"
        className={`${compact ? 'h-14' : 'h-[4.5rem]'} w-auto object-contain transition-all duration-500 ${className}`}
        onError={() => setUseFallback(true)}
      />
    )
  }

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={compact ? 'h-9 w-9' : 'h-11 w-11'} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-medium uppercase text-ivory transition-all duration-500 ${
            compact ? 'text-[9px] tracking-[0.28em]' : 'text-[10px] tracking-[0.32em]'
          }`}
        >
          Inversiones
        </span>
        <span
          className={`font-display font-bold text-gold transition-all duration-500 ${
            compact ? 'text-xl' : 'text-2xl'
          }`}
        >
          K2
        </span>
      </span>
    </span>
  )
}

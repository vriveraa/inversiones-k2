import { useState } from 'react'
import { UserRound } from 'lucide-react'

/**
 * Foto del asesor con marco premium dorado.
 *
 * TODO: reemplazar con foto real — colocar el archivo en `public/asesor.png`.
 * (Persona con traje, postura de confianza, fondo neutro/corporativo.)
 * Mientras el archivo no exista se muestra una silueta elegante de respaldo.
 */
export default function AdvisorPhoto({ className = '' }) {
  const [useFallback, setUseFallback] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Marco dorado desplazado detrás de la foto */}
      <div
        className="absolute -inset-3 translate-x-4 translate-y-4 rounded-2xl border border-gold/40"
        aria-hidden="true"
      />
      {/* Glow dorado */}
      <div
        className="absolute -inset-8 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-forest/40 via-jade to-navy shadow-premium">
        {useFallback ? (
          /* Silueta de respaldo mientras no exista /asesor.png */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-texture">
            <UserRound
              className="h-40 w-40 text-gold/25"
              strokeWidth={1}
              aria-hidden="true"
            />
            <span className="rounded-full border border-gold/25 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-champagne/60">
              Foto del asesor
            </span>
          </div>
        ) : (
          <img
            src="/asesor.png"
            alt="Asesor de inversiones de Inversiones K2"
            className="h-full w-full object-cover object-top"
            onError={() => setUseFallback(true)}
          />
        )}
        {/* Degradado inferior para integrar la foto con el fondo */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy/70 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

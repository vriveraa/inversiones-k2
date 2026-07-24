import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { EASE } from '../Reveal.jsx'

const STEPS = ['Contacto', 'Inversión', 'Fecha y hora']

/** Barra de progreso superior del wizard (3 etapas). */
export default function WizardProgress({ current }) {
  return (
    <div aria-label={`Paso ${current + 1} de ${STEPS.length}`}>
      <ol className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.span
                  animate={{
                    scale: active ? 1.08 : 1,
                    backgroundColor: done || active ? '#c9a24b' : 'rgba(255,255,255,0.06)',
                  }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                    done || active
                      ? 'border-gold text-jade-deep shadow-gold-glow'
                      : 'border-white/15 text-ivory/40'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </motion.span>
                <span
                  className={`text-[10px] uppercase tracking-[0.18em] sm:text-[11px] ${
                    active ? 'text-champagne' : done ? 'text-gold/80' : 'text-ivory/35'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative mx-3 mb-6 h-px flex-1 overflow-hidden rounded-full bg-white/10 sm:mx-4">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-champagne"
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

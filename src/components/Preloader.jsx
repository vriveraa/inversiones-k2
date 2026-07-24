import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogoMark } from './Logo.jsx'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Preloader de marca (~1.4s): el isotipo real del logo (montaña + edificio,
 * recortado de `Logo inversiones K2 Horizontal`) aparece con glow dorado,
 * luego el wordmark y la línea dorada revelan la web.
 */
export default function Preloader() {
  const [useFallback, setUseFallback] = useState(false)

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
      aria-label="Cargando Inversiones K2"
      role="status"
    >
      <div className="relative">
        {/* Glow dorado que respira detrás del isotipo */}
        <motion.div
          className="absolute -inset-10 rounded-full bg-gold/15 blur-3xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.7], scale: [0.6, 1.05, 1] }}
          transition={{ duration: 1.3, delay: 0.15, ease: EASE }}
          aria-hidden="true"
        />
        {/* Isotipo real del logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
        >
          {useFallback ? (
            <LogoMark className="h-28 w-28" />
          ) : (
            <img
              src="/logo-k2-mark.png"
              alt=""
              className="h-28 w-auto"
              onError={() => setUseFallback(true)}
            />
          )}
        </motion.div>
      </div>

      <motion.div
        className="mt-6 flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ivory">
          Inversiones
        </span>
        <span className="font-display text-3xl font-bold text-gold">K2</span>
      </motion.div>

      <motion.div
        className="mt-6 h-px w-40 bg-gradient-to-r from-transparent via-gold to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
      />
    </motion.div>
  )
}

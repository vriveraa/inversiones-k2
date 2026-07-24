import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Wrapper de scroll-reveal: fade + slide-up al entrar en viewport.
 * Uso: <Reveal delay={0.1}>...</Reveal>
 */
export default function Reveal({ children, delay = 0, y = 28, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export { EASE }

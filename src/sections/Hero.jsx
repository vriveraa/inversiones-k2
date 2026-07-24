import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BadgeCheck, ChevronDown, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import MagneticButton from '../components/MagneticButton.jsx'
import AdvisorPhoto from '../components/AdvisorPhoto.jsx'
import { EASE } from '../components/Reveal.jsx'

const BADGES = [
  { icon: TrendingUp, text: 'El asesor invierte en remates' },
  { icon: Sparkles, text: 'Asesoría 100% personalizada' },
  { icon: BadgeCheck, text: 'Proceso legal y transparente' },
]

export default function Hero() {
  const { scrollY } = useScroll()
  // Parallax: el fondo decorativo se mueve más lento que el contenido
  const yGlow = useTransform(scrollY, [0, 700], [0, 160])
  const yTexture = useTransform(scrollY, [0, 700], [0, 90])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-jade-deep via-jade to-navy">
      {/* Capas decorativas con parallax */}
      <motion.div
        style={{ y: yTexture }}
        className="bg-texture pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <motion.div
        style={{ y: yGlow }}
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />
      <motion.div
        style={{ y: yGlow }}
        className="pointer-events-none absolute -left-52 top-1/2 h-96 w-96 rounded-full bg-forest/30 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-32 lg:px-8 lg:pt-36">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* Columna de texto */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="flex items-center gap-4"
            >
              <span className="h-px w-12 bg-gold" aria-hidden="true" />
              <span className="eyebrow">Asesoría en remates inmobiliarios</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
              className="mt-6 font-display text-4xl font-semibold leading-[1.12] text-ivory sm:text-5xl lg:text-6xl"
            >
              Invierte en propiedades en remate con{' '}
              <em className="font-medium italic text-champagne">seguridad</em> y{' '}
              <em className="font-medium italic text-champagne">rentabilidad</em>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.36, ease: EASE }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg"
            >
              Asesoría experta para comprar por debajo del valor de mercado, sin
              riesgos ocultos. Te acompañamos desde el análisis hasta la
              adjudicación.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <MagneticButton>
                <Link to="/agendar" className="btn-gold !px-8 !py-4 !text-base">
                  Agendar una llamada
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </MagneticButton>
              <a href="#como-funciona" className="btn-ghost !px-8 !py-4 !text-base">
                Conoce cómo funciona
              </a>
            </motion.div>
          </div>

          {/* Columna de imagen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            <AdvisorPhoto />

            {/* Tarjeta flotante: resultados */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              className="glass absolute bottom-10 -left-6 hidden items-center gap-3 px-4 py-3 shadow-premium lg:flex lg:-left-10"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                <TrendingUp className="h-5 w-5 text-gold" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-champagne">4 remates propios</p>
                <p className="text-xs text-ivory/60">rentables y adjudicados</p>
              </div>
            </motion.div>

            {/* Tarjeta flotante: respaldo */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
              className="glass absolute top-8 -right-2 hidden items-center gap-3 px-4 py-3 shadow-premium lg:flex lg:-right-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-champagne">Respaldo legal</p>
                <p className="text-xs text-ivory/60">en cada etapa</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Badges de confianza */}
        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
          className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3"
        >
          {BADGES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
              <Icon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
              <span className="text-sm text-ivory/75">{text}</span>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block"
        aria-hidden="true"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
          <ChevronDown className="h-5 w-5 text-gold/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}

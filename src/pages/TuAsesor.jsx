import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Briefcase, GraduationCap } from 'lucide-react'
import AdvisorPhoto from '../components/AdvisorPhoto.jsx'
import BlogCard from '../components/BlogCard.jsx'
import Reveal, { EASE } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import { POSTS } from '../data/posts.js'

/** TODO: reemplazar con el nombre y la biografía reales del asesor. */
const CHIPS = [
  'Remates judiciales',
  'Estudio de títulos',
  'Inversión residencial',
  'Renta comercial',
  'Due diligence',
]

const FACTS = [
  { icon: Briefcase, value: '4', label: 'remates propios rentables' },
  { icon: Award, value: '1 a 1', label: 'asesoría personalizada' },
  { icon: GraduationCap, value: '100%', label: 'operaciones con respaldo legal' },
]

export default function TuAsesor() {
  return (
    <div className="bg-navy">
      {/* ===== Perfil del asesor ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-jade-deep via-navy to-navy pb-24 pt-32 lg:pt-40">
        <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            {/* Foto */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="mx-auto w-full max-w-sm"
            >
              <AdvisorPhoto />
            </motion.div>

            {/* Bio */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              >
                <span className="eyebrow">Tu asesor</span>
                <h1 className="mt-4 font-display text-4xl font-semibold text-ivory sm:text-5xl">
                  Estanislao Rivera
                </h1>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">
                  Asesor de Inversiones Inmobiliarias · Especialista en Remates
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
                className="mt-7 space-y-4 text-base leading-relaxed text-ivory/65"
              >
                <p>
                  Invierto en remates judiciales con mi propio capital: he adjudicado
                  cuatro propiedades en remate, todas rentables. Esa es la diferencia
                  de fondo — no te propongo un camino que yo no recorra. Conozco el
                  proceso desde adentro, con sus tiempos, sus riesgos y sus
                  oportunidades reales.
                </p>
                <p>
                  Mi forma de trabajar es personal y selectiva: analizo cada
                  oportunidad con el mismo rigor con que invierto lo mío — estudio de
                  títulos, números claros y cero letra chica. Si una propiedad no
                  cumple, te lo digo. Prefiero una buena inversión bien hecha que
                  muchas mal cerradas.
                </p>
              </motion.div>

              {/* Chips de especialidades */}
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
                className="mt-7 flex flex-wrap gap-2.5"
                aria-label="Especialidades"
              >
                {CHIPS.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-gold/30 bg-gold/[0.07] px-4 py-1.5 text-xs font-medium text-champagne"
                  >
                    {chip}
                  </li>
                ))}
              </motion.ul>

              {/* Datos duros */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
                className="mt-9 grid grid-cols-3 gap-4 border-t border-white/10 pt-7"
              >
                {FACTS.map(({ icon: Icon, value, label }) => (
                  <div key={label}>
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    <p className="mt-2 font-display text-xl font-semibold text-champagne sm:text-2xl">
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs text-ivory/50">{label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
                className="mt-10"
              >
                <MagneticButton>
                  <Link to="/agendar" className="btn-gold !px-8 !py-4">
                    Agenda con tu asesor
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Blog ===== */}
      <section id="blog" className="relative scroll-mt-24 bg-navy py-24 lg:py-28">
        <div className="hairline absolute inset-x-0 top-0" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Blog · Tu Asesor</span>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ivory sm:text-4xl lg:text-5xl">
              Aprende a invertir en remates
            </h2>
            <div className="hairline mx-auto mt-6 max-w-[10rem]" aria-hidden="true" />
            <p className="mt-6 text-base leading-relaxed text-ivory/55">
              Guías, análisis y casos reales para que tomes decisiones con la
              misma información que maneja tu asesor.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.12}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

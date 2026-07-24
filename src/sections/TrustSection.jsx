import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, FileCheck2, Lock, ShieldCheck } from 'lucide-react'
import Reveal, { EASE } from '../components/Reveal.jsx'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Transparencia legal total',
    text: 'Cada operación se conduce dentro de un proceso judicial reglado. Conoces cada antecedente antes de decidir.',
  },
  {
    icon: FileCheck2,
    title: 'Due diligence de cada propiedad',
    text: 'Estudio de títulos, deudas, gravámenes y estado de ocupación. Si algo no cuadra, la propiedad se descarta.',
  },
  {
    icon: Lock,
    title: 'Sin letra chica',
    text: 'Honorarios claros y acordados antes de comenzar. Sin comisiones ocultas ni sorpresas en el camino.',
  },
]

const CHECKLIST = [
  'Estudio de títulos de 10 años',
  'Verificación de deudas y gravámenes',
  'Tasación comercial independiente',
  'Revisión del expediente judicial',
  'Modelo financiero de la operación',
]

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy via-jade-deep to-navy py-24 lg:py-32">
      <div
        className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-gold/10 blur-[130px]"
        aria-hidden="true"
      />
      <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <Reveal>
              <span className="eyebrow">Seguridad primero</span>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ivory sm:text-4xl lg:text-5xl">
                Tu seguridad es la base de{' '}
                <em className="italic text-champagne">cada inversión</em>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ivory/60">
                La rentabilidad atrae, pero la seguridad decide. Por eso, en
                Inversiones K2 ninguna propiedad llega a tu mesa sin haber pasado
                por un proceso de verificación completo.
              </p>
            </Reveal>

            <ul className="mt-10 space-y-7">
              {PILLARS.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={0.15 + i * 0.12}>
                  <li className="flex gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-champagne">
                        {title}
                      </h3>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ivory/55">
                        {text}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.5} className="mt-10">
              <Link to="/agendar" className="btn-ghost">
                Conversemos sobre tu inversión
              </Link>
            </Reveal>
          </div>

          {/* Panel glass con checklist */}
          <Reveal delay={0.2}>
            <div className="glass relative p-8 shadow-premium sm:p-10">
              <div
                className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                aria-hidden="true"
              />
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
                <ShieldCheck className="h-8 w-8 text-gold" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-ivory">
                Checklist K2 antes de cada subasta
              </h3>
              <p className="mt-2 text-sm text-ivory/55">
                El 100% de las operaciones pasa por estas cinco verificaciones.
              </p>

              <ul className="mt-8 space-y-4">
                {CHECKLIST.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3.5"
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55, delay: 0.35 + i * 0.12, ease: EASE }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                    <span className="text-sm text-ivory/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

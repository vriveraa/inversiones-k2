import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileSearch, KeyRound, PhoneCall, Target } from 'lucide-react'
import Reveal, { EASE } from '../components/Reveal.jsx'

const STEPS = [
  {
    icon: PhoneCall,
    title: 'Agenda tu llamada',
    text: 'Una conversación inicial sin costo para conocer tus objetivos de inversión.',
  },
  {
    icon: FileSearch,
    title: 'Analizamos tu perfil y presupuesto',
    text: 'Definimos juntos el vehículo, el rango de inversión y las comunas objetivo.',
  },
  {
    icon: Target,
    title: 'Seleccionamos oportunidades de remate',
    text: 'Filtramos las subastas con due diligence legal, comercial y financiera completa.',
  },
  {
    icon: KeyRound,
    title: 'Inviertes con acompañamiento total',
    text: 'Te representamos en la subasta y te acompañamos hasta la inscripción de la propiedad.',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">El proceso</span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-jade sm:text-4xl lg:text-5xl">
            Cómo funciona
          </h2>
          <div className="hairline mx-auto mt-6 max-w-[10rem]" aria-hidden="true" />
          <p className="mt-6 text-base leading-relaxed text-gray-500">
            Un método probado en cuatro pasos, diseñado para que inviertas con
            información completa y cero improvisación.
          </p>
        </Reveal>

        {/* Timeline: horizontal en desktop, vertical en mobile */}
        <div className="relative mt-20">
          {/* Línea conectora horizontal (desktop) que se dibuja al hacer scroll */}
          <motion.div
            className="absolute left-[12%] right-[12%] top-8 hidden h-px origin-left bg-gradient-to-r from-gold/30 via-gold to-gold/30 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            aria-hidden="true"
          />
          {/* Línea conectora vertical (mobile) */}
          <motion.div
            className="absolute bottom-10 left-8 top-8 w-px origin-top bg-gradient-to-b from-gold/30 via-gold to-gold/30 lg:hidden"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            aria-hidden="true"
          />

          <ol className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={0.15 + i * 0.15}>
                <li className="group relative flex gap-6 lg:flex-col lg:items-center lg:text-center">
                  {/* Número dorado */}
                  <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-jade font-display text-2xl font-semibold text-champagne shadow-premium transition-all duration-500 group-hover:scale-110 group-hover:shadow-gold-glow">
                    {i + 1}
                  </span>
                  <div className="pt-1 lg:pt-4">
                    <span className="mb-3 hidden justify-center lg:flex">
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-jade">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.4} className="mt-16 text-center">
          <Link to="/agendar" className="btn-gold">
            Agendar mi llamada
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

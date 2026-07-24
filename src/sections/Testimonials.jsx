import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import Reveal, { EASE } from '../components/Reveal.jsx'

/** TODO: reemplazar con testimonios y fotos reales de clientes. */
const TESTIMONIALS = [
  {
    name: 'María José Fuentes',
    role: 'Inversionista · Ñuñoa',
    text: 'Compré mi primer departamento de inversión un 34% bajo su valor comercial. El equipo de K2 me acompañó en cada etapa y nunca sentí que caminaba a ciegas.',
    initials: 'MF',
  },
  {
    name: 'Rodrigo Salazar',
    role: 'Empresario · Las Condes',
    text: 'Llevaba años mirando remates sin atreverme. La diferencia fue el estudio de títulos y la disciplina en el precio máximo. Ya vamos en la tercera propiedad juntos.',
    initials: 'RS',
  },
  {
    name: 'Carolina Ibáñez',
    role: 'Médica · Providencia',
    text: 'Lo que más valoro es la honestidad: de diez oportunidades que evaluamos, me recomendaron participar solo en dos. Esa selectividad es exactamente lo que uno necesita.',
    initials: 'CI',
  },
  {
    name: 'Andrés Montecinos',
    role: 'Ingeniero · Viña del Mar',
    text: 'El proceso post-adjudicación me daba miedo: escritura, inscripción, entrega. K2 lo gestionó completo y la propiedad quedó arrendada al mes siguiente.',
    initials: 'AM',
  },
]

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = (dir) => {
    setDirection(dir)
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  // Auto-avance cada 6s (pausado al hacer hover)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 6000)
    return () => clearInterval(t)
  }, [paused])

  const current = TESTIMONIALS[index]

  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade/30 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal className="text-center">
          <span className="eyebrow">Confianza comprobada</span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ivory sm:text-4xl lg:text-5xl">
            Lo que dicen nuestros clientes
          </h2>
          <div className="hairline mx-auto mt-6 max-w-[10rem]" aria-hidden="true" />
        </Reveal>

        <div
          className="relative mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="glass relative overflow-hidden px-6 py-12 shadow-premium sm:px-14">
            <Quote
              className="absolute left-6 top-6 h-10 w-10 text-gold/15"
              aria-hidden="true"
            />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.figure
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="text-center"
              >
                {/* Estrellas doradas */}
                <div
                  className="flex justify-center gap-1"
                  role="img"
                  aria-label="Calificación: 5 de 5 estrellas"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="mx-auto mt-6 max-w-2xl font-display text-lg italic leading-relaxed text-ivory/85 sm:text-xl">
                  “{current.text}”
                </blockquote>

                <figcaption className="mt-8 flex flex-col items-center gap-3">
                  {/* Avatar circular (iniciales como placeholder de foto) */}
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 bg-gradient-to-br from-forest to-jade-deep font-display text-lg font-semibold text-champagne">
                    {current.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-champagne">{current.name}</p>
                    <p className="mt-0.5 text-xs text-ivory/50">{current.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Controles */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-all hover:border-gold hover:bg-gold/10"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex gap-2" role="tablist" aria-label="Testimonios">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonio de ${t.name}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1)
                    setIndex(i)
                  }}
                  className={`h-2 rounded-full transition-all duration-400 ${
                    i === index ? 'w-8 bg-gold' : 'w-2 bg-ivory/20 hover:bg-ivory/40'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-all hover:border-gold hover:bg-gold/10"
              aria-label="Testimonio siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

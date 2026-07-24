import { Handshake, LineChart, Scale, TrendingDown } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'

const REASONS = [
  {
    icon: TrendingDown,
    title: 'Compra bajo el valor de mercado',
    text: 'Accede a propiedades con descuentos de hasta 30–40% respecto de su valor comercial, imposibles en el mercado tradicional.',
  },
  {
    icon: LineChart,
    title: 'Alta rentabilidad',
    text: 'El descuento de entrada se traduce en plusvalía inmediata y retornos superiores, tanto por arriendo como por reventa.',
  },
  {
    icon: Scale,
    title: 'Respaldo legal en cada etapa',
    text: 'Proceso conducido por tribunales, con estudio de títulos y revisión completa del expediente antes de cada postura.',
  },
  {
    icon: Handshake,
    title: 'Acompañamiento experto',
    text: 'Un asesor dedicado te guía desde el análisis inicial hasta la inscripción de la propiedad a tu nombre.',
  },
]

export default function WhyAuctions() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-jade/40 blur-[130px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">La oportunidad</span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ivory sm:text-4xl lg:text-5xl">
            ¿Por qué invertir en remates?
          </h2>
          <div className="hairline mx-auto mt-6 max-w-[10rem]" aria-hidden="true" />
          <p className="mt-6 text-base leading-relaxed text-ivory/60">
            Los remates judiciales son el mecanismo más eficiente para comprar
            propiedades bajo su valor real — cuando se hace con información y
            respaldo profesional.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.12}>
              <article className="glass group h-full p-7 transition-all duration-500 ease-luxe hover:-translate-y-2 hover:border-gold/50 hover:shadow-gold-glow">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 transition-all duration-500 group-hover:bg-gold/20">
                  <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold text-champagne">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/60">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import Reveal from '../components/Reveal.jsx'
import StatCounter from '../components/StatCounter.jsx'

const STATS = [
  { value: 35, suffix: '%', label: 'Bajo el valor comercial' },
  { value: 4, label: 'Remates propios rentables' },
  { value: 0, label: 'Comisiones ocultas' },
  { value: 100, suffix: '%', label: 'Con respaldo legal' },
]

export default function StatsBar() {
  return (
    <section className="relative bg-jade-deep" aria-label="Cifras de Inversiones K2">
      <div className="hairline" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.1} className="text-center">
            <p className="font-display text-4xl font-semibold text-champagne sm:text-5xl">
              <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="mx-auto mt-2 max-w-[12rem] text-xs uppercase tracking-[0.18em] text-ivory/55">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
      <div className="hairline" aria-hidden="true" />
    </section>
  )
}

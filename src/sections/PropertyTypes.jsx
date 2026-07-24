import { Building2, Home, LandPlot, Store } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'

/** Imágenes de stock (Pexels) por tipo de propiedad. */
const TYPES = [
  {
    icon: Building2,
    title: 'Departamento',
    text: 'Oportunidades desde $40M en comunas consolidadas',
    image: '/img/prop-departamento.jpg',
  },
  {
    icon: Home,
    title: 'Casa',
    text: 'Alta demanda de arriendo y plusvalía sostenida',
    image: '/img/prop-casa.jpg',
  },
  {
    icon: Store,
    title: 'Local Comercial',
    text: 'Rentas comerciales con contratos de largo plazo',
    image: '/img/prop-local.jpg',
  },
  {
    icon: LandPlot,
    title: 'Terreno',
    text: 'Suelo con potencial de desarrollo y valorización',
    image: '/img/prop-terreno.jpg',
  },
]

export default function PropertyTypes() {
  return (
    <section className="bg-ivory pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Portafolio</span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-jade sm:text-4xl lg:text-5xl">
            Tipos de propiedad
          </h2>
          <div className="hairline mx-auto mt-6 max-w-[10rem]" aria-hidden="true" />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map(({ icon: Icon, title, text, image }, i) => (
            <Reveal key={title} delay={i * 0.12}>
              <article className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl shadow-premium">
                {/* Imagen de la propiedad */}
                <img
                  src={image}
                  alt={`${title} — propiedad en remate`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-110"
                />

                {/* Overlay oscuro para legibilidad + tinte verde de marca al hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/5"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-jade/25 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 rounded-2xl border border-transparent transition-all duration-500 group-hover:border-gold/60 group-hover:shadow-gold-glow"
                  aria-hidden="true"
                />

                {/* Contenido */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-navy/50 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">
                    {title}
                  </h3>
                  <p className="mt-1 max-w-[16rem] translate-y-2 text-xs leading-relaxed text-ivory/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-ivory/80">
                    {text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

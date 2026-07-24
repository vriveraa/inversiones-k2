import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-jade via-jade-deep to-navy py-24 lg:py-28">
      {/* Glow dorado central */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[110px]"
        aria-hidden="true"
      />
      <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-8">
        <Reveal>
          <div className="hairline mx-auto max-w-[8rem]" aria-hidden="true" />
          <h2 className="mt-8 font-display text-3xl font-semibold leading-tight text-ivory sm:text-4xl lg:text-5xl">
            ¿Listo para tu próxima{' '}
            <em className="italic text-champagne">inversión</em>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/65">
            Agenda una llamada sin costo con tu asesor y descubre las
            oportunidades de remate que calzan con tu perfil.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-10">
          <MagneticButton>
            <Link to="/agendar" className="btn-gold !px-10 !py-4 !text-base">
              Agendar Asesoría
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}

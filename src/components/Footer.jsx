import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo.jsx'

const NAV = [
  { label: 'Inicio', to: '/' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Tu Asesor', to: '/tu-asesor' },
  { label: 'Blog', to: '/tu-asesor#blog' },
  { label: 'Agendar Asesoría', to: '/agendar' },
]

export default function Footer() {
  return (
    <footer id="contacto" className="relative bg-navy">
      <div className="hairline" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div>
            <Link to="/" aria-label="Inversiones K2 — Inicio">
              <Logo />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/50">
              Asesoría experta en inversión de propiedades en remate judicial.
              Compra bajo el valor de mercado, con seguridad y respaldo legal.
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie de página">
            <h3 className="eyebrow mb-5">Navegación</h3>
            <ul className="space-y-3">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-ivory/70 transition-colors hover:text-champagne"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 className="eyebrow mb-5">Contacto</h3>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  Av. Apoquindo 4700, of. 1102
                  <br />
                  Las Condes, Santiago
                </span>
              </li>
              <li>
                <a
                  href="mailto:contacto@inversionesk2.cl"
                  className="flex items-center gap-3 transition-colors hover:text-champagne"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  contacto@inversionesk2.cl
                </a>
              </li>
              <li>
                <a
                  href="tel:+56912345678"
                  className="flex items-center gap-3 transition-colors hover:text-champagne"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h3 className="eyebrow mb-5">Síguenos</h3>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Inversiones K2 en ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-gold-glow"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ivory/40">
              Lunes a viernes · 9:00 – 18:00 hrs
              <br />
              Atención con reserva previa.
            </p>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="mt-14 border-t border-white/5 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-ivory/40">
              © {new Date().getFullYear()} Inversiones K2 · Todos los derechos reservados
            </p>
            <p className="text-xs text-ivory/40">
              <span className="text-gold/70">Aviso legal:</span> toda inversión conlleva
              riesgos. La información de este sitio no constituye asesoría financiera.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

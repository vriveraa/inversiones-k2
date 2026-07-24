import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Logo from './Logo.jsx'
import { EASE } from './Reveal.jsx'

const LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Tu Asesor', to: '/tu-asesor' },
  { label: 'Blog', to: '/tu-asesor#blog' },
  { label: 'Contacto', to: '/#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra el drawer al navegar
  useEffect(() => {
    setOpen(false)
  }, [location])

  // Bloquea el scroll del body con el drawer abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe ${
        scrolled
          ? 'border-b border-gold/10 bg-navy/80 py-2 shadow-premium backdrop-blur-xl'
          : 'bg-transparent py-4'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8"
        aria-label="Navegación principal"
      >
        <Link to="/" aria-label="Inversiones K2 — Inicio" className="shrink-0">
          <Logo compact={scrolled} />
        </Link>

        {/* Navegación desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <NavItem link={link} />
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link to="/agendar" className="btn-gold !px-6 !py-2.5">
            Agendar Asesoría
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          type="button"
          className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <motion.span
            className="block h-[2px] w-6 rounded-full bg-gold"
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
          <motion.span
            className="block h-[2px] w-6 rounded-full bg-gold"
            animate={open ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.span
            className="block h-[2px] w-6 rounded-full bg-gold"
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </button>
      </nav>

      {/* Drawer mobile full-screen */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-navy/95 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 44px) 40px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE }}
                >
                  <Link
                    to={link.to}
                    className="block py-3 text-center font-display text-3xl text-ivory transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + LINKS.length * 0.07, duration: 0.5, ease: EASE }}
                className="mt-6"
              >
                <Link to="/agendar" className="btn-gold">
                  Agendar Asesoría
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
            <motion.div
              className="pb-10 text-center text-[10px] uppercase tracking-[0.3em] text-ivory/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Inversiones K2 · Remates con respaldo
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavItem({ link }) {
  const isHash = link.to.includes('#')

  if (isHash) {
    return (
      <Link
        to={link.to}
        className="group relative text-sm font-medium text-ivory/80 transition-colors hover:text-champagne"
      >
        {link.label}
        <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
      </Link>
    )
  }

  return (
    <NavLink
      to={link.to}
      end={link.to === '/'}
      className={({ isActive }) =>
        `group relative text-sm font-medium transition-colors hover:text-champagne ${
          isActive ? 'text-gold' : 'text-ivory/80'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {link.label}
          <span
            className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </>
      )}
    </NavLink>
  )
}

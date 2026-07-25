import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Preloader from './components/Preloader.jsx'
import Home from './pages/Home.jsx'
import Agendar from './pages/Agendar.jsx'
import TuAsesor from './pages/TuAsesor.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Confirmar from './pages/Confirmar.jsx'
import Calificacion from './pages/Calificacion.jsx'
import Admin from './pages/Admin.jsx'
import { EASE } from './components/Reveal.jsx'

/** Al navegar: sube al inicio, o desplaza suavemente hasta el ancla (#id). */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        // pequeño delay para dejar montar la página destino
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 350)
        return () => clearTimeout(t)
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

/** Transición suave entre páginas. */
function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Páginas privadas con su propio layout, sin navegación pública ni preloader:
  // el panel del asesor (/admin) y el Formulario 2 por link privado (/calificacion).
  const isAdmin = location.pathname.startsWith('/admin')
  const isStandalone = isAdmin || location.pathname.startsWith('/calificacion')

  // Preloader de marca (~1.4s) solo en la carga inicial del sitio público
  useEffect(() => {
    if (isStandalone) {
      setLoading(false)
      return
    }
    const t = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(t)
  }, [isStandalone])

  if (isStandalone) {
    return (
      <>
        <ScrollManager />
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/calificacion/:token" element={<Calificacion />} />
        </Routes>
      </>
    )
  }

  return (
    <>
      <AnimatePresence>{loading && <Preloader key="preloader" />}</AnimatePresence>

      <ScrollManager />
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/agendar" element={<Page><Agendar /></Page>} />
            <Route path="/tu-asesor" element={<Page><TuAsesor /></Page>} />
            <Route path="/tu-asesor/:slug" element={<Page><BlogPost /></Page>} />
            <Route path="/confirmar" element={<Page><Confirmar /></Page>} />
            <Route path="*" element={<Page><Home /></Page>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </>
  )
}

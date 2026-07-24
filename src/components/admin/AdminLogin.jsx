import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { LogoIcon } from '../Logo.jsx'
import { EASE } from '../Reveal.jsx'

/**
 * Login del asesor (email + contraseña vía Supabase Auth).
 * El usuario se crea manualmente en el panel de Supabase; no hay registro público.
 */
export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setSubmitting(false)
    }
    // Si tiene éxito, el listener onAuthStateChange del gate hace el resto.
  }

  return (
    <div className="bg-texture flex min-h-screen items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass w-full max-w-sm p-8 shadow-premium sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <LogoIcon className="h-16 w-auto" />
          <h1 className="mt-5 font-display text-2xl font-semibold text-ivory">
            Panel del asesor
          </h1>
          <p className="mt-2 text-sm text-ivory/55">
            Inversiones K2 · Acceso privado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
              Correo
            </span>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/30"
                aria-hidden="true"
              />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark !pl-11"
                placeholder="asesor@inversionesk2.cl"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
              Contraseña
            </span>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/30"
                aria-hidden="true"
              />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark !pl-11"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Ingresando…
              </>
            ) : (
              <>
                Ingresar
                <LogIn className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

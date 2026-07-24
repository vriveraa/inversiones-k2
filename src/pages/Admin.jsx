import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { LogoIcon } from '../components/Logo.jsx'
import AdminLogin from '../components/admin/AdminLogin.jsx'
import AdminPanel from '../components/admin/AdminPanel.jsx'

/**
 * Panel del asesor (/admin).
 *
 * Gate de autenticación: mientras se resuelve la sesión muestra un splash;
 * sin sesión muestra el login; con sesión, el panel de reuniones.
 * Layout propio (fondo navy), sin la navegación pública del sitio.
 */
export default function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-navy text-ivory">
      {!isSupabaseConfigured ? (
        <ConfigMissing />
      ) : loading ? (
        <Splash />
      ) : !session ? (
        <AdminLogin />
      ) : (
        <AdminPanel session={session} onLogout={() => supabase.auth.signOut()} />
      )}
    </div>
  )
}

/** Splash mientras se resuelve la sesión. */
function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gold" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

/** Mensaje cuando faltan las llaves de Supabase. */
function ConfigMissing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LogoIcon className="h-16 w-auto" />
      <h1 className="mt-6 font-display text-2xl font-semibold text-champagne">
        Panel no configurado
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/60">
        Faltan las llaves de Supabase. Copia <code className="text-gold">.env.example</code> a{' '}
        <code className="text-gold">.env</code>, completa{' '}
        <code className="text-gold">VITE_SUPABASE_URL</code> y{' '}
        <code className="text-gold">VITE_SUPABASE_ANON_KEY</code>, y reinicia el servidor.
      </p>
    </div>
  )
}

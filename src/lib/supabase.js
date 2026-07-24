import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase.
 *
 * Las llaves se leen desde variables de entorno (archivo `.env`):
 *   VITE_SUPABASE_URL       -> Project URL del proyecto Supabase
 *   VITE_SUPABASE_ANON_KEY  -> anon/public key (segura de exponer: los datos
 *                              quedan protegidos por Row Level Security)
 *
 * Ver `.env.example` y las instrucciones de configuración en el README.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true cuando las llaves están configuradas; permite degradar con elegancia. */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[K2] Supabase no está configurado. Copia .env.example a .env y completa ' +
      'VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

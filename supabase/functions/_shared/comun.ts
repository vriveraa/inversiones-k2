// Utilidades compartidas: CORS, cliente de base de datos y bloques horarios.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/** Respuesta JSON con CORS. */
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

/**
 * Cliente con service role: salta RLS. Solo se usa dentro de las Edge
 * Functions, nunca en el navegador.
 */
export const db = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

/** Bloques horarios que ofrece la web: 09:00–17:30 cada 30 min. */
export const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

export const DURACION_MIN = 30

/** Clave de un bloque: 'YYYY-MM-DD|HH:MM' */
export const clave = (fecha: string, hora: string) => `${fecha}|${hora}`

/** Date local (Chile) para un bloque dado. */
export function inicioDelBloque(fecha: string, hora: string) {
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh, mm] = hora.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

/** Recorre los días entre dos fechas ('YYYY-MM-DD'), inclusive. */
export function* dias(desde: string, hasta: string) {
  const [y1, m1, d1] = desde.split('-').map(Number)
  const [y2, m2, d2] = hasta.split('-').map(Number)
  const fin = new Date(y2, m2 - 1, d2)
  for (let d = new Date(y1, m1 - 1, d1); d <= fin; d.setDate(d.getDate() + 1)) {
    yield `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
}

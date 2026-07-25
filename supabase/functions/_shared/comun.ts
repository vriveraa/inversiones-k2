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
 * Llave privilegiada del proyecto. Supabase la expone con distintos nombres
 * según la antigüedad del proyecto: los nuevos usan `SUPABASE_SECRET_KEY`
 * (sistema sb_secret_...) y los antiguos `SUPABASE_SERVICE_ROLE_KEY`.
 * Se prueban ambos para que funcione en cualquier caso.
 */
function llavePrivilegiada() {
  const key =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_SECRET_KEY')

  if (!key) {
    throw new Error(
      'Falta la llave privilegiada. Define SUPABASE_SERVICE_ROLE_KEY o ' +
        'SUPABASE_SECRET_KEY en los secretos de Edge Functions.',
    )
  }
  return key
}

/**
 * Cliente con permisos elevados: salta RLS. Solo se usa dentro de las Edge
 * Functions, nunca en el navegador.
 */
export const db = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, llavePrivilegiada(), {
    auth: { persistSession: false },
  })

/** Bloques horarios que ofrece la web: 09:00–17:30 cada 30 min. */
export const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

export const DURACION_MIN = 30

/** Clave de un bloque: 'YYYY-MM-DD|HH:MM' */
export const clave = (fecha: string, hora: string) => `${fecha}|${hora}`

/**
 * Instante ABSOLUTO correcto de una hora de pared de Chile.
 *
 * Las Edge Functions corren en UTC, así que `new Date(y,m,d,h,mm)` daría la
 * hora en UTC, no en Chile. Aquí calculamos el desfase real de America/Santiago
 * para esa fecha (respetando el horario de verano) y devolvemos el Date correcto.
 */
export function inicioDelBloque(fecha: string, hora: string) {
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh, mm] = hora.split(':').map(Number)

  // 1) Instante que sería esa hora en UTC.
  const utc = Date.UTC(y, m - 1, d, hh, mm)
  // 2) Qué hora de pared marca ese instante en Santiago.
  const enSantiago = new Date(utc).toLocaleString('en-US', { timeZone: 'America/Santiago' })
  // 3) El desfase = diferencia entre ambas; se corrige para que la pared coincida.
  const desfase = utc - new Date(enSantiago).getTime()
  return new Date(utc + desfase)
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

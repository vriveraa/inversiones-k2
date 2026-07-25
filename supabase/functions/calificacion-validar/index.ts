// Edge Function: valida el token del Formulario 2 al cargar la página.
// NO renderiza nada; solo dice si el link es utilizable.
//
// POST { token } -> { ok, nombre } | { error, motivo }
//   motivo: 'invalido' (no existe) | 'usado' | 'vencido'
//
// Deploy: supabase functions deploy calificacion-validar --no-verify-jwt

import { CORS, json, db } from '../_shared/comun.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { token } = await req.json()
    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      return json({ error: 'Este enlace no es válido.', motivo: 'invalido' }, 400)
    }

    const sb = db()
    const { data: t, error } = await sb
      .from('calificacion_tokens')
      .select('lead_id, used, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (error) throw error
    if (!t) return json({ error: 'Este enlace no es válido.', motivo: 'invalido' }, 404)
    if (t.used) {
      return json({ error: 'Este enlace ya fue utilizado.', motivo: 'usado' }, 410)
    }
    if (t.expires_at && new Date(t.expires_at) < new Date()) {
      return json({ error: 'Este enlace expiró.', motivo: 'vencido' }, 410)
    }

    // Nombre para saludar (sin exponer más datos del lead).
    const { data: lead } = await sb
      .from('reservas')
      .select('nombre')
      .eq('id', t.lead_id)
      .maybeSingle()

    return json({ ok: true, nombre: lead?.nombre ?? null })
  } catch (err) {
    console.error('[K2] calificacion-validar:', err)
    return json({ error: 'No pudimos validar el enlace. Intenta de nuevo.', motivo: 'servidor' }, 500)
  }
})

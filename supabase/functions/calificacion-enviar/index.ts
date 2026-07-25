// Edge Function: recibe el Formulario 2, califica en el servidor, guarda todo,
// marca el token como usado y envía el correo según la clasificación.
//
// POST { token, respuestas } -> { ok, clasificacion, redirigirAgendar } | { error, motivo }
//
// Deploy: supabase functions deploy calificacion-enviar --no-verify-jwt

import { CORS, json, db } from '../_shared/comun.ts'
import { calificar } from '../_shared/calificacion.ts'
import {
  enviarCorreo,
  correoCalificacionActivo,
  correoCalificacionNurture,
  correoCalificacionCierre,
} from '../_shared/correo.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { token, respuestas } = await req.json()
    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      return json({ error: 'Enlace inválido.', motivo: 'invalido' }, 400)
    }

    const sb = db()

    // ---- 1) Revalidar el token (nunca confiar en la página) ----
    const { data: t, error: errTok } = await sb
      .from('calificacion_tokens')
      .select('lead_id, used, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (errTok) throw errTok
    if (!t) return json({ error: 'Este enlace no es válido.', motivo: 'invalido' }, 404)
    if (t.used) return json({ error: 'Este enlace ya fue utilizado.', motivo: 'usado' }, 410)
    if (t.expires_at && new Date(t.expires_at) < new Date()) {
      return json({ error: 'Este enlace expiró.', motivo: 'vencido' }, 410)
    }

    // ---- 2) Calificar en el servidor (valida + puntúa + clasifica) ----
    const res = calificar(respuestas ?? {})
    if (!res.ok) return json({ error: res.error, motivo: 'datos' }, 400)
    const c = res.datos

    // ---- 3) Guardar la respuesta enlazada al lead ----
    const { error: errIns } = await sb.from('calificaciones').insert({
      lead_id: t.lead_id,
      presupuesto_maximo: c.presupuesto_maximo,
      presupuesto_unidad: c.presupuesto_unidad,
      presupuesto_clp: c.presupuesto_clp,
      comunas: c.comunas,
      plazo: c.plazo,
      fondos: c.fondos,
      experiencia: c.experiencia,
      disposicion_mandato: c.disposicion_mandato,
      comentarios: c.comentarios,
      puntaje_total: c.puntaje_total,
      clasificacion: c.clasificacion,
      revisar_presupuesto: c.revisar_presupuesto,
    })
    if (errIns) throw errIns

    // ---- 4) Marcar el lead con la clasificación + lista mensual ----
    await sb
      .from('reservas')
      .update({
        clasificacion: c.clasificacion,
        lista_mensual: c.clasificacion === 'nurture',
      })
      .eq('id', t.lead_id)

    // ---- 5) Consumir el token (un solo uso) ----
    await sb.from('calificacion_tokens').update({ used: true }).eq('token', token)

    // ---- 6) Correo según la clasificación (best-effort) ----
    const { data: lead } = await sb
      .from('reservas')
      .select('nombre, email')
      .eq('id', t.lead_id)
      .maybeSingle()

    if (lead?.email) {
      const nombre = lead.nombre ?? ''
      const plantilla =
        c.clasificacion === 'activo'
          ? correoCalificacionActivo(nombre)
          : c.clasificacion === 'nurture'
            ? correoCalificacionNurture(nombre)
            : correoCalificacionCierre(nombre)
      const envio = await enviarCorreo(lead.email, plantilla.subject, plantilla.html)
      if (!envio.ok) console.error('[K2] Falló el correo de calificación:', envio.error)
    }

    return json({
      ok: true,
      clasificacion: c.clasificacion,
      redirigirAgendar: c.clasificacion === 'activo',
    })
  } catch (err) {
    console.error('[K2] calificacion-enviar:', err)
    return json({ error: 'No pudimos procesar tu formulario. Intenta de nuevo.', motivo: 'servidor' }, 500)
  }
})

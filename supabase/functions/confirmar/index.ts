// Edge Function: confirma una reserva con el token del correo del cliente.
//
// Al confirmar: marca la fila, crea el evento en el Outlook del asesor (con el
// cliente como invitado) y envía los dos correos finales.
//
// POST { token } -> { ok, reserva } | { error, motivo }
//   motivo: 'invalido' (token no existe) | 'vencido' | 'servidor'
//
// Deploy: supabase functions deploy confirmar --no-verify-jwt

import { CORS, json, db } from '../_shared/comun.ts'
import { crearEventoOutlook, graphConfigurado } from '../_shared/graph.ts'
import {
  enviarCorreo,
  correoConfirmadaCliente,
  correoNuevaAsesoriaAsesor,
  generarICS,
  ASESOR_EMAIL,
  type Reserva,
} from '../_shared/correo.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { token } = await req.json()
    if (!token) return json({ error: 'Falta el token', motivo: 'invalido' }, 400)

    const sb = db()
    const { data: reserva, error } = await sb
      .from('reservas')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (error) throw error

    // El token no existe: o es falso, o la reserva ya venció y se liberó.
    if (!reserva) {
      return json({ error: 'Este enlace no es válido o ya expiró.', motivo: 'invalido' }, 404)
    }

    // Ya estaba confirmada: se responde ok (el cliente pudo hacer doble clic).
    if (reserva.confirmada) {
      return json({ ok: true, yaEstaba: true, reserva: resumen(reserva) })
    }

    // Vencida pero aún no barrida por el job de limpieza
    if (reserva.expira_at && new Date(reserva.expira_at) < new Date()) {
      return json(
        { error: 'El plazo para confirmar venció y el horario fue liberado.', motivo: 'vencido' },
        410,
      )
    }

    // ---- Confirmar ----
    const { error: errUpd } = await sb
      .from('reservas')
      .update({ confirmada: true, expira_at: null })
      .eq('id', reserva.id)

    if (errUpd) throw errUpd

    const r = reserva as Reserva & { id: string }

    // ---- Evento en el calendario del asesor (best-effort) ----
    if (graphConfigurado) {
      try {
        const eventoId = await crearEventoOutlook(r)
        await sb.from('reservas').update({ evento_outlook_id: eventoId }).eq('id', reserva.id)
      } catch (err) {
        // No se revierte la confirmación: la reserva es válida igual. El asesor
        // la ve en el panel y recibe el correo.
        console.error('[K2] No se pudo crear el evento en Outlook:', err)
      }
    }

    // ---- Correos finales (best-effort, en paralelo) ----
    const paraCliente = correoConfirmadaCliente(r)
    const paraAsesor = correoNuevaAsesoriaAsesor(r)

    const envios = await Promise.allSettled([
      enviarCorreo(r.email, paraCliente.subject, paraCliente.html, [generarICS(r)]),
      ASESOR_EMAIL
        ? enviarCorreo(ASESOR_EMAIL, paraAsesor.subject, paraAsesor.html)
        : Promise.resolve({ ok: false, error: 'Falta ASESOR_EMAIL' }),
    ])
    envios.forEach((e, i) => {
      if (e.status === 'rejected' || (e.status === 'fulfilled' && !e.value.ok)) {
        console.error(`[K2] Falló el correo ${i === 0 ? 'al cliente' : 'al asesor'}:`, e)
      }
    })

    return json({ ok: true, reserva: resumen(r) })
  } catch (err) {
    console.error('[K2] confirmar:', err)
    return json({ error: 'No pudimos confirmar tu asesoría. Intenta de nuevo.', motivo: 'servidor' }, 500)
  }
})

/** Datos mínimos que se devuelven a la página de confirmación. */
function resumen(r: Record<string, unknown>) {
  return { nombre: r.nombre, fecha: r.fecha, hora: r.hora, email: r.email }
}

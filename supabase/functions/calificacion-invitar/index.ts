// Edge Function: el asesor marca a un lead como PROSPECTO desde /admin.
// Genera un token del Formulario 2, envía el correo con el link y deja el lead
// en estado 'prospecto'.
//
// SEGURIDAD: la función se despliega con --no-verify-jwt (para que el preflight
// CORS y la petición lleguen), pero valida DENTRO que el llamador traiga un token
// de USUARIO real (la sesión del asesor). Con el nuevo sistema de llaves, la key
// publishable no es un JWT de usuario: `auth.getUser` la rechaza. Así, un
// visitante anónimo no puede invocarla, aunque tenga la key pública.
//
// POST { lead_id } (Authorization: Bearer <access_token del asesor>)
//   -> { ok, link } | { error }
//
// Deploy: supabase functions deploy calificacion-invitar --no-verify-jwt

import { CORS, json, db } from '../_shared/comun.ts'
import { enviarCorreo, correoInvitacionCalificacion, SITIO_URL } from '../_shared/correo.ts'

/** Días de validez del link del Formulario 2. */
const DIAS_VALIDEZ = 30

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const sb = db()

    // Candado real: exige un token de USUARIO válido (asesor con sesión). La
    // llave publishable no es un JWT de usuario → getUser la rechaza.
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^bearer\s+/i, '').trim()
    const { data: userData, error: authErr } = await sb.auth.getUser(jwt)
    if (authErr || !userData?.user) {
      return json({ error: 'No autorizado.' }, 401)
    }

    const { lead_id } = await req.json()
    if (!lead_id || !/^[0-9a-f-]{36}$/i.test(lead_id)) {
      return json({ error: 'Lead inválido.' }, 400)
    }

    // El lead debe existir.
    const { data: lead, error: errLead } = await sb
      .from('reservas')
      .select('nombre, email')
      .eq('id', lead_id)
      .maybeSingle()
    if (errLead) throw errLead
    if (!lead) return json({ error: 'No encontramos ese lead.' }, 404)

    // Invalida cualquier link anterior sin usar de este lead: así solo queda
    // UN link activo a la vez y no hay enlaces viejos dando vueltas.
    await sb.from('calificacion_tokens').delete().eq('lead_id', lead_id).eq('used', false)

    // Token nuevo del Formulario 2.
    const expira = new Date(Date.now() + DIAS_VALIDEZ * 24 * 3600 * 1000).toISOString()
    const { data: tk, error: errTok } = await sb
      .from('calificacion_tokens')
      .insert({ lead_id, expires_at: expira })
      .select('token')
      .single()
    if (errTok) throw errTok

    const link = `${SITIO_URL}/calificacion/${tk.token}`

    // Correo con el link.
    const plantilla = correoInvitacionCalificacion(lead.nombre ?? '', link)
    const envio = await enviarCorreo(lead.email, plantilla.subject, plantilla.html)
    if (!envio.ok) {
      console.error('[K2] Falló el correo de invitación:', envio.error)
      return json({ error: 'No se pudo enviar el correo. Intenta de nuevo.' }, 502)
    }

    // Marcar el lead como prospecto.
    await sb.from('reservas').update({ estado: 'prospecto' }).eq('id', lead_id)

    return json({ ok: true, link })
  } catch (err) {
    console.error('[K2] calificacion-invitar:', err)
    return json({ error: 'No pudimos procesar la invitación.' }, 500)
  }
})

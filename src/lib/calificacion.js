import { supabase } from './supabase.js'

/**
 * Formulario 2 de calificación.
 * El navegador nunca toca las tablas: validar y enviar pasan por Edge Functions
 * (igual que reservar/confirmar). Generar el token sí usa el cliente autenticado
 * porque solo lo hace el asesor desde /admin.
 */

const URL_BASE = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function invocar(nombre, body) {
  if (!URL_BASE || !ANON_KEY) {
    return { data: null, error: new Error('Supabase no configurado') }
  }
  try {
    const res = await fetch(`${URL_BASE}/functions/v1/${nombre}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return { data, error: new Error(data?.error ?? `HTTP ${res.status}`), motivo: data?.motivo }
    }
    return { data, error: null }
  } catch (err) {
    console.error(`[K2] Error llamando a ${nombre}:`, err)
    return { data: null, error: err }
  }
}

/** Valida el token al cargar la página. Devuelve { ok, nombre, motivo, mensaje }. */
export async function validarTokenCalificacion(token) {
  const { data, error, motivo } = await invocar('calificacion-validar', { token })
  if (error) {
    return { ok: false, motivo: motivo ?? data?.motivo ?? 'servidor', mensaje: error.message }
  }
  return { ok: true, nombre: data?.nombre ?? null }
}

/** Envía las respuestas. Devuelve { ok, clasificacion, redirigirAgendar, mensaje }. */
export async function enviarCalificacion(token, respuestas) {
  const { data, error, motivo } = await invocar('calificacion-enviar', { token, respuestas })
  if (error) {
    return { ok: false, motivo: motivo ?? 'servidor', mensaje: error.message }
  }
  return {
    ok: true,
    clasificacion: data?.clasificacion ?? null,
    redirigirAgendar: Boolean(data?.redirigirAgendar),
  }
}

/**
 * Genera un token para un lead y devuelve el link privado del Formulario 2.
 * Solo para el panel del asesor (requiere sesión iniciada).
 * @param {string} leadId  id de la reserva (lead)
 * @param {number} diasValidez  días hasta que expire (por defecto 30)
 */
export async function generarTokenCalificacion(leadId, diasValidez = 30) {
  if (!supabase) return { error: new Error('Supabase no configurado') }
  const expira = new Date(Date.now() + diasValidez * 24 * 3600 * 1000).toISOString()
  const { data, error } = await supabase
    .from('calificacion_tokens')
    .insert({ lead_id: leadId, expires_at: expira })
    .select('token')
    .single()
  if (error) return { error }
  const link = `${window.location.origin}/calificacion/${data.token}`
  return { error: null, token: data.token, link }
}

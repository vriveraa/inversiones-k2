// Cliente de Google Calendar para la agenda del asesor.
//
// Autenticación: OAuth con refresh token. El asesor autoriza UNA vez con su
// cuenta de Google (ver BACKEND.md) y guardamos el refresh token como secreto.
// Cada llamada lo canjea por un access token de corta duración.
//
// Secretos requeridos:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
//   GOOGLE_CALENDAR_ID (opcional; por defecto 'primary')
//
// Zona horaria: siempre America/Santiago; Google resuelve el horario de verano.

import { clp } from './formato.ts'

export const TZ = 'America/Santiago'

const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')

/** Calendario donde se agenda; 'primary' es el principal del asesor. */
const CALENDAR_ID = Deno.env.get('GOOGLE_CALENDAR_ID') ?? 'primary'

/** true cuando el calendario está configurado; permite degradar sin romper. */
export const calendarioConfigurado = Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN)

/** Canjea el refresh token por un access token (válido ~1 hora). */
async function getAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    refresh_token: REFRESH_TOKEN!,
    grant_type: 'refresh_token',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`No se pudo renovar el token de Google: ${await res.text()}`)
  }
  return (await res.json()).access_token as string
}

/**
 * Bloques ocupados en el calendario del asesor entre dos fechas ('YYYY-MM-DD').
 * Usa la API freeBusy: refleja TODO lo que el asesor tenga en su agenda —las
 * asesorías y cualquier otra reunión personal— para no ofrecer horarios en
 * conflicto. Devuelve intervalos { inicio, fin } como Date absolutos.
 */
export async function ocupadosEnCalendario(desde: string, hasta: string) {
  const token = await getAccessToken()

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Ventana amplia (±12 h) para cubrir cualquier desfase horario; el choque
      // exacto por bloque lo filtra quien llama.
      timeMin: `${desde}T00:00:00-12:00`,
      timeMax: `${hasta}T23:59:59+12:00`,
      timeZone: TZ,
      items: [{ id: CALENDAR_ID }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Error al leer el calendario: ${await res.text()}`)
  }

  const json = await res.json()
  const busy = (json.calendars?.[CALENDAR_ID]?.busy ?? []) as Array<{
    start: string
    end: string
  }>

  return busy.map((b) => ({ inicio: new Date(b.start), fin: new Date(b.end) }))
}

/**
 * Crea la asesoría en el calendario del asesor, con el cliente como invitado
 * (Google le envía la invitación por correo). Devuelve el id del evento.
 */
export async function crearEventoCalendario(reserva: {
  nombre: string
  apellido: string
  email: string
  telefono: string
  rut: string
  tipos: string[]
  comunas: string[]
  presupuesto_min: number
  presupuesto_max: number
  fecha: string
  hora: string
}): Promise<string> {
  const token = await getAccessToken()

  const [h, m] = reserva.hora.split(':').map(Number)
  const finMin = m + 30
  const finH = h + Math.floor(finMin / 60)
  const p = (n: number) => String(n).padStart(2, '0')
  const inicio = `${reserva.fecha}T${p(h)}:${p(m)}:00`
  const fin = `${reserva.fecha}T${p(finH)}:${p(finMin % 60)}:00`

  const evento = {
    summary: `Asesoría K2 — ${reserva.nombre} ${reserva.apellido}`,
    description:
      `${reserva.nombre} ${reserva.apellido} · RUT ${reserva.rut}\n` +
      `${reserva.email} · ${reserva.telefono}\n\n` +
      `Interés de inversión\n` +
      `• Propiedad: ${reserva.tipos.join(', ')}\n` +
      `• Comunas: ${reserva.comunas.join(', ')}\n` +
      `• Presupuesto: ${clp(reserva.presupuesto_min)} – ${clp(reserva.presupuesto_max)}`,
    // dateTime en hora de pared + timeZone: Google resuelve el horario de verano.
    start: { dateTime: inicio, timeZone: TZ },
    end: { dateTime: fin, timeZone: TZ },
    attendees: [{ email: reserva.email, displayName: `${reserva.nombre} ${reserva.apellido}` }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?sendUpdates=all`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(evento),
    },
  )

  if (!res.ok) {
    throw new Error(`Error al crear el evento: ${await res.text()}`)
  }

  return (await res.json()).id as string
}

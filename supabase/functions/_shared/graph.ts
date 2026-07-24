// Cliente de Microsoft Graph para el calendario del asesor (Outlook).
//
// Autenticación: OAuth delegado con refresh token. El asesor autoriza UNA vez
// (ver BACKEND.md) y guardamos el refresh token como secreto. Cada llamada lo
// canjea por un access token de corta duración.
//
// Secretos requeridos:
//   MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN
//
// Zona horaria: SIEMPRE se le pasa 'America/Santiago' a Graph, tanto al leer
// como al escribir. Así el cambio de hora de verano en Chile (UTC-4 / UTC-3)
// lo resuelve Microsoft y no nosotros — es el error clásico de estas integraciones.

import { clp } from './formato.ts'

export const TZ = 'America/Santiago'

const CLIENT_ID = Deno.env.get('MS_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('MS_CLIENT_SECRET')
const REFRESH_TOKEN = Deno.env.get('MS_REFRESH_TOKEN')

/** true cuando el calendario está configurado; permite degradar sin romper. */
export const graphConfigurado = Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN)

/** Canjea el refresh token por un access token (válido ~1 hora). */
async function getAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    refresh_token: REFRESH_TOKEN!,
    grant_type: 'refresh_token',
    scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access',
  })

  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`No se pudo renovar el token de Microsoft: ${await res.text()}`)
  }
  const json = await res.json()
  return json.access_token as string
}

/**
 * Bloques ocupados en el calendario del asesor entre dos fechas ('YYYY-MM-DD').
 * Devuelve intervalos { inicio, fin } como Date en hora local de Chile.
 * Ignora los eventos marcados como "libre" (showAs: free).
 */
export async function ocupadosEnOutlook(desde: string, hasta: string) {
  const token = await getAccessToken()

  const url =
    `https://graph.microsoft.com/v1.0/me/calendarView` +
    `?startDateTime=${desde}T00:00:00` +
    `&endDateTime=${hasta}T23:59:59` +
    `&$select=start,end,showAs,subject&$top=500`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Pide a Graph que devuelva las horas ya convertidas a hora de Chile
      Prefer: `outlook.timezone="${TZ}"`,
    },
  })

  if (!res.ok) {
    throw new Error(`Error al leer el calendario: ${await res.text()}`)
  }

  const json = await res.json()
  const eventos = (json.value ?? []) as Array<{
    start: { dateTime: string }
    end: { dateTime: string }
    showAs?: string
  }>

  return eventos
    .filter((e) => e.showAs !== 'free')
    .map((e) => ({
      inicio: new Date(e.start.dateTime),
      fin: new Date(e.end.dateTime),
    }))
}

/**
 * Crea la asesoría en el calendario del asesor, con el cliente como invitado
 * (Outlook le envía la invitación automáticamente).
 * Devuelve el id del evento creado.
 */
export async function crearEventoOutlook(reserva: {
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
  const inicio = `${reserva.fecha}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  const finMin = m + 30
  const finH = h + Math.floor(finMin / 60)
  const fin = `${reserva.fecha}T${String(finH).padStart(2, '0')}:${String(finMin % 60).padStart(2, '0')}:00`

  const evento = {
    subject: `Asesoría K2 — ${reserva.nombre} ${reserva.apellido}`,
    body: {
      contentType: 'HTML',
      content: `
        <p><strong>${reserva.nombre} ${reserva.apellido}</strong> · RUT ${reserva.rut}</p>
        <p>${reserva.email} · ${reserva.telefono}</p>
        <hr />
        <p><strong>Interés de inversión</strong></p>
        <ul>
          <li>Propiedad: ${reserva.tipos.join(', ')}</li>
          <li>Comunas: ${reserva.comunas.join(', ')}</li>
          <li>Presupuesto: ${clp(reserva.presupuesto_min)} – ${clp(reserva.presupuesto_max)}</li>
        </ul>`,
    },
    start: { dateTime: inicio, timeZone: TZ },
    end: { dateTime: fin, timeZone: TZ },
    attendees: [
      {
        emailAddress: { address: reserva.email, name: `${reserva.nombre} ${reserva.apellido}` },
        type: 'required',
      },
    ],
    isOnlineMeeting: true,
    reminderMinutesBeforeStart: 30,
  }

  const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  })

  if (!res.ok) {
    throw new Error(`Error al crear el evento: ${await res.text()}`)
  }

  const json = await res.json()
  return json.id as string
}

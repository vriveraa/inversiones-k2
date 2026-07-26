// Envío de correos vía Resend + plantillas HTML en la identidad de Inversiones K2.
//
// Secretos requeridos:
//   RESEND_API_KEY  -> API key de Resend
//   FROM_EMAIL      -> remitente con dominio verificado
//                      (ej. "Inversiones K2 <reservas@inversionesk2.cl>")
//   ASESOR_EMAIL    -> casilla del asesor
//   SITIO_URL       -> URL pública del sitio (para el enlace de confirmación)

import { clp, fechaLarga } from './formato.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Inversiones K2 <onboarding@resend.dev>'
export const ASESOR_EMAIL = Deno.env.get('ASESOR_EMAIL')
export const SITIO_URL = (Deno.env.get('SITIO_URL') ?? 'http://localhost:5173').replace(/\/$/, '')

export interface Reserva {
  nombre: string
  apellido: string
  rut: string
  email: string
  telefono: string
  tipos: string[]
  comunas: string[]
  presupuesto_min: number
  presupuesto_max: number
  fecha: string
  hora: string
  token?: string
}

interface Adjunto {
  filename: string
  content: string // base64
}

/** Envía un correo. Devuelve { ok, error } — nunca lanza. */
export async function enviarCorreo(
  to: string,
  subject: string,
  html: string,
  attachments?: Adjunto[],
): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'Falta RESEND_API_KEY' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, attachments }),
    })

    if (!res.ok) return { ok: false, error: await res.text() }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// ============================================================================
// Plantillas — HTML con estilos en línea (los clientes de correo no soportan
// hojas de estilo). Paleta de marca: verde #0E4B3A, dorado #C9A24B.
// ============================================================================

const envoltorio = (contenido: string) => `
<div style="background:#f4f4f2;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <div style="background:#0B1220;padding:28px 32px;text-align:center">
      <img src="${SITIO_URL}/logo-k2-mark.png" alt="Inversiones K2" width="64" style="height:auto;display:inline-block;border:0" />
      <div style="color:#F7F5EF;font-size:12px;letter-spacing:5px;text-transform:uppercase;margin-top:12px">Inversiones</div>
      <div style="color:#C9A24B;font-size:30px;font-weight:bold;font-family:Georgia,serif;line-height:1.1">K2</div>
    </div>
    <div style="padding:32px">${contenido}</div>
    <div style="background:#0B1220;padding:18px 32px;text-align:center;color:#8a8f98;font-size:11px;line-height:1.6">
      Inversiones K2 · Asesoría en propiedades en remate<br />
      Este es un correo automático, no es necesario responderlo.
    </div>
  </div>
</div>`

const detalleReserva = (r: Reserva) => `
  <table style="width:100%;font-size:14px;border-collapse:collapse;margin-top:8px">
    <tr><td style="padding:7px 0;color:#6B7280">Fecha</td>
        <td style="text-align:right;color:#0B1220"><strong>${fechaLarga(r.fecha)}</strong></td></tr>
    <tr><td style="padding:7px 0;color:#6B7280">Hora</td>
        <td style="text-align:right;color:#0B1220"><strong>${r.hora} hrs</strong></td></tr>
    <tr><td style="padding:7px 0;color:#6B7280">Duración</td>
        <td style="text-align:right;color:#0B1220">30 minutos</td></tr>
    <tr><td style="padding:7px 0;color:#6B7280">Propiedad</td>
        <td style="text-align:right;color:#0B1220">${r.tipos.join(', ')}</td></tr>
    <tr><td style="padding:7px 0;color:#6B7280">Comunas</td>
        <td style="text-align:right;color:#0B1220">${r.comunas.join(', ')}</td></tr>
    <tr><td style="padding:7px 0;color:#6B7280">Presupuesto</td>
        <td style="text-align:right;color:#0B1220">${clp(r.presupuesto_min)} – ${clp(r.presupuesto_max)}</td></tr>
  </table>`

const boton = (href: string, texto: string) => `
  <table style="margin:26px auto"><tr><td style="border-radius:999px;background:#C9A24B">
    <a href="${href}" style="display:inline-block;padding:14px 34px;color:#0E4B3A;font-size:15px;font-weight:bold;text-decoration:none;border-radius:999px">${texto}</a>
  </td></tr></table>`

/** 1) Al reservar → el cliente debe confirmar con un clic. */
export function correoConfirmarCliente(r: Reserva, horasPlazo: number) {
  const enlace = `${SITIO_URL}/confirmar?token=${r.token}`
  return {
    subject: 'Confirma tu asesoría · Inversiones K2',
    html: envoltorio(`
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        ${r.nombre}, falta un paso
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        Recibimos tu solicitud de asesoría. Para dejarla agendada en firme,
        confirma con un clic:
      </p>
      ${boton(enlace, 'Confirmar mi asesoría')}
      <p style="margin:0 0 6px;font-size:13px;color:#6B7280">Los datos de tu reserva:</p>
      ${detalleReserva(r)}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#9ca3af">
        Si no confirmas dentro de las próximas <strong>${horasPlazo} horas</strong>,
        el horario se liberará para otra persona.<br />
        ¿No fuiste tú? Simplemente ignora este correo.
      </p>`),
  }
}

/** 2) Al confirmar → comprobante para el cliente. */
export function correoConfirmadaCliente(r: Reserva) {
  return {
    subject: `Asesoría confirmada · ${fechaLarga(r.fecha)} ${r.hora} hrs`,
    html: envoltorio(`
      <div style="text-align:center;font-size:42px;line-height:1">✓</div>
      <h1 style="margin:10px 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A;text-align:center">
        ¡Tu asesoría está confirmada!
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        ${r.nombre}, tu asesor te llamará al <strong>${r.telefono}</strong> en el
        horario acordado. Adjuntamos la cita para que la agregues a tu calendario.
      </p>
      ${detalleReserva(r)}
      <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#6B7280">
        Si necesitas reagendar o cancelar, escríbenos respondiendo a este correo
        con anticipación.
      </p>`),
  }
}

/** 3) Al confirmar → aviso al asesor con el interés del cliente. */
export function correoNuevaAsesoriaAsesor(r: Reserva) {
  return {
    subject: `Nueva asesoría: ${r.nombre} ${r.apellido} — ${fechaLarga(r.fecha)} ${r.hora}`,
    html: envoltorio(`
      <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        Nueva asesoría confirmada
      </h1>
      <p style="margin:0 0 4px;font-size:16px;color:#0B1220"><strong>${r.nombre} ${r.apellido}</strong></p>
      <p style="margin:0;font-size:13px;color:#6B7280">
        ${r.email} · ${r.telefono} · RUT ${r.rut}
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:18px 0" />
      ${detalleReserva(r)}
      <p style="margin:22px 0 0;font-size:12px;color:#9ca3af">
        Ya está en tu calendario de Outlook. Puedes gestionarla en el panel del asesor.
      </p>`),
  }
}

// ============================================================================
// Formulario 2 de calificación — un correo por clasificación.
// ============================================================================

/** 0) El asesor marca al lead como prospecto → se le envía el link del Form 2. */
export function correoInvitacionCalificacion(nombre: string, link: string) {
  return {
    subject: 'Un paso más para tu asesoría · Inversiones K2',
    html: envoltorio(`
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        ${nombre}, gracias por conversar con nosotros
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        Para preparar la siguiente etapa y enfocarnos en oportunidades reales para ti,
        necesitamos algunos datos. Te toma menos de 2 minutos:
      </p>
      ${boton(link, 'Completar mi formulario')}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#9ca3af">
        Este enlace es personal y de un solo uso. Si el botón no funciona, copia y
        pega:<br />${link}
      </p>`),
  }
}

/** activo → felicita e invita a agendar la segunda llamada. */
export function correoCalificacionActivo(nombre: string) {
  const enlace = `${SITIO_URL}/agendar`
  return {
    subject: 'Avancemos con tu inversión · Inversiones K2',
    html: envoltorio(`
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        ${nombre}, demos el siguiente paso
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        Revisamos tus respuestas y calzas con el perfil de inversión que trabajamos.
        Agendemos una segunda reunión para revisar oportunidades concretas y los
        próximos pasos.
      </p>
      ${boton(enlace, 'Agendar mi segunda reunión')}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#9ca3af">
        Si el botón no funciona, copia y pega este enlace:<br />${enlace}
      </p>`),
  }
}

/** nurture → agradece y suma a la lista mensual de oportunidades. */
export function correoCalificacionNurture(nombre: string) {
  return {
    subject: 'Gracias por tu interés · Inversiones K2',
    html: envoltorio(`
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        Gracias, ${nombre}
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        Por ahora el timing o los fondos no calzan del todo con las oportunidades
        que tenemos en mano, pero eso cambia seguido. Te sumamos a nuestra
        <strong>lista mensual de oportunidades</strong>: te escribiremos cuando
        aparezca algo que encaje con lo que buscas.
      </p>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#6B7280">
        Cuando quieras retomar, respóndenos este correo y coordinamos.
      </p>`),
  }
}

/** cierre → agradece de forma amable, sin lista mensual. */
export function correoCalificacionCierre(nombre: string) {
  return {
    subject: 'Gracias por tu tiempo · Inversiones K2',
    html: envoltorio(`
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:#0E4B3A">
        Gracias, ${nombre}
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563">
        Por ahora no logramos calzar con lo que necesitas, y preferimos ser
        honestos antes que hacerte perder el tiempo. Cuando cambien las
        condiciones, escríbenos y con gusto lo revisamos de nuevo.
      </p>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#6B7280">
        Te deseamos mucho éxito en tus decisiones de inversión.
      </p>`),
  }
}

/**
 * Archivo .ics para que el cliente agregue la cita a su calendario.
 * Se genera en UTC para evitar problemas de zona horaria entre clientes de correo.
 */
export function generarICS(r: Reserva): Adjunto {
  const [h, m] = r.hora.split(':').map(Number)
  const [y, mes, d] = r.fecha.split('-').map(Number)

  // Chile: UTC-4 (invierno) / UTC-3 (verano). Se calcula el offset real del día.
  const local = new Date(y, mes - 1, d, h, m)
  const utc = new Date(local.toLocaleString('en-US', { timeZone: 'UTC' }))
  const scl = new Date(local.toLocaleString('en-US', { timeZone: 'America/Santiago' }))
  const offsetMs = utc.getTime() - scl.getTime()

  const inicioUTC = new Date(local.getTime() + offsetMs)
  const finUTC = new Date(inicioUTC.getTime() + 30 * 60 * 1000)
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Inversiones K2//Asesoria//ES',
    'BEGIN:VEVENT',
    `UID:${r.token ?? crypto.randomUUID()}@inversionesk2`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(inicioUTC)}`,
    `DTEND:${fmt(finUTC)}`,
    'SUMMARY:Asesoría de inversión · Inversiones K2',
    `DESCRIPTION:Asesoría de 30 minutos sobre inversión en propiedades en remate.`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return { filename: 'asesoria-k2.ics', content: btoa(ics) }
}

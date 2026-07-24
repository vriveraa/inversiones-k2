// Edge Function: crea una reserva (sin confirmar) y envía al cliente el correo
// con el botón de confirmación.
//
// Reemplaza la inserción directa que antes hacía el navegador. Ahora el
// visitante no tiene permisos sobre la tabla: todo pasa por aquí.
//
// POST { contacto, inversion, agenda } -> { ok } | { error, motivo }
//
// Deploy: supabase functions deploy reservar --no-verify-jwt

import { CORS, json, db, SLOTS, DURACION_MIN, inicioDelBloque } from '../_shared/comun.ts'
import { ocupadosEnOutlook, graphConfigurado } from '../_shared/graph.ts'
import { enviarCorreo, correoConfirmarCliente, type Reserva } from '../_shared/correo.ts'

/** Horas que tiene el cliente para confirmar antes de perder el cupo. */
const HORAS_PLAZO = 24

/** Valida RUT chileno (módulo 11). Misma lógica que src/utils/rut.js. */
function rutValido(valor: string) {
  const rut = valor.replace(/[^0-9kK]/g, '').toUpperCase()
  if (rut.length < 8) return false
  const cuerpo = rut.slice(0, -1)
  const dv = rut.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false
  let suma = 0
  let mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (suma % 11)
  const esperado = res === 11 ? '0' : res === 10 ? 'K' : String(res)
  return esperado === dv
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json()
    const { contacto, inversion, agenda } = body ?? {}

    // ---- Validación en el servidor (la web ya valida, pero no confiamos) ----
    if (!contacto?.nombre?.trim() || !contacto?.apellido?.trim()) {
      return json({ error: 'Falta el nombre o apellido', motivo: 'datos' }, 400)
    }
    if (!rutValido(contacto.rut ?? '')) {
      return json({ error: 'RUT inválido', motivo: 'rut' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contacto.email ?? '')) {
      return json({ error: 'Correo inválido', motivo: 'email' }, 400)
    }
    if (!/^9\d{8}$/.test((contacto.telefono ?? '').replace(/\s/g, ''))) {
      return json({ error: 'Teléfono inválido', motivo: 'telefono' }, 400)
    }
    if (!inversion?.tipos?.length || !inversion?.comunas?.length) {
      return json({ error: 'Falta el detalle de la inversión', motivo: 'datos' }, 400)
    }
    if (!agenda?.fecha || !SLOTS.includes(agenda.hora)) {
      return json({ error: 'Fecha u hora inválida', motivo: 'agenda' }, 400)
    }

    // ---- El horario no debe chocar con el calendario del asesor ----
    if (graphConfigurado) {
      try {
        const intervalos = await ocupadosEnOutlook(agenda.fecha, agenda.fecha)
        const ini = inicioDelBloque(agenda.fecha, agenda.hora)
        const fin = new Date(ini.getTime() + DURACION_MIN * 60_000)
        if (intervalos.some((e) => ini < e.fin && fin > e.inicio)) {
          return json(
            {
              error: 'Ese horario ya no está disponible. Por favor elige otro bloque.',
              motivo: 'horario_ocupado',
            },
            409,
          )
        }
      } catch (err) {
        // Si el calendario no responde, se sigue: la BD igual protege el cupo.
        console.error('[K2] No se pudo verificar el calendario:', err)
      }
    }

    // ---- Guardar (las reglas de agenda las aplica la base) ----
    const expira = new Date(Date.now() + HORAS_PLAZO * 3600_000)
    const inicioReunion = inicioDelBloque(agenda.fecha, agenda.hora)
    const dosHorasAntes = new Date(inicioReunion.getTime() - 2 * 3600_000)

    const fila = {
      nombre: contacto.nombre.trim(),
      apellido: contacto.apellido.trim(),
      rut: contacto.rut.trim(),
      email: contacto.email.trim().toLowerCase(),
      telefono: `+56${contacto.telefono.replace(/\s/g, '')}`,
      tipos: inversion.tipos,
      comunas: inversion.comunas,
      presupuesto_min: inversion.presupuesto.min,
      presupuesto_max: inversion.presupuesto.max,
      fecha: agenda.fecha,
      hora: agenda.hora,
      confirmada: false,
      // Vence a las 24 h, o 2 h antes de la reunión si esta es más próxima
      expira_at: (expira < dosHorasAntes ? expira : dosHorasAntes).toISOString(),
    }

    const { data, error } = await db().from('reservas').insert(fila).select('token').single()

    if (error) {
      const texto = `${error.message} ${error.details ?? ''}`
      if (error.code === '23505' || texto.includes('reservas_slot_unico')) {
        return json(
          { error: 'Ese horario acaba de ser reservado por otra persona. Elige otro bloque.', motivo: 'horario_ocupado' },
          409,
        )
      }
      if (texto.includes('CLIENTE_YA_TIENE_RESERVA')) {
        return json(
          { error: 'Ya tienes una asesoría agendada con nosotros. Si necesitas cambiarla, escríbenos.', motivo: 'cliente_duplicado' },
          409,
        )
      }
      if (texto.includes('FECHA_INVALIDA')) {
        return json({ error: 'Esa fecha ya no está disponible. Elige un día a partir de mañana.', motivo: 'fecha' }, 409)
      }
      throw error
    }

    // ---- Correo al cliente con el botón de confirmación ----
    const reserva: Reserva = { ...fila, token: data.token }
    const { subject, html } = correoConfirmarCliente(reserva, HORAS_PLAZO)
    const envio = await enviarCorreo(reserva.email, subject, html)

    if (!envio.ok) {
      // La reserva quedó guardada; solo falló el correo. Se avisa para que el
      // cliente no quede pensando que todo salió bien.
      console.error('[K2] Falló el correo de confirmación:', envio.error)
      return json({ ok: true, correoEnviado: false })
    }

    return json({ ok: true, correoEnviado: true })
  } catch (err) {
    console.error('[K2] reservar:', err)
    return json({ error: 'No pudimos procesar tu reserva. Intenta de nuevo.', motivo: 'servidor' }, 500)
  }
})

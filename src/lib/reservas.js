import { supabase } from './supabase.js'
import { toISODate } from '../utils/format.js'

/**
 * Operaciones sobre reservas.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ INTERRUPTOR DE MODO                                                        │
 * │                                                                           │
 * │  'directo' → la web guarda directo en la base de datos. Funciona HOY,     │
 * │              sin correos ni confirmación ni calendario. (modo actual)     │
 * │                                                                           │
 * │  'edge'    → la web usa las Edge Functions (reservar/confirmar/           │
 * │              disponibilidad): correos + confirmación del cliente +        │
 * │              sincronía con el calendario Outlook del asesor.              │
 * │              Cambiar a 'edge' SOLO cuando estén desplegadas y la          │
 * │              migración SQL aplicada. Ver BACKEND.md.                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
const MODO = 'edge'

const URL_BASE = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Estados de seguimiento de una reserva (mini CRM del asesor).
 * Flujo: pendiente -> contactado -> realizada -> cliente | descartado
 */
export const ESTADOS = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'prospecto', label: 'Prospecto' },
  { id: 'realizada', label: 'Reunión realizada' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'descartado', label: 'Descartado' },
]

const SIN_CONFIGURAR =
  'El sistema de reservas no está disponible en este momento. ' +
  'Escríbenos a contacto@inversionesk2.cl y te agendamos de inmediato.'

const ERROR_GENERICO =
  'No pudimos completar la operación. Intenta de nuevo o escríbenos a contacto@inversionesk2.cl.'

/** Traduce los errores de la base a un mensaje entendible para el cliente. */
function mensajeDeError(error) {
  const texto = `${error?.message ?? ''} ${error?.details ?? ''}`
  if (error?.code === '23505' || texto.includes('reservas_slot_unico')) {
    return 'Ese horario acaba de ser reservado por otra persona. Por favor elige otro bloque.'
  }
  if (texto.includes('CLIENTE_YA_TIENE_RESERVA')) {
    return 'Ya tienes una asesoría agendada con nosotros. Si necesitas cambiarla, escríbenos a contacto@inversionesk2.cl.'
  }
  if (texto.includes('FECHA_INVALIDA')) {
    return 'La fecha seleccionada ya no está disponible. Elige un día a partir de mañana.'
  }
  return ERROR_GENERICO
}

// ===========================================================================
// API pública — despacha según el MODO
// ===========================================================================

/** Crea una reserva. Devuelve { error, mensaje, requiereConfirmacion, correoEnviado }. */
export async function crearReserva(data) {
  return MODO === 'edge' ? crearReservaEdge(data) : crearReservaDirecto(data)
}

/** Bloques ya tomados entre dos fechas ('YYYY-MM-DD'). Set de 'YYYY-MM-DD|HH:MM'. */
export async function obtenerHorariosOcupados(desde, hasta) {
  return MODO === 'edge' ? ocupadosEdge(desde, hasta) : ocupadosDirecto(desde, hasta)
}

// ===========================================================================
// MODO 'directo' — guardado directo en la base (activo hoy)
// ===========================================================================

async function crearReservaDirecto(data) {
  if (!supabase) {
    return { error: new Error('Supabase no configurado'), mensaje: SIN_CONFIGURAR }
  }

  const fila = {
    nombre: data.contacto.nombre.trim(),
    apellido: data.contacto.apellido.trim(),
    rut: data.contacto.rut.trim(),
    email: data.contacto.email.trim(),
    telefono: `+56${data.contacto.telefono.replace(/\s/g, '')}`,
    tipos: data.inversion.tipos,
    comunas: data.inversion.comunas,
    presupuesto_min: data.inversion.presupuesto.min,
    presupuesto_max: data.inversion.presupuesto.max,
    fecha: data.agenda.fecha ? toISODate(data.agenda.fecha) : null,
    hora: data.agenda.hora,
  }

  const { error } = await supabase.from('reservas').insert(fila)
  return {
    error,
    mensaje: error ? mensajeDeError(error) : null,
    requiereConfirmacion: false,
    correoEnviado: false,
  }
}

async function ocupadosDirecto(desde, hasta) {
  if (!supabase) return { ocupados: new Set(), error: null }
  const { data, error } = await supabase.rpc('horarios_ocupados', { desde, hasta })
  if (error) {
    console.error('[K2] No se pudieron cargar los horarios ocupados:', error)
    return { ocupados: new Set(), error }
  }
  return { ocupados: new Set((data ?? []).map((r) => `${r.fecha}|${r.hora}`)), error: null }
}

// ===========================================================================
// MODO 'edge' — Edge Functions (correos + confirmación + Outlook)
// ===========================================================================

async function invocar(nombre, body) {
  if (!URL_BASE || !ANON_KEY) {
    return { data: null, error: new Error('Supabase no configurado'), mensaje: SIN_CONFIGURAR }
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
      return { data, error: new Error(data?.error ?? `HTTP ${res.status}`), mensaje: data?.error ?? ERROR_GENERICO }
    }
    return { data, error: null, mensaje: null }
  } catch (err) {
    console.error(`[K2] Error llamando a ${nombre}:`, err)
    return { data: null, error: err, mensaje: ERROR_GENERICO }
  }
}

async function crearReservaEdge(data) {
  const { data: res, error, mensaje } = await invocar('reservar', {
    contacto: data.contacto,
    inversion: data.inversion,
    agenda: {
      fecha: data.agenda.fecha ? toISODate(data.agenda.fecha) : null,
      hora: data.agenda.hora,
    },
  })
  return { error, mensaje, requiereConfirmacion: true, correoEnviado: res?.correoEnviado ?? false }
}

async function ocupadosEdge(desde, hasta) {
  const { data, error } = await invocar('disponibilidad', { desde, hasta })
  if (error) return { ocupados: new Set(), error }
  return { ocupados: new Set(data?.ocupados ?? []), error: null }
}

/** Confirma la reserva con el token del correo (solo modo 'edge'). */
export async function confirmarReserva(token) {
  const { data, error, mensaje, motivo } = await invocar('confirmar', { token })
  return { reserva: data?.reserva ?? null, error, mensaje, motivo }
}

// ===========================================================================
// Panel del asesor (requiere sesión iniciada)
// ===========================================================================

/** Lista todas las reservas ordenadas por fecha y hora ascendente. */
export async function listarReservas() {
  if (!supabase) return { data: [], error: new Error('Supabase no está configurado.') }
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
  return { data: data ?? [], error }
}

/** Actualiza estado y/o notas de una reserva. */
export async function actualizarReserva(id, cambios) {
  if (!supabase) return { error: new Error('Supabase no está configurado.') }
  const { error } = await supabase.from('reservas').update(cambios).eq('id', id)
  return { error }
}

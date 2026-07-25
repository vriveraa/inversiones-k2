// Lógica del Formulario 2 de calificación: opciones válidas, puntajes,
// clasificación y override por presupuesto. Todo vive en el servidor: la web
// nunca decide el puntaje ni la clasificación.
//
// El frontend envía IDS estables (no textos con tildes) para cada respuesta;
// aquí se traducen a su etiqueta legible + puntaje. Si un id no existe, la
// respuesta se rechaza.

// ---------------------------------------------------------------------------
// AJUSTES EDITABLES POR EL ASESOR
// ---------------------------------------------------------------------------

/** Valor de la UF en CLP para convertir presupuestos ingresados en UF. */
export const VALOR_UF = 39_500

/**
 * Presupuesto mínimo (en CLP) por comuna para considerar viable la operación.
 * Por defecto TODO en 0 → el override no bloquea a nadie hasta que se ajuste.
 * Las claves deben coincidir con los ids de comuna de OPCIONES.comunas.
 */
export const MIN_PRESUPUESTO_POR_COMUNA: Record<string, number> = {
  las_condes: 0,
  providencia: 0,
  nunoa: 0,
  vitacura: 0,
  lo_barnechea: 0,
  estacion_central: 0,
  concon: 0,
  otra: 0,
}

// ---------------------------------------------------------------------------
// OPCIONES + PUNTAJES  (id -> { label, puntos })
// ---------------------------------------------------------------------------

type Opcion = { label: string; puntos: number }
const O = (label: string, puntos = 0): Opcion => ({ label, puntos })

export const PLAZO: Record<string, Opcion> = {
  este_mes: O('Este mes', 3),
  '3_meses': O('En los próximos 3 meses', 2),
  '6_meses': O('En los próximos 6 meses', 1),
  sin_plazo: O('Sin plazo definido', 0),
}

export const FONDOS: Record<string, Opcion> = {
  liquidos: O('Líquidos, disponibles ahora', 3),
  deposito: O('En depósito a plazo o inversión de corto plazo', 2),
  vendiendo: O('En una propiedad que estoy vendiendo', 2),
  financiamiento: O('Necesito financiamiento bancario', 1),
  juntando: O('Aún los estoy juntando', 0),
}

export const EXPERIENCIA: Record<string, Opcion> = {
  comprado: O('Sí, una o más veces', 2),
  observado: O('No, pero he ido a observar', 1),
  primera_vez: O('No, es primera vez', 0),
}

export const DISPOSICION: Record<string, Opcion> = {
  si: O('Sí', 3),
  entender: O('Quiero entender los términos primero', 1),
  no_aun: O('Prefiero no comprometerme aún', 0),
}

/** Comunas ofrecidas en el Formulario 2 (id -> etiqueta). */
export const COMUNAS: Record<string, string> = {
  las_condes: 'Las Condes',
  providencia: 'Providencia',
  nunoa: 'Ñuñoa',
  vitacura: 'Vitacura',
  lo_barnechea: 'Lo Barnechea',
  estacion_central: 'Estación Central',
  concon: 'Concón',
  otra: 'Otra',
}

export const UNIDADES = ['CLP', 'UF'] as const

// ---------------------------------------------------------------------------
// CÁLCULO
// ---------------------------------------------------------------------------

export interface RespuestaCruda {
  presupuesto_maximo?: unknown
  presupuesto_unidad?: unknown
  comunas?: unknown
  plazo?: unknown
  fondos?: unknown
  experiencia?: unknown
  disposicion_mandato?: unknown
  comentarios?: unknown
}

export interface Calificacion {
  presupuesto_maximo: number
  presupuesto_unidad: string
  presupuesto_clp: number
  comunas: string[] // etiquetas legibles
  comunasIds: string[]
  plazo: string
  fondos: string
  experiencia: string
  disposicion_mandato: string
  comentarios: string | null
  puntaje_total: number
  clasificacion: 'activo' | 'nurture' | 'cierre'
  revisar_presupuesto: boolean
}

/** Convierte a CLP el presupuesto según su unidad. */
export function presupuestoEnCLP(monto: number, unidad: string): number {
  return unidad === 'UF' ? Math.round(monto * VALOR_UF) : Math.round(monto)
}

function clasificarPorPuntaje(p: number): 'activo' | 'nurture' | 'cierre' {
  if (p >= 8) return 'activo'
  if (p >= 4) return 'nurture'
  return 'cierre'
}

/**
 * Valida y califica una respuesta cruda. Devuelve { ok, error } o { ok, datos }.
 * Nunca confía en el cliente: revalida cada campo contra las opciones válidas.
 */
export function calificar(
  r: RespuestaCruda,
): { ok: false; error: string } | { ok: true; datos: Calificacion } {
  // Presupuesto
  const monto = Number(r.presupuesto_maximo)
  const unidad = String(r.presupuesto_unidad ?? '')
  if (!Number.isFinite(monto) || monto <= 0) return { ok: false, error: 'Presupuesto inválido' }
  if (!UNIDADES.includes(unidad as (typeof UNIDADES)[number])) {
    return { ok: false, error: 'Unidad de presupuesto inválida' }
  }

  // Comunas (al menos una, todas válidas)
  const comunasIds = Array.isArray(r.comunas) ? (r.comunas as unknown[]).map(String) : []
  if (comunasIds.length === 0) return { ok: false, error: 'Selecciona al menos una comuna' }
  if (comunasIds.some((c) => !(c in COMUNAS))) return { ok: false, error: 'Comuna inválida' }

  // Selecciones únicas
  const plazo = String(r.plazo ?? '')
  const fondos = String(r.fondos ?? '')
  const experiencia = String(r.experiencia ?? '')
  const disposicion = String(r.disposicion_mandato ?? '')
  if (!(plazo in PLAZO)) return { ok: false, error: 'Plazo inválido' }
  if (!(fondos in FONDOS)) return { ok: false, error: 'Origen de fondos inválido' }
  if (!(experiencia in EXPERIENCIA)) return { ok: false, error: 'Experiencia inválida' }
  if (!(disposicion in DISPOSICION)) return { ok: false, error: 'Disposición inválida' }

  // Puntaje (máx. 11)
  const puntaje =
    PLAZO[plazo].puntos +
    FONDOS[fondos].puntos +
    EXPERIENCIA[experiencia].puntos +
    DISPOSICION[disposicion].puntos

  let clasificacion = clasificarPorPuntaje(puntaje)

  // Override por presupuesto: si el monto (en CLP) queda bajo el mínimo de
  // TODAS las comunas elegidas, se fuerza 'cierre' y se marca para revisión.
  const clp = presupuestoEnCLP(monto, unidad)
  const fallaTodas = comunasIds.every((c) => clp < (MIN_PRESUPUESTO_POR_COMUNA[c] ?? 0))
  if (fallaTodas) clasificacion = 'cierre'

  const comentarios = typeof r.comentarios === 'string' ? r.comentarios.trim().slice(0, 2000) : ''

  return {
    ok: true,
    datos: {
      presupuesto_maximo: monto,
      presupuesto_unidad: unidad,
      presupuesto_clp: clp,
      comunas: comunasIds.map((c) => COMUNAS[c]),
      comunasIds,
      plazo: PLAZO[plazo].label,
      fondos: FONDOS[fondos].label,
      experiencia: EXPERIENCIA[experiencia].label,
      disposicion_mandato: DISPOSICION[disposicion].label,
      comentarios: comentarios || null,
      puntaje_total: puntaje,
      clasificacion,
      revisar_presupuesto: fallaTodas,
    },
  }
}

// Lógica del Formulario 2 de calificación: opciones válidas, puntajes,
// clasificación y override por presupuesto. Todo vive en el servidor: la web
// nunca decide el puntaje ni la clasificación.
//
// El frontend envía IDS estables para las selecciones únicas (plazo, fondos,
// experiencia, disposición) y NOMBRES de comuna (igual que el formulario
// público, con el buscador de comunas).

// ---------------------------------------------------------------------------
// AJUSTES EDITABLES POR EL ASESOR
// ---------------------------------------------------------------------------

/** Valor de la UF en CLP para convertir presupuestos ingresados en UF. */
export const VALOR_UF = 39_500

/**
 * Presupuesto mínimo (en CLP) por comuna para considerar viable la operación.
 * Las claves son el NOMBRE de la comuna en minúsculas y sin tildes
 * (ej. 'las condes', 'nunoa', 'providencia'). Lo que no esté listado vale 0.
 * Por defecto va vacío → el override no bloquea a nadie hasta que lo ajustes.
 *
 * Ejemplo para activarlo:
 *   'las condes': 300_000_000,
 *   'vitacura':   350_000_000,
 */
export const MIN_PRESUPUESTO_POR_COMUNA: Record<string, number> = {}

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

export const UNIDADES = ['CLP', 'UF'] as const

/** minúsculas + sin tildes, para comparar nombres de comuna de forma robusta. */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function minComuna(nombre: string): number {
  return MIN_PRESUPUESTO_POR_COMUNA[normalizar(nombre)] ?? 0
}

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
  comunas: string[]
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

  // Comunas: nombres (igual que el formulario público). Al menos una.
  const comunas = Array.isArray(r.comunas)
    ? [...new Set((r.comunas as unknown[]).map((c) => String(c).trim()).filter(Boolean))].slice(0, 20)
    : []
  if (comunas.length === 0) return { ok: false, error: 'Selecciona al menos una comuna' }

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
  const fallaTodas = comunas.every((c) => clp < minComuna(c))
  if (fallaTodas) clasificacion = 'cierre'

  const comentarios = typeof r.comentarios === 'string' ? r.comentarios.trim().slice(0, 2000) : ''

  return {
    ok: true,
    datos: {
      presupuesto_maximo: monto,
      presupuesto_unidad: unidad,
      presupuesto_clp: clp,
      comunas,
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

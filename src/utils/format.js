/** Formateo de montos en pesos chilenos. */

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const formatCLP = (n) => clp.format(n)

/** Versión corta: $85M en lugar de $85.000.000 */
export const formatCLPShort = (n) => {
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000).toLocaleString('es-CL')}M`
  return formatCLP(n)
}

/**
 * Date -> 'YYYY-MM-DD' usando la fecha LOCAL.
 * (No usar toISOString(): convierte a UTC y puede correr el día.)
 */
export const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Fecha larga en español: "lunes 20 de julio de 2026" */
export const formatFechaLarga = (date) =>
  date?.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) ?? ''

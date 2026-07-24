// Formateo compartido por las Edge Functions (montos y fechas en es-CL).

export const clp = (n: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)

/** 'YYYY-MM-DD' -> "lunes 27 de julio de 2026" */
export const fechaLarga = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

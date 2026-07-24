/**
 * Utilidades para RUT chileno:
 * limpieza, formateo (12.345.678-9) y validación de dígito verificador (módulo 11).
 */

export function cleanRut(value = '') {
  return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

export function formatRut(value = '') {
  const rut = cleanRut(value).slice(0, 9)
  if (rut.length < 2) return rut
  const body = rut.slice(0, -1)
  const dv = rut.slice(-1)
  const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${bodyFormatted}-${dv}`
}

export function computeDv(body) {
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  if (res === 11) return '0'
  if (res === 10) return 'K'
  return String(res)
}

export function validateRut(value = '') {
  const rut = cleanRut(value)
  if (rut.length < 8) return false
  const body = rut.slice(0, -1)
  const dv = rut.slice(-1)
  if (!/^\d+$/.test(body)) return false
  return computeDv(body) === dv
}

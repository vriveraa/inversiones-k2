import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { toISODate } from '../utils/format.js'
import { EASE } from './Reveal.jsx'

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Bloques horarios disponibles: 09:00–18:00 en tramos de 30 min. */
const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const isSameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * Calendario visual + grid de bloques horarios.
 *
 * Reglas de disponibilidad:
 *  - No se puede agendar para hoy ni fechas pasadas (mínimo: mañana).
 *  - Fines de semana deshabilitados.
 *  - Los bloques ya reservados aparecen como "ocupado" (prop `ocupados`).
 *  - Un día con todos sus bloques tomados queda deshabilitado.
 */
export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  ocupados = new Set(),
  cargandoOcupados = false,
}) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewYear, setViewYear] = useState((date ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState((date ?? today).getMonth())

  const atCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const navigateMonth = (dir) => {
    let m = viewMonth + dir
    let y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewMonth(m)
    setViewYear(y)
  }

  // Celdas del mes: null para huecos iniciales (semana parte en lunes)
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const offset = (first.getDay() + 6) % 7 // lunes = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
    ]
  }, [viewYear, viewMonth])

  /** ¿Este bloque de este día ya está tomado? */
  const slotOcupado = (d, slot) => ocupados.has(`${toISODate(d)}|${slot}`)

  /** Día sin ningún bloque libre. */
  const diaCompleto = (d) => SLOTS.every((s) => slotOcupado(d, s))

  const isDisabled = (d) => {
    // Hoy y días pasados no se pueden agendar (se agenda desde mañana)
    if (d.getTime() <= today.getTime()) return true
    const dow = d.getDay()
    if (dow === 0 || dow === 6) return true // fin de semana
    return diaCompleto(d)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Calendario */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            disabled={atCurrentMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold transition-all hover:border-gold hover:bg-gold/10 disabled:pointer-events-none disabled:opacity-25"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="font-display text-lg font-semibold text-champagne" aria-live="polite">
            {MESES[viewMonth]} {viewYear}
          </p>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold transition-all hover:border-gold hover:bg-gold/10"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DIAS.map((d) => (
            <span key={d} className="py-1 text-[10px] uppercase tracking-wider text-ivory/35">
              {d}
            </span>
          ))}
          {cells.map((d, i) =>
            d === null ? (
              <span key={`gap-${i}`} aria-hidden="true" />
            ) : (
              <button
                key={d.toISOString()}
                type="button"
                disabled={isDisabled(d)}
                onClick={() => onDateChange(d)}
                aria-pressed={!!isSameDay(d, date)}
                aria-label={d.toLocaleDateString('es-CL', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
                className={`aspect-square rounded-lg text-sm transition-all duration-200 ${
                  isSameDay(d, date)
                    ? 'scale-105 bg-gold font-semibold text-jade-deep shadow-gold-glow'
                    : isDisabled(d)
                      ? 'cursor-not-allowed text-ivory/15'
                      : 'text-ivory/75 hover:bg-gold/15 hover:text-champagne'
                }`}
              >
                {d.getDate()}
              </button>
            ),
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-ivory/35">
          Lunes a viernes · agenda desde mañana
        </p>
      </div>

      {/* Bloques horarios */}
      <div>
        <p className="mb-4 flex items-center gap-2 text-sm text-ivory/60">
          <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
          {cargandoOcupados
            ? 'Revisando disponibilidad…'
            : date
              ? 'Elige un horario disponible'
              : 'Primero selecciona una fecha'}
        </p>
        <AnimatePresence mode="wait">
          {cargandoOcupados ? (
            <motion.div
              key="cargando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10"
            >
              <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden="true" />
            </motion.div>
          ) : date ? (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="grid grid-cols-3 gap-2"
              role="listbox"
              aria-label="Horarios disponibles"
            >
              {SLOTS.map((slot) => {
                const ocupado = slotOcupado(date, slot)
                const seleccionado = time === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    role="option"
                    aria-selected={seleccionado}
                    disabled={ocupado}
                    title={ocupado ? 'Horario ya reservado' : undefined}
                    onClick={() => onTimeChange(slot)}
                    className={`rounded-xl border py-2.5 text-sm transition-all duration-200 ${
                      seleccionado
                        ? 'scale-105 border-gold bg-gold font-semibold text-jade-deep shadow-gold-glow'
                        : ocupado
                          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-ivory/20 line-through'
                          : 'border-white/10 bg-white/[0.03] text-ivory/70 hover:border-gold/50 hover:text-champagne'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarCheck, Loader2, Pencil } from 'lucide-react'
import DateTimePicker from '../DateTimePicker.jsx'
import { formatCLP, formatFechaLarga, toISODate } from '../../utils/format.js'
import { obtenerHorariosOcupados } from '../../lib/reservas.js'
import { EASE } from '../Reveal.jsx'

/**
 * Etapa 3 — Fecha y hora + resumen final de la reserva.
 */
export default function StepSchedule({
  data,
  value,
  onChange,
  onBack,
  onConfirm,
  submitting = false,
  submitError = null,
}) {
  const [error, setError] = useState(null)
  const [ocupados, setOcupados] = useState(new Set())
  const [cargandoOcupados, setCargandoOcupados] = useState(true)
  const ready = value.fecha && value.hora

  // Carga los bloques ya reservados (próximos 6 meses) para marcarlos ocupados
  useEffect(() => {
    let vigente = true
    const desde = new Date()
    const hasta = new Date()
    hasta.setMonth(hasta.getMonth() + 6)

    obtenerHorariosOcupados(toISODate(desde), toISODate(hasta)).then(({ ocupados }) => {
      if (!vigente) return
      setOcupados(ocupados)
      setCargandoOcupados(false)
    })
    return () => {
      vigente = false
    }
  }, [])

  const handleConfirm = () => {
    if (!ready) {
      setError('Selecciona una fecha y un horario para tu asesoría')
      return
    }
    setError(null)
    onConfirm()
  }

  return (
    <div>
      <DateTimePicker
        ocupados={ocupados}
        cargandoOcupados={cargandoOcupados}
        date={value.fecha}
        time={value.hora}
        onDateChange={(fecha) => {
          // Al cambiar de día se resetea la hora en la misma actualización
          onChange({ ...value, fecha, hora: null })
          setError(null)
        }}
        onTimeChange={(hora) => {
          onChange({ ...value, hora })
          setError(null)
        }}
      />

      {error && (
        <p role="alert" className="mt-4 text-center text-xs text-red-300">
          {error}
        </p>
      )}

      {/* Resumen final de la reserva */}
      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-9 rounded-2xl border border-gold/25 bg-gold/[0.06] p-6"
        >
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-champagne">
            <CalendarCheck className="h-5 w-5 text-gold" aria-hidden="true" />
            Resumen de tu reserva
          </h3>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <SummaryRow
              label="Nombre"
              value={`${data.contacto.nombre} ${data.contacto.apellido}`}
            />
            <SummaryRow label="RUT" value={data.contacto.rut} />
            <SummaryRow label="Correo" value={data.contacto.email} />
            <SummaryRow label="Teléfono" value={`+56 ${data.contacto.telefono}`} />
            <SummaryRow label="Propiedad" value={data.inversion.tipos.join(' · ')} />
            <SummaryRow label="Comunas" value={data.inversion.comunas.join(', ')} />
            <SummaryRow
              label="Presupuesto"
              value={`${formatCLP(data.inversion.presupuesto.min)} – ${formatCLP(data.inversion.presupuesto.max)}`}
            />
            <SummaryRow
              label="Fecha y hora"
              value={`${formatFechaLarga(value.fecha)} · ${value.hora} hrs`}
              highlight
            />
          </dl>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ivory/40">
            <Pencil className="h-3 w-3" aria-hidden="true" />
            ¿Algo no cuadra? Usa “Atrás” para editar tus datos.
          </p>
        </motion.div>
      )}

      {/* Error de envío al backend */}
      {submitError && (
        <p role="alert" className="mt-6 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-center text-sm text-red-200">
          {submitError}
        </p>
      )}

      <div className="mt-9 flex justify-between">
        <button type="button" onClick={onBack} disabled={submitting} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Atrás
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!ready || submitting}
          className="btn-gold"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Confirmando…
            </>
          ) : (
            <>
              Confirmar asesoría
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">{label}</dt>
      <dd className={highlight ? 'font-semibold text-gold' : 'text-ivory/85'}>{value}</dd>
    </div>
  )
}

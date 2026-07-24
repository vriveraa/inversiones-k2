import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarX2, Loader2, MailWarning } from 'lucide-react'
import { confirmarReserva } from '../lib/reservas.js'
import { EASE } from '../components/Reveal.jsx'

/**
 * Página /confirmar?token=…
 * El cliente llega desde el botón del correo. Confirma la reserva, lo que
 * dispara la creación del evento en el calendario del asesor y los correos
 * finales.
 */
export default function Confirmar() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [estado, setEstado] = useState('confirmando') // confirmando | ok | error
  const [reserva, setReserva] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [motivo, setMotivo] = useState(null)
  const yaCorrio = useRef(false)

  useEffect(() => {
    // En React StrictMode el efecto corre dos veces en desarrollo
    if (yaCorrio.current) return
    yaCorrio.current = true

    if (!token) {
      setMotivo('invalido')
      setMensaje('El enlace está incompleto. Revisa el correo que te enviamos.')
      setEstado('error')
      return
    }

    confirmarReserva(token).then(({ reserva, error, mensaje, motivo }) => {
      if (error) {
        setMotivo(motivo ?? 'servidor')
        setMensaje(mensaje)
        setEstado('error')
        return
      }
      setReserva(reserva)
      setEstado('ok')
    })
  }, [token])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy via-jade-deep/60 to-navy px-5 py-28">
      <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass relative mx-auto w-full max-w-xl p-10 text-center shadow-premium sm:p-14"
        role="status"
        aria-live="polite"
      >
        {estado === 'confirmando' && <Confirmando />}
        {estado === 'ok' && <Confirmada reserva={reserva} />}
        {estado === 'error' && <Fallo motivo={motivo} mensaje={mensaje} />}
      </motion.div>
    </div>
  )
}

function Confirmando() {
  return (
    <>
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" aria-hidden="true" />
      <h1 className="mt-6 font-display text-2xl font-semibold text-ivory">
        Confirmando tu asesoría…
      </h1>
      <p className="mt-3 text-sm text-ivory/55">Esto toma solo un segundo.</p>
    </>
  )
}

function Confirmada({ reserva }) {
  const fechaLarga = (s) => {
    if (!s) return ''
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <>
      {/* Check dorado que se dibuja */}
      <svg viewBox="0 0 96 96" className="mx-auto h-28 w-28" fill="none" aria-hidden="true">
        <motion.circle
          cx="48" cy="48" r="42" stroke="#C9A24B" strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <motion.circle
          cx="48" cy="48" r="42" stroke="#E4CE8F" strokeWidth="1" opacity="0.3"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.15, 1] }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.path
          d="M30 49 L43 62 L67 37"
          stroke="#E4CE8F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, delay: 0.65, ease: EASE }}
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
      >
        <h1 className="mt-6 font-display text-3xl font-semibold text-ivory sm:text-4xl">
          ¡Asesoría confirmada!
        </h1>
        {reserva && (
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">
            {reserva.nombre}, te esperamos el{' '}
            <span className="font-semibold text-champagne">{fechaLarga(reserva.fecha)}</span> a
            las <span className="font-semibold text-champagne">{reserva.hora} hrs</span>. Tu
            asesor te llamará puntualmente.
          </p>
        )}
        <div className="hairline mx-auto mt-8 max-w-[10rem]" aria-hidden="true" />
        <p className="mt-6 text-xs text-ivory/40">
          Te enviamos el comprobante por correo, con la cita para agregar a tu
          calendario.
        </p>
        <Link to="/" className="btn-gold mt-8">
          Volver al inicio
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </>
  )
}

function Fallo({ motivo, mensaje }) {
  const vencido = motivo === 'vencido'
  const Icono = vencido ? CalendarX2 : MailWarning

  return (
    <>
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
        <Icono className="h-9 w-9 text-gold" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-semibold text-ivory sm:text-3xl">
        {vencido ? 'El plazo venció' : 'No pudimos confirmar'}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ivory/60">{mensaje}</p>
      <div className="hairline mx-auto mt-8 max-w-[10rem]" aria-hidden="true" />
      <p className="mt-6 text-xs text-ivory/40">
        No te preocupes: puedes agendar de nuevo y elegir el horario que te acomode.
      </p>
      <Link to="/agendar" className="btn-gold mt-8">
        Agendar de nuevo
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </>
  )
}

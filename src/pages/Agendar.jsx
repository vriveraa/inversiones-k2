import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WizardProgress from '../components/wizard/WizardProgress.jsx'
import StepContact from '../components/wizard/StepContact.jsx'
import StepInvestment from '../components/wizard/StepInvestment.jsx'
import StepSchedule from '../components/wizard/StepSchedule.jsx'
import { formatFechaLarga } from '../utils/format.js'
import { crearReserva } from '../lib/reservas.js'
import { EASE } from '../components/Reveal.jsx'

const INITIAL = {
  contacto: { nombre: '', apellido: '', rut: '', email: '', telefono: '' },
  inversion: {
    tipos: [],
    comunas: [],
    presupuesto: { min: 30_000_000, max: 150_000_000 },
  },
  agenda: { fecha: null, hora: null },
}

/**
 * Página /agendar — Wizard multi-paso (3 etapas) para agendar
 * la asesoría de inversión. Todo el estado vive en `data`.
 */
export default function Agendar() {
  const [data, setData] = useState(INITIAL)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [resultado, setResultado] = useState({ requiereConfirmacion: false, correoEnviado: false })

  const go = (next) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setSubmitError(null)

    const { error, mensaje, requiereConfirmacion, correoEnviado } = await crearReserva(data)

    if (error) {
      console.error('[K2] Error al guardar la reserva:', error)
      setSubmitError(mensaje)
      setSubmitting(false)
      return
    }

    setResultado({ requiereConfirmacion, correoEnviado })
    setSubmitting(false)
    setDone(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-navy via-jade-deep/60 to-navy pb-24 pt-32">
      {/* Decoración de fondo */}
      <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-5 lg:px-0">
        {!done ? (
          <>
            {/* Encabezado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-center"
            >
              <span className="eyebrow">Sin costo · 30 minutos</span>
              <h1 className="mt-4 font-display text-3xl font-semibold text-ivory sm:text-4xl lg:text-5xl">
                Agenda tu asesoría de inversión
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory/55">
                Completa estos tres pasos y tu asesor te contactará en el horario
                que elijas.
              </p>
            </motion.div>

            {/* Tarjeta glass del wizard */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="glass mt-10 p-6 shadow-premium sm:p-10"
            >
              <WizardProgress current={step} />

              <div className="relative mt-10 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 70 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -70 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {step === 0 && (
                      <StepContact
                        defaultValues={data.contacto}
                        onNext={(contacto) => {
                          setData((d) => ({ ...d, contacto }))
                          go(1)
                        }}
                      />
                    )}
                    {step === 1 && (
                      <StepInvestment
                        value={data.inversion}
                        onChange={(inversion) => setData((d) => ({ ...d, inversion }))}
                        onBack={() => go(0)}
                        onNext={() => go(2)}
                      />
                    )}
                    {step === 2 && (
                      <StepSchedule
                        data={data}
                        value={data.agenda}
                        onChange={(agenda) => setData((d) => ({ ...d, agenda }))}
                        onBack={() => go(1)}
                        onConfirm={handleConfirm}
                        submitting={submitting}
                        submitError={submitError}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        ) : (
          <SuccessView data={data} resultado={resultado} />
        )}
      </div>
    </div>
  )
}

/**
 * Pantalla final. Dos variantes según el modo:
 *  - simple ('directo'): la reserva quedó agendada de inmediato.
 *  - con confirmación ('edge'): falta que el cliente confirme desde su correo.
 */
function SuccessView({ data, resultado }) {
  const { requiereConfirmacion, correoEnviado } = resultado
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="glass mx-auto mt-10 max-w-xl p-10 text-center shadow-premium sm:p-14"
      role="status"
    >
      {/* Check dorado que se dibuja */}
      <svg viewBox="0 0 96 96" className="mx-auto h-28 w-28" fill="none" aria-hidden="true">
        <motion.circle
          cx="48"
          cy="48"
          r="42"
          stroke="#C9A24B"
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <motion.circle
          cx="48"
          cy="48"
          r="42"
          stroke="#E4CE8F"
          strokeWidth="1"
          opacity="0.3"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.15, 1] }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.path
          d="M30 49 L43 62 L67 37"
          stroke="#E4CE8F"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
          {requiereConfirmacion ? 'Revisa tu correo' : '¡Tu llamada fue agendada!'}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/60">
          {data.contacto.nombre},{' '}
          {requiereConfirmacion ? 'apartamos' : 'reservamos'} tu asesoría para el{' '}
          <span className="font-semibold text-champagne">
            {formatFechaLarga(data.agenda.fecha)}
          </span>{' '}
          a las <span className="font-semibold text-champagne">{data.agenda.hora} hrs</span>.
        </p>

        {requiereConfirmacion ? (
          correoEnviado ? (
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              Te enviamos un correo a <span className="text-gold">{data.contacto.email}</span>{' '}
              con un botón para <span className="font-semibold text-champagne">confirmar</span>.
              Tu hora queda reservada apenas hagas clic.
            </p>
          ) : (
            <p className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-champagne">
              Guardamos tu solicitud, pero no pudimos enviarte el correo de
              confirmación. Escríbenos a{' '}
              <a href="mailto:contacto@inversionesk2.cl" className="font-semibold underline">
                contacto@inversionesk2.cl
              </a>{' '}
              y la dejamos lista.
            </p>
          )
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">
            Tu asesor te contactará al{' '}
            <span className="font-semibold text-champagne">+56 {data.contacto.telefono}</span>{' '}
            en el horario acordado para tu asesoría.
          </p>
        )}

        <div className="hairline mx-auto mt-8 max-w-[10rem]" aria-hidden="true" />
        <p className="mt-6 text-xs text-ivory/40">
          {requiereConfirmacion
            ? 'Si no confirmas dentro de 24 horas, el horario se liberará para otra persona. ¿No ves el correo? Revisa tu carpeta de spam.'
            : 'Nos pondremos en contacto contigo a la brevedad. ¡Gracias por confiar en Inversiones K2!'}
        </p>
        <Link to="/" className="btn-gold mt-8">
          Volver al inicio
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </motion.div>
  )
}

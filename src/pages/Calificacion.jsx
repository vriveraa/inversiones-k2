import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Loader2, ShieldAlert } from 'lucide-react'
import { validarTokenCalificacion, enviarCalificacion } from '../lib/calificacion.js'
import MultiSelectComunas from '../components/MultiSelectComunas.jsx'
import { EASE } from '../components/Reveal.jsx'

// Selecciones únicas (los ids DEBEN coincidir con
// supabase/functions/_shared/calificacion.ts). Las comunas van por nombre,
// con el mismo buscador del formulario público.
const PLAZO = [
  ['este_mes', 'Este mes'], ['3_meses', 'En los próximos 3 meses'],
  ['6_meses', 'En los próximos 6 meses'], ['sin_plazo', 'Sin plazo definido'],
]
const FONDOS = [
  ['liquidos', 'Líquidos, disponibles ahora'],
  ['deposito', 'En depósito a plazo o inversión de corto plazo'],
  ['vendiendo', 'En una propiedad que estoy vendiendo'],
  ['financiamiento', 'Necesito financiamiento bancario'],
  ['juntando', 'Aún los estoy juntando'],
]
const EXPERIENCIA = [
  ['comprado', 'Sí, una o más veces'], ['observado', 'No, pero he ido a observar'],
  ['primera_vez', 'No, es primera vez'],
]
const DISPOSICION = [
  ['si', 'Sí'], ['entender', 'Quiero entender los términos primero'],
  ['no_aun', 'Prefiero no comprometerme aún'],
]

const Fondo = ({ children }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy via-jade-deep/60 to-navy px-5 py-28">
    <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />
    <div
      className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]"
      aria-hidden="true"
    />
    {children}
  </div>
)

export default function Calificacion() {
  const { token } = useParams()

  const [estado, setEstado] = useState('validando') // validando | form | invalido | enviando | gracias
  const [nombre, setNombre] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [clasificacion, setClasificacion] = useState(null)
  const yaCorrio = useRef(false)

  // El formulario NO debe indexarse ni seguirse.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    const titulo = document.title
    document.title = 'Calificación · Inversiones K2'
    return () => {
      meta.remove()
      document.title = titulo
    }
  }, [])

  // Validación del token al cargar.
  useEffect(() => {
    if (yaCorrio.current) return
    yaCorrio.current = true
    validarTokenCalificacion(token).then((r) => {
      if (!r.ok) {
        setMensaje(r.mensaje)
        setEstado('invalido')
        return
      }
      setNombre(r.nombre)
      setEstado('form')
    })
  }, [token])

  if (estado === 'validando') {
    return (
      <Fondo>
        <div className="glass w-full max-w-xl p-12 text-center shadow-premium" role="status" aria-live="polite">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" aria-hidden="true" />
          <p className="mt-5 text-sm text-ivory/55">Validando tu enlace…</p>
        </div>
      </Fondo>
    )
  }

  if (estado === 'invalido') {
    return (
      <Fondo>
        <div className="glass w-full max-w-xl p-10 text-center shadow-premium sm:p-14">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
            <ShieldAlert className="h-9 w-9 text-gold" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ivory sm:text-3xl">
            Enlace no válido o expirado
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">
            {mensaje ?? 'Este enlace no es válido, ya fue utilizado o expiró.'}
          </p>
          <div className="hairline mx-auto mt-8 max-w-[10rem]" aria-hidden="true" />
          <p className="mt-6 text-xs text-ivory/40">
            Si crees que es un error, escríbenos a{' '}
            <a href="mailto:contacto@inversionesk2.cl" className="text-champagne underline">
              contacto@inversionesk2.cl
            </a>{' '}
            y te reenviamos el acceso.
          </p>
        </div>
      </Fondo>
    )
  }

  if (estado === 'gracias') {
    return <Gracias clasificacion={clasificacion} nombre={nombre} />
  }

  // estado === 'form' | 'enviando'
  return (
    <Formulario
      nombre={nombre}
      enviando={estado === 'enviando'}
      onSubmit={async (respuestas) => {
        setEstado('enviando')
        const r = await enviarCalificacion(token, respuestas)
        if (!r.ok) {
          setMensaje(r.mensaje)
          setEstado(r.motivo === 'datos' || r.motivo === 'servidor' ? 'form' : 'invalido')
          return { error: r.mensaje }
        }
        setClasificacion(r.clasificacion)
        setEstado('gracias')
        return {}
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Pantallas finales (una por clasificación) — siempre con cierre claro.
// ---------------------------------------------------------------------------

function Gracias({ clasificacion, nombre }) {
  const activo = clasificacion === 'activo'
  const nurture = clasificacion === 'nurture'

  return (
    <Fondo>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass w-full max-w-xl p-10 text-center shadow-premium sm:p-14"
      >
        {/* Check dorado animado */}
        <svg viewBox="0 0 96 96" className="mx-auto h-24 w-24" fill="none" aria-hidden="true">
          <motion.circle
            cx="48" cy="48" r="42" stroke="#C9A24B" strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.path
            d="M30 49 L43 62 L67 37"
            stroke="#E4CE8F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: 0.6, ease: EASE }}
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        >
          {activo ? (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold text-ivory sm:text-3xl">
                {nombre ? `¡Excelente, ${nombre}!` : '¡Excelente!'}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                Tu perfil calza con las oportunidades que trabajamos. El siguiente paso es
                agendar tu <strong className="text-champagne">segunda reunión</strong> para
                revisar propiedades concretas.
              </p>
              <Link to="/agendar" className="btn-gold mt-8">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Agendar mi segunda reunión
              </Link>
              <p className="mt-5 text-xs leading-relaxed text-ivory/40">
                También te enviamos este enlace por correo, por si prefieres agendar más tarde.
              </p>
            </>
          ) : nurture ? (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold text-ivory sm:text-3xl">
                {nombre ? `Gracias, ${nombre}` : 'Gracias'}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                Por ahora el timing o los fondos no calzan del todo con lo que tenemos en mano,
                pero eso cambia seguido. Te sumamos a nuestra{' '}
                <strong className="text-champagne">lista mensual de oportunidades</strong> y te
                escribiremos cuando aparezca algo que encaje contigo.
              </p>
              <Link to="/" className="btn-gold mt-8">
                Volver al inicio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold text-ivory sm:text-3xl">
                {nombre ? `Gracias, ${nombre}` : 'Gracias'}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                Agradecemos tu tiempo. Por ahora no logramos calzar con lo que necesitas, y
                preferimos ser honestos antes que hacerte perder el tiempo. Cuando cambien las
                condiciones, escríbenos y con gusto lo revisamos de nuevo.
              </p>
              <Link to="/" className="btn-gold mt-8">
                Volver al inicio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </motion.div>

        <div className="hairline mx-auto mt-8 max-w-[10rem]" aria-hidden="true" />
        <p className="mt-6 text-xs text-ivory/40">Te enviamos también un correo con esta información.</p>
      </motion.div>
    </Fondo>
  )
}

// ---------------------------------------------------------------------------
// Formulario
// ---------------------------------------------------------------------------

function Formulario({ nombre, enviando, onSubmit }) {
  const [presupuesto, setPresupuesto] = useState('')
  const [unidad, setUnidad] = useState('CLP')
  const [comunas, setComunas] = useState([])
  const [plazo, setPlazo] = useState(null)
  const [fondos, setFondos] = useState(null)
  const [experiencia, setExperiencia] = useState(null)
  const [disposicion, setDisposicion] = useState(null)
  const [comentarios, setComentarios] = useState('')
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!(Number(presupuesto) > 0)) err.presupuesto = 'Ingresa un presupuesto válido'
    if (comunas.length === 0) err.comunas = 'Agrega al menos una comuna de interés'
    if (!plazo) err.plazo = 'Elige una opción'
    if (!fondos) err.fondos = 'Elige una opción'
    if (!experiencia) err.experiencia = 'Elige una opción'
    if (!disposicion) err.disposicion = 'Elige una opción'
    setErrores(err)
    if (Object.keys(err).length > 0) return

    setErrorEnvio(null)
    const res = await onSubmit({
      presupuesto_maximo: Number(presupuesto),
      presupuesto_unidad: unidad,
      comunas,
      plazo,
      fondos,
      experiencia,
      disposicion_mandato: disposicion,
      comentarios: comentarios.trim() || null,
    })
    if (res?.error) setErrorEnvio(res.error)
  }

  return (
    <Fondo>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="glass w-full max-w-2xl p-8 shadow-premium sm:p-12"
      >
        <span className="eyebrow">Paso 2 · Calificación</span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ivory sm:text-3xl">
          {nombre ? `${nombre}, cuéntanos más` : 'Cuéntanos más'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ivory/55">
          Con esto preparamos una segunda reunión enfocada en oportunidades reales para ti.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-9">
          {/* 1. Presupuesto */}
          <Campo label="Presupuesto máximo de inversión" error={errores.presupuesto}>
            <div className="flex gap-3">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Ej. 120000000"
                className={`input-dark flex-1 ${errores.presupuesto ? 'input-error' : ''}`}
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)}
              />
              <select
                className="input-dark w-28"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                aria-label="Unidad"
              >
                <option value="CLP">CLP</option>
                <option value="UF">UF</option>
              </select>
            </div>
          </Campo>

          {/* 2. Comunas (mismo buscador del formulario público) */}
          <Campo label="Comuna(s) de interés" error={errores.comunas}>
            <MultiSelectComunas value={comunas} onChange={setComunas} />
          </Campo>

          {/* 3. Plazo */}
          <Campo label="¿En qué plazo buscas invertir?" error={errores.plazo}>
            <Opciones opciones={PLAZO} value={plazo} onChange={setPlazo} />
          </Campo>

          {/* 4. Fondos */}
          <Campo label="¿Cómo tienes los fondos hoy?" error={errores.fondos}>
            <Opciones opciones={FONDOS} value={fondos} onChange={setFondos} />
          </Campo>

          {/* 5. Experiencia */}
          <Campo label="¿Has comprado en remate antes?" error={errores.experiencia}>
            <Opciones opciones={EXPERIENCIA} value={experiencia} onChange={setExperiencia} />
          </Campo>

          {/* 6. Disposición al mandato */}
          <Campo label="¿Estarías dispuesto a firmar un mandato de representación?" error={errores.disposicion}>
            <Opciones opciones={DISPOSICION} value={disposicion} onChange={setDisposicion} />
          </Campo>

          {/* 7. Comentarios */}
          <Campo label="Comentarios (opcional)">
            <textarea
              rows={3}
              className="input-dark w-full resize-none"
              placeholder="Cuéntanos cualquier detalle que nos ayude a prepararnos."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </Campo>

          {errorEnvio && <p role="alert" className="text-sm text-red-300">{errorEnvio}</p>}

          <button type="submit" disabled={enviando} className="btn-gold w-full justify-center disabled:opacity-60">
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Enviando…
              </>
            ) : (
              <>
                Enviar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </Fondo>
  )
}

function Campo({ label, error, children }) {
  return (
    <div>
      <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
        {label}
      </span>
      {children}
      {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  )
}

function Opciones({ opciones, value, onChange }) {
  return (
    <div className="space-y-2.5">
      {opciones.map(([id, label]) => {
        const activo = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={activo}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
              activo
                ? 'border-gold bg-gold/10 text-champagne shadow-gold-glow'
                : 'border-white/10 bg-white/[0.03] text-ivory/70 hover:border-gold/40 hover:text-ivory'
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                activo ? 'border-gold bg-gold' : 'border-ivory/30'
              }`}
            >
              {activo && <span className="h-1.5 w-1.5 rounded-full bg-jade-deep" />}
            </span>
            {label}
          </button>
        )
      })}
    </div>
  )
}

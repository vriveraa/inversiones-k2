import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Building2,
  IdCard,
  Wallet,
  Check,
  Loader2,
  MailWarning,
} from 'lucide-react'
import { LogoIcon } from '../Logo.jsx'
import { listarReservas, actualizarReserva, ESTADOS } from '../../lib/reservas.js'
import { formatCLP } from '../../utils/format.js'

/** 'YYYY-MM-DD' -> Date local (evita el corrimiento por zona horaria). */
const parseFecha = (s) => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const fechaLarga = (s) =>
  parseFecha(s)?.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) ?? s

/** Clases de color por estado. */
const ESTADO_STYLE = {
  pendiente: 'border-gold/50 bg-gold/10 text-gold',
  contactado: 'border-sky-400/50 bg-sky-400/10 text-sky-300',
  realizada: 'border-violet-400/50 bg-violet-400/10 text-violet-300',
  cliente: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300',
  descartado: 'border-white/20 bg-white/5 text-ivory/50',
}

export default function AdminPanel({ session, onLogout }) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('todas')

  const cargar = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await listarReservas()
    if (error) setError('No se pudieron cargar las reuniones. Reintenta.')
    else setReservas(data)
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const kpis = useMemo(() => {
    const proximas = reservas.filter((r) => parseFecha(r.fecha) >= hoy).length
    const pendientes = reservas.filter((r) => r.estado === 'pendiente').length
    return { total: reservas.length, proximas, pendientes }
  }, [reservas, hoy])

  const visibles = useMemo(() => {
    if (filtro === 'todas') return reservas
    if (filtro === 'proximas') return reservas.filter((r) => parseFecha(r.fecha) >= hoy)
    if (filtro === 'por_confirmar') return reservas.filter((r) => !r.confirmada)
    return reservas.filter((r) => r.estado === filtro)
  }, [reservas, filtro, hoy])

  const onPatch = (id, cambios) =>
    setReservas((rs) => rs.map((r) => (r.id === id ? { ...r, ...cambios } : r)))

  return (
    <div className="bg-texture min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-gold/10 bg-navy/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-10 w-auto" />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold text-champagne">
                Panel del asesor
              </p>
              <p className="hidden text-xs text-ivory/45 sm:block">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cargar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-gold transition-all hover:border-gold hover:bg-gold/10"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <button type="button" onClick={onLogout} className="btn-ghost !px-4 !py-2 !text-xs">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Kpi label="Reuniones" value={kpis.total} />
          <Kpi label="Próximas" value={kpis.proximas} accent />
          <Kpi label="Por contactar" value={kpis.pendientes} />
        </div>

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap gap-2">
          <FiltroChip id="todas" label="Todas" filtro={filtro} setFiltro={setFiltro} />
          <FiltroChip id="proximas" label="Próximas" filtro={filtro} setFiltro={setFiltro} />
          <FiltroChip id="por_confirmar" label="Por confirmar" filtro={filtro} setFiltro={setFiltro} />
          {ESTADOS.map((e) => (
            <FiltroChip key={e.id} id={e.id} label={e.label} filtro={filtro} setFiltro={setFiltro} />
          ))}
        </div>

        {/* Lista */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-gold" aria-hidden="true" />
            </div>
          ) : error ? (
            <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-4 text-center text-sm text-red-200">
              {error}
            </p>
          ) : visibles.length === 0 ? (
            <p className="py-20 text-center text-sm text-ivory/45">
              No hay reuniones que mostrar en este filtro.
            </p>
          ) : (
            <ul className="space-y-4">
              {visibles.map((r) => (
                <ReservaCard key={r.id} reserva={r} onPatch={onPatch} hoy={hoy} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, accent = false }) {
  return (
    <div className="glass p-4 text-center sm:p-5">
      <p className={`font-display text-3xl font-semibold sm:text-4xl ${accent ? 'text-gold' : 'text-champagne'}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ivory/45 sm:text-xs">
        {label}
      </p>
    </div>
  )
}

function FiltroChip({ id, label, filtro, setFiltro }) {
  const active = filtro === id
  return (
    <button
      type="button"
      onClick={() => setFiltro(id)}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'border-gold bg-gold/15 text-champagne'
          : 'border-white/10 text-ivory/55 hover:border-gold/40 hover:text-ivory'
      }`}
    >
      {label}
    </button>
  )
}

function ReservaCard({ reserva, onPatch, hoy }) {
  const [notas, setNotas] = useState(reserva.notas ?? '')
  const [savingEstado, setSavingEstado] = useState(false)
  const [savingNotas, setSavingNotas] = useState(false)
  const [notasGuardadas, setNotasGuardadas] = useState(false)

  const pasada = parseFecha(reserva.fecha) < hoy
  const notasCambiadas = notas !== (reserva.notas ?? '')

  const cambiarEstado = async (estado) => {
    setSavingEstado(true)
    const { error } = await actualizarReserva(reserva.id, { estado })
    if (!error) onPatch(reserva.id, { estado })
    setSavingEstado(false)
  }

  const guardarNotas = async () => {
    setSavingNotas(true)
    const { error } = await actualizarReserva(reserva.id, { notas })
    if (!error) {
      onPatch(reserva.id, { notas })
      setNotasGuardadas(true)
      setTimeout(() => setNotasGuardadas(false), 2000)
    }
    setSavingNotas(false)
  }

  return (
    <li className={`glass p-5 sm:p-6 ${pasada ? 'opacity-70' : ''}`}>
      <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto]">
        {/* Fecha / hora */}
        <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-1 lg:border-r lg:border-white/10 lg:pr-6">
          <div className="flex items-center gap-1.5 text-champagne">
            <CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="text-sm font-semibold capitalize">{fechaLarga(reserva.fecha)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ivory/70">
            <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="text-sm">{reserva.hora} hrs</span>
          </div>
        </div>

        {/* Cliente + interés */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ivory">
              {reserva.nombre} {reserva.apellido}
            </h3>
            {!reserva.confirmada && (
              <span
                title="El cliente aún no confirma desde su correo. Si no lo hace, el horario se libera solo."
                className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300"
              >
                <MailWarning className="h-3 w-3" aria-hidden="true" />
                Por confirmar
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ivory/60">
            <a href={`mailto:${reserva.email}`} className="flex items-center gap-1.5 hover:text-champagne">
              <Mail className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
              {reserva.email}
            </a>
            <a href={`tel:${reserva.telefono}`} className="flex items-center gap-1.5 hover:text-champagne">
              <Phone className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
              {reserva.telefono}
            </a>
            <span className="flex items-center gap-1.5">
              <IdCard className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
              {reserva.rut}
            </span>
          </div>

          {/* Interés de inversión */}
          <div className="mt-4 space-y-2.5 border-t border-white/5 pt-3.5 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <div className="flex flex-wrap gap-1.5">
                {reserva.tipos?.map((t) => (
                  <span key={t} className="rounded-full border border-gold/25 bg-gold/5 px-2.5 py-0.5 text-xs text-champagne">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2 text-ivory/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span className="text-xs">{reserva.comunas?.join(' · ')}</span>
            </div>
            <div className="flex items-center gap-2 text-ivory/70">
              <Wallet className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span className="text-xs">
                {formatCLP(reserva.presupuesto_min)} – {formatCLP(reserva.presupuesto_max)}
              </span>
            </div>
          </div>
        </div>

        {/* Gestión: estado + notas */}
        <div className="lg:w-56 lg:border-l lg:border-white/10 lg:pl-6">
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-ivory/40">
              Estado
            </span>
            <div className="relative">
              <select
                value={reserva.estado}
                onChange={(e) => cambiarEstado(e.target.value)}
                disabled={savingEstado}
                className={`w-full cursor-pointer appearance-none rounded-lg border px-3 py-2 text-sm font-medium outline-none transition-colors ${ESTADO_STYLE[reserva.estado] ?? ESTADO_STYLE.pendiente}`}
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id} className="bg-navy text-ivory">
                    {e.label}
                  </option>
                ))}
              </select>
              {savingEstado && (
                <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-current" aria-hidden="true" />
              )}
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-ivory/40">
              Notas
            </span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Anota lo relevante de esta reunión…"
              className="input-dark resize-none text-xs"
            />
          </label>
          {notasCambiadas && (
            <button
              type="button"
              onClick={guardarNotas}
              disabled={savingNotas}
              className="btn-gold mt-2 w-full !py-2 !text-xs"
            >
              {savingNotas ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                'Guardar notas'
              )}
            </button>
          )}
          {notasGuardadas && (
            <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-emerald-300">
              <Check className="h-3 w-3" aria-hidden="true" /> Guardado
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

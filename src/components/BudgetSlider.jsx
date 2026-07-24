import { formatCLP, formatCLPShort } from '../utils/format.js'

const MIN = 0
const MAX = 500_000_000
const STEP = 5_000_000
const MIN_GAP = 20_000_000

/**
 * Slider premium de presupuesto con doble thumb (rango min–max)
 * y monto formateado en CLP en vivo.
 */
export default function BudgetSlider({ value, onChange }) {
  const { min, max } = value

  const handleMin = (v) => onChange({ min: Math.min(Number(v), max - MIN_GAP), max })
  const handleMax = (v) => onChange({ min, max: Math.max(Number(v), min + MIN_GAP) })

  const pctMin = ((min - MIN) / (MAX - MIN)) * 100
  const pctMax = ((max - MIN) / (MAX - MIN)) * 100

  return (
    <div>
      {/* Valor en vivo */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-ivory/40">Desde</p>
          <p className="font-display text-lg font-semibold whitespace-nowrap text-champagne sm:text-2xl lg:text-3xl">
            {formatCLP(min)}
          </p>
        </div>
        <span className="mb-2 hidden h-px flex-1 bg-gold/20 sm:block" aria-hidden="true" />
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.25em] text-ivory/40">Hasta</p>
          <p className="font-display text-lg font-semibold whitespace-nowrap text-champagne sm:text-2xl lg:text-3xl">
            {formatCLP(max)}
            {max === MAX && <span className="text-gold">+</span>}
          </p>
        </div>
      </div>

      {/* Pista del slider */}
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
        {/* Tramo activo dorado */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold to-champagne shadow-gold-glow"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          className="range-gold"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={(e) => handleMin(e.target.value)}
          aria-label={`Presupuesto mínimo: ${formatCLP(min)}`}
        />
        <input
          type="range"
          className="range-gold"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={(e) => handleMax(e.target.value)}
          aria-label={`Presupuesto máximo: ${formatCLP(max)}`}
        />
      </div>

      {/* Escala de referencia */}
      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-ivory/30">
        <span>{formatCLPShort(MIN)}</span>
        <span>{formatCLPShort(MAX / 2)}</span>
        <span>{formatCLPShort(MAX)}+</span>
      </div>
    </div>
  )
}

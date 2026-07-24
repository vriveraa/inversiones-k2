import { useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Check, Home, LandPlot, Store } from 'lucide-react'
import MultiSelectComunas from '../MultiSelectComunas.jsx'
import BudgetSlider from '../BudgetSlider.jsx'

const TIPOS = [
  { id: 'Departamento', icon: Building2 },
  { id: 'Casa', icon: Home },
  { id: 'Local Comercial', icon: Store },
  { id: 'Terreno', icon: LandPlot },
]

/**
 * Etapa 2 — Detalle de la inversión:
 * tipo(s) de propiedad, comuna(s) y presupuesto.
 */
export default function StepInvestment({ value, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({})

  const toggleTipo = (tipo) => {
    const tipos = value.tipos.includes(tipo)
      ? value.tipos.filter((t) => t !== tipo)
      : [...value.tipos, tipo]
    onChange({ ...value, tipos })
    if (tipos.length > 0) setErrors((e) => ({ ...e, tipos: undefined }))
  }

  const handleNext = () => {
    const next = {}
    if (value.tipos.length === 0) next.tipos = 'Selecciona al menos un tipo de propiedad'
    if (value.comunas.length === 0) next.comunas = 'Agrega al menos una comuna de interés'
    setErrors(next)
    if (Object.keys(next).length === 0) onNext()
  }

  return (
    <div>
      {/* Tipo de propiedad */}
      <fieldset>
        <legend className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
          Tipo de propiedad <span className="normal-case text-ivory/35">(una o varias)</span>
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIPOS.map(({ id, icon: Icon }) => {
            const selected = value.tipos.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleTipo(id)}
                aria-pressed={selected}
                className={`group relative flex flex-col items-center gap-2.5 rounded-2xl border px-3 py-5 text-sm transition-all duration-300 ${
                  selected
                    ? 'border-gold bg-gold/10 text-champagne shadow-gold-glow'
                    : 'border-white/10 bg-white/[0.03] text-ivory/65 hover:border-gold/40 hover:text-ivory'
                }`}
              >
                {selected && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                    <Check className="h-3 w-3 text-jade-deep" aria-hidden="true" />
                  </span>
                )}
                <Icon
                  className={`h-6 w-6 transition-colors ${selected ? 'text-gold' : 'text-ivory/40 group-hover:text-gold/70'}`}
                  aria-hidden="true"
                />
                {id}
              </button>
            )
          })}
        </div>
        {errors.tipos && (
          <p role="alert" className="mt-2 text-xs text-red-300">
            {errors.tipos}
          </p>
        )}
      </fieldset>

      {/* Comunas */}
      <div className="mt-8">
        <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
          Comuna(s) de interés
        </span>
        <MultiSelectComunas
          value={value.comunas}
          onChange={(comunas) => {
            onChange({ ...value, comunas })
            if (comunas.length > 0) setErrors((e) => ({ ...e, comunas: undefined }))
          }}
        />
        {errors.comunas && (
          <p role="alert" className="mt-2 text-xs text-red-300">
            {errors.comunas}
          </p>
        )}
      </div>

      {/* Presupuesto */}
      <div className="mt-10">
        <span className="mb-5 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
          Presupuesto de inversión (CLP)
        </span>
        <BudgetSlider
          value={value.presupuesto}
          onChange={(presupuesto) => onChange({ ...value, presupuesto })}
        />
      </div>

      <div className="mt-10 flex justify-between">
        <button type="button" onClick={onBack} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Atrás
        </button>
        <button type="button" onClick={handleNext} className="btn-gold">
          Siguiente
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

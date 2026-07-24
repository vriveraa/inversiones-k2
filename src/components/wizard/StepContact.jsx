import { useForm } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import { formatRut, validateRut } from '../../utils/rut.js'

/**
 * Etapa 1 — Datos de contacto.
 * Validación con react-hook-form: nombre, apellido, RUT chileno,
 * email y teléfono con prefijo +56.
 */
export default function StepContact({ defaultValues, onNext }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onTouched' })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" error={errors.nombre?.message}>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="Ej. Valentina"
            className={`input-dark ${errors.nombre ? 'input-error' : ''}`}
            aria-invalid={!!errors.nombre}
            {...register('nombre', {
              required: 'Ingresa tu nombre',
              minLength: { value: 2, message: 'Nombre demasiado corto' },
            })}
          />
        </Field>

        <Field label="Apellido" error={errors.apellido?.message}>
          <input
            type="text"
            autoComplete="family-name"
            placeholder="Ej. Rivera"
            className={`input-dark ${errors.apellido ? 'input-error' : ''}`}
            aria-invalid={!!errors.apellido}
            {...register('apellido', {
              required: 'Ingresa tu apellido',
              minLength: { value: 2, message: 'Apellido demasiado corto' },
            })}
          />
        </Field>

        <Field label="RUT" error={errors.rut?.message}>
          <input
            type="text"
            inputMode="text"
            placeholder="12.345.678-9"
            className={`input-dark ${errors.rut ? 'input-error' : ''}`}
            aria-invalid={!!errors.rut}
            {...register('rut', {
              required: 'Ingresa tu RUT',
              validate: (v) => validateRut(v) || 'RUT inválido — revisa el dígito verificador',
              onChange: (e) =>
                setValue('rut', formatRut(e.target.value), { shouldValidate: false }),
            })}
          />
        </Field>

        <Field label="Correo electrónico" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.cl"
            className={`input-dark ${errors.email ? 'input-error' : ''}`}
            aria-invalid={!!errors.email}
            {...register('email', {
              required: 'Ingresa tu correo',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                message: 'Correo inválido',
              },
            })}
          />
        </Field>

        <Field
          label="Número de teléfono"
          error={errors.telefono?.message}
          className="sm:col-span-2"
        >
          <div className="flex">
            <span className="flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/[0.07] px-4 text-sm font-medium text-champagne">
              +56
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9 1234 5678"
              className={`input-dark !rounded-l-none ${errors.telefono ? 'input-error' : ''}`}
              aria-invalid={!!errors.telefono}
              {...register('telefono', {
                required: 'Ingresa tu teléfono',
                validate: (v) =>
                  /^9\d{8}$/.test(v.replace(/\s/g, '')) ||
                  'Debe ser un celular chileno de 9 dígitos (comienza con 9)',
              })}
            />
          </div>
        </Field>
      </div>

      <div className="mt-9 flex justify-end">
        <button type="submit" className="btn-gold">
          Siguiente
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
        {label}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  )
}

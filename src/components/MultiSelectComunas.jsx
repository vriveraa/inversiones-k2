import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Search, X } from 'lucide-react'
import { COMUNAS } from '../data/comunas.js'

/**
 * Selector múltiple de comunas con buscador (autocomplete).
 * Las comunas elegidas se muestran como chips eliminables.
 */
export default function MultiSelectComunas({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const normalize = (s) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const q = normalize(query)
    return COMUNAS.filter(
      (c) => normalize(c).includes(q) && !value.includes(c),
    ).slice(0, 40)
  }, [query, value])

  const add = (comuna) => {
    onChange([...value, comuna])
    setQuery('')
    setHighlighted(0)
    inputRef.current?.focus()
  }

  const remove = (comuna) => onChange(value.filter((c) => c !== comuna))

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) {
      // Backspace con input vacío elimina el último chip
      if (e.key === 'Backspace' && query === '' && value.length > 0) {
        remove(value[value.length - 1])
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      add(results[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && query === '' && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="relative">
      {/* Chips seleccionados */}
      {value.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2" aria-label="Comunas seleccionadas">
          <AnimatePresence initial={false}>
            {value.map((comuna) => (
              <motion.li
                key={comuna}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 py-1.5 pl-3.5 pr-1.5 text-sm text-champagne"
              >
                {comuna}
                <button
                  type="button"
                  onClick={() => remove(comuna)}
                  aria-label={`Quitar ${comuna}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-gold/25"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/30"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="comunas-listbox"
          aria-autocomplete="list"
          className="input-dark !pl-11"
          placeholder="Busca y agrega comunas — ej. Providencia, Ñuñoa…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlighted(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id="comunas-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass absolute z-20 mt-2 max-h-64 w-full overflow-y-auto overscroll-contain !rounded-xl border-gold/25 shadow-premium"
          >
            {results.map((comuna, i) => (
              <li key={comuna} role="option" aria-selected={i === highlighted}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    add(comuna)
                  }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    i === highlighted ? 'bg-gold/15 text-champagne' : 'text-ivory/75'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gold/60" aria-hidden="true" />
                  {comuna}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

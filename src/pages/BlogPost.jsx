import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from 'lucide-react'
import Reveal, { EASE } from '../components/Reveal.jsx'
import { POSTS } from '../data/posts.js'

/**
 * Vista de detalle de artículo: /tu-asesor/:slug
 * Layout de lectura elegante sobre fondo marfil.
 */
export default function BlogPost() {
  const { slug } = useParams()
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) return <Navigate to="/tu-asesor" replace />

  return (
    <article className="bg-ivory">
      {/* Cabecera oscura */}
      <header className="relative overflow-hidden bg-gradient-to-b from-jade-deep via-navy to-navy pb-16 pt-36">
        <div className="bg-texture pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-gold/10 blur-[110px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-5 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Link
              to="/tu-asesor#blog"
              className="inline-flex items-center gap-2 text-sm text-ivory/60 transition-colors hover:text-champagne"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al blog
            </Link>

            <span className="mt-8 block">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
                {post.category}
              </span>
            </span>

            <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-ivory sm:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h1>

            <div className="mt-6 flex items-center gap-6 text-xs text-ivory/50">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readTime} de lectura
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Cuerpo de lectura */}
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="space-y-6"
        >
          {post.content.map((block, i) => {
            if (block.type === 'h2') {
              return (
                <h2 key={i} className="pt-4 font-display text-2xl font-semibold text-jade">
                  {block.text}
                </h2>
              )
            }
            if (block.type === 'img') {
              return (
                <figure key={i} className="pt-2">
                  <img
                    src={block.src}
                    alt={block.caption ?? ''}
                    loading="lazy"
                    className="w-full rounded-2xl border border-jade/10 object-cover shadow-premium"
                  />
                  {block.caption && (
                    <figcaption className="mt-3 text-center text-xs italic text-gray-400">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )
            }
            if (block.type === 'imgpair') {
              return (
                <div key={i} className="grid gap-4 pt-2 sm:grid-cols-2">
                  {block.items.map((im, j) => (
                    <figure key={j}>
                      <img
                        src={im.src}
                        alt={im.caption ?? ''}
                        loading="lazy"
                        className="aspect-[3/4] w-full rounded-2xl border border-jade/10 object-cover shadow-premium"
                      />
                      {im.caption && (
                        <figcaption className="mt-2 text-center text-xs italic text-gray-400">
                          {im.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )
            }
            if (block.type === 'numeros') {
              return (
                <div
                  key={i}
                  className="grid gap-px overflow-hidden rounded-2xl border border-jade/15 bg-jade/15 sm:grid-cols-2"
                >
                  {block.items.map((n, j) => (
                    <div
                      key={j}
                      className={`bg-ivory p-5 ${n.destacado ? 'sm:col-span-2' : ''}`}
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                        {n.label}
                      </p>
                      <p
                        className={`mt-1 font-display font-semibold ${
                          n.destacado ? 'text-3xl text-jade sm:text-4xl' : 'text-2xl text-jade'
                        }`}
                      >
                        {n.valor}
                      </p>
                      {n.nota && <p className="mt-1 text-xs text-gray-400">{n.nota}</p>}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <p key={i} className="text-base leading-[1.85] text-gray-600">
                {block.text}
              </p>
            )
          })}
        </motion.div>

        <div className="hairline mt-14" aria-hidden="true" />

        {/* CTA final del artículo */}
        <Reveal className="mt-12 rounded-2xl bg-gradient-to-br from-jade via-jade-deep to-navy p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-semibold text-ivory">
            ¿Quieres evaluar tu primera inversión en remate?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ivory/60">
            Agenda una llamada sin costo y revisemos juntos tu perfil y las
            oportunidades disponibles.
          </p>
          <Link to="/agendar" className="btn-gold mt-7">
            Agendar Asesoría
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </article>
  )
}

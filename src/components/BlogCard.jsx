import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, Newspaper } from 'lucide-react'

/**
 * Tarjeta de artículo del blog.
 * TODO: reemplazar el degradado por la imagen real del artículo
 * (mantener aspect-video para evitar saltos de layout).
 */
export default function BlogCard({ post }) {
  return (
    <article className="glass group flex h-full flex-col overflow-hidden !rounded-2xl transition-all duration-500 ease-luxe hover:-translate-y-2 hover:border-gold/50 hover:shadow-gold-glow">
      <Link
        to={`/tu-asesor/${post.slug}`}
        className="flex h-full flex-col"
        aria-label={`Leer artículo: ${post.title}`}
      >
        {/* Imagen del artículo (o degradado de respaldo) */}
        <div className="relative aspect-video overflow-hidden">
          {post.image ? (
            <img
              src={post.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-110"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${post.gradient} transition-transform duration-700 ease-luxe group-hover:scale-110`}
            >
              <div className="bg-texture absolute inset-0" aria-hidden="true" />
              <Newspaper
                className="absolute -bottom-5 -right-5 h-28 w-28 text-ivory/[0.07]"
                strokeWidth={1}
                aria-hidden="true"
              />
            </div>
          )}
          {/* Velado inferior para asentar la insignia de categoría */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-soft/70 via-transparent to-navy/20"
            aria-hidden="true"
          />
          <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-navy/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 text-[11px] text-ivory/45">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ivory transition-colors group-hover:text-champagne">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ivory/55">
            {post.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold">
            Leer más
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  )
}

// Edge Function: bloques horarios NO disponibles entre dos fechas.
//
// Ocupado = ya reservado en la base de datos  +  ocupado en el Outlook del asesor.
// Devuelve solo fecha y hora: ningún dato personal sale de aquí.
//
// POST { desde: 'YYYY-MM-DD', hasta: 'YYYY-MM-DD' }
//   -> { ocupados: ['2026-07-27|11:00', ...], calendarioOk: boolean }
//
// Deploy: supabase functions deploy disponibilidad --no-verify-jwt

import { CORS, json, db, SLOTS, DURACION_MIN, clave, inicioDelBloque, dias } from '../_shared/comun.ts'
import { ocupadosEnOutlook, graphConfigurado } from '../_shared/graph.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { desde, hasta } = await req.json()
    if (!desde || !hasta) return json({ error: 'Faltan las fechas' }, 400)

    const ocupados = new Set<string>()

    // 1) Reservas ya tomadas (confirmadas o pendientes de confirmar)
    const { data, error } = await db()
      .from('reservas')
      .select('fecha, hora')
      .gte('fecha', desde)
      .lte('fecha', hasta)

    if (error) throw error
    for (const r of data ?? []) ocupados.add(clave(r.fecha, r.hora))

    // 2) Compromisos del asesor en Outlook.
    //    Si falla, se degrada: se devuelve solo lo de la base y se avisa con
    //    `calendarioOk: false` en vez de romper el agendamiento.
    let calendarioOk = false
    if (graphConfigurado) {
      try {
        const intervalos = await ocupadosEnOutlook(desde, hasta)
        for (const dia of dias(desde, hasta)) {
          for (const hora of SLOTS) {
            const ini = inicioDelBloque(dia, hora)
            const fin = new Date(ini.getTime() + DURACION_MIN * 60_000)
            // El bloque se marca ocupado si se solapa con cualquier evento
            const choca = intervalos.some((e) => ini < e.fin && fin > e.inicio)
            if (choca) ocupados.add(clave(dia, hora))
          }
        }
        calendarioOk = true
      } catch (err) {
        console.error('[K2] No se pudo leer el calendario del asesor:', err)
      }
    }

    return json({ ocupados: [...ocupados], calendarioOk })
  } catch (err) {
    console.error('[K2] disponibilidad:', err)

    // Diagnóstico de puesta en marcha. Solo mensajes de error y NOMBRES de
    // variables — nunca sus valores, así no se filtra ningún secreto.
    const detalle =
      err instanceof Error ? err.message : JSON.stringify(err)?.slice(0, 400)
    const secretosPresentes = Object.keys(Deno.env.toObject())
      .filter((k) => /^(SUPABASE|RESEND|SITIO|ASESOR|FROM|MS)_/.test(k))
      .sort()

    return json(
      { error: 'Error al consultar disponibilidad', detalle, secretosPresentes },
      500,
    )
  }
})

# Inversiones K2 — Frontend

Web premium para asesoría en inversión de propiedades en remate judicial (Chile).

## Stack

- **React 18 + Vite** · **Tailwind CSS v4** · **Framer Motion** · **react-hook-form** · **lucide-react**
- Rutas: `/` (landing) · `/agendar` (wizard 3 pasos) · `/tu-asesor` (perfil + blog) · `/tu-asesor/:slug` (artículo)

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en /dist
```

## Assets

| Archivo | Descripción |
| --- | --- |
| `public/logo-k2-dark.png` | Logo en versión clara (marfil + dorado, fondo transparente). Es el que usan navbar y footer. |
| `public/logo-k2.png` | Logo original en verde, para contextos de fondo claro. |
| `public/asesor.png` | **TODO:** foto real del asesor (traje, fondo neutro). Mientras no exista, se muestra una silueta elegante. |

## Backend (Supabase)

Las reservas se guardan en Supabase y el asesor las gestiona en el panel privado `/admin`
(login + tabla de reuniones con estado y notas). Opcionalmente, se envía un correo al asesor
por cada reserva vía una Edge Function + Resend.

- Guía de configuración paso a paso: **[BACKEND.md](BACKEND.md)**
- Esquema de la base de datos y RLS: [supabase/schema.sql](supabase/schema.sql)
- Cliente y operaciones: [src/lib/supabase.js](src/lib/supabase.js) · [src/lib/reservas.js](src/lib/reservas.js)
- Función de correo: [supabase/functions/nueva-reserva/index.ts](supabase/functions/nueva-reserva/index.ts)

Sin las llaves de Supabase (`.env`), el sitio público funciona igual y `/admin` muestra un
aviso de "panel no configurado". Copia `.env.example` a `.env` para activarlo.

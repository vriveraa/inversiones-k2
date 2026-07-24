# Backend — Guía de configuración (Inversiones K2)

Estado actual: **la base de datos y el panel del asesor ya funcionan**. Falta activar los
correos automáticos, la confirmación del cliente y la sincronía con el calendario del asesor.

---

## Cómo funciona el flujo completo

```
Cliente agenda en la web
   │
   ├─ La web pregunta a `disponibilidad`  →  bloques ocupados = reservas + Outlook del asesor
   │
   ├─ Confirma  →  Edge Function `reservar`
   │                 · valida todo en el servidor
   │                 · guarda la reserva SIN confirmar (cupo retenido 24 h)
   │                 · envía correo al cliente con el botón "Confirmar mi asesoría"
   │
   └─ Cliente hace clic  →  Edge Function `confirmar`
                             · marca la reserva como confirmada
                             · crea el evento en el Outlook del asesor (cliente invitado)
                             · envía comprobante al cliente (con archivo .ics)
                             · avisa al asesor por correo

Si el cliente NO confirma en 24 h, un job automático borra la reserva y libera el horario.
```

---

## Modo actual: SIMPLE (agendar funciona hoy)

La web está en **modo simple**: al agendar, la reserva se guarda directo en la base y el
asesor la ve en `/admin`. **Sin** correos, confirmación ni calendario todavía.

El interruptor está en la primera línea de código de
[`src/lib/reservas.js`](src/lib/reservas.js):

```js
const MODO = 'directo'   // ← 'directo' (hoy) | 'edge' (sistema completo)
```

Cuando termines los pasos de abajo (dominio, Resend, Outlook, migración y desplegar las
funciones), cambia esa línea a `const MODO = 'edge'`, y se activa el flujo completo: correo de
confirmación al cliente, confirmación con un clic y sincronía con el Outlook del asesor.

---

## YA HECHO ✅

- Proyecto Supabase creado, tabla `reservas`, RLS y permisos
- Reglas de agenda: horario único · no agendar hoy · un cliente una reunión
- Panel `/admin` con login
- Llaves en `.env`

## PASO 1 — Aplicar la migración de base de datos

Pega el contenido de
[`supabase/migracion-confirmacion-y-calendario.sql`](supabase/migracion-confirmacion-y-calendario.sql)
en **SQL Editor → New query → Run**.

Al final muestra una verificación. Debe decir: `columnas_nuevas = 4`, `job_limpieza = 1`,
`anon_puede_insertar = false`.

> ⚠️ Después de este paso la web **dejará de agendar** hasta que despliegues las Edge
> Functions (paso 5), porque el visitante ya no puede insertar directo. Es lo esperado.

## PASO 2 — Comprar el dominio

Compra el dominio (ej. `inversionesk2.cl`) en NIC Chile, Namecheap, Cloudflare o similar
(~USD 10-15/año). **Es el único costo real del proyecto** y es requisito para poder escribirle
correos a los clientes.

## PASO 3 — Resend (correos)

1. Crea cuenta en <https://resend.com> (Free: 3.000 correos/mes).
2. **Domains → Add Domain** → escribe tu dominio → Resend te da unos registros DNS
   (SPF, DKIM). Cópialos en el panel de tu proveedor de dominio.
3. Espera la verificación (de minutos a algunas horas).
4. **API Keys → Create** → copia la key.

## PASO 4 — Outlook del asesor (Microsoft Graph)

1. Entra a <https://portal.azure.com> → **Microsoft Entra ID → App registrations → New registration**
   - Nombre: `Inversiones K2 Agenda`
   - Tipos de cuenta: **Cuentas en cualquier directorio organizativo y cuentas personales de Microsoft**
   - Redirect URI: tipo *Web* → `http://localhost:5173/oauth`
   - Anota el **Application (client) ID**
2. **Certificates & secrets → New client secret** → copia el *Value* (solo se ve una vez).
3. **API permissions → Add → Microsoft Graph → Delegated**: agrega `Calendars.ReadWrite`,
   `offline_access` y `User.Read`. Luego **Grant admin consent** si el botón está disponible.
4. **Autorización única del asesor.** Abre esta URL en el navegador *con la sesión del asesor*
   (reemplaza `TU_CLIENT_ID`):

   ```
   https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=TU_CLIENT_ID&response_type=code&redirect_uri=http://localhost:5173/oauth&response_mode=query&scope=offline_access%20Calendars.ReadWrite%20User.Read
   ```

   Acepta los permisos. El navegador te redirige a una URL que contiene `?code=XXXX`.
   **Copia ese `code`** (es de un solo uso y dura pocos minutos).

5. Canjéalo por el *refresh token* ejecutando en tu terminal (reemplaza los tres valores):

   ```bash
   curl -X POST https://login.microsoftonline.com/common/oauth2/v2.0/token -d "client_id=TU_CLIENT_ID" -d "client_secret=TU_CLIENT_SECRET" -d "code=EL_CODE" -d "grant_type=authorization_code" -d "redirect_uri=http://localhost:5173/oauth"
   ```

   De la respuesta guarda el campo **`refresh_token`**.

## PASO 5 — Desplegar las Edge Functions

Requiere la [CLI de Supabase](https://supabase.com/docs/guides/cli).

```bash
supabase login
supabase link --project-ref xfynvngjwqlkifmpocvh
```

Carga los secretos (reemplaza cada valor):

```bash
supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Inversiones K2 <reservas@inversionesk2.cl>" ASESOR_EMAIL=asesor@inversionesk2.cl SITIO_URL=https://inversionesk2.cl MS_CLIENT_ID=xxx MS_CLIENT_SECRET=xxx MS_REFRESH_TOKEN=xxx
```

Despliega las tres funciones:

```bash
supabase functions deploy disponibilidad --no-verify-jwt
```
```bash
supabase functions deploy reservar --no-verify-jwt
```
```bash
supabase functions deploy confirmar --no-verify-jwt
```

## PASO 6 — Publicar la web

**Ya no es opcional:** el enlace de confirmación del correo necesita una URL pública real.

1. Sube el proyecto a GitHub e impórtalo en <https://vercel.com> (plan gratuito).
2. En Vercel, agrega las variables de entorno:
   - `VITE_SUPABASE_URL=https://xfynvngjwqlkifmpocvh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=` *(ver `CREDENCIALES.md`)*
3. Conecta tu dominio en **Settings → Domains**.
4. Asegúrate de que `SITIO_URL` (paso 5) apunte a ese dominio.

---

## Variables y secretos — resumen

| Dónde | Nombre | Para qué |
|---|---|---|
| `.env` y Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | La web habla con Supabase |
| Supabase secrets | `RESEND_API_KEY`, `FROM_EMAIL`, `ASESOR_EMAIL` | Envío de correos |
| Supabase secrets | `SITIO_URL` | Construir el enlace de confirmación |
| Supabase secrets | `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_REFRESH_TOKEN` | Calendario Outlook |

---

## Cómo probar que todo quedó bien

1. **Calendario:** crea un evento de prueba en el Outlook del asesor mañana a las 11:00 →
   entra a `/agendar` → ese bloque debe aparecer **tachado**. Bórralo → vuelve a estar libre.
2. **Reserva:** agenda con tu correo → te llega *"Confirma tu asesoría"*; en `/admin` aparece
   con el distintivo **Por confirmar**; el asesor todavía **no** recibe nada.
3. **Confirmación:** haz clic en el botón del correo → página de éxito → el evento aparece en
   el Outlook del asesor contigo invitado → llegan los dos correos finales.
4. **Vencimiento:** en SQL Editor, `update reservas set expira_at = now() - interval '1 hour'
   where not confirmada;` → espera el ciclo de 15 min → la fila desaparece y el horario vuelve
   a ofrecerse.

## Si algo falla

Los logs de cada función están en
**Supabase → Edge Functions → (nombre) → Logs**. Todos los errores se registran con el
prefijo `[K2]`.

**Degradación elegante:** si Outlook no responde, la web **sigue agendando** usando solo la
base de datos (podría ofrecer un horario que choque, pero nunca se cae). Si Resend falla, la
reserva igual se guarda y la web le avisa al cliente que escriba por correo.

---

## Costos

| Servicio | Plan | Costo |
|---|---|---|
| Dominio | — | ~USD 10-15/año |
| Supabase · Resend · Microsoft Graph · Vercel | Free | $0 |

> El proyecto free de Supabase se pausa tras ~7 días sin actividad y se reactiva con tráfico.

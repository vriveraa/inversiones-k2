-- ============================================================================
-- Inversiones K2 — Formulario 2 de calificación (segundo paso del embudo)
-- Ejecutar en la base remota:
--   npx.cmd supabase@latest db query --linked "$(cat supabase/migracion-calificacion.sql)"
-- (Es idempotente: se puede volver a ejecutar sin romper nada.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Token privado por lead: da acceso de un solo uso al Formulario 2.
--    lead_id apunta a la reserva (lead) creada por el Formulario 1.
-- ---------------------------------------------------------------------------
create table if not exists public.calificacion_tokens (
  token       uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.reservas (id) on delete cascade,
  used        boolean not null default false,
  expires_at  timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now()
);

create index if not exists calificacion_tokens_lead_idx on public.calificacion_tokens (lead_id);

-- ---------------------------------------------------------------------------
-- 2. Respuesta del formulario, enlazada al lead. Una fila por envío.
-- ---------------------------------------------------------------------------
create table if not exists public.calificaciones (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid not null references public.reservas (id) on delete cascade,
  created_at           timestamptz not null default now(),
  -- Respuestas
  presupuesto_maximo   bigint not null,
  presupuesto_unidad   text   not null,          -- 'CLP' | 'UF'
  presupuesto_clp      bigint not null,          -- normalizado a CLP
  comunas              text[] not null default '{}',
  plazo                text   not null,
  fondos               text   not null,
  experiencia          text   not null,
  disposicion_mandato  text   not null,
  comentarios          text,
  -- Resultado
  puntaje_total        int    not null,
  clasificacion        text   not null,          -- 'activo' | 'nurture' | 'cierre'
  revisar_presupuesto  boolean not null default false
);

create index if not exists calificaciones_lead_idx on public.calificaciones (lead_id);

-- ---------------------------------------------------------------------------
-- 3. Marcas en el lead (tabla reservas) según la calificación.
-- ---------------------------------------------------------------------------
alter table public.reservas add column if not exists clasificacion text;
alter table public.reservas add column if not exists lista_mensual boolean not null default false;

-- ---------------------------------------------------------------------------
-- 4. Permisos + RLS (mismo criterio que el resto: el navegador NO toca las
--    tablas; todo pasa por Edge Functions con la service role). El asesor
--    autenticado puede leer las calificaciones y generar tokens desde /admin.
-- ---------------------------------------------------------------------------
revoke all on public.calificacion_tokens from anon, authenticated;
revoke all on public.calificaciones     from anon, authenticated;

-- Las Edge Functions usan la service role: necesita permisos explícitos
-- (este proyecto NO expone tablas nuevas automáticamente).
grant all on public.calificacion_tokens to service_role;
grant all on public.calificaciones     to service_role;

grant select, insert on public.calificacion_tokens to authenticated; -- generar link desde /admin
grant select on public.calificaciones to authenticated;              -- ver respuestas en /admin

alter table public.calificacion_tokens enable row level security;
alter table public.calificaciones     enable row level security;

drop policy if exists "asesor lee tokens" on public.calificacion_tokens;
create policy "asesor lee tokens" on public.calificacion_tokens
  for select to authenticated using (true);

drop policy if exists "asesor crea tokens" on public.calificacion_tokens;
create policy "asesor crea tokens" on public.calificacion_tokens
  for insert to authenticated with check (true);

drop policy if exists "asesor lee calificaciones" on public.calificaciones;
create policy "asesor lee calificaciones" on public.calificaciones
  for select to authenticated using (true);

-- ============================================================================
-- Inversiones K2 — Esquema de reservas, seguridad (RLS) y reglas de agenda
-- Ejecutar en: Supabase -> SQL Editor -> New query -> Run
-- (Es idempotente: se puede volver a ejecutar sin romper nada.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla: una fila = una reunión + el interés del cliente
-- ---------------------------------------------------------------------------
create table if not exists public.reservas (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  -- Contacto
  nombre           text not null,
  apellido         text not null,
  rut              text not null,
  email            text not null,
  telefono         text not null,
  -- Interés de inversión
  tipos            text[] not null default '{}',
  comunas          text[] not null default '{}',
  presupuesto_min  bigint not null,
  presupuesto_max  bigint not null,
  -- Reunión
  fecha            date not null,
  hora             text not null,
  -- Gestión del asesor
  estado           text not null default 'pendiente',
  notas            text
);

create index if not exists reservas_fecha_idx on public.reservas (fecha);

-- REGLA 1: un bloque horario solo puede estar tomado una vez.
-- Esta restricción es la garantía real: aunque dos personas confirmen en el
-- mismo instante, la base impide que ambas queden a la misma hora.
alter table public.reservas drop constraint if exists reservas_slot_unico;
alter table public.reservas add constraint reservas_slot_unico unique (fecha, hora);

-- Estados válidos del seguimiento del asesor (mini CRM):
-- pendiente -> contactado -> realizada -> cliente | descartado
alter table public.reservas drop constraint if exists reservas_estado_valido;
alter table public.reservas add constraint reservas_estado_valido
  check (estado in ('pendiente', 'contactado', 'realizada', 'cliente', 'descartado'));

-- ---------------------------------------------------------------------------
-- 1b. Confirmación del cliente por correo
--     El cliente recibe un enlace con `token` y confirma con un clic. Mientras
--     no confirme, el cupo queda retenido hasta `expira_at`; después se libera.
-- ---------------------------------------------------------------------------
alter table public.reservas add column if not exists confirmada boolean not null default false;
alter table public.reservas add column if not exists token uuid not null default gen_random_uuid();
alter table public.reservas add column if not exists expira_at timestamptz;
alter table public.reservas add column if not exists evento_outlook_id text;

create index if not exists reservas_token_idx on public.reservas (token);
create index if not exists reservas_expira_idx on public.reservas (expira_at) where not confirmada;

-- ---------------------------------------------------------------------------
-- 2. Permisos de la Data API + Row Level Security
--    Doble candado: los GRANT definen qué puede hacer cada rol a nivel de
--    tabla, y las policies de RLS definen sobre qué filas. El visitante
--    anónimo ni siquiera tiene permiso de SELECT: solo puede insertar.
--    (Necesario si NO marcaste "Automatically expose new tables" al crear
--     el proyecto, que es lo recomendado.)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- El visitante anónimo NO toca la tabla: todo pasa por las Edge Functions
-- (`reservar`, `confirmar`, `disponibilidad`), que usan la service role.
revoke all on public.reservas from anon, authenticated;
grant select, update on public.reservas to authenticated;

alter table public.reservas enable row level security;

-- Política antigua (cuando el navegador insertaba directo). Ya no aplica.
drop policy if exists "anon puede insertar reservas" on public.reservas;

-- El asesor autenticado puede LEER todas las reservas.
drop policy if exists "asesor puede leer reservas" on public.reservas;
create policy "asesor puede leer reservas"
  on public.reservas for select to authenticated using (true);

-- El asesor autenticado puede ACTUALIZAR (estado y notas).
drop policy if exists "asesor puede actualizar reservas" on public.reservas;
create policy "asesor puede actualizar reservas"
  on public.reservas for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 3. Reglas de agenda (validación en el servidor, no solo en la web)
--    REGLA 2: no se puede agendar para hoy ni para fechas pasadas.
--    REGLA 3: un mismo cliente (RUT o correo) no puede tener dos reuniones
--             futuras al mismo tiempo.
-- ---------------------------------------------------------------------------
create or replace function public.validar_reserva()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.fecha <= current_date then
    raise exception 'FECHA_INVALIDA';
  end if;

  if exists (
    select 1 from public.reservas r
    where r.fecha >= current_date
      and (r.rut = new.rut or lower(r.email) = lower(new.email))
  ) then
    raise exception 'CLIENTE_YA_TIENE_RESERVA';
  end if;

  return new;
end;
$$;

drop trigger if exists reservas_validar on public.reservas;
create trigger reservas_validar
  before insert on public.reservas
  for each row execute function public.validar_reserva();

-- ---------------------------------------------------------------------------
-- 4. Horarios ocupados para el calendario público
--    Devuelve SOLO fecha y hora (ningún dato personal), para que el visitante
--    pueda ver qué bloques ya están tomados sin poder leer las reservas.
-- ---------------------------------------------------------------------------
create or replace function public.horarios_ocupados(desde date, hasta date)
returns table (fecha date, hora text)
language sql
security definer
stable
set search_path = public
as $$
  select r.fecha, r.hora
  from public.reservas r
  where r.fecha between desde and hasta;
$$;

-- Solo el asesor autenticado; el visitante consulta vía la Edge Function
-- `disponibilidad`, que además cruza con el calendario Outlook del asesor.
revoke execute on function public.horarios_ocupados(date, date) from anon;
grant execute on function public.horarios_ocupados(date, date) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Liberación automática de cupos no confirmados
--    Si el cliente no confirma antes de `expira_at`, la reserva se borra y su
--    bloque vuelve a estar disponible. Hay que BORRAR (no solo marcar) porque
--    la restricción `reservas_slot_unico` mantendría el horario tomado.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('liberar-reservas-vencidas');
exception
  when others then null; -- no existía todavía
end
$$;

select cron.schedule(
  'liberar-reservas-vencidas',
  '*/15 * * * *',
  $$delete from public.reservas
     where not confirmada
       and expira_at is not null
       and expira_at < now()$$
);

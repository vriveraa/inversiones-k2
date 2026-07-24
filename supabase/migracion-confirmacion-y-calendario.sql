-- ============================================================================
-- Inversiones K2 — Migración: confirmación del cliente + Edge Functions
-- Pegar completo en: Supabase -> SQL Editor -> New query -> Run
-- Es idempotente: se puede volver a ejecutar sin romper nada.
-- ============================================================================

-- 1) Columnas para la confirmación por correo -------------------------------
alter table public.reservas add column if not exists confirmada boolean not null default false;
alter table public.reservas add column if not exists token uuid not null default gen_random_uuid();
alter table public.reservas add column if not exists expira_at timestamptz;
alter table public.reservas add column if not exists evento_outlook_id text;

create index if not exists reservas_token_idx on public.reservas (token);
create index if not exists reservas_expira_idx on public.reservas (expira_at) where not confirmada;

-- 2) Estados del seguimiento del asesor -------------------------------------
alter table public.reservas drop constraint if exists reservas_estado_valido;
alter table public.reservas add constraint reservas_estado_valido
  check (estado in ('pendiente', 'contactado', 'realizada', 'cliente', 'descartado'));

-- 3) El visitante ya no toca la tabla ---------------------------------------
--    Ahora todo pasa por las Edge Functions (reservar / confirmar /
--    disponibilidad), que usan la service role. Queda más cerrado que antes.
revoke all on public.reservas from anon;
drop policy if exists "anon puede insertar reservas" on public.reservas;
revoke execute on function public.horarios_ocupados(date, date) from anon;

-- 4) Liberación automática de cupos no confirmados --------------------------
--    Hay que BORRAR (no solo marcar) porque la restricción reservas_slot_unico
--    mantendría el horario tomado para siempre.
create extension if not exists pg_cron;

do $limpieza$
begin
  perform cron.unschedule('liberar-reservas-vencidas');
exception
  when others then null; -- todavía no existía
end
$limpieza$;

select cron.schedule(
  'liberar-reservas-vencidas',
  '*/15 * * * *',
  $tarea$delete from public.reservas
          where not confirmada
            and expira_at is not null
            and expira_at < now()$tarea$
);

-- 5) Verificación ------------------------------------------------------------
select
  (select count(*) from information_schema.columns
    where table_name = 'reservas'
      and column_name in ('confirmada','token','expira_at','evento_outlook_id')) as columnas_nuevas,
  (select count(*) from cron.job where jobname = 'liberar-reservas-vencidas') as job_limpieza,
  (select has_table_privilege('anon', 'public.reservas', 'INSERT')) as anon_puede_insertar;
-- Esperado: columnas_nuevas = 4 · job_limpieza = 1 · anon_puede_insertar = false

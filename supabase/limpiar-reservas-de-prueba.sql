-- ============================================================================
-- Limpieza de reservas de prueba — Inversiones K2
-- Ejecutar cuando el SQL Editor de Supabase vuelva a funcionar
-- (o desde otra sesión del navegador si sigue colgado).
-- ============================================================================

-- 1) Primero MIRA qué hay en la tabla (para no borrar algo real por error):
select id, nombre, apellido, email, fecha, hora, created_at
from public.reservas
order by created_at desc;

-- 2) Borra la reserva de prueba que dejó la verificación del sistema:
delete from public.reservas where email = 'prueba.simple@correo.cl';

-- 3) Si la reserva del 2026-07-24 a las 12:00 también es de prueba, bórrala.
--    (Revísala en el paso 1: si es un cliente real, NO la borres.)
-- delete from public.reservas where fecha = '2026-07-24' and hora = '12:00';

-- 4) Verifica que quedó limpia:
select count(*) as reservas_restantes from public.reservas;

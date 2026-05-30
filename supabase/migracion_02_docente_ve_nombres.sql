-- =============================================================================
-- Migración 02 — Permitir que los DOCENTES vean los nombres de los usuarios
-- Ejecuta este archivo en el SQL Editor de Supabase (una sola vez).
-- =============================================================================
-- Problema: la política original solo dejaba al admin (o al propio usuario)
-- leer la tabla `usuarios`. Por eso el docente veía el nombre del estudiante
-- como "—" al calificar. Esta migración amplía la lectura a 'docente'.

drop policy if exists "usuarios: ver propio perfil o admin" on public.usuarios;

create policy "usuarios: ver propio o staff"
  on public.usuarios for select
  using (id = auth.uid() or public.rol_actual() in ('admin', 'docente'));

-- =============================================================================
-- Sistema de Gestión Académica — Datos de ejemplo (seed)
-- =============================================================================
-- Ejecuta este archivo DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- Los datos académicos (Parte 1) se cargan solos.
-- Los usuarios demo (Parte 2) requieren 1 paso manual en el panel de Supabase.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PARTE 1 — Datos académicos (se ejecuta directo)
-- -----------------------------------------------------------------------------

-- Carrera
insert into public.carreras (nombre, codigo, duracion_ciclos)
values ('Ingeniería de Software', 'ISW', 10)
on conflict (codigo) do nothing;

-- Ciclo académico activo
insert into public.ciclos_academicos (nombre, fecha_inicio, fecha_fin, activo)
values ('Primer ciclo 2026', '2026-02-01', '2026-06-14', true)
on conflict do nothing;

-- Cursos del pensum (Ingeniería de Software)
insert into public.cursos (nombre, codigo, creditos, ciclo_pensum, carrera_id)
select v.nombre, v.codigo, v.creditos, v.ciclo, c.id
from (values
  ('Cálculo Diferencial',      'MAT101', 4, 1),
  ('Algoritmos y Programación','PRO101', 5, 1),
  ('Comunicación Efectiva',    'HUM101', 3, 1),
  ('Cálculo Integral',         'MAT201', 4, 2),
  ('Física Mecánica',          'FIS101', 4, 2),
  ('Programación Orientada a Objetos', 'PRO201', 5, 2),
  ('Estadística Inferencial',  'EST301', 4, 3),
  ('Estructuras de Datos',     'CS301',  5, 3)
) as v(nombre, codigo, creditos, ciclo)
cross join public.carreras c
where c.codigo = 'ISW'
on conflict (codigo) do nothing;

-- Prerrequisitos (curso -> prerrequisito)
insert into public.prerrequisitos (curso_id, prerrequisito_id)
select a.id, b.id
from (values
  ('MAT201', 'MAT101'),
  ('FIS101', 'MAT101'),
  ('PRO201', 'PRO101'),
  ('EST301', 'MAT201'),
  ('CS301',  'PRO201')
) as v(curso, prereq)
join public.cursos a on a.codigo = v.curso
join public.cursos b on b.codigo = v.prereq
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- PARTE 2 — Usuarios demo (1 paso manual + 1 ejecución SQL)
-- -----------------------------------------------------------------------------
--
-- PASO MANUAL (en el panel de Supabase):
--   Authentication -> Users -> "Add user" -> "Create new user".
--   Crea estos 3 usuarios y MARCA la casilla "Auto Confirm User":
--
--     Email: admin@demo.com        Password: Demo1234!
--     Email: docente@demo.com      Password: Demo1234!
--     Email: estudiante@demo.com   Password: Demo1234!
--
--   (Al crearse, un trigger les genera automáticamente su perfil en `usuarios`
--    con rol 'estudiante' por defecto.)
--
-- LUEGO ejecuta el bloque de abajo para asignar roles y crear los registros
-- de estudiante/docente. Es seguro re-ejecutarlo.
-- -----------------------------------------------------------------------------

-- Asignar roles y nombres
update public.usuarios set rol = 'admin',    nombre = 'Administrador Demo' where email = 'admin@demo.com';
update public.usuarios set rol = 'docente',  nombre = 'Docente Demo'       where email = 'docente@demo.com';
update public.usuarios set rol = 'estudiante', nombre = 'Estudiante Demo'  where email = 'estudiante@demo.com';

-- Perfil de docente
insert into public.docentes (usuario_id, especialidad)
select u.id, 'Ingeniería de Software'
from public.usuarios u
where u.email = 'docente@demo.com'
  and not exists (select 1 from public.docentes d where d.usuario_id = u.id);

-- Perfil de estudiante (carnet único + carrera ISW)
insert into public.estudiantes (usuario_id, carnet, carrera_id, ciclo_ingreso)
select u.id, 'ISW2026001', c.id, 2026
from public.usuarios u
cross join public.carreras c
where u.email = 'estudiante@demo.com'
  and c.codigo = 'ISW'
  and not exists (select 1 from public.estudiantes e where e.usuario_id = u.id);

-- =============================================================================
-- Listo. Credenciales demo: admin@demo.com / docente@demo.com / estudiante@demo.com
-- Contraseña: Demo1234!
-- =============================================================================

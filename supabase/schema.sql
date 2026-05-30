-- =============================================================================
-- Sistema de Gestión Académica — Esquema de base de datos (Supabase / PostgreSQL)
-- =============================================================================
-- Cómo usarlo:
--   1. Supabase -> SQL Editor -> New query.
--   2. Pega TODO este archivo y ejecútalo (Run).
--   3. Luego ejecuta supabase/seed.sql para cargar datos de ejemplo y usuarios demo.
--
-- Escala de notas: zona1 (0-30) + zona2 (0-30) + examen_final (0-40) = nota_final (0-100).
-- Se aprueba con nota_final >= 61. (nota_final y aprobado se calculan automáticamente.)
-- =============================================================================

-- Extensión para gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
do $$ begin
  create type rol_usuario as enum ('admin', 'docente', 'estudiante');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_inscripcion as enum ('pendiente', 'aprobada', 'cancelada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_constancia as enum ('inscripcion', 'notas');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Tabla: usuarios  (perfil ligado a auth.users de Supabase)
-- -----------------------------------------------------------------------------
create table if not exists public.usuarios (
  id            uuid primary key references auth.users (id) on delete cascade,
  nombre        varchar(100) not null,
  email         varchar(150) not null unique,
  rol           rol_usuario  not null default 'estudiante',
  activo        boolean      not null default true,
  created_at    timestamptz  not null default now()
);

-- -----------------------------------------------------------------------------
-- Tabla: carreras
-- -----------------------------------------------------------------------------
create table if not exists public.carreras (
  id              uuid primary key default gen_random_uuid(),
  nombre          varchar(150) not null unique,
  codigo          varchar(10)  not null unique,
  duracion_ciclos integer      not null check (duracion_ciclos > 0)
);

-- -----------------------------------------------------------------------------
-- Tabla: estudiantes
-- -----------------------------------------------------------------------------
create table if not exists public.estudiantes (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references public.usuarios (id) on delete cascade,
  carnet        varchar(20) not null unique,
  carrera_id    uuid not null references public.carreras (id),
  ciclo_ingreso integer not null
);

-- -----------------------------------------------------------------------------
-- Tabla: docentes
-- -----------------------------------------------------------------------------
create table if not exists public.docentes (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid not null references public.usuarios (id) on delete cascade,
  especialidad varchar(100)
);

-- -----------------------------------------------------------------------------
-- Tabla: cursos
-- -----------------------------------------------------------------------------
create table if not exists public.cursos (
  id            uuid primary key default gen_random_uuid(),
  nombre        varchar(150) not null,
  codigo        varchar(10)  not null unique,
  creditos      integer      not null check (creditos > 0),
  ciclo_pensum  integer      not null,
  carrera_id    uuid not null references public.carreras (id) on delete cascade,
  docente_id    uuid references public.docentes (id) on delete set null
);

-- -----------------------------------------------------------------------------
-- Tabla: prerrequisitos  (curso_id requiere haber aprobado prerrequisito_id)
-- -----------------------------------------------------------------------------
create table if not exists public.prerrequisitos (
  curso_id        uuid not null references public.cursos (id) on delete cascade,
  prerrequisito_id uuid not null references public.cursos (id) on delete cascade,
  primary key (curso_id, prerrequisito_id),
  check (curso_id <> prerrequisito_id)
);

-- -----------------------------------------------------------------------------
-- Tabla: ciclos_academicos
-- -----------------------------------------------------------------------------
create table if not exists public.ciclos_academicos (
  id           uuid primary key default gen_random_uuid(),
  nombre       varchar(50) not null,
  fecha_inicio date not null,
  fecha_fin    date not null,
  activo       boolean not null default false,
  check (fecha_fin > fecha_inicio)
);

-- -----------------------------------------------------------------------------
-- Tabla: inscripciones
-- -----------------------------------------------------------------------------
create table if not exists public.inscripciones (
  id                uuid primary key default gen_random_uuid(),
  estudiante_id     uuid not null references public.estudiantes (id) on delete cascade,
  curso_id          uuid not null references public.cursos (id) on delete cascade,
  ciclo_id          uuid not null references public.ciclos_academicos (id) on delete cascade,
  estado            estado_inscripcion not null default 'pendiente',
  fecha_inscripcion timestamptz not null default now(),
  unique (estudiante_id, curso_id, ciclo_id)
);

-- -----------------------------------------------------------------------------
-- Tabla: calificaciones  (nota_final y aprobado se calculan solos)
-- -----------------------------------------------------------------------------
create table if not exists public.calificaciones (
  id            uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null unique references public.inscripciones (id) on delete cascade,
  zona1         numeric(5,2) check (zona1 between 0 and 30),
  zona2         numeric(5,2) check (zona2 between 0 and 30),
  examen_final  numeric(5,2) check (examen_final between 0 and 40),
  nota_final    numeric(5,2) generated always as
                  (coalesce(zona1,0) + coalesce(zona2,0) + coalesce(examen_final,0)) stored,
  aprobado      boolean generated always as
                  ((coalesce(zona1,0) + coalesce(zona2,0) + coalesce(examen_final,0)) >= 61) stored
);

-- -----------------------------------------------------------------------------
-- Tabla: constancias
-- -----------------------------------------------------------------------------
create table if not exists public.constancias (
  id                uuid primary key default gen_random_uuid(),
  estudiante_id     uuid not null references public.estudiantes (id) on delete cascade,
  tipo              tipo_constancia not null,
  ciclo_id          uuid not null references public.ciclos_academicos (id) on delete cascade,
  fecha_generacion  timestamptz not null default now(),
  url_pdf           varchar(255)
);

-- -----------------------------------------------------------------------------
-- Índices principales (además de los UNIQUE/PK ya definidos)
-- -----------------------------------------------------------------------------
create index if not exists idx_estudiantes_usuario      on public.estudiantes (usuario_id);
create index if not exists idx_docentes_usuario          on public.docentes (usuario_id);
create index if not exists idx_cursos_carrera            on public.cursos (carrera_id);
create index if not exists idx_inscripciones_est_ciclo   on public.inscripciones (estudiante_id, ciclo_id);
create index if not exists idx_inscripciones_curso_ciclo on public.inscripciones (curso_id, ciclo_id);
create index if not exists idx_calificaciones_inscripcion on public.calificaciones (inscripcion_id);

-- =============================================================================
-- Función auxiliar: rol del usuario autenticado
-- =============================================================================
create or replace function public.rol_actual()
returns rol_usuario
language sql
security definer
set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

-- =============================================================================
-- Trigger: al registrarse un usuario en Auth, crear su perfil en `usuarios`
-- El rol y el nombre se leen de los metadatos del usuario (raw_user_meta_data).
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'rol')::rol_usuario, 'estudiante')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
alter table public.usuarios          enable row level security;
alter table public.carreras          enable row level security;
alter table public.estudiantes       enable row level security;
alter table public.docentes          enable row level security;
alter table public.cursos            enable row level security;
alter table public.prerrequisitos    enable row level security;
alter table public.ciclos_academicos enable row level security;
alter table public.inscripciones     enable row level security;
alter table public.calificaciones    enable row level security;
alter table public.constancias       enable row level security;

-- --- usuarios -----------------------------------------------------------------
create policy "usuarios: ver propio perfil o admin"
  on public.usuarios for select using (id = auth.uid() or public.rol_actual() = 'admin');
create policy "usuarios: admin gestiona"
  on public.usuarios for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- --- catálogos de solo lectura para autenticados, escritura solo admin --------
-- carreras
create policy "carreras: lectura autenticada"
  on public.carreras for select using (auth.uid() is not null);
create policy "carreras: admin escribe"
  on public.carreras for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');
-- cursos
create policy "cursos: lectura autenticada"
  on public.cursos for select using (auth.uid() is not null);
create policy "cursos: admin escribe"
  on public.cursos for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');
-- prerrequisitos
create policy "prerrequisitos: lectura autenticada"
  on public.prerrequisitos for select using (auth.uid() is not null);
create policy "prerrequisitos: admin escribe"
  on public.prerrequisitos for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');
-- ciclos_academicos
create policy "ciclos: lectura autenticada"
  on public.ciclos_academicos for select using (auth.uid() is not null);
create policy "ciclos: admin escribe"
  on public.ciclos_academicos for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- --- estudiantes --------------------------------------------------------------
create policy "estudiantes: ver propio o staff"
  on public.estudiantes for select
  using (usuario_id = auth.uid() or public.rol_actual() in ('admin', 'docente'));
create policy "estudiantes: admin gestiona"
  on public.estudiantes for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- --- docentes -----------------------------------------------------------------
create policy "docentes: ver propio o staff"
  on public.docentes for select
  using (usuario_id = auth.uid() or public.rol_actual() in ('admin', 'docente'));
create policy "docentes: admin gestiona"
  on public.docentes for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- --- inscripciones ------------------------------------------------------------
create policy "inscripciones: estudiante ve las suyas o staff"
  on public.inscripciones for select
  using (
    public.rol_actual() in ('admin', 'docente')
    or estudiante_id in (select id from public.estudiantes where usuario_id = auth.uid())
  );
create policy "inscripciones: estudiante crea las suyas"
  on public.inscripciones for insert
  with check (estudiante_id in (select id from public.estudiantes where usuario_id = auth.uid()));
create policy "inscripciones: estudiante cancela las suyas"
  on public.inscripciones for update
  using (estudiante_id in (select id from public.estudiantes where usuario_id = auth.uid()));
create policy "inscripciones: admin gestiona"
  on public.inscripciones for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- --- calificaciones -----------------------------------------------------------
create policy "calificaciones: estudiante ve las suyas o staff"
  on public.calificaciones for select
  using (
    public.rol_actual() in ('admin', 'docente')
    or inscripcion_id in (
      select i.id from public.inscripciones i
      join public.estudiantes e on e.id = i.estudiante_id
      where e.usuario_id = auth.uid()
    )
  );
create policy "calificaciones: docente/admin escriben"
  on public.calificaciones for all
  using (public.rol_actual() in ('admin', 'docente'))
  with check (public.rol_actual() in ('admin', 'docente'));

-- --- constancias --------------------------------------------------------------
create policy "constancias: estudiante ve/crea las suyas o admin"
  on public.constancias for select
  using (
    public.rol_actual() = 'admin'
    or estudiante_id in (select id from public.estudiantes where usuario_id = auth.uid())
  );
create policy "constancias: estudiante crea las suyas"
  on public.constancias for insert
  with check (estudiante_id in (select id from public.estudiantes where usuario_id = auth.uid()));
create policy "constancias: admin gestiona"
  on public.constancias for all using (public.rol_actual() = 'admin') with check (public.rol_actual() = 'admin');

-- =============================================================================
-- Fin del esquema. Continúa con supabase/seed.sql
-- =============================================================================

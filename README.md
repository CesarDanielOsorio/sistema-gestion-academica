# Sistema de Gestión Académica

[![CI/CD Pipeline](https://github.com/CesarDanielOsorio/sistema-gestion-academica/actions/workflows/ci.yml/badge.svg)](https://github.com/CesarDanielOsorio/sistema-gestion-academica/actions/workflows/ci.yml)

Plataforma web tipo Canvas para la gestión académica universitaria: inscripción de cursos,
registro de calificaciones, administración del pensum/prerrequisitos y generación de constancias.
Proyecto de la **Fase 2** del curso de Ingeniería de Software (UMG).

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS (sistema de diseño *The Academic Atelier*) |
| Backend / BD / Auth | Supabase (PostgreSQL + Auth + API) |
| Enrutado | React Router |
| Pruebas | Vitest |
| Hosting | Netlify |

## Roles y módulos

- **Estudiante:** panel, inscripción de cursos, consulta de notas, pensum, constancias.
- **Docente:** panel, ingreso de calificaciones.
- **Administrador:** panel, gestión de usuarios, registro de estudiantes, gestión de pensum y
  prerrequisitos, aprobación de inscripciones.

> Escala de notas: Zona 1 (0-30) + Zona 2 (0-30) + Examen final (0-40) = **/100**. Aprueba con ≥ 61.

## Requisitos previos

- Node.js 18+ (probado con Node 24) y npm.
- Una cuenta y proyecto en [Supabase](https://supabase.com).

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
copy .env.example .env   # Windows (o: cp .env.example .env)
# Edita .env con tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (Supabase -> Project Settings -> API)

# 3. Levantar el servidor de desarrollo
npm run dev              # http://localhost:5173
```

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite). |
| `npm run build` | Compila TypeScript y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve el build de producción localmente. |
| `npm run lint` | Análisis estático con ESLint. |
| `npm run test` | Ejecuta las pruebas unitarias (Vitest). |
| `npm run coverage` | Pruebas con reporte de cobertura. |

## Estructura del proyecto

```
src/
├── components/      # Componentes reutilizables (Sidebar, Topbar, AppLayout, Card, KpiCard...)
├── config/          # Configuración de navegación por rol
├── hooks/           # Hooks de Supabase (preparados, lógica en desarrollo)
├── lib/             # Cliente de Supabase
├── pages/           # Pantallas por rol (estudiante / docente / admin) + Login
├── types/           # Tipos del modelo de datos
├── App.tsx          # Definición de rutas
└── main.tsx         # Punto de entrada

stitch-export/       # Diseños originales (HTML de Stitch) — documentación
ArchivosInformación/ # Documentos de la Fase 1 (PDFs) — documentación
```

## Pruebas

```bash
npm run test       # ejecuta las pruebas unitarias (Vitest)
npm run coverage   # pruebas + reporte de cobertura (carpeta coverage/)
```

- **Unitarias:** módulos de lógica en `src/lib` (cálculo de notas, redirección por rol,
  normalización de datos de Supabase) — **100% de cobertura**.
- **Integración y plan de pruebas:** ver [`docs/PRUEBAS_INTEGRACION.md`](docs/PRUEBAS_INTEGRACION.md)
  (5 escenarios) y [`docs/PLAN_DE_PRUEBAS.md`](docs/PLAN_DE_PRUEBAS.md).

## CI/CD

El pipeline está en [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (GitHub Actions) y se
ejecuta en cada push/PR a `main` y `develop`: **lint → pruebas + cobertura → build**. El
**despliegue** lo realiza Netlify por integración continua al hacer merge a `main`.

## Despliegue

El proyecto está listo para Netlify (ver `netlify.toml`). Configura las variables de entorno
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el panel de Netlify antes de desplegar.

## Base de datos

El esquema y los datos de ejemplo están en la carpeta [`supabase/`](supabase/) (ejecutar en el
SQL Editor de Supabase, en orden): `schema.sql` → `seed.sql` → migraciones `migracion_*.sql`.
Ver [`supabase/README.md`](supabase/README.md).

## Estructura del equipo Scrum y gestión

El Product Backlog y los sprints se gestionan en **Azure DevOps**. El código fuente y el pipeline
de CI/CD residen en **GitHub**.

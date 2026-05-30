# Plan de Pruebas — Sistema de Gestión Académica

Documento consolidado de la estrategia de pruebas (entregable 5.3.3, Fase II).

## 1. Objetivo

Verificar que el Sistema de Gestión Académica cumple los criterios de aceptación de las
historias de usuario priorizadas (Must y Should), asegurando el correcto funcionamiento de
los módulos de autenticación, inscripciones, calificaciones, pensum y constancias.

## 2. Alcance

| Incluido | Excluido |
| --- | --- |
| Lógica de negocio (cálculo de notas, validación de prerrequisitos, roles) | Pruebas de carga/estrés |
| Integración Frontend ↔ Supabase (API REST + PostgreSQL) | Pruebas de seguridad penetración |
| Flujos principales por rol (admin, docente, estudiante) | Compatibilidad con navegadores antiguos |
| Generación de constancias en PDF | App móvil nativa (fuera de alcance del proyecto) |

## 3. Tipos de prueba aplicados

| Tipo | Descripción | Herramienta |
| --- | --- | --- |
| **Unitarias** | Funciones puras de lógica (notas, roles, normalización de datos). | Vitest + cobertura v8 |
| **Integración** | Comunicación real Frontend ↔ Supabase (BD + Auth) en los flujos principales. | Ejecución manual documentada (ver `PRUEBAS_INTEGRACION.md`) |
| **Funcionales / aceptación** | Validación de los criterios de aceptación de las historias de usuario. | Ejecución manual con evidencia (capturas) |
| **Estáticas** | Verificación de estándares de código. | ESLint |

## 4. Herramientas

- **Vitest** + **@vitest/coverage-v8** — pruebas unitarias y reporte de cobertura.
- **ESLint** — análisis estático de código.
- **GitHub Actions** — ejecución automática del pipeline (lint + test + build) en cada push/PR.
- **Supabase** (PostgreSQL + Auth) — backend bajo prueba en las pruebas de integración.

## 5. Criterios de entrada y salida

### Criterios de entrada
- El código compila sin errores (`npm run build`).
- Las dependencias están instaladas (`npm ci`).
- El proyecto de Supabase está configurado con el esquema y los datos de prueba (seed).

### Criterios de salida
- **100%** de las pruebas unitarias pasan.
- Cobertura ≥ **60%** en los módulos de lógica principal (obtenido: **100%**).
- Los 5 escenarios de integración se ejecutan con resultado **Exitoso**.
- Sin defectos críticos o bloqueantes abiertos.

## 6. Cobertura de pruebas unitarias

Ejecutar: `npm run coverage`

| Módulo | Cobertura |
| --- | --- |
| `src/lib/notas.ts` (cálculo y aprobación de notas) | 100% |
| `src/lib/roles.ts` (redirección por rol) | 100% |
| `src/lib/relaciones.ts` (normalización de datos de Supabase) | 100% |

Total: **14 pruebas, 100% statements / branches / functions / lines.**

## 7. Defectos encontrados y su resolución

| # | Defecto | Severidad | Resolución |
| --- | --- | --- | --- |
| D-01 | La aprobación de inscripción fallaba en silencio. | Alta | Faltaba la columna `motivo_rechazo` (migración 01) y manejo de error visible en la UI. Resuelto. |
| D-02 | El docente veía el nombre del estudiante como "—". | Media | La política RLS de `usuarios` no permitía lectura al rol docente (migración 02). Resuelto. |
| D-03 | Las notas guardadas no se mostraban en las casillas. | Media | Supabase devolvía la relación 1-a-1 como objeto; se trataba como arreglo. Se añadió el helper `unaRelacion()`. Resuelto. |
| D-04 | Reinscribir un curso cancelado violaba la restricción única. | Baja | Se cambió `insert` por `upsert` para reactivar la inscripción. Resuelto. |

## 8. Ejecución en CI/CD

Cada push o pull request dispara el workflow de **GitHub Actions** (`.github/workflows/ci.yml`),
que ejecuta automáticamente: **lint → pruebas unitarias + cobertura → build**. El despliegue a
producción lo realiza **Netlify** mediante integración continua al hacer merge a `main`.

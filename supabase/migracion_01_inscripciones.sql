-- =============================================================================
-- Migración 01 — Inscripciones: motivo de rechazo
-- Ejecuta este archivo en el SQL Editor de Supabase (una sola vez).
-- =============================================================================

-- Permite guardar el motivo cuando el administrador rechaza una solicitud (HU-03).
alter table public.inscripciones
  add column if not exists motivo_rechazo varchar(255);

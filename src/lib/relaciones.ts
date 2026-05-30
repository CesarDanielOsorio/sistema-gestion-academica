/**
 * Normaliza una relación "a-uno" devuelta por PostgREST/Supabase.
 *
 * Según si la relación es única o no, Supabase puede devolver un OBJETO
 * (`{...}`) o un ARRAY (`[{...}]`). Este helper siempre regresa el primer
 * elemento (o null), evitando el bug de tratar un objeto como lista.
 */
export function unaRelacion<T>(raw: unknown): T | null {
  if (!raw) return null
  if (Array.isArray(raw)) return (raw[0] as T) ?? null
  return raw as T
}

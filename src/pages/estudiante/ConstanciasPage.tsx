import { useEffect, useState } from 'react'
import { AppLayout, Card, Icon } from '@/components'
import { useConstancias } from '@/hooks/useConstancias'
import type { TipoConstancia } from '@/types/database'

/**
 * Mis Constancias (HU-12, HU-13) — conectada a Supabase + PDF.
 */
const TIPO_LABEL: Record<TipoConstancia, string> = {
  inscripcion: 'Constancia de Inscripción',
  notas: 'Certificado de Calificaciones',
}

export function ConstanciasPage() {
  const { historial, ciclos, loading, generando, generar, descargar } = useConstancias()
  const [tipo, setTipo] = useState<TipoConstancia>('inscripcion')
  const [cicloId, setCicloId] = useState('')

  // Selecciona el ciclo activo (o el primero) por defecto.
  useEffect(() => {
    if (!cicloId && ciclos.length > 0) {
      setCicloId((ciclos.find((c) => c.activo) ?? ciclos[0]).id)
    }
  }, [ciclos, cicloId])

  const handleGenerar = async () => {
    try {
      await generar(tipo, cicloId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo generar la constancia.')
    }
  }

  return (
    <AppLayout rol="estudiante" activeKey="constancias" title="Constancias" subtitle="Portal del Estudiante">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
          Mis Constancias
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          Genera y descarga tus documentos académicos oficiales en PDF.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8 mb-12">
        <Card className="col-span-12 lg:col-span-8 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Icon name="add_circle" className="text-primary" />
            <h2 className="text-2xl font-bold text-on-surface font-headline">Nueva Solicitud</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                Tipo de Documento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoConstancia)}
                className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all outline-none text-on-surface"
              >
                <option value="inscripcion">Constancia de Inscripción</option>
                <option value="notas">Certificado de Calificaciones</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                Ciclo Académico
              </label>
              <select
                value={cicloId}
                onChange={(e) => setCicloId(e.target.value)}
                className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all outline-none text-on-surface"
              >
                {ciclos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.activo ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end mt-8">
            <button
              type="button"
              onClick={handleGenerar}
              disabled={generando || !cicloId}
              className="primary-gradient text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/10 disabled:opacity-60"
            >
              <Icon name="picture_as_pdf" />
              {generando ? 'Generando…' : 'Generar Documento'}
            </button>
          </div>
        </Card>

        <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-primary-container/30 rounded-xl p-8 flex-1">
            <Icon name="info" className="text-primary text-4xl mb-4" />
            <h3 className="text-xl font-bold text-on-primary-container mb-2">Información Importante</h3>
            <p className="text-sm text-on-primary-container/80 leading-relaxed">
              Las constancias se generan en PDF y quedan registradas en tu historial. Tienen validez
              oficial de 90 días desde su emisión.
            </p>
          </div>
        </section>
      </div>

      {/* Historial */}
      <Card className="overflow-hidden">
        <div className="px-8 py-6 bg-surface-container-low/50">
          <h2 className="text-2xl font-bold text-on-surface font-headline">Historial de Documentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-8 py-4">Tipo</th>
                <th className="px-8 py-4">Fecha de Generación</th>
                <th className="px-8 py-4">Ciclo Académico</th>
                <th className="px-8 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant">
                    Cargando…
                  </td>
                </tr>
              ) : historial.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant">
                    Aún no has generado constancias.
                  </td>
                </tr>
              ) : (
                historial.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                          <Icon name={d.tipo === 'notas' ? 'description' : 'assignment_ind'} className="text-lg" />
                        </div>
                        <span className="font-semibold text-on-surface">{TIPO_LABEL[d.tipo]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-on-surface-variant">
                      {new Date(d.fecha_generacion).toLocaleDateString('es-GT')}
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-tertiary-container/40 text-on-tertiary-container px-3 py-1 rounded-full text-xs font-semibold">
                        {d.cicloNombre}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => descargar(d)}
                        className="inline-flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        <Icon name="download" />
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}

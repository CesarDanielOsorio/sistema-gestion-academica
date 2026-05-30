import { jsPDF } from 'jspdf'

export interface DatosConstancia {
  estudianteNombre: string
  carnet: string
  carrera: string
  cicloNombre: string
  fecha: string
}

export interface CursoInscritoPDF {
  codigo: string
  nombre: string
  creditos: number
}

export interface CursoNotaPDF {
  codigo: string
  nombre: string
  notaFinal: number | null
  aprobado: boolean | null
}

const PRIMARY: [number, number, number] = [37, 93, 173]
const GRIS: [number, number, number] = [88, 96, 100]

function encabezado(doc: jsPDF, titulo: string) {
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Sistema de Gestión Académica', 105, 13, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('The Academic Atelier', 105, 20, { align: 'center' })

  doc.setTextColor(43, 52, 55)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(titulo, 105, 45, { align: 'center' })
}

function datosEstudiante(doc: jsPDF, d: DatosConstancia, y: number): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(43, 52, 55)
  const lineas = [
    ['Estudiante:', d.estudianteNombre],
    ['Carnet:', d.carnet],
    ['Carrera:', d.carrera],
    ['Ciclo académico:', d.cicloNombre],
  ]
  for (const [etiqueta, valor] of lineas) {
    doc.setFont('helvetica', 'bold')
    doc.text(etiqueta, 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(valor, 65, y)
    y += 8
  }
  return y
}

function pie(doc: jsPDF, fecha: string) {
  doc.setDrawColor(...GRIS)
  doc.setLineWidth(0.1)
  doc.line(20, 270, 190, 270)
  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text(`Documento generado electrónicamente el ${fecha}.`, 105, 277, { align: 'center' })
  doc.text('Válido por 90 días a partir de su emisión.', 105, 282, { align: 'center' })
}

export function pdfConstanciaInscripcion(d: DatosConstancia, cursos: CursoInscritoPDF[]) {
  const doc = new jsPDF()
  encabezado(doc, 'Constancia de Inscripción')
  let y = datosEstudiante(doc, d, 65)

  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(
    `Se hace constar que el estudiante se encuentra inscrito en los siguientes cursos durante el ${d.cicloNombre}:`,
    20,
    y,
    { maxWidth: 170 },
  )
  y += 14

  // Encabezado de tabla
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Código', 20, y)
  doc.text('Curso', 50, y)
  doc.text('Créditos', 170, y, { align: 'right' })
  y += 2
  doc.line(20, y, 190, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  let totalCreditos = 0
  for (const c of cursos) {
    doc.text(c.codigo, 20, y)
    doc.text(c.nombre, 50, y, { maxWidth: 110 })
    doc.text(String(c.creditos), 170, y, { align: 'right' })
    totalCreditos += c.creditos
    y += 8
  }
  if (cursos.length === 0) {
    doc.text('Sin cursos inscritos en este ciclo.', 20, y)
    y += 8
  }
  doc.setFont('helvetica', 'bold')
  doc.text(`Total de créditos: ${totalCreditos}`, 170, y + 2, { align: 'right' })

  pie(doc, d.fecha)
  doc.save(`Constancia_Inscripcion_${d.carnet}.pdf`)
}

export function pdfConstanciaNotas(d: DatosConstancia, cursos: CursoNotaPDF[]) {
  const doc = new jsPDF()
  encabezado(doc, 'Certificado de Calificaciones')
  let y = datosEstudiante(doc, d, 65)

  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Calificaciones obtenidas durante el ${d.cicloNombre}:`, 20, y, { maxWidth: 170 })
  y += 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Código', 20, y)
  doc.text('Curso', 50, y)
  doc.text('Nota', 150, y, { align: 'right' })
  doc.text('Estado', 190, y, { align: 'right' })
  y += 2
  doc.line(20, y, 190, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  for (const c of cursos) {
    doc.text(c.codigo, 20, y)
    doc.text(c.nombre, 50, y, { maxWidth: 95 })
    doc.text(c.notaFinal != null ? String(c.notaFinal) : '—', 150, y, { align: 'right' })
    doc.text(c.aprobado == null ? 'Sin nota' : c.aprobado ? 'Aprobado' : 'Reprobado', 190, y, {
      align: 'right',
    })
    y += 8
  }
  if (cursos.length === 0) {
    doc.text('Sin calificaciones registradas en este ciclo.', 20, y)
  }

  pie(doc, d.fecha)
  doc.save(`Certificado_Notas_${d.carnet}.pdf`)
}

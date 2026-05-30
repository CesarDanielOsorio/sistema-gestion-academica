# Pruebas de Integración y Funcionales

Entregable 5.3.2 (Fase II). Cada escenario valida la comunicación **Frontend ↔ Supabase
(API REST) ↔ PostgreSQL** y los criterios de aceptación de las historias de usuario.

> **Evidencia:** capturas de pantalla de cada ejecución (adjuntas en el documento PDF
> consolidado / carpeta de evidencias).

---

## Escenario 1 — Autenticación y control de acceso por rol

- **Historias validadas:** HU-16 (login seguro), HU-15 (accesos diferenciados).
- **Componentes integrados:** Frontend ↔ Supabase Auth ↔ tabla `usuarios` (RLS).
- **Precondición:** existen los usuarios demo (admin, docente, estudiante) confirmados.

| Paso | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión con `admin@demo.com`. | Redirige al **Panel del Administrador** (`/admin`). |
| 2 | Iniciar sesión con `docente@demo.com`. | Redirige al **Panel del Docente** (`/docente`). |
| 3 | Iniciar sesión con `estudiante@demo.com`. | Redirige al **Panel del Estudiante** (`/estudiante`). |
| 4 | Como estudiante, navegar manualmente a `/admin`. | Es redirigido a su portal (acceso denegado por rol). |
| 5 | Credenciales incorrectas. | Mensaje "Correo o contraseña incorrectos". |

- **Resultado obtenido:** ✅ Exitoso.

---

## Escenario 2 — Inscripción con validación de prerrequisitos

- **Historias validadas:** HU-01, HU-02, HU-11.
- **Componentes integrados:** Frontend ↔ `inscripciones`, `cursos`, `prerrequisitos`, `calificaciones`.
- **Precondición:** estudiante inscrito en una carrera con pensum y un ciclo activo.

| Paso | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | Entrar a Inscripción como estudiante. | Se listan los cursos de su carrera del ciclo activo. |
| 2 | Inscribir un curso sin prerrequisitos (ej. MAT101). | La inscripción queda en estado **Pendiente**. |
| 3 | Intentar un curso con prerrequisito no aprobado. | El botón aparece **Bloqueado** con el detalle "Falta: …". |
| 4 | Revisar contador de créditos. | Se actualiza con los créditos inscritos. |

- **Resultado obtenido:** ✅ Exitoso.

---

## Escenario 3 — Aprobación/Rechazo de inscripción (admin)

- **Historias validadas:** HU-03.
- **Componentes integrados:** Frontend ↔ `inscripciones` (update con RLS de admin).
- **Precondición:** existe al menos una inscripción en estado Pendiente.

| Paso | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | Entrar a Inscripciones (admin), pestaña Pendientes. | Se ve la solicitud real del estudiante (nombre, carnet, curso). |
| 2 | Pulsar **Aprobar**. | La solicitud pasa a la pestaña **Aprobadas**. |
| 3 | Rechazar otra con un motivo. | Pasa a **Rechazadas** y guarda el motivo. |
| 4 | Volver como estudiante a Inscripción. | La aprobada muestra **Aprobada**; la rechazada vuelve a estar disponible. |

- **Resultado obtenido:** ✅ Exitoso.

---

## Escenario 4 — Ingreso de calificaciones y cálculo automático

- **Historias validadas:** HU-05, HU-06, HU-08.
- **Componentes integrados:** Frontend ↔ `calificaciones` (columnas generadas en PostgreSQL).
- **Precondición:** estudiante con inscripción **aprobada** en un curso.

| Paso | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | Docente selecciona el curso en Ingreso de Notas. | Se listan los estudiantes inscritos (con su nombre). |
| 2 | Ingresar Zona 1 = 30, Zona 2 = 30, Examen = 20 y Guardar. | La **nota final (80)** y el estado **Aprobado** se calculan automáticamente en la BD. |
| 3 | Reabrir el curso. | Las casillas conservan las notas guardadas (editables). |
| 4 | Entrar como estudiante a Mis Notas. | Muestra el curso con nota 80 y estado **Aprobado**; el promedio se actualiza. |

- **Resultado obtenido:** ✅ Exitoso.

---

## Escenario 5 — Generación de constancia en PDF

- **Historias validadas:** HU-12, HU-13.
- **Componentes integrados:** Frontend (jsPDF) ↔ `estudiantes`, `inscripciones`, `calificaciones`, `constancias`.
- **Precondición:** estudiante con cursos inscritos/calificados en un ciclo.

| Paso | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | En Constancias, elegir "Constancia de Inscripción" y el ciclo. | Se descarga un **PDF** con datos del estudiante y sus cursos. |
| 2 | Elegir "Certificado de Calificaciones" y generar. | Se descarga un PDF con las notas y su estado. |
| 3 | Revisar el Historial de Documentos. | La constancia generada queda **registrada** (tipo, fecha, ciclo). |
| 4 | Pulsar **Descargar** en el historial. | Vuelve a generar el PDF correspondiente. |

- **Resultado obtenido:** ✅ Exitoso.

---

## Resumen

| Escenario | Historias | Resultado |
| --- | --- | --- |
| 1. Autenticación y roles | HU-15, HU-16 | ✅ |
| 2. Inscripción + prerrequisitos | HU-01, HU-02, HU-11 | ✅ |
| 3. Aprobación de inscripción | HU-03 | ✅ |
| 4. Calificaciones + cálculo | HU-05, HU-06, HU-08 | ✅ |
| 5. Constancias PDF | HU-12, HU-13 | ✅ |

**5 de 5 escenarios exitosos.**

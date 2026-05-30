# Prompts para Stitch — Pantallas faltantes

Sistema de Gestión Académica · Diseño "The Academic Atelier".

## Cómo usarlo
1. Copia el **BLOQUE DE CONTEXTO DE DISEÑO** y pégalo **al inicio de cada prompt** (así todas las pantallas salen consistentes con las 6 que ya tienes).
2. Debajo, pega el prompt de la pantalla que quieras generar.
3. Genera, exporta el HTML y guárdalo en `stitch-export/` con el nombre sugerido.

---

## BLOQUE DE CONTEXTO DE DISEÑO (pegar antes de cada prompt)

```
Diseña una pantalla web para un Sistema de Gestión Académica universitario, en ESPAÑOL.
Sigue estrictamente este sistema de diseño llamado "The Academic Atelier" (editorial, sobrio, mucho espacio en blanco):

- Stack visual: HTML + Tailwind CSS. Tipografías: Manrope para títulos (font-headline), Public Sans para texto (font-body). Iconos: Material Symbols Outlined.
- Paleta: fondo #f8f9fa (background); tarjetas blancas #ffffff (surface-container-lowest); barras/sidebars #f1f4f6 (surface-container-low); color primario #255dad con degradado 45° hacia #1151a0 para botones principales; texto #2b3437 (NUNCA negro puro).
- REGLA SIN BORDES: no uses bordes sólidos de 1px para separar secciones; separa con cambios de fondo (capas tonales). Para inputs y tablas densas usa un "ghost border" (gris #abb3b7 al 15% de opacidad).
- Elevación: nada de sombras grises pesadas; usa "tonal lift" suave (box-shadow muy tenue) y tarjetas blancas sobre fondo gris claro.
- Componentes: botón primario con degradado y borderRadius 0.5rem; chips tipo píldora con secondary-container; estados "suaves" (ej. error con fondo error-container y texto on-error-container, no rojo fuerte).
- Layout general: barra lateral (sidebar) a la izquierda con el logo "The Academic Atelier" arriba, ícono account_balance, lista de navegación con iconos Material Symbols, y al fondo el usuario/rol y botón Logout. Contenido principal a la derecha con título grande alineado a la izquierda y subtítulo descriptivo.
- Responsivo (desktop y móvil). Generoso en padding ("breathing room").
```

---

## 1. Panel del Administrador  → guardar como `DashboardAdmin.html`
Cubre: home del rol admin (hoy no existe).

```
Pantalla: "Panel del Administrador".
Sidebar de administrador con items: Panel (dashboard), Usuarios, Estudiantes, Pensum y Cursos, Inscripciones, Reportes, Constancias, y abajo el usuario "Admin" con Logout. Marca "Panel" como activo.
Contenido: título "Panel del Administrador" con subtítulo "Resumen general de la actividad académica".
Fila de 4 tarjetas-métrica (KPI) blancas con icono: Estudiantes activos (ej. 512), Docentes (ej. 28), Cursos activos (ej. 64), Inscripciones pendientes de aprobación (ej. 17, resáltala porque requiere acción).
Debajo, dos columnas: a la izquierda una tarjeta "Solicitudes de inscripción recientes" con una lista de 4 filas (estudiante, curso, fecha, chip de estado pendiente) y un enlace "Ver todas"; a la derecha una tarjeta "Ciclo académico activo" mostrando nombre del ciclo, fechas de inicio/fin y barra de progreso, más accesos directos a "Registrar estudiante" y "Gestionar pensum".
Sin bordes duros, usa capas tonales y tonal lift.
```

## 2. Gestión de Usuarios  → guardar como `GestionUsuarios.html`
Cubre: HU-15 (crear/editar/desactivar usuarios y asignar roles).

```
Pantalla: "Gestión de Usuarios" (rol administrador). Usa el mismo sidebar de administrador, item "Usuarios" activo.
Contenido: título "Gestión de Usuarios", subtítulo "Administra cuentas y roles del sistema". Arriba a la derecha un botón primario con degradado "+ Nuevo usuario".
Barra de filtros: buscador por nombre/email, un select de Rol (Todos / Administrador / Docente / Estudiante) y un select de Estado (Activo / Inactivo).
Tabla de usuarios con columnas: Nombre, Email, Rol (mostrado como chip píldora de color), Estado (chip "Activo" verde suave / "Inactivo" gris), y una columna de acciones con un menú de tres puntos (Editar, Desactivar). Muestra 6 filas de ejemplo mezclando los 3 roles.
Separa las filas con espacio en blanco o alternando el fondo de fila, NO con líneas divisorias.
Incluye paginación discreta abajo.
```

## 3. Registro de Estudiantes  → guardar como `RegistroEstudiante.html`
Cubre: HU-17 (registrar estudiante con nombre, carnet, carrera, ciclo).

```
Pantalla: "Registrar Estudiante" (rol administrador). Mismo sidebar de administrador, item "Estudiantes" activo.
Contenido: título "Registrar Nuevo Estudiante", subtítulo "Crea la cuenta académica del estudiante".
Una tarjeta blanca centrada con un formulario en dos columnas y secciones:
- Sección "Datos personales": Nombre completo, Email, Carnet (con nota "debe ser único").
- Sección "Datos académicos": Carrera (select), Ciclo de ingreso (select de año), Carrera (select).
- Nota informativa en una tarjeta lateral azul suave: "Al registrar, el sistema generará automáticamente las credenciales de acceso del estudiante."
Inputs con ghost border y estado de foco con glow azul. Abajo botones: "Cancelar" (terciario) y "Registrar estudiante" (primario con degradado).
```

## 4. Gestión de Pensum y Cursos  → guardar como `GestionPensum.html`
Cubre: HU-09 (crear/editar pensum) y HU-11 (definir prerrequisitos).

```
Pantalla: "Gestión de Pensum y Cursos" (rol administrador). Mismo sidebar, item "Pensum y Cursos" activo.
Arriba: título "Gestión de Pensum", subtítulo "Administra el plan de estudios por carrera". Un select de Carrera y un botón primario "+ Nuevo curso".
Cuerpo: los cursos agrupados por ciclo/semestre en columnas o secciones (Primer Ciclo, Segundo Ciclo, ...). Cada curso es una tarjeta blanca pequeña con: código, nombre, créditos, y un mini-listado de prerrequisitos como chips píldora. Cada tarjeta tiene un menú de tres puntos (Editar, Definir prerrequisitos, Eliminar).
Incluye un panel lateral o modal de ejemplo "Definir prerrequisitos" donde se muestra el curso y un selector de cursos prerrequisito ya elegidos como chips removibles.
Estética editorial, separación por capas tonales, sin líneas divisorias.
```

## 5. Aprobación de Inscripciones  → guardar como `AprobacionInscripciones.html`
Cubre: HU-03 (aprobar/rechazar solicitudes con motivo).

```
Pantalla: "Aprobación de Inscripciones" (rol administrador). Mismo sidebar, item "Inscripciones" activo.
Título "Solicitudes de Inscripción", subtítulo "Revisa y resuelve las solicitudes pendientes". Pestañas: Pendientes (activa), Aprobadas, Rechazadas. Buscador y filtro por curso/ciclo.
Tabla/lista de solicitudes con columnas: Estudiante (nombre + carnet), Curso (nombre + código), Ciclo, Fecha de solicitud, Estado (chip "Pendiente" en estado suave), y acciones: botón "Aprobar" (primario pequeño) y "Rechazar" (terciario).
Incluye un modal de ejemplo "Rechazar solicitud" con un textarea para el motivo y botones Cancelar / Confirmar rechazo.
Muestra 5 filas de ejemplo. Separa con espacio en blanco, no con líneas.
```

## 6. Mis Notas (Estudiante)  → guardar como `MisNotas.html`
Cubre: HU-06 (vista dedicada de notas por curso y ciclo, con aprobado/reprobado).

```
Pantalla: "Mis Notas" (rol estudiante). Usa el MISMO sidebar de estudiante de las pantallas existentes (Panel/Home, Inscripción, Notas, Pensum, Constancias), con "Notas" activo. Mismo header superior con buscador y Logout.
Título "Mis Calificaciones", subtítulo "Consulta tu rendimiento por curso y ciclo". Un select de Ciclo académico.
Fila resumen: tarjetas con Promedio del ciclo, Cursos aprobados, Cursos reprobados.
Tabla de cursos del ciclo seleccionado con columnas: Curso (nombre + código), Zona 1, Zona 2, Examen Final, Nota Final (resaltada), y Estado como chip "Aprobado" (verde suave) o "Reprobado" (rojo suave). Muestra 5-6 cursos de ejemplo, alguno reprobado.
Editorial, tarjetas blancas sobre fondo claro, sin líneas divisorias.
```

---

## OPCIONALES (historias Should — solo si quieres cubrir más rúbrica)

### 7. Reportes de Notas por Curso (Admin) → `ReportesNotas.html`  (HU-07)
```
Pantalla: "Reportes de Notas" (rol administrador). Mismo sidebar admin, item "Reportes" activo.
Título "Reportes de Notas por Curso", subtítulo "Análisis académico por curso y ciclo". Filtros: Curso, Ciclo, y botones "Exportar PDF" y "Exportar Excel" (secundarios).
Tarjetas resumen: Promedio general del curso, % de aprobación, Total de estudiantes. Un área para un gráfico de barras (distribución de notas). Tabla con estudiantes y su nota final. Estilo editorial sin líneas.
```

### 8. Dashboard del Docente → `DashboardDocente.html`
```
Pantalla: "Panel del Docente" (rol docente). Sidebar de docente: Panel, Mis Cursos, Ingreso de Notas, Horario, Recursos; abajo el usuario docente con Logout.
Título "Panel del Docente", subtítulo con el nombre del docente. Tarjetas KPI: Cursos asignados, Total de estudiantes, Notas pendientes de ingresar. Lista "Mis cursos" con tarjetas (nombre del curso, sección, nº estudiantes, botón "Ingresar notas"). Estilo editorial.
```

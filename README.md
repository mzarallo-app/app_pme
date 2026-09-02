# App PME — Gestión Financiera y de Subvenciones del PME

App de gestión financiera, contable y de subvenciones para el Plan de Mejoramiento Educativo (PME) de un establecimiento educacional chileno. Construida según `app_pme.md`, usando como base documental el **Manual de Cuentas para la Rendición de Recursos Destinados a Educación 2026** (Superintendencia de Educación) y las **Orientaciones PME 2026** (MINEDUC).

## Estado: MVP funcional

Corre localmente sin necesidad de un proyecto Firebase configurado — los datos se guardan en `localStorage` del navegador con una capa de repositorio (`src/lib/repo.ts`) que imita la forma de un backend Firestore, para poder migrar sin tocar la UI.

## Cómo correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5174`. Al primer arranque se cargan datos de ejemplo (1 establecimiento, 3 usuarios, 4 acciones PME, el plan de cuentas 2026 completo).

**Usuarios demo** (sin contraseña — modo demo, solo por correo):

| Correo | Rol |
|---|---|
| `director@demo.cl` | Director |
| `utp@demo.cl` | Jefe UTP |
| `responsable@demo.cl` | Personal Responsable |

## Qué incluye

- **3 perfiles de usuario** con permisos diferenciados (`src/lib/permisos.ts`): Personal Responsable (edita solo sus acciones y evidencia), Jefe UTP (control por oposición, edita todo), Director (vista de solo lectura, cuadro de mando).
- **Ámbitos PME reales** (Liderazgo, Gestión Pedagógica, Formación y Convivencia, Gestión de Recursos, Área de Resultados) según el Modelo de Calidad de la Gestión Escolar.
- **CRUD de Acciones PME** con objetivo, indicador, medio de verificación, responsable, plazos, presupuesto, fuentes de financiamiento (SEP, PIE, FAEP, etc.), nivel de avance (6 categorías oficiales), hitos de progreso y motivo de no ejecución (11 códigos oficiales).
- **Plan de Cuentas 2026 completo** (`src/data/planDeCuentas.ts`) — ~170 cuentas de ingresos y gastos con código, nombre, libro de rendición y subvenciones habilitadas, transcritas del Manual de Cuentas oficial.
- **Asignación de cuentas contables** a cada acción, con sugerencia automática de tipo de evidencia según la cuenta seleccionada.
- **Evidencia adjunta** (contratos, facturas, fotografías, nómina de asistencia) — archivos pequeños se guardan como data URL en modo demo.
- **Reportes**: por ámbito PME, general del colegio, carta Gantt, % de cumplimiento, y exportación a PDF (jsPDF).

## Migrar a Firebase real

1. Crear un proyecto en Firebase (Auth + Firestore + Storage).
2. Completar `.env` (copiar de `.env.example`) con las credenciales del proyecto.
3. Reemplazar las funciones de `src/lib/repo.ts` (hoy respaldadas por `src/lib/localDb.ts`) por llamadas a Firestore usando `src/lib/firebase.ts`, que ya está listo.
4. Reemplazar `AuthContext` (login por correo sin contraseña) por Firebase Auth.
5. Reemplazar `src/lib/fileStore.ts` (data URL) por subida a Firebase Storage.

Las páginas y componentes no necesitan cambios: dependen solo de las funciones exportadas por `repo.ts`.

## Pendiente para producción

- Autenticación real (hoy es solo demo, sin contraseña).
- Reglas de seguridad de Firestore/Storage según los permisos de `src/lib/permisos.ts`.
- Completar el Plan de Cuentas con el 100% de subcuentas si se requiere fidelidad total (secciones 11–12 del Manual son tablas gráficas que no se pudieron extraer como texto).
- Validación estricta de tipo de documento por cuenta (hoy es solo una sugerencia, `src/lib/evidenciaSugerida.ts`).

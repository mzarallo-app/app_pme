import type { Ambito } from '../types/pme';

// Dimensiones oficiales del Modelo de Calidad de la Gestión Escolar (MCGE),
// según "Plan de Mejoramiento Educativo (PME) 2026 - Orientaciones" (MINEDUC).
export const AMBITOS_PME: Ambito[] = [
  {
    id: 'liderazgo',
    nombre: 'Liderazgo',
    descripcion:
      'Liderazgo del sostenedor y del director orientado a la planificación y gestión de resultados institucionales.',
    subAmbitos: ['Liderazgo del sostenedor', 'Liderazgo del director', 'Planificación y gestión de resultados'],
    orden: 1,
  },
  {
    id: 'gestion_pedagogica',
    nombre: 'Gestión Pedagógica',
    descripcion:
      'Gestión curricular, enseñanza y aprendizaje en el aula, y apoyo al desarrollo de los estudiantes.',
    subAmbitos: ['Gestión curricular', 'Enseñanza y aprendizaje en el aula', 'Apoyo al desarrollo de los estudiantes'],
    orden: 2,
  },
  {
    id: 'formacion_convivencia',
    nombre: 'Formación y Convivencia',
    descripcion: 'Formación y convivencia escolar, y participación y vida democrática.',
    subAmbitos: ['Formación y convivencia', 'Participación y vida democrática'],
    orden: 3,
  },
  {
    id: 'gestion_recursos',
    nombre: 'Gestión de Recursos',
    descripcion:
      'Gestión de personal, gestión de recursos financieros y gestión de recursos educativos del establecimiento.',
    subAmbitos: ['Gestión de personal', 'Gestión de recursos financieros', 'Gestión de recursos educativos'],
    orden: 4,
  },
  {
    id: 'resultados',
    nombre: 'Área de Resultados',
    descripcion:
      'Resultados de aprendizaje del establecimiento, incorporada durante la Autoevaluación Institucional.',
    subAmbitos: [],
    orden: 5,
  },
];

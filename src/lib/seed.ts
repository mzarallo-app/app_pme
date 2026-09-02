import { isSeeded, markSeeded } from './localDb';
import { usuariosRepo, establecimientosRepo, accionesRepo, cuentasRepo } from './repo';
import type { Usuario } from '../types/usuario';
import type { Establecimiento } from '../types/establecimiento';
import { AMBITOS_PME } from '../data/ambitosPME';
import { PLAN_DE_CUENTAS } from '../data/planDeCuentas';
import { nivelAvanceDesdePorcentaje } from '../types/pme';

const ESTABLECIMIENTO_ID = 'est-demo-1';

export function seedSiCorresponde(): void {
  if (isSeeded()) return;

  const establecimiento: Establecimiento = {
    id: ESTABLECIMIENTO_ID,
    nombre: 'Colegio Demo Edutech',
    rbd: '12345-6',
    sostenedor: 'Corporación Educacional Demo',
    comuna: 'Santiago',
    region: 'Metropolitana',
    añoInicioPME: 2026,
    añoTerminoPME: 2029,
  };
  establecimientosRepo.guardar(establecimiento);

  const usuarios: Usuario[] = [
    {
      uid: 'u-director',
      nombre: 'Marcela Rojas',
      email: 'director@demo.cl',
      rol: 'director',
      establecimientoId: ESTABLECIMIENTO_ID,
      activo: true,
    },
    {
      uid: 'u-utp',
      nombre: 'Pedro Sánchez',
      email: 'utp@demo.cl',
      rol: 'jefe_utp',
      establecimientoId: ESTABLECIMIENTO_ID,
      activo: true,
    },
    {
      uid: 'u-responsable',
      nombre: 'Camila Torres',
      email: 'responsable@demo.cl',
      rol: 'responsable',
      establecimientoId: ESTABLECIMIENTO_ID,
      activo: true,
    },
  ];
  usuarios.forEach((u) => usuariosRepo.guardar(u));

  cuentasRepo.guardarTodas(PLAN_DE_CUENTAS);

  const hoy = new Date();
  const año = hoy.getFullYear() >= 2026 ? hoy.getFullYear() : 2026;

  const accionesDemo = [
    {
      ambitoId: 'gestion_pedagogica',
      nombre: 'Talleres de reforzamiento en Lenguaje 3° a 6° básico',
      objetivo: 'Mejorar la comprensión lectora de los estudiantes con mayor rezago.',
      indicador: '% de estudiantes que suben al menos un nivel de logro en la evaluación de comprensión lectora.',
      medioVerificacion: 'Informes de avance trimestrales y evaluaciones intermedias.',
      responsableUid: 'u-responsable',
      fechaInicio: `${año}-04-01`,
      fechaFin: `${año}-11-15`,
      presupuestoAsignado: 3500000,
      fuentesFinanciamiento: ['SEP'] as const,
      cuentaCodigos: ['410 502'],
      porcentajeAvance: 60,
      usoATE: false,
    },
    {
      ambitoId: 'gestion_recursos',
      nombre: 'Adquisición de material didáctico para aula de recursos',
      objetivo: 'Equipar el aula de recursos con material pedagógico especializado.',
      indicador: 'N° de sets de material adquiridos e instalados.',
      medioVerificacion: 'Facturas de compra y fotografías del material instalado.',
      responsableUid: 'u-responsable',
      fechaInicio: `${año}-03-15`,
      fechaFin: `${año}-06-30`,
      presupuestoAsignado: 1800000,
      fuentesFinanciamiento: ['SEP'] as const,
      cuentaCodigos: ['410 600', '410 700'],
      porcentajeAvance: 100,
      usoATE: false,
    },
    {
      ambitoId: 'formacion_convivencia',
      nombre: 'Plan de acompañamiento socioemocional a estudiantes',
      objetivo: 'Fortalecer habilidades socioemocionales y clima de convivencia en aula.',
      indicador: 'N° de sesiones realizadas y nivel de participación registrado.',
      medioVerificacion: 'Nómina de asistencia a talleres y bitácoras de facilitador.',
      responsableUid: 'u-responsable',
      fechaInicio: `${año}-04-15`,
      fechaFin: `${año}-12-05`,
      presupuestoAsignado: 2200000,
      fuentesFinanciamiento: ['PIE', 'SEP'] as const,
      cuentaCodigos: ['410 804', '410 803'],
      porcentajeAvance: 25,
      usoATE: true,
    },
    {
      ambitoId: 'liderazgo',
      nombre: 'Sistema de monitoreo trimestral de metas institucionales',
      objetivo: 'Instalar reuniones trimestrales de análisis de resultados con el equipo directivo.',
      indicador: 'N° de reuniones de análisis realizadas con acta.',
      medioVerificacion: 'Actas de reunión firmadas por el equipo directivo.',
      responsableUid: 'u-utp',
      fechaInicio: `${año}-03-01`,
      fechaFin: `${año}-12-15`,
      presupuestoAsignado: 0,
      fuentesFinanciamiento: ['Sin financiamiento'] as const,
      cuentaCodigos: [] as string[],
      porcentajeAvance: 40,
      usoATE: false,
    },
  ];

  accionesDemo.forEach((a) => {
    accionesRepo.crear({
      establecimientoId: ESTABLECIMIENTO_ID,
      ambitoId: a.ambitoId,
      nombre: a.nombre,
      objetivo: a.objetivo,
      indicador: a.indicador,
      medioVerificacion: a.medioVerificacion,
      responsableUid: a.responsableUid,
      año,
      fechaInicio: a.fechaInicio,
      fechaFin: a.fechaFin,
      presupuestoAsignado: a.presupuestoAsignado,
      fuentesFinanciamiento: [...a.fuentesFinanciamiento],
      cuentaCodigos: a.cuentaCodigos,
      porcentajeAvance: a.porcentajeAvance,
      nivelAvance: nivelAvanceDesdePorcentaje(a.porcentajeAvance),
      usoATE: a.usoATE,
      hitos: [],
      creadoPorUid: 'u-utp',
    });
  });

  markSeeded();
}

export { AMBITOS_PME };

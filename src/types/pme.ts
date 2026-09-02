export type NivelAvance =
  | 'no_corresponde'
  | 'inicial'
  | 'parcial'
  | 'intermedia'
  | 'avanzada'
  | 'implementada';

export const NIVEL_AVANCE_INFO: Record<
  NivelAvance,
  { label: string; rango: string; min: number; max: number; color: string }
> = {
  no_corresponde: { label: 'No corresponde', rango: '0%', min: 0, max: 0, color: '#94a3b8' },
  inicial: { label: 'Implementación inicial', rango: '1%–24%', min: 1, max: 24, color: '#ef4444' },
  parcial: { label: 'Implementación parcial', rango: '25%–49%', min: 25, max: 49, color: '#f97316' },
  intermedia: { label: 'Implementación intermedia', rango: '50%–74%', min: 50, max: 74, color: '#eab308' },
  avanzada: { label: 'Implementación avanzada', rango: '75%–99%', min: 75, max: 99, color: '#84cc16' },
  implementada: { label: 'Implementada', rango: '100%', min: 100, max: 100, color: '#22c55e' },
};

export function nivelAvanceDesdePorcentaje(pct: number): NivelAvance {
  if (pct >= 100) return 'implementada';
  if (pct >= 75) return 'avanzada';
  if (pct >= 50) return 'intermedia';
  if (pct >= 25) return 'parcial';
  if (pct >= 1) return 'inicial';
  return 'no_corresponde';
}

export type FuenteFinanciamiento =
  | 'SEP'
  | 'PIE'
  | 'FAEP'
  | 'Mantenimiento'
  | 'Pro-Retención'
  | 'Reforzamiento'
  | 'EIB'
  | 'Subvención General'
  | 'Aporte municipal'
  | 'Sin financiamiento';

export const FUENTES_FINANCIAMIENTO: FuenteFinanciamiento[] = [
  'SEP',
  'PIE',
  'FAEP',
  'Mantenimiento',
  'Pro-Retención',
  'Reforzamiento',
  'EIB',
  'Subvención General',
  'Aporte municipal',
  'Sin financiamiento',
];

export const MOTIVOS_NO_EJECUCION: { codigo: number; texto: string }[] = [
  { codigo: 1, texto: 'Va en curso según lo planificado' },
  { codigo: 2, texto: 'El establecimiento decidió que la acción no contribuía al objetivo y la detuvo' },
  { codigo: 3, texto: 'Las condiciones de tiempo, recursos humanos, materiales o infraestructura no permitieron una implementación adecuada' },
  { codigo: 4, texto: 'Los recursos comprometidos llegaron con retraso' },
  { codigo: 5, texto: 'La asignación de recursos se vio interrumpida' },
  { codigo: 6, texto: 'Dificultades de planificación institucional impidieron ejecutar lo planeado' },
  { codigo: 7, texto: 'No se encontró una asesoría técnica pertinente' },
  { codigo: 8, texto: 'El sostenedor/director y equipo directivo decidieron discontinuar el servicio ATE externo' },
  { codigo: 9, texto: 'No se encontró una asesoría técnica pertinente' },
  { codigo: 10, texto: 'La persona responsable no pudo implementarla por motivos de tiempo u organización' },
  { codigo: 11, texto: 'Otro' },
];

export interface Ambito {
  id: string;
  nombre: string;
  descripcion: string;
  subAmbitos: string[];
  orden: number;
}

export interface Hito {
  id: string;
  fecha: string;
  descripcion: string;
  registradoPorUid: string;
}

export interface Accion {
  id: string;
  establecimientoId: string;
  ambitoId: string;
  nombre: string;
  objetivo: string;
  indicador: string;
  medioVerificacion: string;
  responsableUid: string;
  año: number;
  fechaInicio: string;
  fechaFin: string;
  presupuestoAsignado: number;
  fuentesFinanciamiento: FuenteFinanciamiento[];
  cuentaCodigos: string[];
  porcentajeAvance: number;
  nivelAvance: NivelAvance;
  motivoNoEjecucionCodigo?: number;
  justificacion?: string;
  usoATE: boolean;
  hitos: Hito[];
  observaciones?: string;
  creadoPorUid: string;
  creadoEn: string;
  actualizadoEn: string;
}

export type EstadoAccion = NivelAvance;

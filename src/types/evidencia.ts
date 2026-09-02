export type TipoEvidencia = 'contrato' | 'factura' | 'fotografia' | 'nomina_asistencia';

export const TIPO_EVIDENCIA_LABEL: Record<TipoEvidencia, string> = {
  contrato: 'Contrato',
  factura: 'Factura',
  fotografia: 'Fotografía',
  nomina_asistencia: 'Nómina de asistencia',
};

export interface Evidencia {
  id: string;
  accionId: string;
  tipo: TipoEvidencia;
  nombreArchivo: string;
  archivoUrl: string;
  archivoPath: string;
  tamañoBytes: number;
  descripcion?: string;
  montoAsociado?: number;
  cuentaCodigo?: string;
  subidoPorUid: string;
  fechaCarga: string;
}

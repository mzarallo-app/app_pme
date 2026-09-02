export type TipoCuenta = 'ingreso' | 'gasto';

export type LibroRendicion = 'remuneraciones' | 'compras_otros_gastos' | 'honorarios' | 'no_aplica';

export const LIBRO_RENDICION_LABEL: Record<LibroRendicion, string> = {
  remuneraciones: 'Libro de Remuneraciones',
  compras_otros_gastos: 'Libro de Compras y Otros Gastos',
  honorarios: 'Libro de Honorarios',
  no_aplica: 'No aplica',
};

export interface CuentaContable {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  codigoPadre: string | null;
  nivel: 1 | 2 | 3;
  descripcion?: string;
  /** Subvenciones bajo las cuales esta cuenta es rendible (Manual de Cuentas 2026). */
  subvencionesHabilitadas?: string[];
  libroRendicion?: LibroRendicion;
  /** Códigos oficiales de documento tributario habilitados (FAC, BOL, BOLH, etc.). */
  documentosHabilitados?: string[];
}

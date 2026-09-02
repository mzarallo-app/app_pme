import type { CuentaContable } from '../types/cuenta';
import type { TipoEvidencia } from '../types/evidencia';

// Heurística simple para sugerir qué tipo(s) de evidencia adjuntar según la
// cuenta contable seleccionada, a partir del "Libro de Rendición" y el nombre
// de la cuenta (Manual de Cuentas 2026). Es una sugerencia, no una validación
// estricta: el usuario puede adjuntar cualquier tipo de evidencia.
function sugeridasParaUnaCuenta(cuenta: CuentaContable): TipoEvidencia[] {
  const nombre = cuenta.nombre.toLowerCase();
  const sugeridas = new Set<TipoEvidencia>();

  if (cuenta.libroRendicion === 'honorarios') {
    sugeridas.add('contrato');
    sugeridas.add('factura');
  }
  if (cuenta.libroRendicion === 'compras_otros_gastos' || !cuenta.libroRendicion) {
    sugeridas.add('factura');
  }
  if (nombre.includes('taller') || nombre.includes('formativ') || nombre.includes('alumno')) {
    sugeridas.add('nomina_asistencia');
  }
  if (nombre.includes('evento') || nombre.includes('cultural') || nombre.includes('construcc') || nombre.includes('infraestructura') || nombre.includes('equipamiento')) {
    sugeridas.add('fotografia');
  }
  if (nombre.includes('arriendo') || nombre.includes('especialista') || nombre.includes('ate') || nombre.includes('asesoría')) {
    sugeridas.add('contrato');
  }

  return Array.from(sugeridas);
}

export function evidenciaSugeridaParaCuenta(cuenta: CuentaContable | undefined): TipoEvidencia[] {
  if (!cuenta) return ['factura', 'contrato', 'fotografia', 'nomina_asistencia'];
  const sugeridas = sugeridasParaUnaCuenta(cuenta);
  return sugeridas.length > 0 ? sugeridas : ['factura'];
}

export function evidenciaSugeridaParaCuentas(cuentas: CuentaContable[]): TipoEvidencia[] {
  if (cuentas.length === 0) return ['factura', 'contrato', 'fotografia', 'nomina_asistencia'];
  const sugeridas = new Set<TipoEvidencia>();
  cuentas.forEach((c) => sugeridasParaUnaCuenta(c).forEach((t) => sugeridas.add(t)));
  return sugeridas.size > 0 ? Array.from(sugeridas) : ['factura'];
}

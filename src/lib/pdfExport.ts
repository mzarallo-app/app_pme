import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Accion } from '../types/pme';
import type { Ambito } from '../types/pme';
import type { Usuario } from '../types/usuario';
import type { Establecimiento } from '../types/establecimiento';
import type { CuentaContable } from '../types/cuenta';
import type { Evidencia } from '../types/evidencia';
import { TIPO_EVIDENCIA_LABEL } from '../types/evidencia';

function encabezado(doc: jsPDF, titulo: string, establecimiento: Establecimiento) {
  doc.setFontSize(16);
  doc.text(titulo, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${establecimiento.nombre} (RBD ${establecimiento.rbd})`, 14, 25);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, 14, 30);
  doc.setTextColor(0);
}

function nombreArchivo(prefijo: string, establecimiento: Establecimiento) {
  return `${prefijo}-${establecimiento.rbd}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

export function exportarReportePDF(params: {
  establecimiento: Establecimiento;
  acciones: Accion[];
  ambitos: Ambito[];
  usuarios: Usuario[];
}) {
  const { establecimiento, acciones, ambitos, usuarios } = params;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Reporte de Avance PME', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${establecimiento.nombre} (RBD ${establecimiento.rbd})`, 14, 25);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, 14, 30);

  const avancePromedio = acciones.length
    ? Math.round(acciones.reduce((s, a) => s + a.porcentajeAvance, 0) / acciones.length)
    : 0;

  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total de acciones: ${acciones.length}   ·   Avance promedio: ${avancePromedio}%`, 14, 38);

  autoTable(doc, {
    startY: 44,
    head: [['Ámbito', 'Acción', 'Responsable', 'Plazo', 'Avance', 'Presupuesto']],
    body: acciones.map((a) => [
      ambitos.find((am) => am.id === a.ambitoId)?.nombre ?? '',
      a.nombre,
      usuarios.find((u) => u.uid === a.responsableUid)?.nombre ?? '',
      `${a.fechaInicio} a ${a.fechaFin}`,
      `${a.porcentajeAvance}%`,
      a.presupuestoAsignado.toLocaleString('es-CL'),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [91, 61, 240] },
  });

  doc.save(`reporte-pme-${establecimiento.rbd}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportarAmbitoPDF(params: { establecimiento: Establecimiento; acciones: Accion[]; ambitos: Ambito[] }) {
  const { establecimiento, acciones, ambitos } = params;
  const doc = new jsPDF();
  encabezado(doc, 'Reporte por Ámbito PME', establecimiento);
  let y = 40;
  ambitos.forEach((amb) => {
    const items = acciones.filter((a) => a.ambitoId === amb.id);
    const avance = items.length ? Math.round(items.reduce((s, a) => s + a.porcentajeAvance, 0) / items.length) : 0;
    const presupuesto = items.reduce((s, a) => s + a.presupuestoAsignado, 0);
    doc.setFontSize(12);
    doc.text(`${amb.nombre} — ${avance}% de avance (${items.length} acciones, $${presupuesto.toLocaleString('es-CL')})`, 14, y);
    y += 8;
  });
  autoTable(doc, {
    startY: y + 4,
    head: [['Ámbito', 'Acción', 'Responsable', 'Avance']],
    body: acciones.map((a) => [ambitos.find((am) => am.id === a.ambitoId)?.nombre ?? '', a.nombre, '', `${a.porcentajeAvance}%`]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [91, 61, 240] },
  });
  doc.save(nombreArchivo('reporte-ambito-pme', establecimiento));
}

export function exportarCumplimientoPDF(params: { establecimiento: Establecimiento; acciones: Accion[]; ambitos: Ambito[] }) {
  const { establecimiento, acciones, ambitos } = params;
  const doc = new jsPDF();
  encabezado(doc, '% de Cumplimiento por Ámbito PME', establecimiento);
  autoTable(doc, {
    startY: 40,
    head: [['Ámbito', '% Cumplimiento', 'N° Acciones']],
    body: ambitos.map((amb) => {
      const items = acciones.filter((a) => a.ambitoId === amb.id);
      const avance = items.length ? Math.round(items.reduce((s, a) => s + a.porcentajeAvance, 0) / items.length) : 0;
      return [amb.nombre, `${avance}%`, String(items.length)];
    }),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [91, 61, 240] },
  });
  doc.save(nombreArchivo('cumplimiento-pme', establecimiento));
}

export function exportarCumplimientoPorResponsablePDF(params: { establecimiento: Establecimiento; acciones: Accion[]; usuarios: Usuario[] }) {
  const { establecimiento, acciones, usuarios } = params;
  const doc = new jsPDF();
  encabezado(doc, 'Cumplimiento Agrupado por Responsable', establecimiento);
  autoTable(doc, {
    startY: 40,
    head: [['Responsable', '% Avance Promedio', 'N° Acciones', 'Implementadas']],
    body: usuarios
      .filter((u) => acciones.some((a) => a.responsableUid === u.uid))
      .map((u) => {
        const items = acciones.filter((a) => a.responsableUid === u.uid);
        const avance = items.length ? Math.round(items.reduce((s, a) => s + a.porcentajeAvance, 0) / items.length) : 0;
        const implementadas = items.filter((a) => a.porcentajeAvance >= 100).length;
        return [u.nombre, `${avance}%`, String(items.length), String(implementadas)];
      }),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [91, 61, 240] },
  });
  doc.save(nombreArchivo('cumplimiento-por-responsable', establecimiento));
}

export function exportarBalanceCuentasPDF(params: { establecimiento: Establecimiento; acciones: Accion[]; cuentas: CuentaContable[] }) {
  const { establecimiento, acciones, cuentas } = params;
  const doc = new jsPDF();
  encabezado(doc, 'Balance de Cuentas Contables', establecimiento);
  const filas = cuentas
    .filter((c) => c.nivel === 3)
    .map((c) => {
      const items = acciones.filter((a) => a.cuentaCodigos.includes(c.codigo));
      const total = items.reduce((s, a) => s + a.presupuestoAsignado, 0);
      return { c, items, total };
    })
    .filter((r) => r.items.length > 0)
    .sort((a, b) => b.total - a.total);
  autoTable(doc, {
    startY: 40,
    head: [['Código', 'Cuenta', 'N° Acciones', 'Presupuesto Total']],
    body: filas.map((r) => [r.c.codigo, r.c.nombre, String(r.items.length), `$${r.total.toLocaleString('es-CL')}`]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [91, 61, 240] },
  });
  doc.save(nombreArchivo('balance-cuentas-contables', establecimiento));
}

export function exportarGanttPDF(params: { establecimiento: Establecimiento; acciones: Accion[]; ambitos: Ambito[] }) {
  const { establecimiento, acciones, ambitos } = params;
  const doc = new jsPDF();
  encabezado(doc, 'Carta Gantt de Acciones PME', establecimiento);
  autoTable(doc, {
    startY: 40,
    head: [['Acción', 'Ámbito', 'Inicio', 'Término', 'Avance']],
    body: acciones
      .slice()
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      .map((a) => [a.nombre, ambitos.find((am) => am.id === a.ambitoId)?.nombre ?? '', a.fechaInicio, a.fechaFin, `${a.porcentajeAvance}%`]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [91, 61, 240] },
  });
  doc.save(nombreArchivo('carta-gantt-pme', establecimiento));
}

export function exportarAccionPDF(params: {
  establecimiento: Establecimiento;
  accion: Accion;
  ambito?: Ambito;
  responsable?: Usuario;
  cuentas: CuentaContable[];
  evidencias: Evidencia[];
}) {
  const { establecimiento, accion, ambito, responsable, cuentas, evidencias } = params;
  const doc = new jsPDF();
  encabezado(doc, 'Detalle de Acción PME', establecimiento);
  let y = 40;
  doc.setFontSize(13);
  doc.text(accion.nombre, 14, y);
  y += 8;
  doc.setFontSize(10);
  const lineas: [string, string][] = [
    ['Ámbito', ambito?.nombre ?? '—'],
    ['Responsable', responsable?.nombre ?? '—'],
    ['Objetivo', accion.objetivo],
    ['Indicador', accion.indicador || '—'],
    ['Medio de verificación', accion.medioVerificacion || '—'],
    ['Plazo', `${accion.fechaInicio} → ${accion.fechaFin}`],
    ['Presupuesto', `$${accion.presupuestoAsignado.toLocaleString('es-CL')} (${accion.fuentesFinanciamiento.join(', ') || '—'})`],
    ['Cuentas contables', cuentas.map((c) => `${c.codigo} — ${c.nombre}`).join('; ') || '—'],
    ['Avance', `${accion.porcentajeAvance}%`],
  ];
  lineas.forEach(([label, value]) => {
    const texto = doc.splitTextToSize(`${label}: ${value}`, 180);
    doc.text(texto, 14, y);
    y += 6 * texto.length + 2;
  });
  if (evidencias.length > 0) {
    autoTable(doc, {
      startY: y + 4,
      head: [['Tipo de evidencia', 'Archivo', 'Monto']],
      body: evidencias.map((e) => [TIPO_EVIDENCIA_LABEL[e.tipo], e.nombreArchivo, e.montoAsociado ? `$${e.montoAsociado.toLocaleString('es-CL')}` : '—']),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [91, 61, 240] },
    });
  }
  doc.save(nombreArchivo(`accion-${accion.id.slice(0, 8)}`, establecimiento));
}

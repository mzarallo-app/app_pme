import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { accionesRepo, usuariosRepo, establecimientosRepo, cuentasRepo } from '../lib/repo';
import { AMBITOS_PME } from '../data/ambitosPME';
import ProgressBar from '../components/ProgressBar';
import GanttChart from '../components/GanttChart';
import {
  exportarReportePDF,
  exportarAmbitoPDF,
  exportarCumplimientoPDF,
  exportarCumplimientoPorResponsablePDF,
  exportarBalanceCuentasPDF,
  exportarGanttPDF,
} from '../lib/pdfExport';

type Tab = 'ambito' | 'general' | 'gantt' | 'cumplimiento' | 'responsable' | 'cuentas';

export default function Reportes() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState<Tab>('general');
  const acciones = accionesRepo.listar();
  const usuarios = usuariosRepo.listar();
  const cuentas = cuentasRepo.listar();

  const porAmbito = useMemo(
    () =>
      AMBITOS_PME.map((amb) => {
        const items = acciones.filter((a) => a.ambitoId === amb.id);
        const avance = items.length ? Math.round(items.reduce((s, a) => s + a.porcentajeAvance, 0) / items.length) : 0;
        const presupuesto = items.reduce((s, a) => s + a.presupuestoAsignado, 0);
        return { ambito: amb, items, avance, presupuesto };
      }),
    [acciones],
  );

  const porResponsable = useMemo(
    () =>
      usuarios
        .map((u) => {
          const items = acciones.filter((a) => a.responsableUid === u.uid);
          const avance = items.length ? Math.round(items.reduce((s, a) => s + a.porcentajeAvance, 0) / items.length) : 0;
          const implementadas = items.filter((a) => a.porcentajeAvance >= 100).length;
          return { usuario: u, items, avance, implementadas };
        })
        .filter((r) => r.items.length > 0),
    [acciones, usuarios],
  );

  const balanceCuentas = useMemo(
    () =>
      cuentas
        .filter((c) => c.nivel === 3)
        .map((c) => {
          const items = acciones.filter((a) => a.cuentaCodigos.includes(c.codigo));
          const total = items.reduce((s, a) => s + a.presupuestoAsignado, 0);
          return { cuenta: c, items, total };
        })
        .filter((r) => r.items.length > 0)
        .sort((a, b) => b.total - a.total),
    [acciones, cuentas],
  );

  const avanceGeneral = acciones.length
    ? Math.round(acciones.reduce((s, a) => s + a.porcentajeAvance, 0) / acciones.length)
    : 0;
  const presupuestoTotal = acciones.reduce((s, a) => s + a.presupuestoAsignado, 0);
  const implementadas = acciones.filter((a) => a.porcentajeAvance >= 100).length;
  const cuellosBottella = acciones.filter((a) => a.porcentajeAvance < 25);

  function conEstablecimiento(fn: (est: NonNullable<ReturnType<typeof establecimientosRepo.obtener>>) => void) {
    if (!usuario) return;
    const est = establecimientosRepo.obtener(usuario.establecimientoId);
    if (!est) return;
    fn(est);
  }

  const handlers: Record<Tab, () => void> = {
    general: () => conEstablecimiento((est) => exportarReportePDF({ establecimiento: est, acciones, ambitos: AMBITOS_PME, usuarios })),
    ambito: () => conEstablecimiento((est) => exportarAmbitoPDF({ establecimiento: est, acciones, ambitos: AMBITOS_PME })),
    gantt: () => conEstablecimiento((est) => exportarGanttPDF({ establecimiento: est, acciones, ambitos: AMBITOS_PME })),
    cumplimiento: () => conEstablecimiento((est) => exportarCumplimientoPDF({ establecimiento: est, acciones, ambitos: AMBITOS_PME })),
    responsable: () => conEstablecimiento((est) => exportarCumplimientoPorResponsablePDF({ establecimiento: est, acciones, usuarios })),
    cuentas: () => conEstablecimiento((est) => exportarBalanceCuentasPDF({ establecimiento: est, acciones, cuentas })),
  };

  return (
    <div>
      <div className="topbar">
        <h1>Reportes</h1>
        <button type="button" className="btn btn-primary" onClick={handlers[tab]}>
          Descargar PDF
        </button>
      </div>

      <div className="tabs">
        <button className={tab === 'general' ? 'active' : ''} onClick={() => setTab('general')}>
          General del colegio
        </button>
        <button className={tab === 'ambito' ? 'active' : ''} onClick={() => setTab('ambito')}>
          Por ámbito PME
        </button>
        <button className={tab === 'gantt' ? 'active' : ''} onClick={() => setTab('gantt')}>
          Carta Gantt
        </button>
        <button className={tab === 'cumplimiento' ? 'active' : ''} onClick={() => setTab('cumplimiento')}>
          % de cumplimiento
        </button>
        <button className={tab === 'responsable' ? 'active' : ''} onClick={() => setTab('responsable')}>
          Por responsable
        </button>
        <button className={tab === 'cuentas' ? 'active' : ''} onClick={() => setTab('cuentas')}>
          Balance de cuentas
        </button>
      </div>

      {tab === 'general' && (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-value">{acciones.length}</div>
              <div className="kpi-label">Acciones registradas</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{avanceGeneral}%</div>
              <div className="kpi-label">Avance general</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{implementadas}</div>
              <div className="kpi-label">Implementadas (100%)</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">${presupuestoTotal.toLocaleString('es-CL')}</div>
              <div className="kpi-label">Presupuesto total asignado</div>
            </div>
          </div>
          <div className="card">
            <h2>Cuellos de botella (avance bajo 25%)</h2>
            {cuellosBottella.length === 0 ? (
              <p className="empty-state">No hay acciones con avance crítico.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Ámbito</th>
                    <th>Avance</th>
                  </tr>
                </thead>
                <tbody>
                  {cuellosBottella.map((a) => (
                    <tr key={a.id}>
                      <td>{a.nombre}</td>
                      <td>{AMBITOS_PME.find((am) => am.id === a.ambitoId)?.nombre}</td>
                      <td style={{ width: 140 }}>
                        <ProgressBar porcentaje={a.porcentajeAvance} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'ambito' && (
        <div className="card">
          {porAmbito.map(({ ambito, items, avance, presupuesto }) => (
            <div key={ambito.id} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3>{ambito.nombre}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {items.length} acción{items.length === 1 ? '' : 'es'} · ${presupuesto.toLocaleString('es-CL')}
                </span>
              </div>
              <ProgressBar porcentaje={avance} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{ambito.descripcion}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'gantt' && (
        <div className="card">
          <GanttChart acciones={acciones} />
        </div>
      )}

      {tab === 'cumplimiento' && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Ámbito</th>
                <th>% cumplimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {porAmbito.map(({ ambito, items, avance }) => (
                <tr key={ambito.id}>
                  <td>{ambito.nombre}</td>
                  <td style={{ width: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar porcentaje={avance} />
                      </div>
                      <span>{avance}%</span>
                    </div>
                  </td>
                  <td>{items.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'responsable' && (
        <div className="card">
          {porResponsable.length === 0 ? (
            <p className="empty-state">No hay acciones asignadas todavía.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Responsable</th>
                  <th>% avance promedio</th>
                  <th>Acciones</th>
                  <th>Implementadas</th>
                </tr>
              </thead>
              <tbody>
                {porResponsable.map(({ usuario: u, items, avance, implementadas: impl }) => (
                  <tr key={u.uid}>
                    <td>{u.nombre}</td>
                    <td style={{ width: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar porcentaje={avance} />
                        </div>
                        <span>{avance}%</span>
                      </div>
                    </td>
                    <td>{items.length}</td>
                    <td>{impl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'cuentas' && (
        <div className="card">
          {balanceCuentas.length === 0 ? (
            <p className="empty-state">Ninguna acción tiene cuentas contables asignadas todavía.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th>N° acciones</th>
                  <th>Presupuesto total</th>
                </tr>
              </thead>
              <tbody>
                {balanceCuentas.map(({ cuenta, items, total }) => (
                  <tr key={cuenta.codigo}>
                    <td style={{ fontFamily: 'ui-monospace, monospace' }}>{cuenta.codigo}</td>
                    <td>{cuenta.nombre}</td>
                    <td>{items.length}</td>
                    <td>${total.toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

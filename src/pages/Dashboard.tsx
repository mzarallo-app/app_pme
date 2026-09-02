import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { accionesRepo, usuariosRepo } from '../lib/repo';
import { AMBITOS_PME } from '../data/ambitosPME';
import { ROL_DESCRIPCION } from '../types/usuario';
import AvanceBadge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const { usuario } = useAuth();
  const acciones = accionesRepo.listar();
  const usuarios = usuariosRepo.listar();

  const misAcciones = useMemo(
    () => (usuario?.rol === 'responsable' ? acciones.filter((a) => a.responsableUid === usuario.uid) : acciones),
    [acciones, usuario],
  );

  const totalAcciones = misAcciones.length;
  const completadas = misAcciones.filter((a) => a.porcentajeAvance >= 100).length;
  const atrasadasORezagadas = misAcciones.filter((a) => a.porcentajeAvance < 50).length;
  const presupuestoTotal = misAcciones.reduce((sum, a) => sum + a.presupuestoAsignado, 0);
  const avancePromedio = totalAcciones
    ? Math.round(misAcciones.reduce((sum, a) => sum + a.porcentajeAvance, 0) / totalAcciones)
    : 0;

  const porAmbito = AMBITOS_PME.map((amb) => {
    const deEsteAmbito = misAcciones.filter((a) => a.ambitoId === amb.id);
    const avance = deEsteAmbito.length
      ? Math.round(deEsteAmbito.reduce((s, a) => s + a.porcentajeAvance, 0) / deEsteAmbito.length)
      : 0;
    return { ambito: amb, cantidad: deEsteAmbito.length, avance };
  });

  if (!usuario) return null;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 560 }}>{ROL_DESCRIPCION[usuario.rol]}</p>
        </div>
        <Link to="/acciones" className="btn btn-primary">
          Ver acciones PME
        </Link>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{totalAcciones}</div>
          <div className="kpi-label">{usuario.rol === 'responsable' ? 'Mis acciones' : 'Acciones totales'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{avancePromedio}%</div>
          <div className="kpi-label">Avance promedio</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{completadas}</div>
          <div className="kpi-label">Acciones implementadas (100%)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: atrasadasORezagadas > 0 ? 'var(--danger)' : undefined }}>
            {atrasadasORezagadas}
          </div>
          <div className="kpi-label">Con avance bajo 50% (posible cuello de botella)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">${presupuestoTotal.toLocaleString('es-CL')}</div>
          <div className="kpi-label">Presupuesto asignado</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Avance por ámbito PME</h2>
          <Link to="/reportes">Ver reportes completos →</Link>
        </div>
        {porAmbito.map(({ ambito, cantidad, avance }) => (
          <div key={ambito.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>
                <strong>{ambito.nombre}</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>({cantidad} acción{cantidad === 1 ? '' : 'es'})</span>
              </span>
              <span>{avance}%</span>
            </div>
            <ProgressBar porcentaje={avance} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="section-title">
          <h2>Acciones recientes</h2>
        </div>
        {misAcciones.length === 0 ? (
          <p className="empty-state">Aún no hay acciones registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Acción</th>
                <th>Ámbito</th>
                <th>Responsable</th>
                <th>Avance</th>
              </tr>
            </thead>
            <tbody>
              {misAcciones
                .slice()
                .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
                .slice(0, 6)
                .map((a) => {
                  const ambito = AMBITOS_PME.find((am) => am.id === a.ambitoId);
                  const responsable = usuarios.find((u) => u.uid === a.responsableUid);
                  return (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/acciones/${a.id}`}>{a.nombre}</Link>
                      </td>
                      <td>{ambito?.nombre}</td>
                      <td>{responsable?.nombre ?? '—'}</td>
                      <td>
                        <AvanceBadge nivel={a.nivelAvance} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

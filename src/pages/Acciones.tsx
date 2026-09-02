import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { accionesRepo, usuariosRepo } from '../lib/repo';
import { AMBITOS_PME } from '../data/ambitosPME';
import { puedeCrearAcciones } from '../lib/permisos';
import AvanceBadge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function Acciones() {
  const { usuario } = useAuth();
  const [filtroAmbito, setFiltroAmbito] = useState('todos');
  const [filtroResponsable, setFiltroResponsable] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const acciones = accionesRepo.listar();
  const usuarios = usuariosRepo.listar();

  const filtradas = useMemo(() => {
    return acciones
      .filter((a) => filtroAmbito === 'todos' || a.ambitoId === filtroAmbito)
      .filter((a) => filtroResponsable === 'todos' || a.responsableUid === filtroResponsable)
      .filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [acciones, filtroAmbito, filtroResponsable, busqueda]);

  if (!usuario) return null;

  return (
    <div>
      <div className="topbar">
        <h1>Acciones PME</h1>
        {puedeCrearAcciones(usuario) && (
          <Link to="/acciones/nueva" className="btn btn-primary">
            + Nueva acción
          </Link>
        )}
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar acción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)', minWidth: 220 }}
        />
        <select value={filtroAmbito} onChange={(e) => setFiltroAmbito(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <option value="todos">Todos los ámbitos</option>
          {AMBITOS_PME.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        <select value={filtroResponsable} onChange={(e) => setFiltroResponsable(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <option value="todos">Todos los responsables</option>
          {usuarios.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {filtradas.length === 0 ? (
          <p className="empty-state">No hay acciones que coincidan con el filtro.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Acción</th>
                <th>Ámbito</th>
                <th>Responsable</th>
                <th>Plazo</th>
                <th>Avance</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((a) => {
                const ambito = AMBITOS_PME.find((am) => am.id === a.ambitoId);
                const responsable = usuarios.find((u) => u.uid === a.responsableUid);
                return (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/acciones/${a.id}`}>{a.nombre}</Link>
                    </td>
                    <td>{ambito?.nombre}</td>
                    <td>{responsable?.nombre ?? '—'}</td>
                    <td>{a.fechaInicio} → {a.fechaFin}</td>
                    <td style={{ width: 140 }}>
                      <ProgressBar porcentaje={a.porcentajeAvance} />
                    </td>
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

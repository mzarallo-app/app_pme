import { useMemo, useState } from 'react';
import { cuentasRepo } from '../lib/repo';
import { LIBRO_RENDICION_LABEL, type TipoCuenta } from '../types/cuenta';

export default function PlanDeCuentas() {
  const [tipo, setTipo] = useState<TipoCuenta | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const cuentas = cuentasRepo.listar();

  const filtradas = useMemo(() => {
    return cuentas
      .filter((c) => tipo === 'todos' || c.tipo === tipo)
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.codigo.replace(/\s/g, '').includes(busqueda.replace(/\s/g, '')),
      )
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [cuentas, tipo, busqueda]);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Plan de Cuentas 2026</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Según el Manual de Cuentas para la Rendición de Recursos Destinados a Educación (Superintendencia de
            Educación).
          </p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)', minWidth: 260 }}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCuenta | 'todos')} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <option value="todos">Ingresos y gastos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="gasto">Solo gastos</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th>Libro</th>
              <th>Subvenciones habilitadas</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((c) => (
              <tr key={c.codigo}>
                <td style={{ fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>{c.codigo}</td>
                <td style={{ paddingLeft: (c.nivel - 1) * 18 + 12 }}>
                  <span style={{ fontWeight: c.nivel <= 2 ? 600 : 400 }}>{c.nombre}</span>
                  {c.descripcion && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.descripcion}</div>
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {c.libroRendicion ? LIBRO_RENDICION_LABEL[c.libroRendicion] : '—'}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {c.subvencionesHabilitadas?.join(', ') ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

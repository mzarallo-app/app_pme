import type { Accion } from '../types/pme';
import { NIVEL_AVANCE_INFO } from '../types/pme';

function diffDias(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
}

export default function GanttChart({ acciones }: { acciones: Accion[] }) {
  if (acciones.length === 0) return <p className="empty-state">No hay acciones para graficar.</p>;

  const inicios = acciones.map((a) => a.fechaInicio).sort();
  const fines = acciones.map((a) => a.fechaFin).sort();
  const rangoInicio = inicios[0];
  const rangoFin = fines[fines.length - 1];
  const totalDias = Math.max(1, diffDias(rangoInicio, rangoFin));

  const meses: { label: string; pos: number }[] = [];
  const cursor = new Date(rangoInicio);
  cursor.setDate(1);
  while (cursor <= new Date(rangoFin)) {
    const posDias = diffDias(rangoInicio, cursor.toISOString().slice(0, 10));
    meses.push({ label: cursor.toLocaleDateString('es-CL', { month: 'short' }), pos: (posDias / totalDias) * 100 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div>
      <div style={{ position: 'relative', height: 20, marginLeft: 250, marginBottom: 6 }}>
        {meses.map((m, i) => (
          <span key={i} style={{ position: 'absolute', left: `${m.pos}%`, fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {m.label}
          </span>
        ))}
      </div>
      {acciones.map((a) => {
        const offset = (diffDias(rangoInicio, a.fechaInicio) / totalDias) * 100;
        const width = Math.max(1.5, (diffDias(a.fechaInicio, a.fechaFin) / totalDias) * 100);
        const color = NIVEL_AVANCE_INFO[a.nivelAvance].color;
        return (
          <div className="gantt-row" key={a.id}>
            <div className="gantt-label" title={a.nombre}>
              {a.nombre}
            </div>
            <div className="gantt-track">
              <div
                className="gantt-bar"
                style={{ left: `${offset}%`, width: `${width}%`, background: color }}
                title={`${a.fechaInicio} → ${a.fechaFin} (${a.porcentajeAvance}%)`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

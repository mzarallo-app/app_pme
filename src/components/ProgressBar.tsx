import { NIVEL_AVANCE_INFO, nivelAvanceDesdePorcentaje } from '../types/pme';

export default function ProgressBar({ porcentaje }: { porcentaje: number }) {
  const nivel = nivelAvanceDesdePorcentaje(porcentaje);
  const color = NIVEL_AVANCE_INFO[nivel].color;
  return (
    <div className="progress-bar" title={`${porcentaje}%`}>
      <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%`, background: color }} />
    </div>
  );
}

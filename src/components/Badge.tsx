import type { NivelAvance } from '../types/pme';
import { NIVEL_AVANCE_INFO } from '../types/pme';

export default function AvanceBadge({ nivel }: { nivel: NivelAvance }) {
  const info = NIVEL_AVANCE_INFO[nivel];
  return (
    <span className="badge" style={{ background: `${info.color}22`, color: info.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
      {info.label}
    </span>
  );
}

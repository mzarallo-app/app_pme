import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { accionesRepo, usuariosRepo, cuentasRepo } from '../lib/repo';
import { AMBITOS_PME } from '../data/ambitosPME';
import { FUENTES_FINANCIAMIENTO, nivelAvanceDesdePorcentaje, type FuenteFinanciamiento } from '../types/pme';

export default function AccionForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const existente = id ? accionesRepo.obtener(id) : undefined;
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const usuarios = usuariosRepo.listar();
  const cuentasGasto = cuentasRepo.listar().filter((c) => c.tipo === 'gasto' && c.nivel === 3);

  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [ambitoId, setAmbitoId] = useState(existente?.ambitoId ?? AMBITOS_PME[0].id);
  const [objetivo, setObjetivo] = useState(existente?.objetivo ?? '');
  const [indicador, setIndicador] = useState(existente?.indicador ?? '');
  const [medioVerificacion, setMedioVerificacion] = useState(existente?.medioVerificacion ?? '');
  const [responsableUid, setResponsableUid] = useState(existente?.responsableUid ?? usuario?.uid ?? '');
  const [fechaInicio, setFechaInicio] = useState(existente?.fechaInicio ?? '');
  const [fechaFin, setFechaFin] = useState(existente?.fechaFin ?? '');
  const [presupuestoAsignado, setPresupuestoAsignado] = useState(existente?.presupuestoAsignado ?? 0);
  const [fuentesFinanciamiento, setFuentesFinanciamiento] = useState<FuenteFinanciamiento[]>(
    existente?.fuentesFinanciamiento ?? [],
  );
  const [cuentaCodigos, setCuentaCodigos] = useState<string[]>(existente?.cuentaCodigos ?? []);
  const [porcentajeAvance, setPorcentajeAvance] = useState(existente?.porcentajeAvance ?? 0);
  const [usoATE, setUsoATE] = useState(existente?.usoATE ?? false);
  const [error, setError] = useState<string | null>(null);

  function toggleFuente(f: FuenteFinanciamiento) {
    setFuentesFinanciamiento((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function toggleCuenta(codigo: string) {
    setCuentaCodigos((prev) => (prev.includes(codigo) ? prev.filter((x) => x !== codigo) : [...prev, codigo]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    if (!nombre.trim() || !objetivo.trim() || !responsableUid || !fechaInicio || !fechaFin) {
      setError('Completa los campos obligatorios: nombre, objetivo, responsable y plazos.');
      return;
    }
    if (fechaFin < fechaInicio) {
      setError('La fecha de término no puede ser anterior a la fecha de inicio.');
      return;
    }

    const datos = {
      establecimientoId: usuario.establecimientoId,
      ambitoId,
      nombre: nombre.trim(),
      objetivo: objetivo.trim(),
      indicador: indicador.trim(),
      medioVerificacion: medioVerificacion.trim(),
      responsableUid,
      año: new Date(fechaInicio).getFullYear(),
      fechaInicio,
      fechaFin,
      presupuestoAsignado: Number(presupuestoAsignado) || 0,
      fuentesFinanciamiento,
      cuentaCodigos,
      porcentajeAvance: Number(porcentajeAvance),
      nivelAvance: nivelAvanceDesdePorcentaje(Number(porcentajeAvance)),
      usoATE,
    };

    if (editando && existente) {
      accionesRepo.actualizar(existente.id, datos);
      navigate(`/acciones/${existente.id}`);
    } else {
      const creada = accionesRepo.crear({ ...datos, hitos: [], creadoPorUid: usuario.uid });
      navigate(`/acciones/${creada.id}`);
    }
  }

  return (
    <div>
      <h1>{editando ? 'Editar acción' : 'Nueva acción PME'}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 720, marginTop: 16 }}>
        <div className="field">
          <label>Nombre de la acción *</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Ámbito PME *</label>
            <select value={ambitoId} onChange={(e) => setAmbitoId(e.target.value)}>
              {AMBITOS_PME.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Responsable *</label>
            <select value={responsableUid} onChange={(e) => setResponsableUid(e.target.value)}>
              <option value="">Selecciona...</option>
              {usuarios.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Objetivo *</label>
          <textarea rows={2} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} required />
        </div>

        <div className="field">
          <label>Indicador de seguimiento</label>
          <input value={indicador} onChange={(e) => setIndicador(e.target.value)} placeholder="Ej: % de estudiantes que suben de nivel de logro" />
        </div>

        <div className="field">
          <label>Medio de verificación</label>
          <input value={medioVerificacion} onChange={(e) => setMedioVerificacion(e.target.value)} placeholder="Ej: Informes de avance trimestrales" />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Fecha de inicio *</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
          </div>
          <div className="field">
            <label>Fecha de término *</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Presupuesto asignado (CLP)</label>
            <input type="number" min={0} value={presupuestoAsignado} onChange={(e) => setPresupuestoAsignado(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>% de avance actual</label>
            <input type="number" min={0} max={100} value={porcentajeAvance} onChange={(e) => setPorcentajeAvance(Number(e.target.value))} />
          </div>
        </div>

        <div className="field">
          <label>Cuentas contables asociadas (plan de cuentas 2026)</label>
          <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            {cuentasGasto.map((c) => (
              <label key={c.codigo} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', fontSize: 13 }}>
                <input type="checkbox" checked={cuentaCodigos.includes(c.codigo)} onChange={() => toggleCuenta(c.codigo)} style={{ marginTop: 3 }} />
                <span>
                  {c.codigo} — {c.nombre}
                </span>
              </label>
            ))}
          </div>
          {cuentaCodigos.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {cuentaCodigos.length} cuenta{cuentaCodigos.length === 1 ? '' : 's'} seleccionada{cuentaCodigos.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="field">
          <label>Fuentes de financiamiento</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FUENTES_FINANCIAMIENTO.map((f) => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 999 }}>
                <input type="checkbox" checked={fuentesFinanciamiento.includes(f)} onChange={() => toggleFuente(f)} />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={usoATE} onChange={(e) => setUsoATE(e.target.checked)} />
            Esta acción requiere Asistencia Técnica Educativa (ATE)
          </label>
        </div>

        {error && <p className="error-msg" style={{ marginBottom: 14 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary">
            {editando ? 'Guardar cambios' : 'Crear acción'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

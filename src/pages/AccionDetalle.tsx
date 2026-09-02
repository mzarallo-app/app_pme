import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { accionesRepo, evidenciasRepo, usuariosRepo, cuentasRepo, establecimientosRepo } from '../lib/repo';
import { exportarAccionPDF } from '../lib/pdfExport';
import { AMBITOS_PME } from '../data/ambitosPME';
import { MOTIVOS_NO_EJECUCION, nivelAvanceDesdePorcentaje } from '../types/pme';
import { TIPO_EVIDENCIA_LABEL, type TipoEvidencia } from '../types/evidencia';
import { puedeEditarAccion, puedeSubirEvidencia } from '../lib/permisos';
import { fileToDataUrl, MAX_FILE_BYTES } from '../lib/fileStore';
import { evidenciaSugeridaParaCuentas } from '../lib/evidenciaSugerida';
import AvanceBadge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function AccionDetalle() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [, forceRender] = useState(0);

  const accion = id ? accionesRepo.obtener(id) : undefined;
  const usuarios = usuariosRepo.listar();

  const [tipoEvidencia, setTipoEvidencia] = useState<TipoEvidencia>('factura');
  const [descripcionEvidencia, setDescripcionEvidencia] = useState('');
  const [montoEvidencia, setMontoEvidencia] = useState<number | ''>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorEvidencia, setErrorEvidencia] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [hitoTexto, setHitoTexto] = useState('');
  const [hitoFecha, setHitoFecha] = useState(new Date().toISOString().slice(0, 10));

  if (!usuario) return null;
  if (!accion) {
    return (
      <div>
        <p className="empty-state">Acción no encontrada.</p>
        <Link to="/acciones">← Volver a acciones</Link>
      </div>
    );
  }

  const ambito = AMBITOS_PME.find((a) => a.id === accion.ambitoId);
  const responsable = usuarios.find((u) => u.uid === accion.responsableUid);
  const cuentas = accion.cuentaCodigos.map((c) => cuentasRepo.obtener(c)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const evidencias = evidenciasRepo.listarPorAccion(accion.id);
  const puedeEditar = puedeEditarAccion(usuario, accion);
  const puedeAdjuntar = puedeSubirEvidencia(usuario, accion);
  const sugeridas = evidenciaSugeridaParaCuentas(cuentas);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setErrorEvidencia(null);
    if (!archivo) {
      setErrorEvidencia('Selecciona un archivo.');
      return;
    }
    if (archivo.size > MAX_FILE_BYTES) {
      setErrorEvidencia('El archivo supera el tamaño máximo permitido (4MB) para este modo demo.');
      return;
    }
    setSubiendo(true);
    try {
      const dataUrl = await fileToDataUrl(archivo);
      evidenciasRepo.crear({
        accionId: accion!.id,
        tipo: tipoEvidencia,
        nombreArchivo: archivo.name,
        archivoUrl: dataUrl,
        archivoPath: `local/${accion!.id}/${archivo.name}`,
        tamañoBytes: archivo.size,
        descripcion: descripcionEvidencia || undefined,
        montoAsociado: montoEvidencia === '' ? undefined : Number(montoEvidencia),
        cuentaCodigo: accion!.cuentaCodigos[0],
        subidoPorUid: usuario!.uid,
      });
      setArchivo(null);
      setDescripcionEvidencia('');
      setMontoEvidencia('');
      forceRender((n) => n + 1);
    } finally {
      setSubiendo(false);
    }
  }

  function eliminarEvidencia(evId: string) {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    evidenciasRepo.eliminar(evId);
    forceRender((n) => n + 1);
  }

  function actualizarAvance(pct: number) {
    accionesRepo.actualizar(accion!.id, { porcentajeAvance: pct, nivelAvance: nivelAvanceDesdePorcentaje(pct) });
    forceRender((n) => n + 1);
  }

  function agregarHito(e: FormEvent) {
    e.preventDefault();
    if (!hitoTexto.trim()) return;
    const nuevoHito = { id: crypto.randomUUID(), fecha: hitoFecha, descripcion: hitoTexto.trim(), registradoPorUid: usuario!.uid };
    accionesRepo.actualizar(accion!.id, { hitos: [...accion!.hitos, nuevoHito] });
    setHitoTexto('');
    forceRender((n) => n + 1);
  }

  function eliminarAccion() {
    if (!confirm('¿Eliminar esta acción y toda su evidencia asociada? Esta operación no se puede deshacer.')) return;
    evidenciasRepo.listarPorAccion(accion!.id).forEach((ev) => evidenciasRepo.eliminar(ev.id));
    accionesRepo.eliminar(accion!.id);
    navigate('/acciones');
  }

  function descargarPDF() {
    const est = establecimientosRepo.obtener(usuario!.establecimientoId);
    if (!est) return;
    exportarAccionPDF({ establecimiento: est, accion: accion!, ambito, responsable, cuentas, evidencias });
  }

  return (
    <div>
      <Link to="/acciones">← Volver a acciones</Link>
      <div className="topbar" style={{ marginTop: 10 }}>
        <div>
          <h1>{accion.nombre}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{ambito?.nombre} · Responsable: {responsable?.nombre ?? '—'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn" onClick={descargarPDF}>
            Descargar PDF
          </button>
          {puedeEditar && (
            <>
              <Link to={`/acciones/${accion.id}/editar`} className="btn">
                Editar
              </Link>
              <button type="button" className="btn btn-danger" onClick={eliminarAccion}>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detalle-grid">
        <div>
          <div className="card">
            <h2>Detalle</h2>
            <p style={{ marginBottom: 10 }}>
              <strong>Objetivo:</strong> {accion.objetivo}
            </p>
            {accion.indicador && (
              <p style={{ marginBottom: 10 }}>
                <strong>Indicador:</strong> {accion.indicador}
              </p>
            )}
            {accion.medioVerificacion && (
              <p style={{ marginBottom: 10 }}>
                <strong>Medio de verificación:</strong> {accion.medioVerificacion}
              </p>
            )}
            <p style={{ marginBottom: 10 }}>
              <strong>Plazo:</strong> {accion.fechaInicio} → {accion.fechaFin}
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Presupuesto:</strong> ${accion.presupuestoAsignado.toLocaleString('es-CL')}
              {accion.fuentesFinanciamiento.length > 0 && ` (${accion.fuentesFinanciamiento.join(', ')})`}
            </p>
            {cuentas.length > 0 && (
              <p style={{ marginBottom: 10 }}>
                <strong>Cuentas contables:</strong>{' '}
                {cuentas.map((c) => `${c.codigo} — ${c.nombre}`).join(' · ')}
              </p>
            )}
            {accion.usoATE && (
              <p style={{ marginBottom: 10 }}>
                <strong>Requiere ATE:</strong> Sí
              </p>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>Avance</strong>
                <AvanceBadge nivel={accion.nivelAvance} />
              </div>
              <ProgressBar porcentaje={accion.porcentajeAvance} />
              {puedeEditar && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={accion.porcentajeAvance}
                    onChange={(e) => actualizarAvance(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ width: 42, textAlign: 'right' }}>{accion.porcentajeAvance}%</span>
                </div>
              )}
            </div>

            {accion.porcentajeAvance < 100 && (
              <div className="field" style={{ marginTop: 14 }}>
                <label>Motivo de avance parcial / no ejecución</label>
                <select
                  value={accion.motivoNoEjecucionCodigo ?? ''}
                  onChange={(e) =>
                    puedeEditar &&
                    (accionesRepo.actualizar(accion.id, {
                      motivoNoEjecucionCodigo: e.target.value ? Number(e.target.value) : undefined,
                    }),
                    forceRender((n) => n + 1))
                  }
                  disabled={!puedeEditar}
                >
                  <option value="">Sin especificar</option>
                  {MOTIVOS_NO_EJECUCION.map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.texto}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <h2>Hitos de progreso</h2>
            {accion.hitos.length === 0 ? (
              <p className="empty-state">Sin hitos registrados aún.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {accion.hitos
                  .slice()
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .map((h) => (
                    <li key={h.id} style={{ marginBottom: 8 }}>
                      <strong>{h.fecha}</strong> — {h.descripcion}
                    </li>
                  ))}
              </ul>
            )}
            {puedeEditar && (
              <form onSubmit={agregarHito} className="field-row" style={{ marginTop: 14, alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: '0 0 150px' }}>
                  <label>Fecha</label>
                  <input type="date" value={hitoFecha} onChange={(e) => setHitoFecha(e.target.value)} />
                </div>
                <div className="field">
                  <label>Descripción del hito</label>
                  <input value={hitoTexto} onChange={(e) => setHitoTexto(e.target.value)} placeholder="Ej: Se realizó la primera sesión del taller" />
                </div>
                <button type="submit" className="btn" style={{ marginBottom: 14 }}>
                  Agregar
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Evidencia</h2>
          {evidencias.length === 0 ? (
            <p className="empty-state">Sin evidencia adjunta.</p>
          ) : (
            <div className="file-list" style={{ marginBottom: 16 }}>
              {evidencias.map((ev) => (
                <div className="file-item" key={ev.id}>
                  <div>
                    <a href={ev.archivoUrl} download={ev.nombreArchivo} style={{ fontWeight: 500 }}>
                      {ev.nombreArchivo}
                    </a>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {TIPO_EVIDENCIA_LABEL[ev.tipo]}
                      {ev.montoAsociado ? ` · $${ev.montoAsociado.toLocaleString('es-CL')}` : ''}
                    </div>
                  </div>
                  {puedeAdjuntar && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminarEvidencia(ev.id)}>
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {puedeAdjuntar && (
            <form onSubmit={handleUpload}>
              <div className="field">
                <label>Tipo de evidencia</label>
                <select value={tipoEvidencia} onChange={(e) => setTipoEvidencia(e.target.value as TipoEvidencia)}>
                  {Object.entries(TIPO_EVIDENCIA_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                      {sugeridas.includes(k as TipoEvidencia) ? ' (sugerido)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Archivo</label>
                <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              </div>
              <div className="field">
                <label>Descripción (opcional)</label>
                <input value={descripcionEvidencia} onChange={(e) => setDescripcionEvidencia(e.target.value)} />
              </div>
              <div className="field">
                <label>Monto asociado (opcional)</label>
                <input type="number" min={0} value={montoEvidencia} onChange={(e) => setMontoEvidencia(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              {errorEvidencia && <p className="error-msg" style={{ marginBottom: 12 }}>{errorEvidencia}</p>}
              <button type="submit" className="btn btn-primary" disabled={subiendo} style={{ width: '100%', justifyContent: 'center' }}>
                {subiendo ? 'Subiendo...' : 'Adjuntar evidencia'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usuariosRepo } from '../lib/repo';
import { ROL_LABEL, type Rol } from '../types/usuario';
import { puedeGestionarUsuarios } from '../lib/permisos';

export default function Usuarios() {
  const { usuario } = useAuth();
  const [, forceRender] = useState(0);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Rol>('responsable');
  const [error, setError] = useState<string | null>(null);

  if (!usuario) return null;
  if (!puedeGestionarUsuarios(usuario)) return <Navigate to="/" replace />;

  const usuarios = usuariosRepo.listar();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || !email.trim()) {
      setError('Completa nombre y correo.');
      return;
    }
    if (usuariosRepo.obtenerPorEmail(email.trim())) {
      setError('Ya existe un usuario con ese correo.');
      return;
    }
    usuariosRepo.crear({
      nombre: nombre.trim(),
      email: email.trim(),
      rol,
      establecimientoId: usuario!.establecimientoId,
      activo: true,
    });
    setNombre('');
    setEmail('');
    setRol('responsable');
    forceRender((n) => n + 1);
  }

  function cambiarRol(uid: string, nuevoRol: Rol) {
    usuariosRepo.actualizarRol(uid, nuevoRol);
    forceRender((n) => n + 1);
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
        Crea usuarios y asigna sus roles dentro del establecimiento.
      </p>

      <div className="card" style={{ maxWidth: 640, marginBottom: 18 }}>
        <h2>Nuevo usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Nombre completo *</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="field">
              <label>Correo institucional *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              {(Object.keys(ROL_LABEL) as Rol[]).map((r) => (
                <option key={r} value={r}>
                  {ROL_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="error-msg" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary">
            Crear usuario
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Usuarios del establecimiento</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.uid}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td style={{ width: 200 }}>
                  <select value={u.rol} onChange={(e) => cambiarRol(u.uid, e.target.value as Rol)}>
                    {(Object.keys(ROL_LABEL) as Rol[]).map((r) => (
                      <option key={r} value={r}>
                        {ROL_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

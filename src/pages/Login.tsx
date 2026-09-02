import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usuariosRepo } from '../lib/repo';
import { ROL_LABEL } from '../types/usuario';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const usuariosDemo = usuariosRepo.listar();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = iniciarSesion(email);
    if (!res.ok) {
      setError(res.error ?? 'No se pudo iniciar sesión.');
      return;
    }
    navigate('/');
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1>App PME</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
          Gestión financiera y de subvenciones del Plan de Mejoramiento Educativo.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Correo institucional</label>
            <input
              id="email"
              type="email"
              placeholder="nombre@establecimiento.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Ingresar
          </button>
        </form>

        <div className="login-demo">
          <strong>Modo demo</strong> — esta app corre en modo local (sin servidor).
          Usa uno de estos usuarios de ejemplo:
          {usuariosDemo.map((u) => (
            <button key={u.uid} type="button" className="btn btn-sm" onClick={() => setEmail(u.email)}>
              {u.email} · {ROL_LABEL[u.rol]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

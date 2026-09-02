import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROL_LABEL } from '../types/usuario';
import { puedeGestionarUsuarios } from '../lib/permisos';

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          App <span>PME</span>
        </div>
        <nav>
          <NavLink to="/" end>
            Panel
          </NavLink>
          <NavLink to="/acciones">Acciones PME</NavLink>
          <NavLink to="/reportes">Reportes</NavLink>
          <NavLink to="/plan-de-cuentas">Plan de Cuentas</NavLink>
          {puedeGestionarUsuarios(usuario) && <NavLink to="/usuarios">Usuarios</NavLink>}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{usuario.nombre}</div>
          <div className="sidebar-user-rol">{ROL_LABEL[usuario.rol]}</div>
          <button type="button" className="btn btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

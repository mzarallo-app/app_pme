import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Usuario } from '../types/usuario';
import { usuariosRepo } from '../lib/repo';

const SESSION_KEY = 'app_pme_session_uid';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string) => { ok: boolean; error?: string };
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem(SESSION_KEY);
    if (uid) {
      const u = usuariosRepo.obtener(uid);
      if (u) setUsuario(u);
    }
    setCargando(false);
  }, []);

  function iniciarSesion(email: string) {
    const u = usuariosRepo.obtenerPorEmail(email.trim());
    if (!u) return { ok: false, error: 'No existe un usuario con ese correo.' };
    if (!u.activo) return { ok: false, error: 'Este usuario está deshabilitado.' };
    localStorage.setItem(SESSION_KEY, u.uid);
    setUsuario(u);
    return { ok: true };
  }

  function cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

import type { Usuario } from '../types/usuario';
import type { Accion } from '../types/pme';

export function puedeCrearAcciones(usuario: Usuario): boolean {
  return usuario.rol === 'responsable' || usuario.rol === 'jefe_utp';
}

export function puedeEditarAccion(usuario: Usuario, accion: Accion): boolean {
  if (usuario.rol === 'jefe_utp') return true;
  if (usuario.rol === 'responsable') return accion.responsableUid === usuario.uid;
  return false;
}

export function puedeSubirEvidencia(usuario: Usuario, accion: Accion): boolean {
  return puedeEditarAccion(usuario, accion);
}

export function puedeAsignarCuentas(usuario: Usuario): boolean {
  return usuario.rol === 'jefe_utp' || usuario.rol === 'responsable';
}

export function puedeGestionarUsuarios(usuario: Usuario): boolean {
  return usuario.rol === 'jefe_utp' || usuario.rol === 'director';
}

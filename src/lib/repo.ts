import { getAll, getById, upsert, remove, generateId } from './localDb';
import type { Usuario } from '../types/usuario';
import type { Establecimiento } from '../types/establecimiento';
import type { Accion } from '../types/pme';
import type { Evidencia } from '../types/evidencia';
import type { CuentaContable } from '../types/cuenta';

const COL = {
  usuarios: 'usuarios',
  establecimientos: 'establecimientos',
  acciones: 'acciones',
  evidencias: 'evidencias',
  cuentas: 'cuentas',
};

type UsuarioAlmacenado = Usuario & { id: string };

export const usuariosRepo = {
  listar: () => getAll<UsuarioAlmacenado>(COL.usuarios),
  obtener: (uid: string) => getById<UsuarioAlmacenado>(COL.usuarios, uid),
  obtenerPorEmail: (email: string) =>
    getAll<UsuarioAlmacenado>(COL.usuarios).find((u) => u.email.toLowerCase() === email.toLowerCase()),
  guardar: (u: Usuario) => upsert<UsuarioAlmacenado>(COL.usuarios, { ...u, id: u.uid }),
  crear: (u: Omit<Usuario, 'uid'>) => {
    const uid = `u-${generateId()}`;
    return upsert<UsuarioAlmacenado>(COL.usuarios, { ...u, uid, id: uid });
  },
  actualizarRol: (uid: string, rol: Usuario['rol']) => {
    const actual = getById<UsuarioAlmacenado>(COL.usuarios, uid);
    if (!actual) throw new Error('Usuario no encontrado');
    return upsert<UsuarioAlmacenado>(COL.usuarios, { ...actual, rol });
  },
  eliminar: (uid: string) => remove(COL.usuarios, uid),
};

export const establecimientosRepo = {
  listar: () => getAll<Establecimiento>(COL.establecimientos),
  obtener: (id: string) => getById<Establecimiento>(COL.establecimientos, id),
  guardar: (e: Establecimiento) => upsert(COL.establecimientos, e),
};

export const accionesRepo = {
  listar: () => getAll<Accion>(COL.acciones),
  obtener: (id: string) => getById<Accion>(COL.acciones, id),
  guardar: (a: Accion) => upsert(COL.acciones, a),
  eliminar: (id: string) => remove(COL.acciones, id),
  crear: (a: Omit<Accion, 'id' | 'creadoEn' | 'actualizadoEn'>) => {
    const now = new Date().toISOString();
    const nueva: Accion = { ...a, id: generateId(), creadoEn: now, actualizadoEn: now };
    return upsert(COL.acciones, nueva);
  },
  actualizar: (id: string, cambios: Partial<Accion>) => {
    const actual = getById<Accion>(COL.acciones, id);
    if (!actual) throw new Error('Acción no encontrada');
    const actualizada: Accion = { ...actual, ...cambios, actualizadoEn: new Date().toISOString() };
    return upsert(COL.acciones, actualizada);
  },
};

export const evidenciasRepo = {
  listarPorAccion: (accionId: string) => getAll<Evidencia>(COL.evidencias).filter((e) => e.accionId === accionId),
  listar: () => getAll<Evidencia>(COL.evidencias),
  crear: (e: Omit<Evidencia, 'id' | 'fechaCarga'>) =>
    upsert(COL.evidencias, { ...e, id: generateId(), fechaCarga: new Date().toISOString() }),
  eliminar: (id: string) => remove(COL.evidencias, id),
};

export const cuentasRepo = {
  listar: () => getAll<CuentaContable>(COL.cuentas),
  obtener: (codigo: string) => getAll<CuentaContable>(COL.cuentas).find((c) => c.codigo === codigo),
  guardarTodas: (cuentas: CuentaContable[]) => {
    cuentas.forEach((c) => upsert<CuentaContable & { id: string }>(COL.cuentas, { ...c, id: c.codigo }));
  },
};

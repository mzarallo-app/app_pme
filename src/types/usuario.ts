export type Rol = 'responsable' | 'jefe_utp' | 'director';

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  rol: Rol;
  establecimientoId: string;
  activo: boolean;
}

export const ROL_LABEL: Record<Rol, string> = {
  responsable: 'Personal Responsable',
  jefe_utp: 'Jefe UTP',
  director: 'Director',
};

export const ROL_DESCRIPCION: Record<Rol, string> = {
  responsable:
    'Ingresa la información requerida por el sistema y adjunta la evidencia de las acciones a su cargo.',
  jefe_utp:
    'Controla por oposición el trabajo de los profesores y supervisa el avance del PME por ámbito.',
  director:
    'Responsable principal del sistema. Visualiza el cuadro de mando del PME a 4 años, el avance anual e identifica cuellos de botella.',
};

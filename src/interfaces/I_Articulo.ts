// src/interfaces/I_Articulo.ts
export interface I_Articulo {
    id?: number;
    codigo?: string;
    nombre: string;
    descripcion?: string;
    unidadMedida: string;
    stockMinimo: number;
    stockMaximo: number;
    stockActual: number;
    fechaRegistro?: Date;
    activo?: boolean;
}
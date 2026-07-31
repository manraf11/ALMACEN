// src/interfaces/I_Requisicion.ts
import { I_Articulo } from "./I_Articulo.js";

export interface IDetalleRequisicion {
    articuloId: number;
    articulo?: I_Articulo;
    cantidadSolicitada: number;
    cantidadDespachada: number;
    observaciones?: string;
}

export interface I_Requisicion {
    id?: number;
    numeroRequisicion?: string;
    departamentoId: number;
    tipo: 'ORDINARIA' | 'EXTRAORDINARIA';
    fechaSolicitud?: Date;
    periodoMes: number;
    periodoAnio: number;
    estado: 'PENDIENTE' | 'APROBADA' | 'PARCIAL' | 'RECHAZADA';
    fechaAprobacion?: Date | null;
    detalles: IDetalleRequisicion[];
    observaciones?: string;
    usuarioSolicita?: string;
}
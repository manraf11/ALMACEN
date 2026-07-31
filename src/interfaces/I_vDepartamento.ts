// src/interfaces/I_vDepartamento.ts
import Cl_mRequisicion from "../models/Cl_mRequisicion.js";
import Cl_mArticulo from "../models/Cl_mArticulo.js";
import Cl_mDepartamento from "../models/Cl_mDepartamento.js";

export interface I_vDepartamento {
    // Eventos
    cuandoEnviarRequisicion(callback: (datos: {
        departamentoId: number;
        tipo: 'ORDINARIA' | 'EXTRAORDINARIA';
        observaciones: string;
        detalles: { articuloId: number; cantidad: number }[];
    }) => void): void;

    cuandoVerHistorial(callback: (departamentoId: number) => void): void;

    // Métodos para mostrar
    mostrarDepartamento(departamento: Cl_mDepartamento): void;
    mostrarArticulosDisponibles(articulos: Cl_mArticulo[]): void;
    mostrarHistorial(requisiciones: Cl_mRequisicion[]): void;
    mostrarEstadoRequisicion(estado: {
        periodoAbierto: boolean;
        fechaInicio: string;
        fechaFin: string;
        mensaje: string;
    }): void;
    mostrarDetalleRequisicion(requisicion: Cl_mRequisicion): void;
    mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' | 'info'): void;
    limpiarFormulario(): void;
}
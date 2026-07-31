// src/interfaces/I_vAlmacenista.ts
import Cl_mArticulo from "../models/Cl_mArticulo.js";
import Cl_mRequisicion from "../models/Cl_mRequisicion.js";
import Cl_mEntrada from "../models/Cl_mEntrada.js";

export interface I_vAlmacenista {
    // Eventos que la vista emite al controlador
    cuandoRegistrarArticulo(callback: (datos: {
        nombre: string;
        descripcion: string;
        unidadMedida: string;
        stockMinimo: number;
        stockMaximo: number;
        stockActual: number;
    }) => void): void;

    cuandoRegistrarEntrada(callback: (datos: {
        codigoArticulo: string;
        cantidad: number;
        numeroFactura: string;
        proveedor: string;
        observaciones: string;
    }) => void): void;

    cuandoAprobarRequisicion(callback: (idRequisicion: number) => void): void;

    cuandoDespacharRequisicion(callback: (idRequisicion: number, detalles: {
        articuloId: number;
        cantidad: number;
    }[]) => void): void;

    cuandoRechazarRequisicion(callback: (idRequisicion: number) => void): void;

    cuandoCargarReporteMensual(callback: (mes: number, anio: number) => void): void;

    // Métodos para mostrar datos
    mostrarArticulos(articulos: Cl_mArticulo[]): void;
    mostrarEntradas(entradas: Cl_mEntrada[]): void;
    mostrarRequisiciones(requisiciones: Cl_mRequisicion[]): void;
    mostrarAlertas(alertas: { tipo: 'minimo' | 'maximo'; mensaje: string }[]): void;
    mostrarDashboard(datos: {
        totalArticulos: number;
        entradasMes: number;
        salidasMes: number;
    }): void;
    mostrarReporteMensual(reporte: any): void;
    mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' | 'info'): void;
    limpiarFormularios(): void;
}
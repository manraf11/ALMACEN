// src/interfaces/I_vDirector.ts

export interface I_vDirector {
    // Eventos
    cuandoSolicitarReporte(callback: (tipo: 'mensual' | 'trimestral' | 'semestral' | 'anual', mes: number, anio: number) => void): void;
    cuandoSolicitarEstadisticas(callback: (tipo: 'productos' | 'departamentos' | 'extraordinarias') => void): void;

    // Métodos para mostrar
    mostrarResumenGeneral(datos: {
        totalArticulos: number;
        totalDepartamentos: number;
        totalRequisiciones: number;
        totalRequisicionesExtraordinarias: number;
    }): void;

    mostrarReporte(reporte: any): void;
    mostrarEstadisticas(datos: {
        productosMasSolicitados: { nombre: string; cantidad: number }[];
        departamentosMasConsumidores: { nombre: string; cantidad: number }[];
        requisicionesExtraordinarias: { departamento: string; articulo: string; cantidad: number }[];
    }): void;

    mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' | 'info'): void;
    exportarReporte(formato: 'pdf' | 'excel'): void;
}
// src/controllers/Cl_cReportes.ts
import Cl_mAlmacen from "../models/Cl_mAlmacen.js";
import { I_vDirector } from "../interfaces/I_vDirector.js";

export default class Cl_cReportes {
    private almacen: Cl_mAlmacen;
    private vista: I_vDirector;

    constructor(almacen: Cl_mAlmacen, vista: I_vDirector) {
        this.almacen = almacen;
        this.vista = vista;
        this.registrarEventos();
        this.cargarDatosIniciales();
    }

    private registrarEventos(): void {
        const yoMismo = this;

        this.vista.cuandoSolicitarReporte((tipo, mes, anio) => yoMismo.generarReporte(tipo, mes, anio));
        this.vista.cuandoSolicitarEstadisticas((tipo) => yoMismo.generarEstadisticas(tipo));
    }

    private cargarDatosIniciales(): void {
        // Mostrar resumen general
        this.vista.mostrarResumenGeneral(this.almacen.obtenerResumenGeneral());

        // Cargar estadísticas iniciales
        this.generarEstadisticas('productos');
    }

    private generarReporte(tipo: 'mensual' | 'trimestral' | 'semestral' | 'anual', mes: number, anio: number): void {
        let reporte = null;

        switch (tipo) {
            case 'mensual':
                reporte = this.almacen.generarReporteMensual(mes, anio);
                break;
            case 'trimestral':
                const trimestre = Math.ceil(mes / 3);
                reporte = this.almacen.generarReporteTrimestral(trimestre, anio);
                break;
            case 'semestral':
                const semestre = mes <= 6 ? 1 : 2;
                reporte = this.almacen.generarReporteSemestral(semestre, anio);
                break;
            case 'anual':
                reporte = this.almacen.generarReporteAnual(anio);
                break;
        }

        this.vista.mostrarReporte(reporte);
        this.vista.mostrarMensaje(`📊 Reporte ${tipo} generado`, "info");
    }

    private generarEstadisticas(tipo: 'productos' | 'departamentos' | 'extraordinarias'): void {
        let productosMasSolicitados: { nombre: string; cantidad: number }[] = [];
        let departamentosMasConsumidores: { nombre: string; cantidad: number }[] = [];
        let requisicionesExtraordinarias: { departamento: string; articulo: string; cantidad: number }[] = [];

        if (tipo === 'productos' || tipo === 'departamentos') {
            productosMasSolicitados = this.almacen.obtenerProductosMasSolicitados(10);
            departamentosMasConsumidores = this.almacen.obtenerDepartamentosMasConsumidores(10);
        }

        if (tipo === 'extraordinarias' || tipo === 'departamentos') {
            requisicionesExtraordinarias = this.almacen.obtenerEstadisticasExtraordinarias();
        }

        this.vista.mostrarEstadisticas({
            productosMasSolicitados,
            departamentosMasConsumidores,
            requisicionesExtraordinarias
        });

        const mensajes = {
            productos: '📊 Estadísticas de productos más solicitados',
            departamentos: '📊 Estadísticas de departamentos más consumidores',
            extraordinarias: '📊 Estadísticas de requisiciones extraordinarias'
        };
        this.vista.mostrarMensaje(mensajes[tipo], "info");
    }
}
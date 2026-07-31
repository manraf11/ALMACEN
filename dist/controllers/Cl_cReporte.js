export default class Cl_cReportes {
    almacen;
    vista;
    constructor(almacen, vista) {
        this.almacen = almacen;
        this.vista = vista;
        this.registrarEventos();
        this.cargarDatosIniciales();
    }
    registrarEventos() {
        const yoMismo = this;
        this.vista.cuandoSolicitarReporte((tipo, mes, anio) => yoMismo.generarReporte(tipo, mes, anio));
        this.vista.cuandoSolicitarEstadisticas((tipo) => yoMismo.generarEstadisticas(tipo));
    }
    cargarDatosIniciales() {
        // Mostrar resumen general
        this.vista.mostrarResumenGeneral(this.almacen.obtenerResumenGeneral());
        // Cargar estadísticas iniciales
        this.generarEstadisticas('productos');
    }
    generarReporte(tipo, mes, anio) {
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
    generarEstadisticas(tipo) {
        let productosMasSolicitados = [];
        let departamentosMasConsumidores = [];
        let requisicionesExtraordinarias = [];
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
//# sourceMappingURL=Cl_cReporte.js.map
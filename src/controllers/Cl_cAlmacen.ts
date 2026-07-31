// src/controllers/Cl_cAlmacen.ts
import Cl_mAlmacen from "../models/Cl_mAlmacen.js";
import Cl_mArticulo from "../models/Cl_mArticulo.js";
import Cl_mEntrada from "../models/Cl_mEntrada.js";
import Cl_mSalida from "../models/Cl_mSalida.js";
import Cl_mRequisicion from "../models/Cl_mRequisicion.js";
import Cl_mDepartamento from "../models/Cl_mDepartamento.js";
import { I_vAlmacenista } from "../interfaces/I_vAlmacenista.js";
import Cl_sDatabase from "../services/Cl_sDatabase.js";

export default class Cl_cAlmacen {
    private almacen: Cl_mAlmacen;
    private vista: I_vAlmacenista;

    constructor(vista: I_vAlmacenista) {
        this.almacen = new Cl_mAlmacen();
        this.vista = vista;
        this.registrarEventos();
        this.cargarDatosEjemplo();
    }

    private registrarEventos(): void {
        const yoMismo = this;

        this.vista.cuandoRegistrarArticulo((datos) => yoMismo.registrarArticulo(datos));
        this.vista.cuandoRegistrarEntrada((datos) => yoMismo.registrarEntrada(datos));
        this.vista.cuandoAprobarRequisicion((id) => yoMismo.aprobarRequisicion(id));
        this.vista.cuandoDespacharRequisicion((id, detalles) => yoMismo.despacharRequisicion(id, detalles));
        this.vista.cuandoRechazarRequisicion((id) => yoMismo.rechazarRequisicion(id));
        this.vista.cuandoCargarReporteMensual((mes, anio) => yoMismo.cargarReporteMensual(mes, anio));
    }

    private cargarDatosEjemplo(): void {
        // Departamentos de ejemplo
        const dept1 = new Cl_mDepartamento({
            id: 1,
            nombre: "Despacho del Contralor",
            responsable: "Ana Luisa Gómez",
            cargo: "Contralora del Estado Lara (P)"
        });
        const dept2 = new Cl_mDepartamento({
            id: 2,
            nombre: "Dirección de Administración",
            responsable: "Ana Barrios",
            cargo: "Directora de Administración"
        });
        const dept3 = new Cl_mDepartamento({
            id: 3,
            nombre: "Dirección de Talento Humano",
            responsable: "Sylvi De Abreu",
            cargo: "Directora de Talento Humano"
        });

        this.almacen.agregarDepartamento(dept1);
        this.almacen.agregarDepartamento(dept2);
        this.almacen.agregarDepartamento(dept3);

        // Artículos de ejemplo
        const art1 = new Cl_mArticulo({
            nombre: "Papel Bond Carta",
            unidadMedida: "RESMA",
            stockMinimo: 5,
            stockMaximo: 50,
            stockActual: 30
        });

        const art2 = new Cl_mArticulo({
            nombre: "Tóner HP 78A",
            unidadMedida: "UNIDAD",
            stockMinimo: 3,
            stockMaximo: 20,
            stockActual: 8
        });

        const art3 = new Cl_mArticulo({
            nombre: "Lapiceros",
            unidadMedida: "UNIDAD",
            stockMinimo: 10,
            stockMaximo: 100,
            stockActual: 45
        });

        const art4 = new Cl_mArticulo({
            nombre: "Marcadores de Pizarra",
            unidadMedida: "UNIDAD",
            stockMinimo: 5,
            stockMaximo: 30,
            stockActual: 12
        });

        this.almacen.agregarArticulo(art1);
        this.almacen.agregarArticulo(art2);
        this.almacen.agregarArticulo(art3);
        this.almacen.agregarArticulo(art4);

        // Algunas entradas de ejemplo
        const entrada1 = new Cl_mEntrada({
            articulo: art1,
            cantidad: 10,
            numeroFactura: "FAC-2026-001",
            proveedor: "Papelera Central",
            fecha: new Date(2026, 0, 5)
        });

        const entrada2 = new Cl_mEntrada({
            articulo: art2,
            cantidad: 5,
            numeroFactura: "FAC-2026-002",
            proveedor: "HP Venezuela",
            fecha: new Date(2026, 0, 10)
        });

        this.almacen.registrarEntrada(entrada1);
        this.almacen.registrarEntrada(entrada2);

        // Actualizar la vista
        this.actualizarVista();
    }

    private registrarArticulo(datos: any): void {
        const articulo = new Cl_mArticulo({
            nombre: datos.nombre,
            descripcion: datos.descripcion || "",
            unidadMedida: datos.unidadMedida,
            stockMinimo: datos.stockMinimo || 5,
            stockMaximo: datos.stockMaximo || 100,
            stockActual: datos.stockActual || 0
        });

        this.almacen.agregarArticulo(articulo);
        this.vista.mostrarMensaje(`✅ Artículo "${articulo.nombre}" registrado con código ${articulo.codigo}`, "exito");
        this.actualizarVista();
    }

    private registrarEntrada(datos: any): void {
        const articulo = this.almacen.buscarArticuloPorCodigo(datos.codigoArticulo);
        if (!articulo) {
            this.vista.mostrarMensaje("❌ Artículo no encontrado", "error");
            return;
        }

        const entrada = new Cl_mEntrada({
            articulo: articulo,
            cantidad: datos.cantidad,
            numeroFactura: datos.numeroFactura,
            proveedor: datos.proveedor || "",
            observaciones: datos.observaciones || "",
            fecha: new Date()
        });

        this.almacen.registrarEntrada(entrada);
        this.vista.mostrarMensaje(`✅ Entrada registrada: ${datos.cantidad} ${articulo.unidadMedida} de "${articulo.nombre}"`, "exito");
        this.actualizarVista();
    }

    private aprobarRequisicion(idRequisicion: number): void {
        const req = this.almacen.buscarRequisicionPorId(idRequisicion);
        if (!req) {
            this.vista.mostrarMensaje("❌ Requisición no encontrada", "error");
            return;
        }

        req.aprobar();
        this.vista.mostrarMensaje(`✅ Requisición ${req.numeroRequisicion} aprobada`, "exito");
        this.actualizarVista();
    }

    private despacharRequisicion(idRequisicion: number, detalles: { articuloId: number; cantidad: number }[]): void {
        const req = this.almacen.buscarRequisicionPorId(idRequisicion);
        if (!req) {
            this.vista.mostrarMensaje("❌ Requisición no encontrada", "error");
            return;
        }

        let despachado = false;

        for (let i = 0; i < detalles.length; i++) {
            const d = detalles[i];
            const articulo = this.almacen.buscarArticuloPorId(d.articuloId);
            if (!articulo) continue;

            // Buscar el detalle de la requisición
            let encontrado = false;
            for (let j = 0; j < req.detalles.length; j++) {
                if (req.detalles[j].articulo.id === d.articuloId) {
                    // Despachar
                    const pendiente = req.detalles[j].cantidadSolicitada - req.detalles[j].cantidadDespachada;
                    const cantidadADespachar = Math.min(d.cantidad, pendiente);
                    
                    if (cantidadADespachar > 0) {
                        req.detalles[j].cantidadDespachada += cantidadADespachar;
                        articulo.actualizarStock(-cantidadADespachar);
                        
                        // Registrar salida
                        const salida = new Cl_mSalida({
                            articulo: articulo,
                            cantidad: cantidadADespachar,
                            requisicionId: req.id,
                            fecha: new Date()
                        });
                        this.almacen.registrarSalida(salida);
                        despachado = true;
                    }
                    encontrado = true;
                    break;
                }
            }
        }

        if (despachado) {
            // Actualizar estado de la requisición
            if (req.estaCompleta()) {
                req.aprobar();
            } else {
                req.aprobarParcial();
            }
            
            this.vista.mostrarMensaje(`✅ Despacho completado para ${req.numeroRequisicion}`, "exito");
            this.actualizarVista();
        } else {
            this.vista.mostrarMensaje("⚠️ No se pudo despachar ningún artículo", "info");
        }
    }

    private rechazarRequisicion(idRequisicion: number): void {
        const req = this.almacen.buscarRequisicionPorId(idRequisicion);
        if (!req) {
            this.vista.mostrarMensaje("❌ Requisición no encontrada", "error");
            return;
        }

        req.rechazar();
        this.vista.mostrarMensaje(`❌ Requisición ${req.numeroRequisicion} rechazada`, "error");
        this.actualizarVista();
    }

    private cargarReporteMensual(mes: number, anio: number): void {
        const reporte = this.almacen.generarReporteMensual(mes, anio);
        this.vista.mostrarReporteMensual(reporte);
        this.vista.mostrarMensaje(`📊 Reporte mensual ${mes}/${anio} generado`, "info");
    }

    private actualizarVista(): void {
        // Actualizar artículos
        this.vista.mostrarArticulos(this.almacen.obtenerArticulos());

        // Actualizar entradas
        this.vista.mostrarEntradas(this.almacen.obtenerEntradas());

        // Actualizar requisiciones pendientes
        this.vista.mostrarRequisiciones(this.almacen.obtenerRequisicionesPendientes());

        // Actualizar alertas
        const alertasMinimo = this.almacen.obtenerArticulosEnMinimo().map(a => ({
            tipo: 'minimo' as const,
            mensaje: a.verificarAlerta().mensaje
        }));
        const alertasMaximo = this.almacen.obtenerArticulosEnMaximo().map(a => ({
            tipo: 'maximo' as const,
            mensaje: a.verificarAlerta().mensaje
        }));
        this.vista.mostrarAlertas([...alertasMinimo, ...alertasMaximo]);

        // Actualizar dashboard
        this.vista.mostrarDashboard(this.almacen.obtenerDashboard());

        // Limpiar formularios
        this.vista.limpiarFormularios();
    }

    // Método para obtener datos para otras vistas
    public obtenerArticulos(): Cl_mArticulo[] {
        return this.almacen.obtenerArticulos();
    }

    public obtenerDepartamentos(): Cl_mDepartamento[] {
        return this.almacen.obtenerDepartamentos();
    }

    public obtenerAlmacen(): Cl_mAlmacen {
        return this.almacen;
    }
}
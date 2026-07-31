// src/controllers/Cl_cRequisicion.ts
import Cl_mAlmacen from "../models/Cl_mAlmacen.js";
import Cl_mRequisicion from "../models/Cl_mRequisicion.js";
import Cl_mDepartamento from "../models/Cl_mDepartamento.js";
import Cl_mArticulo from "../models/Cl_mArticulo.js";
import { I_vDepartamento } from "../interfaces/I_vDepartamento.js";

export default class Cl_cRequisicion {
    private almacen: Cl_mAlmacen;
    private vista: I_vDepartamento;

    constructor(almacen: Cl_mAlmacen, vista: I_vDepartamento) {
        this.almacen = almacen;
        this.vista = vista;
        this.registrarEventos();
        this.cargarDatosIniciales();
    }

    private registrarEventos(): void {
        const yoMismo = this;

        this.vista.cuandoEnviarRequisicion((datos) => yoMismo.enviarRequisicion(datos));
        this.vista.cuandoVerHistorial((departamentoId) => yoMismo.verHistorial(departamentoId));
    }

    private cargarDatosIniciales(): void {
        // Obtener el departamento del usuario (por simplicidad, usamos el primero)
        const departamentos = this.almacen.obtenerDepartamentos();
        if (departamentos.length > 0) {
            this.vista.mostrarDepartamento(departamentos[0]);
        }

        // Mostrar artículos disponibles
        this.vista.mostrarArticulosDisponibles(this.almacen.obtenerArticulos());

        // Mostrar estado del período
        this.vista.mostrarEstadoRequisicion(this.obtenerEstadoPeriodo());
    }

    private enviarRequisicion(datos: {
        departamentoId: number;
        tipo: 'ORDINARIA' | 'EXTRAORDINARIA';
        observaciones: string;
        detalles: { articuloId: number; cantidad: number }[];
    }): void {
        const departamento = this.almacen.buscarDepartamentoPorId(datos.departamentoId);
        if (!departamento) {
            this.vista.mostrarMensaje("❌ Departamento no encontrado", "error");
            return;
        }

        const req = new Cl_mRequisicion({
            departamento: departamento,
            tipo: datos.tipo,
            observaciones: datos.observaciones,
            usuarioSolicita: "usuario_departamento"
        });

        // Agregar detalles
        for (let i = 0; i < datos.detalles.length; i++) {
            const d = datos.detalles[i];
            const articulo = this.almacen.buscarArticuloPorId(d.articuloId);
            if (articulo) {
                req.agregarDetalle(articulo, d.cantidad);
            }
        }

        if (req.detalles.length === 0) {
            this.vista.mostrarMensaje("❌ No se pudo agregar ningún artículo a la requisición", "error");
            return;
        }

        this.almacen.agregarRequisicion(req);
        this.vista.mostrarMensaje(`✅ Requisición ${req.numeroRequisicion} enviada exitosamente`, "exito");

        // Limpiar vista
        this.vista.limpiarFormulario();

        // Actualizar historial
        this.verHistorial(datos.departamentoId);
    }

    private verHistorial(departamentoId: number): void {
        const requisiciones = this.almacen.obtenerRequisicionesPorDepartamento(departamentoId);
        this.vista.mostrarHistorial(requisiciones);
    }

    private obtenerEstadoPeriodo(): {
        periodoAbierto: boolean;
        fechaInicio: string;
        fechaFin: string;
        mensaje: string;
    } {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth();
        
        // Primer día del mes
        const primerDia = new Date(anio, mes, 1);
        
        // Calcular 5 días hábiles
        let diasHabiles = 0;
        let fecha = new Date(primerDia);
        let fechaFin = new Date(primerDia);
        
        while (diasHabiles < 5) {
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                diasHabiles++;
                fechaFin = new Date(fecha);
            }
            fecha.setDate(fecha.getDate() + 1);
        }
        
        const periodoAbierto = hoy <= fechaFin;
        
        return {
            periodoAbierto,
            fechaInicio: primerDia.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            fechaFin: fechaFin.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            mensaje: periodoAbierto ? 
                '✅ Puede realizar requisiciones ordinarias' : 
                '🔒 El período de requisiciones ordinarias ha finalizado. Solo puede hacer requisiciones extraordinarias.'
        };
    }
}
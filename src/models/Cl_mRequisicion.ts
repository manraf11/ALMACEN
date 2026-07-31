// src/models/Cl_mRequisicion.ts
import Cl_mArticulo from "./Cl_mArticulo.js";
import Cl_mDepartamento from "./Cl_mDepartamento.js";

export interface IDetalleRequisicion {
    articulo: Cl_mArticulo;
    cantidadSolicitada: number;
    cantidadDespachada: number;
    observaciones: string;
}

export default class Cl_mRequisicion {
    private static contador: number = 0;
    
    public id: number;
    public numeroRequisicion: string;
    public departamento: Cl_mDepartamento;
    public tipo: 'ORDINARIA' | 'EXTRAORDINARIA';
    public fechaSolicitud: Date;
    public periodoMes: number;
    public periodoAnio: number;
    public estado: 'PENDIENTE' | 'APROBADA' | 'PARCIAL' | 'RECHAZADA';
    public fechaAprobacion: Date | null;
    public detalles: IDetalleRequisicion[];
    public observaciones: string;
    public usuarioSolicita: string;

    constructor(datos: {
        id?: number;
        numeroRequisicion?: string;  // ← AGREGAR ESTA LÍNEA
        departamento: Cl_mDepartamento;
        tipo?: 'ORDINARIA' | 'EXTRAORDINARIA';
        fechaSolicitud?: Date;
        periodoMes?: number;
        periodoAnio?: number;
        observaciones?: string;
        usuarioSolicita?: string;
        detalles?: IDetalleRequisicion[];
    }) {
        this.id = datos.id || 0;
        this.departamento = datos.departamento;
        this.tipo = datos.tipo || 'ORDINARIA';
        this.fechaSolicitud = datos.fechaSolicitud || new Date();
        this.periodoMes = datos.periodoMes || this.fechaSolicitud.getMonth() + 1;
        this.periodoAnio = datos.periodoAnio || this.fechaSolicitud.getFullYear();
        this.estado = 'PENDIENTE';
        this.fechaAprobacion = null;
        this.detalles = datos.detalles || [];
        this.observaciones = datos.observaciones || "";
        this.usuarioSolicita = datos.usuarioSolicita || "";
        
        // Si viene con número de requisición, lo usamos, sino lo generamos
        if (datos.numeroRequisicion) {
            this.numeroRequisicion = datos.numeroRequisicion;
        } else {
            Cl_mRequisicion.contador++;
            this.numeroRequisicion = this.generarNumero();
        }
    }

    private generarNumero(): string {
        const anio = this.fechaSolicitud.getFullYear();
        const secuencia = String(Cl_mRequisicion.contador).padStart(4, '0');
        return `REQ-${anio}-${secuencia}`;
    }

    public agregarDetalle(articulo: Cl_mArticulo, cantidad: number, observaciones: string = ""): void {
        this.detalles.push({
            articulo,
            cantidadSolicitada: cantidad,
            cantidadDespachada: 0,
            observaciones
        });
    }

    public aprobar(): void {
        this.estado = 'APROBADA';
        this.fechaAprobacion = new Date();
    }

    public aprobarParcial(): void {
        this.estado = 'PARCIAL';
        this.fechaAprobacion = new Date();
    }

    public rechazar(): void {
        this.estado = 'RECHAZADA';
        this.fechaAprobacion = new Date();
    }

    public despacharDetalle(index: number, cantidad: number): boolean {
        if (index < 0 || index >= this.detalles.length) return false;
        
        const detalle = this.detalles[index];
        const disponible = detalle.cantidadSolicitada - detalle.cantidadDespachada;
        
        if (cantidad > disponible) return false;
        
        detalle.cantidadDespachada += cantidad;
        detalle.articulo.actualizarStock(-cantidad);
        return true;
    }

    public obtenerTotalSolicitado(): number {
        let total = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            total += this.detalles[i].cantidadSolicitada;
        }
        return total;
    }

    public obtenerTotalDespachado(): number {
        let total = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            total += this.detalles[i].cantidadDespachada;
        }
        return total;
    }

    public estaCompleta(): boolean {
        return this.obtenerTotalDespachado() === this.obtenerTotalSolicitado();
    }

    public esOrdinaria(): boolean {
        return this.tipo === 'ORDINARIA';
    }

    public esExtraordinaria(): boolean {
        return this.tipo === 'EXTRAORDINARIA';
    }
}
// src/models/Cl_mMovimiento.ts
import Cl_mArticulo from "./Cl_mArticulo.js";

export default class Cl_mMovimiento {
    public id: number;
    public articulo: Cl_mArticulo;
    public cantidad: number;
    public fecha: Date;
    public tipo: 'ENTRADA' | 'SALIDA';
    public documento: string;
    public observaciones: string;
    public usuario: string;

    constructor(datos: {
        id?: number;
        articulo: Cl_mArticulo;
        cantidad: number;
        fecha?: Date;
        tipo: 'ENTRADA' | 'SALIDA';
        documento: string;
        observaciones?: string;
        usuario?: string;
    }) {
        this.id = datos.id || 0;
        this.articulo = datos.articulo;
        this.cantidad = datos.cantidad;
        this.fecha = datos.fecha || new Date();
        this.tipo = datos.tipo;
        this.documento = datos.documento;
        this.observaciones = datos.observaciones || "";
        this.usuario = datos.usuario || "";
    }
}
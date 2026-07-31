// src/models/Cl_mEntrada.ts
import Cl_mArticulo from "./Cl_mArticulo.js";
import Cl_mMovimiento from "./Cl_mMovimiento.js";

export default class Cl_mEntrada extends Cl_mMovimiento {
    public numeroFactura: string;
    public proveedor: string;

    constructor(datos: {
        id?: number;
        articulo: Cl_mArticulo;
        cantidad: number;
        fecha?: Date;
        numeroFactura: string;
        proveedor?: string;
        observaciones?: string;
        usuario?: string;
    }) {
        super({
            id: datos.id,
            articulo: datos.articulo,
            cantidad: datos.cantidad,
            fecha: datos.fecha,
            tipo: 'ENTRADA',
            documento: datos.numeroFactura,
            observaciones: datos.observaciones,
            usuario: datos.usuario
        });
        this.numeroFactura = datos.numeroFactura;
        this.proveedor = datos.proveedor || "";
    }
}
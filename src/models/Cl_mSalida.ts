// src/models/Cl_mSalida.ts
import Cl_mArticulo from "./Cl_mArticulo.js";
import Cl_mMovimiento from "./Cl_mMovimiento.js";

export default class Cl_mSalida extends Cl_mMovimiento {
    public requisicionId: number;

    constructor(datos: {
        id?: number;
        articulo: Cl_mArticulo;
        cantidad: number;
        fecha?: Date;
        requisicionId: number;
        observaciones?: string;
        usuario?: string;
    }) {
        super({
            id: datos.id,
            articulo: datos.articulo,
            cantidad: datos.cantidad,
            fecha: datos.fecha,
            tipo: 'SALIDA',
            documento: `REQ-${datos.requisicionId}`,
            observaciones: datos.observaciones,
            usuario: datos.usuario
        });
        this.requisicionId = datos.requisicionId;
    }
}
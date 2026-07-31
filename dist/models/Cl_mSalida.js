import Cl_mMovimiento from "./Cl_mMovimiento.js";
export default class Cl_mSalida extends Cl_mMovimiento {
    requisicionId;
    constructor(datos) {
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
//# sourceMappingURL=Cl_mSalida.js.map
import Cl_mMovimiento from "./Cl_mMovimiento.js";
export default class Cl_mEntrada extends Cl_mMovimiento {
    numeroFactura;
    proveedor;
    constructor(datos) {
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
//# sourceMappingURL=Cl_mEntrada.js.map
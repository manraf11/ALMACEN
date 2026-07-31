export default class Cl_mMovimiento {
    id;
    articulo;
    cantidad;
    fecha;
    tipo;
    documento;
    observaciones;
    usuario;
    constructor(datos) {
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
//# sourceMappingURL=Cl_mMovimiento.js.map
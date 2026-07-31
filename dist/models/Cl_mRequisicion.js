export default class Cl_mRequisicion {
    static contador = 0;
    id;
    numeroRequisicion;
    departamento;
    tipo;
    fechaSolicitud;
    periodoMes;
    periodoAnio;
    estado;
    fechaAprobacion;
    detalles;
    observaciones;
    usuarioSolicita;
    constructor(datos) {
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
        }
        else {
            Cl_mRequisicion.contador++;
            this.numeroRequisicion = this.generarNumero();
        }
    }
    generarNumero() {
        const anio = this.fechaSolicitud.getFullYear();
        const secuencia = String(Cl_mRequisicion.contador).padStart(4, '0');
        return `REQ-${anio}-${secuencia}`;
    }
    agregarDetalle(articulo, cantidad, observaciones = "") {
        this.detalles.push({
            articulo,
            cantidadSolicitada: cantidad,
            cantidadDespachada: 0,
            observaciones
        });
    }
    aprobar() {
        this.estado = 'APROBADA';
        this.fechaAprobacion = new Date();
    }
    aprobarParcial() {
        this.estado = 'PARCIAL';
        this.fechaAprobacion = new Date();
    }
    rechazar() {
        this.estado = 'RECHAZADA';
        this.fechaAprobacion = new Date();
    }
    despacharDetalle(index, cantidad) {
        if (index < 0 || index >= this.detalles.length)
            return false;
        const detalle = this.detalles[index];
        const disponible = detalle.cantidadSolicitada - detalle.cantidadDespachada;
        if (cantidad > disponible)
            return false;
        detalle.cantidadDespachada += cantidad;
        detalle.articulo.actualizarStock(-cantidad);
        return true;
    }
    obtenerTotalSolicitado() {
        let total = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            total += this.detalles[i].cantidadSolicitada;
        }
        return total;
    }
    obtenerTotalDespachado() {
        let total = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            total += this.detalles[i].cantidadDespachada;
        }
        return total;
    }
    estaCompleta() {
        return this.obtenerTotalDespachado() === this.obtenerTotalSolicitado();
    }
    esOrdinaria() {
        return this.tipo === 'ORDINARIA';
    }
    esExtraordinaria() {
        return this.tipo === 'EXTRAORDINARIA';
    }
}
//# sourceMappingURL=Cl_mRequisicion.js.map
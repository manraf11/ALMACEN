export default class Cl_mArticulo {
    static contador = 0;
    id;
    codigo;
    nombre;
    descripcion;
    unidadMedida;
    stockMinimo;
    stockMaximo;
    stockActual;
    fechaRegistro;
    activo;
    constructor(datos) {
        this.id = datos.id || 0;
        this.nombre = datos.nombre;
        this.descripcion = datos.descripcion || "";
        this.unidadMedida = datos.unidadMedida;
        this.stockMinimo = datos.stockMinimo || 5;
        this.stockMaximo = datos.stockMaximo || 100;
        this.stockActual = datos.stockActual || 0;
        this.fechaRegistro = datos.fechaRegistro || new Date();
        this.activo = datos.activo !== undefined ? datos.activo : true;
        if (!datos.id || !datos.codigo) {
            Cl_mArticulo.contador++;
            this.codigo = this.generarCodigo();
        }
        else {
            this.codigo = datos.codigo || "";
        }
    }
    generarCodigo() {
        const secuencia = String(Cl_mArticulo.contador).padStart(6, '0');
        return `ART-${secuencia}`;
    }
    actualizarStock(cantidad) {
        this.stockActual += cantidad;
        if (this.stockActual < 0)
            this.stockActual = 0;
    }
    estaEnMinimo() {
        return this.stockActual <= this.stockMinimo;
    }
    estaEnMaximo() {
        return this.stockActual >= this.stockMaximo;
    }
    verificarAlerta() {
        if (this.estaEnMinimo()) {
            return {
                tipo: 'minimo',
                mensaje: `⚠️ ALERTA: ${this.nombre} está en stock mínimo (${this.stockActual}/${this.stockMinimo})`
            };
        }
        else if (this.estaEnMaximo()) {
            return {
                tipo: 'maximo',
                mensaje: `ℹ️ ${this.nombre} ha alcanzado el stock máximo (${this.stockActual}/${this.stockMaximo})`
            };
        }
        return {
            tipo: 'normal',
            mensaje: `✅ ${this.nombre}: ${this.stockActual} ${this.unidadMedida}`
        };
    }
}
//# sourceMappingURL=Cl_mArticulo.js.map
// src/models/Cl_mArticulo.ts
import { I_Articulo } from "../interfaces/I_Articulo.js";

export default class Cl_mArticulo {
    private static contador: number = 0;
    
    public id: number;
    public codigo: string;
    public nombre: string;
    public descripcion: string;
    public unidadMedida: string;
    public stockMinimo: number;
    public stockMaximo: number;
    public stockActual: number;
    public fechaRegistro: Date;
    public activo: boolean;

    constructor(datos: I_Articulo) {
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
        } else {
            this.codigo = datos.codigo || "";
        }
    }

    private generarCodigo(): string {
        const secuencia = String(Cl_mArticulo.contador).padStart(6, '0');
        return `ART-${secuencia}`;
    }

    public actualizarStock(cantidad: number): void {
        this.stockActual += cantidad;
        if (this.stockActual < 0) this.stockActual = 0;
    }

    public estaEnMinimo(): boolean {
        return this.stockActual <= this.stockMinimo;
    }

    public estaEnMaximo(): boolean {
        return this.stockActual >= this.stockMaximo;
    }

    public verificarAlerta(): { tipo: 'minimo' | 'maximo' | 'normal'; mensaje: string } {
        if (this.estaEnMinimo()) {
            return {
                tipo: 'minimo',
                mensaje: `⚠️ ALERTA: ${this.nombre} está en stock mínimo (${this.stockActual}/${this.stockMinimo})`
            };
        } else if (this.estaEnMaximo()) {
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
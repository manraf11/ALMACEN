// src/models/Cl_mDepartamento.ts
export default class Cl_mDepartamento {
    public id: number;
    public nombre: string;
    public responsable: string;
    public cargo: string;
    public activo: boolean;

    constructor(datos: {
        id?: number;
        nombre: string;
        responsable?: string;
        cargo?: string;
        activo?: boolean;
    }) {
        this.id = datos.id || 0;
        this.nombre = datos.nombre;
        this.responsable = datos.responsable || "";
        this.cargo = datos.cargo || "";
        this.activo = datos.activo !== undefined ? datos.activo : true;
    }

    public getNombreCompleto(): string {
        let nombreCompleto = this.nombre;
        if (this.responsable && this.cargo) {
            nombreCompleto += ` (${this.cargo}: ${this.responsable})`;
        } else if (this.responsable) {
            nombreCompleto += ` (Responsable: ${this.responsable})`;
        }
        return nombreCompleto;
    }
}
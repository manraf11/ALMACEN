// src/models/Cl_mDepartamento.ts
export default class Cl_mDepartamento {
    id;
    nombre;
    responsable;
    cargo;
    activo;
    constructor(datos) {
        this.id = datos.id || 0;
        this.nombre = datos.nombre;
        this.responsable = datos.responsable || "";
        this.cargo = datos.cargo || "";
        this.activo = datos.activo !== undefined ? datos.activo : true;
    }
    getNombreCompleto() {
        let nombreCompleto = this.nombre;
        if (this.responsable && this.cargo) {
            nombreCompleto += ` (${this.cargo}: ${this.responsable})`;
        }
        else if (this.responsable) {
            nombreCompleto += ` (Responsable: ${this.responsable})`;
        }
        return nombreCompleto;
    }
}
//# sourceMappingURL=Cl_mDepartamento.js.map
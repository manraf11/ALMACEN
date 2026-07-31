// services/Cl_sLaboratorio.ts
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
export default class Cl_sLaboratorio {
    static direccionWeb = "https://6a14b55c91ff9a63de06fced.mockapi.io/examenes";
    static async guardarEnNube(examen) {
        try {
            const respuesta = await fetch(this.direccionWeb, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombrePaciente: examen.nombrePaciente,
                    cedulaPaciente: examen.cedulaPaciente,
                    telefonoPaciente: examen.telefonoPaciente,
                    nombreEstudio: examen.nombreEstudio,
                    resultadoExamen: examen.resultadoExamen,
                    precioEstudio: examen.precioEstudio,
                    formaPago: examen.formaPago,
                    referencia: examen.referencia || "",
                    estado: examen.estado,
                    fechaRegistro: examen.fechaRegistro
                })
            });
            if (respuesta.ok) {
                const datos = await respuesta.json();
                return { ok: true, id: datos.id };
            }
            return { ok: false };
        }
        catch {
            return { ok: false };
        }
    }
    static async traerDesdeNube() {
        try {
            const respuesta = await fetch(this.direccionWeb);
            const laboratorio = new Cl_mLaboratorio();
            if (respuesta.status === 404) {
                return { ok: true, laboratorio };
            }
            if (!respuesta.ok) {
                console.error(`Error ${respuesta.status}: ${respuesta.statusText}`);
                return { ok: false, laboratorio };
            }
            const arregloCrudo = await respuesta.json();
            if (!Array.isArray(arregloCrudo)) {
                return { ok: false, laboratorio };
            }
            for (let i = 0; i < arregloCrudo.length; i++) {
                const c = arregloCrudo[i];
                let estadoExamen = "preparacion";
                if (c.estado !== undefined && c.estado !== null) {
                    const s = String(c.estado).toLowerCase();
                    if (s === "listo" || s.includes("listo") || s.includes("finalizado")) {
                        estadoExamen = "listo";
                    }
                    else if (s === "pendiente" || s.includes("pendiente")) {
                        estadoExamen = "pendiente";
                    }
                    else if (s === "preparacion" || s.includes("preparaci")) {
                        estadoExamen = "preparacion";
                    }
                }
                const examen = new Cl_mExamen({
                    id: c.id,
                    nombrePaciente: c.nombrePaciente,
                    cedulaPaciente: c.cedulaPaciente,
                    telefonoPaciente: c.telefonoPaciente,
                    nombreEstudio: c.nombreEstudio,
                    resultadoExamen: c.resultadoExamen,
                    precioEstudio: c.precioEstudio,
                    formaPago: c.formaPago,
                    referencia: c.referencia || "",
                    estado: estadoExamen,
                    fechaRegistro: c.fechaRegistro
                });
                laboratorio.agregarExamen(examen);
            }
            return { ok: true, laboratorio }; // ← IGUAL que antes
        }
        catch {
            return { ok: false, laboratorio: new Cl_mLaboratorio() };
        }
    }
    static async actualizarEnNube(id, examen) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombrePaciente: examen.nombrePaciente,
                    cedulaPaciente: examen.cedulaPaciente,
                    telefonoPaciente: examen.telefonoPaciente,
                    nombreEstudio: examen.nombreEstudio,
                    resultadoExamen: examen.resultadoExamen,
                    precioEstudio: examen.precioEstudio,
                    formaPago: examen.formaPago,
                    referencia: examen.referencia || "",
                    estado: examen.estado,
                    fechaRegistro: examen.fechaRegistro
                })
            });
            return { ok: respuesta.ok };
        }
        catch {
            return { ok: false };
        }
    }
    static async buscarPorCedula(cedula) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}?cedulaPaciente=${encodeURIComponent(cedula)}`);
            if (!respuesta.ok) {
                console.error(`Error ${respuesta.status}: ${respuesta.statusText}`);
                return { ok: false };
            }
            const datos = await respuesta.json();
            if (Array.isArray(datos) && datos.length > 0) {
                return { ok: true, registro: datos[0] };
            }
            return { ok: true };
        }
        catch {
            return { ok: false };
        }
    }
    static async eliminarExamen(id) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}/${id}`, {
                method: "DELETE"
            });
            if (respuesta.status === 404)
                return true;
            return respuesta.ok;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map
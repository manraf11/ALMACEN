// services/Cl_sEstudio.ts
import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_sEstudio {
    static direccionWeb = "https://6a14b55c91ff9a63de06fced.mockapi.io/estudios";
    static async cargarCatálogo() {
        try {
            const respuesta = await fetch(this.direccionWeb);
            const status = respuesta.status;
            if (status === 404) {
                Cl_mEstudio.limpiar();
                return true;
            }
            if (!respuesta.ok) {
                console.error(`Error ${status}: ${respuesta.statusText}`);
                return false;
            }
            const datosCrudos = await respuesta.json();
            if (!Array.isArray(datosCrudos)) {
                console.error("Formato de datos inválido");
                return false;
            }
            Cl_mEstudio.limpiar();
            for (let i = 0; i < datosCrudos.length; i++) {
                const e = datosCrudos[i];
                Cl_mEstudio.agregarEstudio(new Cl_mEstudio({
                    id: e.id,
                    nombre: e.nombre || "Sin nombre",
                    precio: Number(e.precio) || 0,
                    unidad: e.unidad || "",
                    valoresReferencia: e.valoresReferencia || ""
                }));
            }
            return true;
        }
        catch (error) {
            console.error("Error al cargar catálogo:", error);
            return false;
        }
    }
    static async guardarNuevoEstudio(estudio) {
        try {
            const respuesta = await fetch(this.direccionWeb, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valoresReferencia: estudio.valoresReferencia
                })
            });
            return respuesta.ok;
        }
        catch (error) {
            console.error("Error al guardar estudio:", error);
            return false;
        }
    }
    static async actualizarEstudio(estudio) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}/${estudio.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valoresReferencia: estudio.valoresReferencia
                })
            });
            return respuesta.ok;
        }
        catch (error) {
            console.error("Error al actualizar estudio:", error);
            return false;
        }
    }
    static async eliminarEstudio(id) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}/${id}`, {
                method: "DELETE"
            });
            if (respuesta.status === 404) {
                return true;
            }
            return respuesta.ok;
        }
        catch (error) {
            console.error("Error al eliminar estudio:", error);
            return false;
        }
    }
    static async existeEstudio(nombre) {
        try {
            const respuesta = await fetch(`${this.direccionWeb}?nombre=${encodeURIComponent(nombre)}`);
            if (respuesta.status === 404)
                return false;
            if (!respuesta.ok)
                return false;
            const datos = await respuesta.json();
            return Array.isArray(datos) && datos.length > 0;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=Cl_sEstudio.js.map
export default class Cl_mAlmacen {
    articulos = [];
    entradas = [];
    salidas = [];
    requisiciones = [];
    departamentos = [];
    // ---------- ARTÍCULOS ----------
    agregarArticulo(articulo) {
        this.articulos.push(articulo);
    }
    buscarArticuloPorCodigo(codigo) {
        for (let i = 0; i < this.articulos.length; i++) {
            if (this.articulos[i].codigo === codigo) {
                return this.articulos[i];
            }
        }
        return null;
    }
    buscarArticuloPorNombre(nombre) {
        const nombreLower = nombre.toLowerCase().trim();
        for (let i = 0; i < this.articulos.length; i++) {
            if (this.articulos[i].nombre.toLowerCase() === nombreLower) {
                return this.articulos[i];
            }
        }
        return null;
    }
    buscarArticuloPorId(id) {
        for (let i = 0; i < this.articulos.length; i++) {
            if (this.articulos[i].id === id) {
                return this.articulos[i];
            }
        }
        return null;
    }
    obtenerArticulos() {
        return [...this.articulos];
    }
    obtenerArticulosEnMinimo() {
        const resultado = [];
        for (let i = 0; i < this.articulos.length; i++) {
            if (this.articulos[i].estaEnMinimo()) {
                resultado.push(this.articulos[i]);
            }
        }
        return resultado;
    }
    obtenerArticulosEnMaximo() {
        const resultado = [];
        for (let i = 0; i < this.articulos.length; i++) {
            if (this.articulos[i].estaEnMaximo()) {
                resultado.push(this.articulos[i]);
            }
        }
        return resultado;
    }
    // ---------- ENTRADAS ----------
    registrarEntrada(entrada) {
        this.entradas.push(entrada);
        entrada.articulo.actualizarStock(entrada.cantidad);
    }
    obtenerEntradas() {
        return [...this.entradas];
    }
    // ---------- SALIDAS ----------
    registrarSalida(salida) {
        this.salidas.push(salida);
        salida.articulo.actualizarStock(-salida.cantidad);
    }
    obtenerSalidas() {
        return [...this.salidas];
    }
    // ---------- REQUISICIONES ----------
    agregarRequisicion(requisicion) {
        this.requisiciones.push(requisicion);
    }
    buscarRequisicionPorId(id) {
        for (let i = 0; i < this.requisiciones.length; i++) {
            if (this.requisiciones[i].id === id) {
                return this.requisiciones[i];
            }
        }
        return null;
    }
    obtenerRequisicionesPorDepartamento(departamentoId) {
        const resultado = [];
        for (let i = 0; i < this.requisiciones.length; i++) {
            if (this.requisiciones[i].departamento.id === departamentoId) {
                resultado.push(this.requisiciones[i]);
            }
        }
        return resultado;
    }
    obtenerRequisicionesPorPeriodo(mes, anio) {
        const resultado = [];
        for (let i = 0; i < this.requisiciones.length; i++) {
            if (this.requisiciones[i].periodoMes === mes &&
                this.requisiciones[i].periodoAnio === anio) {
                resultado.push(this.requisiciones[i]);
            }
        }
        return resultado;
    }
    obtenerRequisicionesPendientes() {
        const resultado = [];
        for (let i = 0; i < this.requisiciones.length; i++) {
            if (this.requisiciones[i].estado === 'PENDIENTE' ||
                this.requisiciones[i].estado === 'APROBADA') {
                resultado.push(this.requisiciones[i]);
            }
        }
        return resultado;
    }
    obtenerRequisicionesExtraordinarias() {
        const resultado = [];
        for (let i = 0; i < this.requisiciones.length; i++) {
            if (this.requisiciones[i].esExtraordinaria()) {
                resultado.push(this.requisiciones[i]);
            }
        }
        return resultado;
    }
    // ---------- DEPARTAMENTOS ----------
    agregarDepartamento(departamento) {
        this.departamentos.push(departamento);
    }
    obtenerDepartamentos() {
        return [...this.departamentos];
    }
    buscarDepartamentoPorId(id) {
        for (let i = 0; i < this.departamentos.length; i++) {
            if (this.departamentos[i].id === id) {
                return this.departamentos[i];
            }
        }
        return null;
    }
    // ---------- ESTADÍSTICAS ----------
    obtenerProductosMasSolicitados(limite = 10) {
        const conteo = {};
        for (let i = 0; i < this.requisiciones.length; i++) {
            const req = this.requisiciones[i];
            for (let j = 0; j < req.detalles.length; j++) {
                const detalle = req.detalles[j];
                const nombre = detalle.articulo.nombre;
                if (conteo[nombre]) {
                    conteo[nombre] += detalle.cantidadSolicitada;
                }
                else {
                    conteo[nombre] = detalle.cantidadSolicitada;
                }
            }
        }
        const resultado = Object.keys(conteo).map(nombre => ({
            nombre,
            cantidad: conteo[nombre]
        }));
        // Ordenar de mayor a menor
        for (let i = 0; i < resultado.length - 1; i++) {
            for (let j = i + 1; j < resultado.length; j++) {
                if (resultado[i].cantidad < resultado[j].cantidad) {
                    const temp = resultado[i];
                    resultado[i] = resultado[j];
                    resultado[j] = temp;
                }
            }
        }
        return resultado.slice(0, limite);
    }
    obtenerDepartamentosMasConsumidores(limite = 10) {
        const conteo = {};
        for (let i = 0; i < this.requisiciones.length; i++) {
            const req = this.requisiciones[i];
            const nombreDept = req.departamento.nombre;
            let total = 0;
            for (let j = 0; j < req.detalles.length; j++) {
                total += req.detalles[j].cantidadDespachada;
            }
            if (conteo[nombreDept]) {
                conteo[nombreDept] += total;
            }
            else {
                conteo[nombreDept] = total;
            }
        }
        const resultado = Object.keys(conteo).map(nombre => ({
            nombre,
            cantidad: conteo[nombre]
        }));
        for (let i = 0; i < resultado.length - 1; i++) {
            for (let j = i + 1; j < resultado.length; j++) {
                if (resultado[i].cantidad < resultado[j].cantidad) {
                    const temp = resultado[i];
                    resultado[i] = resultado[j];
                    resultado[j] = temp;
                }
            }
        }
        return resultado.slice(0, limite);
    }
    obtenerEstadisticasExtraordinarias() {
        const resultado = [];
        for (let i = 0; i < this.requisiciones.length; i++) {
            const req = this.requisiciones[i];
            if (req.esExtraordinaria()) {
                for (let j = 0; j < req.detalles.length; j++) {
                    const d = req.detalles[j];
                    resultado.push({
                        departamento: req.departamento.nombre,
                        articulo: d.articulo.nombre,
                        cantidad: d.cantidadDespachada
                    });
                }
            }
        }
        return resultado;
    }
    // ---------- REPORTES ----------
    generarReporteMensual(mes, anio) {
        const entradasMes = this.obtenerEntradasPorPeriodo(mes, anio);
        const salidasMes = this.obtenerSalidasPorPeriodo(mes, anio);
        const requisicionesMes = this.obtenerRequisicionesPorPeriodo(mes, anio);
        return {
            mes,
            anio,
            periodo: `${mes}/${anio}`,
            totalArticulos: this.articulos.length,
            totalEntradas: entradasMes.length,
            totalSalidas: salidasMes.length,
            totalRequisiciones: requisicionesMes.length,
            articulos: this.articulos.map(a => ({
                codigo: a.codigo,
                nombre: a.nombre,
                stockActual: a.stockActual,
                stockMinimo: a.stockMinimo,
                stockMaximo: a.stockMaximo,
                unidadMedida: a.unidadMedida
            })),
            entradas: entradasMes,
            salidas: salidasMes,
            requisiciones: requisicionesMes
        };
    }
    generarReporteTrimestral(trimestre, anio) {
        const meses = [(trimestre - 1) * 3 + 1, (trimestre - 1) * 3 + 2, (trimestre - 1) * 3 + 3];
        let totalEntradas = 0;
        let totalSalidas = 0;
        let totalRequisiciones = 0;
        for (let i = 0; i < meses.length; i++) {
            totalEntradas += this.obtenerEntradasPorPeriodo(meses[i], anio).length;
            totalSalidas += this.obtenerSalidasPorPeriodo(meses[i], anio).length;
            totalRequisiciones += this.obtenerRequisicionesPorPeriodo(meses[i], anio).length;
        }
        return {
            trimestre,
            anio,
            periodo: `Trimestre ${trimestre} ${anio}`,
            totalArticulos: this.articulos.length,
            totalEntradas,
            totalSalidas,
            totalRequisiciones,
            articulos: this.articulos.map(a => ({
                codigo: a.codigo,
                nombre: a.nombre,
                stockActual: a.stockActual,
                stockMinimo: a.stockMinimo,
                stockMaximo: a.stockMaximo,
                unidadMedida: a.unidadMedida
            }))
        };
    }
    generarReporteSemestral(semestre, anio) {
        const meses = semestre === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
        let totalEntradas = 0;
        let totalSalidas = 0;
        let totalRequisiciones = 0;
        for (let i = 0; i < meses.length; i++) {
            totalEntradas += this.obtenerEntradasPorPeriodo(meses[i], anio).length;
            totalSalidas += this.obtenerSalidasPorPeriodo(meses[i], anio).length;
            totalRequisiciones += this.obtenerRequisicionesPorPeriodo(meses[i], anio).length;
        }
        return {
            semestre,
            anio,
            periodo: `Semestre ${semestre} ${anio}`,
            totalArticulos: this.articulos.length,
            totalEntradas,
            totalSalidas,
            totalRequisiciones,
            articulos: this.articulos.map(a => ({
                codigo: a.codigo,
                nombre: a.nombre,
                stockActual: a.stockActual,
                stockMinimo: a.stockMinimo,
                stockMaximo: a.stockMaximo,
                unidadMedida: a.unidadMedida
            }))
        };
    }
    generarReporteAnual(anio) {
        let totalEntradas = 0;
        let totalSalidas = 0;
        let totalRequisiciones = 0;
        for (let mes = 1; mes <= 12; mes++) {
            totalEntradas += this.obtenerEntradasPorPeriodo(mes, anio).length;
            totalSalidas += this.obtenerSalidasPorPeriodo(mes, anio).length;
            totalRequisiciones += this.obtenerRequisicionesPorPeriodo(mes, anio).length;
        }
        return {
            anio,
            periodo: `Año ${anio}`,
            totalArticulos: this.articulos.length,
            totalEntradas,
            totalSalidas,
            totalRequisiciones,
            articulos: this.articulos.map(a => ({
                codigo: a.codigo,
                nombre: a.nombre,
                stockActual: a.stockActual,
                stockMinimo: a.stockMinimo,
                stockMaximo: a.stockMaximo,
                unidadMedida: a.unidadMedida
            }))
        };
    }
    obtenerEntradasPorPeriodo(mes, anio) {
        const resultado = [];
        for (let i = 0; i < this.entradas.length; i++) {
            const fecha = this.entradas[i].fecha;
            if (fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio) {
                resultado.push(this.entradas[i]);
            }
        }
        return resultado;
    }
    obtenerSalidasPorPeriodo(mes, anio) {
        const resultado = [];
        for (let i = 0; i < this.salidas.length; i++) {
            const fecha = this.salidas[i].fecha;
            if (fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio) {
                resultado.push(this.salidas[i]);
            }
        }
        return resultado;
    }
    // ---------- RESÚMENES ----------
    obtenerResumenGeneral() {
        return {
            totalArticulos: this.articulos.length,
            totalDepartamentos: this.departamentos.length,
            totalRequisiciones: this.requisiciones.length,
            totalRequisicionesExtraordinarias: this.obtenerRequisicionesExtraordinarias().length
        };
    }
    obtenerDashboard() {
        const ahora = new Date();
        const mes = ahora.getMonth() + 1;
        const anio = ahora.getFullYear();
        return {
            totalArticulos: this.articulos.length,
            entradasMes: this.obtenerEntradasPorPeriodo(mes, anio).length,
            salidasMes: this.obtenerSalidasPorPeriodo(mes, anio).length
        };
    }
}
//# sourceMappingURL=Cl_mAlmacen.js.map
export default class Cl_vDirector {
    avisarSolicitarReporte = null;
    avisarSolicitarEstadisticas = null;
    containerResumen;
    containerReporte;
    containerEstadisticas;
    constructor() {
        this.containerResumen = document.getElementById("resumenGeneral");
        this.containerReporte = document.getElementById("reporteContenido");
        this.containerEstadisticas = document.getElementById("estadisticasContenido");
        this.inicializarEventos();
    }
    inicializarEventos() {
        const yoMismo = this;
        // Botones de reportes
        const btnMensual = document.getElementById("btnReporteMensual");
        if (btnMensual) {
            btnMensual.onclick = () => {
                const mes = parseInt(document.getElementById("reporteMes").value);
                const anio = parseInt(document.getElementById("reporteAnio").value);
                if (yoMismo.avisarSolicitarReporte) {
                    yoMismo.avisarSolicitarReporte('mensual', mes, anio);
                }
            };
        }
        const btnTrimestral = document.getElementById("btnReporteTrimestral");
        if (btnTrimestral) {
            btnTrimestral.onclick = () => {
                const mes = parseInt(document.getElementById("reporteMes").value);
                const anio = parseInt(document.getElementById("reporteAnio").value);
                if (yoMismo.avisarSolicitarReporte) {
                    yoMismo.avisarSolicitarReporte('trimestral', mes, anio);
                }
            };
        }
        const btnSemestral = document.getElementById("btnReporteSemestral");
        if (btnSemestral) {
            btnSemestral.onclick = () => {
                const mes = parseInt(document.getElementById("reporteMes").value);
                const anio = parseInt(document.getElementById("reporteAnio").value);
                if (yoMismo.avisarSolicitarReporte) {
                    yoMismo.avisarSolicitarReporte('semestral', mes, anio);
                }
            };
        }
        const btnAnual = document.getElementById("btnReporteAnual");
        if (btnAnual) {
            btnAnual.onclick = () => {
                const anio = parseInt(document.getElementById("reporteAnio").value);
                if (yoMismo.avisarSolicitarReporte) {
                    yoMismo.avisarSolicitarReporte('anual', 0, anio);
                }
            };
        }
        // Botones de estadísticas
        const btnProductos = document.getElementById("btnEstProductos");
        if (btnProductos) {
            btnProductos.onclick = () => {
                if (yoMismo.avisarSolicitarEstadisticas) {
                    yoMismo.avisarSolicitarEstadisticas('productos');
                }
            };
        }
        const btnDepartamentos = document.getElementById("btnEstDepartamentos");
        if (btnDepartamentos) {
            btnDepartamentos.onclick = () => {
                if (yoMismo.avisarSolicitarEstadisticas) {
                    yoMismo.avisarSolicitarEstadisticas('departamentos');
                }
            };
        }
        const btnExtraordinarias = document.getElementById("btnEstExtraordinarias");
        if (btnExtraordinarias) {
            btnExtraordinarias.onclick = () => {
                if (yoMismo.avisarSolicitarEstadisticas) {
                    yoMismo.avisarSolicitarEstadisticas('extraordinarias');
                }
            };
        }
        // Botón exportar
        const btnExportar = document.getElementById("btnExportarReporte");
        if (btnExportar) {
            btnExportar.onclick = () => {
                const formato = document.getElementById("formatoExportar").value;
                yoMismo.exportarReporte(formato);
            };
        }
    }
    // ========== REGISTRO DE CALLBACKS ==========
    cuandoSolicitarReporte(callback) {
        this.avisarSolicitarReporte = callback;
    }
    cuandoSolicitarEstadisticas(callback) {
        this.avisarSolicitarEstadisticas = callback;
    }
    // ========== MÉTODOS PARA MOSTRAR ==========
    mostrarResumenGeneral(datos) {
        if (!this.containerResumen)
            return;
        this.containerResumen.innerHTML = "";
        const grid = document.createElement("div");
        grid.className = "grid-4";
        grid.innerHTML = `
            <div class="card">
                <div class="card-title">📦 Artículos</div>
                <h2 style="font-size:2rem;">${datos.totalArticulos}</h2>
            </div>
            <div class="card">
                <div class="card-title">🏢 Departamentos</div>
                <h2 style="font-size:2rem;">${datos.totalDepartamentos}</h2>
            </div>
            <div class="card">
                <div class="card-title">📋 Requisiciones</div>
                <h2 style="font-size:2rem;">${datos.totalRequisiciones}</h2>
            </div>
            <div class="card" style="border-left: 4px solid #f39c12;">
                <div class="card-title">⚠️ Extraordinarias</div>
                <h2 style="font-size:2rem; color: #f39c12;">${datos.totalRequisicionesExtraordinarias}</h2>
            </div>
        `;
        this.containerResumen.appendChild(grid);
    }
    mostrarReporte(reporte) {
        if (!this.containerReporte)
            return;
        this.containerReporte.innerHTML = "";
        if (!reporte) {
            this.containerReporte.innerHTML = '<p class="mensaje-vacio">📭 Seleccione un período para generar el reporte</p>';
            return;
        }
        const div = document.createElement("div");
        div.style.cssText = "background: #f8fafc; padding: 20px; border-radius: 10px;";
        div.innerHTML = `
            <h3>📊 Reporte ${reporte.periodo}</h3>
            <p><strong>Total Artículos:</strong> ${reporte.totalArticulos}</p>
            <p><strong>Entradas:</strong> ${reporte.totalEntradas}</p>
            <p><strong>Salidas:</strong> ${reporte.totalSalidas}</p>
            <p><strong>Requisiciones:</strong> ${reporte.totalRequisiciones}</p>
            <hr>
            <h4>📦 Artículos en Inventario</h4>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                        <th>Mínimo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reporte.articulos || []).map((art) => `
                        <tr>
                            <td>${art.codigo}</td>
                            <td>${art.nombre}</td>
                            <td>${art.stockActual}</td>
                            <td>${art.stockMinimo}</td>
                            <td>${art.stockActual <= art.stockMinimo ? '⚠️ Crítico' : art.stockActual >= art.stockMaximo ? '📦 Completo' : '✅ Normal'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        this.containerReporte.appendChild(div);
    }
    mostrarEstadisticas(datos) {
        if (!this.containerEstadisticas)
            return;
        this.containerEstadisticas.innerHTML = "";
        // Productos más solicitados
        const grid = document.createElement("div");
        grid.className = "grid-2";
        // Productos
        const card1 = document.createElement("div");
        card1.className = "card";
        card1.innerHTML = `
            <div class="card-title">🏆 Productos Más Solicitados</div>
            <table>
                <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead>
                <tbody>
                    ${(datos.productosMasSolicitados || []).map(p => `
                        <tr><td>${p.nombre}</td><td>${p.cantidad}</td></tr>
                    `).join('') || '<tr><td colspan="2">No hay datos</td></tr>'}
                </tbody>
            </table>
        `;
        grid.appendChild(card1);
        // Departamentos
        const card2 = document.createElement("div");
        card2.className = "card";
        card2.innerHTML = `
            <div class="card-title">🏢 Departamentos Más Consumidores</div>
            <table>
                <thead><tr><th>Departamento</th><th>Cantidad</th></tr></thead>
                <tbody>
                    ${(datos.departamentosMasConsumidores || []).map(d => `
                        <tr><td>${d.nombre}</td><td>${d.cantidad}</td></tr>
                    `).join('') || '<tr><td colspan="2">No hay datos</td></tr>'}
                </tbody>
            </table>
        `;
        grid.appendChild(card2);
        this.containerEstadisticas.appendChild(grid);
        // Requisiciones extraordinarias
        const card3 = document.createElement("div");
        card3.className = "card";
        card3.style.cssText = "margin-top:20px;";
        card3.innerHTML = `
            <div class="card-title">⚠️ Requisiciones Extraordinarias</div>
            <table>
                <thead><tr><th>Departamento</th><th>Artículo</th><th>Cantidad</th></tr></thead>
                <tbody>
                    ${(datos.requisicionesExtraordinarias || []).map(r => `
                        <tr><td>${r.departamento}</td><td>${r.articulo}</td><td>${r.cantidad}</td></tr>
                    `).join('') || '<tr><td colspan="3">No hay requisiciones extraordinarias</td></tr>'}
                </tbody>
            </table>
        `;
        this.containerEstadisticas.appendChild(card3);
    }
    mostrarMensaje(mensaje, tipo) {
        const colores = {
            exito: '#2d6a4f',
            error: '#c0392b',
            info: '#2980b9'
        };
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colores[tipo]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        div.textContent = mensaje;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.3s';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
    exportarReporte(formato) {
        const mensaje = formato === 'pdf' ?
            '📄 Generando PDF del reporte...' :
            '📊 Generando Excel del reporte...';
        this.mostrarMensaje(mensaje, 'info');
    }
}
//# sourceMappingURL=Cl_vDirector.js.map
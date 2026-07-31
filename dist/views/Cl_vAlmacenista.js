export default class Cl_vAlmacenista {
    // Callbacks para el controlador
    avisarRegistrarArticulo = null;
    avisarRegistrarEntrada = null;
    avisarAprobarRequisicion = null;
    avisarDespacharRequisicion = null;
    avisarRechazarRequisicion = null;
    avisarCargarReporteMensual = null;
    // Referencias a elementos del DOM
    contenedorArticulos;
    contenedorEntradas;
    contenedorRequisiciones;
    contenedorAlertas;
    contenedorDashboard;
    contenedorReporte;
    constructor() {
        this.contenedorArticulos = document.getElementById("tablaArticulos");
        this.contenedorEntradas = document.getElementById("tablaEntradas");
        this.contenedorRequisiciones = document.getElementById("tablaRequisiciones");
        this.contenedorAlertas = document.getElementById("alertasStock");
        this.contenedorDashboard = document.getElementById("dashboard");
        this.contenedorReporte = document.getElementById("reporteMensualContenido");
        this.inicializarEventos();
    }
    inicializarEventos() {
        const yoMismo = this;
        // Botón para abrir modal de nuevo artículo
        const btnArticulo = document.getElementById("btnNuevoArticulo");
        if (btnArticulo) {
            btnArticulo.onclick = () => yoMismo.abrirModalArticulo();
        }
        // Botón para abrir modal de nueva entrada
        const btnEntrada = document.getElementById("btnNuevaEntrada");
        if (btnEntrada) {
            btnEntrada.onclick = () => yoMismo.abrirModalEntrada();
        }
        // Botón guardar artículo
        const btnGuardarArticulo = document.getElementById("guardarArticulo");
        if (btnGuardarArticulo) {
            btnGuardarArticulo.onclick = () => yoMismo.guardarArticulo();
        }
        // Botón guardar entrada
        const btnGuardarEntrada = document.getElementById("guardarEntrada");
        if (btnGuardarEntrada) {
            btnGuardarEntrada.onclick = () => yoMismo.guardarEntrada();
        }
        // Cerrar modales
        const btnCancelarArt = document.getElementById("cancelarArticulo");
        if (btnCancelarArt) {
            btnCancelarArt.onclick = () => yoMismo.cerrarModal("modalArticulo");
        }
        const btnCancelarEnt = document.getElementById("cancelarEntrada");
        if (btnCancelarEnt) {
            btnCancelarEnt.onclick = () => yoMismo.cerrarModal("modalEntrada");
        }
        // Cerrar modal haciendo clic fuera
        document.querySelectorAll(".modal").forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            });
        });
        // Evento para cargar reporte mensual
        const btnReporte = document.getElementById("btnCargarReporteMensual");
        if (btnReporte) {
            btnReporte.onclick = () => {
                const mes = parseInt(document.getElementById("reporteMes").value);
                const anio = parseInt(document.getElementById("reporteAnio").value);
                if (yoMismo.avisarCargarReporteMensual) {
                    yoMismo.avisarCargarReporteMensual(mes, anio);
                }
            };
        }
        // Cerrar modal de detalle
        const btnCerrarDetalle = document.getElementById("cerrarDetalleRequisicion");
        if (btnCerrarDetalle) {
            btnCerrarDetalle.onclick = () => yoMismo.cerrarModal("modalDetalleRequisicion");
        }
        // Cerrar modal de despacho
        const btnCerrarDespacho = document.getElementById("cerrarDespacho");
        if (btnCerrarDespacho) {
            btnCerrarDespacho.onclick = () => yoMismo.cerrarModal("modalDespacho");
        }
    }
    // ========== REGISTRO DE CALLBACKS ==========
    cuandoRegistrarArticulo(callback) {
        this.avisarRegistrarArticulo = callback;
    }
    cuandoRegistrarEntrada(callback) {
        this.avisarRegistrarEntrada = callback;
    }
    cuandoAprobarRequisicion(callback) {
        this.avisarAprobarRequisicion = callback;
    }
    cuandoDespacharRequisicion(callback) {
        this.avisarDespacharRequisicion = callback;
    }
    cuandoRechazarRequisicion(callback) {
        this.avisarRechazarRequisicion = callback;
    }
    cuandoCargarReporteMensual(callback) {
        this.avisarCargarReporteMensual = callback;
    }
    // ========== MÉTODOS PARA MOSTRAR DATOS ==========
    mostrarArticulos(articulos) {
        if (!this.contenedorArticulos)
            return;
        this.contenedorArticulos.innerHTML = "";
        if (articulos.length === 0) {
            this.contenedorArticulos.innerHTML = '<p class="mensaje-vacio">📭 No hay artículos registrados</p>';
            return;
        }
        const tabla = document.createElement("table");
        tabla.className = "tabla-articulos";
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                    <th>Máximo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");
        for (let i = 0; i < articulos.length; i++) {
            const art = articulos[i];
            const alerta = art.verificarAlerta();
            const estadoText = alerta.tipo === 'minimo' ? '⚠️ Stock Mínimo' :
                alerta.tipo === 'maximo' ? '📦 Stock Máximo' : '✅ Normal';
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${this.escapeHtml(art.codigo)}</strong></td>
                <td>${this.escapeHtml(art.nombre)}</td>
                <td>${this.escapeHtml(art.unidadMedida)}</td>
                <td>${art.stockActual}</td>
                <td>${art.stockMinimo}</td>
                <td>${art.stockMaximo}</td>
                <td><span class="${alerta.tipo === 'minimo' ? 'alert-minimo' : alerta.tipo === 'maximo' ? 'alert-maximo' : ''}" style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${estadoText}</span></td>
            `;
            tbody.appendChild(tr);
        }
        this.contenedorArticulos.appendChild(tabla);
    }
    mostrarEntradas(entradas) {
        if (!this.contenedorEntradas)
            return;
        this.contenedorEntradas.innerHTML = "";
        if (entradas.length === 0) {
            this.contenedorEntradas.innerHTML = '<p class="mensaje-vacio">📭 No hay entradas registradas</p>';
            return;
        }
        const tabla = document.createElement("table");
        tabla.className = "tabla-entradas";
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Artículo</th>
                    <th>Cantidad</th>
                    <th>N° Factura</th>
                    <th>Proveedor</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");
        for (let i = 0; i < entradas.length; i++) {
            const e = entradas[i];
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${new Date(e.fecha).toLocaleDateString()}</td>
                <td>${this.escapeHtml(e.articulo.nombre)}</td>
                <td>${e.cantidad}</td>
                <td>${this.escapeHtml(e.numeroFactura)}</td>
                <td>${this.escapeHtml(e.proveedor || '')}</td>
            `;
            tbody.appendChild(tr);
        }
        this.contenedorEntradas.appendChild(tabla);
    }
    mostrarRequisiciones(requisiciones) {
        if (!this.contenedorRequisiciones)
            return;
        this.contenedorRequisiciones.innerHTML = "";
        if (requisiciones.length === 0) {
            this.contenedorRequisiciones.innerHTML = '<p class="mensaje-vacio">📭 No hay requisiciones pendientes</p>';
            return;
        }
        const tabla = document.createElement("table");
        tabla.className = "tabla-requisiciones";
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>N° Requisición</th>
                    <th>Departamento</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Artículos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");
        const yoMismo = this;
        for (let i = 0; i < requisiciones.length; i++) {
            const req = requisiciones[i];
            const badgeClass = req.estado === 'PENDIENTE' ? 'badge-pendiente' :
                req.estado === 'APROBADA' ? 'badge-aprobada' :
                    req.estado === 'PARCIAL' ? 'badge-parcial' : 'badge-rechazada';
            const totalItems = req.detalles.length;
            const totalDespachado = req.obtenerTotalDespachado();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${this.escapeHtml(req.numeroRequisicion)}</strong></td>
                <td>${this.escapeHtml(req.departamento.nombre)}</td>
                <td><span class="badge ${req.tipo === 'ORDINARIA' ? 'badge-aprobada' : 'badge-warning'}">${req.tipo}</span></td>
                <td>${new Date(req.fechaSolicitud).toLocaleDateString()}</td>
                <td>${totalItems} artículos (${totalDespachado} despachados)</td>
                <td><span class="badge ${badgeClass}">${req.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary btn-ver-detalle" data-id="${req.id}">👁️ Ver</button>
                    ${req.estado === 'PENDIENTE' ? `
                        <button class="btn btn-sm btn-success btn-aprobar" data-id="${req.id}">✅ Aprobar</button>
                        <button class="btn btn-sm btn-danger btn-rechazar" data-id="${req.id}">❌ Rechazar</button>
                    ` : ''}
                    ${req.estado === 'APROBADA' ? `
                        <button class="btn btn-sm btn-warning btn-despachar" data-id="${req.id}">📦 Despachar</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        }
        this.contenedorRequisiciones.appendChild(tabla);
        // Asignar eventos a los botones
        tabla.querySelectorAll(".btn-ver-detalle").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id") || "0");
                yoMismo.mostrarDetalleRequisicion(id, requisiciones);
            });
        });
        tabla.querySelectorAll(".btn-aprobar").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id") || "0");
                if (yoMismo.avisarAprobarRequisicion) {
                    yoMismo.avisarAprobarRequisicion(id);
                }
            });
        });
        tabla.querySelectorAll(".btn-rechazar").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id") || "0");
                if (confirm("¿Rechazar esta requisición?")) {
                    if (yoMismo.avisarRechazarRequisicion) {
                        yoMismo.avisarRechazarRequisicion(id);
                    }
                }
            });
        });
        tabla.querySelectorAll(".btn-despachar").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id") || "0");
                yoMismo.abrirModalDespacho(id, requisiciones);
            });
        });
    }
    mostrarDetalleRequisicion(id, requisiciones) {
        const req = requisiciones.find(r => r.id === id);
        if (!req)
            return;
        const container = document.getElementById("detalleRequisicionContenido");
        if (!container)
            return;
        container.innerHTML = `
            <p><strong>N° Requisición:</strong> ${req.numeroRequisicion}</p>
            <p><strong>Departamento:</strong> ${req.departamento.nombre}</p>
            <p><strong>Tipo:</strong> ${req.tipo}</p>
            <p><strong>Fecha:</strong> ${new Date(req.fechaSolicitud).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${req.estado}</p>
            <p><strong>Observaciones:</strong> ${req.observaciones || 'Ninguna'}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Artículo</th>
                        <th>Solicitado</th>
                        <th>Despachado</th>
                        <th>Unidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${req.detalles.map(d => `
                        <tr>
                            <td>${this.escapeHtml(d.articulo.nombre)}</td>
                            <td>${d.cantidadSolicitada}</td>
                            <td>${d.cantidadDespachada}</td>
                            <td>${d.articulo.unidadMedida}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        const modal = document.getElementById("modalDetalleRequisicion");
        if (modal)
            modal.style.display = "flex";
    }
    abrirModalDespacho(id, requisiciones) {
        const req = requisiciones.find(r => r.id === id);
        if (!req)
            return;
        const container = document.getElementById("despachoContenido");
        if (!container)
            return;
        let html = `
            <p><strong>Despachando requisición:</strong> ${req.numeroRequisicion}</p>
            <p><strong>Departamento:</strong> ${req.departamento.nombre}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Artículo</th>
                        <th>Solicitado</th>
                        <th>Despachado</th>
                        <th>Cantidad a despachar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        for (let i = 0; i < req.detalles.length; i++) {
            const d = req.detalles[i];
            const pendiente = d.cantidadSolicitada - d.cantidadDespachada;
            html += `
                <tr>
                    <td>${this.escapeHtml(d.articulo.nombre)}</td>
                    <td>${d.cantidadSolicitada}</td>
                    <td>${d.cantidadDespachada}</td>
                    <td>
                        <input type="number" class="despacho-cantidad" data-index="${i}" 
                               value="${pendiente}" min="0" max="${pendiente}" 
                               style="width:80px; padding:5px; border:1px solid #ddd; border-radius:4px;">
                        <span style="font-size:0.8rem; color:#666;">(máx: ${pendiente})</span>
                    </td>
                </tr>
            `;
        }
        html += `
                </tbody>
            </table>
            <div style="margin-top:15px;">
                <button class="btn btn-success" id="btnConfirmarDespacho" data-id="${req.id}">✅ Confirmar Despacho</button>
                <button class="btn btn-danger" id="cancelarDespacho">Cancelar</button>
            </div>
        `;
        container.innerHTML = html;
        const btnConfirmar = document.getElementById("btnConfirmarDespacho");
        if (btnConfirmar) {
            btnConfirmar.addEventListener("click", () => {
                const idRequisicion = parseInt(btnConfirmar.getAttribute("data-id") || "0");
                const inputs = container.querySelectorAll(".despacho-cantidad");
                const detalles = [];
                inputs.forEach((input) => {
                    const index = parseInt(input.getAttribute("data-index") || "0");
                    const cantidad = parseInt(input.value) || 0;
                    if (cantidad > 0) {
                        const detalle = req.detalles[index];
                        detalles.push({
                            articuloId: detalle.articulo.id,
                            cantidad: cantidad
                        });
                    }
                });
                if (detalles.length === 0) {
                    alert("Debe despachar al menos un artículo.");
                    return;
                }
                if (this.avisarDespacharRequisicion) {
                    this.avisarDespacharRequisicion(idRequisicion, detalles);
                }
                this.cerrarModal("modalDespacho");
            });
        }
        const btnCancelar = document.getElementById("cancelarDespacho");
        if (btnCancelar) {
            btnCancelar.onclick = () => this.cerrarModal("modalDespacho");
        }
        const modal = document.getElementById("modalDespacho");
        if (modal)
            modal.style.display = "flex";
    }
    mostrarAlertas(alertas) {
        if (!this.contenedorAlertas)
            return;
        this.contenedorAlertas.innerHTML = "";
        if (alertas.length === 0) {
            this.contenedorAlertas.innerHTML = '<p style="color:#2d6a4f;">✅ Todos los artículos tienen stock normal.</p>';
            return;
        }
        for (let i = 0; i < alertas.length; i++) {
            const a = alertas[i];
            const div = document.createElement("div");
            div.className = a.tipo === 'minimo' ? 'alert-minimo' : 'alert-maximo';
            div.textContent = a.mensaje;
            this.contenedorAlertas.appendChild(div);
        }
    }
    mostrarDashboard(datos) {
        if (!this.contenedorDashboard)
            return;
        this.contenedorDashboard.innerHTML = "";
        const grid = document.createElement("div");
        grid.className = "grid-3";
        grid.innerHTML = `
            <div class="card">
                <div class="card-title">📦 Total Artículos</div>
                <h2 style="font-size:2.5rem;">${datos.totalArticulos}</h2>
                <p style="color:#666;">En inventario</p>
            </div>
            <div class="card">
                <div class="card-title">📥 Entradas del Mes</div>
                <h2 style="font-size:2.5rem;">${datos.entradasMes}</h2>
                <p style="color:#666;">En el mes actual</p>
            </div>
            <div class="card">
                <div class="card-title">📤 Salidas del Mes</div>
                <h2 style="font-size:2.5rem;">${datos.salidasMes}</h2>
                <p style="color:#666;">En el mes actual</p>
            </div>
        `;
        this.contenedorDashboard.appendChild(grid);
    }
    mostrarReporteMensual(reporte) {
        if (!this.contenedorReporte)
            return;
        this.contenedorReporte.innerHTML = "";
        if (!reporte) {
            this.contenedorReporte.innerHTML = '<p class="mensaje-vacio">📭 No hay datos para el período seleccionado</p>';
            return;
        }
        const div = document.createElement("div");
        div.style.cssText = "background: #f8fafc; padding: 20px; border-radius: 10px;";
        div.innerHTML = `
            <h3>📊 Reporte ${reporte.mes}/${reporte.anio}</h3>
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
        this.contenedorReporte.appendChild(div);
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
            animation: slideIn 0.3s ease;
        `;
        div.textContent = mensaje;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.3s';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
    limpiarFormularios() {
        document.querySelectorAll('form input, form textarea, form select').forEach(el => {
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.value = '';
            }
            if (el instanceof HTMLSelectElement) {
                el.selectedIndex = 0;
            }
        });
    }
    // ========== MÉTODOS PRIVADOS DE UI ==========
    abrirModalArticulo() {
        this.limpiarFormularios();
        const modal = document.getElementById("modalArticulo");
        if (modal)
            modal.style.display = "flex";
        const input = document.getElementById("artNombre");
        if (input)
            input.focus();
    }
    abrirModalEntrada() {
        this.limpiarFormularios();
        this.cargarArticulosEnSelect("entArticulo");
        const modal = document.getElementById("modalEntrada");
        if (modal)
            modal.style.display = "flex";
    }
    cargarArticulosEnSelect(idSelect) {
        const select = document.getElementById(idSelect);
        if (!select)
            return;
        // El controlador llenará este select
    }
    cerrarModal(id) {
        const modal = document.getElementById(id);
        if (modal)
            modal.style.display = "none";
    }
    guardarArticulo() {
        const nombre = document.getElementById("artNombre").value.trim();
        const descripcion = document.getElementById("artDescripcion").value.trim();
        const unidadMedida = document.getElementById("artUnidad").value;
        const stockMinimo = parseInt(document.getElementById("artMinimo").value) || 5;
        const stockMaximo = parseInt(document.getElementById("artMaximo").value) || 100;
        if (!nombre) {
            this.mostrarMensaje("El nombre del artículo es obligatorio.", "error");
            return;
        }
        if (this.avisarRegistrarArticulo) {
            this.avisarRegistrarArticulo({
                nombre,
                descripcion,
                unidadMedida,
                stockMinimo,
                stockMaximo,
                stockActual: 0
            });
        }
        this.cerrarModal("modalArticulo");
    }
    guardarEntrada() {
        const codigoArticulo = document.getElementById("entArticulo").value;
        const cantidad = parseInt(document.getElementById("entCantidad").value);
        const numeroFactura = document.getElementById("entFactura").value.trim();
        const proveedor = document.getElementById("entProveedor").value.trim();
        const observaciones = document.getElementById("entObservaciones").value.trim();
        if (!codigoArticulo || !cantidad || !numeroFactura) {
            this.mostrarMensaje("Artículo, cantidad y número de factura son obligatorios.", "error");
            return;
        }
        if (this.avisarRegistrarEntrada) {
            this.avisarRegistrarEntrada({
                codigoArticulo,
                cantidad,
                numeroFactura,
                proveedor,
                observaciones
            });
        }
        this.cerrarModal("modalEntrada");
    }
    escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=Cl_vAlmacenista.js.map
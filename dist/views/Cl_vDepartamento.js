export default class Cl_vDepartamento {
    avisarEnviarRequisicion = null;
    avisarVerHistorial = null;
    detalles = [];
    contenedorDetalles;
    contenedorHistorial;
    constructor() {
        this.contenedorDetalles = document.getElementById("detallesRequisicion");
        this.contenedorHistorial = document.getElementById("historialRequisiciones");
        this.inicializarEventos();
    }
    inicializarEventos() {
        const yoMismo = this;
        // Agregar detalle
        const btnAgregar = document.getElementById("btnAgregarDetalle");
        if (btnAgregar) {
            btnAgregar.onclick = () => yoMismo.agregarDetalle();
        }
        // Enviar requisición
        const btnEnviar = document.getElementById("btnEnviarRequisicion");
        if (btnEnviar) {
            btnEnviar.onclick = () => yoMismo.enviarRequisicion();
        }
        // Limpiar
        const btnLimpiar = document.getElementById("btnLimpiarRequisicion");
        if (btnLimpiar) {
            btnLimpiar.onclick = () => yoMismo.limpiarFormulario();
        }
        // Ver historial
        const btnHistorial = document.getElementById("btnVerHistorial");
        if (btnHistorial) {
            btnHistorial.onclick = () => {
                const deptId = parseInt(document.getElementById("reqDepartamentoId").value);
                if (yoMismo.avisarVerHistorial) {
                    yoMismo.avisarVerHistorial(deptId);
                }
            };
        }
        // Enter para agregar detalle
        const inputCantidad = document.getElementById("reqCantidad");
        if (inputCantidad) {
            inputCantidad.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    yoMismo.agregarDetalle();
                }
            });
        }
        // Cerrar modal de detalle
        const btnCerrarDetalle = document.getElementById("cerrarDetalle");
        if (btnCerrarDetalle) {
            btnCerrarDetalle.onclick = () => yoMismo.cerrarModal("modalDetalle");
        }
    }
    // ========== REGISTRO DE CALLBACKS ==========
    cuandoEnviarRequisicion(callback) {
        this.avisarEnviarRequisicion = callback;
    }
    cuandoVerHistorial(callback) {
        this.avisarVerHistorial = callback;
    }
    // ========== MÉTODOS PARA MOSTRAR ==========
    mostrarDepartamento(departamento) {
        const input = document.getElementById("reqDepartamento");
        if (input) {
            input.value = departamento.getNombreCompleto();
        }
        const inputId = document.getElementById("reqDepartamentoId");
        if (inputId) {
            inputId.value = String(departamento.id);
        }
    }
    mostrarArticulosDisponibles(articulos) {
        const select = document.getElementById("reqArticulo");
        if (!select)
            return;
        select.innerHTML = '<option value="">-- Seleccione un artículo --</option>';
        for (let i = 0; i < articulos.length; i++) {
            const art = articulos[i];
            const option = document.createElement("option");
            option.value = String(art.id);
            option.textContent = `${art.nombre} (${art.stockActual} ${art.unidadMedida})`;
            select.appendChild(option);
        }
    }
    mostrarHistorial(requisiciones) {
        if (!this.contenedorHistorial)
            return;
        this.contenedorHistorial.innerHTML = "";
        if (requisiciones.length === 0) {
            this.contenedorHistorial.innerHTML = '<p class="mensaje-vacio">📭 No hay requisiciones en el historial</p>';
            return;
        }
        const tabla = document.createElement("table");
        tabla.className = "tabla-historial";
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>N° Requisición</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Artículos</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");
        for (let i = 0; i < requisiciones.length; i++) {
            const req = requisiciones[i];
            const badgeClass = req.estado === 'PENDIENTE' ? 'badge-pendiente' :
                req.estado === 'APROBADA' ? 'badge-aprobada' :
                    req.estado === 'PARCIAL' ? 'badge-parcial' : 'badge-rechazada';
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${this.escapeHtml(req.numeroRequisicion)}</strong></td>
                <td><span class="badge ${req.tipo === 'ORDINARIA' ? 'badge-aprobada' : 'badge-warning'}">${req.tipo}</span></td>
                <td>${new Date(req.fechaSolicitud).toLocaleDateString()}</td>
                <td>${req.detalles.length}</td>
                <td><span class="badge ${badgeClass}">${req.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary btn-ver-detalle" data-id="${req.id}">👁️ Ver</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        this.contenedorHistorial.appendChild(tabla);
        // Eventos para ver detalle
        const yoMismo = this;
        tabla.querySelectorAll(".btn-ver-detalle").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id") || "0");
                const req = requisiciones.find(r => r.id === id);
                if (req) {
                    yoMismo.mostrarDetalleRequisicion(req);
                }
            });
        });
    }
    mostrarEstadoRequisicion(estado) {
        const container = document.getElementById("infoPeriodo");
        if (!container)
            return;
        container.innerHTML = `
            <p><strong>Período de Requisición Ordinaria:</strong> ${estado.fechaInicio} al ${estado.fechaFin}</p>
            <p><strong>Estado:</strong> 
                <span style="color: ${estado.periodoAbierto ? '#2d6a4f' : '#c0392b'}; font-weight: bold;">
                    ${estado.periodoAbierto ? '✅ ABIERTO' : '🔒 CERRADO'}
                </span>
            </p>
            <p style="font-size: 0.9rem; color: #666;">${estado.mensaje}</p>
        `;
    }
    mostrarDetalleRequisicion(requisicion) {
        const container = document.getElementById("detalleContenido");
        if (!container)
            return;
        container.innerHTML = `
            <p><strong>N° Requisición:</strong> ${requisicion.numeroRequisicion}</p>
            <p><strong>Departamento:</strong> ${requisicion.departamento.nombre}</p>
            <p><strong>Tipo:</strong> ${requisicion.tipo}</p>
            <p><strong>Fecha:</strong> ${new Date(requisicion.fechaSolicitud).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${requisicion.estado}</p>
            <p><strong>Observaciones:</strong> ${requisicion.observaciones || 'Ninguna'}</p>
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
                    ${requisicion.detalles.map(d => `
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
        const modal = document.getElementById("modalDetalle");
        if (modal)
            modal.style.display = "flex";
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
    limpiarFormulario() {
        this.detalles = [];
        this.actualizarTablaDetalles();
        const observaciones = document.getElementById("reqObservaciones");
        if (observaciones)
            observaciones.value = '';
        const select = document.getElementById("reqArticulo");
        if (select)
            select.selectedIndex = 0;
        const cantidad = document.getElementById("reqCantidad");
        if (cantidad)
            cantidad.value = '';
    }
    // ========== MÉTODOS PRIVADOS ==========
    cerrarModal(id) {
        const modal = document.getElementById(id);
        if (modal)
            modal.style.display = "none";
    }
    agregarDetalle() {
        const select = document.getElementById("reqArticulo");
        const cantidad = parseInt(document.getElementById("reqCantidad").value);
        if (!select.value || !cantidad || cantidad <= 0) {
            this.mostrarMensaje("Seleccione un artículo y una cantidad válida.", "error");
            return;
        }
        this.detalles.push({
            articuloId: parseInt(select.value),
            cantidad: cantidad
        });
        this.actualizarTablaDetalles();
        document.getElementById("reqCantidad").value = '';
        select.focus();
    }
    actualizarTablaDetalles() {
        if (!this.contenedorDetalles)
            return;
        this.contenedorDetalles.innerHTML = "";
        if (this.detalles.length === 0) {
            this.contenedorDetalles.innerHTML = '<p style="color: #666;">No hay artículos agregados.</p>';
            return;
        }
        const tabla = document.createElement("table");
        tabla.className = "tabla-detalles";
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Artículo</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");
        const select = document.getElementById("reqArticulo");
        for (let i = 0; i < this.detalles.length; i++) {
            const d = this.detalles[i];
            let nombre = `ID: ${d.articuloId}`;
            for (let j = 0; j < select.options.length; j++) {
                if (parseInt(select.options[j].value) === d.articuloId) {
                    nombre = select.options[j].text;
                    break;
                }
            }
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${this.escapeHtml(nombre)}</td>
                <td>${d.cantidad}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-eliminar-detalle" data-index="${i}">✖</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        this.contenedorDetalles.appendChild(tabla);
        // Eventos para eliminar detalles
        tabla.querySelectorAll(".btn-eliminar-detalle").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index") || "0");
                this.detalles.splice(index, 1);
                this.actualizarTablaDetalles();
            });
        });
    }
    enviarRequisicion() {
        if (this.detalles.length === 0) {
            this.mostrarMensaje("Debe agregar al menos un artículo.", "error");
            return;
        }
        // Verificar período para requisiciones ordinarias
        const tipo = document.getElementById("reqTipo").value;
        if (tipo === 'ORDINARIA') {
            const estado = this.obtenerEstadoPeriodo();
            if (!estado.periodoAbierto) {
                this.mostrarMensaje("⚠️ El período de requisiciones ordinarias ha finalizado. Use la opción 'Extraordinaria'.", "error");
                return;
            }
        }
        const observaciones = document.getElementById("reqObservaciones").value.trim();
        const departamentoId = parseInt(document.getElementById("reqDepartamentoId").value);
        if (this.avisarEnviarRequisicion) {
            this.avisarEnviarRequisicion({
                departamentoId,
                tipo,
                observaciones,
                detalles: this.detalles
            });
        }
        this.detalles = [];
        this.actualizarTablaDetalles();
        document.getElementById("reqObservaciones").value = '';
    }
    obtenerEstadoPeriodo() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth();
        // Primer día del mes
        const primerDia = new Date(anio, mes, 1);
        // Calcular 5 días hábiles
        let diasHabiles = 0;
        let fecha = new Date(primerDia);
        let fechaFin = new Date(primerDia);
        while (diasHabiles < 5) {
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                diasHabiles++;
                fechaFin = new Date(fecha);
            }
            fecha.setDate(fecha.getDate() + 1);
        }
        const periodoAbierto = hoy <= fechaFin;
        return {
            periodoAbierto,
            fechaInicio: primerDia.toLocaleDateString(),
            fechaFin: fechaFin.toLocaleDateString(),
            mensaje: periodoAbierto ?
                '✅ Puede realizar requisiciones ordinarias' :
                '🔒 Solo requisiciones extraordinarias'
        };
    }
    escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=Cl_vDepartamento.js.map
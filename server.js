// server.js - Servidor Backend para el Sistema de Almacén
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pdf from 'html-pdf';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Importar servicio de base de datos
import Cl_sDatabase from './dist/services/Cl_sDatabase.js';

// Inicializar conexión a la base de datos
await Cl_sDatabase.conectar();

// ============================================
// RUTAS DE LA API
// ============================================

// 1. Artículos
app.get('/api/articulos', async (req, res) => {
    try {
        const articulos = await Cl_sDatabase.obtenerArticulos();
        res.json(articulos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/articulos', async (req, res) => {
    try {
        const articulo = req.body;
        const resultado = await Cl_sDatabase.guardarArticulo(articulo);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Departamentos
app.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await Cl_sDatabase.obtenerDepartamentos();
        res.json(departamentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Entradas
app.get('/api/entradas', async (req, res) => {
    try {
        const query = 'SELECT * FROM entradas ORDER BY fecha_entrada DESC';
        const entradas = await Cl_sDatabase.ejecutarQuery(query);
        res.json(entradas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/entradas', async (req, res) => {
    try {
        const entrada = req.body;
        const resultado = await Cl_sDatabase.guardarEntrada(entrada);
        await Cl_sDatabase.actualizarStock(entrada.articuloId, entrada.cantidad);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Requisiciones
app.get('/api/requisiciones', async (req, res) => {
    try {
        const { departamentoId } = req.query;
        let query = 'SELECT * FROM requisiciones ORDER BY fecha_solicitud DESC';
        let params = [];
        
        if (departamentoId) {
            query = 'SELECT * FROM requisiciones WHERE departamento_id = $1 ORDER BY fecha_solicitud DESC';
            params = [departamentoId];
        }
        
        const requisiciones = await Cl_sDatabase.ejecutarQuery(query, params);
        res.json(requisiciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/requisiciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT r.*, d.nombre as departamento_nombre, d.responsable, d.cargo
            FROM requisiciones r
            JOIN departamentos d ON r.departamento_id = d.id
            WHERE r.id = $1
        `;
        const resultado = await Cl_sDatabase.ejecutarQuery(query, [id]);
        
        if (resultado.length === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }
        
        res.json(resultado[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/requisiciones', async (req, res) => {
    try {
        const requisicion = req.body;
        const resultado = await Cl_sDatabase.guardarRequisicion(requisicion);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/requisiciones/pendientes', async (req, res) => {
    try {
        const requisiciones = await Cl_sDatabase.obtenerRequisicionesPendientes();
        res.json(requisiciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/requisiciones/:id/aprobar', async (req, res) => {
    try {
        const { id } = req.params;
        await Cl_sDatabase.actualizarEstadoRequisicion(id, 'APROBADA');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/requisiciones/:id/rechazar', async (req, res) => {
    try {
        const { id } = req.params;
        await Cl_sDatabase.actualizarEstadoRequisicion(id, 'RECHAZADA');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Detalles de Requisiciones
app.get('/api/requisicion_detalles', async (req, res) => {
    try {
        const { requisicionId } = req.query;
        let query = 'SELECT * FROM requisicion_detalles';
        let params = [];
        
        if (requisicionId) {
            query += ' WHERE requisicion_id = $1 ORDER BY id';
            params = [requisicionId];
        }
        
        const detalles = await Cl_sDatabase.ejecutarQuery(query, params);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/requisicion_detalles', async (req, res) => {
    try {
        const detalle = req.body;
        const resultado = await Cl_sDatabase.guardarDetalleRequisicion(detalle);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Salidas
app.get('/api/salidas', async (req, res) => {
    try {
        const query = 'SELECT * FROM salidas ORDER BY fecha_salida DESC';
        const salidas = await Cl_sDatabase.ejecutarQuery(query);
        res.json(salidas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const articulos = await Cl_sDatabase.ejecutarQuery('SELECT COUNT(*) as total FROM articulos WHERE activo = TRUE');
        const departamentos = await Cl_sDatabase.ejecutarQuery('SELECT COUNT(*) as total FROM departamentos WHERE activo = TRUE');
        const requisiciones = await Cl_sDatabase.ejecutarQuery('SELECT COUNT(*) as total FROM requisiciones');
        
        res.json({
            totalArticulos: articulos[0].total,
            totalDepartamentos: departamentos[0].total,
            totalRequisiciones: requisiciones[0].total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Reportes
app.get('/api/reportes/mensual', async (req, res) => {
    try {
        const { mes, anio } = req.query;
        res.json({ mes, anio, datos: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTA PARA GENERAR PDF - FIRMAS EN FOOTER CON ESPACIO
// ============================================
app.get('/api/requisiciones/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener datos de la requisición
        const reqQuery = await Cl_sDatabase.ejecutarQuery(
            `SELECT r.*, d.nombre as dept_nombre, d.responsable, d.cargo 
             FROM requisiciones r 
             JOIN departamentos d ON r.departamento_id = d.id 
             WHERE r.id = $1`,
            [id]
        );
        
        if (reqQuery.length === 0) {
            return res.status(404).json({ error: 'Requisición no encontrada' });
        }
        
        const requisicion = reqQuery[0];
        
        // Obtener datos de Dirección de Servicios Generales (PARA)
        const paraQuery = await Cl_sDatabase.ejecutarQuery(
            `SELECT * FROM departamentos WHERE nombre ILIKE '%Servicios Generales%' LIMIT 1`
        );
        
        const paraDepartamento = paraQuery.length > 0 ? paraQuery[0] : null;
        
        // Obtener detalles
        const detalles = await Cl_sDatabase.ejecutarQuery(
            `SELECT rd.*, a.nombre as articulo_nombre, a.codigo, a.unidad_medida 
             FROM requisicion_detalles rd 
             JOIN articulos a ON rd.articulo_id = a.id 
             WHERE rd.requisicion_id = $1`,
            [id]
        );
        
        // Formatear fecha
        const fecha = new Date(requisicion.fecha_solicitud);
        const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${String(fecha.getFullYear()).slice(-2)}`;
        
        // Tipo de requisición
        const tipoRequisicion = requisicion.tipo || 'ORDINARIA';
        
        // Leer el logo y convertirlo a base64
        let logoBase64 = '';
        try {
            const logoPath = path.join(__dirname, 'Logos', 'Nvo_LogoCEL_fb.jpg');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                logoBase64 = logoBuffer.toString('base64');
                console.log('✅ Logo cargado correctamente');
            } else {
                console.log('⚠️ Logo no encontrado en:', logoPath);
            }
        } catch (error) {
            console.log('⚠️ Error cargando logo:', error.message);
        }
        
        // ========== GENERAR HTML ==========
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Requisición ${requisicion.numero_requisicion}</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            font-family: 'Times New Roman', 'Georgia', serif;
            background: #ffffff;
            padding: 30px 40px;
            color: #1a1a1a;
            font-size: 11px;
        }
        
        /* MARCO INSTITUCIONAL */
        .marco {
            border: 2px solid #2c2c2c;
            padding: 20px 25px 20px 25px;
            position: relative;
            min-height: 700px;
        }
        
        .marco::before {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 1px solid #6a6a6a;
            pointer-events: none;
        }
        
        /* ========== ENCABEZADO CON LOGO CENTRADO ========== */
        .header {
            text-align: center;
            border-bottom: 2px solid #2c2c2c;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        
        .header .logo {
            display: block;
            margin: 0 auto 6px auto;
        }
        
        .header .logo img {
            width: 55px;
            height: auto;
        }
        
        .header .institucion {
            font-family: 'Times New Roman', serif;
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .header .sub-institucion {
            font-family: 'Times New Roman', serif;
            font-size: 10px;
            font-weight: 400;
            color: #3a3a3a;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 1px;
        }
        
        .header .titulo-documento {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            font-weight: 700;
            color: #1a1a1a;
            margin-top: 6px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .header .titulo-documento::after {
            content: '';
            display: block;
            width: 100px;
            height: 1px;
            background: #4a4a4a;
            margin: 3px auto 0;
        }
        
        /* ========== NÚMERO, FECHA Y TIPO ========== */
        .info-box {
            display: flex;
            justify-content: space-between;
            border: 1px solid #8a8a8a;
            padding: 4px 14px;
            margin-bottom: 12px;
            background: #f8f8f8;
        }
        
        .info-box .item {
            font-size: 9px;
            font-weight: 600;
            color: #2a2a2a;
        }
        
        .info-box .item span {
            font-weight: 400;
            color: #1a1a1a;
        }
        
        .info-box .item .numero-destacado {
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 0.5px;
        }
        
        .info-box .item .tipo-destacado {
            font-weight: 700;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* ========== CAMPOS ========== */
        .campos {
            margin-bottom: 12px;
        }
        
        .campo {
            display: flex;
            border-bottom: 1px solid #cacaca;
            padding: 3px 0;
        }
        
        .campo:last-child {
            border-bottom: none;
        }
        
        .campo .etiqueta {
            font-size: 9px;
            font-weight: 700;
            color: #2a2a2a;
            min-width: 120px;
            padding: 3px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .campo .valor {
            font-size: 10px;
            color: #1a1a1a;
            padding: 3px 0;
            flex: 1;
        }
        
        .campo .valor .destacado {
            font-weight: 700;
        }
        
        .campo .valor .detalle {
            font-size: 9px;
            color: #5a5a5a;
            margin-left: 8px;
        }
        
        /* ========== TABLA ========== */
        .tabla-container {
            margin: 10px 0 12px 0;
            border: 1px solid #6a6a6a;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        
        table thead th {
            background: #2a2a2a;
            color: #ffffff;
            padding: 5px 4px;
            text-align: center;
            font-weight: 700;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-right: 1px solid #4a4a4a;
        }
        
        table thead th:last-child {
            border-right: none;
        }
        
        table tbody td {
            padding: 4px 4px;
            border-bottom: 1px solid #d0d0d0;
            text-align: center;
            color: #1a1a1a;
            font-size: 9px;
        }
        
        table tbody tr:last-child td {
            border-bottom: none;
        }
        
        table tbody tr:nth-child(even) {
            background: #f5f5f5;
        }
        
        table tbody td:first-child {
            font-weight: 700;
        }
        
        table tbody td:nth-child(2) {
            text-align: left;
            padding-left: 8px;
        }
        
        table tbody td:nth-child(3) {
            text-transform: uppercase;
            font-size: 8px;
            color: #4a4a4a;
        }
        
        /* ========== OBSERVACIONES ========== */
        .observaciones {
            border: 1px solid #8a8a8a;
            padding: 8px 12px;
            margin-bottom: 20px;
            background: #f8f8f8;
        }
        
        .observaciones .label {
            font-weight: 700;
            color: #2a2a2a;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
        }
        
        .observaciones .texto {
            margin-top: 2px;
            color: #1a1a1a;
            font-size: 9px;
            line-height: 1.5;
        }
        
        /* ========== SEPARADOR PARA FIRMAS ========== */
        .separador-firmas {
            margin-top: 30px;
            margin-bottom: 20px;
            border-top: 3px double #2c2c2c;
            width: 100%;
        }
        
        .espacio-firmas {
            height: 15px;
        }
        
        /* ========== FOOTER CON FIRMAS ========== */
        .footer-pagina {
            margin-top: 5px;
            padding-top: 10px;
            width: 100%;
        }
        
        .firmas-container {
            width: 100%;
            text-align: center;
        }
        
        .firma-wrapper {
            display: inline-block;
            width: 30%;
            vertical-align: top;
            text-align: center;
            padding: 0 10px;
        }
        
        .firma-wrapper .linea {
            border-top: 1.5px solid #1a1a1a;
            margin: 0 auto 4px;
            width: 100%;
        }
        
        .firma-wrapper .nombre {
            font-size: 10px;
            font-weight: 700;
            color: #1a1a1a;
            min-height: 16px;
            margin: 2px 0;
        }
        
        .firma-wrapper .cargo {
            font-size: 8px;
            color: #4a4a4a;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 1px 0;
        }
        
        .firma-wrapper .sello {
            font-size: 7px;
            color: #6a6a6a;
            margin-top: 2px;
            font-style: italic;
        }
        
        /* ========== FOOTER INSTITUCIONAL ========== */
        .footer-institucional {
            margin-top: 20px;
            text-align: center;
            font-size: 7px;
            color: #5a5a5a;
            border-top: 1px solid #8a8a8a;
            padding-top: 8px;
        }
        
        .footer-institucional .institucion {
            color: #1a1a1a;
            font-weight: 700;
            font-size: 8px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .footer-institucional .generado {
            margin-top: 2px;
            font-size: 7px;
            color: #6a6a6a;
        }
        
        /* ========== NÚMERO DE PÁGINA ========== */
        .page-number {
            text-align: right;
            font-size: 7px;
            color: #6a6a6a;
            margin-top: 4px;
        }
        
        /* ========== RESPONSIVE ========== */
        @media print {
            body { padding: 20px 30px; }
            .marco { border-color: #000; }
        }
    </style>
</head>
<body>

<div class="marco">

    <!-- ===== ENCABEZADO CON LOGO CENTRADO ===== -->
    <div class="header">
        <div class="logo">
            ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" alt="Logo Contraloría">` : ''}
        </div>
        <div class="institucion">CONTRALORÍA DEL ESTADO LARA</div>
        <div class="sub-institucion">Dirección de Servicios Generales</div>
        <div class="titulo-documento">REQUISICIÓN DE MATERIALES Y SUMINISTROS</div>
    </div>

    <!-- ===== NÚMERO, FECHA Y TIPO ===== -->
    <div class="info-box">
        <div class="item">N°: <span class="numero-destacado">${requisicion.numero_requisicion}</span></div>
        <div class="item">FECHA: <span>${fechaFormateada}</span></div>
        <div class="item">TIPO: <span class="tipo-destacado">${tipoRequisicion}</span></div>
    </div>

    <!-- ===== CAMPOS ===== -->
    <div class="campos">
        <div class="campo">
            <div class="etiqueta">PARA</div>
            <div class="valor">
                <span class="destacado">Dirección de Servicios Generales</span>
                ${paraDepartamento && paraDepartamento.responsable ? `<span class="detalle">| Responsable: ${paraDepartamento.responsable}</span>` : ''}
            </div>
        </div>
        <div class="campo">
            <div class="etiqueta">UNIDAD SOLICITANTE</div>
            <div class="valor">
                <span class="destacado">${requisicion.dept_nombre}</span>
                ${requisicion.responsable ? `<span class="detalle">| Responsable: ${requisicion.responsable}</span>` : ''}
            </div>
        </div>
        <div class="campo">
            <div class="etiqueta">ASUNTO</div>
            <div class="valor">Suministros de materiales que a continuación se especifican</div>
        </div>
    </div>

    <!-- ===== TABLA DE ARTÍCULOS ===== -->
    <div class="tabla-container">
        <table>
            <thead>
                <tr>
                    <th style="width:8%;">ITEM</th>
                    <th style="width:55%;">DESCRIPCIÓN</th>
                    <th style="width:17%;">UNIDAD DE MEDIDA</th>
                    <th style="width:20%;">CANTIDAD</th>
                </tr>
            </thead>
            <tbody>`;

        let itemNum = 1;
        detalles.forEach((detalle) => {
            const descripcion = detalle.articulo_nombre || `Artículo #${detalle.articulo_id}`;
            htmlContent += `
                <tr>
                    <td>${itemNum}</td>
                    <td>${descripcion}</td>
                    <td>${detalle.unidad_medida || 'UNIDAD'}</td>
                    <td>${detalle.cantidad_solicitada}</td>
                </tr>`;
            itemNum++;
        });

        htmlContent += `
            </tbody>
        </table>
    </div>

    <!-- ===== OBSERVACIONES ===== -->
    ${requisicion.observaciones ? `
    <div class="observaciones">
        <div class="label">OBSERVACIONES</div>
        <div class="texto">${requisicion.observaciones}</div>
    </div>` : ''}

    <!-- ===== SEPARADOR Y ESPACIO PARA FIRMAS ===== -->
    <div class="separador-firmas"></div>
    <div class="espacio-firmas"></div>

    <!-- ===== FOOTER CON FIRMAS ===== -->
    <div class="footer-pagina">
        <div class="firmas-container">
            <div class="firma-wrapper">
                <div class="linea"></div>
                <div class="nombre">${requisicion.responsable || '_________________________'}</div>
                <div class="cargo">SOLICITA</div>
                <div class="sello">Firma y sello</div>
            </div>
            <div class="firma-wrapper">
                <div class="linea"></div>
                <div class="nombre">${paraDepartamento && paraDepartamento.responsable ? paraDepartamento.responsable : '_________________________'}</div>
                <div class="cargo">APRUEBA</div>
                <div class="sello">Firma y sello</div>
            </div>
            <div class="firma-wrapper">
                <div class="linea"></div>
                <div class="nombre">${requisicion.responsable || '_________________________'}</div>
                <div class="cargo">RECIBE</div>
                <div class="sello">Firma y sello</div>
            </div>
        </div>
    </div>

    <!-- ===== FOOTER INSTITUCIONAL ===== -->
    <div class="footer-institucional">
        <div class="institucion">SISTEMA DE CONTROL DE ALMACÉN - CONTRALORÍA DEL ESTADO LARA</div>
        <div class="generado">Documento generado el ${new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    <div class="page-number">Página 1 de 1</div>

</div>

</body>
</html>`;

        // ========== GENERAR PDF CON HTML-PDF ==========
        const options = {
            format: 'A4',
            border: {
                top: '12px',
                bottom: '12px',
                left: '12px',
                right: '12px'
            },
            type: 'pdf',
            quality: '100',
            orientation: 'portrait',
            renderDelay: 1500,
            timeout: 30000,
            zoomFactor: 1
        };

        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generando PDF:', err);
                return res.status(500).json({ error: err.message });
            }
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=requisicion_${requisicion.numero_requisicion}.pdf`);
            res.send(buffer);
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para servir archivos HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   🏛️ SISTEMA DE CONTROL DE ALMACÉN - CONTRALORÍA DEL ESTADO LARA         ║
║                                                                           ║
║   ✅ Servidor corriendo en: http://localhost:${PORT}                       ║
║   ✅ Base de datos conectada                                             ║
║   ✅ FIRMAS EN FOOTER CON ESPACIO                                        ║
║                                                                           ║
║   📄 CARACTERÍSTICAS DEL DOCUMENTO:                                      ║
║   ✦ Logo centrado en el encabezado                                      ║
║   ✦ N° de Requisición como primer elemento                              ║
║   ✦ Separador doble antes de las firmas                                 ║
║   ✦ Espacio extra entre contenido y firmas                              ║
║   ✦ Firmas horizontales una al lado de la otra                          ║
║   ✦ Sin columna CANTIDAD DESPACHADA                                     ║
║                                                                           ║
║   Presiona CTRL+C para detener el servidor                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🔒 Cerrando conexión a la base de datos...');
    await Cl_sDatabase.cerrarConexion();
    process.exit(0);
});
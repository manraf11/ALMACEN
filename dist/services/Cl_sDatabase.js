// src/services/Cl_sDatabase.ts
import { Pool } from 'pg';
export default class Cl_sDatabase {
    static pool = null;
    static conectado = false;
    static config = null;
    static async conectar(config) {
        if (this.conectado && this.pool)
            return true;
        try {
            // Configuración por defecto o la que se pase
            const dbConfig = config || {
                host: 'localhost',
                port: 5432,
                database: 'ALMACEN',
                user: 'postgres',
                password: '123',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            };
            this.config = dbConfig;
            this.pool = new Pool(dbConfig);
            // Probar conexión
            const client = await this.pool.connect();
            console.log('✅ Conectado a PostgreSQL');
            client.release();
            this.conectado = true;
            // Crear tablas si no existen
            await this.crearTablas();
            return true;
        }
        catch (error) {
            console.error('❌ Error conectando a PostgreSQL:', error);
            this.conectado = false;
            this.pool = null;
            return false;
        }
    }
    static async crearTablas() {
        try {
            // Tabla de artículos
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS articulos (
                    id SERIAL PRIMARY KEY,
                    codigo VARCHAR(20) UNIQUE NOT NULL,
                    nombre VARCHAR(200) NOT NULL,
                    descripcion TEXT,
                    unidad_medida VARCHAR(50) NOT NULL,
                    stock_minimo INTEGER DEFAULT 5,
                    stock_maximo INTEGER DEFAULT 100,
                    stock_actual INTEGER DEFAULT 0,
                    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    activo BOOLEAN DEFAULT TRUE
                )
            `);
            // Tabla de departamentos
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS departamentos (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(200) NOT NULL,
                    responsable VARCHAR(100),
                    cargo VARCHAR(100),
                    activo BOOLEAN DEFAULT TRUE
                )
            `);
            // Tabla de entradas
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS entradas (
                    id SERIAL PRIMARY KEY,
                    articulo_id INTEGER REFERENCES articulos(id),
                    cantidad INTEGER NOT NULL,
                    numero_factura VARCHAR(50) NOT NULL,
                    proveedor VARCHAR(200),
                    fecha_entrada DATE DEFAULT CURRENT_DATE,
                    observaciones TEXT,
                    usuario_registro VARCHAR(100)
                )
            `);
            // Tabla de requisiciones
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS requisiciones (
                    id SERIAL PRIMARY KEY,
                    numero_requisicion VARCHAR(20) UNIQUE NOT NULL,
                    departamento_id INTEGER REFERENCES departamentos(id),
                    tipo VARCHAR(20) DEFAULT 'ORDINARIA',
                    fecha_solicitud DATE DEFAULT CURRENT_DATE,
                    periodo_mes INTEGER,
                    periodo_anio INTEGER,
                    estado VARCHAR(20) DEFAULT 'PENDIENTE',
                    fecha_aprobacion DATE,
                    observaciones TEXT,
                    usuario_solicita VARCHAR(100)
                )
            `);
            // Tabla de detalles de requisición
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS requisicion_detalles (
                    id SERIAL PRIMARY KEY,
                    requisicion_id INTEGER REFERENCES requisiciones(id),
                    articulo_id INTEGER REFERENCES articulos(id),
                    cantidad_solicitada INTEGER NOT NULL,
                    cantidad_despachada INTEGER DEFAULT 0,
                    observaciones TEXT
                )
            `);
            // Tabla de salidas
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS salidas (
                    id SERIAL PRIMARY KEY,
                    requisicion_detalle_id INTEGER REFERENCES requisicion_detalles(id),
                    articulo_id INTEGER REFERENCES articulos(id),
                    cantidad INTEGER NOT NULL,
                    fecha_salida DATE DEFAULT CURRENT_DATE,
                    usuario_despacha VARCHAR(100),
                    observaciones TEXT
                )
            `);
            // Tabla de parámetros
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS parametros (
                    id SERIAL PRIMARY KEY,
                    clave VARCHAR(50) UNIQUE NOT NULL,
                    valor TEXT,
                    descripcion TEXT
                )
            `);
            // Tabla de usuarios
            await this.ejecutarQuery(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    nombre_completo VARCHAR(200),
                    rol VARCHAR(50) DEFAULT 'ALMACENISTA',
                    departamento_id INTEGER REFERENCES departamentos(id),
                    activo BOOLEAN DEFAULT TRUE,
                    ultimo_acceso TIMESTAMP
                )
            `);
            console.log('✅ Tablas creadas/verificadas correctamente');
            // Insertar datos iniciales si están vacíos
            await this.insertarDatosIniciales();
        }
        catch (error) {
            console.error('❌ Error creando tablas:', error);
        }
    }
    static async insertarDatosIniciales() {
        try {
            // Verificar si hay departamentos
            const depts = await this.ejecutarQuery('SELECT COUNT(*) FROM departamentos');
            if (parseInt(depts[0].count) === 0) {
                // Insertar departamentos
                await this.ejecutarQuery(`
                    INSERT INTO departamentos (nombre, responsable, cargo) VALUES
                    ('Despacho del Contralor', 'Ana Luisa Gómez', 'Contralora del Estado Lara (P)'),
                    ('Dirección de Comunicación y Relaciones Públicas', 'Gustavo Román', 'Director(a) de Comunicación y Relaciones Públicas'),
                    ('Dirección de Talento Humano', 'Sylvi De Abreu', 'Director(a) de Talento Humano'),
                    ('Dirección de Administración', 'Ana Barrios', 'Director(a) de Administración'),
                    ('Oficina de Atención al Ciudadano', 'Yanzi Sierralta', 'Jefe de la Oficina de Atención al Ciudadano'),
                    ('Coordinación de Contabilidad y Presupuesto', 'Lissette Vargaz', 'Coordinador(a) de Contabilidad y Presupuesto'),
                    ('Coordinación de Transporte y Mensajería', 'Keiber Queralez', 'Coordinador(a) de Transporte y Mensajería'),
                    ('Dirección de Determinación de Responsabilidades', 'Yelñitza Duran', 'Director(a) de Determinación de Responsabilidades'),
                    ('Coordinación de Compras', 'Lelie Morales', 'Coordinador(a) de Compras'),
                    ('Área de Potestad Investigativa DCACOP', 'Deysi Carrasco', 'Jefe de Área de Potestad Investigativa DCACOP'),
                    ('Área de Potestad Investigativa DCAD', 'Nora Canelón', 'Jefe de Área de Potestad Investigativa DCAD'),
                    ('Coordinación de Planificación y Gestión Fiscal', 'Jenny Guédez', 'Coordinador(a) de Planificación y Gestión Fiscal'),
                    ('Coordinación de Computacion', NULL, 'Coordinador(a) de Computacion'),
                    ('Consultoría Jurídica', 'Gustavo Rodriguez', 'Consultor Jurídico'),
                    ('Dirección de Control de la Administracion Descentralizada', 'Jonny Chirinos', 'Director(a) de Control de la Administracion Descentralizada'),
                    ('Dirección de Control de la Administración Central y Otro Poder', 'Deisy Carrasco', 'Director(a) de Control de la Administración Central y Otro Poder'),
                    ('Dirección Técnica', 'Beatriz Campos', 'Director(a) Técnica'),
                    ('Unidad de Auditoría Interna', NULL, 'Auditor Interno'),
                    ('Dirección de Servicios Generales', 'Juan Carlos Torrealba', 'Director(a) de Servicios Generales'),
                    ('Coordinación de Servicios y Mantenimiento', 'Brigitte Adjunta', 'Coordinador(a) de Servicios y Mantenimiento'),
                    ('Coordinación de Archivo Central', 'Janeth Torres', 'Coordinador(a) de Archivo Central')
                `);
                console.log('✅ Departamentos insertados');
            }
            // Verificar si hay artículos
            const arts = await this.ejecutarQuery('SELECT COUNT(*) FROM articulos');
            if (parseInt(arts[0].count) === 0) {
                // Insertar artículos de ejemplo
                await this.ejecutarQuery(`
                    INSERT INTO articulos (codigo, nombre, unidad_medida, stock_minimo, stock_maximo, stock_actual) VALUES
                    ('ART-000001', 'Papel Bond Carta', 'RESMA', 5, 50, 30),
                    ('ART-000002', 'Tóner HP 78A', 'UNIDAD', 3, 20, 8),
                    ('ART-000003', 'Lapiceros', 'UNIDAD', 10, 100, 45),
                    ('ART-000004', 'Marcadores de Pizarra', 'UNIDAD', 5, 30, 12),
                    ('ART-000005', 'Clips Mariposa N°1', 'CAJA', 5, 50, 38),
                    ('ART-000006', 'Grapas Lisas Estándar', 'CAJA', 5, 30, 20),
                    ('ART-000007', 'Cinta Adhesiva Transparente', 'UNIDAD', 10, 50, 28)
                `);
                console.log('✅ Artículos insertados');
            }
            // Verificar si hay parámetros
            const params = await this.ejecutarQuery('SELECT COUNT(*) FROM parametros');
            if (parseInt(params[0].count) === 0) {
                await this.ejecutarQuery(`
                    INSERT INTO parametros (clave, valor, descripcion) VALUES
                    ('DIAS_REQUISICION', '5', 'Días hábiles para requisiciones ordinarias'),
                    ('DIAS_HABILES_INICIO', '1', 'Día de inicio para requisiciones'),
                    ('FORMATO_CODIGO', 'ART-{SEQ:6}', 'Formato para códigos de artículos')
                `);
                console.log('✅ Parámetros insertados');
            }
            // Verificar si hay usuarios
            const users = await this.ejecutarQuery('SELECT COUNT(*) FROM usuarios');
            if (parseInt(users[0].count) === 0) {
                // Nota: En producción usar bcrypt para hash
                await this.ejecutarQuery(`
                    INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES
                    ('admin', 'admin123', 'Administrador del Sistema', 'ALMACENISTA'),
                    ('director', 'director123', 'Director General', 'DIRECTOR'),
                    ('departamento1', 'dept123', 'Usuario de Departamento', 'DEPARTAMENTO')
                `);
                console.log('✅ Usuarios insertados');
            }
        }
        catch (error) {
            console.error('❌ Error insertando datos iniciales:', error);
        }
    }
    static async ejecutarQuery(query, params = []) {
        if (!this.conectado) {
            await this.conectar();
        }
        if (!this.pool) {
            throw new Error('No hay conexión a la base de datos');
        }
        try {
            const resultado = await this.pool.query(query, params);
            return resultado.rows;
        }
        catch (error) {
            console.error('Error en query:', error);
            throw error;
        }
    }
    static async obtenerArticulos() {
        return await this.ejecutarQuery('SELECT * FROM articulos WHERE activo = TRUE ORDER BY nombre');
    }
    static async obtenerDepartamentos() {
        return await this.ejecutarQuery('SELECT * FROM departamentos WHERE activo = TRUE ORDER BY nombre');
    }
    static async guardarArticulo(articulo) {
        const query = `
            INSERT INTO articulos (codigo, nombre, descripcion, unidad_medida, stock_minimo, stock_maximo, stock_actual)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, codigo
        `;
        const params = [
            articulo.codigo,
            articulo.nombre,
            articulo.descripcion || '',
            articulo.unidadMedida,
            articulo.stockMinimo || 5,
            articulo.stockMaximo || 100,
            articulo.stockActual || 0
        ];
        const resultado = await this.ejecutarQuery(query, params);
        return resultado[0] || null;
    }
    static async guardarEntrada(entrada) {
        const query = `
            INSERT INTO entradas (articulo_id, cantidad, numero_factura, proveedor, observaciones, usuario_registro)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const params = [
            entrada.articuloId,
            entrada.cantidad,
            entrada.numeroFactura,
            entrada.proveedor || '',
            entrada.observaciones || '',
            entrada.usuario || 'almacenista'
        ];
        const resultado = await this.ejecutarQuery(query, params);
        return resultado[0] || null;
    }
    static async guardarRequisicion(requisicion) {
        const query = `
            INSERT INTO requisiciones (
                numero_requisicion, departamento_id, tipo, fecha_solicitud,
                periodo_mes, periodo_anio, estado, observaciones, usuario_solicita
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;
        const params = [
            requisicion.numeroRequisicion,
            requisicion.departamentoId,
            requisicion.tipo || 'ORDINARIA',
            requisicion.fechaSolicitud || new Date(),
            requisicion.periodoMes || new Date().getMonth() + 1,
            requisicion.periodoAnio || new Date().getFullYear(),
            'PENDIENTE',
            requisicion.observaciones || '',
            requisicion.usuario || 'departamento'
        ];
        const resultado = await this.ejecutarQuery(query, params);
        return resultado[0] || null;
    }
    static async guardarDetalleRequisicion(detalle) {
        const query = `
            INSERT INTO requisicion_detalles (
                requisicion_id, articulo_id, cantidad_solicitada, observaciones
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const params = [
            detalle.requisicionId,
            detalle.articuloId,
            detalle.cantidad,
            detalle.observaciones || ''
        ];
        const resultado = await this.ejecutarQuery(query, params);
        return resultado[0] || null;
    }
    static async actualizarStock(articuloId, cantidad) {
        const query = 'UPDATE articulos SET stock_actual = stock_actual + $1 WHERE id = $2';
        await this.ejecutarQuery(query, [cantidad, articuloId]);
    }
    static async obtenerRequisicionesPendientes() {
        const query = `
            SELECT r.*, d.nombre as departamento_nombre, d.responsable
            FROM requisiciones r
            JOIN departamentos d ON r.departamento_id = d.id
            WHERE r.estado IN ('PENDIENTE', 'APROBADA')
            ORDER BY r.fecha_solicitud ASC
        `;
        return await this.ejecutarQuery(query);
    }
    static async actualizarEstadoRequisicion(id, estado) {
        const query = `
            UPDATE requisiciones 
            SET estado = $1, fecha_aprobacion = CURRENT_DATE 
            WHERE id = $2
        `;
        await this.ejecutarQuery(query, [estado, id]);
    }
    static async obtenerRequisicionesPorDepartamento(departamentoId) {
        const query = `
            SELECT * FROM requisiciones 
            WHERE departamento_id = $1 
            ORDER BY fecha_solicitud DESC
        `;
        return await this.ejecutarQuery(query, [departamentoId]);
    }
    static async cerrarConexion() {
        if (this.pool) {
            await this.pool.end();
            this.conectado = false;
            this.pool = null;
            console.log('🔒 Conexión cerrada');
        }
    }
}
//# sourceMappingURL=Cl_sDatabase.js.map
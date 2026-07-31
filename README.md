# 🏢 Sistema de Control de Almacén
## Contraloría del Estado Lara

Sistema completo para la gestión de almacén, requisiciones y reportes, desarrollado con TypeScript, Node.js y PostgreSQL.

## 📋 Características

- **Gestión de Artículos**: Catálogo completo con control de stock mínimo/máximo
- **Entradas**: Registro de facturas y notas de entrega
- **Requisiciones**: Sistema de solicitudes por departamentos
- **Despachos**: Control de salidas de artículos
- **Reportes**: Mensuales, trimestrales, semestrales y anuales
- **Alertas**: Notificaciones de stock mínimo y máximo
- **Multiusuario**: 3 roles (Almacenista, Departamento, Director)

## 🚀 Instalación

### 1. Prerrequisitos

- **Node.js** (v16 o superior)
- **PostgreSQL** (v12 o superior)
- **npm** o **yarn**

### 2. Configurar Base de Datos

1. Crea una base de datos en PostgreSQL llamada `ALMACEN`:

```sql
CREATE DATABASE "ALMACEN";
```

2. Ejecuta el script de base de datos:

```bash
# Desde la terminal, ejecuta:
psql -U postgres -d ALMACEN -f database.sql
```

O usa pgAdmin u otra herramienta gráfica para ejecutar el archivo `database.sql`.

### 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ALMACEN
DB_USER=postgres
DB_PASSWORD=tu_contraseña

PORT=3000
NODE_ENV=development
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Compilar TypeScript

```bash
npm run build
```

## 🎯 Ejecución

### Opción 1: Usando un servidor web local

Puedes usar cualquier servidor web para servir los archivos HTML:

```bash
# Usando http-server (instalar globalmente: npm install -g http-server)
http-server -p 3000

# O usando Python
python -m http.server 3000
```

Luego abre en tu navegador:
- **Login**: http://localhost:3000
- **Almacenista**: http://localhost:3000/almacenista.html
- **Departamento**: http://localhost:3000/departamento.html
- **Director**: http://localhost:3000/director.html

### Opción 2: Modo desarrollo (con hot-reload)

```bash
npm run watch
```

Esto compilará automáticamente los cambios en TypeScript.

## 👥 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Almacenista |
| director | director123 | Director |
| departamento1 | dept123 | Departamento |

⚠️ **Importante**: Cambia las contraseñas en producción.

## 📁 Estructura del Proyecto

```
Almacen/
├── src/
│   ├── config/          # Configuración de la aplicación
│   ├── controllers/     # Lógica de negocio
│   ├── interfaces/      # Interfaces TypeScript
│   ├── models/          # Modelos de datos
│   ├── services/        # Servicio de base de datos
│   └── views/           # Vistas (implementaciones de interfaces)
├── dist/                # Archivos compilados (generado automáticamente)
├── database.sql         # Script de base de datos
├── .env                 # Variables de entorno
├── package.json         # Dependencias del proyecto
├── tsconfig.json        # Configuración de TypeScript
├── index.html           # Página de login
├── almacenista.html     # Vista del almacenista
├── departamento.html    # Vista de departamentos
└── director.html        # Vista del director
```

## 🛠️ Comandos Disponibles

```bash
npm run build      # Compilar TypeScript a JavaScript
npm run watch      # Compilar en modo vigilancia (auto-reload)
npm run dev        # Ejecutar en modo desarrollo (requiere ts-node)
npm run server     # Ejecutar servidor Node.js (si existe server.js)
```

## 🏗️ Arquitectura

El sistema sigue el patrón **MVC (Modelo-Vista-Controlador)**:

- **Modelos** (`src/models/`): Representan las entidades del sistema
- **Vistas** (`src/views/`): Manejan la interfaz de usuario
- **Controladores** (`src/controllers/`): Orquestan la lógica de negocio
- **Servicios** (`src/services/`): Gestionan la conexión a la base de datos

## 📊 Base de Datos

El sistema utiliza 8 tablas principales:

1. **articulos**: Catálogo de productos
2. **entradas**: Registro de entradas de mercancía
3. **departamentos**: Unidades administrativas
4. **requisiciones**: Solicitudes de artículos
5. **requisicion_detalles**: Detalle de cada requisición
6. **salidas**: Registro de despachos
7. **parametros**: Configuración del sistema
8. **usuarios**: Credenciales de acceso

## 🔧 Personalización

### Agregar nuevos departamentos

Edita el archivo `database.sql` y agrega más departamentos:

```sql
INSERT INTO departamentos (nombre, responsable, cargo) VALUES
('Nuevo Departamento', 'Nombre Responsable', 'Cargo');
```

### Modificar parámetros del sistema

Los parámetros están en la tabla `parametros`:
- `DIAS_REQUISICION`: Días hábiles para requisiciones ordinarias
- `DIAS_HABILES_INICIO`: Día de inicio para requisiciones
- `FORMATO_CODIGO`: Formato para códigos de artículos

## 🐛 Solución de Problemas

### Error de conexión a la base de datos

1. Verifica que PostgreSQL esté ejecutándose
2. Confirma que las credenciales en `.env` sean correctas
3. Asegúrate de que la base de datos `ALMACEN` exista

### Error al compilar TypeScript

```bash
# Limpia la carpeta dist y recompila
rm -rf dist
npm run build
```

### Error en el navegador (CORS)

Si usas un servidor local, asegúrate de que sirva los archivos correctamente. Algunos navegadores bloquean módulos ES6 cuando se abren directamente desde el sistema de archivos.

## 📝 Notas Importantes

1. **Seguridad**: Las contraseñas están almacenadas en texto plano. En producción, usa bcrypt o similar.
2. **Backup**: Realiza copias de seguridad regulares de la base de datos.
3. **Producción**: Configura HTTPS y autenticación adecuada antes de desplegar.

## 🤝 Contribución

Para contribuir al proyecto:

1. Crea una rama para tu característica
2. Realiza los cambios
3. Compila y prueba
4. Envía un pull request

## 📄 Licencia

Este proyecto es propiedad de la Contraloría del Estado Lara.

---

**Desarrollado con ❤️ para la Contraloría del Estado Lara**
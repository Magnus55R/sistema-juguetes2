# 🎁 Sistema de Distribución de Juguetes - Los Álamos

Sistema municipal para gestión de distribución de juguetes con control de usuarios, sectores y entregas.

## 🌐 Acceso al Sistema

**URL del sistema:** https://magnus55r.github.io/sistema-juguetes/

## 👤 Usuarios por Defecto

### SUPERUSUARIO
- **Usuario:** `superadmin`
- **Contraseña:** `Super2024!`
- **Permisos:** Control total del sistema

### ADMINISTRADOR
- **Usuario:** `admin`
- **Contraseña:** `Admin2024!`
- **Permisos:** Gestión de datos y usuarios

### OPERADOR
- **Usuario:** `operador`
- **Contraseña:** `Operador2024!`
- **Permisos:** Consultas y registro de entregas

## 📱 Uso en iPad

1. Abre Safari
2. Ve a la URL del sistema
3. Añade a pantalla de inicio para acceso rápido
4. ¡Listo!

## ⚙️ Configuración del Backend

El sistema se conecta a Google Apps Script. Para configurar tu propia URL:

1. Abre el archivo `index.html`
2. Busca línea 357: `const API_CONFIG`
3. Actualiza la URL con tu implementación de Google Apps Script
4. Commit y push los cambios

## 🔧 Características FASE 1

- ✅ Sistema de usuarios con 3 roles
- ✅ Gestión completa de usuarios (crear, editar, eliminar)
- ✅ Filtros avanzados (búsqueda por nombre, RUT, edad, sector)
- ✅ Gestión de beneficiarios
- ✅ Control de sectores
- ✅ Registro de entregas
- ✅ Dashboard con estadísticas
- ✅ Interfaz responsive (móvil y escritorio)
- ✅ Sincronización automática

## 📊 Estructura

- `index.html` - Aplicación principal
- `backend-google-apps-script-COMPATIBLE-V2.gs` - Código backend para Google Apps Script

## 🚀 Implementación

### Frontend (Ya está listo)
El sistema está desplegado en GitHub Pages y funciona inmediatamente.

### Backend (Requiere configuración)
1. Ve a https://script.google.com
2. Crea nuevo proyecto
3. Copia el contenido de `backend-google-apps-script-COMPATIBLE-V2.gs`
4. Implementa como "Aplicación web"
5. Copia la URL de implementación
6. Actualiza la URL en `index.html` línea 357

## 📝 Licencia

Sistema desarrollado para uso municipal - Los Álamos, Chile

---

**Desarrollado con ❤️ para la Municipalidad de Los Álamos**

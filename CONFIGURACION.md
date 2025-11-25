# 📖 GUÍA DE CONFIGURACIÓN - Sistema Juguetes

## 🎯 URL DEL SISTEMA

Tu sistema está disponible en:
```
https://magnus55r.github.io/sistema-juguetes/
```

## 📱 ACCESO DESDE iPAD

### Paso 1: Abrir en Safari
1. Abre **Safari** en tu iPad
2. Ve a: `https://magnus55r.github.io/sistema-juguetes/`

### Paso 2: Añadir a Pantalla de Inicio
1. Toca el botón **Compartir** 📤 (arriba o abajo)
2. Scroll y selecciona **"Añadir a pantalla de inicio"**
3. Nombre: **Sistema Juguetes**
4. Toca **"Añadir"**

### Paso 3: Usar
- Toca el icono en tu pantalla inicio
- Se abre como una app
- Login con: `superadmin` / `Super2024!`

## ⚙️ CONFIGURAR BACKEND

### Estado Actual
El HTML tiene configurada esta URL de backend:
```
https://script.google.com/macros/s/AKfycbyx7cSEK0crVz2YWcSUlKyrLTbv8RUNuCVHyrikPgtSz1gJaL-qfrB5XT9tYtAnYqJkiw/exec
```

### ¿Es correcta?

**Si SÍ es tu URL:** ¡Listo! El sistema funcionará inmediatamente.

**Si NO es tu URL:** Necesitas actualizarla:

#### Opción A: Desde GitHub Web (iPad/PC)
1. Ve a tu repositorio: `https://github.com/Magnus55R/sistema-juguetes`
2. Click en `index.html`
3. Click en botón **lápiz** 📝 (Edit)
4. Busca línea 357 (Ctrl+F o Cmd+F: "API_CONFIG")
5. Cambia la URL por la tuya
6. Scroll abajo → **Commit changes**
7. Espera 1 minuto
8. Refresca tu sitio

#### Opción B: Desde PC con Git
```bash
git clone https://github.com/Magnus55R/sistema-juguetes.git
cd sistema-juguetes
# Edita index.html línea 357
git add index.html
git commit -m "Actualizar URL backend"
git push
```

## 🔧 IMPLEMENTAR BACKEND

Si necesitas implementar el backend desde cero:

### Paso 1: Google Apps Script
1. Ve a https://script.google.com
2. Nuevo proyecto
3. Copia el archivo `backend-google-apps-script-COMPATIBLE-V2.gs`
4. Pega en Google Apps Script
5. Guarda (Ctrl+S)

### Paso 2: Implementar
1. Click **"Implementar"** → **"Nueva implementación"**
2. Tipo: **"Aplicación web"**
3. Ejecutar como: **"Yo"**
4. Acceso: **"Cualquier persona"**
5. Click **"Implementar"**
6. **Autoriza** todos los permisos
7. **Copia la URL** (termina en `/exec`)

### Paso 3: Actualizar Frontend
1. Copia la URL del paso 2
2. Edita `index.html` línea 357
3. Pega tu URL entre comillas simples
4. Commit y push

## 📊 USUARIOS POR DEFECTO

| Username | Password | Rol | Permisos |
|----------|----------|-----|----------|
| superadmin | Super2024! | SUPERUSUARIO | Todos |
| admin | Admin2024! | ADMINISTRADOR | Gestión completa |
| operador | Operador2024! | OPERADOR | Solo consultas |

## 🎨 CARACTERÍSTICAS

### Dashboard
- Total de beneficiarios
- Entregas realizadas
- Beneficiarios pendientes
- Estadísticas por sector

### Gestión de Usuarios
- Crear usuarios
- Editar usuarios (nombre, email, rol, estado)
- Eliminar usuarios
- Cambiar contraseñas
- Control de permisos por rol

### Gestión de Beneficiarios
- Crear beneficiario (con validación RUT)
- Editar beneficiario
- Eliminar beneficiario
- Filtros avanzados:
  - Búsqueda por nombre
  - Búsqueda por RUT
  - Filtro por edad (mín/máx)
  - Filtro por sector
  - Filtro por estado

### Gestión de Sectores
- Crear sectores
- Ver estadísticas por sector
- Eliminar sectores

### Registro de Entregas
- Registrar entrega de juguete
- Seleccionar tipo de juguete
- Historial de entregas

## 🔒 SEGURIDAD

- Tokens de sesión (8 horas)
- Permisos por rol
- Validación de acciones
- No se puede eliminar último SUPERUSUARIO
- Logs de todas las acciones

## 📱 COMPATIBILIDAD

✅ iPad (Safari)
✅ iPhone (Safari)
✅ Android (Chrome)
✅ PC/Mac (Chrome, Firefox, Edge, Safari)

## 🆘 SOPORTE

### Problemas comunes:

**"Failed to fetch"**
→ Verifica la URL del backend en línea 357

**"Session expired"**
→ Vuelve a hacer login

**Pantalla blanca**
→ Abre consola (F12) y verifica errores

**No carga datos**
→ Verifica que el backend esté implementado correctamente

## 📞 CONTACTO

Para actualizaciones o modificaciones al sistema, contacta al desarrollador.

---

**Sistema operativo y listo para usar en iPad** ✨

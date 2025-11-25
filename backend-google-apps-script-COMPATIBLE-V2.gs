/**
 * SISTEMA DE DISTRIBUCIÓN DE JUGUETES - BACKEND CON USUARIOS
 * Google Apps Script - Servidor con Sistema de Roles
 * 
 * ROLES:
 * - SUPERUSUARIO: Control total del sistema
 * - ADMINISTRADOR: Gestión de usuarios y datos
 * - OPERADOR: Solo consultas y registro de entregas
 */

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

var CONFIG = {
  SHEETS: {
    BENEFICIARIOS: 'Beneficiarios',
    SECTORES: 'Sectores',
    ENTREGAS: 'Entregas',
    USUARIOS: 'Usuarios',
    CONFIGURACION: 'Configuracion',
    LOGS: 'Logs'
  }
};

// Usuarios por defecto (se crean automáticamente)
var DEFAULT_USERS = [
  {
    username: 'superadmin',
    password: 'Super2024!',
    nombre: 'Super Administrador',
    rol: 'SUPERUSUARIO',
    email: '',
    activo: true
  },
  {
    username: 'admin',
    password: 'Admin2024!',
    nombre: 'Administrador',
    rol: 'ADMINISTRADOR',
    email: '',
    activo: true
  },
  {
    username: 'operador',
    password: 'Operador2024!',
    nombre: 'Operador',
    rol: 'OPERADOR',
    email: '',
    activo: true
  }
];

// ============================================
// PERMISOS POR ROL
// ============================================

var PERMISOS = {
  SUPERUSUARIO: {
    // Configuración global
    verConfiguracion: true,
    editarConfiguracion: true,
    
    // Usuarios
    verUsuarios: true,
    crearUsuarios: true,
    editarUsuarios: true,
    eliminarUsuarios: true,
    cambiarRoles: true,
    
    // Beneficiarios
    verBeneficiarios: true,
    crearBeneficiarios: true,
    editarBeneficiarios: true,
    eliminarBeneficiarios: true,
    
    // Sectores
    verSectores: true,
    crearSectores: true,
    eliminarSectores: true,
    
    // Entregas
    verEntregas: true,
    registrarEntregas: true,
    eliminarEntregas: true,
    
    // Sistema
    verLogs: true,
    exportarDatos: true,
    importarDatos: true,
    resetearSistema: true
  },
  
  ADMINISTRADOR: {
    // Configuración global
    verConfiguracion: true,
    editarConfiguracion: false,
    
    // Usuarios
    verUsuarios: true,
    crearUsuarios: true,
    editarUsuarios: true,
    eliminarUsuarios: true,
    cambiarRoles: false, // No puede cambiar a SUPERUSUARIO
    
    // Beneficiarios
    verBeneficiarios: true,
    crearBeneficiarios: true,
    editarBeneficiarios: true,
    eliminarBeneficiarios: true,
    
    // Sectores
    verSectores: true,
    crearSectores: true,
    eliminarSectores: true,
    
    // Entregas
    verEntregas: true,
    registrarEntregas: true,
    eliminarEntregas: true,
    
    // Sistema
    verLogs: true,
    exportarDatos: true,
    importarDatos: false,
    resetearSistema: false
  },
  
  OPERADOR: {
    // Configuración global
    verConfiguracion: false,
    editarConfiguracion: false,
    
    // Usuarios
    verUsuarios: false,
    crearUsuarios: false,
    editarUsuarios: false,
    eliminarUsuarios: false,
    cambiarRoles: false,
    
    // Beneficiarios
    verBeneficiarios: true,
    crearBeneficiarios: true,
    editarBeneficiarios: false,
    eliminarBeneficiarios: false,
    
    // Sectores
    verSectores: true,
    crearSectores: false,
    eliminarSectores: false,
    
    // Entregas
    verEntregas: true,
    registrarEntregas: true,
    eliminarEntregas: false,
    
    // Sistema
    verLogs: false,
    exportarDatos: false,
    importarDatos: false,
    resetearSistema: false
  }
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Login no requiere autenticación previa
    if (data.action === 'login') {
      return login(data.username, data.password, data.deviceId);
    }
    
    // Verificar token de sesión
    var usuario = verificarSesion(data.token);
    if (!usuario) {
      return createResponse(false, 'Sesión inválida o expirada');
    }
    
    // Verificar permisos
    var permiso = verificarPermiso(usuario.rol, data.action);
    if (!permiso) {
      return createResponse(false, 'No tienes permisos para realizar esta acción');
    }
    
    // Log de la acción
    logAction(data.action, usuario.username, data.deviceId || 'unknown');
    
    // Enrutar según la acción
    switch(data.action) {
      // Beneficiarios
      case 'getBeneficiarios':
        return getBeneficiarios();
      case 'addBeneficiario':
        return addBeneficiario(data.beneficiario);
      case 'updateBeneficiario':
        return updateBeneficiario(data.id, data.updates);
      case 'deleteBeneficiario':
        return deleteBeneficiario(data.id);
      
      // Sectores
      case 'getSectores':
        return getSectores();
      case 'addSector':
        return addSector(data.sector);
      case 'deleteSector':
        return deleteSector(data.sector);
      
      // Entregas
      case 'getEntregas':
        return getEntregas();
      case 'addEntrega':
        return addEntrega(data.entrega);
      case 'deleteEntrega':
        return deleteEntrega(data.id);
      
      // Usuarios
      case 'getUsuarios':
        return getUsuarios();
      case 'addUsuario':
        return addUsuario(data.usuario, usuario.rol);
      case 'updateUsuario':
        return updateUsuario(data.id, data.updates, usuario.rol);
      case 'deleteUsuario':
        return deleteUsuario(data.id);
      case 'cambiarPassword':
        return cambiarPassword(data.id, data.newPassword, usuario);
      
      // Configuración
      case 'getConfiguracion':
        return getConfiguracion();
      case 'updateConfiguracion':
        return updateConfiguracion(data.config);
      
      // Sistema
      case 'sync':
        return syncAll(usuario.rol);
      case 'getLogs':
        return getLogs();
      case 'exportarDatos':
        return exportarDatos();
      
      default:
        return createResponse(false, 'Acción no reconocida');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'API de Distribución de Juguetes - Sistema con Usuarios',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// AUTENTICACIÓN Y SESIONES
// ============================================

function login(username, password, deviceId) {
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[1] === username && row[2] === password) {
      if (!row[6]) { // Campo activo
        return createResponse(false, 'Usuario desactivado');
      }
      
      // Generar token de sesión
      var token = generateToken();
      var expiracion = new Date();
      expiracion.setHours(expiracion.getHours() + 8); // 8 horas
      
      // Guardar sesión
      var sessionData = {
        token: token,
        userId: row[0],
        username: row[1],
        rol: row[4],
        expiracion: expiracion.toISOString(),
        deviceId: deviceId
      };
      
      PropertiesService.getScriptProperties().setProperty(
        'session_' + token, 
        JSON.stringify(sessionData)
      );
      
      // Log del login
      logAction('login', username, deviceId);
      
      return createResponse(true, 'Login exitoso', {
        token: token,
        usuario: {
          id: row[0],
          username: row[1],
          nombre: row[3],
          rol: row[4],
          email: row[5],
          permisos: PERMISOS[row[4]]
        }
      });
    }
  }
  
  return createResponse(false, 'Usuario o contraseña incorrectos');
}

function verificarSesion(token) {
  if (!token) return null;
  
  var sessionJson = PropertiesService.getScriptProperties().getProperty('session_' + token);
  if (!sessionJson) return null;
  
  var session = JSON.parse(sessionJson);
  
  // Verificar expiración
  if (new Date(session.expiracion) < new Date()) {
    PropertiesService.getScriptProperties().deleteProperty('session_' + token);
    return null;
  }
  
  return session;
}

function verificarPermiso(rol, accion) {
  var mapeoAcciones = {
    'getBeneficiarios': 'verBeneficiarios',
    'addBeneficiario': 'crearBeneficiarios',
    'updateBeneficiario': 'editarBeneficiarios',
    'deleteBeneficiario': 'eliminarBeneficiarios',
    'getSectores': 'verSectores',
    'addSector': 'crearSectores',
    'deleteSector': 'eliminarSectores',
    'getEntregas': 'verEntregas',
    'addEntrega': 'registrarEntregas',
    'deleteEntrega': 'eliminarEntregas',
    'getUsuarios': 'verUsuarios',
    'addUsuario': 'crearUsuarios',
    'updateUsuario': 'editarUsuarios',
    'deleteUsuario': 'eliminarUsuarios',
    'cambiarPassword': 'editarUsuarios',
    'getConfiguracion': 'verConfiguracion',
    'updateConfiguracion': 'editarConfiguracion',
    'sync': 'verBeneficiarios', // Sync requiere mínimo ver beneficiarios
    'getLogs': 'verLogs',
    'exportarDatos': 'exportarDatos'
  };
  
  var permiso = mapeoAcciones[accion];
  if (!permiso) return true; // Acciones sin mapeo son permitidas
  
  return PERMISOS[rol] && PERMISOS[rol][permiso];
}

function generateToken() {
  return Utilities.getUuid() + '_' + new Date().getTime();
}

// ============================================
// GESTIÓN DE HOJAS
// ============================================

function getOrCreateSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // Si no se puede abrir, crear uno nuevo
    }
  }
  
  var ss = SpreadsheetApp.create('Base de Datos - Juguetes (Con Usuarios)');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  initializeSheets(ss);
  return ss;
}

function initializeSheets(ss) {
  // Beneficiarios
  var sheet = ss.getSheetByName(CONFIG.SHEETS.BENEFICIARIOS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.BENEFICIARIOS);
    sheet.appendRow(['ID', 'RUT', 'Nombre', 'Apellidos', 'Fecha Nacimiento', 'Responsable Nombre', 
                     'Responsable RUT', 'Responsable Teléfono', 'Domicilio', 'Sector', 'Observaciones', 
                     'Fecha Registro', 'Última Actualización', 'Usuario Creador']);
    sheet.getRange('A1:N1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
  }
  
  // Sectores
  sheet = ss.getSheetByName(CONFIG.SHEETS.SECTORES);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.SECTORES);
    sheet.appendRow(['ID', 'Nombre', 'Fecha Creación', 'Usuario Creador']);
    sheet.getRange('A1:D1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
    sheet.appendRow([generateId(), 'Temuco Chico', new Date().toISOString(), 'system']);
    sheet.appendRow([generateId(), 'Antihuala', new Date().toISOString(), 'system']);
    sheet.appendRow([generateId(), 'Cerro Alto', new Date().toISOString(), 'system']);
  }
  
  // Entregas
  sheet = ss.getSheetByName(CONFIG.SHEETS.ENTREGAS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.ENTREGAS);
    sheet.appendRow(['ID', 'Beneficiario ID', 'Tipo Juguete', 'Estado', 'Fecha Entrega', 'Dispositivo', 'Usuario']);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
  }
  
  // Usuarios
  sheet = ss.getSheetByName(CONFIG.SHEETS.USUARIOS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.USUARIOS);
    sheet.appendRow(['ID', 'Username', 'Password', 'Nombre', 'Rol', 'Email', 'Activo', 'Fecha Creación', 'Último Login']);
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
    
    // Crear usuarios por defecto
    DEFAULT_USERS.forEach(function(user) {
      sheet.appendRow([
        generateId(),
        user.username,
        user.password,
        user.nombre,
        user.rol,
        user.email,
        user.activo,
        new Date().toISOString(),
        ''
      ]);
    });
  }
  
  // Configuración
  sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIGURACION);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CONFIGURACION);
    sheet.appendRow(['Clave', 'Valor', 'Descripción', 'Última Modificación', 'Usuario']);
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
    sheet.appendRow(['nombre_campana', 'Campaña Navidad 2024', 'Nombre de la campaña actual', new Date().toISOString(), 'system']);
    sheet.appendRow(['edad_minima', '0', 'Edad mínima de beneficiarios', new Date().toISOString(), 'system']);
    sheet.appendRow(['edad_maxima', '10', 'Edad máxima de beneficiarios', new Date().toISOString(), 'system']);
    sheet.appendRow(['permitir_duplicados', 'false', 'Permitir beneficiarios duplicados', new Date().toISOString(), 'system']);
  }
  
  // Logs
  sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
    sheet.appendRow(['Timestamp', 'Acción', 'Usuario', 'Dispositivo', 'Detalles']);
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#667eea').setFontColor('white');
  }
  
  // Eliminar hoja por defecto
  var defaultSheet = ss.getSheetByName('Hoja 1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);
}

function getSheet(sheetName) {
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initializeSheets(ss);
    sheet = ss.getSheetByName(sheetName);
  }
  return sheet;
}

// ============================================
// FUNCIONES DE BENEFICIARIOS (sin cambios)
// ============================================

function getBeneficiarios() {
  var sheet = getSheet(CONFIG.SHEETS.BENEFICIARIOS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin beneficiarios', []);
  
  var beneficiarios = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    beneficiarios.push({
      id: row[0],
      rut: row[1],
      nombre: row[2],
      apellidos: row[3],
      fechaNacimiento: row[4],
      responsable: { nombre: row[5], rut: row[6], telefono: row[7] },
      domicilio: row[8],
      sector: row[9],
      observaciones: row[10],
      fechaRegistro: row[11],
      updatedAt: row[12],
      usuarioCreador: row[13]
    });
  }
  return createResponse(true, 'Beneficiarios obtenidos', beneficiarios);
}

function addBeneficiario(beneficiario) {
  var session = verificarSesion(beneficiario.token);
  var sheet = getSheet(CONFIG.SHEETS.BENEFICIARIOS);
  var id = generateId();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id, beneficiario.rut, beneficiario.nombre, beneficiario.apellidos,
    beneficiario.fechaNacimiento, beneficiario.responsable.nombre,
    beneficiario.responsable.rut, beneficiario.responsable.telefono,
    beneficiario.domicilio, beneficiario.sector, beneficiario.observaciones || '',
    timestamp, timestamp, session ? session.username : 'unknown'
  ]);
  
  return createResponse(true, 'Beneficiario agregado', { id: id });
}

function updateBeneficiario(id, updates) {
  var sheet = getSheet(CONFIG.SHEETS.BENEFICIARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var row = i + 1;
      var timestamp = new Date().toISOString();
      if (updates.rut) sheet.getRange(row, 2).setValue(updates.rut);
      if (updates.nombre) sheet.getRange(row, 3).setValue(updates.nombre);
      if (updates.apellidos) sheet.getRange(row, 4).setValue(updates.apellidos);
      if (updates.fechaNacimiento) sheet.getRange(row, 5).setValue(updates.fechaNacimiento);
      if (updates.responsable) {
        if (updates.responsable.nombre) sheet.getRange(row, 6).setValue(updates.responsable.nombre);
        if (updates.responsable.rut) sheet.getRange(row, 7).setValue(updates.responsable.rut);
        if (updates.responsable.telefono) sheet.getRange(row, 8).setValue(updates.responsable.telefono);
      }
      if (updates.domicilio) sheet.getRange(row, 9).setValue(updates.domicilio);
      if (updates.sector) sheet.getRange(row, 10).setValue(updates.sector);
      if (updates.observaciones !== undefined) sheet.getRange(row, 11).setValue(updates.observaciones);
      sheet.getRange(row, 13).setValue(timestamp);
      return createResponse(true, 'Beneficiario actualizado');
    }
  }
  return createResponse(false, 'Beneficiario no encontrado');
}

function deleteBeneficiario(id) {
  var sheet = getSheet(CONFIG.SHEETS.BENEFICIARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      var entregasSheet = getSheet(CONFIG.SHEETS.ENTREGAS);
      var entregasData = entregasSheet.getDataRange().getValues();
      for (var j = entregasData.length - 1; j >= 1; j--) {
        if (entregasData[j][1] === id) {
          entregasSheet.deleteRow(j + 1);
        }
      }
      return createResponse(true, 'Beneficiario eliminado');
    }
  }
  return createResponse(false, 'Beneficiario no encontrado');
}

// ============================================
// FUNCIONES DE SECTORES
// ============================================

function getSectores() {
  var sheet = getSheet(CONFIG.SHEETS.SECTORES);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin sectores', []);
  
  var sectores = [];
  for (var i = 1; i < data.length; i++) {
    sectores.push({
      id: data[i][0],
      nombre: data[i][1],
      createdAt: data[i][2],
      usuarioCreador: data[i][3]
    });
  }
  return createResponse(true, 'Sectores obtenidos', sectores);
}

function addSector(sector) {
  var sheet = getSheet(CONFIG.SHEETS.SECTORES);
  var id = generateId();
  var timestamp = new Date().toISOString();
  sheet.appendRow([id, sector.nombre, timestamp, sector.usuario || 'unknown']);
  return createResponse(true, 'Sector agregado', { id: id });
}

function deleteSector(sectorNombre) {
  var sheet = getSheet(CONFIG.SHEETS.SECTORES);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === sectorNombre) {
      sheet.deleteRow(i + 1);
      return createResponse(true, 'Sector eliminado');
    }
  }
  return createResponse(false, 'Sector no encontrado');
}

// ============================================
// FUNCIONES DE ENTREGAS
// ============================================

function getEntregas() {
  var sheet = getSheet(CONFIG.SHEETS.ENTREGAS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin entregas', []);
  
  var entregas = [];
  for (var i = 1; i < data.length; i++) {
    entregas.push({
      id: data[i][0],
      beneficiarioId: data[i][1],
      tipoJuguete: data[i][2],
      estado: data[i][3],
      fecha: data[i][4],
      dispositivo: data[i][5],
      usuario: data[i][6]
    });
  }
  return createResponse(true, 'Entregas obtenidas', entregas);
}

function addEntrega(entrega) {
  var sheet = getSheet(CONFIG.SHEETS.ENTREGAS);
  var id = generateId();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    entrega.beneficiarioId,
    entrega.tipoJuguete || '',
    entrega.estado,
    timestamp,
    entrega.dispositivo || 'unknown',
    entrega.usuario || 'unknown'
  ]);
  
  return createResponse(true, 'Entrega registrada', { id: id });
}

function deleteEntrega(id) {
  var sheet = getSheet(CONFIG.SHEETS.ENTREGAS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return createResponse(true, 'Entrega eliminada');
    }
  }
  return createResponse(false, 'Entrega no encontrada');
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================

function getUsuarios() {
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin usuarios', []);
  
  var usuarios = [];
  for (var i = 1; i < data.length; i++) {
    usuarios.push({
      id: data[i][0],
      username: data[i][1],
      // NO devolver password
      nombre: data[i][3],
      rol: data[i][4],
      email: data[i][5],
      activo: data[i][6],
      fechaCreacion: data[i][7],
      ultimoLogin: data[i][8]
    });
  }
  return createResponse(true, 'Usuarios obtenidos', usuarios);
}

function addUsuario(usuario, rolCreador) {
  // ADMINISTRADOR no puede crear SUPERUSUARIO
  if (rolCreador === 'ADMINISTRADOR' && usuario.rol === 'SUPERUSUARIO') {
    return createResponse(false, 'No tienes permisos para crear superusuarios');
  }
  
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  
  // Verificar que el username no exista
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === usuario.username) {
      return createResponse(false, 'El username ya existe');
    }
  }
  
  var id = generateId();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    usuario.username,
    usuario.password,
    usuario.nombre,
    usuario.rol,
    usuario.email || '',
    true, // activo por defecto
    timestamp,
    ''
  ]);
  
  return createResponse(true, 'Usuario creado', { id: id });
}

function updateUsuario(id, updates, rolActualizador) {
  // ADMINISTRADOR no puede cambiar rol a SUPERUSUARIO
  if (rolActualizador === 'ADMINISTRADOR' && updates.rol === 'SUPERUSUARIO') {
    return createResponse(false, 'No tienes permisos para asignar rol de superusuario');
  }
  
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var row = i + 1;
      if (updates.username) sheet.getRange(row, 2).setValue(updates.username);
      if (updates.nombre) sheet.getRange(row, 4).setValue(updates.nombre);
      if (updates.rol) sheet.getRange(row, 5).setValue(updates.rol);
      if (updates.email !== undefined) sheet.getRange(row, 6).setValue(updates.email);
      if (updates.activo !== undefined) sheet.getRange(row, 7).setValue(updates.activo);
      return createResponse(true, 'Usuario actualizado');
    }
  }
  return createResponse(false, 'Usuario no encontrado');
}

function deleteUsuario(id) {
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // No permitir eliminar el último SUPERUSUARIO
      if (data[i][4] === 'SUPERUSUARIO') {
        var countSuper = 0;
        for (var j = 1; j < data.length; j++) {
          if (data[j][4] === 'SUPERUSUARIO') countSuper++;
        }
        if (countSuper === 1) {
          return createResponse(false, 'No se puede eliminar el único superusuario');
        }
      }
      
      sheet.deleteRow(i + 1);
      return createResponse(true, 'Usuario eliminado');
    }
  }
  return createResponse(false, 'Usuario no encontrado');
}

function cambiarPassword(id, newPassword, usuarioActual) {
  var sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // Solo SUPERUSUARIO puede cambiar password de otros SUPERUSUARIO
      if (data[i][4] === 'SUPERUSUARIO' && usuarioActual.rol !== 'SUPERUSUARIO') {
        return createResponse(false, 'No tienes permisos para cambiar password de superusuario');
      }
      
      var row = i + 1;
      sheet.getRange(row, 3).setValue(newPassword);
      return createResponse(true, 'Contraseña cambiada');
    }
  }
  return createResponse(false, 'Usuario no encontrado');
}

// ============================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================

function getConfiguracion() {
  var sheet = getSheet(CONFIG.SHEETS.CONFIGURACION);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin configuración', {});
  
  var config = {};
  for (var i = 1; i < data.length; i++) {
    config[data[i][0]] = {
      valor: data[i][1],
      descripcion: data[i][2],
      ultimaModificacion: data[i][3],
      usuario: data[i][4]
    };
  }
  return createResponse(true, 'Configuración obtenida', config);
}

function updateConfiguracion(config) {
  var sheet = getSheet(CONFIG.SHEETS.CONFIGURACION);
  var data = sheet.getDataRange().getValues();
  var timestamp = new Date().toISOString();
  
  Object.keys(config).forEach(function(clave) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === clave) {
        var row = i + 1;
        sheet.getRange(row, 2).setValue(config[clave]);
        sheet.getRange(row, 4).setValue(timestamp);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([clave, config[clave], '', timestamp, 'system']);
    }
  });
  
  return createResponse(true, 'Configuración actualizada');
}

// ============================================
// FUNCIÓN DE SINCRONIZACIÓN COMPLETA
// ============================================

function syncAll(rol) {
  var result = {
    beneficiarios: getBeneficiarios().data,
    sectores: getSectores().data,
    entregas: getEntregas().data,
    timestamp: new Date().toISOString()
  };
  
  // Solo incluir usuarios si tiene permisos
  if (PERMISOS[rol] && PERMISOS[rol].verUsuarios) {
    result.usuarios = getUsuarios().data;
  }
  
  // Solo incluir configuración si tiene permisos
  if (PERMISOS[rol] && PERMISOS[rol].verConfiguracion) {
    result.configuracion = getConfiguracion().data;
  }
  
  return createResponse(true, 'Sincronización completa', result);
}

// ============================================
// FUNCIONES DE LOG
// ============================================

function logAction(action, usuario, deviceId) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.LOGS);
    var timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, action, usuario, deviceId, '']);
    
    var lastRow = sheet.getLastRow();
    if (lastRow > 1001) {
      sheet.deleteRows(2, lastRow - 1001);
    }
  } catch (e) {
    // No hacer nada si falla el log
  }
}

function getLogs() {
  var sheet = getSheet(CONFIG.SHEETS.LOGS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createResponse(true, 'Sin logs', []);
  
  var logs = [];
  for (var i = 1; i < data.length && i <= 100; i++) { // Solo últimos 100
    logs.push({
      timestamp: data[i][0],
      accion: data[i][1],
      usuario: data[i][2],
      dispositivo: data[i][3],
      detalles: data[i][4]
    });
  }
  return createResponse(true, 'Logs obtenidos', logs.reverse());
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateId() {
  return Utilities.getUuid();
}

function createResponse(success, message, data = null) {
  var response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheetUrl() {
  var ss = getOrCreateSpreadsheet();
  return ss.getUrl();
}

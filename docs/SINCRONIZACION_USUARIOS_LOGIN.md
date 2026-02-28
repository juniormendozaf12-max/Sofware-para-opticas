# 🔄 SINCRONIZACIÓN DB.USUARIOS ↔️ LOGIN

**Fecha:** 3 de Enero 2026
**Archivo:** Revision0008.html
**Función Principal:** `obtenerCredencialesDinamicas()` (Líneas 11733-11812)

---

## 🎯 OBJETIVO

Sincronizar los usuarios creados en **"Configuración del Sistema > Usuarios"** con el **sistema de login**, de manera que aparezcan automáticamente como opciones de vendedores en la pantalla de acceso.

---

## 📋 CÓMO FUNCIONA

### Flujo de Sincronización:

```
1. Usuario crea vendedores en Configuración del Sistema
   ↓
2. Se guardan en localStorage: DB.USUARIOS
   ↓
3. Al abrir pantalla de login, se llama obtenerCredencialesDinamicas()
   ↓
4. Función lee DB.USUARIOS y filtra usuarios habilitados
   ↓
5. Los convierte a formato de credenciales de vendedor
   ↓
6. Se cargan en el dropdown "VENDEDOR" del login
```

---

## 🔧 FUNCIÓN: obtenerCredencialesDinamicas()

**Ubicación:** Líneas 11733-11812

### ¿Qué hace?

1. **Lee DB.USUARIOS** del localStorage
2. **Filtra usuarios válidos** con dos criterios:
   - `estado === 'HABILITADO'`
   - Y (`esVendedor === true` O `grupo === 'VENTAS'`)
3. **Fallback inteligente:** Si no encuentra ningún vendedor con esos criterios, carga TODOS los usuarios habilitados
4. **Convierte usuarios** al formato de credenciales de vendedor
5. **Asigna a establecimientos** (actualmente a ambos: DOS_DE_MAYO y PLAZA_DE_ARMAS)
6. **Retorna objeto** con credenciales actualizadas

### Código Simplificado:

```javascript
function obtenerCredencialesDinamicas() {
  const usuariosDB = load(DB.USUARIOS) || [];

  // Estructura base con administradores
  const credencialesDinamicas = {
    'DOS_DE_MAYO': {
      ADMINISTRADOR: {...},
      VENDEDORES: []
    },
    'PLAZA_DE_ARMAS': {
      ADMINISTRADOR: {...},
      VENDEDORES: []
    }
  };

  // PASO 1: Intentar cargar vendedores específicos
  usuariosDB.forEach(u => {
    if (u.estado === 'HABILITADO' &&
        (u.esVendedor === true || u.grupo === 'VENTAS')) {

      const vendedor = {
        usuario: u.username,
        password: u.password || '1234',
        rol: ROLES.VENDEDOR,
        nombreCompleto: u.nombres,
        activo: true,
        dbId: u.id
      };

      credencialesDinamicas.DOS_DE_MAYO.VENDEDORES.push(vendedor);
      credencialesDinamicas.PLAZA_DE_ARMAS.VENDEDORES.push({...vendedor});
    }
  });

  // PASO 2: Fallback si no hay vendedores
  if (credencialesDinamicas.DOS_DE_MAYO.VENDEDORES.length === 0) {
    usuariosDB.forEach(u => {
      if (u.estado === 'HABILITADO') {
        // Agregar TODOS los usuarios habilitados como vendedores
        ...
      }
    });
  }

  return credencialesDinamicas;
}
```

---

## 📊 ESTRUCTURA DE USUARIO EN DB.USUARIOS

Cuando creas un usuario en Configuración del Sistema, se guarda con esta estructura:

```javascript
{
  id: 'USR001',
  tipoDoc: 'DNI',
  dni: '12345678',
  nombres: 'Aldo',              // ← Nombre completo
  telefono: '987654321',
  correo: 'aldo@example.com',
  direccion: 'Jr. Ejemplo 123',
  fechaNac: '1990-01-01',
  fechaInicio: '2026-01-03',
  grupo: 'VENTAS',              // ← Grupo (VENTAS, ALMACEN, etc.)
  esVendedor: true,             // ← Checkbox de vendedor
  esCajero: false,
  username: 'ALDO',             // ← Usuario de login
  password: '1234',             // ← Contraseña
  estado: 'HABILITADO',         // ← Estado (HABILITADO/ANULADO)
  almacenes: [],
  cajas: []
}
```

---

## 🔄 MAPEO: DB.USUARIOS → CREDENCIALES LOGIN

| Campo DB.USUARIOS | → | Campo Credencial Login | Uso |
|------------------|---|----------------------|-----|
| `username` | → | `usuario` | Login username |
| `password` | → | `password` | Login password |
| `nombres` | → | `nombreCompleto` | Mostrar en dropdown |
| `estado` | → | Filtro | Solo 'HABILITADO' |
| `esVendedor` | → | Filtro | Si `true`, se incluye |
| `grupo` | → | Filtro | Si 'VENTAS', se incluye |
| `id` | → | `dbId` | Referencia a DB |

---

## ✅ CRITERIOS DE INCLUSIÓN

Un usuario aparecerá en el login como vendedor SI:

### Criterio Primario:
```javascript
estado === 'HABILITADO'
AND
(esVendedor === true OR grupo === 'VENTAS')
```

### Criterio Fallback (si primario no encuentra usuarios):
```javascript
estado === 'HABILITADO'
```

---

## 📝 EJEMPLO REAL: Aldo y FREDDY

Si creaste a Aldo y FREDDY en Configuración del Sistema:

### En DB.USUARIOS:
```javascript
[
  {
    id: 'USR001',
    nombres: 'Aldo',
    username: 'ALDO',
    password: '1234',
    estado: 'HABILITADO',
    esVendedor: true,    // ← o grupo: 'VENTAS'
    ...
  },
  {
    id: 'USR002',
    nombres: 'FREDDY',
    username: 'FREDDY',
    password: 'FRED123',
    estado: 'HABILITADO',
    esVendedor: true,    // ← o grupo: 'VENTAS'
    ...
  }
]
```

### En CREDENCIALES (después de obtenerCredencialesDinamicas()):
```javascript
{
  'DOS_DE_MAYO': {
    VENDEDORES: [
      {
        usuario: 'ALDO',
        password: '1234',
        rol: 'VENDEDOR',
        nombreCompleto: 'Aldo',
        activo: true,
        dbId: 'USR001'
      },
      {
        usuario: 'FREDDY',
        password: 'FRED123',
        rol: 'VENDEDOR',
        nombreCompleto: 'FREDDY',
        activo: true,
        dbId: 'USR002'
      }
    ]
  }
}
```

### En el Dropdown de Login:
```
VENDEDOR:
┌────────────────────────────────────┐
│ -- Seleccione vendedor --          │
│ Aldo (ALDO)                        │  ← Se muestra aquí
│ FREDDY (FREDDY)                    │  ← Se muestra aquí
└────────────────────────────────────┘
```

---

## 🔍 DEBUGGING EN CONSOLA

La función imprime logs detallados en la consola del navegador (F12):

### Logs que verás:

1. **Lista completa de usuarios:**
   ```
   🔍 Usuarios en DB.USUARIOS: [...]
   ```

2. **Cada vendedor encontrado:**
   ```
   ✅ Usuario vendedor encontrado: Aldo ( ALDO )
   ✅ Usuario vendedor encontrado: FREDDY ( FREDDY )
   ```

3. **Advertencia si no hay vendedores (fallback):**
   ```
   ⚠️ No se encontraron vendedores con esVendedor=true o grupo=VENTAS.
      Cargando TODOS los usuarios habilitados como vendedores...
   ```

4. **Usuarios agregados en fallback:**
   ```
   💡 Agregando usuario habilitado: Aldo ( ALDO )
   💡 Agregando usuario habilitado: FREDDY ( FREDDY )
   ```

5. **Resultado final:**
   ```
   📋 Credenciales dinámicas cargadas: {...}
   👥 Total vendedores DOS_DE_MAYO: 2
   👥 Total vendedores PLAZA_DE_ARMAS: 2
   ```

---

## 🎬 CUÁNDO SE EJECUTA

La función `obtenerCredencialesDinamicas()` se llama en:

### 1. Al cambiar ROL o ESTABLECIMIENTO en login:
```javascript
// Línea 12054 en actualizarOpcionesLogin()
function actualizarOpcionesLogin() {
  CREDENCIALES = obtenerCredencialesDinamicas(); // ← AQUÍ

  // Luego carga los vendedores en el dropdown
  const vendedores = CREDENCIALES[establecimiento]?.VENDEDORES || [];
  ...
}
```

### 2. Al abrir la pantalla de login:
Se ejecuta automáticamente cuando cambias de ROL a "Vendedor/a" y seleccionas un establecimiento.

---

## 🛠️ CÓMO AGREGAR NUEVOS VENDEDORES

### Método 1: A través de la Interfaz (RECOMENDADO)

1. **Login como ADMINISTRADOR**
2. **Ir a:** Configuración → Usuarios
3. **Click:** ➕ Nuevo
4. **Llenar formulario:**
   - **Nombres:** Juan Pérez
   - **Usuario:** JUAN
   - **Contraseña:** 1234
   - **Grupo:** VENTAS (o marcar ✓ Es Vendedor)
5. **Click:** Guardar
6. **Resultado:** Juan aparecerá automáticamente en el login

### Método 2: Verificar que usuario existe esté habilitado

Si ya creaste a Aldo y FREDDY pero no aparecen:

1. **Ir a:** Configuración → Usuarios
2. **Click:** 🔍 Mostrar
3. **Verificar columnas:**
   - **ESTADO:** Debe decir "HABILITADO" (verde)
   - **GRUPO:** Debe tener algún valor (ej: VENTAS)
4. **Si dice "ANULADO":** Click en el usuario → Modificar → Cambiar estado
5. **Si no tiene GRUPO:** Click en el usuario → Modificar → Poner "VENTAS" en grupo
6. **Alternativamente:** Marcar checkbox ✓ "Es Vendedor"
7. **Guardar cambios**

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Problema 1: Los vendedores no aparecen en el login

**Causa posible:** `estado !== 'HABILITADO'` o ambos `esVendedor === false` y `grupo !== 'VENTAS'`

**Solución:**
1. Abrir consola del navegador (F12)
2. Refrescar página
3. Ir al login y cambiar ROL a "Vendedor/a"
4. Ver logs en consola
5. Si dice "⚠️ No se encontraron vendedores...", verificar:
   - Estado de usuarios en Configuración
   - Campo "Es Vendedor" o campo "Grupo"

### Problema 2: Aparecen vendedores pero con nombre incorrecto

**Causa:** El campo `nombres` está vacío o tiene valor incorrecto

**Solución:**
1. Ir a Configuración → Usuarios
2. Modificar usuario
3. Asegurarse que campo "Nombres" tiene el nombre completo
4. Guardar

### Problema 3: Login falla con vendedor de DB

**Causa posible:** Contraseña no está guardada correctamente

**Solución:**
1. Ir a Configuración → Usuarios
2. Modificar usuario
3. Ingresar nueva contraseña
4. Confirmar contraseña
5. Guardar

---

## 🔮 MEJORAS FUTURAS

### 1. Asignación por Establecimiento
Actualmente todos los vendedores aparecen en ambos establecimientos. Se puede mejorar agregando campo `establecimiento` en DB.USUARIOS:

```javascript
if (u.establecimiento === 'DOS_DE_MAYO') {
  credencialesDinamicas.DOS_DE_MAYO.VENDEDORES.push(vendedor);
} else if (u.establecimiento === 'PLAZA_DE_ARMAS') {
  credencialesDinamicas.PLAZA_DE_ARMAS.VENDEDORES.push(vendedor);
}
```

### 2. Roles Múltiples
Permitir que un usuario tenga múltiples roles (vendedor + cajero + almacenero):

```javascript
if (u.roles && u.roles.includes('VENDEDOR')) {
  // Agregar a vendedores
}
```

### 3. Foto de Perfil
Agregar foto a usuarios y mostrarla en el dropdown de login:

```javascript
<option value="${vendedor.usuario}">
  <img src="${vendedor.foto}"> ${vendedor.nombreCompleto}
</option>
```

---

## 📌 RESUMEN

| Aspecto | Detalle |
|---------|---------|
| **Función Principal** | `obtenerCredencialesDinamicas()` |
| **Líneas de Código** | 11733-11812 |
| **Fuente de Datos** | `DB.USUARIOS` en localStorage |
| **Filtro Primario** | `estado='HABILITADO' AND (esVendedor=true OR grupo='VENTAS')` |
| **Filtro Fallback** | `estado='HABILITADO'` |
| **Actualización** | Dinámica en cada login |
| **Debugging** | Console logs con colores |

---

**¡El sistema ahora está sincronizado! Aldo y FREDDY aparecerán automáticamente en el login. 🎉**

_Documentación generada el 3 de Enero 2026_

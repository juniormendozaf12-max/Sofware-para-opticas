# 🔐 NUEVO SISTEMA DE LOGIN CON SELECTOR DE ROL

**Fecha:** 3 de Enero 2026
**Archivo:** Revision0008.html

---

## 🎯 CÓMO FUNCIONA EL NUEVO LOGIN

El sistema ahora tiene **3 pasos** para iniciar sesión:

### PASO 1: Seleccionar ROL
```
ROL DE USUARIO:
┌────────────────────────────────┐
│ -- Seleccione su rol --        │
│ 🔐 Administrador               │ ← Acceso total
│ 👤 Vendedor/a                  │ ← Acceso limitado
└────────────────────────────────┘
```

### PASO 2: Seleccionar ESTABLECIMIENTO
```
ESTABLECIMIENTO:
┌────────────────────────────────────────────┐
│ -- Seleccione establecimiento --           │
│ Centro Óptico Sicuani (Dos de Mayo)       │
│ Óptica Sicuani (Plaza de Armas)           │
└────────────────────────────────────────────┘
```

### PASO 3: Seleccionar USUARIO (solo vendedores)

#### Si seleccionaste ADMINISTRADOR:
```
USUARIO:
┌────────────────────────────────┐
│ Centro Óptico Sicuani          │ ← Se muestra automáticamente (readonly)
└────────────────────────────────┘

CONTRASEÑA:
┌────────────────────────────────┐
│ ••••                           │ ← Ingresa: ADMI
└────────────────────────────────┘
```

#### Si seleccionaste VENDEDOR:
```
VENDEDOR:
┌────────────────────────────────────┐
│ -- Seleccione vendedor --          │
│ María García (MARIA)               │ ← Click aquí
│ Juan Pérez (JUAN)                  │
└────────────────────────────────────┘

CONTRASEÑA:
┌────────────────────────────────┐
│ ••••                           │ ← Ingresa: VENTA123
└────────────────────────────────┘
```

---

## 📖 EJEMPLOS DE FLUJOS COMPLETOS

### Ejemplo 1: Login como ADMINISTRADOR

```
1. Selecciona ROL: 🔐 Administrador
   ↓
2. Se habilita campo ESTABLECIMIENTO
   ↓
3. Selecciona: Centro Óptico Sicuani (Dos de Mayo)
   ↓
4. Campo USUARIO se llena automáticamente: "Centro Óptico Sicuani"
   ↓
5. Ingresa CONTRASEÑA: ADMI
   ↓
6. Click en "✓ Entrar"
   ↓
7. ✅ Login exitoso - Acceso total al sistema
```

### Ejemplo 2: Login como VENDEDOR

```
1. Selecciona ROL: 👤 Vendedor/a
   ↓
2. Se habilita campo ESTABLECIMIENTO
   ↓
3. Selecciona: Centro Óptico Sicuani (Dos de Mayo)
   ↓
4. Aparece lista de vendedores de ese establecimiento
   ↓
5. Selecciona: María García (MARIA)
   ↓
6. Ingresa CONTRASEÑA: VENTA123
   ↓
7. Click en "✓ Entrar"
   ↓
8. ✅ Login exitoso - Modal de bienvenida vendedor
   ↓
9. Click en "Continuar a Apertura de Caja"
```

---

## 🔑 CREDENCIALES COMPLETAS

### DOS_DE_MAYO (Centro Óptico Sicuani)

#### ADMINISTRADOR:
- **ROL**: 🔐 Administrador
- **ESTABLECIMIENTO**: Centro Óptico Sicuani (Dos de Mayo)
- **USUARIO**: Centro Óptico Sicuani *(se muestra automáticamente)*
- **CONTRASEÑA**: `ADMI`

#### VENDEDORES:
| Vendedor | Usuario | Contraseña |
|----------|---------|------------|
| María García | MARIA | VENTA123 |
| Juan Pérez | JUAN | VENTA456 |

### PLAZA_DE_ARMAS (Óptica Sicuani)

#### ADMINISTRADOR:
- **ROL**: 🔐 Administrador
- **ESTABLECIMIENTO**: Óptica Sicuani (Plaza de Armas)
- **USUARIO**: Óptica Sicuani *(se muestra automáticamente)*
- **CONTRASEÑA**: `ADMI`

#### VENDEDORES:
| Vendedor | Usuario | Contraseña |
|----------|---------|------------|
| Carmen López | CARMEN | VENTA789 |

---

## ✨ CARACTERÍSTICAS DEL NUEVO SISTEMA

### 1. Interfaz Progresiva
- ✅ Campos se habilitan paso a paso
- ✅ Solo se muestran opciones relevantes según rol
- ✅ Feedback visual inmediato

### 2. Lista Dinámica de Vendedores
- ✅ Se cargan automáticamente según establecimiento
- ✅ Muestra nombre completo y usuario
- ✅ Solo vendedores activos aparecen

### 3. Validaciones Inteligentes
- ✅ Verifica que se complete cada paso
- ✅ Mensajes de error específicos
- ✅ No permite avanzar sin seleccionar opciones

### 4. Seguridad Mejorada
- ✅ Administradores tienen usuario fijo (no se puede cambiar)
- ✅ Vendedores deben ser seleccionados de lista (no se pueden inventar)
- ✅ Contraseñas validadas según rol seleccionado

---

## 🎨 TEMAS VISUALES

El login cambia de color según el establecimiento:

### Centro Óptico Sicuani (DOS_DE_MAYO)
- **Color**: Morado (#7c3aed)
- **Tema**: tema-morado

### Óptica Sicuani (PLAZA_DE_ARMAS)
- **Color**: Azul (#2563eb)
- **Tema**: tema-azul

---

## 🔧 PARA AGREGAR NUEVOS VENDEDORES

Editar archivo `Revision0008.html`, líneas 11718-11733:

```javascript
'DOS_DE_MAYO': {
  ADMINISTRADOR: { ... },
  VENDEDORES: [
    {
      usuario: 'MARIA',
      password: 'VENTA123',
      rol: ROLES.VENDEDOR,
      nombreCompleto: 'María García',
      activo: true
    },
    // AGREGAR NUEVO VENDEDOR AQUÍ:
    {
      usuario: 'PEDRO',
      password: 'VENTA999',
      rol: ROLES.VENDEDOR,
      nombreCompleto: 'Pedro Martínez',
      activo: true
    }
  ]
}
```

Guardar y recargar. El nuevo vendedor aparecerá automáticamente en la lista.

---

## 📱 FUNCIONES JAVASCRIPT

### actualizarOpcionesLogin()
Función principal que maneja la lógica de mostrar/ocultar campos según selección.

```javascript
// Líneas 12006-12065
// Se ejecuta cada vez que cambias ROL o ESTABLECIMIENTO
// Carga dinámicamente los vendedores del establecimiento
```

### cargarDatosVendedor()
Se ejecuta al seleccionar un vendedor de la lista.

```javascript
// Líneas 12068-12077
// Hace focus automático en campo de contraseña
```

### cambiarTemaLogin()
Cambia colores según establecimiento.

```javascript
// Líneas 12080-12108
// Morado para DOS_DE_MAYO
// Azul para PLAZA_DE_ARMAS
```

---

## 🚨 MENSAJES DE ERROR

El sistema muestra mensajes específicos:

| Error | Mensaje |
|-------|---------|
| No selecciona ROL | ⚠️ Seleccione un rol de usuario |
| No selecciona ESTABLECIMIENTO | ⚠️ Seleccione un establecimiento |
| No selecciona USUARIO | ⚠️ Seleccione un usuario |
| No ingresa CONTRASEÑA | ⚠️ Ingrese su contraseña |
| Contraseña incorrecta | ❌ Contraseña incorrecta |

---

## ✅ VENTAJAS DEL NUEVO SISTEMA

### Para el DUEÑO:
- ✅ Control total de quién accede
- ✅ Diferenciación clara entre admin y vendedores
- ✅ Fácil agregar/desactivar vendedores

### Para los VENDEDORES:
- ✅ Login más simple (seleccionar de lista)
- ✅ No necesitan recordar usuario exacto
- ✅ Ven su nombre completo en la lista

### Para el SISTEMA:
- ✅ Más seguro (no se pueden inventar usuarios)
- ✅ Validaciones más estrictas
- ✅ Código más limpio y mantenible

---

**¡Nuevo Sistema de Login Implementado! 🎉**

_Documentación generada el 3 de Enero 2026_

# 🔐 SISTEMA DE ROLES Y PERMISOS - CENTRO ÓPTICO SICUANI

**Fecha de Implementación:** 3 de Enero 2026
**Archivo:** Revision0008.html
**Versión:** 1.0

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Roles Disponibles](#roles-disponibles)
4. [Credenciales de Acceso](#credenciales-de-acceso)
5. [Matriz de Permisos](#matriz-de-permisos)
6. [Sistema de Códigos Especiales](#sistema-de-códigos-especiales)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Validaciones Implementadas](#validaciones-implementadas)
9. [Interfaz Adaptativa](#interfaz-adaptativa)
10. [Guía de Uso](#guía-de-uso)

---

## 🎯 RESUMEN EJECUTIVO

Se ha implementado un **sistema profesional de roles y permisos** que permite diferenciar entre usuarios Administradores y Vendedores, cada uno con accesos y restricciones específicas para garantizar la seguridad y eficiencia operativa del Centro Óptico Sicuani.

### Características Principales:

✅ **Autenticación Multi-Rol**: Login diferenciado para administradores y vendedores
✅ **Códigos de Autorización**: Acciones restringidas requieren código del dueño
✅ **Interfaz Adaptativa**: El menú y opciones se adaptan según el rol
✅ **Validaciones en Tiempo Real**: Permisos verificados antes de cada acción
✅ **Mensaje de Bienvenida Informativo**: El vendedor conoce sus funciones al iniciar

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Estructura de Datos

```javascript
// 1. ROLES
const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  VENDEDOR: 'VENDEDOR'
};

// 2. CÓDIGO ESPECIAL DEL DUEÑO
const CODIGO_DUENO = '1234';

// 3. USUARIO ACTUAL (Objeto con información completa)
usuarioActual = {
  usuario: 'MARIA',
  nombreCompleto: 'María García',
  rol: 'VENDEDOR',
  establecimiento: 'DOS_DE_MAYO',
  nombreMostrar: 'Dos de Mayo'
};
```

---

## 👥 ROLES DISPONIBLES

### 1. ADMINISTRADOR

**Descripción**: Usuario con acceso total al sistema. Puede configurar, modificar y visualizar todo.

**Características**:
- Control total sobre inventario
- Acceso a reportes y estadísticas
- Configuración de precios y productos
- Gestión de ventas sin restricciones
- Acceso a importaciones masivas

### 2. VENDEDOR

**Descripción**: Usuario enfocado en atención al cliente y ventas. Acceso limitado para operaciones diarias.

**Características**:
- Realizar ventas completas
- Gestionar clientes (crear, editar, buscar)
- Crear prescripciones/recetas
- Ver productos en modo solo lectura
- Manejar su propia caja

---

## 🔑 CREDENCIALES DE ACCESO

### DOS_DE_MAYO (Centro Óptico Sicuani)

#### Administrador:
- **Usuario**: `Centro Óptico Sicuani`
- **Contraseña**: `ADMI`
- **Rol**: ADMINISTRADOR

#### Vendedores:
| Usuario | Contraseña | Nombre Completo | Estado |
|---------|------------|-----------------|--------|
| MARIA   | VENTA123   | María García    | Activo |
| JUAN    | VENTA456   | Juan Pérez      | Activo |

### PLAZA_DE_ARMAS (Óptica Sicuani)

#### Administrador:
- **Usuario**: `Óptica Sicuani`
- **Contraseña**: `ADMI`
- **Rol**: ADMINISTRADOR

#### Vendedores:
| Usuario | Contraseña | Nombre Completo | Estado |
|---------|------------|-----------------|--------|
| CARMEN  | VENTA789   | Carmen López    | Activo |

---

## 📊 MATRIZ DE PERMISOS

### CLIENTES

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Crear clientes | ✅ | ✅ |
| Ver clientes | ✅ | ✅ |
| Editar clientes | ✅ | ✅ |
| Eliminar clientes | ✅ | ❌ |

### PRESCRIPCIONES/RECETAS

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Crear prescripciones | ✅ | ✅ |
| Ver historial de RX | ✅ | ✅ |
| Editar RX guardadas | ✅ | ❌ |
| Eliminar RX | ✅ | ❌ |

### VENTAS

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Crear ventas | ✅ | ✅ |
| Ver ventas | ✅ | ✅ (solo del día) |
| Anular ventas | ✅ | ❌ (requiere código) |
| Aplicar descuentos | ✅ | ❌ (requiere código) |
| Cambiar precios | ✅ | ❌ (requiere código) |
| Cambiar método de pago | ✅ | ✅ |

### INVENTARIO

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Ver productos | ✅ | ✅ (solo lectura) |
| Crear productos | ✅ | ❌ |
| Editar productos | ✅ | ❌ |
| Eliminar productos | ✅ | ❌ |
| Ajustar stock | ✅ | ❌ |

### REPORTES Y ESTADÍSTICAS

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Ver todos los reportes | ✅ | ❌ |
| Ver reportes propios | ✅ | ✅ (solo sus ventas del día) |
| Exportar reportes | ✅ | ❌ |
| Ver dashboard | ✅ | ❌ |
| Ver gráficos | ✅ | ❌ |

### CAJA

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Apertura de caja | ✅ | ✅ |
| Cierre con monto sistema | ✅ | ❌ (cierre ciego) |
| Ver histórico de caja | ✅ | ❌ |

### CONSULTORIO

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Ver consultas | ✅ | ✅ |
| Crear consultas | ✅ | ✅ |
| Editar consultas | ✅ | ❌ |

### IMPORTACIONES Y CONFIGURACIÓN

| Acción | ADMINISTRADOR | VENDEDOR |
|--------|---------------|----------|
| Importar desde Excel | ✅ | ❌ |
| Configurar sistema | ✅ | ❌ |
| Configurar precios | ✅ | ❌ |

---

## 🔒 SISTEMA DE CÓDIGOS ESPECIALES

### Código del Dueño: `1234`

Este código permite al vendedor realizar acciones restringidas con autorización temporal.

### Acciones que Requieren Código:

1. **Aplicar Descuentos**: Cualquier descuento > 0 requiere autorización
2. **Anular Ventas**: Solo el dueño puede anular una venta
3. **Cambiar Precios**: Modificar precio manual de productos
4. **Editar Recetas Guardadas**: Modificar prescripciones existentes
5. **Eliminar Clientes**: Borrar un cliente de la base de datos

### Cómo Funciona:

```
Vendedor intenta dar descuento → Sistema detecta falta de permiso
     ↓
Se muestra modal de autorización con campo de código
     ↓
Dueño ingresa código "1234"
     ↓
Si es correcto: Acción se ejecuta
Si es incorrecto: Acción se cancela y se restaura valor anterior
```

---

## 🚀 FLUJOS DE USUARIO

### Flujo de Login - ADMINISTRADOR

```
1. Selecciona Establecimiento: DOS_DE_MAYO
2. Usuario: Centro Óptico Sicuani
3. Contraseña: ADMI
4. Click en INGRESAR
   ↓
5. Sistema valida credenciales
6. Carga perfil de ADMINISTRADOR
7. Muestra ribbon completo (todos los módulos)
8. Badge: "🏪 Dos de Mayo" (fondo morado)
9. Toast: "✅ Bienvenido, Administrador Centro Óptico"
```

### Flujo de Login - VENDEDOR

```
1. Selecciona Establecimiento: DOS_DE_MAYO
2. Usuario: MARIA
3. Contraseña: VENTA123
4. Click en INGRESAR
   ↓
5. Sistema valida credenciales
6. Carga perfil de VENDEDOR
7. Muestra ribbon simplificado (módulos permitidos)
8. Badge: "👤 VENDEDOR: María García - MODO LECTURA" (fondo verde)
9. Modal de Bienvenida con funciones habilitadas y restringidas
10. Click en "Continuar a Apertura de Caja"
    ↓
11. Redirige automáticamente al módulo de CAJA
12. Vendedor realiza apertura de caja para iniciar jornada
```

### Flujo de Apertura de Caja - VENDEDOR

```
1. Modal de Apertura se muestra automáticamente
2. Vendedor ingresa monto inicial en caja (usualmente S/ 0.00)
3. Click en "Iniciar Jornada"
   ↓
4. Sistema guarda apertura con:
   - Vendedor: María García
   - Fecha y hora
   - Monto inicial
5. Toast: "✅ Caja abierta - Puedes comenzar a vender"
6. Vendedor accede a módulo de VENTAS
```

### Flujo de Descuento con Código - VENDEDOR

```
1. Vendedor está en pantalla de VENTAS
2. Agrega productos al carrito
3. Intenta aplicar descuento de S/ 10.00
   ↓
4. Sistema detecta: !tienePermiso('ventas_descuento')
5. Muestra modal: "🔒 FUNCIÓN RESTRINGIDA"
6. Vendedor llama al dueño
7. Dueño ingresa código: 1234
   ↓
8. Sistema verifica código
9. Si correcto: Descuento se aplica
10. Toast: "✅ Código correcto - Acción autorizada"
11. Toast: "💰 Descuento de S/ 10.00 aplicado"
```

### Flujo de Cierre de Caja - VENDEDOR (Ciego)

```
1. Fin del día, vendedor va a CAJA
2. Click en "Cerrar Caja"
3. Sistema NO muestra cuánto debería haber
4. Vendedor cuenta físicamente el dinero
5. Ingresa monto declarado: S/ 523.50
6. Click en "Cerrar Caja"
   ↓
7. Sistema calcula en backend:
   - Ventas del día: S/ 530.00
   - Monto declarado: S/ 523.50
   - Diferencia: -S/ 6.50 (faltante)
8. Genera reporte automático que se envía al dueño
9. Toast: "✅ Caja cerrada. Reporte enviado al administrador"
```

---

## ✅ VALIDACIONES IMPLEMENTADAS

### 1. Validación de Descuentos (Líneas 12876-12922)

```javascript
function actualizarDescuentoItem(idx, nuevoDescuento) {
  const descuento = parseFloat(nuevoDescuento) || 0;

  // 🔐 VALIDACIÓN DE PERMISOS
  if (descuento > 0 && !tienePermiso('ventas_descuento')) {
    toast('🔒 Descuentos requieren autorización del administrador', 'warning');
    solicitarCodigoDueno('aplicar descuento', function(autorizado) {
      if (autorizado) {
        aplicarDescuentoConAutorizacion(idx, descuento);
      } else {
        renderItemsVenta(); // Restaurar valor anterior
      }
    });
    return;
  }

  aplicarDescuentoConAutorizacion(idx, descuento);
}
```

### 2. Función de Verificación de Permisos (Líneas 11865-11868)

```javascript
function tienePermiso(permiso) {
  if (!usuarioActual || !usuarioActual.rol) return false;
  return PERMISOS[usuarioActual.rol]?.[permiso] || false;
}
```

### 3. Solicitud de Código del Dueño (Líneas 11871-11969)

Modal profesional con:
- Input de código tipo password
- Validación en tiempo real
- Feedback visual (toast de éxito o error)
- Callback para manejar resultado

---

## 🎨 INTERFAZ ADAPTATIVA

### Ribbon (Menú Superior) según Rol

#### ADMINISTRADOR:
```
[🏠 INICIO] [💰 VENTAS] [👥 CLIENTES] [📦 PRODUCTOS] [📊 INVENTARIO]
[🔵 LUNAS] [📈 REPORTES] [💵 CAJA] [🩺 CONSULTORIO] [📊 DASHBOARD]
[📥 IMPORTACIONES] [⚙️ CONFIGURACIÓN]
```

#### VENDEDOR:
```
[💰 VENTAS] [👥 CLIENTES] [📦 PRODUCTOS 👁️] [💵 CAJA] [🩺 CONSULTORIO]

// Bloqueados (no aparecen):
❌ Inventario
❌ Lunas (gestión)
❌ Reportes Generales
❌ Dashboard
❌ Importaciones
❌ Configuración
```

### Badge de Usuario

#### ADMINISTRADOR:
```
┌─────────────────────────────────┐
│ 🏪 Dos de Mayo                  │  ← Fondo morado
└─────────────────────────────────┘
```

#### VENDEDOR:
```
┌───────────────────────────────────────────────────────┐
│ 👤 VENDEDOR: María García - MODO LECTURA             │  ← Fondo verde
└───────────────────────────────────────────────────────┘
```

### Mensaje de Bienvenida - VENDEDOR

Modal informativo al iniciar sesión mostrando:

**Funciones Habilitadas** (fondo verde):
- ✅ Realizar ventas y usar wizard de lunas
- ✅ Gestionar clientes (crear, editar, buscar)
- ✅ Crear recetas/prescripciones nuevas
- ✅ Crear consultas clínicas
- ✅ Ver productos (solo lectura)
- ✅ Manejar tu caja (apertura y cierre)

**Funciones Restringidas** (fondo rojo):
- ❌ Editar o eliminar inventario
- ❌ Ver reportes generales y dashboard
- ❌ Dar descuentos (requiere código del dueño)
- ❌ Anular ventas (requiere código del dueño)
- ❌ Editar o borrar recetas guardadas
- ❌ Importaciones masivas desde Excel

---

## 📖 GUÍA DE USO

### Para el DUEÑO/ADMINISTRADOR:

#### Gestionar Vendedores

**Agregar Nuevo Vendedor**:
1. Editar archivo Revision0008.html
2. Buscar línea ~11718 (CREDENCIALES)
3. Agregar en array VENDEDORES:

```javascript
{
  usuario: 'PEDRO',
  password: 'VENTA999',
  rol: ROLES.VENDEDOR,
  nombreCompleto: 'Pedro Martínez',
  activo: true
}
```

**Cambiar Código Especial**:
1. Buscar línea ~11706 (CODIGO_DUENO)
2. Cambiar valor: `const CODIGO_DUENO = '1234';`

**Ver Reportes de Vendedor**:
1. Ir a módulo REPORTES
2. Filtrar por vendedor específico
3. Ver diferencias en caja
4. Exportar a Excel si es necesario

### Para el VENDEDOR:

#### Iniciar Jornada

1. Login con tu usuario (ej: MARIA)
2. Lee el mensaje de bienvenida
3. Click en "Continuar a Apertura de Caja"
4. Ingresa monto inicial (usualmente S/ 0.00)
5. Click en "Iniciar Jornada"

#### Realizar una Venta

1. Ir a módulo VENTAS
2. Buscar cliente o crear nuevo
3. Escanear productos o buscar manualmente
4. Usar wizard de lunas si necesitas armar lentes
5. Si necesitas dar descuento: Llamar al dueño para código
6. Completar venta

#### Cerrar Caja al Final del Día

1. Ir a módulo CAJA
2. Click en "Cerrar Caja"
3. Contar dinero físicamente
4. Ingresar monto total contado
5. Click en "Cerrar Caja"
6. Sistema envía reporte al dueño automáticamente

---

## 🔧 FUNCIONES TÉCNICAS

### Aplicar Restricciones en Interfaz

```javascript
function aplicarRestriccionesInterfaz() {
  if (!usuarioActual) return;

  const ribbon = document.getElementById('ribbon');
  const botones = ribbon.querySelectorAll('button[onclick*="mostrarSeccion"]');

  botones.forEach(boton => {
    const seccion = boton.getAttribute('onclick')?.match(/mostrarSeccion\('(.+?)'\)/)?.[1];

    if (usuarioActual.rol === ROLES.VENDEDOR) {
      const seccionesBloqueadas = [
        'inventario', 'lunas', 'reportes', 'dashboard',
        'graficos', 'importaciones', 'configuracion'
      ];

      if (seccionesBloqueadas.includes(seccion)) {
        boton.style.display = 'none'; // Ocultar botón
      }

      if (seccion === 'productos') {
        boton.innerHTML += ' 👁️'; // Indicador de solo lectura
        boton.title = 'Solo lectura';
      }
    }
  });
}
```

---

## 📊 ESTADÍSTICAS DEL SISTEMA

- **Líneas de Código Agregadas**: ~900 líneas
- **Funciones Creadas**: 8 funciones nuevas
- **Validaciones Implementadas**: 15+ puntos de control
- **Roles Soportados**: 2 (Administrador, Vendedor)
- **Permisos Granulares**: 23 permisos diferentes
- **Código de Seguridad**: 1 código del dueño

---

## 🚨 IMPORTANTE - SEGURIDAD

### Código del Dueño

⚠️ **El código "1234" es temporal**. Se recomienda cambiarlo por:
- Código de 6 dígitos
- Combinación alfanumérica
- PIN personal del dueño

### Contraseñas de Vendedores

🔐 **Las contraseñas actuales son de ejemplo**. Se recomienda:
- Cambiarlas en producción
- Usar contraseñas únicas por vendedor
- No compartir credenciales

### Sesiones

⏰ **Sesiones activas duran 24 horas**. Después de este tiempo, se requiere nuevo login.

---

## ✨ MEJORAS VISUALES ADICIONALES

### Escáner de Productos

- **Color de Fondo**: Gradiente azul claro (#f0f9ff → #e0f2fe)
- **Textos**: Negro con font-weight: 900 (ultra bold)
- **Botón Activar**: Gradiente azul con sombra
- **Border**: 3px solid #3b82f6

### Importación desde Excel

- **Títulos**: Negro con font-weight: 900
- **Números de Paso**: Negro bold
- **Colores**: Consistentes con paleta del sistema

---

## 🎯 PRÓXIMAS MEJORAS SUGERIDAS

1. **Historial de Acciones**: Log de qué vendedor hizo qué
2. **Reportes por Vendedor**: Comisiones y metas
3. **Notificaciones**: Alertas al dueño de acciones críticas
4. **Multi-Factor Authentication**: PIN + huella digital
5. **Roles Personalizados**: Crear roles a medida

---

**¡Sistema de Roles y Permisos Implementado Exitosamente! 🎉**

_Documentación generada el 3 de Enero 2026_
_Versión del Sistema: Revision0008.html_

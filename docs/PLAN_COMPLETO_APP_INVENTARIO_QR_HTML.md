# 📋 PLAN COMPLETO - APP INVENTARIO QR PARA CENTRO ÓPTICO SICUANI
## Enfoque: HTML5 + JavaScript Puro → Convertir a App Android/iOS

---

## 🎯 OBJETIVO DEL PROYECTO

Crear un **sistema de inventario con lector QR** en HTML5/JavaScript puro que:
- Se integre con tu sistema actual de Centro Óptico Sicuani
- Se pueda convertir a app móvil Android (Play Store) e iOS (App Store)
- Funcione offline y sincronice cuando haya internet
- Exporte datos a Excel
- Sea fácil de mantener y actualizar

---

## 📱 TECNOLOGÍA PARA CONVERTIR HTML A APP

### ✅ RECOMENDACIÓN: IONIC CAPACITOR (2025)

**¿Por qué Capacitor y no Cordova?**
- Capacitor es el sucesor moderno de Cordova (2025)
- Mejor rendimiento y arquitectura moderna
- Compatible con plugins de Cordova
- Mantenido activamente por Ionic
- Más fácil de usar y desplegar

**Proceso simplificado:**
```
Tu HTML/JS/CSS → Capacitor → APK (Android) + IPA (iOS)
```

**Comandos básicos (no código, solo referencia):**
- `npx cap add android` → Crea carpeta android
- `npx cap add ios` → Crea carpeta iOS
- `npx cap sync` → Sincroniza tu código HTML con las apps
- Abrir Android Studio → Generar APK
- Abrir Xcode → Generar IPA para App Store

---

## 🗂️ ESTRUCTURA DEL PROYECTO (PLANIFICACIÓN)

### **Árbol de Carpetas Propuesto:**

```
📁 Centro_Optico_Inventario_QR/
│
├── 📁 www/                          # Todo tu código HTML/JS/CSS aquí
│   │
│   ├── 📄 index.html                # Página principal con menú
│   │
│   ├── 📁 modulos/                  # Páginas HTML por módulo
│   │   ├── 📄 ventas.html          # (Ya existente - tu sistema actual)
│   │   ├── 📄 clientes.html        # (Ya existente)
│   │   ├── 📄 prescripciones.html  # (Ya existente - RX)
│   │   ├── 📄 inventario.html      # ⭐ NUEVO - Gestión inventario
│   │   ├── 📄 scanner-qr.html      # ⭐ NUEVO - Escáner QR
│   │   ├── 📄 productos.html       # ⭐ NUEVO - CRUD productos
│   │   ├── 📄 reportes.html        # ⭐ NUEVO - Reportes y Excel
│   │   └── 📄 sincronizacion.html  # ⭐ NUEVO - Sync cloud
│   │
│   ├── 📁 js/                       # JavaScript modular
│   │   ├── 📄 app.js               # Inicialización general
│   │   ├── 📄 auth.js              # Login/Auth (ya tienes)
│   │   ├── 📄 storage.js           # LocalStorage manager
│   │   ├── 📄 qr-scanner.js        # ⭐ NUEVO - Lógica escáner QR
│   │   ├── 📄 inventario.js        # ⭐ NUEVO - Lógica inventario
│   │   ├── 📄 productos.js         # ⭐ NUEVO - CRUD productos
│   │   ├── 📄 excel-export.js      # ⭐ NUEVO - Exportar a Excel
│   │   ├── 📄 sync.js              # ⭐ NUEVO - Sincronización
│   │   └── 📄 utils.js             # Funciones auxiliares
│   │
│   ├── 📁 css/                      # Estilos
│   │   ├── 📄 main.css             # Estilos globales
│   │   ├── 📄 inventario.css       # ⭐ NUEVO - Estilos inventario
│   │   └── 📄 scanner.css          # ⭐ NUEVO - Estilos escáner
│   │
│   ├── 📁 lib/                      # Librerías externas
│   │   ├── 📄 html5-qrcode.min.js  # Librería QR scanner
│   │   ├── 📄 xlsx.full.min.js     # Librería Excel (SheetJS)
│   │   └── 📄 dexie.min.js         # IndexedDB mejorado (opcional)
│   │
│   ├── 📁 assets/                   # Recursos
│   │   ├── 📁 img/
│   │   │   ├── logo.png
│   │   │   └── icons/              # Íconos de productos
│   │   └── 📁 sounds/
│   │       └── beep.mp3            # Sonido al escanear QR
│   │
│   └── 📄 manifest.json             # PWA manifest
│
├── 📁 android/                      # (Generado por Capacitor)
├── 📁 ios/                          # (Generado por Capacitor)
├── 📄 capacitor.config.json         # Configuración Capacitor
└── 📄 package.json                  # Dependencias del proyecto
```

---

## 🧩 MÓDULOS DEL SISTEMA (PLANIFICACIÓN DETALLADA)

### **MÓDULO 1: SISTEMA ACTUAL (Ya tienes esto funcionando)**
✅ Login dual (Dos de Mayo / Plaza de Armas)
✅ LocalStorage separado por establecimiento
✅ Gestión de clientes
✅ Ventas
✅ Prescripciones (RX con 5 tabs)

---

### **MÓDULO 2: INVENTARIO QR (NUEVO - A DESARROLLAR)**

#### **2.1 Página: inventario.html**

**Secciones:**

**A. Dashboard de Inventario**
- Resumen visual del inventario
- Total de productos
- Stock total valorizado
- Productos con stock bajo (alertas)
- Últimos movimientos

**B. Lista de Productos**
- Tabla HTML con todos los productos
- Columnas:
  - Imagen miniatura
  - Código QR (generado)
  - SKU
  - Nombre del producto
  - Marca
  - Categoría
  - Stock actual
  - Ubicación
  - Precio venta
  - Acciones (Editar, Ver QR, Eliminar)

**C. Filtros y Búsqueda**
- Buscar por: nombre, SKU, marca, categoría
- Filtrar por: categoría, stock (bajo/normal/alto)
- Ordenar por: nombre, stock, precio, fecha

**D. Indicadores Visuales**
- 🟢 Stock normal (verde)
- 🟡 Stock bajo (amarillo)
- 🔴 Sin stock (rojo)

---

#### **2.2 Página: scanner-qr.html**

**Funcionalidades:**

**A. Escáner de Cámara**
- Área de vista previa de cámara (video HTML5)
- Detección automática de QR
- Sonido "beep" al escanear
- Vibración del dispositivo (si está disponible)

**B. Resultado del Escaneo**
- Mostrar información del producto escaneado
- Opciones rápidas:
  - Ver detalles completos
  - Actualizar stock
  - Agregar a venta
  - Imprimir etiqueta

**C. Historial de Escaneos**
- Lista de últimos 10 QR escaneados
- Fecha y hora de cada escaneo
- Acción realizada

**D. Modo de Escaneo**
- Modo único (escanea y detiene)
- Modo continuo (escanea múltiples productos seguidos)

---

#### **2.3 Página: productos.html**

**Funcionalidades CRUD:**

**A. Formulario Nuevo Producto**

Campos organizados en tabs (similar a tu RX actual):

**Tab 1: Información Básica**
- SKU (generado automático o manual)
- Nombre del producto
- Marca (select con marcas comunes + "Otra")
- Categoría (select):
  - Armazones Oftálmicos
  - Armazones de Sol
  - Lentes (Micas)
  - Lentes de Contacto
  - Accesorios
  - Herramientas
- Subcategoría (depende de categoría)

**Tab 2: Características del Producto**

Para Armazones:
- Material (Acetato/Metal/Titanio/Flexible/Combinado)
- Color
- Género (Hombre/Mujer/Unisex/Niño/Niña)
- Forma (Redondo/Cuadrado/Aviador/Cat Eye/Wayfarer/Deportivo)
- Tamaño/Calibre:
  - Ancho de lente (mm)
  - Puente (mm)
  - Varilla (mm)
  - Ejemplo: 52-18-140

Para Lentes/Micas:
- Tipo (Monofocal/Bifocal/Progresivo/Ocupacional)
- Material (CR-39/Policarbonato/Hi-Index 1.67/Trivex)
- Tratamiento:
  - [ ] Antirreflejante
  - [ ] Fotocromático (Transitions)
  - [ ] Blue Light Filter
  - [ ] Polarizado
  - [ ] UV 400
- Rango de graduación (Esfera, Cilindro)

**Tab 3: Precios y Stock**
- Precio de compra
- Precio de venta
- Precio mayoreo (opcional)
- Margen de ganancia (calculado automático)
- Stock inicial
- Stock mínimo (alerta)
- Stock máximo
- Unidad (Piezas/Pares/Cajas)

**Tab 4: Proveedor y Ubicación**
- Proveedor (select + nuevo)
- Código de proveedor
- Ubicación física:
  - Establecimiento (Dos de Mayo / Plaza de Armas)
  - Zona (Mostrador/Bodega/Exhibidor)
  - Estante/Casillero (Ej: A3, B12)
- Notas de ubicación

**Tab 5: Multimedia y QR**
- Subir imagen del producto (desde cámara o galería)
- Generar código QR automáticamente
- Imprimir etiqueta QR
- Código de barras (si tiene)

**B. Botones de Acción**
- 💾 Guardar Producto
- 📷 Tomar Foto
- 🔍 Generar QR
- 🖨️ Imprimir Etiqueta
- ❌ Cancelar

---

#### **2.4 Página: reportes.html**

**Tipos de Reportes:**

**A. Reportes de Inventario**
1. Inventario General
   - Todos los productos con stock actual
   - Exportar a Excel

2. Productos con Stock Bajo
   - Filtrar productos <= stock mínimo
   - Generar orden de compra

3. Inventario por Categoría
   - Agrupar por categoría
   - Gráfico de pastel

4. Inventario por Ubicación
   - Agrupar por establecimiento/zona
   - Facilita inventario físico

5. Inventario Valorizado
   - Valor total del inventario
   - Por categoría y por establecimiento

**B. Reportes de Movimientos**
1. Movimientos de Stock
   - Entradas y salidas por fecha
   - Filtrar por producto, categoría, usuario

2. Productos sin Movimiento
   - Productos que no han tenido movimiento en X días
   - Stock muerto

3. Historial de un Producto
   - Ver todos los movimientos de un producto específico

**C. Exportación**
- Exportar a Excel (.xlsx)
- Exportar a CSV
- Exportar a PDF (imprimir)
- Enviar por email (futuro)
- Compartir por WhatsApp (futuro)

---

#### **2.5 Página: sincronizacion.html**

**Funcionalidades:**

**A. Estado de Sincronización**
- 🟢 Conectado / 🔴 Desconectado
- Última sincronización: [Fecha y hora]
- Cambios pendientes: [Número]

**B. Sincronización Manual**
- Botón "Sincronizar Ahora"
- Progreso visual (barra de progreso)
- Log de actividad

**C. Configuración**
- Sincronización automática: ON/OFF
- Intervalo de sincronización: cada X minutos
- Sincronizar solo con WiFi
- Sincronizar imágenes: Sí/No

**D. Resolución de Conflictos**
- Mostrar conflictos (si un producto se editó en dos lugares)
- Opciones: Mantener local / Mantener servidor / Fusionar

---

## 💾 ALMACENAMIENTO DE DATOS (PLANIFICACIÓN)

### **Estrategia Híbrida:**

#### **Nivel 1: LocalStorage (Datos básicos)**
Usado para:
- Configuración de usuario
- Establecimiento activo (Dos de Mayo / Plaza de Armas)
- Preferencias de la app

#### **Nivel 2: IndexedDB (Datos complejos - OFFLINE)**
Usado para:
- Productos completos (con imágenes)
- Inventario
- Movimientos de stock
- Historial de escaneos
- Permite almacenar MBs de datos
- Funciona 100% offline

#### **Nivel 3: Base de Datos en la Nube (SINCRONIZACIÓN)**

Opciones recomendadas:

**Opción A: Firebase Realtime Database** (Recomendado)
- Gratuito hasta 1GB
- Sincronización en tiempo real
- Funciona con HTML/JavaScript puro
- Fácil integración

**Opción B: Supabase** (Alternativa open-source)
- Gratuito hasta 500MB
- PostgreSQL en la nube
- API REST automática
- Autenticación incluida

**Opción C: API REST propia**
- Servidor propio (PHP/Node.js)
- Mayor control
- Requiere hosting

---

## 📊 ESTRUCTURA DE DATOS (ESQUEMA JSON)

### **Colección: productos**

```json
{
  "id": "prod_001",
  "sku": "ARM-RB-WAY-ACE-NEG-52-001",
  "codigo_qr": "QR_ARM-RB-WAY-ACE-NEG-52-001",
  "codigo_barras": "7501234567890",

  "informacion_basica": {
    "nombre": "Ray-Ban Wayfarer Classic",
    "marca": "Ray-Ban",
    "categoria": "armazones_sol",
    "subcategoria": "lifestyle"
  },

  "caracteristicas": {
    "material": "acetato",
    "color": "negro",
    "genero": "unisex",
    "forma": "wayfarer",
    "tamaño": {
      "lente": 52,
      "puente": 18,
      "varilla": 140,
      "display": "52-18-140"
    }
  },

  "precios": {
    "compra": 850.00,
    "venta": 1500.00,
    "mayoreo": 1200.00,
    "moneda": "PEN",
    "margen_porcentaje": 43.33
  },

  "stock": {
    "actual": 5,
    "minimo": 2,
    "maximo": 20,
    "unidad": "piezas",
    "estado_alerta": "normal"
  },

  "proveedor": {
    "id": "prov_001",
    "nombre": "Distribuidora Óptica SAC",
    "codigo_proveedor": "RB-2140-901"
  },

  "ubicacion": {
    "establecimiento": "dos_de_mayo",
    "zona": "exhibidor",
    "estante": "A3",
    "notas": "Primera fila, lado izquierdo"
  },

  "multimedia": {
    "imagen_principal": "productos/prod_001_principal.jpg",
    "imagenes_adicionales": [
      "productos/prod_001_lateral.jpg",
      "productos/prod_001_interior.jpg"
    ],
    "qr_generado": "qr_codes/prod_001.png"
  },

  "metadata": {
    "fecha_creacion": "2025-12-22T10:30:00Z",
    "fecha_actualizacion": "2025-12-22T15:45:00Z",
    "creado_por": "admin@optica.com",
    "activo": true,
    "sincronizado": true,
    "ultima_sincronizacion": "2025-12-22T15:45:00Z"
  }
}
```

### **Colección: movimientos**

```json
{
  "id": "mov_001",
  "producto_id": "prod_001",
  "producto_sku": "ARM-RB-WAY-ACE-NEG-52-001",
  "producto_nombre": "Ray-Ban Wayfarer Classic",

  "tipo_movimiento": "entrada",
  "cantidad": 10,
  "stock_anterior": 5,
  "stock_nuevo": 15,

  "motivo": "compra_proveedor",
  "referencia": "Factura PROV-2025-001",
  "notas": "Pedido semanal del proveedor",

  "usuario": {
    "id": "user_001",
    "nombre": "Admin Óptica",
    "email": "admin@optica.com"
  },

  "establecimiento": "dos_de_mayo",

  "fecha": "2025-12-22T10:30:00Z",
  "metodo_registro": "manual"
}
```

**Tipos de movimientos:**
- `entrada` - Compra a proveedor
- `salida` - Venta a cliente
- `ajuste_positivo` - Corrección de inventario (encontrado)
- `ajuste_negativo` - Corrección de inventario (faltante)
- `traspaso_salida` - Envío a otra sucursal
- `traspaso_entrada` - Recepción de otra sucursal
- `devolucion_cliente` - Cliente devuelve producto
- `devolucion_proveedor` - Devolución a proveedor
- `merma` - Producto dañado/perdido

### **Colección: categorias**

```json
{
  "id": "cat_001",
  "nombre": "Armazones de Sol",
  "slug": "armazones_sol",
  "descripcion": "Armazones para lentes de sol",
  "icono": "🕶️",
  "color": "#FF6B6B",
  "orden": 1,
  "subcategorias": [
    {
      "id": "subcat_001",
      "nombre": "Lifestyle",
      "slug": "lifestyle"
    },
    {
      "id": "subcat_002",
      "nombre": "Deportivos",
      "slug": "deportivos"
    },
    {
      "id": "subcat_003",
      "nombre": "Premium",
      "slug": "premium"
    }
  ],
  "activo": true
}
```

### **Colección: establecimientos**

```json
{
  "id": "est_001",
  "nombre": "Centro Óptico Sicuani - Dos de Mayo",
  "slug": "dos_de_mayo",
  "direccion": "Av. Dos de Mayo 123, Sicuani",
  "telefono": "+51 987 654 321",
  "email": "dosdemayo@opticasicuani.com",
  "zonas": [
    {
      "id": "zona_001",
      "nombre": "Mostrador Principal",
      "slug": "mostrador",
      "estantes": ["A1", "A2", "A3", "B1", "B2"]
    },
    {
      "id": "zona_002",
      "nombre": "Exhibidor Central",
      "slug": "exhibidor",
      "estantes": ["E1", "E2", "E3", "E4"]
    },
    {
      "id": "zona_003",
      "nombre": "Bodega",
      "slug": "bodega",
      "estantes": ["BD1", "BD2", "BD3"]
    }
  ],
  "activo": true
}
```

---

## 🔄 FLUJOS DE TRABAJO (USER FLOWS)

### **FLUJO 1: Registrar Producto Nuevo**

```
1. Usuario ingresa al módulo "Productos"
2. Click en botón "➕ Nuevo Producto"
3. Se abre formulario con 5 tabs
4. Usuario completa Tab 1 (Info Básica):
   - SKU se genera automáticamente basado en: categoría-marca-modelo
   - O puede escribir SKU manual
5. Usuario completa Tab 2 (Características)
6. Usuario completa Tab 3 (Precios y Stock)
   - Margen se calcula automáticamente
7. Usuario completa Tab 4 (Proveedor y Ubicación)
8. Usuario en Tab 5:
   - Click "📷 Tomar Foto" → Abre cámara del dispositivo
   - Captura imagen del producto
   - Sistema genera QR automáticamente con los datos
9. Click "💾 Guardar"
10. Sistema:
    - Valida campos obligatorios
    - Guarda en IndexedDB (local)
    - Marca para sincronización
    - Muestra mensaje de éxito
    - Pregunta: "¿Deseas imprimir la etiqueta QR ahora?"
11. Si usuario acepta:
    - Sistema abre vista de impresión
    - Muestra etiqueta con QR + info básica
    - Usuario imprime
12. Usuario regresa a lista de productos
13. Producto aparece en la tabla
```

---

### **FLUJO 2: Escanear QR y Ver Información**

```
1. Usuario abre módulo "Escáner QR"
2. Sistema solicita permiso de cámara (primera vez)
3. Usuario permite acceso a cámara
4. Se activa vista previa de cámara
5. Usuario apunta cámara al código QR del producto
6. Sistema detecta el QR automáticamente
7. Suena "beep" y vibra el dispositivo
8. Sistema busca el producto por SKU/ID del QR
9. Se muestra tarjeta con información del producto:

   ┌─────────────────────────────────────┐
   │  [Imagen del producto]              │
   │                                     │
   │  Ray-Ban Wayfarer Classic           │
   │  SKU: ARM-RB-WAY-ACE-NEG-52-001    │
   │  Stock: 5 unidades                  │
   │  Ubicación: Estante A3              │
   │  Precio: S/ 1,500.00                │
   │                                     │
   │  [Ver Detalles] [Actualizar Stock]  │
   │  [Agregar a Venta] [Imprimir]       │
   └─────────────────────────────────────┘

10. Usuario elige una acción
11. Sistema ejecuta la acción seleccionada
```

---

### **FLUJO 3: Actualizar Stock (Entrada de Productos)**

```
1. Usuario escanea QR del producto (o busca manualmente)
2. Sistema muestra info del producto
3. Usuario click en "Actualizar Stock"
4. Se abre modal:

   ┌─────────────────────────────────────┐
   │  Actualizar Stock                   │
   │  Ray-Ban Wayfarer Classic           │
   │  Stock actual: 5 unidades           │
   │                                     │
   │  Tipo de movimiento:                │
   │  ○ Entrada (compra)                 │
   │  ○ Salida (venta)                   │
   │  ○ Ajuste                           │
   │  ○ Traspaso                         │
   │                                     │
   │  Cantidad: [____]                   │
   │  Motivo: [Compra a proveedor ▼]     │
   │  Referencia: [Factura #___]         │
   │  Notas: [________________]          │
   │                                     │
   │  Nuevo stock: 5 + X = [__]          │
   │                                     │
   │  [Cancelar]  [💾 Guardar Movimiento]│
   └─────────────────────────────────────┘

5. Usuario selecciona tipo: "Entrada"
6. Usuario ingresa cantidad: 10
7. Sistema calcula: Nuevo stock = 5 + 10 = 15
8. Usuario selecciona motivo: "Compra a proveedor"
9. Usuario ingresa referencia: "Factura PROV-2025-001"
10. Click "Guardar Movimiento"
11. Sistema:
    - Actualiza stock del producto (15)
    - Crea registro en colección "movimientos"
    - Guarda en IndexedDB
    - Marca para sincronización
    - Muestra notificación: "✅ Stock actualizado: 5 → 15"
12. Usuario regresa a escáner (o a inventario)
```

---

### **FLUJO 4: Exportar Inventario a Excel**

```
1. Usuario abre módulo "Reportes"
2. Click en "Inventario General"
3. Sistema muestra opciones:

   ┌─────────────────────────────────────┐
   │  Exportar Inventario                │
   │                                     │
   │  Filtros:                           │
   │  Establecimiento:                   │
   │    [x] Dos de Mayo                  │
   │    [ ] Plaza de Armas               │
   │    [ ] Ambos                        │
   │                                     │
   │  Categoría:                         │
   │    [ ] Todas                        │
   │    [ ] Armazones Sol                │
   │    [ ] Armazones Oftálmicos         │
   │    [ ] Lentes                       │
   │                                     │
   │  Incluir:                           │
   │    [x] Productos con stock          │
   │    [ ] Productos sin stock          │
   │    [x] Imágenes (más pesado)        │
   │                                     │
   │  Formato:                           │
   │    ○ Excel (.xlsx)                  │
   │    ○ CSV                            │
   │    ○ PDF                            │
   │                                     │
   │  [📊 Generar Reporte]               │
   └─────────────────────────────────────┘

4. Usuario configura filtros
5. Usuario selecciona formato: Excel
6. Click "Generar Reporte"
7. Sistema:
   - Consulta IndexedDB con filtros aplicados
   - Genera archivo Excel con librería xlsx.js
   - Estructura del Excel:

     Hoja 1: "Inventario"
     | SKU | Nombre | Marca | Categoría | Stock | Precio | Ubicación | Total Valorizado |

     Hoja 2: "Resumen"
     | Total Productos: 150 |
     | Valor Total: S/ 125,000.00 |
     | Por Categoría: ... |

8. Sistema descarga archivo: "Inventario_DosDeMayo_2025-12-22.xlsx"
9. En móvil: muestra diálogo "Compartir"
   - Opciones: Drive, WhatsApp, Email, etc.
```

---

### **FLUJO 5: Sincronización en la Nube**

```
ESCENARIO A: Sincronización Automática

1. Usuario trabaja normalmente en la app
2. Cada 5 minutos (configurable), sistema verifica:
   - ¿Hay conexión a internet? → Sí
   - ¿Hay cambios pendientes? → Sí (3 productos editados)
3. Sistema en segundo plano:
   - Sube cambios a Firebase/Supabase
   - Descarga cambios de otros usuarios
   - Actualiza IndexedDB local
4. Muestra notificación discreta: "✅ Sincronizado (3 cambios)"

ESCENARIO B: Sin Internet (Modo Offline)

1. Usuario pierde conexión a internet
2. Sigue trabajando normalmente
3. Todos los cambios se guardan en IndexedDB
4. Icono muestra estado: 🔴 Desconectado
5. Badge muestra: "5 cambios pendientes"
6. Cuando recupera internet:
   - Sistema detecta conexión
   - Sincroniza automáticamente
   - Icono cambia a: 🟢 Conectado
   - Notificación: "✅ 5 cambios sincronizados"

ESCENARIO C: Conflicto de Datos

1. Usuario A edita producto X en establecimiento Dos de Mayo
2. Usuario B edita el MISMO producto X en establecimiento Plaza de Armas
3. Ambos están offline
4. Usuario A recupera internet → sincroniza primero
5. Usuario B recupera internet → sistema detecta conflicto
6. Muestra pantalla de resolución:

   ┌─────────────────────────────────────┐
   │  ⚠️ Conflicto Detectado             │
   │                                     │
   │  Producto: Ray-Ban Wayfarer         │
   │  Campo en conflicto: Stock          │
   │                                     │
   │  Versión Local (Tu cambio):         │
   │  Stock: 12 unidades                 │
   │  Modificado: 22/12/2025 14:30       │
   │                                     │
   │  Versión Servidor (Otro usuario):   │
   │  Stock: 15 unidades                 │
   │  Modificado: 22/12/2025 14:35       │
   │  Por: admin@optica.com              │
   │                                     │
   │  ¿Qué versión deseas mantener?      │
   │  [ Mantener mi versión (12) ]       │
   │  [ Usar versión servidor (15) ]     │
   │  [ Ver detalles ]                   │
   └─────────────────────────────────────┘

7. Usuario B decide
8. Sistema aplica la decisión
9. Sincronización completa
```

---

## 🎨 DISEÑO DE INTERFAZ (UI/UX)

### **Paleta de Colores (siguiendo tu sistema actual)**

```
Primario:    #9D4EDD (Morado - como tu sistema actual)
Secundario:  #5A189A (Morado oscuro)
Acento:      #C77DFF (Morado claro)
Éxito:       #06D6A0 (Verde)
Advertencia: #FFD166 (Amarillo)
Error:       #EF476F (Rojo)
Neutro:      #F8F9FA (Fondo claro)
Texto:       #2B2D42 (Gris oscuro)
```

### **Componentes Reutilizables**

**1. Navbar Superior**
```
┌────────────────────────────────────────────┐
│ ☰  Centro Óptico Sicuani    🔔 👤 ⚙️     │
└────────────────────────────────────────────┘
```

**2. Menú Lateral (Drawer)**
```
┌─────────────────────┐
│ 👤 Admin Óptica     │
│ Dos de Mayo         │
├─────────────────────┤
│ 🏠 Inicio           │
│ 💰 Ventas           │
│ 👥 Clientes         │
│ 📋 Inventario ⭐    │
│ 📦 Productos ⭐     │
│ 🔍 Escáner QR ⭐    │
│ 📊 Reportes ⭐      │
│ ⚙️ Configuración    │
│ 🔄 Sincronización ⭐│
├─────────────────────┤
│ 🚪 Cerrar Sesión    │
└─────────────────────┘
```

**3. Tarjeta de Producto (Card)**
```
┌─────────────────────────────────┐
│  ┌─────────┐  Ray-Ban Wayfarer  │
│  │ IMAGEN  │  SKU: ARM-RB-001   │
│  │ [QR]    │  Stock: 5 🟢        │
│  └─────────┘  S/ 1,500.00       │
│  📍 Estante A3                   │
│  [Ver] [Editar] [QR] [🗑️]      │
└─────────────────────────────────┘
```

**4. Modal Estándar**
```
┌─────────────────────────────────┐
│  [Título del Modal]         [X] │
├─────────────────────────────────┤
│                                 │
│  [Contenido dinámico]           │
│                                 │
├─────────────────────────────────┤
│          [Cancelar] [Aceptar]   │
└─────────────────────────────────┘
```

---

## 📦 LIBRERÍAS JAVASCRIPT A UTILIZAR

### **1. Escáner QR**
- **html5-qrcode** (Recomendado)
  - Tamaño: ~50KB
  - Sin dependencias
  - Funciona en todos los navegadores modernos
  - CDN: https://unpkg.com/html5-qrcode

### **2. Generación de QR**
- **qrcode.js**
  - Tamaño: ~20KB
  - Genera QR en Canvas o SVG
  - CDN: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js

### **3. Exportación a Excel**
- **SheetJS (xlsx)**
  - Librería más popular para Excel en JavaScript
  - Soporta .xlsx y .xls
  - CDN: https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js

### **4. Base de Datos Local (IndexedDB)**
- **Dexie.js** (Opcional pero recomendado)
  - Simplifica IndexedDB
  - Queries más fáciles
  - Tamaño: ~50KB
  - CDN: https://unpkg.com/dexie@latest/dist/dexie.js

### **5. Notificaciones/Toasts**
- **Toastify JS** o crear tu propio sistema
  - CDN: https://cdn.jsdelivr.net/npm/toastify-js

### **6. Íconos**
- **Font Awesome** (ya parece que usas íconos en tu sistema)
  - O Bootstrap Icons
  - O Google Material Icons

---

## 🔐 SEGURIDAD Y PERMISOS

### **Permisos de la App (Android/iOS)**

**Necesarios:**
- ✅ Cámara - Para escanear QR
- ✅ Almacenamiento - Para guardar imágenes de productos
- ✅ Internet - Para sincronización

**Opcionales:**
- Vibración - Feedback al escanear
- Notificaciones - Alertas de stock bajo

### **Política de Privacidad (Obligatorio para tiendas)**

Debes crear un documento que explique:
- Qué datos recopilas (productos, inventario, usuarios)
- Dónde se almacenan (local + nube)
- Cómo se protegen (HTTPS, encriptación)
- Derechos del usuario (eliminar cuenta, exportar datos)
- No vendes datos a terceros

Puedes generarla con herramientas como:
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

---

## 📲 PROCESO DE PUBLICACIÓN (RESUMEN)

### **PLAY STORE (Android)**

**Paso 1: Preparación**
- Crear APK con Capacitor + Android Studio
- Firmar APK con keystore (certificado digital)
- Preparar assets:
  - Ícono 512x512px
  - Feature graphic 1024x500px
  - Capturas de pantalla (mínimo 2)

**Paso 2: Google Play Console**
- Crear cuenta ($25 USD pago único)
- Crear nueva aplicación
- Completar ficha de la tienda:
  - Título: "Centro Óptico Inventario QR"
  - Descripción corta y larga
  - Categoría: "Negocios" o "Productividad"
- Subir assets
- Configurar precios (Gratis)
- Configurar países de distribución

**Paso 3: Contenido de la App**
- Cuestionario de contenido (clasificación)
- Público objetivo (Mayores de 3 años / PEGI 3)
- Política de privacidad (URL)

**Paso 4: Revisión**
- Subir APK a "Producción" o "Prueba interna"
- Enviar a revisión
- Tiempo: 1-7 días
- Google revisa y aprueba

---

### **APP STORE (iOS)**

**Paso 1: Apple Developer Program**
- Inscribirse ($100 USD/año)
- Crear App ID
- Configurar certificados

**Paso 2: Preparación**
- Crear IPA con Capacitor + Xcode
- Preparar assets:
  - Ícono 1024x1024px
  - Capturas para diferentes tamaños de iPhone/iPad
- Probar con TestFlight (beta testing)

**Paso 3: App Store Connect**
- Crear nueva app
- Completar metadata
- Categoría: "Business" o "Productivity"
- Subir capturas

**Paso 4: Revisión**
- Enviar a revisión
- Apple revisa (24-48 horas)
- Más estricto que Google
- Puede solicitar cambios

---

## 🗓️ ROADMAP DE DESARROLLO (PASO A PASO)

### **FASE 1: PREPARACIÓN (Semana 1)**

**Día 1-2: Configuración del Proyecto**
- [ ] Crear estructura de carpetas (como se planificó arriba)
- [ ] Descargar librerías necesarias (html5-qrcode, xlsx, etc.)
- [ ] Crear index.html principal con menú de navegación
- [ ] Configurar LocalStorage para establecimiento activo
- [ ] Integrar con tu sistema actual (login)

**Día 3-4: Base de Datos Local**
- [ ] Configurar IndexedDB con Dexie.js
- [ ] Crear esquema de datos (productos, movimientos, categorías)
- [ ] Crear funciones CRUD básicas (guardar, leer, actualizar, eliminar)
- [ ] Crear datos de ejemplo para testing

**Día 5-7: Diseño UI Base**
- [ ] Crear navbar superior
- [ ] Crear menú lateral (drawer)
- [ ] Crear componentes reutilizables (cards, modals, botones)
- [ ] Aplicar estilos CSS (paleta de colores morada)
- [ ] Hacer responsive (móvil y desktop)

---

### **FASE 2: MÓDULO PRODUCTOS (Semana 2)**

**Día 1-2: Formulario de Productos**
- [ ] Crear productos.html con formulario de 5 tabs
- [ ] Tab 1: Información básica (nombre, marca, categoría)
- [ ] Tab 2: Características (material, color, tamaño)
- [ ] Tab 3: Precios y stock (con cálculo automático de margen)
- [ ] Tab 4: Proveedor y ubicación
- [ ] Tab 5: Multimedia (captura de imagen)

**Día 3-4: CRUD Completo**
- [ ] Función guardar producto (validaciones)
- [ ] Función editar producto (cargar datos en formulario)
- [ ] Función eliminar producto (confirmación)
- [ ] Auto-generación de SKU
- [ ] Auto-generación de código QR

**Día 5-7: Lista de Productos**
- [ ] Crear tabla de productos con todos los datos
- [ ] Implementar búsqueda en tiempo real
- [ ] Implementar filtros (categoría, stock)
- [ ] Implementar ordenamiento (por nombre, stock, precio)
- [ ] Paginación (mostrar 20 productos por página)
- [ ] Vista de tarjetas (alternativa a tabla)

---

### **FASE 3: MÓDULO ESCÁNER QR (Semana 3)**

**Día 1-2: Escáner Básico**
- [ ] Crear scanner-qr.html
- [ ] Integrar librería html5-qrcode
- [ ] Solicitar permiso de cámara
- [ ] Activar vista previa de cámara
- [ ] Detectar y decodificar QR

**Día 3-4: Funcionalidades del Escáner**
- [ ] Buscar producto por código QR escaneado
- [ ] Mostrar tarjeta con información del producto
- [ ] Agregar sonido "beep" al escanear
- [ ] Agregar vibración (si disponible)
- [ ] Modo continuo (escanear múltiples productos)

**Día 5-7: Acciones Post-Escaneo**
- [ ] Botón "Ver Detalles" → Abrir modal con info completa
- [ ] Botón "Actualizar Stock" → Modal de movimiento
- [ ] Botón "Agregar a Venta" → Integrar con módulo ventas
- [ ] Historial de escaneos (últimos 10)
- [ ] Guardar historial en IndexedDB

---

### **FASE 4: MÓDULO INVENTARIO (Semana 4)**

**Día 1-2: Dashboard**
- [ ] Crear inventario.html
- [ ] Widgets de resumen:
  - Total de productos
  - Valor del inventario
  - Productos con stock bajo
- [ ] Gráfico simple (barras o pastel) con categorías

**Día 3-5: Gestión de Stock**
- [ ] Modal "Actualizar Stock"
- [ ] Tipos de movimiento (entrada, salida, ajuste, traspaso)
- [ ] Cálculo automático de nuevo stock
- [ ] Validaciones (no permitir stock negativo)
- [ ] Guardar movimiento en colección "movimientos"
- [ ] Actualizar stock del producto

**Día 6-7: Alertas y Notificaciones**
- [ ] Detectar productos con stock <= stock mínimo
- [ ] Mostrar badge con número de alertas
- [ ] Lista de productos con alerta
- [ ] Notificación al iniciar app (si hay alertas)

---

### **FASE 5: MÓDULO REPORTES Y EXCEL (Semana 5)**

**Día 1-2: Reportes Básicos**
- [ ] Crear reportes.html
- [ ] Reporte: Inventario General (todos los productos)
- [ ] Reporte: Productos con Stock Bajo
- [ ] Reporte: Inventario por Categoría
- [ ] Reporte: Inventario por Ubicación

**Día 3-4: Exportación a Excel**
- [ ] Integrar librería SheetJS (xlsx.js)
- [ ] Función: Exportar inventario a Excel
- [ ] Crear múltiples hojas (Inventario, Resumen)
- [ ] Aplicar formato (encabezados en negrita, colores)
- [ ] Descargar archivo en web
- [ ] Compartir archivo en móvil (Android/iOS)

**Día 5-7: Reportes de Movimientos**
- [ ] Reporte: Movimientos de stock por fecha
- [ ] Filtros: por producto, por tipo, por usuario
- [ ] Reporte: Productos sin movimiento (últimos X días)
- [ ] Reporte: Historial de un producto específico
- [ ] Exportar movimientos a Excel

---

### **FASE 6: SINCRONIZACIÓN EN LA NUBE (Semana 6)**

**Día 1-2: Configurar Backend**
- [ ] Crear proyecto en Firebase (o Supabase)
- [ ] Configurar Realtime Database
- [ ] Configurar reglas de seguridad
- [ ] Configurar autenticación (email/password)
- [ ] Integrar SDK de Firebase en tu HTML

**Día 3-4: Sincronización Básica**
- [ ] Función: Subir productos a la nube
- [ ] Función: Descargar productos de la nube
- [ ] Función: Detectar cambios (comparar timestamps)
- [ ] Botón "Sincronizar Ahora" en UI
- [ ] Indicador de estado (conectado/desconectado)

**Día 5-7: Sincronización Automática y Conflictos**
- [ ] Sincronización automática cada X minutos
- [ ] Solo sincronizar con WiFi (opcional)
- [ ] Detectar conflictos (mismo producto editado en 2 lugares)
- [ ] UI para resolver conflictos
- [ ] Log de sincronización (historial)

---

### **FASE 7: INTEGRACIÓN CON SISTEMA ACTUAL (Semana 7)**

**Día 1-3: Módulo Ventas**
- [ ] Desde escáner QR, agregar producto a venta
- [ ] Botón "Buscar en Inventario" en módulo ventas
- [ ] Al vender producto, descontar automáticamente del stock
- [ ] Registrar movimiento tipo "salida" automáticamente

**Día 4-5: Módulo Clientes**
- [ ] Asociar ventas con productos específicos
- [ ] Historial de compras del cliente (qué productos compró)
- [ ] Sugerencias de productos (si cliente compró armazón, sugerir lunas)

**Día 6-7: Testing Integral**
- [ ] Probar todos los flujos completos
- [ ] Verificar que ventas descuenten stock
- [ ] Verificar sincronización entre establecimientos
- [ ] Probar modo offline
- [ ] Corregir bugs encontrados

---

### **FASE 8: CONVERSIÓN A APP MÓVIL (Semana 8)**

**Día 1-2: Configurar Capacitor**
- [ ] Instalar Node.js y npm
- [ ] Instalar Capacitor CLI
- [ ] Crear proyecto Capacitor
- [ ] Copiar tus archivos HTML/JS/CSS a carpeta www/
- [ ] Configurar capacitor.config.json

**Día 3-4: Plataforma Android**
- [ ] Ejecutar: npx cap add android
- [ ] Abrir proyecto en Android Studio
- [ ] Configurar permisos (cámara, almacenamiento)
- [ ] Configurar ícono y splash screen
- [ ] Generar APK de prueba
- [ ] Probar en dispositivo Android

**Día 5-6: Plataforma iOS (si tienes Mac)**
- [ ] Ejecutar: npx cap add ios
- [ ] Abrir proyecto en Xcode
- [ ] Configurar permisos (cámara, photos)
- [ ] Configurar ícono y splash screen
- [ ] Generar IPA de prueba
- [ ] Probar en dispositivo iOS

**Día 7: Optimización Móvil**
- [ ] Optimizar tamaño de imágenes
- [ ] Reducir tamaño de librerías (minify)
- [ ] Mejorar tiempos de carga
- [ ] Probar gestos táctiles (swipe, pinch zoom)
- [ ] Probar rotación de pantalla

---

### **FASE 9: PREPARACIÓN PARA PUBLICACIÓN (Semana 9)**

**Día 1-2: Assets y Recursos**
- [ ] Diseñar ícono de la app (512x512px y 1024x1024px)
- [ ] Crear feature graphic para Play Store
- [ ] Tomar capturas de pantalla en diferentes dispositivos
- [ ] Preparar descripciones (corta y larga)
- [ ] Crear video promocional (opcional)

**Día 3-4: Documentación Legal**
- [ ] Crear Política de Privacidad
- [ ] Crear Términos y Condiciones
- [ ] Publicar política en sitio web (puede ser GitHub Pages)
- [ ] Preparar datos de contacto del desarrollador

**Día 5-6: Generar APK/IPA de Producción**
- [ ] Crear keystore para firmar APK (Android)
- [ ] Generar APK firmado (release)
- [ ] Crear certificado de distribución (iOS)
- [ ] Generar IPA firmado
- [ ] Probar versiones de producción

**Día 7: Preparar Fichas de Tienda**
- [ ] Completar ficha de Google Play Console
- [ ] Completar ficha de App Store Connect
- [ ] Revisar toda la información
- [ ] Obtener segunda opinión (probar con alguien más)

---

### **FASE 10: PUBLICACIÓN Y LANZAMIENTO (Semana 10)**

**Día 1-2: Play Store**
- [ ] Crear cuenta de Google Play Console ($25 USD)
- [ ] Crear nueva aplicación
- [ ] Subir APK
- [ ] Completar todos los campos obligatorios
- [ ] Configurar precios y distribución
- [ ] Enviar a revisión
- [ ] Esperar aprobación (1-7 días)

**Día 3-4: App Store (iOS)**
- [ ] Inscribirse en Apple Developer Program ($100 USD/año)
- [ ] Crear App ID
- [ ] Subir IPA con Xcode
- [ ] Completar metadata en App Store Connect
- [ ] Enviar a revisión
- [ ] Esperar aprobación (24-48 horas)

**Día 5-7: Post-Lanzamiento**
- [ ] Monitorear reviews y comentarios
- [ ] Responder preguntas de usuarios
- [ ] Recopilar feedback
- [ ] Planificar actualizaciones futuras
- [ ] Celebrar el lanzamiento 🎉

---

## 📝 CHECKLIST FINAL ANTES DE PUBLICAR

### **Funcionalidad**
- [ ] Todas las funciones core funcionan correctamente
- [ ] No hay crashes en flujos principales
- [ ] La app funciona offline
- [ ] La sincronización funciona correctamente
- [ ] El escáner QR es rápido y preciso
- [ ] La exportación a Excel funciona
- [ ] El sistema de login funciona

### **Diseño**
- [ ] La UI es consistente en todas las pantallas
- [ ] Los botones tienen tamaño adecuado para tocar
- [ ] Los textos son legibles en dispositivos pequeños
- [ ] La app funciona en orientación vertical y horizontal
- [ ] Los colores tienen buen contraste

### **Rendimiento**
- [ ] La app carga en menos de 3 segundos
- [ ] Las transiciones son fluidas (60 FPS)
- [ ] No hay lag al escanear QR
- [ ] El tamaño del APK/IPA es razonable (<50 MB)

### **Seguridad**
- [ ] Los datos sensibles están encriptados
- [ ] Hay validación de formularios
- [ ] No hay inyección de código posible
- [ ] La política de privacidad está publicada

### **Documentación**
- [ ] Hay instrucciones de uso dentro de la app
- [ ] La política de privacidad está accesible
- [ ] Los permisos solicitados están explicados
- [ ] Hay información de contacto/soporte

---

## 🚀 FUNCIONALIDADES FUTURAS (Post-Lanzamiento)

### **Versión 1.1**
- [ ] Modo multi-sucursal avanzado (traspasos entre tiendas)
- [ ] Dashboard con gráficos interactivos
- [ ] Notificaciones push (stock bajo, nuevos productos)
- [ ] Búsqueda por voz
- [ ] Modo oscuro (dark mode)

### **Versión 1.2**
- [ ] Integración con punto de venta (POS)
- [ ] Lector de códigos de barras (además de QR)
- [ ] Impresión de etiquetas desde la app
- [ ] Gestión de proveedores completa
- [ ] Órdenes de compra automáticas

### **Versión 1.3**
- [ ] Inteligencia artificial para predicción de stock
- [ ] Reconocimiento de imagen (foto del producto → info)
- [ ] Modo catálogo para clientes (e-commerce básico)
- [ ] Integración con sistemas de contabilidad
- [ ] Backup automático en Google Drive/iCloud

---

## 💰 RESUMEN DE COSTOS

### **Costos de Desarrollo (Una vez)**
| Item | Costo |
|------|-------|
| Desarrollo (Si lo haces tú) | Gratis (tu tiempo) |
| Desarrollo (Freelancer) | $500 - $2,000 USD |
| Desarrollo (Agencia) | $3,000 - $10,000 USD |

### **Costos de Publicación (Inicial)**
| Item | Costo |
|------|-------|
| Google Play Developer | $25 USD (pago único) |
| Apple Developer Program | $100 USD/año |
| Dominio web (para política) | $10 USD/año |
| Hosting (Firebase) | Gratis - $25/mes |

### **Costos Recurrentes (Mensual)**
| Item | Costo |
|------|-------|
| Firebase (hasta 1GB) | Gratis |
| Firebase (más de 1GB) | $0.026/GB + transferencia |
| Apple Developer | $100 USD/año = $8.33/mes |
| Total mínimo mensual | ~$8-10 USD |

### **Total Estimado para Lanzar:**
- **Mínimo:** $135 USD (haciendo el desarrollo tú mismo)
- **Recomendado:** $500 - $800 USD (con ayuda de freelancer)

---

## 🎓 RECURSOS DE APRENDIZAJE

### **HTML5 QR Scanner**
- Documentación: https://github.com/mebjas/html5-qrcode
- Tutorial: https://scanbot.io/techblog/html5-barcode-scanner-tutorial/

### **SheetJS (Excel)**
- Documentación: https://docs.sheetjs.com/
- Ejemplos: https://github.com/SheetJS/sheetjs

### **IndexedDB / Dexie.js**
- Tutorial Dexie: https://dexie.org/docs/Tutorial/
- MDN IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

### **Ionic Capacitor**
- Documentación oficial: https://capacitorjs.com/docs
- Tutorial: https://capacitorjs.com/docs/getting-started

### **Firebase**
- Comenzar: https://firebase.google.com/docs/web/setup
- Realtime Database: https://firebase.google.com/docs/database/web/start

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

### **Opción A: Empezar a Desarrollar**
1. Crear estructura de carpetas
2. Descargar librerías necesarias
3. Crear index.html con menú de navegación
4. Integrar con tu sistema actual de login
5. Empezar con FASE 1 del roadmap

### **Opción B: Prototipar Primero**
1. Crear mockups/wireframes en papel
2. Validar diseño con usuarios finales (empleados de la óptica)
3. Ajustar plan según feedback
4. Luego empezar desarrollo

### **Opción C: Contratar Desarrollador**
1. Compartir este plan con el desarrollador
2. Obtener cotización detallada
3. Definir cronograma específico
4. Supervisar desarrollo por fases

---

## ✅ CONCLUSIÓN

Este plan cubre TODO lo necesario para crear tu app de inventario QR en HTML5/JavaScript y publicarla en Play Store y App Store:

**✅ Tecnología definida:** HTML5 + Capacitor
**✅ Estructura planificada:** Carpetas, módulos, archivos
**✅ Base de datos diseñada:** Esquema JSON completo
**✅ Flujos documentados:** User flows paso a paso
**✅ Roadmap detallado:** 10 semanas, día por día
**✅ Integración:** Se conecta con tu sistema actual
**✅ Exportación:** Excel totalmente funcional
**✅ Publicación:** Guía para ambas tiendas

**El proyecto es 100% viable y realista.**

---

**¿Qué necesitas que profundice o ajuste en este plan?**

---

**Última actualización:** 22 de Diciembre, 2025
**Versión del plan:** 1.0

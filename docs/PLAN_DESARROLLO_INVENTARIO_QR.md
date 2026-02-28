# 📋 PLAN DE DESARROLLO PASO A PASO
## SISTEMA DE INVENTARIO QR - COMPATIBLE CON CENTRO ÓPTICO SICUANI

**Fecha:** 22 de Diciembre, 2025
**Objetivo:** Código base modular < 15,000 líneas, compatible con tu sistema actual

---

## 🎯 ESTRATEGIA DE DESARROLLO

### **Decisiones Clave:**

1. **TODO EN UN SOLO ARCHIVO HTML** (como tu sistema actual)
   - Más fácil de distribuir
   - Compatible con tu estructura
   - Funciona sin servidor

2. **IndexedDB para datos** (mejor que LocalStorage)
   - Más capacidad
   - Mejor rendimiento
   - Compatible con Service Workers

3. **Integración con tu sistema**
   - Mismo estilo visual (morado/azul)
   - Sistema de ribbons igual
   - Compartir LocalStorage si es necesario

4. **Modular pero compacto**
   - Funciones organizadas en módulos
   - Código limpio y comentado
   - ~10,000-12,000 líneas total

---

## 📐 ESTRUCTURA DEL CÓDIGO (Un solo archivo HTML)

```
┌─────────────────────────────────────────────────────┐
│  inventario-qr-magnus.html (ARCHIVO ÚNICO)         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. <!DOCTYPE html>                   (1 línea)    │
│  2. <head>                                          │
│     - Meta tags, title          (10 líneas)        │
│     - CDN Librerías             (15 líneas)        │
│                                                     │
│  3. <style>                     (2,500 líneas)     │
│     ├── Variables CSS           (100)              │
│     ├── Reset & Base            (200)              │
│     ├── Glassmorphism           (150)              │
│     ├── Ribbon & Navbar         (300)              │
│     ├── Cards & Layouts         (400)              │
│     ├── Buttons & Forms         (500)              │
│     ├── Modals                  (300)              │
│     ├── Tables                  (200)              │
│     └── Animations              (350)              │
│                                                     │
│  4. <body>                      (1,500 líneas)     │
│     ├── Ribbon Superior         (100)              │
│     ├── Header                  (50)               │
│     ├── Main Container          (100)              │
│     │                                              │
│     ├── Secciones:              (1,250)            │
│     │   ├── Dashboard           (200)              │
│     │   ├── Scanner QR          (300)              │
│     │   ├── Generador QR        (250)              │
│     │   ├── Productos (CRUD)    (400)              │
│     │   └── Reportes/Export     (100)              │
│     │                                              │
│     └── Modales                 (500)              │
│         ├── Agregar Producto    (150)              │
│         ├── Editar Producto     (150)              │
│         ├── Ver QR              (100)              │
│         └── Actualizar Stock    (100)              │
│                                                     │
│  5. <script>                    (7,500 líneas)     │
│     ├── Config & Constantes     (100)              │
│     ├── IndexedDB Manager       (1,200)            │
│     ├── QR Scanner              (800)              │
│     ├── QR Generator            (600)              │
│     ├── Barcode Scanner         (700)              │
│     ├── Barcode Generator       (400)              │
│     ├── CRUD Productos          (1,000)            │
│     ├── Gestión Stock           (500)              │
│     ├── Export Excel/PDF        (800)              │
│     ├── UI Components           (600)              │
│     ├── Event Handlers          (400)              │
│     └── Init & Utils            (400)              │
│                                                     │
│  6. </body>                                         │
│  7. </html>                                         │
└─────────────────────────────────────────────────────┘

TOTAL ESTIMADO: ~11,500 líneas de código
```

---

## 🗂️ LIBRERÍAS CDN (Sin descargar archivos)

```html
<!-- QR Scanner -->
<script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>

<!-- Barcode Scanner -->
<script src="https://cdn.jsdelivr.net/npm/@ericblade/quagga2/dist/quagga.min.js"></script>

<!-- QR Generator -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<!-- Barcode Generator -->
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

<!-- Excel Export -->
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

<!-- PDF Export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>

<!-- Alerts/Notifications -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- Icons (Opcional si usas font icons) -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

**Peso total CDN:** ~1.2 MB (se cachea en navegador)

---

## 📝 PASO A PASO DE DESARROLLO

### **FASE 1: ESTRUCTURA HTML BASE (Día 1) - 500 líneas**

```
□ Crear archivo: inventario-qr-magnus.html
□ DOCTYPE y meta tags
□ Cargar CDNs de librerías
□ Estructura <style> vacío
□ Estructura <body> base:
  - Ribbon superior (botones navegación)
  - Header con título
  - Main con secciones ocultas
  - Footer
□ Estructura <script> vacío
□ Testing: Archivo se abre en navegador
```

**Resultado:** HTML vacío pero con estructura completa

---

### **FASE 2: CSS - SISTEMA DE DISEÑO (Día 2-3) - 2,500 líneas**

```
□ Variables CSS (colores morado/azul como tu sistema)
□ Reset y estilos base
□ Glassmorphism effects (cards translúcidas)
□ Ribbon superior (igual a tu sistema)
□ Navbar/Header
□ Grid/Flexbox layouts
□ Cards (glass-card, card-hover)
□ Botones (primary, secondary, danger)
□ Inputs y forms
□ Modales (estructura base)
□ Tables
□ Animaciones (fadeIn, slideIn, zoomIn)
□ Responsive (mobile, tablet, desktop)
```

**Resultado:** Sistema visual completo, sin funcionalidad

---

### **FASE 3: JAVASCRIPT CORE (Día 4-5) - 1,500 líneas**

```
□ Constantes globales
□ Configuración
□ Inicialización de la app
□ Sistema de navegación (cambiar secciones)
□ Event listeners básicos
□ Funciones utilidad (formatear, validar)
□ Sistema de notificaciones (toast/alerts)
□ Loading states
```

**Código:**
```javascript
// Config
const CONFIG = {
    dbName: 'InventarioOpticoMagnus',
    version: 1,
    skuPrefix: 'ARM'
};

// Estado global
const STATE = {
    currentSection: 'dashboard',
    productos: [],
    filtros: {}
};

// Navegación
function cambiarSeccion(nombre) {
    // Ocultar todas
    document.querySelectorAll('main > section').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });

    // Mostrar la seleccionada
    document.getElementById(nombre).classList.add('active');
    document.getElementById(nombre).classList.remove('hidden');

    STATE.currentSection = nombre;
}

// Notificaciones
function notify(mensaje, tipo = 'success') {
    Swal.fire({
        icon: tipo,
        title: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}
```

**Resultado:** App funciona, navega entre secciones

---

### **FASE 4: INDEXEDDB (Día 6-7) - 1,200 líneas**

```
□ Crear clase DatabaseManager
□ Inicializar DB
□ Crear Object Stores (productos, movimientos, escaneos)
□ CRUD Productos:
  - addProducto()
  - getProducto(id)
  - getAllProductos()
  - updateProducto(id, data)
  - deleteProducto(id)
  - searchProductos(query)
□ CRUD Movimientos
□ CRUD Historial Escaneos
□ Funciones auxiliares (generar SKU, calcular stock)
□ Testing con datos de ejemplo
```

**Código:**
```javascript
class DB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONFIG.dbName, CONFIG.version);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Store: productos
                if (!db.objectStoreNames.contains('productos')) {
                    const store = db.createObjectStore('productos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('sku', 'sku', { unique: true });
                    store.createIndex('nombre', 'nombre', { unique: false });
                    store.createIndex('codigo_qr', 'codigo_qr', { unique: true });
                }

                // Store: movimientos
                if (!db.objectStoreNames.contains('movimientos')) {
                    const store = db.createObjectStore('movimientos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('producto_id', 'producto_id', { unique: false });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onerror = (e) => reject(e.target.error);
        });
    }

    async addProducto(data) {
        const tx = this.db.transaction(['productos'], 'readwrite');
        const store = tx.objectStore('productos');

        // Generar SKU si no existe
        if (!data.sku) {
            data.sku = await this.generateSKU();
        }

        data.fecha_creacion = Date.now();

        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async generateSKU() {
        const productos = await this.getAllProductos();
        const num = productos.length + 1;
        return `${CONFIG.skuPrefix}-${String(num).padStart(4, '0')}`;
    }

    // ... más métodos CRUD
}

// Instancia global
const db = new DB();
```

**Resultado:** Base de datos funcional

---

### **FASE 5: INTERFAZ PRODUCTOS (Día 8-10) - 1,500 líneas**

```
□ Dashboard:
  - Cards de estadísticas
  - Productos recientes
  - Alertas stock bajo

□ Lista de Productos:
  - Mostrar todos en cards
  - Búsqueda en tiempo real
  - Filtros (categoría, marca)
  - Ordenar (nombre, precio, stock)
  - Acciones (ver, editar, eliminar, QR)

□ Modal Agregar Producto:
  - Formulario completo
  - Validaciones
  - Upload imagen (base64)
  - Generar SKU automático
  - Guardar en IndexedDB

□ Modal Editar Producto:
  - Pre-llenar datos
  - Actualizar

□ Modal Detalle:
  - Vista completa
  - Historial movimientos
```

**Resultado:** CRUD completo de productos funcional

---

### **FASE 6: SCANNER QR (Día 11-12) - 800 líneas**

```
□ Integrar html5-qrcode
□ Activar cámara
□ Escanear QR en tiempo real
□ Decodificar contenido
□ Buscar producto por QR
□ Mostrar resultado
□ Guardar en historial
□ Acciones inteligentes:
  - Si es URL → Abrir
  - Si es teléfono → Llamar
  - Si es producto → Mostrar detalles
```

**Código:**
```javascript
let html5QrCode = null;

async function iniciarScanner() {
    const videoElement = document.getElementById('qr-video');

    html5QrCode = new Html5Qrcode("qr-video");

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };

    await html5QrCode.start(
        { facingMode: "environment" }, // Cámara trasera
        config,
        onScanSuccess,
        onScanError
    );
}

async function onScanSuccess(decodedText, decodedResult) {
    // Vibrar
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Sonido
    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW578eRNAgYXrTp66hVFApGn+DyvmwhBSuBzvLZiTYI').play();

    // Buscar producto
    const producto = await db.getProductoByCodigo(decodedText);

    if (producto) {
        mostrarDetalleProducto(producto);
    } else {
        notify('Producto no encontrado', 'warning');
    }

    // Guardar en historial
    await db.addEscaneo({
        tipo: 'qr',
        contenido: decodedText,
        fecha: Date.now()
    });
}
```

**Resultado:** Scanner QR funcional

---

### **FASE 7: GENERADOR QR (Día 13) - 600 líneas**

```
□ Integrar qrcode.js
□ Formulario generación:
  - Tipo (URL, Texto, WiFi, vCard, Producto)
  - Personalización (tamaño, color, logo)
□ Generar QR
□ Preview
□ Descargar PNG
□ Guardar plantilla
```

**Resultado:** Generador QR funcional

---

### **FASE 8: SCANNER BARCODE (Día 14) - 700 líneas**

```
□ Integrar QuaggaJS
□ Configurar formatos (EAN-13, UPC, Code128)
□ Activar cámara
□ Escanear en tiempo real
□ Buscar producto
```

**Resultado:** Scanner códigos de barras funcional

---

### **FASE 9: GENERADOR BARCODE (Día 15) - 400 líneas**

```
□ Integrar JsBarcode
□ Formulario generación
□ Generar código
□ Descargar
```

**Resultado:** Generador códigos de barras funcional

---

### **FASE 10: EXPORT EXCEL/PDF (Día 16-17) - 800 líneas**

```
□ Integrar SheetJS
□ Función exportarExcel():
  - Obtener productos
  - Crear hoja Excel
  - Formatear (colores, bordes)
  - Descargar

□ Integrar jsPDF
□ Función exportarPDF():
  - Crear PDF
  - Tabla con jsPDF-AutoTable
  - Descargar
```

**Código:**
```javascript
async function exportarExcel() {
    const productos = await db.getAllProductos();

    // Preparar datos
    const data = productos.map(p => ({
        'SKU': p.sku,
        'Nombre': p.nombre,
        'Categoría': p.categoria,
        'Marca': p.marca,
        'Stock': p.stock_actual,
        'Precio': p.precio_venta
    }));

    // Crear libro
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Inventario");

    // Descargar
    XLSX.writeFile(wb, `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);

    notify('Excel generado exitosamente');
}
```

**Resultado:** Export completo funcional

---

### **FASE 11: INTEGRACIÓN CON TU SISTEMA (Día 18-19) - 500 líneas**

```
□ Copiar tu esquema de colores (morado/azul)
□ Adaptar tu sistema de ribbons
□ Agregar botón "Inventario QR" a tu ribbon
□ Compartir LocalStorage si es necesario
□ Sincronizar clientes entre sistemas
□ Probar navegación entre tu sistema y el inventario
```

**Resultado:** Sistemas integrados

---

### **FASE 12: TESTING Y OPTIMIZACIÓN (Día 20-21)**

```
□ Probar todas las funciones
□ Corregir bugs
□ Optimizar rendimiento
□ Minificar código (opcional)
□ Testing en móviles
□ Testing en diferentes navegadores
```

**Resultado:** Sistema completo y probado

---

## 📊 RESUMEN DE LÍNEAS DE CÓDIGO

| Sección | Líneas Estimadas |
|---------|-----------------|
| HTML estructura | 500 |
| CSS completo | 2,500 |
| JavaScript core | 1,500 |
| IndexedDB | 1,200 |
| UI Productos | 1,500 |
| Scanner QR | 800 |
| Generator QR | 600 |
| Scanner Barcode | 700 |
| Generator Barcode | 400 |
| Export Excel/PDF | 800 |
| Integración | 500 |
| **TOTAL** | **~11,000 líneas** |

**✅ Cumple objetivo: < 15,000 líneas**

---

## 🎯 PRÓXIMO PASO

**¿Quieres que empiece a crear el código?**

Puedo crear:
1. **El archivo completo** de una vez (~11,000 líneas)
2. **Por fases** - Primero HTML+CSS, luego JavaScript, etc.
3. **Solo la estructura base** para que tú continues

**¿Qué prefieres, Aldo?**

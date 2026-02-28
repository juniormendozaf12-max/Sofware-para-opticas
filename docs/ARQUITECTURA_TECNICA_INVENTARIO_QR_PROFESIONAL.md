# 🏗️ ARQUITECTURA TÉCNICA COMPLETA
## SISTEMA DE INVENTARIO ÓPTICO CON QR/CÓDIGOS DE BARRAS
### Versión Profesional - Nivel Enterprise

**Fecha:** 22 de Diciembre, 2025
**Versión:** 2.0 - Investigación Completa
**Objetivo:** Crear un sistema competitivo con las mejores aplicaciones del mercado

---

## 📊 RESUMEN EJECUTIVO

Este documento define la arquitectura técnica completa para un **sistema profesional de inventario óptico** basado en tecnologías web modernas (HTML5/CSS3/JavaScript), con capacidades offline-first, escaneo/generación de códigos QR y de barras, y exportación de datos empresariales.

### **Características Principales:**
- ✅ **100% Offline-First** - Funciona sin internet mediante PWA
- ✅ **Backend/Frontend Desacoplado** - Arquitectura modular profesional
- ✅ **Base de Datos Local Robusta** - IndexedDB con capacidad enterprise
- ✅ **Escaneo Profesional** - Múltiples formatos QR y códigos de barras
- ✅ **UI/UX Moderna** - Siguiendo tendencias 2025
- ✅ **Exportación Completa** - Excel, PDF, CSV con formato profesional

---

## 🎯 DECISIONES ARQUITECTÓNICAS BASADAS EN INVESTIGACIÓN

### **1. ARQUITECTURA GENERAL: PWA OFFLINE-FIRST**

**Decisión:** Aplicación Web Progresiva (PWA) con estrategia Offline-First

**Justificación (Investigación 2025):**
- Las PWAs son el estándar moderno para eficiencia, alcance y control total
- Un solo código funciona en web, móvil y tablet (ahorro 40-60% en costos)
- Service Workers permiten funcionamiento completo sin conexión
- IndexedDB + Workbox automatizan caché inteligente
- Instalable como app sin necesidad de tiendas (Play Store/App Store)

**Fuentes:**
- [PWA Offline 2025](https://keepcoding.io/blog/pwa-offline/)
- [Arquitectura PWA](https://medium.com/react-adventure/arquitectura-de-una-pwa-26e4c4a58da2)
- [PWA Tutorial 2025](https://markaicode.com/progressive-web-app-tutorial-2025-service-worker-offline/)

**Arquitectura de 3 Capas:**

```
┌─────────────────────────────────────────────────────────┐
│               CAPA 1: PRESENTACIÓN (UI)                 │
│          HTML5 + CSS3 + JavaScript Vanilla              │
│                                                         │
│  • Sin frameworks pesados (React, Angular, Vue)        │
│  • JavaScript nativo para máximo rendimiento           │
│  • CSS modular con variables custom properties         │
│  • Componentes web reutilizables                       │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│          CAPA 2: LÓGICA DE NEGOCIO (Backend)           │
│              Módulos JavaScript (ES6+)                  │
│                                                         │
│  • Managers especializados por dominio                 │
│  • Patrón Repository para acceso a datos              │
│  • Patrón Service para lógica de negocio              │
│  • Event-driven architecture para desacoplamiento     │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│        CAPA 3: PERSISTENCIA (Base de Datos)            │
│      IndexedDB + Service Worker + Cache Storage        │
│                                                         │
│  • IndexedDB para datos estructurados complejos        │
│  • Cache Storage para archivos estáticos              │
│  • LocalStorage solo para configuración simple         │
│  • Service Worker para sincronización background       │
└─────────────────────────────────────────────────────────┘
```

---

### **2. BASE DE DATOS: INDEXEDDB (Decisión Final)**

**Decisión:** IndexedDB como almacenamiento principal

**Comparativa Investigada:**

| Característica | IndexedDB ✅ | LocalStorage ❌ | WebSQL ❌ |
|----------------|-------------|-----------------|-----------|
| **Estado 2025** | Recomendado | Limitado | Obsoleto/Deprecado |
| **Capacidad** | ~250MB - 2GB+ | 5-10 MB | Obsoleto |
| **Asíncrono** | Sí (no bloquea UI) | No (bloquea) | Sí |
| **Tipos de datos** | Objetos, Arrays, Blobs | Solo strings | SQL |
| **Indexación** | Sí (queries rápidas) | No | Sí |
| **Service Worker** | Compatible | No compatible | N/A |
| **Workers** | Sí | No | N/A |
| **Soporte navegadores** | Todos modernos | Todos | Deprecado |

**Conclusión Investigación:**
- **IndexedDB es el CLARO GANADOR para 2025**
- LocalStorage solo para pequeños datos de configuración (<5KB)
- WebSQL DEBE EVITARSE (eliminado de iOS Safari, deprecado W3C desde 2010)

**Fuentes:**
- [Master Browser Storage 2025](https://medium.com/@osamajavaid/master-browser-storage-in-2025-the-ultimate-guide-for-front-end-developers-7b2735b4cc13)
- [IndexedDB vs LocalStorage vs WebSQL](https://www.linkedin.com/pulse/why-indexeddb-better-than-localstorage-web-sql-modern-bhavsar-7q8tf)
- [RxDB Storage Comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)

**Librería Recomendada:** **Dexie.js**
- Simplifica API compleja de IndexedDB
- Sintaxis moderna con Promises/Async-Await
- Queries tipo SQL pero para IndexedDB
- Versionado de esquema automático
- Tamaño: ~50KB minificado

**Ejemplo de Diseño de Esquema:**

```javascript
// db.js - Configuración IndexedDB con Dexie.js
const db = new Dexie('InventarioOpticoMagnus');

db.version(1).stores({
    // Productos
    productos: '++id, sku, codigo_qr, codigo_barras, nombre, marca, categoria, stock_actual, precio_venta, establecimiento, activo',

    // Movimientos de inventario
    movimientos: '++id, producto_id, tipo, cantidad, fecha, usuario, establecimiento',

    // Historial de escaneos
    escaneos: '++id, tipo_codigo, contenido, fecha, producto_id, accion_realizada',

    // Proveedores
    proveedores: '++id, nombre, ruc, email, telefono, activo',

    // Clientes (integración con sistema existente)
    clientes: '++id, dni, nombres, telefono, email, establecimiento',

    // Categorías
    categorias: '++id, nombre, slug, tipo, activo',

    // Configuración
    configuracion: 'clave, valor',

    // Plantillas QR/Códigos
    plantillas_codigos: '++id, nombre, tipo, configuracion, es_favorita'
});

// Índices compuestos para búsquedas complejas
db.version(2).stores({
    productos: '++id, sku, [marca+categoria], [establecimiento+activo], codigo_qr, codigo_barras'
});
```

---

### **3. LIBRERÍAS PARA QR/CÓDIGOS DE BARRAS**

#### **Para ESCANEO (Scanner):**

**Decisión Final:** Combinación de 2 librerías especializadas

**A) Para Códigos QR: html5-qrcode**

**Características:**
- ✅ Líder del mercado en 2025 (cross-platform)
- ✅ UI lista para usar (plug & play)
- ✅ Soporta cámara en tiempo real + archivos de imagen
- ✅ Detección automática sin botón
- ✅ Funciona en 99% de navegadores desktop/móvil
- ✅ Tamaño: ~45KB minificado
- ✅ Documentación extensa + tutoriales

**Fuente:** [html5-qrcode GitHub](https://github.com/mebjas/html5-qrcode)

**B) Para Códigos de Barras: QuaggaJS**

**Características:**
- ✅ Especializado en códigos de barras 1D
- ✅ Soporta: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, Code 93, Codabar, I2of5
- ✅ Detección en tiempo real desde cámara
- ✅ Algoritmos avanzados de reconocimiento
- ✅ Funciona con códigos parcialmente ocultos/dañados
- ✅ Open source (MIT License)

**Fuente:** [QuaggaJS](https://serratus.github.io/quaggaJS/)

**Alternativas Consideradas:**

| Librería | Ventajas | Desventajas | Decisión |
|----------|----------|-------------|----------|
| **html5-qrcode** | UI completa, fácil | Solo QR | ✅ **USAR para QR** |
| **QuaggaJS** | Mejor para barcodes 1D | No soporta QR | ✅ **USAR para Barcode** |
| **qr-scanner (nimiq)** | Muy ligero (16KB) | UI básica | ⚠️ Alternativa |
| **jsQR** | Puro JS, simple | No tiene UI | ⚠️ Alternativa |
| **ZXing-js** | Multi-formato | En mantenimiento | ❌ Evitar |

#### **Para GENERACIÓN (Generator):**

**Decisión Final:** 2 librerías especializadas

**A) Para Códigos QR: qrcode.js o qrcodejs**

**Características:**
- ✅ Genera QR en Canvas o SVG
- ✅ Personalización de colores
- ✅ Corrección de errores configurable
- ✅ Inserción de logo (centro del QR)
- ✅ Tamaño: ~20KB
- ✅ Sin dependencias

**CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

**B) Para Códigos de Barras: JsBarcode**

**Características:**
- ✅ Soporta: EAN-13, EAN-8, UPC, Code 128, Code 39, ITF, MSI, Pharmacode
- ✅ Genera en Canvas, SVG o IMG
- ✅ Personalización completa (ancho, alto, colores, márgenes)
- ✅ Mostrar/ocultar texto bajo el código
- ✅ Validación automática de datos
- ✅ Tamaño: ~25KB

**CDN:**
```html
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
```

**Fuentes:**
- [10 Best QR Generators JS 2025](https://www.jqueryscript.net/blog/best-custom-qr-code-generator.html)
- [Popular JavaScript Barcode Scanners](https://scanbot.io/blog/popular-open-source-javascript-barcode-scanners/)

---

### **4. EXPORTACIÓN DE DATOS**

**Decisión:** 3 librerías especializadas

**A) Excel: SheetJS (xlsx.js)**

**Características:**
- ✅ Líder indiscutible en JavaScript para Excel
- ✅ Lee y escribe: .xlsx, .xls, .csv, .ods
- ✅ Hojas múltiples
- ✅ Formato de celdas (colores, negrita, bordes)
- ✅ Fórmulas
- ✅ Imágenes en celdas
- ✅ Tamaño: ~650KB full / ~150KB core

**CDN:**
```html
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
```

**B) PDF: jsPDF + jsPDF-AutoTable**

**Características:**
- ✅ Generación de PDF desde JavaScript
- ✅ AutoTable para tablas profesionales
- ✅ Imágenes, logos, headers, footers
- ✅ Múltiples páginas
- ✅ Fuentes personalizadas
- ✅ Tamaño: ~200KB (jsPDF) + ~50KB (AutoTable)

**CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
```

**C) CSV: Nativo JavaScript**

```javascript
// No requiere librería, usar función nativa
function exportarCSV(data, filename) {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}
```

---

### **5. UI/UX MODERNA - TENDENCIAS 2025**

**Decisiones de Diseño Basadas en Investigación:**

#### **A) Paleta de Colores y Tema**

**Decisión:** Dark Mode como principal + Light Mode opcional

**Justificación (Tendencias 2025):**
- Modo oscuro reduce fatiga visual (estudios 2025)
- Ahorra batería en pantallas OLED (hasta 60%)
- Preferencia de usuarios profesionales
- Mejora enfoque en datos (contraste)

**Fuentes:**
- [Tendencias UI/UX 2025](https://iembs.com/read-think/anticipando-el-futuro-del-diseno-ui-ux/)
- [Novedades diseño 2025](https://mobivery.com/novedades-y-tendencias-en-diseno-ux-ui-en-2025/)

**Paleta Dark Mode:**
```css
:root[data-theme="dark"] {
    /* Backgrounds - Gradientes sutiles */
    --bg-primary: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;

    /* Acentos neón (tendencia 2025) */
    --accent-cyan: #00f5ff;
    --accent-purple: #b300ff;
    --accent-green: #00ff88;
    --accent-orange: #ff8800;

    /* Texto alta legibilidad */
    --text-primary: #e4e4e7;
    --text-secondary: #a1a1aa;
    --text-disabled: #52525b;

    /* Glassmorphism (tendencia 2025) */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-blur: blur(10px);
}
```

#### **B) Efectos Visuales Modernos**

**1. Glassmorphism (Cristal Esmerilado)**
- Tendencia #1 en 2025 para apps profesionales
- Fondos translúcidos con blur
- Bordes sutiles
- Sombras suaves

```css
.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**2. Microinteracciones**
- Tendencia #2 en 2025
- Animaciones sutiles en hover/click
- Feedback visual inmediato
- Transiciones suaves (300ms)

```css
.btn {
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 245, 255, 0.3);
}
```

**3. Botones Redondeados**
- Estándar 2025 para apps modernas
- Reducen sensación de rigidez
- Apariencia amigable y moderna

```css
.btn {
    border-radius: 12px; /* Mediano */
}
.btn-pill {
    border-radius: 9999px; /* Completo */
}
```

#### **C) Accesibilidad (OBLIGATORIO en 2025)**

**Requisitos:**
- ✅ Contraste mínimo WCAG AAA (7:1 para texto)
- ✅ Navegación por teclado completa
- ✅ ARIA labels en componentes
- ✅ Textos ajustables (hasta 200%)
- ✅ Modo alto contraste
- ✅ Soporte screen readers

**Fuente:** [Mejores prácticas diseño web 2025](https://baluidigital.es/las-mejores-practicas-de-diseno-web-en-2025-enfoque-en-ux-ui/)

#### **D) Minimalismo Funcional**

**Principios:**
- Eliminar elementos innecesarios
- Espacios en blanco estratégicos
- Jerarquía visual clara
- Iconos en lugar de texto (cuando sea claro)
- Navegación simplificada

**Fuente:** [Claves diseño UX 2025](https://uraldes.com/claves-del-diseno-ux-2025-mejor-experiencia/)

---

### **6. ESTRUCTURA DE ARCHIVOS PROFESIONAL**

**Decisión:** Arquitectura modular tipo "Feature-Based"

**Justificación:**
- Escalabilidad (agregar módulos sin afectar existentes)
- Mantenibilidad (cada feature es independiente)
- Colaboración (múltiples desarrolladores trabajando en paralelo)
- Testing (pruebas por módulo)

**Estructura Completa:**

```
inventario-optico-magnus/
│
├── 📄 index.html                          ← Landing/Dashboard
├── 📄 manifest.json                       ← PWA Config
├── 📄 service-worker.js                   ← Offline Logic
├── 📄 sw-config.js                        ← SW Configuration
│
├── 📁 src/                                ← Código fuente
│   │
│   ├── 📁 core/                           ← Core del sistema
│   │   ├── app.js                        ← Bootstrap aplicación
│   │   ├── config.js                     ← Configuración global
│   │   ├── router.js                     ← SPA Router
│   │   ├── state.js                      ← State Management
│   │   └── events.js                     ← Event Bus
│   │
│   ├── 📁 features/                       ← Módulos por característica
│   │   │
│   │   ├── 📁 scanner/                    ← FEATURE: Scanner
│   │   │   ├── scanner.html
│   │   │   ├── scanner.css
│   │   │   ├── scanner.js
│   │   │   ├── services/
│   │   │   │   ├── qr-scanner.service.js
│   │   │   │   └── barcode-scanner.service.js
│   │   │   └── components/
│   │   │       ├── camera-view.js
│   │   │       └── scan-result.js
│   │   │
│   │   ├── 📁 generator/                  ← FEATURE: Generator
│   │   │   ├── generator.html
│   │   │   ├── generator.css
│   │   │   ├── generator.js
│   │   │   └── services/
│   │   │       ├── qr-generator.service.js
│   │   │       └── barcode-generator.service.js
│   │   │
│   │   ├── 📁 inventory/                  ← FEATURE: Inventario
│   │   │   ├── list.html
│   │   │   ├── detail.html
│   │   │   ├── form.html
│   │   │   ├── inventory.css
│   │   │   ├── inventory.js
│   │   │   └── services/
│   │   │       ├── product.service.js
│   │   │       ├── stock.service.js
│   │   │       └── movement.service.js
│   │   │
│   │   ├── 📁 reports/                    ← FEATURE: Reportes
│   │   │   ├── reports.html
│   │   │   ├── reports.css
│   │   │   ├── reports.js
│   │   │   └── services/
│   │   │       ├── export-excel.service.js
│   │   │       ├── export-pdf.service.js
│   │   │       └── statistics.service.js
│   │   │
│   │   └── 📁 config/                     ← FEATURE: Configuración
│   │       ├── config.html
│   │       ├── config.css
│   │       └── config.js
│   │
│   ├── 📁 shared/                         ← Código compartido
│   │   │
│   │   ├── 📁 components/                 ← Componentes UI reutilizables
│   │   │   ├── button.js
│   │   │   ├── modal.js
│   │   │   ├── card.js
│   │   │   ├── table.js
│   │   │   ├── form-field.js
│   │   │   └── notification.js
│   │   │
│   │   ├── 📁 layouts/                    ← Layouts reutilizables
│   │   │   ├── main-layout.js
│   │   │   ├── navbar.js
│   │   │   └── sidebar.js
│   │   │
│   │   ├── 📁 utils/                      ← Utilidades
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   │
│   │   └── 📁 services/                   ← Servicios compartidos
│   │       ├── http.service.js           ← HTTP Client (futuro)
│   │       ├── notification.service.js   ← Toasts/Alerts
│   │       └── logger.service.js         ← Logging
│   │
│   └── 📁 data/                           ← Capa de datos
│       ├── db.js                         ← IndexedDB Setup (Dexie)
│       ├── repositories/                 ← Patrón Repository
│       │   ├── product.repository.js
│       │   ├── movement.repository.js
│       │   ├── scan.repository.js
│       │   └── base.repository.js
│       ├── models/                       ← Modelos de datos
│       │   ├── Product.js
│       │   ├── Movement.js
│       │   └── Scan.js
│       └── migrations/                   ← Migraciones DB
│           └── v1-to-v2.js
│
├── 📁 assets/                             ← Recursos estáticos
│   ├── 📁 css/
│   │   ├── core/
│   │   │   ├── variables.css            ← CSS Variables
│   │   │   ├── reset.css
│   │   │   └── base.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── forms.css
│   │   │   ├── modals.css
│   │   │   └── tables.css
│   │   ├── effects/
│   │   │   ├── glassmorphism.css
│   │   │   ├── animations.css
│   │   │   └── transitions.css
│   │   ├── themes/
│   │   │   ├── dark.css
│   │   │   └── light.css
│   │   └── main.css                     ← Import all
│   │
│   ├── 📁 icons/                          ← PWA Icons
│   │   ├── icon-72.png
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   │
│   ├── 📁 images/
│   │   ├── logo-magnus.svg
│   │   └── placeholders/
│   │
│   ├── 📁 fonts/
│   │   ├── Inter/
│   │   └── Poppins/
│   │
│   └── 📁 sounds/
│       └── scan-beep.mp3
│
├── 📁 lib/                                ← Librerías externas
│   ├── html5-qrcode.min.js              ← QR Scanner
│   ├── quagga.min.js                    ← Barcode Scanner
│   ├── qrcode.min.js                    ← QR Generator
│   ├── jsbarcode.min.js                 ← Barcode Generator
│   ├── dexie.min.js                     ← IndexedDB
│   ├── xlsx.full.min.js                 ← Excel
│   ├── jspdf.umd.min.js                 ← PDF
│   └── chart.min.js                     ← Charts
│
├── 📁 docs/                               ← Documentación
│   ├── API.md
│   ├── INSTALL.md
│   └── USER-GUIDE.md
│
└── 📁 tests/                              ← Testing (futuro)
    ├── unit/
    └── integration/
```

---

## 📐 PATRONES DE DISEÑO IMPLEMENTADOS

### **1. Patrón Repository (Acceso a Datos)**

**Objetivo:** Abstraer la lógica de acceso a IndexedDB

```javascript
// src/data/repositories/base.repository.js
class BaseRepository {
    constructor(tableName) {
        this.table = db[tableName];
    }

    async getAll() {
        return await this.table.toArray();
    }

    async getById(id) {
        return await this.table.get(id);
    }

    async create(data) {
        return await this.table.add(data);
    }

    async update(id, data) {
        return await this.table.update(id, data);
    }

    async delete(id) {
        return await this.table.delete(id);
    }

    async where(criteria) {
        return await this.table.where(criteria).toArray();
    }
}

// src/data/repositories/product.repository.js
class ProductRepository extends BaseRepository {
    constructor() {
        super('productos');
    }

    async getBySKU(sku) {
        return await this.table.where('sku').equals(sku).first();
    }

    async getByQRCode(qrCode) {
        return await this.table.where('codigo_qr').equals(qrCode).first();
    }

    async getByMarcaCategoria(marca, categoria) {
        return await this.table
            .where('[marca+categoria]')
            .equals([marca, categoria])
            .toArray();
    }

    async getStockBajo() {
        return await this.table
            .filter(p => p.stock_actual <= p.stock_minimo)
            .toArray();
    }
}
```

### **2. Patrón Service (Lógica de Negocio)**

**Objetivo:** Encapsular lógica de negocio compleja

```javascript
// src/features/inventory/services/product.service.js
class ProductService {
    constructor() {
        this.productRepo = new ProductRepository();
        this.movementRepo = new MovementRepository();
    }

    async crearProducto(data) {
        // Validaciones
        if (!data.sku) {
            data.sku = this.generarSKU(data);
        }

        // Generar QR automáticamente
        data.codigo_qr = await this.generarCodigoQR(data);

        // Guardar
        const id = await this.productRepo.create(data);

        // Registrar movimiento inicial
        await this.movementRepo.create({
            producto_id: id,
            tipo: 'entrada',
            cantidad: data.stock_inicial || 0,
            motivo: 'stock_inicial',
            fecha: new Date().toISOString()
        });

        // Emit evento
        EventBus.emit('producto:creado', { id, data });

        return id;
    }

    async actualizarStock(productoId, cantidad, tipo, motivo) {
        const producto = await this.productRepo.getById(productoId);

        let nuevoStock;
        if (tipo === 'entrada') {
            nuevoStock = producto.stock_actual + cantidad;
        } else if (tipo === 'salida') {
            nuevoStock = producto.stock_actual - cantidad;
            if (nuevoStock < 0) {
                throw new Error('Stock insuficiente');
            }
        }

        // Actualizar producto
        await this.productRepo.update(productoId, {
            stock_actual: nuevoStock,
            ultima_actualizacion: new Date().toISOString()
        });

        // Registrar movimiento
        await this.movementRepo.create({
            producto_id: productoId,
            tipo,
            cantidad,
            stock_anterior: producto.stock_actual,
            stock_nuevo: nuevoStock,
            motivo,
            fecha: new Date().toISOString()
        });

        // Verificar alerta stock bajo
        if (nuevoStock <= producto.stock_minimo) {
            EventBus.emit('stock:bajo', { producto });
        }

        return nuevoStock;
    }

    generarSKU(data) {
        // ARM-RB-WAY-ACE-NEG-52-001
        const categoria = data.categoria.substring(0, 3).toUpperCase();
        const marca = data.marca.substring(0, 2).toUpperCase();
        const modelo = data.modelo ? data.modelo.substring(0, 3).toUpperCase() : 'XXX';
        const material = data.material ? data.material.substring(0, 3).toUpperCase() : 'XXX';
        const color = data.color ? data.color.substring(0, 3).toUpperCase() : 'XXX';
        const tamaño = data.tamaño || '00';
        const id = String(Date.now()).slice(-3);

        return `${categoria}-${marca}-${modelo}-${material}-${color}-${tamaño}-${id}`;
    }
}
```

### **3. Patrón Event Bus (Comunicación Desacoplada)**

**Objetivo:** Comunicación entre módulos sin dependencias directas

```javascript
// src/core/events.js
class EventBus {
    constructor() {
        this.events = {};
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }

    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName]
                .filter(cb => cb !== callback);
        }
    }
}

const EventBus = new EventBus();

// Uso en diferentes módulos:

// Módulo Scanner emite evento
EventBus.emit('qr:escaneado', { codigo, tipo, contenido });

// Módulo Inventario escucha evento
EventBus.on('qr:escaneado', async (data) => {
    const producto = await ProductService.buscarPorQR(data.contenido);
    if (producto) {
        mostrarDetalleProducto(producto);
    }
});
```

### **4. Patrón Singleton (Instancia Única)**

**Objetivo:** Garantizar una sola instancia de servicios críticos

```javascript
// src/data/db.js
class Database {
    static instance = null;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.db = new Dexie('InventarioOpticoMagnus');
        this.db.version(1).stores({
            // ... schema
        });

        Database.instance = this;
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance.db;
    }
}

const db = Database.getInstance();
```

---

## 🔧 CONFIGURACIÓN PWA (Progressive Web App)

### **manifest.json**

```json
{
  "name": "Inventario Óptico Magnus",
  "short_name": "Magnus Inventory",
  "description": "Sistema profesional de inventario óptico con escáner QR y códigos de barras",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f23",
  "theme_color": "#00f5ff",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "es-PE",

  "icons": [
    {
      "src": "/assets/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],

  "shortcuts": [
    {
      "name": "Escanear QR",
      "short_name": "Escanear",
      "description": "Abrir escáner QR/Códigos",
      "url": "/scanner",
      "icons": [{ "src": "/assets/icons/scan.png", "sizes": "96x96" }]
    },
    {
      "name": "Inventario",
      "short_name": "Productos",
      "description": "Ver lista de productos",
      "url": "/inventory",
      "icons": [{ "src": "/assets/icons/products.png", "sizes": "96x96" }]
    },
    {
      "name": "Reportes",
      "short_name": "Reportes",
      "description": "Generar reportes",
      "url": "/reports",
      "icons": [{ "src": "/assets/icons/reports.png", "sizes": "96x96" }]
    }
  ],

  "categories": ["business", "productivity", "utilities"],

  "screenshots": [
    {
      "src": "/assets/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/assets/screenshots/scanner.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### **Service Worker (Estrategia Offline-First)**

```javascript
// service-worker.js
const CACHE_NAME = 'magnus-inventory-v1';
const RUNTIME_CACHE = 'magnus-runtime-v1';

// Archivos estáticos para cachear en instalación
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/src/core/app.js',
    '/lib/dexie.min.js',
    '/lib/html5-qrcode.min.js',
    '/lib/xlsx.full.min.js',
    '/assets/fonts/Inter-Regular.woff2',
    '/assets/icons/icon-192.png'
];

// INSTALACIÓN - Cachear archivos estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ACTIVACIÓN - Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH - Estrategia Cache-First con Network Fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo cachear mismo origen
    if (url.origin !== location.origin) {
        return;
    }

    // Estrategia Cache-First para archivos estáticos
    if (request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        request.destination === 'image') {
        event.respondWith(
            caches.match(request).then(cached => {
                return cached || fetch(request).then(response => {
                    return caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            })
        );
        return;
    }

    // Estrategia Network-First para páginas HTML
    if (request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request))
        );
    }
});

// SINCRONIZACIÓN EN BACKGROUND (futuro)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-inventario') {
        event.waitUntil(sincronizarDatos());
    }
});

async function sincronizarDatos() {
    // Lógica de sincronización con servidor (futuro)
    console.log('Sincronizando datos pendientes...');
}
```

---

## 🎨 ESPECIFICACIONES UI DETALLADAS

### **Componente: Botón Glassmorphism**

```css
/* assets/css/components/buttons.css */
.btn {
    /* Base */
    font-family: var(--font-family-primary);
    font-weight: 600;
    font-size: var(--font-size-base);
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    border: none;
    outline: none;

    /* Glassmorphism */
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);

    /* Espaciado */
    padding: 12px 24px;
    margin: 0;

    /* Forma */
    border-radius: 12px;

    /* Sombra */
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);

    /* Transición suave */
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

    /* Cursor */
    position: relative;
    overflow: hidden;
}

/* Hover Effect */
.btn:hover {
    transform: translateY(-2px);
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.2),
        0 0 20px rgba(0, 245, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 245, 255, 0.5);
}

/* Active/Click Effect */
.btn:active {
    transform: translateY(0);
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Variantes de Color */
.btn-primary {
    background: linear-gradient(135deg, rgba(0, 245, 255, 0.2) 0%, rgba(179, 0, 255, 0.2) 100%);
    border-color: rgba(0, 245, 255, 0.3);
    color: #00f5ff;
}

.btn-primary:hover {
    background: linear-gradient(135deg, rgba(0, 245, 255, 0.3) 0%, rgba(179, 0, 255, 0.3) 100%);
    box-shadow: 0 0 30px rgba(0, 245, 255, 0.5);
}

.btn-success {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.3);
    color: #00ff88;
}

.btn-danger {
    background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 68, 68, 0.2) 100%);
    border-color: rgba(255, 0, 110, 0.3);
    color: #ff006e;
}

/* Ripple Effect (Microinteracción) */
.btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.btn:active::after {
    width: 300px;
    height: 300px;
}
```

### **Componente: Card Glassmorphism**

```css
/* assets/css/components/cards.css */
.glass-card {
    /* Glassmorphism Base */
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    /* Bordes */
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;

    /* Sombra */
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);

    /* Espaciado */
    padding: 24px;
    margin: 16px 0;

    /* Transición */
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover Effect */
.glass-card:hover {
    transform: translateY(-4px);
    box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 0 30px rgba(0, 245, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(0, 245, 255, 0.3);
}

/* Card con imagen de fondo borrosa */
.glass-card-image {
    position: relative;
    overflow: hidden;
}

.glass-card-image::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    filter: blur(20px) brightness(0.7);
    z-index: -1;
}
```

---

## 📊 ESPECIFICACIONES DE BASE DE DATOS

### **Esquema Completo IndexedDB**

```javascript
// src/data/db.js
import Dexie from '/lib/dexie.min.js';

const db = new Dexie('InventarioOpticoMagnus');

// VERSIÓN 1 - Schema Inicial
db.version(1).stores({
    // PRODUCTOS
    productos: '++id, sku, codigo_qr, codigo_barras, nombre, marca, categoria, subcategoria, material, color, genero, forma, precio_compra, precio_venta, stock_actual, stock_minimo, establecimiento, ubicacion_zona, ubicacion_estante, proveedor_id, activo, fecha_creacion, ultima_actualizacion',

    // MOVIMIENTOS DE INVENTARIO
    movimientos: '++id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, establecimiento, usuario, fecha',

    // HISTORIAL DE ESCANEOS
    escaneos: '++id, tipo_codigo, formato, contenido, producto_id, accion_realizada, resultado, establecimiento, fecha',

    // PROVEEDORES
    proveedores: '++id, nombre, ruc, razon_social, direccion, telefono, email, contacto_nombre, contacto_telefono, activo, fecha_creacion',

    // CLIENTES (Integración con sistema existente)
    clientes: '++id, tipo_documento, numero_documento, nombres, apellidos, telefono, email, direccion, establecimiento, fecha_registro',

    // CATEGORÍAS
    categorias: '++id, nombre, slug, tipo, descripcion, icono, color, orden, activo',

    // SUBCATEGORÍAS
    subcategorias: '++id, categoria_id, nombre, slug, descripcion, orden, activo',

    // MARCAS
    marcas: '++id, nombre, slug, logo_url, activo',

    // ESTABLECIMIENTOS
    establecimientos: '++id, nombre, slug, direccion, telefono, email, activo',

    // ZONAS DE ALMACÉN
    zonas: '++id, establecimiento_id, nombre, slug, descripcion, estantes',

    // PLANTILLAS QR/CÓDIGOS
    plantillas_codigos: '++id, nombre, tipo, configuracion, es_favorita, fecha_creacion',

    // CONFIGURACIÓN
    configuracion: 'clave, valor, tipo, descripcion',

    // USUARIOS (futuro)
    usuarios: '++id, email, nombre, rol, establecimiento_id, activo'
});

// VERSIÓN 2 - Índices Compuestos para Búsquedas Rápidas
db.version(2).stores({
    productos: '++id, sku, codigo_qr, codigo_barras, [marca+categoria], [establecimiento+activo], [categoria+activo], nombre, marca, categoria',
    movimientos: '++id, producto_id, [producto_id+fecha], [establecimiento+fecha], fecha, tipo',
    escaneos: '++id, [producto_id+fecha], [establecimiento+fecha], fecha, tipo_codigo'
});

// VERSIÓN 3 - Campos Adicionales (futuro)
db.version(3).stores({
    productos: '++id, sku, codigo_qr, codigo_barras, [marca+categoria], [establecimiento+activo], nombre, marca, categoria, fecha_vencimiento'
}).upgrade(tx => {
    // Migración: agregar campo fecha_vencimiento
    return tx.table('productos').toCollection().modify(producto => {
        producto.fecha_vencimiento = null;
    });
});

export default db;
```

### **Modelo de Datos: Producto**

```javascript
// src/data/models/Product.js
class Product {
    constructor(data = {}) {
        // IDs y Códigos
        this.id = data.id || null;
        this.sku = data.sku || null;
        this.codigo_qr = data.codigo_qr || null;
        this.codigo_barras = data.codigo_barras || null;

        // Información Básica
        this.nombre = data.nombre || '';
        this.marca = data.marca || '';
        this.categoria = data.categoria || '';
        this.subcategoria = data.subcategoria || null;
        this.descripcion = data.descripcion || '';

        // Características (Armazones)
        this.material = data.material || null;
        this.color = data.color || null;
        this.genero = data.genero || null;
        this.forma = data.forma || null;
        this.tamaño = data.tamaño || {
            lente: null,
            puente: null,
            varilla: null
        };

        // Características (Lentes)
        this.tipo_lente = data.tipo_lente || null;
        this.material_lente = data.material_lente || null;
        this.tratamientos = data.tratamientos || [];

        // Precios
        this.precio_compra = data.precio_compra || 0;
        this.precio_venta = data.precio_venta || 0;
        this.precio_mayoreo = data.precio_mayoreo || null;
        this.moneda = data.moneda || 'PEN';
        this.margen_porcentaje = this.calcularMargen();

        // Stock
        this.stock_actual = data.stock_actual || 0;
        this.stock_minimo = data.stock_minimo || 1;
        this.stock_maximo = data.stock_maximo || null;
        this.unidad = data.unidad || 'piezas';

        // Proveedor
        this.proveedor_id = data.proveedor_id || null;
        this.codigo_proveedor = data.codigo_proveedor || null;

        // Ubicación
        this.establecimiento = data.establecimiento || '';
        this.ubicacion_zona = data.ubicacion_zona || '';
        this.ubicacion_estante = data.ubicacion_estante || '';
        this.notas_ubicacion = data.notas_ubicacion || '';

        // Multimedia
        this.imagen_principal = data.imagen_principal || null;
        this.imagenes_adicionales = data.imagenes_adicionales || [];
        this.qr_generado_url = data.qr_generado_url || null;

        // Metadata
        this.activo = data.activo !== undefined ? data.activo : true;
        this.fecha_creacion = data.fecha_creacion || new Date().toISOString();
        this.fecha_actualizacion = data.fecha_actualizacion || new Date().toISOString();
        this.creado_por = data.creado_por || null;
    }

    calcularMargen() {
        if (this.precio_venta && this.precio_compra) {
            return ((this.precio_venta - this.precio_compra) / this.precio_venta * 100).toFixed(2);
        }
        return 0;
    }

    getEstadoStock() {
        if (this.stock_actual === 0) return 'agotado';
        if (this.stock_actual <= this.stock_minimo) return 'bajo';
        return 'normal';
    }

    validate() {
        const errors = [];

        if (!this.nombre) errors.push('El nombre es obligatorio');
        if (!this.categoria) errors.push('La categoría es obligatoria');
        if (this.precio_venta < 0) errors.push('El precio de venta no puede ser negativo');
        if (this.stock_actual < 0) errors.push('El stock no puede ser negativo');

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON() {
        return { ...this };
    }
}

export default Product;
```

---

## 🔄 FLUJOS DE TRABAJO DETALLADOS

### **FLUJO 1: Escanear QR y Actualizar Stock**

```
┌─────────────────────────────────────────────────────┐
│  INICIO: Usuario abre módulo Scanner               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Sistema solicita permiso de cámara                 │
│  (primera vez - se guarda permiso)                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  ¿Usuario otorga permiso?                           │
└─────────────────────────────────────────────────────┘
        ↓ No                              ↓ Sí
┌──────────────────┐          ┌───────────────────────┐
│ Mostrar error    │          │ Activar cámara        │
│ "Permiso         │          │ Vista previa en vivo  │
│  denegado"       │          └───────────────────────┘
└──────────────────┘                      ↓
                              ┌───────────────────────┐
                              │ html5-qrcode detecta  │
                              │ QR automáticamente    │
                              │ (escaneo continuo)    │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │ ¿QR detectado?        │
                              └───────────────────────┘
                                          ↓ Sí
                              ┌───────────────────────┐
                              │ - Vibrar dispositivo  │
                              │ - Reproducir beep     │
                              │ - Decodificar QR      │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │ Buscar en IndexedDB:  │
                              │ productos.where(      │
                              │  'codigo_qr'          │
                              │ ).equals(qrCode)      │
                              └───────────────────────┘
                                          ↓
                    ┌────────────────────┴────────────────────┐
                    ↓                                         ↓
        ┌───────────────────────┐              ┌───────────────────────┐
        │ ENCONTRADO            │              │ NO ENCONTRADO         │
        │ Producto existe       │              │ Producto no existe    │
        └───────────────────────┘              └───────────────────────┘
                    ↓                                         ↓
        ┌───────────────────────┐              ┌───────────────────────┐
        │ Mostrar tarjeta:      │              │ Mostrar modal:        │
        │ ┌─────────────────┐   │              │ "Producto no          │
        │ │ [Imagen]        │   │              │  encontrado"          │
        │ │ Nombre producto │   │              │ ¿Agregar al          │
        │ │ SKU: XXX        │   │              │  inventario?         │
        │ │ Stock: 10       │   │              │                      │
        │ │ Precio: S/1500  │   │              │ [Sí] [No] [Buscar   │
        │ │                 │   │              │        Web]          │
        │ │ [Actualizar     │   │              └───────────────────────┘
        │ │  Stock]         │   │
        │ │ [Ver Detalles]  │   │
        │ │ [Agregar Venta] │   │
        │ └─────────────────┘   │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Usuario click:        │
        │ "Actualizar Stock"    │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Abrir modal:          │
        │ ┌─────────────────┐   │
        │ │ Tipo movimiento:│   │
        │ │ ○ Entrada       │   │
        │ │ ○ Salida        │   │
        │ │ ○ Ajuste        │   │
        │ │                 │   │
        │ │ Cantidad: [__]  │   │
        │ │ Motivo: [____]  │   │
        │ │                 │   │
        │ │ Nuevo stock:    │   │
        │ │ 10 + 5 = 15     │   │
        │ │                 │   │
        │ │ [Guardar]       │   │
        │ └─────────────────┘   │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Usuario completa y    │
        │ hace click "Guardar"  │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ ProductService.       │
        │ actualizarStock(...)  │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ TRANSACCIÓN:          │
        │ 1. Actualizar         │
        │    producto.stock     │
        │ 2. Crear movimiento   │
        │ 3. Guardar escaneo    │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ ¿Stock <= mínimo?     │
        └───────────────────────┘
                    ↓ Sí
        ┌───────────────────────┐
        │ EventBus.emit(        │
        │   'stock:bajo'        │
        │ )                     │
        │ → Notificación        │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Mostrar notificación: │
        │ "✅ Stock             │
        │  actualizado:         │
        │  10 → 15"             │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Cerrar modal          │
        │ Volver a scanner      │
        │ (listo para escanear  │
        │  siguiente producto)  │
        └───────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  FIN: Usuario puede seguir escaneando               │
└─────────────────────────────────────────────────────┘
```

---

## 📚 RESUMEN DE LIBRERÍAS SELECCIONADAS

| Categoría | Librería | Tamaño | Uso | Fuente |
|-----------|----------|--------|-----|--------|
| **QR Scanner** | html5-qrcode | 45KB | Escaneo QR desde cámara/archivo | [GitHub](https://github.com/mebjas/html5-qrcode) |
| **Barcode Scanner** | QuaggaJS | 120KB | Escaneo códigos barras 1D | [Sitio](https://serratus.github.io/quaggaJS/) |
| **QR Generator** | qrcode.js | 20KB | Generar QR personalizados | [CDN](https://cdnjs.com) |
| **Barcode Generator** | JsBarcode | 25KB | Generar códigos barras | [NPM](https://www.npmjs.com/package/jsbarcode) |
| **IndexedDB** | Dexie.js | 50KB | Wrapper IndexedDB | [Dexie.org](https://dexie.org) |
| **Excel** | SheetJS | 150KB | Exportar/Importar Excel | [SheetJS](https://sheetjs.com) |
| **PDF** | jsPDF + AutoTable | 250KB | Generar PDFs | [jsPDF](https://github.com/parallax/jsPDF) |
| **Charts** | Chart.js | 60KB | Gráficos estadísticos | [Chart.js](https://www.chartjs.org) |
| **Alerts** | SweetAlert2 | 40KB | Modales/Alertas bonitas | [SweetAlert2](https://sweetalert2.github.io) |
| **Icons** | Lucide | 50KB | Iconos SVG modernos | [Lucide](https://lucide.dev) |

**Peso Total Estimado:** ~850KB minificado (~250KB gzipped)

---

## ✅ CHECKLIST DE DESARROLLO

### **FASE 1: Setup Inicial**
- [ ] Crear estructura de carpetas
- [ ] Configurar manifest.json
- [ ] Configurar service-worker.js
- [ ] Descargar todas las librerías a /lib/
- [ ] Crear CSS base (variables, reset, glassmorphism)
- [ ] Configurar IndexedDB con Dexie.js
- [ ] Crear datos de ejemplo para testing

### **FASE 2: Core del Sistema**
- [ ] Implementar EventBus
- [ ] Implementar Router (navegación SPA)
- [ ] Implementar State Management
- [ ] Crear componentes UI reutilizables (botones, cards, modals)
- [ ] Crear layouts (navbar, sidebar)
- [ ] Implementar tema Dark/Light Mode
- [ ] Sistema de notificaciones

### **FASE 3: Módulo Scanner**
- [ ] Integrar html5-qrcode
- [ ] Integrar QuaggaJS
- [ ] Página scanner con vista cámara
- [ ] Decodificación automática
- [ ] Acciones inteligentes (URL, teléfono, email, etc.)
- [ ] Historial de escaneos
- [ ] Modo lote (escaneo continuo)

### **FASE 4: Módulo Generator**
- [ ] Integrar qrcode.js
- [ ] Integrar JsBarcode
- [ ] Formulario generación QR personalizado
- [ ] Formulario generación código barras
- [ ] Personalización visual (colores, logo, estilo)
- [ ] Exportación (PNG, SVG, PDF)
- [ ] Sistema de plantillas guardadas

### **FASE 5: Módulo Inventario**
- [ ] CRUD productos (crear, leer, actualizar, eliminar)
- [ ] Formulario producto con 5 tabs
- [ ] Lista de productos (tabla + cards)
- [ ] Búsqueda avanzada y filtros
- [ ] Gestión de stock
- [ ] Registro de movimientos
- [ ] Alertas de stock bajo

### **FASE 6: Módulo Reportes**
- [ ] Dashboard con estadísticas
- [ ] Integrar Chart.js
- [ ] Reportes predefinidos (stock bajo, por marca, por categoría)
- [ ] Exportación Excel con SheetJS
- [ ] Exportación PDF con jsPDF
- [ ] Exportación CSV nativo
- [ ] Filtros de fecha y categorías

### **FASE 7: PWA y Offline**
- [ ] Probar instalación como PWA
- [ ] Verificar funcionamiento offline
- [ ] Optimizar caché
- [ ] Sincronización background (futuro)
- [ ] Probar en múltiples navegadores
- [ ] Probar en dispositivos móviles

### **FASE 8: Integración Sistema Existente**
- [ ] Compartir base de datos IndexedDB
- [ ] API interna para comunicación
- [ ] Migrar datos de LocalStorage a IndexedDB
- [ ] Sincronizar clientes y ventas

### **FASE 9: Testing y Optimización**
- [ ] Testing funcional completo
- [ ] Optimizar rendimiento (Lighthouse)
- [ ] Reducir tamaño assets
- [ ] Comprimir imágenes
- [ ] Minificar CSS/JS
- [ ] Accessibility audit

### **FASE 10: Documentación y Deployment**
- [ ] Manual de usuario
- [ ] Documentación técnica
- [ ] Guía de instalación
- [ ] Deploy a servidor/hosting
- [ ] Configurar dominio
- [ ] SSL/HTTPS

---

## 📖 FUENTES Y REFERENCIAS

### **Arquitectura y Patrones:**
- [Desarrollo Web Moderno 2025](https://owius.com/desarrollo-web-moderno-frameworks-esenciales-para-2025/)
- [Mejores Frameworks Frontend 2025](https://keepcoding.io/blog/mejores-frameworks-frontend-en-la-actualidad/)
- [Tendencias JavaScript 2025](https://www.campusmvp.es/recursos/post/tendencias-en-programacion-javascript-para-2025.aspx)

### **PWA y Offline:**
- [PWA Offline 2025](https://keepcoding.io/blog/pwa-offline/)
- [Arquitectura PWA](https://medium.com/react-adventure/arquitectura-de-una-pwa-26e4c4a58da2)
- [PWA Tutorial 2025](https://markaicode.com/progressive-web-app-tutorial-2025-service-worker-offline/)

### **Base de Datos:**
- [Master Browser Storage 2025](https://medium.com/@osamajavaid/master-browser-storage-in-2025-the-ultimate-guide-for-front-end-developers-7b2735b4cc13)
- [IndexedDB vs LocalStorage](https://www.linkedin.com/pulse/why-indexeddb-better-than-localstorage-web-sql-modern-bhavsar-7q8tf)
- [RxDB Storage Comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)

### **QR y Códigos de Barras:**
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- [QuaggaJS](https://serratus.github.io/quaggaJS/)
- [Popular JS Barcode Scanners](https://scanbot.io/blog/popular-open-source-javascript-barcode-scanners/)
- [Best QR Generators 2025](https://www.jqueryscript.net/blog/best-custom-qr-code-generator.html)

### **UI/UX:**
- [Tendencias UI/UX 2025](https://iembs.com/read-think/anticipando-el-futuro-del-diseno-ui-ux/)
- [Mejores Prácticas Diseño Web 2025](https://baluidigital.es/las-mejores-practicas-de-diseno-web-en-2025-enfoque-en-ux-ui/)
- [Novedades Diseño 2025](https://mobivery.com/novedades-y-tendencias-en-diseno-ux-ui-en-2025/)
- [Claves Diseño UX 2025](https://uraldes.com/claves-del-diseno-ux-2025-mejor-experiencia/)

---

## 🎓 CONCLUSIÓN

Esta arquitectura técnica define un **sistema profesional y moderno** para gestión de inventario óptico basado en las **mejores prácticas de 2025**:

✅ **PWA Offline-First** - Funciona sin internet, instalable como app
✅ **IndexedDB** - Base de datos robusta, escalable
✅ **Librerías Líderes** - html5-qrcode, QuaggaJS, SheetJS (investigadas y validadas)
✅ **UI/UX 2025** - Glassmorphism, microinteracciones, dark mode, accesibilidad
✅ **Arquitectura Modular** - Escalable, mantenible, profesional
✅ **Patrones de Diseño** - Repository, Service, Event Bus, Singleton

**El sistema está listo para ser desarrollado siguiendo esta planificación.**

---

**Última Actualización:** 22 de Diciembre, 2025
**Versión:** 2.0 Final
**Estado:** ✅ Investigación Completa - Listo para Desarrollo

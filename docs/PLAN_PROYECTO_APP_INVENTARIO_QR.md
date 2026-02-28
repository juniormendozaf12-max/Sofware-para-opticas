# PLAN DE PROYECTO - APP MÓVIL INVENTARIO QR

## 1. RESUMEN EJECUTIVO

**Nombre del Proyecto:** Sistema de Inventario con Lector QR
**Tipo:** Aplicación Móvil Android + Web Application
**Objetivo:** Crear una aplicación móvil para gestión de inventarios mediante códigos QR, integrada con sistemas web HTML y exportación a Excel

---

## 2. TECNOLOGÍAS RECOMENDADAS

### 2.1 Framework de Desarrollo Móvil

**OPCIÓN RECOMENDADA: React Native**

**Ventajas:**
- Desarrollo multiplataforma (Android/iOS) con un solo código base
- Amplia comunidad y soporte
- Integración fácil con HTML/Web existente
- Rendimiento cercano a nativo
- Reutilización de código JavaScript entre web y móvil

**Librerías Principales:**
- `react-native-camera` o `react-native-vision-camera` - Acceso a cámara
- `react-native-qrcode-scanner` - Escaneo de códigos QR
- `react-native-scanner` - Soporte para arquitectura Turbo + Fabric (moderno)

**Alternativa: Flutter**
- Si se prefiere rendimiento superior
- Usa Dart como lenguaje
- `flutter_barcode_scanner` para QR

### 2.2 Backend y Sincronización

**Firebase Realtime Database**
- Sincronización en tiempo real entre app móvil y web
- Soporte offline (trabaja sin internet y sincroniza después)
- API REST disponible para integración con HTML
- NoSQL con estructura JSON
- Escalable y confiable

**Alternativa: API REST Propia**
- Node.js + Express
- MongoDB o PostgreSQL
- WebSockets para tiempo real

### 2.3 Integración Web (HTML)

**Tecnologías:**
- Firebase SDK para JavaScript
- Fetch API / Axios para comunicación REST
- WebSockets para actualizaciones en tiempo real
- IndexedDB para caché local en navegador

### 2.4 Exportación a Excel

**Librerías JavaScript:**
- `xlsx` (SheetJS) - Generación de archivos Excel (.xlsx, .xls)
- `react-native-fs` - Sistema de archivos en móvil
- `react-native-share` - Compartir archivos generados
- `file-saver` - Para descarga desde web

**Funcionalidades:**
- Exportar inventario completo
- Filtros por fecha, categoría, ubicación
- Formatos: .xlsx, .csv, .pdf

---

## 3. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                   APLICACIÓN MÓVIL ANDROID              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Escáner QR   │  │  Inventario  │  │   Reportes   │  │
│  │  & Cámara    │  │  CRUD Prod.  │  │  Excel/PDF   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                  │          │
└───────────┼────────────────┼──────────────────┼─────────┘
            │                │                  │
            ▼                ▼                  ▼
    ┌───────────────────────────────────────────────┐
    │        FIREBASE REALTIME DATABASE             │
    │     (Sincronización en Tiempo Real)           │
    │  ┌─────────────┐  ┌──────────┐  ┌─────────┐  │
    │  │ Productos   │  │ Usuarios │  │ Historial│ │
    │  │ Inventario  │  │ & Roles  │  │ Movimien.│ │
    │  └─────────────┘  └──────────┘  └─────────┘  │
    └───────────────────────────────────────────────┘
                          ▲
                          │
    ┌─────────────────────┼─────────────────────────┐
    │         APLICACIÓN WEB (HTML/JavaScript)      │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────┐│
    │  │  Dashboard   │  │  Consultas   │  │Export││
    │  │  Inventario  │  │  & Reportes  │  │Excel ││
    │  └──────────────┘  └──────────────┘  └──────┘│
    └───────────────────────────────────────────────┘
```

---

## 4. ESTRUCTURA DE BASE DE DATOS

### 4.1 Firebase Realtime Database (Esquema JSON)

```json
{
  "productos": {
    "prod_001": {
      "codigo_qr": "QR123456789",
      "nombre": "Armazón Modelo X-100",
      "categoria": "armazones",
      "marca": "RayBan",
      "precio_compra": 250.00,
      "precio_venta": 450.00,
      "stock_actual": 15,
      "stock_minimo": 5,
      "ubicacion": "Estante A3",
      "proveedor": "Optica Distribuidores SAC",
      "fecha_ingreso": "2025-01-15T10:30:00Z",
      "ultima_actualizacion": "2025-01-20T14:22:00Z",
      "imagen_url": "https://...",
      "activo": true
    }
  },

  "movimientos": {
    "mov_001": {
      "producto_id": "prod_001",
      "tipo": "entrada",
      "cantidad": 10,
      "usuario": "admin@optica.com",
      "fecha": "2025-01-15T10:30:00Z",
      "nota": "Nuevo pedido del proveedor",
      "metodo_registro": "escaner_qr"
    }
  },

  "categorias": {
    "cat_001": {
      "nombre": "Armazones",
      "descripcion": "Monturas para lentes",
      "icono": "glasses"
    },
    "cat_002": {
      "nombre": "Lunas/Lentes",
      "descripcion": "Cristales y lentes de contacto",
      "icono": "lens"
    }
  },

  "usuarios": {
    "user_001": {
      "email": "admin@optica.com",
      "nombre": "Administrador",
      "rol": "admin",
      "activo": true,
      "fecha_creacion": "2025-01-01T00:00:00Z"
    }
  },

  "configuracion": {
    "negocio": {
      "nombre": "Centro Óptico Sicuani",
      "direccion": "...",
      "telefono": "...",
      "logo_url": "..."
    },
    "sistema": {
      "moneda": "PEN",
      "zona_horaria": "America/Lima",
      "idioma": "es"
    }
  }
}
```

---

## 5. FUNCIONALIDADES PRINCIPALES

### 5.1 APLICACIÓN MÓVIL ANDROID

#### Módulo 1: Escaneo QR
- Abrir cámara y escanear códigos QR
- Detección automática y rápida
- Vibración y sonido al escanear
- Modo escaneo continuo (múltiples productos)
- Generación de códigos QR para productos nuevos

#### Módulo 2: Gestión de Inventario
- **Crear Producto:**
  - Escanear/generar QR
  - Capturar foto del producto
  - Ingresar datos (nombre, precio, stock, categoría)
  - Asignar ubicación física

- **Actualizar Stock:**
  - Escanear QR del producto
  - Agregar/Quitar cantidad
  - Registro automático de movimiento
  - Alertas de stock mínimo

- **Consultar Producto:**
  - Buscar por QR, nombre o código
  - Ver historial de movimientos
  - Ver ubicación física

- **Eliminar/Desactivar Producto**

#### Módulo 3: Reportes y Exportación
- Inventario actual (todos los productos)
- Productos con stock bajo
- Movimientos por fecha
- Exportar a Excel (.xlsx)
- Exportar a CSV
- Compartir por WhatsApp, email, Drive

#### Módulo 4: Sincronización
- Sincronización automática con Firebase
- Modo offline (guardar cambios localmente)
- Sincronizar al recuperar conexión
- Indicador de estado de conexión

### 5.2 APLICACIÓN WEB (HTML/JavaScript)

#### Dashboard
- Resumen de inventario
- Gráficos de stock
- Productos más vendidos
- Alertas de stock mínimo

#### Consultas
- Búsqueda avanzada de productos
- Filtros por categoría, marca, proveedor
- Historial de movimientos

#### Reportes
- Generar reportes personalizados
- Exportar a Excel desde web
- Imprimir reportes

#### Configuración
- Gestión de usuarios
- Categorías y ubicaciones
- Configuración del negocio

---

## 6. FLUJOS DE TRABAJO PRINCIPALES

### 6.1 Registrar Producto Nuevo
```
1. Usuario abre app móvil
2. Presiona "Nuevo Producto"
3. Escanea QR del producto (o genera uno)
4. Toma foto del producto
5. Completa formulario (nombre, precio, stock, etc.)
6. Guarda
7. Se sincroniza con Firebase
8. Aparece en web instantáneamente
```

### 6.2 Actualizar Stock (Entrada)
```
1. Usuario abre app móvil
2. Presiona "Escanear"
3. Escanea QR del producto
4. Sistema muestra datos del producto
5. Usuario selecciona "Agregar stock"
6. Ingresa cantidad y nota
7. Guarda
8. Se registra movimiento
9. Se actualiza stock en tiempo real
```

### 6.3 Exportar Inventario a Excel
```
1. Usuario abre app móvil o web
2. Va a sección "Reportes"
3. Selecciona "Exportar Inventario"
4. Elige filtros (opcional): fecha, categoría
5. Presiona "Generar Excel"
6. Sistema crea archivo .xlsx
7. Usuario puede compartir o descargar
```

### 6.4 Sincronización Web-Móvil
```
1. Usuario A actualiza stock desde móvil
2. Firebase recibe cambio instantáneamente
3. Usuario B tiene web abierta
4. Firebase envía notificación de cambio
5. Web se actualiza automáticamente
6. Usuario B ve nuevo stock sin refrescar
```

---

## 7. INTEGRACIÓN MÓVIL-WEB

### 7.1 Comunicación Firebase

**Desde App Móvil:**
```javascript
// React Native
import database from '@react-native-firebase/database';

// Actualizar stock
const actualizarStock = async (productoId, nuevoStock) => {
  await database()
    .ref(`/productos/${productoId}`)
    .update({
      stock_actual: nuevoStock,
      ultima_actualizacion: new Date().toISOString()
    });
};

// Escuchar cambios en tiempo real
database()
  .ref('/productos')
  .on('value', snapshot => {
    const productos = snapshot.val();
    // Actualizar UI
  });
```

**Desde Web HTML:**
```javascript
// Web (HTML + Firebase SDK)
import { getDatabase, ref, onValue, update } from "firebase/database";

const db = getDatabase();

// Escuchar cambios en tiempo real
const productosRef = ref(db, 'productos');
onValue(productosRef, (snapshot) => {
  const data = snapshot.val();
  actualizarTablaInventario(data);
});

// Actualizar desde web
const actualizarProducto = (id, datos) => {
  update(ref(db, `productos/${id}`), datos);
};
```

### 7.2 API REST Alternativa

Si no se usa Firebase, crear API REST:

```javascript
// Node.js + Express
app.get('/api/productos', async (req, res) => {
  const productos = await db.collection('productos').find().toArray();
  res.json(productos);
});

app.post('/api/productos', async (req, res) => {
  const nuevoProducto = req.body;
  await db.collection('productos').insertOne(nuevoProducto);
  res.json({ success: true });
});

// Desde app móvil
fetch('https://tuapi.com/api/productos')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 8. EXPORTACIÓN A EXCEL

### 8.1 Implementación en React Native

```javascript
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const exportarAExcel = async (productos) => {
  // Preparar datos
  const data = productos.map(p => ({
    'Código QR': p.codigo_qr,
    'Nombre': p.nombre,
    'Categoría': p.categoria,
    'Stock Actual': p.stock_actual,
    'Precio Venta': p.precio_venta,
    'Ubicación': p.ubicacion
  }));

  // Crear libro de Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  // Generar archivo
  const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

  // Guardar en dispositivo
  const path = `${RNFS.DocumentDirectoryPath}/inventario_${Date.now()}.xlsx`;
  await RNFS.writeFile(path, wbout, 'ascii');

  // Compartir
  await Share.open({
    url: `file://${path}`,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    title: 'Inventario'
  });
};
```

### 8.2 Implementación en Web

```javascript
// Web (HTML + JavaScript)
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function exportarInventarioExcel(productos) {
  const data = productos.map(p => ({
    'Código QR': p.codigo_qr,
    'Nombre': p.nombre,
    'Categoría': p.categoria,
    'Stock': p.stock_actual,
    'Precio': p.precio_venta
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  saveAs(blob, `inventario_${new Date().toISOString()}.xlsx`);
}
```

---

## 9. FASES DE DESARROLLO

### FASE 1: Configuración Inicial (Semana 1)
- Instalar React Native y configurar entorno Android
- Configurar Firebase proyecto
- Crear estructura básica de la app
- Diseñar interfaz de usuario (UI/UX)

### FASE 2: Funcionalidad Core Móvil (Semana 2-3)
- Implementar escaneo QR
- Crear formularios CRUD productos
- Conectar con Firebase
- Implementar almacenamiento local (offline)

### FASE 3: Aplicación Web (Semana 4)
- Crear interfaz HTML/CSS/JavaScript
- Implementar Firebase SDK en web
- Crear dashboard de inventario
- Sincronización tiempo real

### FASE 4: Exportación Excel (Semana 5)
- Implementar generación Excel en móvil
- Implementar generación Excel en web
- Sistema de filtros y reportes personalizados

### FASE 5: Testing y Optimización (Semana 6)
- Pruebas de sincronización
- Pruebas de rendimiento
- Corrección de bugs
- Optimización de velocidad

### FASE 6: Deployment (Semana 7)
- Generar APK para Android
- Subir a Google Play Store (opcional)
- Deployment de web en hosting
- Documentación de usuario

---

## 10. REQUISITOS TÉCNICOS

### 10.1 Para Desarrollo
- **PC/Laptop:** Windows/Mac/Linux
- **Node.js:** v18+
- **Android Studio:** Para emulador y testing
- **Visual Studio Code:** Editor recomendado
- **Git:** Control de versiones

### 10.2 Para App Móvil
- **Android:** 7.0 (API 24) o superior
- **Cámara:** Para escaneo QR
- **Almacenamiento:** 50 MB mínimo
- **Internet:** Recomendado (funciona offline con limitaciones)

### 10.3 Para Web
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas versiones)
- **Internet:** Requerido
- **JavaScript:** Habilitado

---

## 11. COSTOS ESTIMADOS

### 11.1 Servicios Cloud (Firebase)
- **Plan Spark (Gratuito):**
  - 1 GB almacenamiento
  - 10 GB transferencia/mes
  - 100K descargas simultáneas
  - **Ideal para comenzar**

- **Plan Blaze (Pago por uso):**
  - Desde $0.026 por GB almacenamiento
  - Escalable según crecimiento

### 11.2 Desarrollo
- **Opción 1:** Desarrollo propio (tiempo de desarrollador)
- **Opción 2:** Freelancer ($1,500 - $3,000 USD)
- **Opción 3:** Agencia ($5,000 - $15,000 USD)

### 11.3 Publicación
- **Google Play Store:** $25 USD (pago único)
- **Hosting Web:** $5-20 USD/mes (Firebase Hosting gratis en plan básico)
- **Dominio:** $10-15 USD/año

---

## 12. VENTAJAS DE ESTA SOLUCIÓN

### Para el Negocio:
- Control total del inventario en tiempo real
- Reducción de errores humanos
- Ahorro de tiempo en conteos físicos
- Reportes instantáneos para toma de decisiones
- Acceso desde cualquier lugar (móvil y web)

### Técnicas:
- Escalable (crece con tu negocio)
- Modo offline (funciona sin internet)
- Sincronización automática
- Compatible con Excel (fácil integración)
- Código reutilizable (iOS en el futuro)

### Económicas:
- Sin costos de licencias mensuales inicialmente
- Infraestructura cloud gratuita (inicio)
- Mantenimiento bajo
- ROI rápido por eficiencia operativa

---

## 13. PRÓXIMOS PASOS RECOMENDADOS

1. **Validar Requerimientos Específicos:**
   - Cantidad de productos a manejar
   - Número de usuarios simultáneos
   - Necesidades especiales de tu óptica

2. **Definir Prioridades:**
   - ¿Qué funcionalidades son críticas?
   - ¿Qué puede esperar para versión 2.0?

3. **Ambiente de Desarrollo:**
   - Configurar PC/Laptop con herramientas
   - Crear cuenta Firebase
   - Instalar React Native

4. **Prototipo Rápido:**
   - Crear versión básica (MVP)
   - Probar escaneo QR + registro simple
   - Validar concepto antes de desarrollo completo

5. **Feedback:**
   - Probar con usuarios reales de tu óptica
   - Ajustar según necesidades descubiertas
   - Iterar y mejorar

---

## 14. RECURSOS Y REFERENCIAS

### Documentación Oficial:
- [React Native](https://reactnative.dev/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [SheetJS (XLSX)](https://docs.sheetjs.com/)

### Tutoriales Recomendados:
- [React Native QR Scanner](https://www.djamware.com/post/5e83f1e7344bef67e448798c/react-native-tutorial-qrcode-scanner-app-for-android-or-ios)
- [Firebase en React Native](https://rnfirebase.io/)

### Aplicaciones de Referencia:
- [Stock e Inventario Simple](https://play.google.com/store/apps/details?id=com.stockmanagment.next.app&hl=en_US)
- [SCANPET - Inventario](https://play.google.com/store/apps/details?id=com.maiko.scanpet&hl=en_US)

---

## 15. CONCLUSIÓN

Este proyecto es **100% viable** con las tecnologías actuales. La combinación de React Native + Firebase + Excel permite crear una solución robusta, escalable y económica para la gestión de inventarios en tu óptica.

**Ventajas Clave:**
- Un solo código para Android (y futuro iOS)
- Sincronización perfecta móvil-web
- Exportación nativa a Excel
- Bajo costo inicial
- Fácil mantenimiento

**Recomendación:**
Comenzar con un MVP (Producto Mínimo Viable) que incluya:
1. Escaneo QR básico
2. Registro de productos
3. Consulta de inventario
4. Exportación simple a Excel

Luego expandir con funcionalidades avanzadas según las necesidades reales del negocio.

---

**Fecha de Plan:** 22 de Diciembre, 2025
**Próxima Revisión:** Después de validar requerimientos específicos
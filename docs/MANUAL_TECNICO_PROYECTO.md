# 📘 MANUAL TÉCNICO COMPLETO - SISTEMA CENTRO ÓPTICO SICUANI

## 🎯 INFORMACIÓN DEL PROYECTO

**Nombre del Proyecto:** Sistema Integral de Gestión para Centro Óptico Sicuani
**Archivo Principal:** `Revision0008.html`
**Versión:** 5.0 (Purple Edition)
**Tipo:** Single-Page Application (SPA) - TODO EN UN SOLO ARCHIVO HTML
**Total de Líneas:** 28,687 líneas
**Tecnologías:** HTML5, CSS3, JavaScript Vanilla (ES6+), LocalStorage
**Última Actualización:** Diciembre 2025

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Concepto Fundamental: TODO EN UN ARCHIVO**
- ✅ **UN SOLO ARCHIVO HTML** contiene TODO el sistema
- ✅ HTML, CSS y JavaScript embebidos
- ✅ NO hay archivos externos (excepto librerías CDN)
- ✅ Base de datos: LocalStorage del navegador
- ✅ Sistema multi-establecimiento
- ✅ Diseño responsivo y moderno

### **Estructura del Archivo**
```
Revision0008.html (28,687 líneas)
├── <!DOCTYPE html> (Línea 1)
├── <head> (Líneas 2-19)
│   ├── Meta tags
│   ├── PDF.js CDN
│   └── Variables globales tempranas
├── <style> (Líneas 20-10,216)
│   ├── Variables CSS (:root)
│   ├── Estilos del Ribbon
│   ├── Estilos de módulos
│   ├── Modales y ventanas
│   ├── Tablas y formularios
│   ├── Animaciones CSS
│   └── Responsive design
├── <body> (Líneas 10,217-28,687)
│   ├── HTML de la interfaz
│   ├── Modales y ventanas
│   └── <script> JavaScript completo
└── </html>
```

---

## 🗄️ SISTEMA DE BASE DE DATOS

### **LocalStorage - Multi-Establecimiento**

#### **Estructura de Claves Dinámicas:**
```javascript
const DB_BASE = {
  CLIENTES: 'clientes',
  PRODUCTOS: 'productos',
  VENTAS: 'ventas',
  MEDIDAS: 'medidas',
  TIPOS_LUNAS: 'tipos_lunas',
  LUNAS_VENDIDAS: 'lunas_vendidas',
  MOVIMIENTOS: 'movimientos',
  GUIAS: 'guias',
  USUARIOS: 'usuarios',
  CORRELATIVOS: 'correlativos',
  ALMACENES: 'almacenes',
  CAJAS: 'cajas',
  CONSULTAS_CLINICAS: 'consultas_clinicas'
};

// Sistema dinámico según establecimiento
let DB = {};

function actualizarDB() {
  const prefijo = establecimientoActual
    ? 'optica_' + establecimientoActual.toLowerCase() + '_'
    : 'optica_default_';

  DB.CLIENTES = prefijo + 'clientes';
  DB.PRODUCTOS = prefijo + 'productos';
  // ... etc para todas las colecciones
}
```

#### **Establecimientos Soportados:**
1. **DOS_DE_MAYO** → Prefijo: `optica_dos_de_mayo_`
2. **PLAZA_DE_ARMAS** → Prefijo: `optica_plaza_de_armas_`
3. **DEFAULT** → Prefijo: `optica_default_`

#### **Colecciones de Datos (Tablas):**

1. **CLIENTES** (`DB.CLIENTES`)
   ```javascript
   {
     id: 'CLI_1234567890123',
     nombres: 'Juan',
     apellidos: 'Pérez García',
     documento: '12345678',
     telefono: '987654321',
     email: 'juan@email.com',
     direccion: 'Jr. Principal 123',
     fechaNacimiento: '1990-05-15',
     ocupacion: 'Ingeniero',
     estado: 'H', // H=Habilitado, D=Deshabilitado
     observaciones: 'Cliente frecuente',
     fechaCreacion: '2025-01-15T10:30:00.000Z'
   }
   ```

2. **VENTAS** (`DB.VENTAS`)
   ```javascript
   {
     id: 'VEN_1234567890123',
     clienteId: 'CLI_1234567890123',
     clienteNombre: 'Juan Pérez García',
     vendedor: 'ADMIN',
     fechaEmision: '2025-01-15',
     docTipo: 'BOLETA',
     docSerie: 'B001',
     docNumero: '00123',
     items: [
       {
         tipo: 'PRODUCTO',
         codigo: 'PROD_001',
         descripcion: 'Montura Ray-Ban',
         cantidad: 1,
         precio: 150.00,
         descuento: 0,
         total: 150.00
       }
     ],
     subtotal: 150.00,
     descuentoGlobal: 0,
     totalPagar: 150.00,
     pagado: 150.00,
     saldo: 0,
     metodoPago: 'EFECTIVO',
     estadoPago: 'PAGADO',
     estadoEntrega: 'ENTREGADO',
     observacion: ''
   }
   ```

3. **PRODUCTOS** (`DB.PRODUCTOS`)
   ```javascript
   {
     id: 'PROD_001',
     subCodigo: 'RB001',
     descripcion: 'Montura Ray-Ban Aviador',
     marca: 'Ray-Ban',
     modelo: 'Aviador Clásico',
     familia: 'MONTURAS',
     categoria: 'MONTURAS SOL',
     stock: 5,
     precioCompra: 80.00,
     precioVenta: 150.00,
     precioVentaMedio: 130.00,
     precioVentaMinimo: 120.00,
     ubicacion: 'Estante A1',
     observaciones: ''
   }
   ```

4. **MEDIDAS** (`DB.MEDIDAS`)
   ```javascript
   {
     id: 'RX_1234567890123',
     clienteId: 'CLI_1234567890123',
     codigo: '1234567890123',
     fecha: '2025-01-15',
     especialista: 'Dr. García',
     tipo: 'PROPIA', // PROPIA, EXTERNA

     // Visión de Lejos
     lejosOdEsf: '-2.00',
     lejosOdCil: '-0.75',
     lejosOdEje: '180',
     lejosOdAv: '20/20',
     lejosDip: '62',
     lejosOiEsf: '-1.75',
     lejosOiCil: '-0.50',
     lejosOiEje: '175',
     lejosOiAv: '20/20',

     // Visión de Cerca
     cercaOdEsf: '-1.50',
     cercaOdCil: '-0.75',
     cercaOdEje: '180',
     cercaDip: '60',
     cercaOiEsf: '-1.25',
     cercaOiCil: '-0.50',
     cercaOiEje: '175',

     // Lentes de Contacto
     lcOdH: '8.6',
     lcOdV: '8.4',
     lcOdPoder: '-2.00',
     lcOdDiametro: '14.0',
     lcOiH: '8.6',
     lcOiV: '8.4',
     lcOiPoder: '-1.75',
     lcOiDiametro: '14.0',

     rxObservacion: 'Cliente con miopía leve',
     proximaCita: '2025-07-15'
   }
   ```

5. **CONSULTAS_CLINICAS** (`DB.CONSULTAS_CLINICAS`)
   ```javascript
   {
     id: 'CONS_1234567890123',
     idCliente: 'CLI_1234567890123',
     dniCliente: '12345678',
     nombreCliente: 'Juan Pérez García',
     fecha: '2025-01-15',
     fechaFormato: '15/01/2025',
     motivo: 'Control de rutina',

     // Medidas de Visión de Lejos (OD = Ojo Derecho)
     medLejosEsfOD: '-2.00',
     medLejosCilOD: '-0.75',
     medLejosEjeOD: '180',
     medLejosAvOD: '20/20',
     medLejosDip: '62',

     // Medidas de Visión de Lejos (OI = Ojo Izquierdo)
     medLejosEsfOI: '-1.75',
     medLejosCilOI: '-0.50',
     medLejosEjeOI: '175',
     medLejosAvOI: '20/20',

     // Medidas de Cerca
     medCercaEsfOD: '-1.50',
     // ... etc

     // Lentes de Contacto
     lcMarcaOD: 'Acuvue',
     lcCurvaBaseOD: '8.6',
     lcDiametroOD: '14.0',
     lcPoderOD: '-2.00',

     // Otros Exámenes
     otrosQueratometriaOD: '7.8mm',
     otrosPIOOD: '15 mmHg',
     otrosBiomicroscopia: 'Normal',
     otrosFondoOjo: 'Sin alteraciones',

     // Oftalmología
     oftCie10: 'H52.1', // Código CIE-10
     oftTratamiento: 'Uso permanente de lentes',
     oftDiagnostico: 'Miopía bilateral'
   }
   ```

6. **CORRELATIVOS** (`DB.CORRELATIVOS`)
   ```javascript
   {
     BOLETA: { serie: 'B001', numero: 123 },
     FACTURA: { serie: 'F001', numero: 45 },
     NOTA_VENTA: { serie: 'N001', numero: 678 }
   }
   ```

---

## 🎨 SISTEMA DE DISEÑO - TEMA PURPLE

### **Paleta de Colores Principal:**
```css
:root {
  /* Purple Palette */
  --purple-50: #faf5ff;
  --purple-100: #f3e8ff;
  --purple-200: #e9d5ff;
  --purple-300: #d8b4fe;
  --purple-400: #c084fc;
  --purple-500: #a855f7;
  --purple-600: #9333ea;
  --purple-700: #7c3aed;  /* Color principal */
  --purple-800: #6b21a8;
  --purple-900: #581c87;

  /* Gray Palette */
  --gray-50: #fafafa;
  --gray-100: #f4f4f5;
  --gray-200: #e4e4e7;
  --gray-300: #d4d4d8;
  --gray-400: #a1a1aa;
  --gray-500: #71717a;
  --gray-600: #52525b;
  --gray-700: #3f3f46;
  --gray-800: #27272a;
  --gray-900: #18181b;
}
```

### **Colores Secundarios:**
- **Azul:** `#3b82f6` (Botones, enlaces, elementos activos)
- **Verde:** `#10b981` (Éxito, confirmaciones)
- **Rojo:** `#ef4444` (Errores, eliminaciones)
- **Amarillo:** `#f59e0b` (Advertencias)

### **Gradientes Comunes:**
```css
/* Gradiente Purple Principal */
background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);

/* Gradiente Blue Botones */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

/* Gradiente Green Éxito */
background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);

/* Gradiente Background */
background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
```

### **Animaciones CSS:**
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Zoom In */
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Slide In Down */
@keyframes slideInDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Slide In Up */
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Swing */
@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
```

---

## 🧩 MÓDULOS DEL SISTEMA

### **1. GESTIÓN DE CLIENTES**
**Ubicación:** Sección `clientes`
**Funciones principales:**
- `buscarClientes()` - Buscar por DNI, nombre, teléfono
- `renderClientes()` - Mostrar tabla de clientes
- `abrirModalCliente(cliente)` - Abrir modal de creación/edición
- `guardarCliente()` - Guardar cliente en LocalStorage
- `eliminarCliente(id)` - Eliminar cliente (con validación de ventas)
- `verRxClienteModal(clienteId)` - **NUEVO** Modal ultra moderno RX

**Campos del formulario:**
- Nombres, Apellidos
- DNI/Documento
- Teléfono, Email
- Dirección
- Fecha de Nacimiento
- Ocupación
- Observaciones

### **2. GESTIÓN DE VENTAS**
**Ubicación:** Sección `ventas`
**Funciones principales:**
- `usarCliente(id)` - Seleccionar cliente para venta
- `agregarItemVenta()` - Agregar producto/servicio a venta
- `calcularTotales()` - Calcular subtotal, descuentos, total
- `finalizarVenta()` - Generar documento y guardar
- `generarTicketVenta(venta)` - Imprimir ticket
- `verMedidaCliente()` - **ACTUALIZADO** Ver RX con modal moderno
- `nuevaMedidaCliente()` - Crear nueva prescripción

**Tipos de documentos:**
- BOLETA
- FACTURA
- NOTA DE VENTA

**Items de venta:**
- PRODUCTO (del inventario)
- SERVICIO (manual)
- PRESCRIPCIÓN RX (con datos de medidas)

### **3. PRESCRIPCIONES/MEDIDAS RX**
**Ubicación:** Ventana modal `prescripcionWindow`
**Funciones principales:**
- `abrirPrescripcion(clienteId, esNueva)` - Abrir formulario RX
- `guardarPrescripcion()` - Guardar medidas
- `renderHistorialRx()` - **MEJORADO** Tabla con animaciones
- `cargarRxHistorial(id)` - **ACTUALIZADO** Ver con modal moderno
- `imprimirPrescripcion()` - Imprimir formato A4
- `exportarPrescripcionExcel()` - Exportar a CSV

**Secciones del formulario:**
1. **Visión de Lejos** - OD/OI: ESF, CIL, EJE, AV, DIP, PRISMA, ADD
2. **Visión de Cerca** - OD/OI: ESF, CIL, EJE, AV, DIP, ALTURA
3. **Visión Intermedia** - OD/OI: ESF, CIL, EJE
4. **Lentes de Contacto** - K.H., K.V., CB, PODER, DIÁMETRO
5. **Otros** - Tipo lente, Material, Tratamiento
6. **Historial Clínico** - Síntomas, Antecedentes
7. **Oftalmología** - CIE-10, Tratamiento, Tonometría

### **4. MODAL DE VISUALIZACIÓN RX - ULTRA MODERNO** ✨
**Ubicación:** Modal `modalVisualizacionRX`
**Líneas CSS:** 952-1207
**Líneas JavaScript:** 18909-19348

**Funciones:**
- `verRxClienteModal(clienteId)` - Función principal
- `cerrarModalRX()` - Cerrar modal
- `imprimirRxActual()` - Imprimir en ventana nueva
- `editarRxActual()` - Abrir para edición

**Características:**
- ✅ Animación zoomIn espectacular
- ✅ Tablas con gradientes azules profesionales
- ✅ Detección automática de diagnósticos (Miopía, Hipermetropía, Astigmatismo, Presbicia)
- ✅ Sección de diagnóstico con badges verdes
- ✅ Scrollbar personalizado azul
- ✅ Botones con gradientes y efectos hover
- ✅ Compatible con DB.CONSULTAS_CLINICAS y DB.MEDIDAS

**Estructura HTML:**
```html
<div id="modalVisualizacionRX" class="modal-rx-overlay">
  <div class="modal-rx-container">
    <div class="modal-rx-header">
      <span class="modal-rx-icon">👓</span>
      <h2>PRESCRIPCIÓN DE LENTES</h2>
      <button onclick="cerrarModalRX()">✕</button>
    </div>
    <div class="modal-rx-content" id="modalRxContenido">
      <!-- Contenido dinámico generado por JavaScript -->
    </div>
    <div class="modal-rx-footer">
      <button onclick="cerrarModalRX()">🚪 Cerrar</button>
      <button onclick="imprimirRxActual()">🖨️ Imprimir RX</button>
      <button onclick="editarRxActual()">✏️ Editar</button>
    </div>
  </div>
</div>
```

### **5. CONSULTORIO/EXAMEN CLÍNICO**
**Ubicación:** Sección `consultorio`
**Funciones principales:**
- `buscarPacienteConsultorio()` - **MEJORADO** Búsqueda multi-campo
- `seleccionarPacienteConsultorio(idCliente)` - **MEJORADO** Con diseño moderno
- `limpiarBusquedaPaciente()` - **NUEVO** Cambiar paciente
- `guardarConsultaClinica()` - Guardar consulta completa
- `cargarHistorialConsultas()` - Mostrar historial
- `verDetalleConsulta(idConsulta)` - **MEJORADO** Modal ultra moderno

**Mejoras implementadas:**
- ✅ Búsqueda compatible con múltiples campos (documento/dni, nombres/nombre, apellidos/apellido)
- ✅ Resultados con diseño moderno (gradientes, hover effects)
- ✅ Confirmación visual al seleccionar paciente
- ✅ Botón "Cambiar Paciente" integrado
- ✅ Animaciones slideInDown

**Secciones del examen:**
1. **Datos del Paciente** - DNI, Nombre, Teléfono, Edad
2. **Motivo de Consulta**
3. **Medidas de Visión** - Lejos y Cerca
4. **Lentes de Contacto** - Marca, CB, Diámetro, Poder
5. **Otros Exámenes** - Queratometría, PIO, Biomicroscopía, Fondo de Ojo
6. **Historial Clínico** - Síntomas, Antecedentes, Examen
7. **Oftalmología** - CIE-10, Tratamiento, Diagnóstico

### **6. BÚSQUEDA DE VENTAS**
**Ubicación:** Sección `buscarVentas`
**Funciones principales:**
- `buscarVentas()` - Filtrar ventas
- `renderVentasTabla()` - Mostrar tabla paginada
- `verDetalleVenta(id)` - Mostrar detalle
- `exportarVentasExcel()` - Exportar a CSV
- `cambiarEstadoEntrega()` - Actualizar estado
- `anularVentasSeleccionadas()` - Eliminar ventas

**Filtros disponibles:**
- Por tipo: DNI, NOMBRE, NRO VENTA
- Por fechas: HOY, SEMANA, MES, RANGO
- Por estado pago: PAGADO, PENDIENTE
- Por estado entrega: ENTREGADO, PENDIENTE

### **7. PRODUCTOS/INVENTARIO**
**Ubicación:** Sección `productos`
**Funciones principales:**
- `buscarProductos()` - Filtrar productos
- `renderProductos()` - Mostrar tabla
- `abrirModalProducto(producto)` - Crear/Editar
- `guardarProducto()` - Guardar en inventario
- `eliminarProducto(id)` - Eliminar producto
- `corregirCodigosBarrasInventario()` - **NUEVO** Corrección masiva de códigos

**Categorías y Códigos:**
- **MONTURAS** → Prefijo: `MON` (MON001-MON015)
- **LUNAS/CRISTALES** → Prefijo: `LUN` (LUN001-LUN023)
- **LENTES DE CONTACTO** → Prefijo: `LC` (LC001-LC008)
- **ACCESORIOS** → Prefijo: `ACC` (ACC001-ACC014)
- **SERVICIOS** → Prefijo: `SRV` (SRV001-SRV010)

**Sistema de Códigos de Barras:**
Cada producto tiene tres identificadores:
1. `id` - Identificador único (ej: ACC001, LUN015, MON007)
2. `codigoBarras` - Código escaneable (igual al ID)
3. `codigoQR` - Código QR (igual al ID)

**Corrección Automática:**
La función `corregirCodigosBarrasInventario()` realiza:
- ✅ Detecta productos con códigos inválidos o timestamp
- ✅ Asigna códigos secuenciales por categoría
- ✅ Actualiza automáticamente `id`, `codigoBarras` y `codigoQR`
- ✅ Mantiene productos ya con códigos válidos
- ✅ Genera reporte detallado por categoría
- ✅ Modal informativo con estadísticas

### **8. REPORTES**
**Ubicación:** Sección `reportes`
**Tipos de reportes:**
- Ventas por período
- Productos más vendidos
- Clientes frecuentes
- Estado de caja
- Inventario bajo stock

---

## 🔧 FUNCIONES UTILITARIAS GLOBALES

### **LocalStorage Helpers:**
```javascript
// Guardar datos
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    memoryStorage[key] = data; // Fallback
  }
}

// Cargar datos
function load(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return memoryStorage[key] || [];
  }
}
```

### **Generadores de ID:**
```javascript
// Generar ID único con timestamp
function genId(prefix) {
  return prefix + '_' + Date.now();
}

// Ejemplos:
// CLI_1234567890123 (Cliente)
// VEN_1234567890123 (Venta)
// PROD_001 (Producto)
// RX_1234567890123 (Prescripción)
// CONS_1234567890123 (Consulta)
```

### **Formateo de Fechas:**
```javascript
// Fecha actual formato YYYY-MM-DD
function today() {
  return new Date().toISOString().split('T')[0];
}

// Formatear fecha a DD/MM/YYYY
function formatDate(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}
```

### **Sistema de Notificaciones (Toast):**
```javascript
function toast(mensaje, tipo = 'success') {
  // tipo: 'success', 'error', 'warning', 'info'
  const toastDiv = document.createElement('div');
  toastDiv.className = `toast toast-${tipo}`;
  toastDiv.textContent = mensaje;
  document.body.appendChild(toastDiv);

  setTimeout(() => toastDiv.remove(), 3000);
}

// Ejemplos:
toast('✅ Cliente guardado correctamente', 'success');
toast('❌ Error al guardar', 'error');
toast('⚠️ Campos incompletos', 'warning');
toast('ℹ️ Cargando datos...', 'info');
```

### **Navegación entre Secciones:**
```javascript
function mostrarSeccion(seccionId) {
  // Ocultar todas las secciones
  document.querySelectorAll('main > section').forEach(s => {
    s.style.display = 'none';
  });

  // Mostrar sección solicitada
  const seccion = document.getElementById(seccionId);
  if (seccion) {
    seccion.style.display = 'block';
  }

  // Actualizar botones del ribbon
  document.querySelectorAll('.ribbon-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-section="${seccionId}"]`)?.classList.add('active');
}
```

### **Exportación a CSV:**
```javascript
function descargarCSV(contenidoCSV, nombreArchivo) {
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.click();
}
```

---

## 🎯 PATRONES DE CÓDIGO IMPORTANTES

### **1. Compatibilidad de Nombres de Campos:**
```javascript
// SIEMPRE soportar múltiples variantes de nombres de campos
const nombres = cliente.nombres || cliente.nombre || '';
const apellidos = cliente.apellidos || cliente.apellido || '';
const documento = cliente.documento || cliente.dni || '';
const fechaNac = cliente.fechaNacimiento || cliente.fechaNac || '';

const nombreCompleto = (nombres + ' ' + apellidos).trim();
```

### **2. Validación de Elementos DOM:**
```javascript
// SIEMPRE validar que el elemento existe antes de usarlo
const elemento = document.getElementById('miElemento');
if (elemento) {
  elemento.value = 'Nuevo valor';
} else {
  console.error('Elemento no encontrado');
}
```

### **3. Manejo de Errores en LocalStorage:**
```javascript
function guardarDatos(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    toast('✅ Datos guardados', 'success');
  } catch (e) {
    console.error('Error al guardar:', e);
    toast('❌ Error al guardar datos', 'error');
    // Fallback a memoria
    memoryStorage[key] = data;
  }
}
```

### **4. Búsqueda Case-Insensitive:**
```javascript
function buscar() {
  const termino = inputBusqueda.value.trim().toLowerCase();

  const resultados = datos.filter(item => {
    const nombre = (item.nombre || '').toLowerCase();
    const dni = (item.dni || '').toLowerCase();

    return nombre.includes(termino) || dni.includes(termino);
  });
}
```

### **5. Renderizado Dinámico con Animaciones:**
```javascript
function renderLista(items) {
  const html = items.map((item, index) => `
    <div style="animation: fadeInUp 0.3s ease ${index * 0.05}s backwards;">
      ${item.nombre}
    </div>
  `).join('');

  contenedor.innerHTML = html;
}
```

---

## 🚀 FUNCIONES CLAVE ACTUALIZADAS (ÚLTIMA SESIÓN)

### **1. verRxClienteModal(clienteId)** - NUEVA ✨
**Ubicación:** ~Línea 18915
**Propósito:** Visualizar prescripción RX en modal ultra moderno
**Características:**
- Busca datos en DB.CONSULTAS_CLINICAS y DB.MEDIDAS
- Genera tablas dinámicas (DISTANCIA, CERCA, LC)
- Detecta diagnósticos automáticamente
- Animación zoomIn espectacular
- Compatible con múltiples formatos de datos

### **2. buscarPacienteConsultorio()** - MEJORADA
**Ubicación:** ~Línea 18278
**Cambios:**
- ✅ Búsqueda multi-campo (documento/dni, nombres/nombre, apellidos/apellido)
- ✅ Diseño moderno con gradientes
- ✅ Animaciones en resultados
- ✅ Mensaje mejorado si no hay resultados

### **3. seleccionarPacienteConsultorio(idCliente)** - MEJORADA
**Ubicación:** ~Línea 18357
**Cambios:**
- ✅ Soporte para múltiples nombres de campos
- ✅ Confirmación visual con gradiente verde
- ✅ Botón "Cambiar Paciente" integrado
- ✅ Validación de elementos DOM

### **4. cargarRxHistorial(id)** - ACTUALIZADA
**Ubicación:** ~Línea 9736
**Cambios:**
- ✅ Ahora abre modal moderno en lugar de formulario
- ✅ Cierra automáticamente ventana de prescripción
- ✅ Modo lectura vs edición

### **5. renderHistorialRx()** - MEJORADA
**Ubicación:** ~Línea 9703
**Cambios:**
- ✅ Animación fadeInUp escalonada
- ✅ Botones con gradientes y hover effects
- ✅ Badges de colores para tipo de RX
- ✅ Código resaltado en azul

### **6. borrarPrescripcionHistorial(id)** - MEJORADA
**Ubicación:** ~Línea 9776
**Cambios:**
- ✅ Confirmación detallada con código y fecha
- ✅ Validación previa
- ✅ Console.log para debugging

---

## 📝 GUÍA DE ESTILO DE CÓDIGO

### **Nomenclatura:**
```javascript
// Variables: camelCase
let nombreCliente = 'Juan';
let totalVenta = 150.50;

// Constantes: UPPER_SNAKE_CASE
const MAX_ITEMS = 100;
const DB_KEY = 'clientes';

// Funciones: camelCase
function calcularTotal() { }
function guardarCliente() { }

// IDs de elementos: kebab-case
<div id="modal-cliente"></div>
<input id="input-busqueda">

// Clases CSS: kebab-case
.btn-primary { }
.modal-overlay { }
```

### **Comentarios:**
```javascript
// Comentario de una línea para explicaciones breves

/*
 * Comentario de bloque para:
 * - Explicaciones largas
 * - Documentación de funciones
 * - TODOs importantes
 */

/* ============================================
   SECCIÓN IMPORTANTE DEL CÓDIGO
   ============================================ */
```

### **Estructura de Funciones:**
```javascript
function nombreFuncion(parametro1, parametro2) {
  // 1. Validaciones
  if (!parametro1) {
    toast('❌ Parámetro requerido', 'error');
    return;
  }

  // 2. Obtener datos
  const datos = load(DB.CLIENTES);

  // 3. Procesamiento
  const resultado = datos.filter(/* ... */);

  // 4. Actualizar UI
  renderResultados(resultado);

  // 5. Feedback al usuario
  toast('✅ Operación exitosa', 'success');
}
```

---

## 🔍 DEBUGGING Y TROUBLESHOOTING

### **Console Logs Estratégicos:**
```javascript
// Al inicio de función importante
console.log('👓 Abriendo visualización RX para cliente:', clienteId);

// Después de obtener datos
console.log('📋 Total clientes en DB:', clientes.length);

// En resultados de búsqueda
console.log('🔍 Resultados encontrados:', resultados.length);

// Al guardar
console.log('✅ Paciente autocompletado:', { nombres, apellidos, documento });

// En errores
console.error('❌ Error al cargar datos:', error);
```

### **Verificación de LocalStorage:**
```javascript
// En consola del navegador:
localStorage.getItem('optica_dos_de_mayo_clientes')
JSON.parse(localStorage.getItem('optica_dos_de_mayo_clientes'))

// Ver todas las claves
Object.keys(localStorage)

// Limpiar todo (CUIDADO!)
localStorage.clear()
```

### **Errores Comunes y Soluciones:**

1. **"Cannot read property 'value' of null"**
   - Problema: Elemento no existe en el DOM
   - Solución: Verificar ID y validar antes de usar

2. **"Unexpected token in JSON"**
   - Problema: Datos corruptos en LocalStorage
   - Solución: `localStorage.removeItem(key)` y reiniciar

3. **"Cliente no encontrado"**
   - Problema: ID incorrecto o datos en otra base
   - Solución: Verificar establecimientoActual y prefijo DB

4. **Campos no se autocompletan**
   - Problema: Nombres de campos no coinciden
   - Solución: Usar patrón `campo1 || campo2 || ''`

---

## 🎓 GUÍA PARA CONTINUAR EL DESARROLLO

### **Para Agregar un Nuevo Módulo:**

1. **Agregar botón en Ribbon:**
```html
<button class="ribbon-btn" data-section="nuevo-modulo">
  <span class="ribbon-icon">🆕</span>
  <span>Nuevo Módulo</span>
</button>
```

2. **Crear sección en <main>:**
```html
<section id="nuevo-modulo" style="display: none;">
  <h2>Nuevo Módulo</h2>
  <!-- Contenido del módulo -->
</section>
```

3. **Agregar estilos en <style>:**
```css
#nuevo-modulo {
  padding: 20px;
  background: white;
  border-radius: 12px;
}
```

4. **Crear funciones JavaScript:**
```javascript
function inicializarNuevoModulo() {
  console.log('✅ Nuevo módulo inicializado');
}

function guardarDatosNuevoModulo() {
  const datos = {
    id: genId('NM'),
    fecha: today(),
    // ... más campos
  };

  const lista = load('nuevo_modulo_lista');
  lista.push(datos);
  save('nuevo_modulo_lista', lista);

  toast('✅ Datos guardados', 'success');
}
```

### **Para Crear un Modal Moderno:**

1. **HTML del Modal:**
```html
<div id="miModalNuevo" class="modal-overlay" style="display: none;">
  <div class="modal-container">
    <div class="modal-header">
      <h2>Título del Modal</h2>
      <button onclick="cerrarMiModal()">✕</button>
    </div>
    <div class="modal-content" id="miModalContenido">
      <!-- Contenido dinámico -->
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="cerrarMiModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="guardarMiModal()">Guardar</button>
    </div>
  </div>
</div>
```

2. **CSS del Modal:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 24px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-content {
  padding: 24px;
  max-height: calc(90vh - 160px);
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

3. **JavaScript del Modal:**
```javascript
function abrirMiModal(datos) {
  // Poblar contenido
  document.getElementById('miModalContenido').innerHTML = `
    <h3>${datos.titulo}</h3>
    <p>${datos.descripcion}</p>
  `;

  // Mostrar modal
  document.getElementById('miModalNuevo').style.display = 'flex';
}

function cerrarMiModal() {
  document.getElementById('miModalNuevo').style.display = 'none';
}

function guardarMiModal() {
  // Lógica de guardado
  toast('✅ Guardado correctamente', 'success');
  cerrarMiModal();
}
```

### **Para Agregar una Tabla con Animaciones:**

```javascript
function renderTablaConAnimaciones(items) {
  const tbody = document.getElementById('miTabla');

  tbody.innerHTML = items.map((item, index) => `
    <tr style="animation: fadeInUp 0.3s ease ${index * 0.05}s backwards;">
      <td style="font-weight: 700; color: #3b82f6;">${item.codigo}</td>
      <td>${item.nombre}</td>
      <td>
        <button class="btn btn-info btn-sm" onclick="verItem('${item.id}')"
                style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3); transition: all 0.2s;"
                onmouseover="this.style.transform='translateY(-2px)';"
                onmouseout="this.style.transform='translateY(0)';">
          👁️ Ver
        </button>
        <button class="btn btn-danger btn-sm" onclick="eliminarItem('${item.id}')"
                style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); transition: all 0.2s;"
                onmouseover="this.style.transform='translateY(-2px)';"
                onmouseout="this.style.transform='translateY(0)';">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}
```

---

## 🌟 MEJORES PRÁCTICAS

### **DO ✅**
1. Siempre usar `toast()` para feedback al usuario
2. Validar elementos DOM antes de usarlos
3. Soportar múltiples nombres de campos (compatibilidad)
4. Usar animaciones CSS para mejor UX
5. Comentar código complejo
6. Console.log en funciones importantes
7. Usar try-catch en operaciones LocalStorage
8. Formatear fechas consistentemente
9. Generar IDs únicos con timestamp
10. Cerrar modales al guardar

### **DON'T ❌**
1. No usar `alert()` - usar `toast()` en su lugar
2. No asumir que un elemento existe - validar primero
3. No hardcodear nombres de campos - usar variables
4. No mezclar español e inglés en código
5. No eliminar datos sin confirmación
6. No olvidar actualizar UI después de guardar
7. No usar jQuery (el sistema es Vanilla JS)
8. No crear archivos externos (TODO en un archivo)
9. No usar `var` - usar `let` o `const`
10. No olvidar limpiar formularios después de guardar

---

## 📞 INFORMACIÓN DE CONTACTO Y CRÉDITOS

**Desarrollado por:** Equipo de Desarrollo Centro Óptico Sicuani
**Asistente IA:** Claude Sonnet 4.5 (Anthropic)
**Fecha de Creación:** Diciembre 2025
**Versión Actual:** 5.0 Purple Edition

---

## 🔄 HISTORIAL DE CAMBIOS (ÚLTIMA SESIÓN)

### **31 Diciembre 2025 - Sistema de Corrección de Códigos de Barras**

#### **Nuevas Funciones:**
- ✨ `corregirCodigosBarrasInventario()` - **NUEVA FUNCIÓN PRINCIPAL**
  - Corrige automáticamente TODOS los códigos de barras del inventario
  - Asigna códigos válidos según categoría:
    - ACCESORIOS → ACC### (ACC001, ACC002, ...)
    - LENTES DE CONTACTO → LC### (LC001, LC002, ...)
    - LUNAS/CRISTALES → LUN### (LUN001, LUN002, ...)
    - MONTURAS → MON### (MON001, MON002, ...)
    - SERVICIOS → SRV### (SRV001, SRV002, ...)
  - Ubicación: ~Línea 15688
  - Modal de confirmación con estadísticas detalladas
  - Console.log detallado de cada corrección
  - Compatible con función de generación de etiquetas

#### **Interfaz:**
- 🔘 Botón "🔧 Corregir Códigos" en módulo Inventario
- Ubicación: Barra de acciones principal (línea ~7811)
- Gradiente naranja distintivo (#f59e0b)
- Efectos hover y tooltip informativo

### **Diciembre 2025 - Actualización Mayor (Anterior)**

#### **Funciones Previas:**
- ✨ `verRxClienteModal(clienteId)` - Modal ultra moderno RX
- ✨ `cerrarModalRX()` - Cerrar modal RX
- ✨ `imprimirRxActual()` - Imprimir desde modal
- ✨ `editarRxActual()` - Editar desde modal
- ✨ `limpiarBusquedaPaciente()` - Cambiar paciente en consultorio

#### **Funciones Mejoradas:**
- 🔧 `buscarPacienteConsultorio()` - Multi-campo, diseño moderno
- 🔧 `seleccionarPacienteConsultorio()` - Compatibilidad, validación
- 🔧 `cargarRxHistorial()` - Usar modal en lugar de formulario
- 🔧 `renderHistorialRx()` - Animaciones, gradientes, hover
- 🔧 `borrarPrescripcionHistorial()` - Confirmación detallada
- 🔧 `verMedidaCliente()` - Usar modal moderno
- 🔧 `verPrescripcionCliente()` - Usar modal moderno
- 🔧 `nuevaMedidaCliente()` - Mensajes mejorados

#### **Nuevos Estilos CSS:**
- 💎 `.modal-rx-overlay` - Overlay con blur
- 💎 `.modal-rx-container` - Container con zoomIn
- 💎 `.modal-rx-header` - Header con gradiente azul
- 💎 `.modal-rx-icon` - Ícono con swing
- 💎 `.rx-data-table` - Tabla profesional
- 💎 `.rx-diagnostico-box` - Caja verde diagnóstico
- 💎 Múltiples animaciones y efectos hover

#### **Correcciones de Bugs:**
- 🐛 Búsqueda de pacientes no encontraba clientes (campos dni/documento)
- 🐛 Botón "Ver RX" abría formulario de edición (ahora modal)
- 🐛 Sin validación de elementos DOM
- 🐛 Confirmación de eliminación genérica

---

## 🎯 ESTADO ACTUAL DEL PROYECTO

### **Completado ✅**
- Sistema de gestión de clientes
- Sistema de ventas con documentos
- Gestión de productos/inventario
- Prescripciones RX completas
- Consultorio/Examen clínico
- Modal ultra moderno de visualización RX
- Búsqueda avanzada de pacientes
- Historial con animaciones
- Impresión de documentos
- Exportación a CSV/Excel
- Sistema multi-establecimiento
- Diseño Purple moderno

### **Pendiente o Mejoras Futuras 🔄**
- Sistema de recordatorios automáticos
- Integración con SUNAT para facturación electrónica
- Reportes gráficos con charts
- Backup automático a servidor
- App móvil nativa
- Sistema de citas online
- Integración con WhatsApp
- Dashboard analytics avanzado
- Sistema de roles y permisos
- Auditoria de cambios

---

## 💡 TIPS PARA OTROS AGENTES IA

### **Al Recibir este Proyecto:**

1. **Lee primero:** Estructura de DB, Módulos principales
2. **Localiza:** Función que necesitas modificar
3. **Verifica:** Compatibilidad con nombres de campos
4. **Prueba:** En navegador antes de confirmar
5. **Documenta:** Cambios realizados

### **Al Modificar Código:**

1. **Nunca romper:** Funcionalidad existente
2. **Siempre validar:** Elementos DOM
3. **Usar patrón:** `campo1 || campo2 || ''`
4. **Agregar console.log:** Para debugging
5. **Mantener estilo:** Consistencia visual
6. **Probar en navegador:** Antes de entregar

### **Al Crear Nuevas Funciones:**

1. **Seguir convenciones:** Nombres, estructura
2. **Agregar comentarios:** Explicar qué hace
3. **Usar toast():** Para feedback
4. **Validar datos:** Antes de guardar
5. **Actualizar UI:** Después de cambios
6. **Manejar errores:** Try-catch en LocalStorage

### **Ubicaciones Clave para Editar:**

```
Ribbon (Líneas 57-145): Agregar nuevos botones
Header (Líneas 148-182): Modificar título
Main (Líneas 183-10216): Agregar secciones
CSS (Líneas 20-10216): Agregar estilos
JavaScript (Líneas 10217-28687): Lógica y funciones
Modales (Buscar "modal-overlay"): Crear/editar modales
```

---

## 📚 RECURSOS ADICIONALES

### **Librerías Usadas:**
- **PDF.js** (CDN): Lectura de archivos PDF
  - URL: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js
  - Worker: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js

### **APIs del Navegador:**
- LocalStorage (Persistencia)
- Window.print() (Impresión)
- Blob API (Exportación archivos)
- Date API (Manejo de fechas)

### **Herramientas Recomendadas:**
- Chrome DevTools (Debugging)
- VS Code (Edición)
- JSON Formatter (Visualizar datos)
- Color Picker (Diseño)

---

## ✅ CHECKLIST PARA NUEVAS FEATURES

Antes de agregar una nueva funcionalidad, verifica:

- [ ] ¿Necesitas nueva colección en LocalStorage?
- [ ] ¿Requiere nuevo botón en Ribbon?
- [ ] ¿Necesita nueva sección en <main>?
- [ ] ¿Usa modal o ventana?
- [ ] ¿Qué animaciones CSS necesita?
- [ ] ¿Validación de formularios?
- [ ] ¿Toast de confirmación/error?
- [ ] ¿Actualización de UI después de guardar?
- [ ] ¿Manejo de errores implementado?
- [ ] ¿Comentarios en código agregados?
- [ ] ¿Console.logs para debugging?
- [ ] ¿Probado en navegador?

---

## 🎓 CONCLUSIÓN

Este manual contiene TODA la información necesaria para continuar el desarrollo del proyecto. El sistema está construido como una Single-Page Application completamente funcional en UN SOLO ARCHIVO HTML.

**Principios clave:**
- ✅ TODO en un archivo
- ✅ LocalStorage como base de datos
- ✅ Diseño moderno y responsivo
- ✅ Animaciones fluidas
- ✅ Compatibilidad multi-campo
- ✅ Validación constante
- ✅ Feedback visual continuo

**Para cualquier duda:**
- Consulta este manual
- Busca en el código ejemplos similares
- Usa console.log para debugging
- Prueba en navegador antes de confirmar

---

**¡Buena suerte con el desarrollo! 🚀✨**

---

_Documento generado el 29 de Diciembre de 2025_
_Versión: 1.0_
_Archivo: Revision0008.html_
_Total Líneas: 28,687_

# 🤖 GUÍA RÁPIDA PARA AGENTES IA - CENTRO ÓPTICO SICUANI

## ⚡ INFORMACIÓN ESENCIAL

**Archivo:** `Revision0008.html` (28,687 líneas)
**Tipo:** Single-Page Application - TODO EN UN SOLO ARCHIVO HTML
**Base de Datos:** LocalStorage del navegador
**Establecimiento Actual:** DOS_DE_MAYO o PLAZA_DE_ARMAS

---

## 🎯 LO MÁS IMPORTANTE

### **1. TODO ESTÁ EN UN ARCHIVO**
```
Revision0008.html
├── HTML (estructura)
├── CSS (líneas 20-10,216)
└── JavaScript (líneas 10,217-28,687)
```

### **2. BASE DE DATOS - LocalStorage**
```javascript
// Claves dinámicas con prefijo
DB.CLIENTES = 'optica_dos_de_mayo_clientes'
DB.VENTAS = 'optica_dos_de_mayo_ventas'
DB.MEDIDAS = 'optica_dos_de_mayo_medidas'
DB.CONSULTAS_CLINICAS = 'optica_dos_de_mayo_consultas_clinicas'

// Funciones
save(DB.CLIENTES, arrayClientes);  // Guardar
const clientes = load(DB.CLIENTES); // Cargar
```

### **3. PATRÓN CRÍTICO - Compatibilidad de Campos**
```javascript
// SIEMPRE usar este patrón para nombres de campos
const nombres = cliente.nombres || cliente.nombre || '';
const apellidos = cliente.apellidos || cliente.apellido || '';
const documento = cliente.documento || cliente.dni || '';
const fechaNac = cliente.fechaNacimiento || cliente.fechaNac || '';
const nombreCompleto = (nombres + ' ' + apellidos).trim();
```

---

## 🔧 FUNCIONES CLAVE ACTUALIZADAS

### **MODAL RX ULTRA MODERNO (NUEVO)** ✨
**Líneas:** 18909-19348 (JavaScript), 952-1207 (CSS)
```javascript
// Abrir modal moderno
verRxClienteModal(clienteId);

// Cerrar modal
cerrarModalRX();

// Imprimir desde modal
imprimirRxActual();

// Editar
editarRxActual();
```

**Características:**
- Animación zoomIn
- Tablas con gradientes azules
- Detección automática de diagnósticos
- Compatible con DB.CONSULTAS_CLINICAS y DB.MEDIDAS

### **BÚSQUEDA DE PACIENTES (MEJORADA)**
**Línea:** ~18278
```javascript
buscarPacienteConsultorio();
// - Búsqueda multi-campo (documento/dni, nombres/nombre, apellidos/apellido)
// - Diseño moderno con gradientes
// - Animaciones en resultados
```

### **HISTORIAL RX (MEJORADO)**
**Línea:** ~9703
```javascript
renderHistorialRx();
// - Animación fadeInUp escalonada
// - Botones con gradientes
// - Badges de colores
```

---

## 📋 ESTRUCTURA DE DATOS

### **Cliente:**
```javascript
{
  id: 'CLI_1234567890123',
  nombres: 'Juan',           // o 'nombre'
  apellidos: 'Pérez',        // o 'apellido'
  documento: '12345678',     // o 'dni'
  telefono: '987654321',
  fechaNacimiento: '1990-05-15', // o 'fechaNac'
  ocupacion: 'Ingeniero',
  estado: 'H'                // H=Habilitado
}
```

### **Prescripción RX:**
```javascript
{
  id: 'RX_1234567890123',
  clienteId: 'CLI_XXX',
  fecha: '2025-01-15',

  // Visión Lejos
  lejosOdEsf: '-2.00',
  lejosOdCil: '-0.75',
  lejosOdEje: '180',
  lejosDip: '62',
  lejosOiEsf: '-1.75',
  // ... más campos

  // Visión Cerca
  cercaOdEsf: '-1.50',
  // ... más campos

  // Lentes Contacto
  lcOdH: '8.6',
  lcOdPoder: '-2.00',
  // ... más campos
}
```

### **Consulta Clínica:**
```javascript
{
  id: 'CONS_1234567890123',
  idCliente: 'CLI_XXX',
  nombreCliente: 'Juan Pérez',
  fecha: '2025-01-15',
  motivo: 'Control',

  // Medidas (prefijo 'med')
  medLejosEsfOD: '-2.00',
  medLejosCilOD: '-0.75',
  // ... más campos

  // Otros exámenes
  otrosPIOOD: '15 mmHg',
  // ... más campos

  // Oftalmología
  oftCie10: 'H52.1',
  oftDiagnostico: 'Miopía'
}
```

---

## 🎨 DISEÑO - TEMA PURPLE

### **Colores Principales:**
```css
--purple-700: #7c3aed;  /* Principal */
--purple-600: #9333ea;
--blue-500: #3b82f6;    /* Botones/Enlaces */
--green-500: #10b981;   /* Éxito */
--red-500: #ef4444;     /* Errores */
```

### **Gradientes Comunes:**
```css
/* Botón Ver RX */
background: linear-gradient(135deg, #3b82f6, #2563eb);

/* Botón Eliminar */
background: linear-gradient(135deg, #ef4444, #dc2626);

/* Confirmación Verde */
background: linear-gradient(135deg, #d1fae5, #a7f3d0);
```

### **Animaciones:**
```css
animation: fadeIn 0.3s ease;
animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
animation: slideInDown 0.4s ease;
animation: fadeInUp 0.3s ease ${index * 0.05}s backwards;
animation: pulse 2s infinite;
animation: swing 3s infinite;
```

---

## 🚨 REGLAS CRÍTICAS

### **DO ✅**
1. **SIEMPRE** validar elementos DOM antes de usar
2. **SIEMPRE** soportar múltiples nombres de campos
3. **SIEMPRE** usar `toast()` para feedback
4. **SIEMPRE** usar try-catch en LocalStorage
5. **SIEMPRE** agregar console.log en funciones importantes
6. **SIEMPRE** usar animaciones CSS para mejor UX

### **DON'T ❌**
1. **NUNCA** asumir que un elemento existe
2. **NUNCA** usar `alert()` - usar `toast()`
3. **NUNCA** hardcodear nombres de campos
4. **NUNCA** eliminar sin confirmación
5. **NUNCA** usar jQuery (sistema es Vanilla JS)
6. **NUNCA** crear archivos externos

---

## 🔨 PATRONES DE CÓDIGO

### **Validación de Elementos:**
```javascript
const elemento = document.getElementById('miElemento');
if (elemento) {
  elemento.value = 'Nuevo valor';
} else {
  console.error('Elemento no encontrado');
}
```

### **Guardar en LocalStorage:**
```javascript
try {
  save(DB.CLIENTES, arrayClientes);
  toast('✅ Guardado correctamente', 'success');
} catch (e) {
  console.error('Error:', e);
  toast('❌ Error al guardar', 'error');
}
```

### **Renderizar con Animaciones:**
```javascript
tbody.innerHTML = items.map((item, index) => `
  <tr style="animation: fadeInUp 0.3s ease ${index * 0.05}s backwards;">
    <td>${item.nombre}</td>
  </tr>
`).join('');
```

### **Modal Moderno:**
```javascript
function abrirModal(datos) {
  document.getElementById('modalContenido').innerHTML = `
    <h3>${datos.titulo}</h3>
  `;
  document.getElementById('miModal').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('miModal').style.display = 'none';
}
```

---

## 📍 UBICACIONES IMPORTANTES

### **Ribbon (Menú Superior):**
Líneas: 57-145
- Agregar nuevos botones aquí

### **Secciones Principales:**
```
#clientes - Gestión de clientes
#ventas - Punto de venta
#productos - Inventario
#consultorio - Examen clínico
#buscarVentas - Búsqueda de ventas
```

### **Modales Principales:**
```
#modalCliente - CRUD clientes
#modalVisualizacionRX - Ver RX (NUEVO)
#modalHistorialConsulta - Ver consulta
#prescripcionWindow - Editar RX
```

### **JavaScript Funciones:**
```
Línea ~10217: Inicio JavaScript
Línea ~18278: buscarPacienteConsultorio
Línea ~18357: seleccionarPacienteConsultorio
Línea ~18915: verRxClienteModal (NUEVO)
Línea ~9703: renderHistorialRx
Línea ~9736: cargarRxHistorial
```

---

## 🎯 TAREAS COMUNES

### **1. Agregar Nuevo Campo a Cliente:**
```javascript
// En guardarCliente():
const cliente = {
  id: genId('CLI'),
  nombres: document.getElementById('nombre').value,
  apellidos: document.getElementById('apellidos').value,
  documento: document.getElementById('documento').value,
  // NUEVO CAMPO AQUÍ
  nuevoCAMPO: document.getElementById('nuevoCampo').value,
  fechaCreacion: new Date().toISOString()
};
```

### **2. Crear Nuevo Modal:**
```html
<!-- HTML -->
<div id="miNuevoModal" class="modal-overlay" style="display: none;">
  <div class="modal-container">
    <div class="modal-header">
      <h2>Título</h2>
      <button onclick="cerrarMiModal()">✕</button>
    </div>
    <div class="modal-content" id="miContenido"></div>
  </div>
</div>
```

```javascript
// JavaScript
function abrirMiModal(datos) {
  document.getElementById('miContenido').innerHTML = `...`;
  document.getElementById('miNuevoModal').style.display = 'flex';
}
```

### **3. Agregar Botón en Tabla:**
```javascript
<button class="btn btn-info btn-sm" onclick="miFuncion('${item.id}')"
        style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
  👁️ Ver
</button>
```

---

## 🐛 DEBUGGING RÁPIDO

### **Ver datos en consola:**
```javascript
console.log('Clientes:', load(DB.CLIENTES));
console.log('Ventas:', load(DB.VENTAS));
console.log('Medidas:', load(DB.MEDIDAS));
```

### **Ver LocalStorage completo:**
```javascript
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});
```

### **Limpiar datos (CUIDADO!):**
```javascript
localStorage.removeItem('optica_dos_de_mayo_clientes');
// O todo:
localStorage.clear();
```

---

## 🚀 COMENZAR A TRABAJAR

### **Paso 1: Localizar la función**
Busca en el archivo usando Ctrl+F:
- Por nombre de función
- Por ID de elemento
- Por texto visible

### **Paso 2: Entender el contexto**
- ¿Qué datos usa?
- ¿Qué elementos DOM necesita?
- ¿Qué base de datos lee/escribe?

### **Paso 3: Hacer cambios**
- Seguir patrones existentes
- Validar elementos DOM
- Agregar console.log
- Usar toast() para feedback

### **Paso 4: Probar**
- Abrir en navegador
- Probar flujo completo
- Ver consola por errores
- Verificar LocalStorage

---

## 📊 ESTADÍSTICAS DEL PROYECTO

- **Total Líneas:** 28,687
- **CSS:** ~10,196 líneas
- **JavaScript:** ~18,470 líneas
- **Funciones principales:** ~150+
- **Modales:** 10+
- **Secciones:** 15+
- **Colecciones DB:** 13

---

## 💬 MENSAJE PARA AGENTES IA

Este proyecto es un **sistema completo en un solo archivo**. Todo el código está embebido en `Revision0008.html`.

**Principios fundamentales:**
1. TODO en un archivo - no crear archivos externos
2. LocalStorage como base de datos
3. Validar SIEMPRE elementos DOM
4. Soportar múltiples nombres de campos
5. Usar animaciones CSS
6. Feedback visual constante con toast()

**Antes de modificar:**
- Lee la función completa
- Entiende qué datos usa
- Verifica compatibilidad de campos
- Prueba en navegador

**Cuando tengas dudas:**
- Busca ejemplos similares en el código
- Usa console.log para debugging
- Revisa MANUAL_TECNICO_PROYECTO.md completo

---

**¡Éxito en el desarrollo! 🚀**

_Guía rápida v1.0 - Diciembre 2025_

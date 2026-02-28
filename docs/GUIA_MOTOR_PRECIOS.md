# 🏆 MOTOR DE PRECIOS INTELIGENTE V2.0 - GUÍA DE USO

## ✅ ESTADO: INTEGRADO Y FUNCIONANDO

El Motor de Precios Inteligente V2.0 está **completamente integrado** en `Revision0009_FullSystem.html` y funcionando correctamente.

---

## 📊 VERIFICACIÓN EXITOSA

**Test Realizado:**
```javascript
calcularPrecioLunas(-3.00, -0.50, 'POLY_BLUE')
```

**Resultado:**
- ✅ Material: Poly Blue
- ✅ Serie: SERIE_2 (Graduación media)
- ✅ Precio: S/ 135 (Unidad) / S/ 270 (Par)
- ✅ Stock: Disponible de inmediato

---

## 🎯 FUNCIONES DISPONIBLES

### 1. `calcularPrecioLunas(esfera, cilindro, material)`
Calcula automáticamente la serie y el precio basándose en la graduación.

**Parámetros:**
- `esfera` (number): Valor de esfera del paciente (ej: -3.00)
- `cilindro` (number): Valor de cilindro del paciente (ej: -0.50)
- `material` (string): 'BLUE', 'POLY_BLUE', o 'DIPPING'

**Retorna:**
```javascript
{
  serie: 'SERIE_2',
  serieLabel: 'Serie 2 (Media)',
  material: 'POLY_BLUE',
  materialNombre: 'Poly Blue',
  materialNombreCorto: 'Poly Blue',
  materialIcono: '💎',
  precio: 135,
  precioPar: 270,
  enStock: true,
  tiempoEntrega: 'Inmediata',
  // ... más propiedades
}
```

**Ejemplo de uso:**
```javascript
const esfera = -3.00;
const cilindro = -0.50;
const material = 'POLY_BLUE';

const resultado = calcularPrecioLunas(esfera, cilindro, material);
console.log(`Precio: S/ ${resultado.precio}`);
console.log(`Serie: ${resultado.serieLabel}`);
console.log(`Stock: ${resultado.enStock ? 'Disponible' : 'Fabricación'}`);
```

---

### 2. `generarTarjetasSeleccionMaterialV2(esfera, cilindro, callbackName)`
Genera HTML con las tarjetas comparativas de materiales (BUENO, MEJOR, ÓPTIMO).

**Parámetros:**
- `esfera` (number): Valor de esfera del paciente
- `cilindro` (number): Valor de cilindro del paciente
- `callbackName` (string): Nombre de la función callback al seleccionar

**Retorna:** String con HTML completo de las tarjetas

**Ejemplo de uso:**
```javascript
// 1. Definir función callback
function seleccionarMaterialLuna(material, precio, precioPar) {
  console.log(`Material seleccionado: ${material}`);
  console.log(`Precio unidad: S/ ${precio}`);
  console.log(`Precio par: S/ ${precioPar}`);
  
  // Aquí agregas la luna al carrito de venta
  agregarLunaAlCarrito(material, precio, precioPar);
}

// 2. Generar tarjetas
const esfera = -3.00;
const cilindro = -0.50;
const html = generarTarjetasSeleccionMaterialV2(esfera, cilindro, 'seleccionarMaterialLuna');

// 3. Mostrar en el DOM
document.getElementById('contenedorTarjetas').innerHTML = html;
```

---

### 3. `obtenerEsferaMayor(odEsf, oiEsf)`
Obtiene el mayor valor de esfera entre OD y OI (en valor absoluto).

**Ejemplo:**
```javascript
const esferaMayor = obtenerEsferaMayor(-3.00, -2.50);
// Retorna: -3.00
```

---

### 4. `obtenerCilindroMayor(odCil, oiCil)`
Obtiene el mayor valor de cilindro entre OD y OI (en valor absoluto).

**Ejemplo:**
```javascript
const cilindroMayor = obtenerCilindroMayor(-0.75, -0.50);
// Retorna: -0.75
```

---

### 5. `calcularTodasLasOpcionesLunas(esfera, cilindro)`
Calcula precios para todos los materiales disponibles.

**Retorna:** Array con 3 objetos (Blue, Poly Blue, Dipping)

**Ejemplo:**
```javascript
const opciones = calcularTodasLasOpcionesLunas(-3.00, -0.50);
opciones.forEach(opcion => {
  console.log(`${opcion.materialNombre}: S/ ${opcion.precio}`);
});
```

---

### 6. `obtenerRecomendacionInteligenteLunas(esfera, cilindro, perfil)`
Obtiene recomendación IA basada en el perfil del paciente.

**Parámetros:**
- `perfil` (object): { edad, presupuesto, uso, actividad }

**Ejemplo:**
```javascript
const perfil = {
  edad: 35,
  presupuesto: 'MEDIO', // 'BAJO', 'MEDIO', 'ALTO'
  uso: 'GENERAL', // 'GENERAL', 'OFICINA', 'DEPORTES', 'CONDUCCION'
  actividad: 'NORMAL' // 'NORMAL', 'DEPORTIVA', 'SEDENTARIA'
};

const recomendacion = obtenerRecomendacionInteligenteLunas(-3.00, -0.50, perfil);
console.log(`Recomendado: ${recomendacion.materialNombre}`);
console.log(`Razón: ${recomendacion.razon}`);
console.log(`Confianza: ${recomendacion.confianza}%`);
```

---

### 7. `calcularAhorroComparativoLunas(esfera, cilindro, materialSeleccionado)`
Calcula el ahorro comparando con otras opciones.

**Ejemplo:**
```javascript
const ahorro = calcularAhorroComparativoLunas(-3.00, -0.50, 'BLUE');
console.log(`Ahorras: S/ ${ahorro.ahorro} (${ahorro.porcentajeAhorro}%)`);
```

---

## 💡 EJEMPLO COMPLETO DE INTEGRACIÓN EN WIZARD

```javascript
// ═══════════════════════════════════════════════════════════════
// EJEMPLO: Integración en Wizard de Lunas
// ═══════════════════════════════════════════════════════════════

function abrirWizardLunas(clienteId) {
  // 1. Obtener datos del paciente
  const cliente = obtenerCliente(clienteId);
  const prescripcion = obtenerUltimaPrescripcion(clienteId);
  
  // 2. Extraer valores de graduación
  const odEsf = parseFloat(prescripcion.odEsfera) || 0;
  const odCil = parseFloat(prescripcion.odCilindro) || 0;
  const oiEsf = parseFloat(prescripcion.oiEsfera) || 0;
  const oiCil = parseFloat(prescripcion.oiCilindro) || 0;
  
  // 3. Calcular valores mayores
  const esferaMayor = obtenerEsferaMayor(odEsf, oiEsf);
  const cilindroMayor = obtenerCilindroMayor(odCil, oiCil);
  
  // 4. Obtener recomendación IA
  const perfil = {
    edad: cliente.edad || null,
    presupuesto: 'MEDIO',
    uso: 'GENERAL',
    actividad: 'NORMAL'
  };
  const recomendacion = obtenerRecomendacionInteligenteLunas(esferaMayor, cilindroMayor, perfil);
  
  // 5. Generar UI con tarjetas
  const html = `
    <div class="wizard-lunas">
      <h2>Selección de Material de Luna</h2>
      
      <!-- Mostrar graduación detectada -->
      <div class="graduacion-info">
        <p>Graduación detectada: ${esferaMayor > 0 ? '+' : ''}${esferaMayor.toFixed(2)}</p>
        <p>Serie automática: ${recomendacion.serieLabel}</p>
      </div>
      
      <!-- Mostrar recomendación IA -->
      <div class="recomendacion-ia">
        <h3>🤖 Recomendación Inteligente</h3>
        <p><strong>${recomendacion.materialNombre}</strong></p>
        <p>${recomendacion.razon}</p>
        <p>Confianza: ${recomendacion.confianza}%</p>
      </div>
      
      <!-- Tarjetas de selección -->
      ${generarTarjetasSeleccionMaterialV2(esferaMayor, cilindroMayor, 'seleccionarMaterialLuna')}
    </div>
  `;
  
  // 6. Mostrar en modal
  document.getElementById('modalWizardLunas').innerHTML = html;
  mostrarModal('modalWizardLunas');
}

// Función callback al seleccionar material
function seleccionarMaterialLuna(material, precio, precioPar) {
  // Calcular detalles completos
  const esferaMayor = obtenerEsferaMayor(odEsf, oiEsf);
  const cilindroMayor = obtenerCilindroMayor(odCil, oiCil);
  const resultado = calcularPrecioLunas(esferaMayor, cilindroMayor, material);
  
  // Crear objeto de luna para agregar al carrito
  const luna = {
    tipo: 'LUNA',
    material: resultado.materialNombre,
    serie: resultado.serieLabel,
    precio: precio,
    cantidad: 2, // Par de lunas
    precioTotal: precioPar,
    enStock: resultado.enStock,
    tiempoEntrega: resultado.tiempoEntrega,
    graduacion: {
      esfera: esferaMayor,
      cilindro: cilindroMayor
    }
  };
  
  // Agregar al carrito de venta
  agregarProductoAlCarrito(luna);
  
  // Cerrar wizard
  cerrarModal('modalWizardLunas');
  
  // Mostrar confirmación
  mostrarNotificacion(`✅ Luna ${resultado.materialNombre} agregada al carrito`);
}
```

---

## 📋 MATRIZ DE PRECIOS CONFIGURADA

| Material | Serie 1 (0-2.00) | Serie 2 (2.25-4.00) | Serie 3 (4.25+) |
|----------|------------------|---------------------|-----------------|
| **Blue** | S/ 50 | S/ 80 | S/ 110 |
| **Poly Blue** | S/ 85 | S/ 135 | S/ 150 |
| **Dipping** | S/ 80 | S/ 130 | S/ 145 |

---

## 🔧 CONFIGURACIÓN EDITABLE

Para modificar precios o rangos, edita las constantes en `Revision0009_FullSystem.html`:

```javascript
// Línea ~490 del archivo
const PRECIO_LUNAS_CONFIG = {
  BLUE: {
    series: {
      SERIE_1: { precio: 50, ... },
      SERIE_2: { precio: 80, ... },
      SERIE_3: { precio: 110, ... }
    }
  },
  // ...
};

const RANGOS_SERIES = {
  SERIE_1: { min: 0.00, max: 2.00, ... },
  SERIE_2: { min: 2.25, max: 4.00, ... },
  SERIE_3: { min: 4.25, max: 99.00, ... }
};
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [x] Motor integrado en sistema principal
- [x] Funciones disponibles globalmente
- [x] Cálculo automático de series funcionando
- [x] Tarjetas de selección con animaciones
- [x] Recomendaciones IA operativas
- [x] Calculadora de ahorro funcional
- [ ] Integrar en wizard de ventas (pendiente)
- [ ] Conectar con carrito de venta (pendiente)
- [ ] Pruebas con usuarios reales (pendiente)

---

## 🚀 PRÓXIMOS PASOS

1. **Localizar el wizard de ventas** en el código
2. **Reemplazar la selección manual** de material y serie
3. **Integrar las tarjetas** de selección inteligente
4. **Conectar con el carrito** de venta
5. **Probar con casos reales** de pacientes

---

## 📞 SOPORTE

Si necesitas ayuda para integrar el motor en tu wizard de ventas, proporciona:
1. La ubicación del código del wizard (número de línea)
2. Cómo se estructura actualmente la selección de lunas
3. Cómo se agregan productos al carrito

---

**Autor:** Centro Óptico Sicuani - Sistema Enterprise v6.0  
**Versión:** Motor de Precios Inteligente V2.0  
**Fecha:** 2026-01-12  
**Estado:** ✅ OPERATIVO

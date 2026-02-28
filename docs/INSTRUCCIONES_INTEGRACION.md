# 🔧 INSTRUCCIONES DE INTEGRACIÓN - MÓDULO CONSULTORIO 2.0

## 📋 CAMBIOS A REALIZAR EN `Revision0008.html`

---

### 1️⃣ REEMPLAZAR FUNCIÓN `verDetalleConsulta`

**Ubicación:** Línea aproximada 43919

**ANTES:**
```javascript
function verDetalleConsulta(idConsulta) {
  const consultas = load(DB.CONSULTAS_CLINICAS);
  const consulta = consultas.find(c => c.id === idConsulta);
  // ... código existente ...
}
```

**DESPUÉS:**
Reemplazar TODA la función con el contenido del archivo `CONSULTORIO_2.0_UPGRADE.js`

---

### 2️⃣ ACTUALIZAR BOTONES EN TABLA DE CONSULTORIO

**Ubicación:** Buscar donde se renderizan las acciones de la tabla (línea aproximada 43825)

**ANTES:**
```javascript
<button onclick="verDetalleConsulta('${consulta.id}')" class="btn-action">
  👁️ Ver
</button>
```

**DESPUÉS:**
```javascript
<div style="display: flex; gap: 4px; justify-content: center;">
  <!-- VER (Solo Lectura) -->
  <button onclick="verDetalleConsulta('${consulta.id}', false)"
          style="padding: 6px 12px; background: linear-gradient(135deg, #3b82f6, #2563eb);
                 color: white; border: none; border-radius: 6px; cursor: pointer;
                 font-weight: 600; font-size: 11px; transition: transform 0.2s;
                 box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'">
    👁️ VER
  </button>

  <!-- EDITAR -->
  <button onclick="verDetalleConsulta('${consulta.id}', true)"
          style="padding: 6px 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                 color: white; border: none; border-radius: 6px; cursor: pointer;
                 font-weight: 600; font-size: 11px; transition: transform 0.2s;
                 box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'">
    ✏️ EDITAR
  </button>

  <!-- ELIMINAR -->
  <button onclick="eliminarConsulta('${consulta.id}')"
          style="padding: 6px 12px; background: linear-gradient(135deg, #ef4444, #dc2626);
                 color: white; border: none; border-radius: 6px; cursor: pointer;
                 font-weight: 600; font-size: 11px; transition: transform 0.2s;
                 box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'">
    🗑️ ELIMINAR
  </button>
</div>
```

---

### 3️⃣ AGREGAR SECCIÓN "ÚLTIMA RX INGRESADA EN VENTAS"

**Ubicación:** En la parte superior del módulo Consultorio (sección `#modulo-consultorio`)

**Agregar ANTES de la tabla de consultas:**

```html
<!-- ═══ ÚLTIMA RX INGRESADA DESDE VENTAS ═══ -->
<div id="ultimaRxVentas" style="display: none; background: linear-gradient(135deg, #10b981 0%, #059669 100%);
     color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;
     box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
     animation: fadeInDown 0.5s ease, pulse 3s infinite;">

  <div style="display: flex; align-items: center; gap: 16px;">
    <span style="font-size: 48px; animation: rotate 2s infinite;">✨</span>
    <div style="flex: 1;">
      <div style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">
        🔄 NUEVA RX INGRESADA DESDE VENTAS
      </div>
      <div style="font-size: 14px; opacity: 0.95;" id="ultimaRxInfo">
        Paciente: <span id="ultimaRxNombre">-</span> |
        Esfera OD: <span id="ultimaRxEsfOD">-</span> |
        Cilindro OD: <span id="ultimaRxCilOD">-</span>
      </div>
    </div>
    <button onclick="verUltimaRxIngresada()"
            style="padding: 12px 24px; background: white; color: #059669;
                   border: none; border-radius: 8px; cursor: pointer;
                   font-weight: 800; font-size: 14px;
                   box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      👁️ VER DETALLE
    </button>
  </div>
</div>

<script>
// Función para ver última RX ingresada
function verUltimaRxIngresada() {
  const consultas = load(DB.CONSULTAS_CLINICAS);
  if (consultas.length > 0) {
    const ultima = consultas[consultas.length - 1];
    verDetalleConsulta(ultima.id, false);
  }
}

// Actualizar sección cuando llegue nueva RX
window.addEventListener('storage', function(e) {
  if (e.key === 'CONSULTAS_CLINICAS' && e.newValue) {
    const consultas = JSON.parse(e.newValue);
    if (consultas.length > 0) {
      const ultima = consultas[consultas.length - 1];

      // Mostrar sección
      document.getElementById('ultimaRxVentas').style.display = 'block';

      // Actualizar info
      document.getElementById('ultimaRxNombre').textContent = ultima.nombreCliente || '-';
      document.getElementById('ultimaRxEsfOD').textContent = ultima.medLejosEsfOD || '-';
      document.getElementById('ultimaRxCilOD').textContent = ultima.medLejosCilOD || '-';

      // Auto-ocultar después de 10 segundos
      setTimeout(() => {
        document.getElementById('ultimaRxVentas').style.animation = 'fadeOutUp 0.5s ease';
        setTimeout(() => {
          document.getElementById('ultimaRxVentas').style.display = 'none';
          document.getElementById('ultimaRxVentas').style.animation = 'fadeInDown 0.5s ease, pulse 3s infinite';
        }, 500);
      }, 10000);
    }
  }
});
</script>
```

---

### 4️⃣ AGREGAR ANIMACIONES CSS (AL FINAL DEL `<style>`)

**Ubicación:** Antes de `</style>` (línea aproximada 6509)

```css
/* ═══ ANIMACIONES PARA CONSULTORIO 2.0 ═══ */

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-30px);
  }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.6);
  }
}
```

---

## 🎯 RESULTADO ESPERADO

### ✅ MODO VISUALIZACIÓN (Por Defecto)
- Diseño limpio tipo "Buscar RX"
- Números grandes y legibles (22px)
- Badge de serie detectada con color
- Botón "✏️ Modo Edición" en header

### ✅ MODO EDICIÓN
- Inputs editables con bordes azules
- Botones "💾 Guardar Cambios" y "❌ Cancelar"
- Validación en tiempo real

### ✅ SINCRONIZACIÓN REAL-TIME
- Cambios en localStorage disparan evento
- Alerta visual cuando llega nueva RX desde Ventas
- Sección "ÚLTIMA RX INGRESADA" parpadea suavemente
- Tabla se actualiza automáticamente sin F5

### ✅ ACCIONES CRUD COMPLETAS
- **👁️ VER**: Modo solo lectura
- **✏️ EDITAR**: Modo edición con guardado
- **🗑️ ELIMINAR**: Con confirmación

---

## 🚀 PRUEBA COMPLETA

1. **Abrir** `Revision0008.html` en navegador A
2. **Abrir** otra pestaña del mismo archivo en navegador B (Consultorio)
3. **En A (Ventas):** Registrar una nueva consulta
4. **En B (Consultorio):** Debe aparecer alerta verde "✨ NUEVA RX INGRESADA"
5. **Hacer clic en VER:** Modal muestra diseño tipo "Buscar RX"
6. **Hacer clic en EDITAR:** Inputs se vuelven editables
7. **Guardar cambios:** Actualiza localStorage y notifica a todas las pestañas
8. **Hacer clic en ELIMINAR:** Confirma y elimina registro

---

## 📦 ARCHIVOS GENERADOS

1. ✅ `CONSULTORIO_2.0_UPGRADE.js` - Código completo del módulo
2. ✅ `INSTRUCCIONES_INTEGRACION.md` - Este archivo (guía de implementación)

---

## 💡 NOTAS IMPORTANTES

- El código usa el patrón de `storage event` de HTML5 para sincronización entre pestañas
- No requiere SignalR ni WebSockets (funciona en JavaScript Vanilla)
- Compatible con el sistema existente de `load()` y `save()`
- Todas las animaciones son CSS puro (sin librerías externas)

---

**¡SISTEMA LISTO PARA IMPRESIONAR!** 🎉

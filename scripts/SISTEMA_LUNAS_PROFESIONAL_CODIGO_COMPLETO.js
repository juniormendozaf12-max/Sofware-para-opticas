/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔵 SISTEMA PROFESIONAL DE LUNAS OFTÁLMICAS 4.0 (SIMPLIFICADO)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Adaptado para: Perú - Centro Óptico Sicuani
 * Enfoque: Selección directa de catálogo e inventario
 *
 * CARACTERÍSTICAS:
 * - ✅ Selección por Categoría Visual (Resina, Poly, etc.)
 * - ✅ Vinculación directa con Inventario Real
 * - ✅ Precios y Stock en tiempo real
 * - ✅ Eliminación de cálculos complejos
 * - ✅ Wizard simplificado (3 Pasos)
 *
 * @version 4.0.0
 * @date 07 Enero 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CATEGORÍAS TIPO DE LUNA (FILTROS)
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIAS_LUNAS = [
  {
    id: 'RESINA',
    nombre: "Resinas",
    icono: "⚪",
    descripcion: "Material orgánico estándar",
    filtros: ['resina', 'blue', 'uv', '1.50'],
    color: "#94a3b8"
  },
  {
    id: 'POLICARBONATO',
    nombre: "Policarbonato",
    icono: "🛡️",
    descripcion: "Resistente a impactos. Ideal niños/deportes",
    filtros: ['policarbonato', 'poly', 'trivex'],
    color: "#f59e0b"
  },
  {
    id: 'FOTOCROMATICO',
    nombre: "Fotocromáticos",
    icono: "☀️",
    descripcion: "Se oscurecen con el sol (Transitions, etc.)",
    filtros: ['foto', 'transition', 'photogray', 'sunsensors'],
    color: "#8b5cf6"
  },
  {
    id: 'ALTO_INDICE',
    nombre: "Alto Índice",
    icono: "💎",
    descripcion: "Lentes delgados para medidas altas",
    filtros: ['alto índice', '1.67', '1.74', 'high index'],
    color: "#0ea5e9"
  },
  {
    id: 'PROGRESIVOS',
    nombre: "Multifocales",
    icono: "🌊",
    descripcion: "Progresivos, Bifocales y Multifocales",
    filtros: ['progresivo', 'bifocal', 'multifocal', 'varilux'],
    color: "#10b981"
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. FUNCIONES DE ACCESO A DATOS (INVENTARIO)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene los productos del inventario filtrados por categoría
 * @param {string} categoriaId KEy de la categoría
 * @returns {Array} Lista de productos disponibles
 */
function obtenerProductosPorCategoria(categoriaId) {
  const categoria = CATEGORIAS_LUNAS.find(c => c.id === categoriaId);
  if (!categoria) return [];

  // Obtener todo el inventario (Asume función global load(DB.PRODUCTOS))
  // Si no existe, retorna array vacío para evitar error
  let inventario = [];
  try {
    if (typeof load === 'function' && typeof DB !== 'undefined') {
      inventario = load(DB.PRODUCTOS) || [];
    } else {
      console.warn('⚠️ No se pudo acceder al inventario global. Usando datos demo si existen.');
    }
  } catch (e) {
    console.error('Error leyenda inventario:', e);
  }

  // Filtrar solo productos de categoría 'Lunas' o 'LUNAS'
  const soloLunas = inventario.filter(p =>
    (p.categoria || '').toUpperCase() === 'LUNAS'
  );

  // Filtrar por palabras clave de la categoría visual
  return soloLunas.filter(producto => {
    const nombre = (producto.nombre || '').toLowerCase();
    return categoria.filtros.some(filtro => nombre.includes(filtro));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. WIZARD (GESTOR DE PASOS)
// ═══════════════════════════════════════════════════════════════════════════════

// Estado del Wizard
let wizardLunaState = {
  paso: 1,
  categoria: null,
  productoSeleccionado: null,
  medidas: {
    odEsf: 0, odCil: 0, odEje: 0, odAdd: 0,
    oiEsf: 0, oiCil: 0, oiEje: 0, oiAdd: 0
  }
};

/**
 * Abre el modal wizard de lunas (RESETEADO)
 */
function abrirWizardLunas() {
  console.log('%c🔵 Iniciando Wizard Simplificado de Lunas', 'color: #0ea5e9; font-weight: bold;');

  // Reset
  wizardLunaState = {
    paso: 1,
    categoria: null,
    productoSeleccionado: null,
    medidas: {
      odEsf: 0, odCil: 0, odEje: 0, odAdd: 0,
      oiEsf: 0, oiCil: 0, oiEje: 0, oiAdd: 0
    }
  };

  renderizarWizard();

  // Mostrar modal (Asume estructura HTML existente)
  const modal = document.getElementById('wizardLunasModal');
  if (modal) modal.showModal();
}

/**
 * Renderizador central del wizard
 */
function renderizarWizard() {
  const contenedor = document.getElementById('wizardLunasContenido');
  const titulo = document.getElementById('wizardTitulo');

  if (!contenedor) return;

  // Renderizar indicador de pasos
  renderizarIndicadorPasos();

  // Routeo de pasos
  switch (wizardLunaState.paso) {
    case 1:
      renderizarPaso1_Categoria(contenedor, titulo);
      break;
    case 2:
      renderizarPaso2_Producto(contenedor, titulo);
      break;
    case 3:
      renderizarPaso3_Medidas(contenedor, titulo);
      break;
  }
}

function renderizarIndicadorPasos() {
  const indicador = document.getElementById('wizardIndicador');
  if (!indicador) return;

  indicador.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div class="step-dot ${wizardLunaState.paso >= 1 ? 'active' : ''}">1. Material</div>
      <div class="step-line"></div>
      <div class="step-dot ${wizardLunaState.paso >= 2 ? 'active' : ''}">2. Producto</div>
      <div class="step-line"></div>
      <div class="step-dot ${wizardLunaState.paso >= 3 ? 'active' : ''}">3. Medidas</div>
    </div>
    <style>
      .step-dot {
        background: #e5e7eb; color: #6b7280; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;
        transition: all 0.3s;
      }
      .step-dot.active {
        background: #0ea5e9; color: white; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      }
      .step-line {
        width: 40px; height: 2px; background: #e5e7eb;
      }
    </style>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PASO 1: SELECCIÓN DE CATEGORÍA
// ═══════════════════════════════════════════════════════════════════════════════

function renderizarPaso1_Categoria(contenedor, titulo) {
  if (titulo) titulo.textContent = 'Paso 1: ¿Qué tipo de luna busca?';

  contenedor.innerHTML = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        ${CATEGORIAS_LUNAS.map(cat => `
          <div onclick="seleccionarCategoria('${cat.id}')"
               class="cat-card"
               style="
                 background: white; border: 2px solid ${cat.color}30; border-radius: 16px; padding: 24px;
                 cursor: pointer; transition: all 0.2s; text-align: center;
                 box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
               "
               onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='${cat.color}'; this.style.boxShadow='0 10px 15px -3px ${cat.color}20'"
               onmouseout="this.style.transform='none'; this.style.borderColor='${cat.color}30'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'"
          >
            <div style="font-size: 48px; margin-bottom: 12px;">${cat.icono}</div>
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${cat.nombre}</h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">${cat.descripcion}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function seleccionarCategoria(id) {
  wizardLunaState.categoria = id;
  wizardLunaState.paso = 2; // Ir al paso 2
  renderizarWizard();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PASO 2: SELECCIÓN DE PRODUCTO (INVENTARIO REAL)
// ═══════════════════════════════════════════════════════════════════════════════

function renderizarPaso2_Producto(contenedor, titulo) {
  if (titulo) titulo.textContent = 'Paso 2: Selecciona el Producto del Inventario';

  const productos = obtenerProductosPorCategoria(wizardLunaState.categoria);
  const catInfo = CATEGORIAS_LUNAS.find(c => c.id === wizardLunaState.categoria);

  contenedor.innerHTML = `
    <div style="padding: 10px;">
      <!-- Header con opción de volver -->
      <button onclick="wizardLunaState.paso=1; renderizarWizard()" 
              style="background: none; border: none; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-weight: 500;">
        ← Volver a categorías
      </button>

      ${productos.length === 0 ? `
        <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 8px;">😕</div>
          <div style="font-weight: 600; color: #374151;">No encontramos productos</div>
          <p style="color: #6b7280; font-size: 14px;">No hay items en inventario que coincidan con "${catInfo.nombre}".</p>
        </div>
      ` : `
        <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
              <tr>
                <th style="padding: 12px 16px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Producto</th>
                <th style="padding: 12px 16px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Stock</th>
                <th style="padding: 12px 16px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; text-align: right;">Precio</th>
                <th style="padding: 12px 16px;"></th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(prod => {
    const stock = parseInt(prod.stock || 0);
    // 🔴 MODIFICACIÓN: Ya no bloqueamos si no hay stock, solo informamos
    return `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;"
                      onmouseover="this.style.background='#f0f9ff'"
                      onmouseout="this.style.background='white'"
                  >
                    <td style="padding: 16px;">
                      <div style="font-weight: 600; color: #1f2937;">${prod.nombre}</div>
                      <div style="font-size: 12px; color: #9ca3af; font-family: monospace;">SKU: ${prod.id}</div>
                    </td>
                    <td style="padding: 16px;">
                      <span style="
                        padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;
                        background: ${stock <= 0 ? '#f3f4f6' : '#dcfce7'}; 
                        color: ${stock <= 0 ? '#6b7280' : '#166534'};
                      ">
                        ${stock <= 0 ? 'Sin Stock (' + stock + ')' : stock + ' unds'}
                      </span>
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #0ea5e9;">
                      S/ ${parseFloat(prod.precio).toFixed(2)}
                    </td>
                    <td style="padding: 16px; text-align: right;">
                      <button onclick='seleccionarProducto(${JSON.stringify(prod)})'
                              style="
                                padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
                                background: #0ea5e9; color: white;
                              "
                              onmouseover="this.style.background='#0284c7'"
                              onmouseout="this.style.background='#0ea5e9'">
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function seleccionarProducto(producto) {
  // Aseguramos que sea un objeto válido (el stringify en HTML a veces da problemas con comillas)
  // En este caso, asumimos que llega bien. Si no, buscar por ID.
  wizardLunaState.productoSeleccionado = producto;
  wizardLunaState.paso = 3;
  renderizarWizard();
  console.log('📦 Producto seleccionado:', producto);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PASO 3: MEDIDAS Y CONFIRMACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

function renderizarPaso3_Medidas(contenedor, titulo) {
  if (titulo) titulo.textContent = 'Paso 3: Ingresa las Medidas';
  const prod = wizardLunaState.productoSeleccionado;

  contenedor.innerHTML = `
    <div style="padding: 10px;">
      <!-- Resumen de Selección -->
      <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 13px; color: #075985;">Producto Seleccionado:</div>
          <div style="font-size: 18px; font-weight: 700; color: #0c4a6e;">${prod.nombre}</div>
          <div style="font-size: 13px; color: #075985; font-family: monospace;">SKU: ${prod.id}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 700; color: #0ea5e9;">S/ ${parseFloat(prod.precio).toFixed(2)}</div>
          <button onclick="wizardLunaState.paso=2; renderizarWizard()" style="background: none; border: none; color: #0284c7; font-size: 13px; text-decoration: underline; cursor: pointer;">Cambiar producto</button>
        </div>
      </div>

      <!-- Formulario de Medidas (Simplificado) -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
        <h4 style="margin-top: 0; margin-bottom: 16px; color: #374151;">📝 Prescripción / Receta</h4>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
           <thead>
            <tr>
              <th style="text-align: left; padding: 0 8px; color: #6b7280; font-size: 12px;">OJO</th>
              <th style="text-align: center; color: #6b7280; font-size: 12px;">ESFERA</th>
              <th style="text-align: center; color: #6b7280; font-size: 12px;">CILINDRO</th>
              <th style="text-align: center; color: #6b7280; font-size: 12px;">EJE</th>
              <th style="text-align: center; color: #6b7280; font-size: 12px;">ADICIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 700; color: #ef4444;">OD</td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.odEsf}" onchange="wizardLunaState.medidas.odEsf=this.value"></td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.odCil}" onchange="wizardLunaState.medidas.odCil=this.value"></td>
              <td><input type="number" step="1" class="input-medida" value="${wizardLunaState.medidas.odEje}" onchange="wizardLunaState.medidas.odEje=this.value"></td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.odAdd}" onchange="wizardLunaState.medidas.odAdd=this.value"></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #3b82f6;">OI</td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.oiEsf}" onchange="wizardLunaState.medidas.oiEsf=this.value"></td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.oiCil}" onchange="wizardLunaState.medidas.oiCil=this.value"></td>
              <td><input type="number" step="1" class="input-medida" value="${wizardLunaState.medidas.oiEje}" onchange="wizardLunaState.medidas.oiEje=this.value"></td>
              <td><input type="number" step="0.25" class="input-medida" value="${wizardLunaState.medidas.oiAdd}" onchange="wizardLunaState.medidas.oiAdd=this.value"></td>
            </tr>
          </tbody>
        </table>

        <style>
          .input-medida {
            width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; text-align: center; font-weight: 600;
          }
          .input-medida:focus {
            outline: none; border-color: #0ea5e9; ring: 2px solid #0ea5e9;
          }
        </style>
      </div>

      <!-- Botón Final -->
      <button onclick="finalizarVentaLuna()"
              style="
                margin-top: 24px; width: 100%; padding: 16px; 
                background: linear-gradient(135deg, #10b981, #059669); color: white; 
                border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
              ">
        ✓ Confirmar y Agregar a Venta
      </button>
    </div>
  `;
}

function finalizarVentaLuna() {
  const prod = wizardLunaState.productoSeleccionado;

  if (!prod) return;

  // Crear item para el carrito de ventas
  // NOTA: Usamos la estructura que el sistema principal espera
  const itemVenta = {
    tipo: 'PRODUCTO', // Usamos PRODUCTO para que descuente stock normal
    id: prod.id, // SKU real
    nombre: prod.nombre,
    descripcion: generarDescripcionMedidas(prod.nombre), // Añadimos las medidas al nombre/descripción
    precio: parseFloat(prod.precio),
    cantidad: 1, // Por defecto 1 par o 1 unidad
    stock: prod.stock,
    medidas: { ...wizardLunaState.medidas } // Guardamos medidas como data extra
  };

  // Agregar al carrito global (función existente del sistema)
  if (typeof agregarItemVenta === 'function') {
    agregarItemVenta(itemVenta);
  } else if (typeof itemsVenta !== 'undefined' && Array.isArray(itemsVenta)) {
    // Fallback manual si no existe la función
    itemsVenta.push(itemVenta);
    if (typeof renderItemsVenta === 'function') renderItemsVenta();
  }

  // Cerrar modal
  const modal = document.getElementById('wizardLunasModal');
  if (modal) modal.close();

  // Notificar
  if (typeof toast === 'function') {
    toast(`✅ ${prod.nombre} agregado correctamente`, 'success');
  } else {
    alert('Producto agregado a la venta');
  }
}

function generarDescripcionMedidas(nombreBase) {
  const m = wizardLunaState.medidas;
  // Solo agregar si hay valores distintos de 0
  const tieneMedidas = Object.values(m).some(v => parseFloat(v) !== 0);

  if (!tieneMedidas) return nombreBase;

  return `${nombreBase} [OD: ${m.odEsf}/${m.odCil} OI: ${m.oiEsf}/${m.oiCil}]`;
}

console.log('%c✅ SISTEMA DE LUNAS: Lógica Simplificada cargada correctamente', 'color: #10b981');

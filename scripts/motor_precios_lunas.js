// ═══════════════════════════════════════════════════════════════════════════════
// 🏆 MOTOR DE PRECIOS INTELIGENTE V2.0 - NIVEL ESSILORLUXOTTICA ENTERPRISE
// ═══════════════════════════════════════════════════════════════════════════════
// Sistema automatizado de cálculo de precios y series para lunas oftálmicas
// Con IA de recomendaciones, comparador de precios y calculadora de ahorro
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 📊 CONFIGURACIÓN DE PRECIOS POR MATERIAL Y SERIE
 * Precios base por UNIDAD (1 luna). La UI permite cambiar entre Unidad/Par (x2)
 */
const PRECIO_LUNAS_CONFIG = {
  // Resina / RX Blue (Material estándar)
  BLUE: {
    nombre: 'Blue (Resina/RX Blue)',
    nombreCorto: 'Blue',
    icono: '🔵',
    descripcion: 'Material estándar de alta calidad',
    beneficios: ['Excelente claridad óptica', 'Económica', 'Ideal para graduaciones bajas'],
    nivel: 'BUENO',
    color: '#10b981',
    series: {
      SERIE_1: { precio: 50, rango: '0.00 - 2.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_2: { precio: 80, rango: '2.25 - 4.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_3: { precio: 110, rango: '4.25 - 6.00+', stock: false, fabricacion: true, tiempoEntrega: '7-10 días' }
    }
  },

  // Policarbonato Blue (Resistente)
  POLY_BLUE: {
    nombre: 'Poly Blue',
    nombreCorto: 'Poly Blue',
    icono: '💎',
    descripcion: 'Ultra-resistente, ideal para deportes y niños',
    beneficios: ['40% más delgado', 'Ultra-resistente', 'Protección UV integrada'],
    nivel: 'MEJOR',
    color: '#f59e0b',
    series: {
      SERIE_1: { precio: 85, rango: '0.00 - 2.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_2: { precio: 135, rango: '2.25 - 4.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_3: { precio: 150, rango: '4.25 - 6.00+', stock: false, fabricacion: true, tiempoEntrega: '7-10 días' }
    }
  },

  // Dipping (Premium)
  DIPPING: {
    nombre: 'Dipping',
    nombreCorto: 'Dipping',
    icono: '✨',
    descripcion: 'Tratamiento premium anti-reflejante',
    beneficios: ['Máxima claridad visual', 'Anti-reflejante superior', 'Fácil limpieza'],
    nivel: 'ÓPTIMO',
    color: '#8b5cf6',
    series: {
      SERIE_1: { precio: 80, rango: '0.00 - 2.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_2: { precio: 130, rango: '2.25 - 4.00', stock: true, tiempoEntrega: 'Inmediata' },
      SERIE_3: { precio: 145, rango: '4.25 - 6.00+', stock: false, fabricacion: true, tiempoEntrega: '7-10 días' }
    }
  }
};

/**
 * 🎯 CONFIGURACIÓN DE RANGOS DE SERIES (Editable)
 * Define los límites de esfera para cada serie
 */
const RANGOS_SERIES = {
  SERIE_1: { min: 0.00, max: 2.00, label: 'Serie 1 (Baja)', color: '#10b981', descripcion: 'Graduación baja' },
  SERIE_2: { min: 2.25, max: 4.00, label: 'Serie 2 (Media)', color: '#f59e0b', descripcion: 'Graduación media' },
  SERIE_3: { min: 4.25, max: 99.00, label: 'Serie 3 (Alta)', color: '#ef4444', descripcion: 'Graduación alta' }
};

/**
 * 🧮 FUNCIÓN PRINCIPAL: Calcular Precio Automático de Lunas
 * @param {number} esfera - Valor de esfera (OD o OI, se usa el mayor)
 * @param {number} cilindro - Valor de cilindro (opcional, para casos especiales)
 * @param {string} material - 'BLUE', 'POLY_BLUE', 'DIPPING'
 * @returns {Object} - { serie, precio, material, enStock, requiereFabricacion }
 */
function calcularPrecioLunas(esfera, cilindro = 0, material = 'BLUE') {
  // Validar entrada
  if (typeof esfera !== 'number' || isNaN(esfera)) {
    console.error('❌ Esfera inválida:', esfera);
    return null;
  }

  // Normalizar material
  material = material.toUpperCase();
  if (!PRECIO_LUNAS_CONFIG[material]) {
    console.warn(`⚠️ Material "${material}" no encontrado, usando BLUE por defecto`);
    material = 'BLUE';
  }

  // Calcular valor absoluto de esfera (para determinar serie)
  const esferaAbs = Math.abs(esfera);
  const cilindroAbs = Math.abs(cilindro);

  // 🎯 DETERMINAR SERIE AUTOMÁTICAMENTE
  let serieDetectada = null;

  if (esferaAbs <= RANGOS_SERIES.SERIE_1.max) {
    serieDetectada = 'SERIE_1';
  } else if (esferaAbs <= RANGOS_SERIES.SERIE_2.max) {
    serieDetectada = 'SERIE_2';
  } else {
    serieDetectada = 'SERIE_3';
  }

  // Obtener configuración de la serie
  const configMaterial = PRECIO_LUNAS_CONFIG[material];
  const configSerie = configMaterial.series[serieDetectada];

  // 📊 RESULTADO
  return {
    serie: serieDetectada,
    serieLabel: RANGOS_SERIES[serieDetectada].label,
    serieDescripcion: RANGOS_SERIES[serieDetectada].descripcion,
    material: material,
    materialNombre: configMaterial.nombre,
    materialNombreCorto: configMaterial.nombreCorto,
    materialIcono: configMaterial.icono,
    materialDescripcion: configMaterial.descripcion,
    materialBeneficios: configMaterial.beneficios,
    materialNivel: configMaterial.nivel,
    materialColor: configMaterial.color,
    precio: configSerie.precio,
    precioPar: configSerie.precio * 2,
    rango: configSerie.rango,
    enStock: configSerie.stock || false,
    requiereFabricacion: configSerie.fabricacion || false,
    tiempoEntrega: configSerie.tiempoEntrega,
    esfera: esfera,
    cilindro: cilindro,
    color: RANGOS_SERIES[serieDetectada].color
  };
}

/**
 * 🎨 GENERAR TARJETAS DE SELECCIÓN INTELIGENTE V2.0 (Tiered Pricing)
 * Muestra las 3 opciones de materiales en formato comparativo con animaciones
 * @param {number} esfera - Valor de esfera del paciente
 * @param {number} cilindro - Valor de cilindro del paciente
 * @param {Function} onSelect - Callback al seleccionar un material
 * @returns {string} - HTML de las tarjetas
 */
function generarTarjetasSeleccionMaterialV2(esfera, cilindro = 0, onSelect = null) {
  const materiales = ['BLUE', 'POLY_BLUE', 'DIPPING'];
  const resultados = materiales.map(m => calcularPrecioLunas(esfera, cilindro, m));
  const onSelectFn = onSelect || 'window.preseleccionarLuna'; // Función por defecto

  // Calcular ahorro comparando con el más caro
  const precioMax = Math.max(...resultados.map(r => r.precio));

  let html = `
    <style>
      @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      
      .tarjeta-material-v2 {
        animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
      }
      .tarjeta-material-v2:hover { transform: translateY(-8px); z-index: 10; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
      .badge-shimmer { background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%); background-size: 1000px 100%; animation: shimmer 3s linear infinite; }
      
      .btn-select-v2 { transition: all 0.2s; position: relative; overflow: hidden; }
      .btn-select-v2:active { transform: scale(0.95); }
      .btn-select-v2::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; opacity: 0; transition: opacity 0.2s; }
      .btn-select-v2:active::after { opacity: 0.2; }
    </style>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0;">
  `;

  resultados.forEach((resultado, index) => {
    if (!resultado) return;

    const esRecomendado = index === 1; // "MEJOR" es el recomendado por defecto
    const ahorro = precioMax - resultado.precio;
    const porcentajeAhorro = ((ahorro / precioMax) * 100).toFixed(0);

    const borderColor = esRecomendado ? '#f59e0b' : '#e5e7eb';
    const bgColor = esRecomendado ? '#fffbeb' : '#ffffff';
    const shadowColor = esRecomendado ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 0, 0, 0.1)';

    html += `
      <div class="tarjeta-material-v2 ${esRecomendado ? 'recomendada' : ''}" 
           style="
             background: ${bgColor};
             border: 3px solid ${borderColor};
             border-radius: 24px;
             padding: 24px;
             position: relative;
             overflow: hidden;
             box-shadow: 0 10px 30px ${shadowColor};
             animation-delay: ${index * 0.15}s;
           ">
        
        <!-- Bloque Superior (Info) -->
        <div style="flex: 1;">
          <!-- Badge Superior con Shimmer -->
          ${esRecomendado ? `
            <div class="badge-shimmer" style="position: absolute; top: -10px; right: -10px; color: white; padding: 8px 24px 8px 36px; font-size: 11px; font-weight: 900; letter-spacing: 1px; transform: rotate(45deg); box-shadow: 0 6px 12px rgba(0,0,0,0.2);">
              ⭐ RECOMENDADO
            </div>
          ` : ''}

          <!-- Header con Icono Animado -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 56px; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.2) rotate(10deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'">
              ${resultado.materialIcono}
            </div>
            
            <div style="background: ${resultado.materialColor}; color: white; padding: 6px 16px; border-radius: 25px; font-size: 12px; font-weight: 900; letter-spacing: 1px; display: inline-block; margin-bottom: 8px; box-shadow: 0 4px 12px ${resultado.materialColor}40;">
              ${resultado.materialNivel}
            </div>
            
            <div style="font-size: 18px; font-weight: 800; color: #1e293b; line-height: 1.2;">
              ${resultado.materialNombreCorto}
            </div>
          </div>

          <!-- Beneficios (Compactos) -->
          <div style="margin-bottom: 20px;">
            ${resultado.materialBeneficios.slice(0, 2).map(b => `
              <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 6px; font-size: 11px; color: #475569;">
                <span style="color: ${resultado.materialColor}; font-weight: bold;">✓</span> ${b}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- FOOTER: SELECTOR DUAL (1 OJO vs 2 OJOS) -->
        <div style="margin-top: 10px; border-top: 1px dashed ${borderColor}; padding-top: 16px;">
          
          <div style="display: flex; gap: 12px;">
            
            <!-- OPCIÓN A: 1 OJO -->
            <button class="btn-select-v2" onclick="${onSelectFn}('${resultado.material}', ${resultado.precio}, ${resultado.precioPar}, 1)"
              style="
                flex: 1;
                border: 2px solid ${esRecomendado ? '#fde68a' : '#e2e8f0'};
                background: white;
                border-radius: 12px;
                padding: 10px 4px;
                cursor: pointer;
                text-align: center;
              "
              onmouseover="this.style.borderColor='${resultado.materialColor}'; this.style.color='${resultado.materialColor}'"
              onmouseout="this.style.borderColor='${esRecomendado ? '#fde68a' : '#e2e8f0'}'; this.style.color='inherit'"
            >
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">1 OJO</div>
              <div style="font-size: 16px; font-weight: 800; color: #334155;">S/ ${resultado.precio}</div>
            </button>

            <!-- OPCIÓN B: 2 OJOS (Destacado) -->
            <button class="btn-select-v2" onclick="${onSelectFn}('${resultado.material}', ${resultado.precio}, ${resultado.precioPar}, 2)"
              style="
                flex: 1.3;
                border: none;
                background: ${resultado.materialColor};
                color: white;
                border-radius: 12px;
                padding: 10px 4px;
                cursor: pointer;
                text-align: center;
                box-shadow: 0 4px 10px ${resultado.materialColor}50;
              "
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              <div style="font-size: 10px; font-weight: 800; opacity: 0.9; text-transform: uppercase; margin-bottom: 2px;">PAR (2 OJOS)</div>
              <div style="font-size: 18px; font-weight: 900;">S/ ${resultado.precioPar}</div>
            </button>

          </div>
          
          <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 8px;">
            ${resultado.enStock ? '✅ En Stock' : '🏭 Fabricación ' + resultado.tiempoEntrega}
          </div>

        </div>

      </div>
    `;
  });

  html += `</div>`;
  return html;
}

/**
 * 🔄 CALCULAR TODAS LAS OPCIONES (para comparación)
 * @param {number} esfera
 * @param {number} cilindro
 * @returns {Array} - Array de objetos con todas las opciones
 */
function calcularTodasLasOpciones(esfera, cilindro = 0) {
  const materiales = ['BLUE', 'POLY_BLUE', 'DIPPING'];
  return materiales.map(material => calcularPrecioLunas(esfera, cilindro, material)).filter(r => r !== null);
}

/**
 * 📈 OBTENER RECOMENDACIÓN INTELIGENTE AVANZADA
 * Basado en la graduación, edad del paciente, presupuesto y uso
 * @param {number} esfera
 * @param {number} cilindro
 * @param {Object} perfil - { edad, presupuesto, uso, actividad }
 * @returns {Object} - Material recomendado con razón detallada
 */
function obtenerRecomendacionInteligente(esfera, cilindro = 0, perfil = {}) {
  const esferaAbs = Math.abs(esfera);
  const { edad = null, presupuesto = 'MEDIO', uso = 'GENERAL', actividad = 'NORMAL' } = perfil;

  let materialRecomendado = null;
  let razon = '';
  let confianza = 0; // 0-100

  // 🧠 SISTEMA DE REGLAS AVANZADO

  // Regla 1: Graduación muy alta → POLY_BLUE (más delgado y resistente)
  if (esferaAbs > 4.0) {
    materialRecomendado = 'POLY_BLUE';
    razon = `Con graduación alta (${esferaAbs.toFixed(2)}), Poly Blue ofrece lentes más delgados y livianos, mejorando significativamente la estética y comodidad.`;
    confianza = 95;
  }
  // Regla 2: Niños/adolescentes → POLY_BLUE (resistencia)
  else if (edad && edad < 18) {
    materialRecomendado = 'POLY_BLUE';
    razon = `Para niños y adolescentes, Poly Blue es ideal por su ultra-resistencia a impactos, protegiendo los ojos en actividades deportivas y juegos.`;
    confianza = 90;
  }
  // Regla 3: Deportistas o actividad física intensa → POLY_BLUE
  else if (actividad === 'DEPORTIVA' || uso === 'DEPORTES') {
    materialRecomendado = 'POLY_BLUE';
    razon = `Para actividades deportivas, Poly Blue ofrece la máxima resistencia a impactos y protección UV integrada.`;
    confianza = 92;
  }
  // Regla 4: Presupuesto alto y busca calidad premium → DIPPING
  else if (presupuesto === 'ALTO') {
    materialRecomendado = 'DIPPING';
    razon = `Dipping ofrece el tratamiento anti-reflejante más avanzado, máxima claridad visual y facilidad de limpieza. Ideal para quien busca lo mejor.`;
    confianza = 88;
  }
  // Regla 5: Uso intensivo de computadora → DIPPING
  else if (uso === 'OFICINA' || uso === 'COMPUTADORA') {
    materialRecomendado = 'DIPPING';
    razon = `Para trabajo prolongado frente a pantallas, Dipping reduce el cansancio visual con su tratamiento anti-reflejante superior.`;
    confianza = 85;
  }
  // Regla 6: Presupuesto bajo y graduación baja → BLUE
  else if (presupuesto === 'BAJO' && esferaAbs < 2.0) {
    materialRecomendado = 'BLUE';
    razon = `Con graduación baja (${esferaAbs.toFixed(2)}), Blue ofrece excelente calidad óptica a un precio muy accesible.`;
    confianza = 80;
  }
  // Regla 7: Edad avanzada → POLY_BLUE (livianos)
  else if (edad && edad >= 60) {
    materialRecomendado = 'POLY_BLUE';
    razon = `Para mayor comodidad, Poly Blue es extremadamente liviano, reduciendo la presión sobre el puente nasal y las orejas.`;
    confianza = 82;
  }
  // Default: POLY_BLUE (mejor balance calidad-precio)
  else {
    materialRecomendado = 'POLY_BLUE';
    razon = `Poly Blue ofrece el mejor balance entre calidad, resistencia y precio. Recomendado para uso general.`;
    confianza = 75;
  }

  const resultado = calcularPrecioLunas(esfera, cilindro, materialRecomendado);

  return {
    ...resultado,
    razon,
    confianza,
    perfil
  };
}

/**
 * 💰 CALCULAR AHORRO COMPARATIVO
 * Compara el precio seleccionado con las otras opciones
 * @param {number} esfera
 * @param {number} cilindro
 * @param {string} materialSeleccionado
 * @returns {Object} - Información de ahorro
 */
function calcularAhorroComparativo(esfera, cilindro, materialSeleccionado) {
  const todasOpciones = calcularTodasLasOpciones(esfera, cilindro);
  const seleccionado = todasOpciones.find(o => o.material === materialSeleccionado);

  if (!seleccionado) return null;

  const precioMax = Math.max(...todasOpciones.map(o => o.precio));
  const precioMin = Math.min(...todasOpciones.map(o => o.precio));

  const ahorro = precioMax - seleccionado.precio;
  const porcentajeAhorro = ((ahorro / precioMax) * 100).toFixed(1);

  return {
    precioSeleccionado: seleccionado.precio,
    precioMax,
    precioMin,
    ahorro,
    porcentajeAhorro,
    esLaMasEconomica: seleccionado.precio === precioMin,
    esLaMasCara: seleccionado.precio === precioMax
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 FUNCIONES DE UTILIDAD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtener el mayor valor de esfera entre OD y OI
 */
function obtenerEsferaMayor(odEsf, oiEsf) {
  const odAbs = Math.abs(parseFloat(odEsf) || 0);
  const oiAbs = Math.abs(parseFloat(oiEsf) || 0);
  return odAbs > oiAbs ? parseFloat(odEsf) : parseFloat(oiEsf);
}

/**
 * Obtener el mayor valor de cilindro entre OD y OI
 */
function obtenerCilindroMayor(odCil, oiCil) {
  const odAbs = Math.abs(parseFloat(odCil) || 0);
  const oiAbs = Math.abs(parseFloat(oiCil) || 0);
  return odAbs > oiAbs ? parseFloat(odCil) : parseFloat(oiCil);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

console.log('%c🏆 MOTOR DE PRECIOS INTELIGENTE V2.0 CARGADO', 'color: #10b981; font-weight: bold; font-size: 18px; background: #d1fae5; padding: 10px; border-radius: 8px;');
console.log('%c   ✓ Cálculo automático de Series', 'color: #10b981; font-size: 14px;');
console.log('%c   ✓ Tarjetas de Selección Inteligente V2', 'color: #10b981; font-size: 14px;');
console.log('%c   ✓ Recomendaciones IA Avanzadas', 'color: #10b981; font-size: 14px;');
console.log('%c   ✓ Calculadora de Ahorro Comparativo', 'color: #10b981; font-size: 14px;');
console.log('%c   ✓ Animaciones Premium', 'color: #10b981; font-size: 14px;');

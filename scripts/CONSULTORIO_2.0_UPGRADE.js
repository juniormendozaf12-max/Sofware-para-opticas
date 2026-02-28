// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 MÓDULO CONSULTORIO 2.0 - UPGRADE COMPLETO
// Centro Óptico Sicuani - Sistema Vanguardista
// Implementa: Doble Visualización + Sincronización Real-Time + CRUD Completo
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 1️⃣ VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════════

let consultaActualModal = null;
let modoEdicionActivo = false;

// ═══════════════════════════════════════════════════════════════════════════════
// 2️⃣ SINCRONIZACIÓN EN TIEMPO REAL (STORAGE EVENT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Escucha cambios en localStorage desde otras pestañas (Ventas)
 * Implementa "El Espejo" - Sincronización 0ms
 */
window.addEventListener('storage', function(e) {
  // Solo reaccionar si cambió CONSULTAS_CLINICAS
  if (e.key === 'CONSULTAS_CLINICAS' && e.newValue !== e.oldValue) {
    console.log('🔄 Detectado cambio en RX desde otra pestaña');

    // Mostrar notificación visual
    mostrarAlertaNuevaRX();

    // Si estamos en la página de consultorio, recargar tabla
    if (document.getElementById('tablaConsultorio') && document.getElementById('tablaConsultorio').offsetParent !== null) {
      renderizarTablaConsultorio();
    }

    // Si hay un modal abierto, actualizarlo
    if (consultaActualModal && document.getElementById('modalHistorialConsulta').style.display === 'flex') {
      verDetalleConsulta(consultaActualModal.id, false); // Recargar sin animación
    }
  }
});

/**
 * Muestra alerta visual cuando llega nueva RX desde Ventas
 */
function mostrarAlertaNuevaRX() {
  // Crear elemento de alerta
  const alerta = document.createElement('div');
  alerta.id = 'alerta-nueva-rx';
  alerta.innerHTML = `
    <div style="
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.5);
      animation: slideInRight 0.5s ease, pulse 2s infinite;
      z-index: 10000;
      max-width: 350px;
      cursor: pointer;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 32px; animation: rotate 2s infinite;">🔄</span>
        <div>
          <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px;">
            ✨ NUEVA RX INGRESADA
          </div>
          <div style="font-size: 13px; opacity: 0.95;">
            Se detectó una nueva receta desde Ventas
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(alerta);

  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    alerta.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => alerta.remove(), 500);
  }, 5000);

  // Cerrar al hacer clic
  alerta.onclick = () => {
    alerta.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => alerta.remove(), 500);
  };

  // Reproducir sonido de notificación (opcional)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTYIG2m98OScTgwPUKXl8LRkHAU2kdXzzn0vBSh+zPLaizsIHGS48OScUAwNU6zn77FgGQU7k9r0zoQtBSh+zPLaizsIHGS48OScUAwNU6zn77FgGQU7k9r0zoQtBSh+zPLaizsIHGS48OScUAwNU6zn77FgGQU7k9r0zoQtBSh+zPLaizsIHGS48OScUAwNU6zn77FgGQU7k9r0zoQtBSh+zPLaizsIHGS48OScUAwNU6zn77FgGQU7k9r0zoQtBQ==');
    audio.volume = 0.3;
    audio.play();
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3️⃣ FUNCIÓN PRINCIPAL: VER DETALLE CONSULTA (REDISEÑADA)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Muestra detalle de consulta con diseño moderno tipo "Buscar RX"
 * @param {string} idConsulta - ID de la consulta a mostrar
 * @param {boolean} modoEdicion - Si true, muestra inputs editables
 * @param {boolean} animar - Si false, no anima (para updates en tiempo real)
 */
function verDetalleConsulta(idConsulta, modoEdicion = false, animar = true) {
  const consultas = load(DB.CONSULTAS_CLINICAS);
  const consulta = consultas.find(c => c.id === idConsulta);

  if (!consulta) {
    toast('❌ Consulta no encontrada', 'error');
    return;
  }

  // Almacenar consulta actual
  consultaActualModal = consulta;
  modoEdicionActivo = modoEdicion;

  // Actualizar subtítulo del modal
  document.getElementById('modalHistorialSubtitulo').textContent =
    `${consulta.nombreCliente} - DNI: ${consulta.dniCliente} - ${consulta.fechaFormato}`;

  // Construir HTML con diseño tipo "Buscar RX"
  let detalleHTML = `
    <div style="padding: 24px;">

      <!-- ═══ HEADER CON TOGGLE DE MODO ═══ -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--primary-200);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 32px;">👓</span>
          <div>
            <div style="font-size: 20px; font-weight: 700; color: var(--primary-700);">
              PRESCRIPCIÓN DE LENTES
            </div>
            <div style="font-size: 13px; color: var(--neutral-600); margin-top: 4px;">
              ${modoEdicion ? '✏️ Modo Edición' : '👁️ Modo Visualización'}
            </div>
          </div>
        </div>

        <!-- Toggle Modo Edición/Visualización -->
        <div style="display: flex; gap: 8px;">
          ${!modoEdicion ? `
            <button onclick="verDetalleConsulta('${idConsulta}', true)"
                    style="padding: 10px 20px; background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
                           color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700;
                           box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); transition: transform 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
              ✏️ Modo Edición
            </button>
          ` : `
            <button onclick="guardarEdicionConsulta()"
                    style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669);
                           color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700;
                           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              💾 Guardar Cambios
            </button>
            <button onclick="verDetalleConsulta('${idConsulta}', false)"
                    style="padding: 10px 20px; background: var(--neutral-500);
                           color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700;">
              ❌ Cancelar
            </button>
          `}
        </div>
      </div>

      <!-- ═══ SERIE DETECTADA (BADGE) ═══ -->
      ${renderBadgeSerie(consulta)}

      <!-- ═══ SECCIÓN: VISIÓN DE LEJOS ═══ -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                  border-radius: 16px; padding: 24px; margin-bottom: 24px;
                  border: 3px solid var(--secondary-400); box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);">

        <h3 style="font-size: 18px; font-weight: 800; color: var(--secondary-700);
                   margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 28px;">🔭</span>
          VISIÓN DE LEJOS
        </h3>

        <!-- Grid de Medidas -->
        <div style="display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <!-- Headers -->
          <div></div>
          <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--secondary-800); padding: 8px;">ESF</div>
          <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--secondary-800); padding: 8px;">CIL</div>
          <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--secondary-800); padding: 8px;">EJE</div>
          <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--secondary-800); padding: 8px;">ADD</div>

          <!-- OJO DERECHO (OD) -->
          <div style="display: flex; align-items: center; font-weight: 800; color: var(--primary-700); font-size: 16px;">
            👁️ O.D.
          </div>
          ${renderCampoRX('medLejosEsfOD', consulta.medLejosEsfOD, modoEdicion, 'Esfera OD')}
          ${renderCampoRX('medLejosCilOD', consulta.medLejosCilOD, modoEdicion, 'Cilindro OD')}
          ${renderCampoRX('medLejosEjeOD', consulta.medLejosEjeOD, modoEdicion, 'Eje OD', 'number')}
          ${renderCampoRX('medLejosAdicionOD', consulta.medLejosAdicionOD, modoEdicion, 'Adición OD')}

          <!-- OJO IZQUIERDO (OI) -->
          <div style="display: flex; align-items: center; font-weight: 800; color: var(--secondary-700); font-size: 16px;">
            👁️ O.I.
          </div>
          ${renderCampoRX('medLejosEsfOI', consulta.medLejosEsfOI, modoEdicion, 'Esfera OI')}
          ${renderCampoRX('medLejosCilOI', consulta.medLejosCilOI, modoEdicion, 'Cilindro OI')}
          ${renderCampoRX('medLejosEjeOI', consulta.medLejosEjeOI, modoEdicion, 'Eje OI', 'number')}
          ${renderCampoRX('medLejosAdicionOI', consulta.medLejosAdicionOI, modoEdicion, 'Adición OI')}
        </div>

        <!-- Distancia Pupilar -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--secondary-800); margin-bottom: 6px;">
              📏 DISTANCIA PUPILAR OD
            </label>
            ${renderCampoRX('medLejosDistPupOD', consulta.medLejosDistPupOD, modoEdicion, 'DP OD', 'number', 'block')}
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--secondary-800); margin-bottom: 6px;">
              📏 DISTANCIA PUPILAR OI
            </label>
            ${renderCampoRX('medLejosDistPupOI', consulta.medLejosDistPupOI, modoEdicion, 'DP OI', 'number', 'block')}
          </div>
        </div>
      </div>

      <!-- ═══ SECCIÓN: VISIÓN DE CERCA ═══ -->
      ${consulta.medCercaEsfOD || consulta.medCercaEsfOI ? `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 16px; padding: 24px; margin-bottom: 24px;
                    border: 3px solid var(--warning-400); box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);">

          <h3 style="font-size: 18px; font-weight: 800; color: var(--warning-800);
                     margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 28px;">📖</span>
            VISIÓN DE CERCA
          </h3>

          <div style="display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 12px;">
            <div></div>
            <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--warning-900); padding: 8px;">ESF</div>
            <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--warning-900); padding: 8px;">CIL</div>
            <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--warning-900); padding: 8px;">EJE</div>
            <div style="text-align: center; font-weight: 700; font-size: 14px; color: var(--warning-900); padding: 8px;">ADD</div>

            <div style="display: flex; align-items: center; font-weight: 800; color: var(--primary-700); font-size: 16px;">👁️ O.D.</div>
            ${renderCampoRX('medCercaEsfOD', consulta.medCercaEsfOD, modoEdicion, 'Esfera Cerca OD')}
            ${renderCampoRX('medCercaCilOD', consulta.medCercaCilOD, modoEdicion, 'Cilindro Cerca OD')}
            ${renderCampoRX('medCercaEjeOD', consulta.medCercaEjeOD, modoEdicion, 'Eje Cerca OD', 'number')}
            ${renderCampoRX('medCercaAdicionOD', consulta.medCercaAdicionOD, modoEdicion, 'Adición Cerca OD')}

            <div style="display: flex; align-items: center; font-weight: 800; color: var(--secondary-700); font-size: 16px;">👁️ O.I.</div>
            ${renderCampoRX('medCercaEsfOI', consulta.medCercaEsfOI, modoEdicion, 'Esfera Cerca OI')}
            ${renderCampoRX('medCercaCilOI', consulta.medCercaCilOI, modoEdicion, 'Cilindro Cerca OI')}
            ${renderCampoRX('medCercaEjeOI', consulta.medCercaEjeOI, modoEdicion, 'Eje Cerca OI', 'number')}
            ${renderCampoRX('medCercaAdicionOI', consulta.medCercaAdicionOI, modoEdicion, 'Adición Cerca OI')}
          </div>
        </div>
      ` : ''}

      <!-- ═══ SECCIÓN: DIAGNÓSTICO ═══ -->
      ${renderDiagnostico(consulta)}

      <!-- ═══ SECCIÓN: OBSERVACIONES ═══ -->
      ${consulta.rxObservaciones || consulta.motivo ? `
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;
                    border-left: 5px solid var(--primary-500); box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-700); margin: 0 0 12px 0;">
            📝 Observaciones
          </h3>
          <p style="margin: 0; color: var(--neutral-700); line-height: 1.6;">
            ${consulta.rxObservaciones || consulta.motivo || 'Sin observaciones'}
          </p>
        </div>
      ` : ''}

      <!-- ═══ FOOTER: METADATOS ═══ -->
      <div style="padding-top: 20px; border-top: 2px solid var(--neutral-200);
                  display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: var(--neutral-600);">
          <strong>Usuario:</strong> ${consulta.usuario} |
          <strong>Establecimiento:</strong> ${consulta.establecimiento}
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="imprimirConsulta('${idConsulta}')"
                  style="padding: 8px 16px; background: var(--secondary-600); color: white;
                         border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🖨️ Imprimir
          </button>
          <button onclick="cerrarModalHistorial()"
                  style="padding: 8px 16px; background: var(--neutral-500); color: white;
                         border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            ✖️ Cerrar
          </button>
        </div>
      </div>

    </div>
  `;

  // Insertar en modal
  document.getElementById('modalHistorialContenido').innerHTML = detalleHTML;
  document.getElementById('modalHistorialConsulta').style.display = 'flex';

  // Animación de entrada
  if (animar) {
    setTimeout(() => {
      document.querySelector('.modal-historial-container').style.opacity = '1';
    }, 10);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4️⃣ FUNCIONES AUXILIARES DE RENDERIZADO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza un campo de RX (modo visualización o edición)
 */
function renderCampoRX(fieldName, value, modoEdicion, placeholder, tipo = 'text', display = 'inline') {
  const displayValue = value || '-';
  const blockStyle = display === 'block' ? 'display: block; width: 100%;' : '';

  if (modoEdicion) {
    return `
      <input type="${tipo}"
             id="edit_${fieldName}"
             value="${value || ''}"
             placeholder="${placeholder}"
             style="${blockStyle}
                    padding: 14px 16px;
                    border: 2px solid var(--primary-300);
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: 700;
                    text-align: center;
                    font-family: 'Courier New', monospace;
                    background: white;
                    transition: all 0.3s;
                    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);"
             onfocus="this.style.borderColor='var(--primary-600)'; this.style.boxShadow='0 0 0 4px rgba(139, 92, 246, 0.2)'"
             onblur="this.style.borderColor='var(--primary-300)'; this.style.boxShadow='0 2px 8px rgba(139, 92, 246, 0.2)'">
    `;
  } else {
    return `
      <div style="${blockStyle}
                   padding: 14px 16px;
                   background: white;
                   border-radius: 10px;
                   font-size: 22px;
                   font-weight: 800;
                   text-align: center;
                   font-family: 'Courier New', monospace;
                   color: var(--neutral-900);
                   border: 2px solid var(--neutral-200);
                   box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        ${displayValue}
      </div>
    `;
  }
}

/**
 * Renderiza badge de serie detectada
 */
function renderBadgeSerie(consulta) {
  // Detectar serie basándose en medidas
  const esfera = parseFloat(consulta.medLejosEsfOD) || 0;
  const cilindro = parseFloat(consulta.medLejosCilOD) || 0;

  let serie = 'Sin clasificar';
  let colorBg = 'var(--neutral-400)';

  if (Math.abs(cilindro) > 2.0) {
    serie = 'LABORATORIO';
    colorBg = '#f59e0b';
  } else if (Math.abs(esfera) >= -2.0 && Math.abs(esfera) <= 2.0) {
    serie = 'Serie 1';
    colorBg = '#10b981';
  } else if (Math.abs(esfera) <= 4.0) {
    serie = 'Serie 2';
    colorBg = '#3b82f6';
  } else if (Math.abs(esfera) <= 6.0) {
    serie = 'Serie 3';
    colorBg = '#8b5cf6';
  } else {
    serie = 'Serie 4';
    colorBg = '#ef4444';
  }

  return `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
                padding: 16px; background: linear-gradient(135deg, ${colorBg}15 0%, ${colorBg}25 100%);
                border-radius: 12px; border-left: 5px solid ${colorBg};">
      <span style="font-size: 24px;">🎯</span>
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--neutral-600); margin-bottom: 4px;">
          SERIE DETECTADA
        </div>
        <div style="font-size: 20px; font-weight: 800; color: ${colorBg};">
          ${serie}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza sección de diagnóstico
 */
function renderDiagnostico(consulta) {
  const diagnosticos = [];
  if (consulta.diagMiopia) diagnosticos.push('Miopía');
  if (consulta.diagHipermetropia) diagnosticos.push('Hipermetropía');
  if (consulta.diagAstigmatismo) diagnosticos.push('Astigmatismo');
  if (consulta.diagPresbicia) diagnosticos.push('Presbicia');
  if (consulta.diagAmbliopia) diagnosticos.push('Ambliopía');
  if (consulta.diagAnisometropia) diagnosticos.push('Anisometropía');

  if (diagnosticos.length === 0) return '';

  return `
    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border-radius: 12px; padding: 20px; margin-bottom: 20px;
                border-left: 5px solid var(--success-600);">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--success-900);
                 margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">🔍</span>
        DIAGNÓSTICO
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${diagnosticos.map(d => `
          <span style="padding: 6px 12px; background: white; border-radius: 20px;
                       font-size: 13px; font-weight: 700; color: var(--success-800);
                       box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);">
            ${d}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5️⃣ GUARDAR EDICIÓN DE CONSULTA
// ═══════════════════════════════════════════════════════════════════════════════

function guardarEdicionConsulta() {
  if (!consultaActualModal) {
    toast('❌ No hay consulta cargada', 'error');
    return;
  }

  // Recopilar valores editados
  const camposEditados = [
    'medLejosEsfOD', 'medLejosCilOD', 'medLejosEjeOD', 'medLejosAdicionOD',
    'medLejosEsfOI', 'medLejosCilOI', 'medLejosEjeOI', 'medLejosAdicionOI',
    'medLejosDistPupOD', 'medLejosDistPupOI',
    'medCercaEsfOD', 'medCercaCilOD', 'medCercaEjeOD', 'medCercaAdicionOD',
    'medCercaEsfOI', 'medCercaCilOI', 'medCercaEjeOI', 'medCercaAdicionOI'
  ];

  let consultaActualizada = { ...consultaActualModal };

  camposEditados.forEach(campo => {
    const input = document.getElementById(`edit_${campo}`);
    if (input) {
      consultaActualizada[campo] = input.value || '';
    }
  });

  // Actualizar en localStorage
  const consultas = load(DB.CONSULTAS_CLINICAS);
  const index = consultas.findIndex(c => c.id === consultaActualModal.id);

  if (index !== -1) {
    consultas[index] = consultaActualizada;
    save(DB.CONSULTAS_CLINICAS, consultas);

    toast('✅ Consulta actualizada exitosamente', 'success');

    // Notificar cambio a otras pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'CONSULTAS_CLINICAS',
      newValue: JSON.stringify(consultas)
    }));

    // Recargar en modo visualización
    verDetalleConsulta(consultaActualModal.id, false);
  } else {
    toast('❌ Error al guardar cambios', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6️⃣ ELIMINAR CONSULTA
// ═══════════════════════════════════════════════════════════════════════════════

function eliminarConsulta(idConsulta) {
  if (!confirm('⚠️ ¿Está seguro de eliminar este registro?\n\nEsta acción no se puede deshacer.')) {
    return;
  }

  const consultas = load(DB.CONSULTAS_CLINICAS);
  const index = consultas.findIndex(c => c.id === idConsulta);

  if (index !== -1) {
    consultas.splice(index, 1);
    save(DB.CONSULTAS_CLINICAS, consultas);

    toast('🗑️ Registro eliminado exitosamente', 'success');

    // Cerrar modal si está abierto
    if (consultaActualModal && consultaActualModal.id === idConsulta) {
      cerrarModalHistorial();
    }

    // Recargar tabla
    if (typeof renderizarTablaConsultorio === 'function') {
      renderizarTablaConsultorio();
    }
  } else {
    toast('❌ Error al eliminar registro', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7️⃣ CERRAR MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function cerrarModalHistorial() {
  document.getElementById('modalHistorialConsulta').style.display = 'none';
  consultaActualModal = null;
  modoEdicionActivo = false;
}

// Alias para compatibilidad
function cerrarDetalleConsulta() {
  cerrarModalHistorial();
}

console.log('✅ Módulo Consultorio 2.0 cargado - Sincronización Real-Time activa');

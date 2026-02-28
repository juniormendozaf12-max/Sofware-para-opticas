// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 THE OMNI-SYNC ENGINE V2.0 (Refactored & Fortified)
// ═══════════════════════════════════════════════════════════════════════════════
// Autor: Lead QA Engineer & V8 Performance Specialist
// Estado: PROTECTED MODE (Safe Initialization)
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // Configuración de IDs esperados (The Wiring)
    const SYNC_MAP = {
        // --- OJO DERECHO ---
        'od_esfera': ['txtEsferaOD', 'rxDistEsfOD', 'edit_medLejosEsfOD', 'print_od_esfera'],
        'od_cilindro': ['txtCilindroOD', 'rxDistCilOD', 'edit_medLejosCilOD', 'print_od_cilindro'],
        'od_eje': ['txtEjeOD', 'rxDistEjeOD', 'edit_medLejosEjeOD', 'print_od_eje'],
        'od_add': ['txtAddOD', 'rxDistAddOD', 'edit_medLejosAdicionOD'],
        'od_dip': ['txtDipOD', 'rxDistDipOD', 'edit_medLejosDipOD'],

        // --- OJO IZQUIERDO ---
        'oi_esfera': ['txtEsferaOI', 'rxDistEsfOI', 'edit_medLejosEsfOI', 'print_oi_esfera'],
        'oi_cilindro': ['txtCilindroOI', 'rxDistCilOI', 'edit_medLejosCilOI', 'print_oi_cilindro'],
        'oi_eje': ['txtEjeOI', 'rxDistEjeOI', 'edit_medLejosEjeOI', 'print_oi_eje'],
        'oi_add': ['txtAddOI', 'rxDistAddOI', 'edit_medLejosAdicionOI'],
        'oi_dip': ['txtDipOI', 'rxDistDipOD', 'edit_medLejosDipOD']
    };

    /**
     * 🏗️ INIT SYSTEM: Punto de entrada controlado
     * Garantiza que el DOM esté listo y valida dependencias críticas.
     */
    function initSystem() {
        console.group("🚀 OMNI-SYNC ENGINE V2.0: System Boot");
        const start = performance.now();

        // 1. Validación de Integridad del DOM (QA Step)
        validateDomIntegrity();

        // 2. Inicializar Proxy Global (RX_STATE) si no existe
        initRxState();

        // 3. Activar Event Listeners Globales (Event Delegation)
        activateEventDelegation();

        // 4. Hookear apertura de Modales/Wizard
        hookModalTriggers();

        const end = performance.now();
        console.log(`✅ System initialized in ${(end - start).toFixed(2)}ms`);
        console.groupEnd();
    }

    /**
     * 🔍 DOM INTEGRITY CHECK: Busca "fantasmas" (IDs definidos en código pero faltantes en HTML)
     */
    function validateDomIntegrity() {
        let missingCount = 0;
        console.log("🔍 Running integrity check on Sync Map...");

        for (const [key, idList] of Object.entries(SYNC_MAP)) {
            idList.forEach(id => {
                if (!document.getElementById(id)) {
                    console.warn(`⚠️ [DOM WARNING] ID not found: #${id} (Group: ${key}) - This input will not sync.`);
                    missingCount++;
                }
            });
        }

        if (missingCount === 0) {
            console.log("✨ DOM Integrity: 100% - All inputs linked.");
        } else {
            console.warn(`⚠️ DOM Integrity: ${missingCount} disconnected nodes detected. Check 'console.warn' above.`);
        }
    }

    /**
     * 📦 RX STATE: Inicialización del Store Global Reactivo
     */
    function initRxState() {
        if (window.RX_STATE) return; // Si ya existe, no recargamos

        console.log("📦 Initializing Reactive Store (RX_STATE)...");

        // Estado base
        const internalState = {
            esferaOD: '', cilindroOD: '', ejeOD: '', addOD: '', dipOD: '',
            esferaOI: '', cilindroOI: '', ejeOI: '', addOI: '', dipOI: ''
        };

        // Handler del Proxy
        const handler = {
            set: function (obj, prop, value) {
                // 1. Guardar valor real
                obj[prop] = value;

                // 2. Evitar loop infinito si la actualización viene del motor sync
                if (window._fromOmniSync) return true;

                // 3. Propagar cambios al DOM (Data Binding Bidireccional)
                // Encontrar a qué grupo pertenece esta propiedad
                const mapStateKeyReverse = {
                    'esferaOD': 'od_esfera', 'cilindroOD': 'od_cilindro', 'ejeOD': 'od_eje', 'addOD': 'od_add', 'dipOD': 'od_dip',
                    'esferaOI': 'oi_esfera', 'cilindroOI': 'oi_cilindro', 'ejeOI': 'oi_eje', 'addOI': 'oi_add', 'dipOI': 'oi_dip'
                };

                const groupKey = mapStateKeyReverse[prop];
                if (groupKey) {
                    console.log(`🔄 RX_STATE Update [${prop}] -> Syncing DOM Group [${groupKey}]`);
                    sincronizarHermanos(groupKey, value, null); // null = "System Update" (sin origen físico)
                }

                return true;
            }
        };

        // Asignar al global window
        window.RX_STATE = new Proxy(internalState, handler);
    }

    /**
     * ⚡ EVENT DELEGATION: El "V8 Optimized" Listener
     * Usa un solo listener en el body para manejar cientos de inputs potenciales.
     */
    function activateEventDelegation() {
        document.body.addEventListener('input', (e) => {
            const target = e.target;
            if (!target.id) return; // Ignorar elementos sin ID

            // Búsqueda rápida de grupo (O(1) promedio si usáramos un Map inverso, pero O(N) aquí es despreciable para <50 items)
            let matchKey = null;

            // Optimización: Solo buscar si el ID parece relevante (tiene 'esfera', 'cil', etc)
            // Esto reduce la carga en el Event Loop para inputs irrelevantes
            const idLower = target.id.toLowerCase();
            if (!idLower.includes('esfera') && !idLower.includes('cil') && !idLower.includes('eje') &&
                !idLower.includes('add') && !idLower.includes('dip') && !idLower.includes('txt')) {
                return;
            }

            for (const [key, ids] of Object.entries(SYNC_MAP)) {
                if (ids.includes(target.id)) {
                    matchKey = key;
                    break;
                }
            }

            if (matchKey) {
                // Sincronizar UI
                sincronizarHermanos(matchKey, target.value, target.id);

                // Actualizar Estado Global (sin disparar loop)
                actualizarProxyGlobal(matchKey, target.value);
            }
        });
    }

    /**
     * 🔄 CORE SYNC LOGIC: Robustez ante nulos
     */
    function sincronizarHermanos(key, valor, origenId) {
        const ids = SYNC_MAP[key];
        if (!ids) return;

        ids.forEach(id => {
            // No loops sobre sí mismo
            if (id === origenId) return;

            const element = document.getElementById(id);
            if (element) {
                // Solo escribir si el valor es diferente para evitar reflows innecesarios
                if (element.value !== valor) {
                    element.value = valor;
                    iluminarInput(element); // Feedback visual
                }
            }
        });

        // Trigger colateral: Recálculo de precios
        if (typeof window.recalcularPreciosWizard === 'function' &&
            (key.includes('esfera') || key.includes('cilindro'))) {
            clearTimeout(window._debounceCalc);
            window._debounceCalc = setTimeout(() => window.recalcularPreciosWizard(), 300);
        }
    }

    function iluminarInput(element) {
        // Feedback visual sutil (Non-blocking UI update)
        requestAnimationFrame(() => {
            element.style.transition = "background-color 0.2s ease";
            element.style.backgroundColor = "#f0fdf4"; // green-50
            element.style.borderColor = "#4ade80"; // green-400

            setTimeout(() => {
                element.style.backgroundColor = "";
                element.style.borderColor = "";
            }, 600);
        });
    }

    function actualizarProxyGlobal(key, valor) {
        if (!window.RX_STATE) return;

        const mapState = {
            'od_esfera': 'esferaOD', 'od_cilindro': 'cilindroOD', 'od_eje': 'ejeOD', 'od_add': 'addOD', 'od_dip': 'dipOD',
            'oi_esfera': 'esferaOI', 'oi_cilindro': 'cilindroOI', 'oi_eje': 'ejeOI', 'oi_add': 'addOI', 'oi_dip': 'dipOI'
        };

        const prop = mapState[key];
        if (prop) {
            window._fromOmniSync = true;
            window.RX_STATE[prop] = valor;
            window._fromOmniSync = false;
        }
    }

    /**
     * 🎣 HOOKS: Interceptores de Legacy Code
     */
    function hookModalTriggers() {
        // Interceptamos la apertura del Wizard para rehidratar valores
        const _originalAbrir = window.abrirWizardLunasInteligente;

        window.abrirWizardLunasInteligente = function (datos) {
            console.log("🎣 Hook: Wizard Opening detected. Preparing hydration...");

            if (_originalAbrir) {
                try {
                    _originalAbrir(datos);
                } catch (e) {
                    console.error("❌ Error in original abrirWizardLunasInteligente:", e);
                }
            }

            // Rehidratación segura después de que el modal renderice
            setTimeout(() => {
                console.log("💧 Rehydrating Wizard inputs from RX_STATE...");
                if (window.RX_STATE) {
                    hydrateWizardInputs();
                }
            }, 100); // 100ms para asegurar renderizado del modal
        };
    }

    function hydrateWizardInputs() {
        Object.keys(SYNC_MAP).forEach(key => {
            // Buscamos cuál es el input ID del 'wizard' en este grupo (generalmente empieza con 'txt')
            const wizardId = SYNC_MAP[key].find(id => id.startsWith('txt'));
            if (!wizardId) return;

            const el = document.getElementById(wizardId);
            const mapStateKey = {
                'od_esfera': 'esferaOD', 'od_cilindro': 'cilindroOD', 'od_eje': 'ejeOD', 'od_add': 'addOD', 'od_dip': 'dipOD',
                'oi_esfera': 'esferaOI', 'oi_cilindro': 'cilindroOI', 'oi_eje': 'ejeOI', 'oi_add': 'addOI', 'oi_dip': 'dipOI'
            }[key];

            const savedValue = window.RX_STATE[mapStateKey];

            if (el && savedValue !== undefined && savedValue !== '') {
                console.log(`💧 Hydrating ${wizardId} with value: ${savedValue}`);
                el.value = savedValue;
                iluminarInput(el);
            }
        });
    }

    // 🚀 BOOTSTRAP (V8 Engine Start)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSystem);
    } else {
        initSystem(); // Si el script carga después del DOMContentLoaded
    }

})();

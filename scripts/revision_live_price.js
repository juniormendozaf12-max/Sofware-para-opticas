
    // ============================================================================================
    // 🚀 LIVE PRICING ENGINE V4 (MOTOR DE PRECIOS EN TIEMPO REAL)
    // Implementación solicitada por el usuario para reactividad milimétrica.
    // ============================================================================================

    // 1. FUNCIÓN GLOBAL PARA OBTENER SERIE (STRICT MODE)
    window.obtenerSerieGlobal = function() {
       const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;
       
       const od = { esf: getVal('txtEsferaOD'), cil: getVal('txtCilindroOD') };
       const oi = { esf: getVal('txtEsferaOI'), cil: getVal('txtCilindroOI') };

       // Helper para usar la lógica de calcularPrecioLunas
       const getSerieForEye = (esf, cil) => {
           // Usamos 'BLUE' como material base para testear la serie, ya que la serie es independiente del material mayormente
           const res = calcularPrecioLunas(esf, cil, 'BLUE');
           if (res.esLaboratorio) return 99; // 99 = Laboratorio
           const serieNum = parseInt(res.serie.replace('SERIE_', ''));
           return isNaN(serieNum) ? 99 : serieNum;
       };

       const serieOD = getSerieForEye(od.esf, od.cil);
       const serieOI = getSerieForEye(oi.esf, oi.cil);

       const maxSerie = Math.max(serieOD, serieOI);

       return maxSerie === 99 ? 'LABORATORIO' : maxSerie.toString();
    };

    // 2. RENDERIZADO REACTIVO DE MATERIALES
    window.renderizarOpcionesMaterial = function() {
       console.log("🎨 Renderizando Opciones de Material (Live)...");
       
       const serieIds = ['txtEsferaOD', 'txtCilindroOD', 'txtEsferaOI', 'txtCilindroOI'];
       // Verificar si elementos existen
       if (!document.getElementById('txtEsferaOD')) return;

       const odEsf = parseFloat(document.getElementById('txtEsferaOD').value) || 0;
       const odCil = parseFloat(document.getElementById('txtCilindroOD').value) || 0;
       const oiEsf = parseFloat(document.getElementById('txtEsferaOI').value) || 0;
       const oiCil = parseFloat(document.getElementById('txtCilindroOI').value) || 0;

       const materiales = ['BLUE', 'POLY_BLUE', 'DIPPING'];
       const contenedor = document.getElementById('gridSeleccionMateriales');
       if (!contenedor) return;

       contenedor.innerHTML = ''; // Limpiar previo

       materiales.forEach(matKey => {
           // Calcular precio COMBINADO (OD + OI)
           // La lógica de negocio suele ser: Precio Par = Precio de la serie más alta aplicada a ambos, o suma individual.
           // Asumiremos suma individual para precisión, o precio par base si es venta de par.
           // Pero calcularPrecioLunas devuelve precio UNITARIO y precio PAR de esa medida.
           
           // Estrategia: Calcular OD y OI por separado.
           const resOD = calcularPrecioLunas(odEsf, odCil, matKey);
           const resOI = calcularPrecioLunas(oiEsf, oiCil, matKey);

           // Determinar si es Laboratorio Global
           const esLab = resOD.esLaboratorio || resOI.esLaboratorio;
           const serieGlobal = window.obtenerSerieGlobal(); // String '1', '2', '3', 'LABORATORIO'

           // Precio Visual: Si es lab, mostrar "COTIZAR". Si no, mostrar la suma o el precio del par de la serie mayor.
           // Simplificación: Usar el precio de la serie más alta calculada.
           let precioMostrado = 0;
           let precioLabel = '';
           
           if (esLab) {
               precioLabel = 'COTIZAR';
           } else {
               // Tomamos el precio del par de la serie más alta (Peor escenario)
               // Esto es estándar en ópticas: si un ojo es Serie 3 y otro Serie 1, se cobra Serie 3 el par, o suma.
               // Vamos a usar la serie global calculada.
               
               // Recalcular con la serie global para obtener precio consistente
               // Truco: Usar calcularPrecioLunas simulando la "peor" medida para obtener el precio de lista de esa serie
               // O mejor, confiar en lo que devuelve calcularPrecioLunas para cada ojo y sumar.
               // PERO: La UI muestra "1 LUNA S/ X" y "PAR (2) S/ Y".
               
               // Vamos a mostrar el precio de la SERIE GLOBAL.
               const precioRef = Math.max(resOD.precioPar, resOI.precioPar);
               precioMostrado = precioRef;
               precioLabel = `S/ ${precioMostrado}`;
           }

           const nombre = PRECIO_LUNAS_CONFIG[matKey].nombre;
           const badgeCls = esLab ? 'bg-slate-800 text-white' : `bg-${getColorSerie(serieGlobal)}-100 text-${getColorSerie(serieGlobal)}-700`;
           
           const card = document.createElement('div');
           card.className = "material-card-v4";
           card.style.cssText = "border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; transition:all 0.2s; cursor:pointer; background:white;";
           card.innerHTML = `
               <div style="text-align:center; margin-bottom:12px;">
                   <div class="badge-serie ${badgeCls}" style="display:inline-block; padding:4px 12px; border-radius:20px; font-weight:800; font-size:12px; margin-bottom:8px;">
                       ${esLab ? 'LABORATORIO' : 'SERIE ' + serieGlobal}
                   </div>
                   <h3 style="margin:0; color:#1e293b; font-size:18px;">${nombre}</h3>
               </div>
               
               <div style="display:flex; gap:8px;">
                   <button onclick="window.preseleccionarLuna('${matKey}', ${precioMostrado/2}, ${precioMostrado}, 1)" 
                       style="flex:1; padding:12px; border-radius:12px; border:2px solid #e2e8f0; background:white; font-weight:700;">
                       <div style="font-size:10px; color:#64748b; text-transform:uppercase;">1 Luna</div>
                       <div style="font-size:16px; color:#334155;">${esLab ? '---' : 'S/ ' + (precioMostrado/2).toFixed(0)}</div>
                   </button>
                   <button onclick="window.preseleccionarLuna('${matKey}', ${precioMostrado/2}, ${precioMostrado}, 2)"
                       style="flex:1; padding:12px; border-radius:12px; border:none; background:${esLab ? '#334155' : '#f59e0b'}; color:white; font-weight:700; box-shadow:0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                       <div style="font-size:10px; opacity:0.9; text-transform:uppercase;">Par (2)</div>
                       <div style="font-size:20px;">${precioLabel}</div>
                   </button>
               </div>
           `;
           contenedor.appendChild(card);
       });
    };

    function getColorSerie(s) {
        if(s==='1') return 'green';
        if(s==='2') return 'blue';
        if(s==='3') return 'orange';
        if(s==='4') return 'red';
        return 'gray';
    }

    // 3. ACTIVACIÓN DE SENSORES
    setTimeout(() => {
        const inputsRX = ['txtEsferaOD', 'txtCilindroOD', 'txtEjeOD', 'txtEsferaOI', 'txtCilindroOI', 'txtEjeOI'];
        inputsRX.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Eliminar listeners anteriores si es necesario (clonando) o simplemente agregar
                el.addEventListener('input', () => {
                   window.renderizarOpcionesMaterial();
                });
                console.log(`✅ Sensor Live Price activado para: ${id}`);
            }
        });
        // Primer render inicial
        window.renderizarOpcionesMaterial();
    }, 1000); // Delay seguro para asegurar carga de modales


# -*- coding: utf-8 -*-
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Funciones JavaScript para Lunas
funciones_lunas = """
    // ====== MÓDULO LUNAS ======
    const PRECIOS_LUNAS_DEFAULT = {
      esferico: [80, 90, 100, 110, 120],
      combinado: [110, 130, 150],
      altoIndice: [180, 250],
      cristalEsf: [70],
      cristalComb: [90],
      bifocal: [120, 140],
      progresivo: [200, 350, 450],
      incremento: [5]
    };

    function cambiarTabLunas(tab) {
      // Ocultar todos los tabs
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

      // Mostrar el tab seleccionado
      const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.classList.add('active');
      }

      // Actualizar botones
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      // Cargar precios guardados
      cargarPreciosLunas();
    }

    function cargarPreciosLunas() {
      const preciosGuardados = load(DB.PRECIOS_LUNAS || 'precios_lunas') || {};

      // Cargar Esféricos
      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById('precioEsf' + i);
        if (input) {
          input.value = preciosGuardados['esferico_' + i] || PRECIOS_LUNAS_DEFAULT.esferico[i-1];
        }
      }

      // Cargar Combinados
      for (let i = 1; i <= 3; i++) {
        const input = document.getElementById('precioComb' + i);
        if (input) {
          input.value = preciosGuardados['combinado_' + i] || PRECIOS_LUNAS_DEFAULT.combinado[i-1];
        }
      }

      // Cargar Alto Índice
      for (let i = 1; i <= 2; i++) {
        const input = document.getElementById('precioAlto' + i);
        if (input) {
          input.value = preciosGuardados['altoIndice_' + i] || PRECIOS_LUNAS_DEFAULT.altoIndice[i-1];
        }
      }

      // Cargar Cristales
      const cristEsf = document.getElementById('precioCristEsf');
      if (cristEsf) cristEsf.value = preciosGuardados['cristalEsf_1'] || PRECIOS_LUNAS_DEFAULT.cristalEsf[0];

      const cristComb = document.getElementById('precioCristComb');
      if (cristComb) cristComb.value = preciosGuardados['cristalComb_1'] || PRECIOS_LUNAS_DEFAULT.cristalComb[0];

      // Cargar Bifocales
      for (let i = 1; i <= 2; i++) {
        const input = document.getElementById('precioBifocal' + i);
        if (input) {
          input.value = preciosGuardados['bifocal_' + i] || PRECIOS_LUNAS_DEFAULT.bifocal[i-1];
        }
      }

      // Cargar Progresivos
      for (let i = 1; i <= 3; i++) {
        const input = document.getElementById('precioProg' + i);
        if (input) {
          input.value = preciosGuardados['progresivo_' + i] || PRECIOS_LUNAS_DEFAULT.progresivo[i-1];
        }
      }

      // Cargar Incremento
      const incremento = document.getElementById('precioIncremento');
      if (incremento) incremento.value = preciosGuardados['incremento_1'] || PRECIOS_LUNAS_DEFAULT.incremento[0];
    }

    function guardarPrecioLuna(tipo, nivel) {
      const preciosGuardados = load(DB.PRECIOS_LUNAS || 'precios_lunas') || {};

      let inputId = '';
      let nombreTipo = '';

      switch(tipo) {
        case 'esferico':
          inputId = 'precioEsf' + nivel;
          nombreTipo = 'Esférico nivel ' + nivel;
          break;
        case 'combinado':
          inputId = 'precioComb' + nivel;
          nombreTipo = 'Combinado nivel ' + nivel;
          break;
        case 'altoIndice':
          inputId = 'precioAlto' + nivel;
          nombreTipo = 'Alto Índice ' + (nivel === 1 ? '1.67' : '1.74');
          break;
        case 'cristalEsf':
          inputId = 'precioCristEsf';
          nombreTipo = 'Cristal Esférico';
          break;
        case 'cristalComb':
          inputId = 'precioCristComb';
          nombreTipo = 'Cristal Combinado';
          break;
        case 'bifocal':
          inputId = 'precioBifocal' + nivel;
          nombreTipo = 'Bifocal tipo ' + nivel;
          break;
        case 'progresivo':
          inputId = 'precioProg' + nivel;
          nombreTipo = 'Progresivo ' + (nivel === 1 ? 'Económico' : nivel === 2 ? 'Intermedio' : 'Premium');
          break;
        case 'incremento':
          inputId = 'precioIncremento';
          nombreTipo = 'Incremento Cilindro';
          break;
      }

      const input = document.getElementById(inputId);
      if (!input) {
        toast('❌ Error al guardar precio', 'error');
        return;
      }

      const precio = parseFloat(input.value) || 0;

      if (precio < 0) {
        toast('❌ El precio no puede ser negativo', 'error');
        return;
      }

      // Guardar en localStorage
      preciosGuardados[tipo + '_' + nivel] = precio;
      save(DB.PRECIOS_LUNAS || 'precios_lunas', preciosGuardados);

      toast(`✅ Precio guardado: ${nombreTipo} = S/ ${precio.toFixed(2)}`, 'success');
    }

    function abrirSelectorLunasVenta() {
      if (!clienteActual) {
        toast('❌ Seleccione un cliente primero en el módulo Ventas', 'error');
        return;
      }

      toast('ℹ️ Selector de Lunas para Ventas en desarrollo', 'info');
    }

    function calcularPrecioLuna(esferico, cilindro, tipo) {
      const preciosGuardados = load(DB.PRECIOS_LUNAS || 'precios_lunas') || {};
      let precioBase = 0;

      const esf = Math.abs(parseFloat(esferico) || 0);
      const cil = Math.abs(parseFloat(cilindro) || 0);

      // Determinar si es combinado
      const esCombinado = cil > 0;

      if (tipo === 'esferico' && !esCombinado) {
        // Rangos esféricos
        if (esf >= 0.25 && esf <= 1.00) {
          precioBase = preciosGuardados['esferico_1'] || PRECIOS_LUNAS_DEFAULT.esferico[0];
        } else if (esf >= 1.25 && esf <= 2.00) {
          precioBase = preciosGuardados['esferico_2'] || PRECIOS_LUNAS_DEFAULT.esferico[1];
        } else if (esf >= 2.25 && esf <= 3.00) {
          precioBase = preciosGuardados['esferico_3'] || PRECIOS_LUNAS_DEFAULT.esferico[2];
        } else if (esf >= 3.25 && esf <= 4.00) {
          precioBase = preciosGuardados['esferico_4'] || PRECIOS_LUNAS_DEFAULT.esferico[3];
        } else if (esf >= 4.25 && esf <= 6.00) {
          precioBase = preciosGuardados['esferico_5'] || PRECIOS_LUNAS_DEFAULT.esferico[4];
        }
      } else if (tipo === 'combinado' || esCombinado) {
        // Rangos combinados
        if (esf >= 0.25 && esf <= 2.00) {
          precioBase = preciosGuardados['combinado_1'] || PRECIOS_LUNAS_DEFAULT.combinado[0];
        } else if (esf >= 2.25 && esf <= 4.00) {
          precioBase = preciosGuardados['combinado_2'] || PRECIOS_LUNAS_DEFAULT.combinado[1];
        } else if (esf >= 4.25 && esf <= 6.00) {
          precioBase = preciosGuardados['combinado_3'] || PRECIOS_LUNAS_DEFAULT.combinado[2];
        }

        // Agregar incremento por cilindro
        const incremento = preciosGuardados['incremento_1'] || PRECIOS_LUNAS_DEFAULT.incremento[0];
        const unidadesCilindro = Math.floor(cil / 0.25);
        precioBase += incremento * unidadesCilindro;
      }

      return precioBase;
    }

    // Inicializar precios al cargar
    setTimeout(() => {
      cargarPreciosLunas();
    }, 500);
"""

# Buscar dónde insertar (antes del console.log final)
insert_pos = content.rfind("    console.log(' Sistema cargado correctamente');")

if insert_pos == -1:
    print('ERROR - No se encontró la posición de inserción')
else:
    # Insertar las funciones
    content = content[:insert_pos] + funciones_lunas + '\n' + content[insert_pos:]

    # Guardar
    with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print('OK - Funciones Lunas agregadas - Tamaño:', len(content), 'chars')

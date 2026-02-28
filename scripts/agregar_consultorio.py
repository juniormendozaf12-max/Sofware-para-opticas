# -*- coding: utf-8 -*-
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Código a agregar
nuevo_codigo = """
    // ====== MÓDULO CONSULTORIO ======
    let pacienteConsultorioActual = null;

    function buscarPacienteConsultorio() {
      const busqueda = document.getElementById('buscarPacienteConsultorio').value.trim().toLowerCase();
      if (!busqueda) {
        toast('❌ Ingrese texto para buscar', 'error');
        return;
      }

      const clientes = load(DB.CLIENTES);
      const resultados = clientes.filter(c => {
        const texto = [c.nombre || '', c.apellidos || '', c.dni || ''].join(' ').toLowerCase();
        return texto.includes(busqueda);
      });

      if (resultados.length === 0) {
        toast('❌ No se encontraron pacientes', 'error');
        return;
      }

      if (resultados.length === 1) {
        seleccionarPacienteConsultorio(resultados[0]);
      } else {
        mostrarSelectorPacientesConsultorio(resultados);
      }
    }

    function seleccionarPacienteConsultorio(cliente) {
      pacienteConsultorioActual = cliente;
      document.getElementById('nombrePacienteConsultorio').value = `${cliente.nombre} ${cliente.apellidos || ''}`;
      document.getElementById('dniPacienteConsultorio').value = cliente.dni || 'N/A';
      document.getElementById('edadPacienteConsultorio').value = cliente.edad || 'N/A';
      document.getElementById('ocupacionPacienteConsultorio').value = cliente.ocupacion || 'N/A';
      document.getElementById('datosPacienteConsultorio').style.display = 'grid';
      toast('✅ Paciente seleccionado: ' + cliente.nombre, 'success');
      cargarExamenesConsultorio();
    }

    function mostrarSelectorPacientesConsultorio(clientes) {
      window._pacientesConsultorioTemp = clientes;
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      let html = '<div style="max-height: 400px; overflow-y: auto;">';
      clientes.forEach(c => {
        html += `<div style="padding: 12px; border: 1px solid #ddd; margin: 5px 0; border-radius: 8px; cursor: pointer;" onclick="seleccionarPacienteDesdeModalConsultorio('${c.id}')">
          <strong>${c.nombre} ${c.apellidos || ''}</strong><br>
          <small>DNI: ${c.dni} | Edad: ${c.edad || 'N/A'}</small>
        </div>`;
      });
      html += '</div>';
      overlay.innerHTML = `<div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">👤 Seleccione Paciente (${clientes.length})</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button>
        </div>
        ${html}
      </div>`;
      document.body.appendChild(overlay);
    }

    function seleccionarPacienteDesdeModalConsultorio(id) {
      const cliente = window._pacientesConsultorioTemp.find(c => c.id === id);
      if (cliente) {
        seleccionarPacienteConsultorio(cliente);
        document.querySelector('.modal-overlay').remove();
      }
    }

    function nuevoClienteDesdeConsultorio() {
      nuevoCliente();
    }

    function nuevoExamenConsultorio() {
      if (!pacienteConsultorioActual) {
        toast('❌ Seleccione un paciente primero', 'error');
        return;
      }

      clienteActual = pacienteConsultorioActual;
      document.getElementById('modalRX').classList.add('active');
      document.getElementById('tituloModalRX').innerHTML = `👁️ Nuevo Examen - <span id="nombrePacienteRX">${pacienteConsultorioActual.nombre} ${pacienteConsultorioActual.apellidos || ''}</span>`;

      document.getElementById('rxPaciente').value = `${pacienteConsultorioActual.nombre} ${pacienteConsultorioActual.apellidos || ''}`;
      document.getElementById('rxOcupacion').value = pacienteConsultorioActual.ocupacion || '';
      document.getElementById('rxEdad').value = pacienteConsultorioActual.edad || '';
      document.getElementById('rxFecha').value = today();
    }

    function cargarExamenesConsultorio() {
      const tbody = document.getElementById('tablaExamenesConsultorio');
      if (!tbody) return;

      const medidas = load(DB.MEDIDAS);
      let examenes = medidas;

      if (pacienteConsultorioActual) {
        examenes = medidas.filter(m => m.clienteId === pacienteConsultorioActual.id);
      }

      examenes.sort((a, b) => new Date(b.fecha || b.fechaCreacion) - new Date(a.fecha || a.fechaCreacion));

      if (examenes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px;">No hay exámenes registrados</td></tr>';
        return;
      }

      tbody.innerHTML = examenes.map(e => {
        const fechaExamen = e.fecha || new Date(e.fechaCreacion).toISOString().split('T')[0];
        const proximaCita = e.proximaCita ? new Date(e.proximaCita).toLocaleDateString('es-PE') : 'N/A';
        return `<tr>
          <td>${fechaExamen}</td>
          <td>${e.clienteNombre}</td>
          <td>${e.edad || 'N/A'}</td>
          <td>${e.especialista || 'N/A'}</td>
          <td><span style="background: ${e.tipo === 'PROPIA' ? '#10b981' : '#3b82f6'}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${e.tipo || 'PROPIA'}</span></td>
          <td>${proximaCita}</td>
          <td>
            <button class="btn btn-info btn-sm" onclick="verExamenConsultorio('${e.id}')" title="Ver">👁️ Ver</button>
            <button class="btn btn-primary btn-sm" onclick="editarExamenConsultorio('${e.id}')" title="Editar">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarExamenConsultorio('${e.id}')" title="Eliminar">🗑️ Eliminar</button>
          </td>
        </tr>`;
      }).join('');
    }

    function verExamenConsultorio(id) {
      const medidas = load(DB.MEDIDAS);
      const examen = medidas.find(m => m.id === id);
      if (!examen) {
        toast('❌ Examen no encontrado', 'error');
        return;
      }

      const clientes = load(DB.CLIENTES);
      const cliente = clientes.find(c => c.id === examen.clienteId);
      if (cliente) {
        clienteActual = cliente;
      }

      document.getElementById('modalRX').classList.add('active');
      document.getElementById('tituloModalRX').innerHTML = `👁️ Ver Examen - <span id="nombrePacienteRX">${examen.clienteNombre}</span>`;

      document.getElementById('rxPaciente').value = examen.clienteNombre;
      document.getElementById('rxOcupacion').value = examen.ocupacion || '';
      document.getElementById('rxEdad').value = examen.edad || '';
      document.getElementById('rxFecha').value = examen.fecha || '';
      document.getElementById('rxProximaCita').value = examen.proximaCita || '';
      document.getElementById('rxEspecialista').value = examen.especialista || '';

      const radioPropia = document.querySelector('input[name="rxTipo"][value="PROPIA"]');
      const radioExterna = document.querySelector('input[name="rxTipo"][value="EXTERNA"]');
      if (examen.tipo === 'EXTERNA') {
        radioExterna.checked = true;
      } else {
        radioPropia.checked = true;
      }
    }

    function editarExamenConsultorio(id) {
      verExamenConsultorio(id);
      toast('ℹ️ Modo edición activado', 'info');
    }

    function eliminarExamenConsultorio(id) {
      const medidas = load(DB.MEDIDAS);
      const examen = medidas.find(m => m.id === id);
      if (!examen) {
        toast('❌ Examen no encontrado', 'error');
        return;
      }

      if (!confirm(`¿Está seguro de eliminar el examen de:\\n${examen.clienteNombre}\\nFecha: ${examen.fecha}?`)) {
        return;
      }

      const medidasFiltradas = medidas.filter(m => m.id !== id);
      save(DB.MEDIDAS, medidasFiltradas);
      toast('✅ Examen eliminado', 'success');
      cargarExamenesConsultorio();
    }
"""

# Buscar y reemplazar antes del cierre del script
old_text = "    console.log(' Sistema cargado correctamente');"
new_text = nuevo_codigo + "\n    console.log('✅ Sistema cargado correctamente');"

content = content.replace(old_text, new_text)

# Guardar
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK - Modulo Consultorio agregado - Tamaño:', len(content), 'chars')

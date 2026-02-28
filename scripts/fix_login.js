// ===== LOGIN CORREGIDO =====
let tipoUsuarioActual = '';
let restriccionesUsuario = null;

function intentarLogin() {
  const usuario = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const establecimiento = document.getElementById('loginEstablecimiento').value;

  const errorDiv = document.getElementById('loginError');

  if (!usuario || !password || !establecimiento) {
    errorDiv.textContent = 'Complete todos los campos';
    errorDiv.classList.add('show');
    return;
  }

  const credenciales = USUARIOS[establecimiento];

  // Normalizar usuario (sin tildes y minúsculas)
  const usuarioNorm = usuario.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Verificar si el usuario coincide
  const usuarioValido = credenciales.usuarios.some(u => {
    const uNorm = u.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return uNorm === usuarioNorm;
  });

  if (usuarioValido && password === credenciales.password) {
    establecimientoActual = establecimiento;
    usuarioActual = usuario;
    tipoUsuarioActual = credenciales.tipo;
    restriccionesUsuario = credenciales.restricciones || null;

    actualizarDB();

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainSystem').classList.add('active');

    const nombreEstab = establecimiento === 'DOS_DE_MAYO' ? 'Centro Óptico - Dos de Mayo' : establecimiento === 'PLAZA_DE_ARMAS' ? 'Óptica Sicuani - Plaza de Armas' : 'Usuario de Ventas';
    document.getElementById('nombreEstablecimiento').innerHTML = `👤 ${nombreEstab}`;

    toast('✅ Bienvenido - ' + usuario, 'success');

    // Aplicar restricciones si es vendedor
    if (tipoUsuarioActual === 'VENDEDOR') {
      aplicarRestriccionesVendedor();
    }

    // Inicializar fecha de hoy
    document.getElementById('fechaEmision').value = today();
    document.getElementById('fechaVencimiento').value = today();
  } else {
    errorDiv.textContent = 'Usuario o contraseña incorrectos';
    errorDiv.classList.add('show');
  }
}

function aplicarRestriccionesVendedor() {
  // Ocultar módulos restringidos
  const botonesRibbon = document.querySelectorAll('.ribbon-btn');
  botonesRibbon.forEach(btn => {
    const modulo = btn.getAttribute('onclick');
    if (!modulo) return;

    if (modulo.includes('consultorio') || modulo.includes('almacen') ||
        modulo.includes('reportes') || modulo.includes('configuracion') ||
        modulo.includes('importacion') || modulo.includes('caja')) {
      btn.style.display = 'none';
    }
  });

  toast('⚠️ Permisos de VENDEDOR activados', 'info');
}

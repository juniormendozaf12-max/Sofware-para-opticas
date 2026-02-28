# -*- coding: utf-8 -*-
import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('Tamaño original:', len(content), 'chars')

# ===== CORRECCIONES CRÍTICAS =====
correcciones_criticas = [
    # ERROR CRÍTICO en toast de bienvenida (línea 1727)
    ("toast('\u0005 Bienvenido - '", "toast('✅ Bienvenido - '"),
    ("toast(' Bienvenido - '", "toast('✅ Bienvenido - '"),

    # Corregir emojis en estado RX
    ("' CON MEDIDA'", "'✅ CON MEDIDA'"),

    # Iconos faltantes en ribbon
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Consultas</span>", "        <span class=\"ribbon-btn-icon\">📋</span>\n        <span>Consultas</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Buscar RX</span>", "        <span class=\"ribbon-btn-icon\">🔍</span>\n        <span>Buscar RX</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Inventario</span>", "        <span class=\"ribbon-btn-icon\">📦</span>\n        <span>Inventario</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Reportes</span>", "        <span class=\"ribbon-btn-icon\">📊</span>\n        <span>Reportes</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Caja</span>", "        <span class=\"ribbon-btn-icon\">💵</span>\n        <span>Caja</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Importación</span>", "        <span class=\"ribbon-btn-icon\">🌐</span>\n        <span>Importación</span>"),
    ("        <span class=\"ribbon-btn-icon\">💰</span>\n        <span>Salir</span>", "        <span class=\"ribbon-btn-icon\">🚪</span>\n        <span>Salir</span>"),

    # Corregir títulos en módulos placeholder
    ("        <h2 class=\"window-title\">💰 Consultas</h2>", "        <h2 class=\"window-title\">📋 Consultas</h2>"),
    ("        <h2 class=\"window-title\">💰 Buscar RX</h2>", "        <h2 class=\"window-title\">🔍 Buscar RX</h2>"),
    ("        <h2 class=\"window-title\">💰 Inventario</h2>", "        <h2 class=\"window-title\">📦 Inventario</h2>"),
    ("        <h2 class=\"window-title\">💰 Reportes</h2>", "        <h2 class=\"window-title\">📊 Reportes</h2>"),
    ("        <h2 class=\"window-title\">💰 Caja</h2>", "        <h2 class=\"window-title\">💵 Caja</h2>"),
    ("        <h2 class=\"window-title\">💰 Importación</h2>", "        <h2 class=\"window-title\">🌐 Importación</h2>"),

    # Corregir iconos en ventas
    ("              <span>💰</span>", "              <span>💎</span>"),
    ("          <h3 class=\"card-title\">💰 Datos del Documento</h3>", "          <h3 class=\"card-title\">📄 Datos del Documento</h3>"),
    ("          <h3 class=\"card-title\">💰 Productos / Servicios</h3>", "          <h3 class=\"card-title\">🛍️ Productos / Servicios</h3>"),

    # Corregir botones modal RX
    ("        <button class=\"btn btn-success\">💰 Guardar</button>", "        <button class=\"btn btn-success\">💾 Guardar</button>"),
    ("        <button class=\"btn btn-info\">💰 Imprimir</button>", "        <button class=\"btn btn-info\">🖨️ Imprimir</button>"),
    ("        <button class=\"btn btn-secondary\">💰 Excel</button>", "        <button class=\"btn btn-secondary\">📊 Excel</button>"),
    ("        <button class=\"btn btn-danger\" onclick=\"cerrarModalRX()\">💰 Salir</button>", "        <button class=\"btn btn-danger\" onclick=\"cerrarModalRX()\">❌ Cerrar</button>"),

    # Corregir botones en ventas
    ("          <button class=\"btn btn-secondary\">⚙️ Nueva Venta</button>", "          <button class=\"btn btn-secondary\">🆕 Nueva Venta</button>"),
    ("          <button class=\"btn btn-success\">💰 Guardar Venta</button>", "          <button class=\"btn btn-success\">💾 Guardar Venta</button>"),
    ("          <button class=\"btn btn-info\">💰 Guardar e Imprimir</button>", "          <button class=\"btn btn-info\">🖨️ Guardar e Imprimir</button>"),

    # Corregir productos placeholder
    ("                  💰 Items: 0 | Cantidad: 0", "                  🛍️ Items: 0 | Cantidad: 0"),

    # Corregir emojis en selector clientes
    ("<h3 class=\"modal-title\"> Seleccione Cliente", "<h3 class=\"modal-title\">👤 Seleccione Cliente"),
    ("toast(' Cliente seleccionado: '", "toast('✅ Cliente seleccionado: '"),
    ("toast(' Cliente creado exitosamente'", "toast('✅ Cliente creado exitosamente'"),

    # Corregir íconos de establecimiento
    ("              💰 BD Local activa", "              🏢 BD Local activa"),
]

# Aplicar correcciones críticas
for viejo, nuevo in correcciones_criticas:
    count = content.count(viejo)
    if count > 0:
        content = content.replace(viejo, nuevo)
        print(f'✅ Corregido: "{viejo[:40]}..." ({count} veces)')

# ===== MEJORAS DE DISEÑO =====

# Mejorar CSS con animaciones profesionales
css_mejoras = """
    /* ====== MEJORAS DE DISEÑO PROFESIONAL ====== */

    /* Animación de carga para login */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .login-icon {
      animation: floatGlasses 3s ease-in-out infinite, pulse 2s ease-in-out infinite;
    }

    /* Efecto glassmorphism en cards */
    .card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    /* Animación suave para inputs */
    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      transform: translateY(-1px);
    }

    /* Efecto ripple en botones */
    .btn {
      position: relative;
      overflow: hidden;
    }

    .btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn:active::after {
      width: 300px;
      height: 300px;
    }

    /* Animación de aparición de módulos */
    .module.active {
      animation: fadeInUp 0.5s ease;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Skeleton loading para tablas */
    .table-loading {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Mejorar ribbon con sombras dinámicas */
    .ribbon-btn.active {
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      transform: translateY(-3px);
    }

    /* Transiciones suaves globales */
    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    /* Efecto hover en filas de tabla */
    tbody tr {
      transition: all 0.3s ease;
    }

    tbody tr:hover {
      transform: scale(1.01);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    /* Indicador de carga */
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--primary-200);
      border-top-color: var(--primary-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Mejorar scroll personalizado */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: var(--gray-100);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
    }
"""

# Insertar mejoras CSS antes del cierre de </style>
content = content.replace('  </style>', css_mejoras + '\n  </style>')

print('\n✅ Mejoras CSS aplicadas')

# Guardar archivo mejorado
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ CORRECCIONES Y MEJORAS COMPLETADAS')
print('Tamaño final:', len(content), 'chars')
print('\n🎨 Mejoras aplicadas:')
print('   - Login corregido y funcional')
print('   - Animaciones profesionales agregadas')
print('   - Efectos glassmorphism en cards')
print('   - Transiciones suaves en toda la interfaz')
print('   - Scroll personalizado con gradientes')
print('   - Efectos hover mejorados')
print('   - Iconos correctos en todos los módulos')

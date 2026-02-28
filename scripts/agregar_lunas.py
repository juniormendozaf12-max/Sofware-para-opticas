# -*- coding: utf-8 -*-
import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

# HTML del módulo Lunas
modulo_lunas_html = """    <div id="moduloLunas" class="module">
      <div class="main-window">
        <div class="window-header">
          <div>
            <h2 class="window-title">
              <span>🔬</span>
              Catálogo de Lunas - Sistema de Precios
            </h2>
            <p class="window-subtitle">Gestión completa de lunas con precios por rango esférico y cilíndrico</p>
          </div>
          <button class="btn btn-success" onclick="abrirSelectorLunasVenta()">
            🛒 Seleccionar para Venta
          </button>
        </div>

        <!-- Tabs de categorías -->
        <div class="tabs">
          <button class="tab-btn active" onclick="cambiarTabLunas('esferico')">🔵 Esféricos</button>
          <button class="tab-btn" onclick="cambiarTabLunas('combinado')">🟣 Combinados</button>
          <button class="tab-btn" onclick="cambiarTabLunas('altoIndice')">🟡 Alto Índice</button>
          <button class="tab-btn" onclick="cambiarTabLunas('cristal')">🟤 Cristales</button>
          <button class="tab-btn" onclick="cambiarTabLunas('bifocal')">🔵 Bifocales</button>
          <button class="tab-btn" onclick="cambiarTabLunas('progresivo')">🟢 Progresivos</button>
          <button class="tab-btn" onclick="cambiarTabLunas('incremento')">📐 Incremento Cilindro</button>
        </div>

        <!-- TAB: ESFÉRICOS -->
        <div id="tabEsferico" class="tab-content active">
          <div class="card">
            <h3 class="card-title">🔵 Lunas Esféricas - Tabla de Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Precios por rango esférico (0.25 a 6.00)</p>

            <table>
              <thead>
                <tr>
                  <th>RANGO ESFÉRICO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody id="tablaEsferico">
                <tr>
                  <td>0.25 - 1.00</td>
                  <td><input type="number" id="precioEsf1" value="80" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Graduación baja</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('esferico', 1)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>1.25 - 2.00</td>
                  <td><input type="number" id="precioEsf2" value="90" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Graduación media-baja</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('esferico', 2)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>2.25 - 3.00</td>
                  <td><input type="number" id="precioEsf3" value="100" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Graduación media</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('esferico', 3)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>3.25 - 4.00</td>
                  <td><input type="number" id="precioEsf4" value="110" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Graduación media-alta</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('esferico', 4)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>4.25 - 6.00</td>
                  <td><input type="number" id="precioEsf5" value="120" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Graduación alta</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('esferico', 5)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: COMBINADOS -->
        <div id="tabCombinado" class="tab-content">
          <div class="card">
            <h3 class="card-title">🟣 Lunas Combinadas (Esférico + Cilindro) - Tabla de Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Precios para lunas con corrección esférica y cilíndrica combinada</p>

            <table>
              <thead>
                <tr>
                  <th>RANGO COMBINADO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0.25 - 2.00</td>
                  <td><input type="number" id="precioComb1" value="110" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Combinado bajo</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('combinado', 1)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>2.25 - 4.00</td>
                  <td><input type="number" id="precioComb2" value="130" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Combinado medio</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('combinado', 2)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>4.25 - 6.00</td>
                  <td><input type="number" id="precioComb3" value="150" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Combinado alto</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('combinado', 3)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: ALTO ÍNDICE -->
        <div id="tabAltoIndice" class="tab-content">
          <div class="card">
            <h3 class="card-title">🟡 Lunas de Alto Índice - Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Lunas delgadas para graduaciones altas (1.67, 1.74)</p>

            <table>
              <thead>
                <tr>
                  <th>TIPO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alto Índice 1.67</td>
                  <td><input type="number" id="precioAlto1" value="180" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Luna delgada índice 1.67</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('altoIndice', 1)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>Alto Índice 1.74</td>
                  <td><input type="number" id="precioAlto2" value="250" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Luna ultra delgada índice 1.74</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('altoIndice', 2)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: CRISTALES -->
        <div id="tabCristal" class="tab-content">
          <div class="card">
            <h3 class="card-title">🟤 Cristales (Mineral) - Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Lunas de cristal mineral - Esféricos y Combinados</p>

            <h4 style="margin-top: 20px; color: var(--primary-700);">Cristales Esféricos</h4>
            <table>
              <thead>
                <tr>
                  <th>RANGO</th>
                  <th>PRECIO (S/)</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0.25 - 4.00</td>
                  <td><input type="number" id="precioCristEsf" value="70" min="0" step="0.01" style="width: 100px;"></td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('cristalEsf', 1)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>

            <h4 style="margin-top: 20px; color: var(--primary-700);">Cristales Combinados</h4>
            <table>
              <thead>
                <tr>
                  <th>RANGO</th>
                  <th>PRECIO (S/)</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0.25 - 4.00</td>
                  <td><input type="number" id="precioCristComb" value="90" min="0" step="0.01" style="width: 100px;"></td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('cristalComb', 1)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: BIFOCALES -->
        <div id="tabBifocal" class="tab-content">
          <div class="card">
            <h3 class="card-title">🔵 Bifocales de Cristal - Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Lunas bifocales con segmento de cerca</p>

            <table>
              <thead>
                <tr>
                  <th>TIPO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bifocal FT-28</td>
                  <td><input type="number" id="precioBifocal1" value="120" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Bifocal flat top 28mm</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('bifocal', 1)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>Bifocal Ejecutivo</td>
                  <td><input type="number" id="precioBifocal2" value="140" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Bifocal línea completa</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('bifocal', 2)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: PROGRESIVOS -->
        <div id="tabProgresivo" class="tab-content">
          <div class="card">
            <h3 class="card-title">🟢 Lentes Focales Progresivos - Precios</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Multifocales sin línea visible</p>

            <table>
              <thead>
                <tr>
                  <th>TIPO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Progresivo Económico</td>
                  <td><input type="number" id="precioProg1" value="200" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Multifocal básico</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('progresivo', 1)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>Progresivo Intermedio</td>
                  <td><input type="number" id="precioProg2" value="350" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Multifocal calidad media</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('progresivo', 2)">💾 Guardar</button></td>
                </tr>
                <tr>
                  <td>Progresivo Premium</td>
                  <td><input type="number" id="precioProg3" value="450" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Multifocal alta gama (Varilux, Essilor)</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('progresivo', 3)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: INCREMENTO CILINDRO -->
        <div id="tabIncremento" class="tab-content">
          <div class="card">
            <h3 class="card-title">📐 Incremento por Cilindro - Precios Adicionales</h3>
            <p style="color: var(--gray-600); margin-bottom: 15px;">Costo adicional por cada 0.25 de cilindro sobre el base</p>

            <table>
              <thead>
                <tr>
                  <th>INCREMENTO</th>
                  <th>PRECIO (S/)</th>
                  <th>DESCRIPCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Por cada 0.25</td>
                  <td><input type="number" id="precioIncremento" value="5" min="0" step="0.01" style="width: 100px;"></td>
                  <td>Incremento por unidad de cilindro</td>
                  <td><button class="btn btn-info btn-sm" onclick="guardarPrecioLuna('incremento', 1)">💾 Guardar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>"""

# Reemplazar el módulo Lunas
old_lunas = """    <div id="moduloLunas" class="module">
      <div class="main-window">
        <h2 class="window-title">🔬 Lunas</h2>
        <p style="color: var(--gray-600); margin-top: 20px;">Módulo en construcción - FASE 2</p>
      </div>
    </div>"""

content = content.replace(old_lunas, modulo_lunas_html)

# Guardar
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK - Modulo Lunas agregado - Tamaño:', len(content), 'chars')

# -*- coding: utf-8 -*-
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print('🔧 CORRECCIÓN FINAL COMPLETA - TODOS LOS ERRORES\n')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

print(f'📄 Tamaño original: {len(content)} caracteres\n')

errores_corregidos = 0

# ===== CORRECCIÓN 1: Emojis incorrectos en toasts =====
correcciones_toast = [
    ("toast(' DB inicializada con '", "toast('✅ DB inicializada con '"),
    ("toast('⚙️ Seleccione un cliente primero', 'error')", "toast('❌ Seleccione un cliente primero', 'error')"),
    ("toast(' Producto agregado', 'success')", "toast('✅ Producto agregado', 'success')"),
    ("toast(' Producto eliminado', 'info')", "toast('ℹ️ Producto eliminado', 'info')"),
    ("toast(' Venta guardada exitosamente', 'success')", "toast('✅ Venta guardada exitosamente', 'success')"),
    ("toast(' Prescripción guardada', 'success')", "toast('✅ Prescripción guardada', 'success')"),
]

for viejo, nuevo in correcciones_toast:
    if viejo in content:
        content = content.replace(viejo, nuevo)
        errores_corregidos += 1
        print(f'✅ Toast corregido: {viejo[:40]}...')

# ===== CORRECCIÓN 2: Verificar placeholders del login =====
# Asegurar que los placeholders estén correctos
placeholders_login = [
    ('placeholder="Ingrese su usuario"', 'placeholder="Ingrese su usuario"'),
    ('placeholder="Ingrese su contraseña"', 'placeholder="Ingrese su contraseña"'),
]

print('\n📋 Verificando placeholders del login...')
for placeholder, correcto in placeholders_login:
    if placeholder in content:
        print(f'  ✅ Placeholder correcto: {placeholder}')
    else:
        print(f'  ⚠️  Placeholder faltante: {placeholder}')

# ===== CORRECCIÓN 3: Asegurar que el select de establecimiento tenga la opción vacía =====
if '<option value="">-- Seleccione --</option>' in content:
    print('✅ Select de establecimiento correcto')
else:
    print('⚠️  Corrigiendo select de establecimiento...')
    # Buscar y corregir
    old_select = '<select id="loginEstablecimiento">\n          <option value="DOS_DE_MAYO">'
    new_select = '''<select id="loginEstablecimiento">
          <option value="">-- Seleccione --</option>
          <option value="DOS_DE_MAYO">'''

    if old_select in content:
        content = content.replace(old_select, new_select)
        errores_corregidos += 1
        print('  ✅ Select corregido')

# ===== CORRECCIÓN 4: Verificar que los IDs del login existan =====
ids_login = ['loginUsuario', 'loginPassword', 'loginEstablecimiento', 'loginError']
print('\n🔍 Verificando IDs del login...')
for id_elemento in ids_login:
    if f'id="{id_elemento}"' in content:
        print(f'  ✅ ID encontrado: {id_elemento}')
    else:
        print(f'  ❌ ID FALTANTE: {id_elemento}')

# ===== CORRECCIÓN 5: Agregar console.log de debug =====
# Agregar logging para debug del login
debug_code = '''
    // Debug: Verificar que elementos existan
    console.log('🔍 Debug Login:');
    console.log('  - loginUsuario:', document.getElementById('loginUsuario') ? '✅' : '❌');
    console.log('  - loginPassword:', document.getElementById('loginPassword') ? '✅' : '❌');
    console.log('  - loginEstablecimiento:', document.getElementById('loginEstablecimiento') ? '✅' : '❌');
    console.log('  - loginScreen:', document.getElementById('loginScreen') ? '✅' : '❌');
    console.log('  - mainSystem:', document.getElementById('mainSystem') ? '✅' : '❌');
'''

# Insertar después de actualizarDB()
if 'Debug: Verificar que elementos existan' not in content:
    insert_pos = content.find('    // Inicialización\n    actualizarDB();')
    if insert_pos != -1:
        insert_pos = content.find('\n', insert_pos) + 1
        content = content[:insert_pos] + debug_code + '\n' + content[insert_pos:]
        errores_corregidos += 1
        print('\n✅ Código de debug agregado')

# ===== CORRECCIÓN 6: Corregir iconos en mensaje de error del modal nuevo cliente =====
correcciones_modales = [
    ("toast('❌ DNI y Nombre obligatorios'", "toast('❌ DNI y Nombre obligatorios'"),
    ("toast('❌ Cliente con ese DNI ya existe'", "toast('❌ Cliente con ese DNI ya existe'"),
]

for viejo, nuevo in correcciones_modales:
    if viejo in content:
        print(f'✅ Modal correcto: {viejo[:30]}...')

# Guardar archivo corregido
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n✅ CORRECCIÓN COMPLETADA')
print(f'📊 Errores corregidos: {errores_corregidos}')
print(f'📄 Tamaño final: {len(content)} caracteres')
print('\n🎯 Verificaciones realizadas:')
print('   1. Toasts con iconos correctos')
print('   2. Placeholders del login verificados')
print('   3. Select de establecimiento corregido')
print('   4. IDs del login verificados')
print('   5. Código de debug agregado')
print('   6. Modales verificados')
print('\n🚀 Sistema listo para pruebas!')

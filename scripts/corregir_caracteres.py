# -*- coding: utf-8 -*-
import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Leer archivo
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('Tamaño original:', len(content), 'chars')

# Mapeo de correcciones de caracteres corruptos
correcciones = [
    # Botones de login (CRÍTICO)
    ('\u0013 Entrar', '➡️ Entrar'),
    ('\u0017 Salir', '❌ Salir'),

    # Iconos corruptos en interfaz
    ('ó\u000f', '⚙️'),
    ('\u000f', ''),

    # Separadores de comentarios JavaScript
    ('=====🔍', '====='),
    ('===== 🔍', '====='),

    # Toast icons (CRÍTICO)
    ("success: '\u0013'", "success: '✅'"),
    ("error: '\u0017'", "error: '❌'"),
    ("info: '9'", "info: 'ℹ️'"),

    # Estado RX sin medida
    ('ó SIN MEDIDA', '⚠️ SIN MEDIDA'),

    # Otros caracteres especiales corruptos
    ('=\u0004', '⚙️'),
    ('💰\u000f', '💰'),

    # Console log
    ("console.log(' Sistema cargado correctamente');", "console.log('✅ Sistema cargado correctamente');"),
]

# Aplicar todas las correcciones
for viejo, nuevo in correcciones:
    count = content.count(viejo)
    if count > 0:
        content = content.replace(viejo, nuevo)
        print(f'✅ Corregido: "{viejo[:30]}" -> "{nuevo[:30]}" ({count} veces)')

# Guardar archivo corregido
with open(r'c:\Users\Usuario\Pictures\Proyetcos de Optiabi\NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ CORRECCIONES COMPLETADAS')
print('Tamaño final:', len(content), 'chars')

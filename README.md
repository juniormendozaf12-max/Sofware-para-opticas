# Centro Optico Sicuani - Sistema POS v7.0

Sistema completo de gestion para opticas. Aplicacion single-file HTML con almacenamiento en localStorage.

## Estructura del Proyecto

```
Proyetcos de Optiabi/
|-- Trabajando_todo_p.html            # ARCHIVO PRINCIPAL (produccion)
|-- Copia_seguridad.html              # Backup con correcciones CSS
|-- Copia_seguridad_ULTRA_LIGHT.html  # Version optimizada para PCs de gama baja
|-- .env                              # Credenciales Supabase (NO se sube a GitHub)
|-- .env.example                      # Template de credenciales
|-- .gitignore                        # Archivos excluidos de Git
|-- README.md                         # Este archivo
|
|-- Imagenes/                         # Assets del sistema (logos, iconos)
|-- docs/                             # Documentacion tecnica y guias
|-- scripts/                          # Scripts auxiliares (JS, Python, C#)
|-- _archivo_viejo/                   # Backups y revisiones anteriores (gitignored)
|
|-- Abrir_en_Chrome.bat               # Lanzadores rapidos Windows
|-- Abrir_en_Brave.bat
|-- Abrir_en_Edge.bat
|-- ABRIR_SISTEMA_RAPIDO.bat
|-- INICIAR_SISTEMA.bat
|-- Iniciar_Servidor_Local.bat
```

## Como Usar

1. **Abrir directamente**: Doble clic en `Trabajando_todo_p.html` o usar los archivos `.bat`
2. **PCs de gama baja**: Usar `Copia_seguridad_ULTRA_LIGHT.html` (sin animaciones ni efectos)

## Modulos del Sistema

| Modulo | Descripcion |
|--------|-------------|
| Ventas (POS) | Punto de venta con scanner QR, wizard de lunas, carrito |
| Inventario | Productos, stock, codigos de barras, etiquetas |
| Lunas Matrix | Inventario de lunas V6 con grilla 25x25, precios por serie |
| Consultorio | Consultas oftalmologicas, prescripciones, historial |
| Caja | Apertura/cierre de caja, movimientos, reportes |
| Almacen | Guias de remision, kardex, ingresos/salidas |
| Clientes | Base de datos de pacientes/clientes |
| Reportes | Estadisticas, graficos, exportacion CSV |
| Configuracion | Usuarios, roles, permisos, establecimientos |

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript vanilla (single-file)
- **Almacenamiento**: localStorage (datos locales en el navegador)
- **Base de datos futura**: Supabase (PostgreSQL + API REST)
- **Repositorio**: GitHub

## Supabase (Configuracion Futura)

Las credenciales de Supabase estan en `.env` (no se suben a GitHub).
Copiar `.env.example` como `.env` y llenar con tus datos.

## GitHub

- **Repositorio**: https://github.com/juniormendozaf12-max/Sofware-para-opticas
- **Branch principal**: `main`

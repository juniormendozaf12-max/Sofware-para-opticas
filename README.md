# Centro Optico Sicuani - Sistema POS v7.0

Sistema completo de gestion para opticas. Incluye aplicacion desktop (single-file HTML) y app web/movil (React + Capacitor).

## Estructura del Proyecto

```
optical-atelier/
|-- CENTRO OPTICO SICUANI SOFWARE.html  # Desktop: archivo principal (58K lineas)
|-- centro-optico-sicuani-app.html      # Desktop: version app standalone
|-- src/                                # Web App: React + TypeScript
|   |-- components/                     # Componentes React
|   |-- lib/                            # Servicios, utilidades, Supabase
|   |-- types.ts                        # Interfaces TypeScript
|-- android/                            # Capacitor Android (APK)
|-- .env.example                        # Template de credenciales
```

## Web App (React)

**Stack**: React 19 + TypeScript 5.8 + Vite 6.2 + Tailwind CSS 4

```bash
npm install
npm run dev       # Desarrollo local
npm run build     # Build produccion
```

### Build APK
```bash
npm run build
npx cap sync android
# En Android Studio o con gradlew:
cd android && ./gradlew assembleDebug
```

## Modulos del Sistema

| Modulo | Descripcion |
|--------|-------------|
| Ventas (POS) | Punto de venta con vista Normal y TPV, scanner QR |
| Inventario | Productos, stock, codigos de barras |
| Lunas Matrix | Inventario de lunas con grilla, precios por serie |
| Consultorio | Consultas oftalmologicas, prescripciones, historial |
| Pacientes | Base de datos de pacientes/clientes |
| Dashboard | Estadisticas, ventas del dia, resumen |

## Tecnologias

- **Desktop**: HTML5, CSS3, JavaScript vanilla (single-file)
- **Web App**: React 19, TypeScript, Tailwind CSS 4, Vite
- **Mobile**: Capacitor 6 (Android APK)
- **Base de datos**: Supabase (PostgreSQL)
- **AI**: Google Gemini (transcripcion, analisis clinico)
- **Auth**: Demo login + Firebase Auth (Google OAuth)

## Supabase

Las credenciales de Supabase estan en `.env` (no se suben a GitHub).
Copiar `.env.example` como `.env` y llenar con tus datos.

## GitHub

- **Repositorio**: https://github.com/juniormendozaf12-max/Sofware-para-opticas
- **Branch principal**: `main`

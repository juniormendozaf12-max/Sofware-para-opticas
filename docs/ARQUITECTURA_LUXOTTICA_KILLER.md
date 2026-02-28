# 🏛️ ARQUITECTURA LUXOTTICA KILLER - CENTRO ÓPTICO SICUANI
## Sistema Enterprise de Próxima Generación

---

## 🎯 VISIÓN GENERAL

Un sistema que **supera** a Luxottica, Essilor y GMO combinando:
- ✅ **Validación Paramétrica** inteligente de lunas
- ✅ **Sincronización en Tiempo Real** Ventas ⟷ RX
- ✅ **IA Predictiva** para recomendaciones
- ✅ **Integración Total** Hardware + Software
- ✅ **Facturación Electrónica** SUNAT automatizada
- ✅ **UX Nivel Apple** que impresiona al cliente

---

## 📊 STACK TECNOLÓGICO PROPUESTO

```mermaid
graph TB
    subgraph Frontend
        A[React 18 + TypeScript]
        B[TailwindCSS + Framer Motion]
        C[React Query + Zustand]
    end

    subgraph Backend
        D[.NET 8 Web API]
        E[Entity Framework Core]
        F[SignalR - Tiempo Real]
    end

    subgraph Database
        G[SQL Server 2022]
        H[Redis Cache]
    end

    subgraph Integraciones
        I[SUNAT API]
        J[WhatsApp Business API]
        K[Impresora Térmica ESC/POS]
        L[Escáner Barras USB-HID]
    end

    A --> D
    D --> G
    D --> H
    D --> I
    D --> J
    F --> A
    L --> A
    K --> A
```

---

## 🗄️ MODELO DE DATOS - ESTRUCTURA BASE

### ENTIDADES PRINCIPALES (Esperando tus respuestas para detalles)

```mermaid
erDiagram
    PATIENTS ||--o{ PRESCRIPTIONS : "tiene"
    PRESCRIPTIONS ||--o{ SALES_ORDERS : "genera"
    SALES_ORDERS ||--|{ SALES_ITEMS : "contiene"
    LENS_PRODUCTS ||--|| LENS_RULES : "tiene reglas"
    FRAMES ||--o{ TRYON_HISTORY : "registra pruebas"
    FRAMES ||--o{ SALES_ITEMS : "se vende"
    LENS_PRODUCTS ||--o{ SALES_ITEMS : "se vende"

    PATIENTS {
        int Id PK
        string FullName
        string DNI UK
        date BirthDate
        string Phone
        string Email
        string Address
        datetime CreatedAt
        bool IsActive
    }

    PRESCRIPTIONS {
        int Id PK
        int PatientId FK
        string OD_Sphere
        string OD_Cylinder
        int OD_Axis
        string OD_Addition
        string OI_Sphere
        string OI_Cylinder
        int OI_Axis
        string OI_Addition
        decimal PD_Distance
        decimal PD_Near
        string LensType
        int ComplexityScore "1-10"
        int OptometristId FK
        datetime ExamDate
        bool IsValid
        string Notes
    }

    LENS_PRODUCTS {
        int Id PK
        string SKU UK
        string MaterialCode "CR39, PC, HI167"
        string Brand
        string Type "SV, BIF, PROG"
        string Treatment "HC, AR, UV, BLUE"
        decimal RefractiveIndex
        int MinDiameter
        int MaxDiameter
        decimal BasePrice
        bool IsActive
    }

    LENS_RULES {
        int Id PK
        int LensProductId FK
        decimal SphereMin
        decimal SphereMax
        decimal CylinderMin
        decimal CylinderMax
        int AxisMin
        int AxisMax
        bool AllowHighPrescription
        string RestrictionNotes
    }

    FRAMES {
        int Id PK
        string Barcode UK
        string Brand
        string Model
        string Color
        string Material "Metal, Acetato, Al Aire"
        int EyeSize
        int Bridge
        int TempleLength
        decimal DBL
        string Gender
        decimal Price
        string ImageUrl
        int Stock
        bool IsActive
    }

    TRYON_HISTORY {
        int Id PK
        int PatientId FK
        int FrameId FK
        datetime TriedAt
        bool WasPurchased
        string SalespersonNotes
    }

    SALES_ORDERS {
        int Id PK
        string OrderNumber UK
        int PatientId FK
        int PrescriptionId FK
        int SalespersonId FK
        decimal Subtotal
        decimal Discount
        decimal Tax
        decimal Total
        decimal Deposit
        decimal Balance
        string PaymentMethod
        string OrderStatus "Pending, Processing, Ready, Delivered, Cancelled"
        datetime OrderDate
        datetime ExpectedDeliveryDate
        datetime DeliveredAt
        string Notes
        string SunatDocumentType "Boleta, Factura"
        string SunatXmlPath
        string SunatPdfPath
        bool IsSunatSent
        datetime SunatSentAt
    }

    SALES_ITEMS {
        int Id PK
        int SalesOrderId FK
        string ItemType "Frame, Lens, Accessory"
        int FrameId FK "nullable"
        int LensProductId FK "nullable"
        int Quantity
        decimal UnitPrice
        decimal Discount
        decimal Total
        string Notes
    }
```

---

## 🎨 UI/UX VANGUARDISTA - WIREFRAMES CONCEPTUALES

### 1. LENS ENGINE - Visualizador de Espesores

```
╔════════════════════════════════════════════════════════════════╗
║  🔬 SIMULADOR DE ESPESOR - COMPARACIÓN INTELIGENTE            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  RX: OD -8.00 / -2.00 x 90°  |  Montura: Ray-Ban 52mm        ║
║                                                                ║
║  ┌─────────────────────┐  ┌─────────────────────┐            ║
║  │   CR-39 (1.50)      │  │  Alto Índice 1.67   │            ║
║  │                     │  │                     │            ║
║  │   ╔═══════════╗     │  │   ╔═══════╗         │            ║
║  │   ║███████████║     │  │   ║███████║         │            ║
║  │   ║███████████║     │  │   ║███████║         │            ║
║  │   ║███████████║     │  │   ║███████║         │            ║
║  │   ╚═══════════╝     │  │   ╚═══════╝         │            ║
║  │                     │  │                     │            ║
║  │  ⚠️ 9.8mm BORDE     │  │  ✅ 5.2mm BORDE     │            ║
║  │  💰 S/ 180          │  │  💰 S/ 420          │            ║
║  │  ⏱️ 3 días          │  │  ⏱️ 5 días          │            ║
║  └─────────────────────┘  └─────────────────────┘            ║
║                                                                ║
║  💡 RECOMENDACIÓN: Alto Índice reduce 47% el grosor           ║
║     Cliente notará diferencia estética significativa          ║
║                                                                ║
║  [ ✅ AGREGAR AL PEDIDO ]  [ 📊 VER MÁS OPCIONES ]           ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 2. SMART FRAME SELECTOR - Escáner Integrado

```
╔════════════════════════════════════════════════════════════════╗
║  👓 SELECTOR INTELIGENTE DE MONTURAS                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  [🔍 Buscar por código...]  [📷 Escanear]  [⭐ Favoritos]    ║
║                                                                ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ║
║  ┃ 🎯 ESCÁNER ACTIVO - Acerque código de barras            ┃ ║
║  ┃    [████████████████░░░░░░░░░░░░] Esperando...         ┃ ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ║
║                                                                ║
║  ✅ DETECTADO: Ray-Ban RB5150 - Tartaruga                     ║
║                                                                ║
║  ┌────────────────┐  ┌─────────────────────────────────────┐ ║
║  │   [FOTO 360°]  │  │  📏 ESPECIFICACIONES TÉCNICAS       │ ║
║  │                │  │                                     │ ║
║  │   🖼️ Ray-Ban   │  │  • Ojo: 52mm                        │ ║
║  │   Acetato      │  │  • Puente: 18mm                     │ ║
║  │                │  │  • Brazo: 145mm                     │ ║
║  │                │  │  • DBL: 70mm                        │ ║
║  └────────────────┘  │  • Material: Acetato Italiano       │ ║
║                      │  • Peso: 28g                        │ ║
║  💰 S/ 450.00        └─────────────────────────────────────┘ ║
║  📦 Stock: 2 unid.                                            ║
║                                                                ║
║  ✅ COMPATIBLE con RX: -8.00 (Requiere Alto Índice)           ║
║  ⚠️ ALERTA: Montura mediana - verificar centrado óptico       ║
║                                                                ║
║  [➕ AGREGAR A PROBADORES]  [🛒 AGREGAR AL PEDIDO]           ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 3. DUAL VIEW SYSTEM - Clínico vs Vendedor

#### MODO CLÍNICO (Optometrista)
```
╔════════════════════════════════════════════════════════════════╗
║  🔬 EXAMEN OPTOMÉTRICO - MODO TÉCNICO                         ║
╠════════════════════════════════════════════════════════════════╣
║  Paciente: Juan Pérez  |  DNI: 12345678  |  Edad: 35 años    ║
║                                                                ║
║  ┌─── OJO DERECHO (OD) ───────┐  ┌─── OJO IZQUIERDO (OI) ───┐║
║  │ Esfera:    [-8.00 ▼]      │  │ Esfera:    [-7.75 ▼]     │║
║  │ Cilindro:  [-2.00 ▼]      │  │ Cilindro:  [-1.75 ▼]     │║
║  │ Eje:       [90° ⟲]        │  │ Eje:       [85° ⟲]       │║
║  │ Adición:   [+2.50 ▼]      │  │ Adición:   [+2.50 ▼]     │║
║  │ AV Lejos:  [20/40 ▼]      │  │ AV Lejos:  [20/50 ▼]     │║
║  │ AV Cerca:  [J2 ▼]         │  │ AV Cerca:  [J3 ▼]        │║
║  └───────────────────────────┘  └──────────────────────────┘ ║
║                                                                ║
║  DP Lejos: [62mm]  DP Cerca: [58mm]  Altura: [18mm]          ║
║                                                                ║
║  📊 PUNTUACIÓN DE COMPLEJIDAD: ████████░░ 8/10 (ALTA)         ║
║     • Miopía Alta: Sí                                         ║
║     • Astigmatismo Alto: Sí                                   ║
║     • Progresivo: Sí                                          ║
║     • Anisometropía: Leve                                     ║
║                                                                ║
║  💡 RECOMENDACIÓN AUTOMÁTICA:                                 ║
║     • Material: Alto Índice 1.67 o 1.74                       ║
║     • Diseño: Progresivo Premium (Varilux Physio)             ║
║     • Montura: Pasta completa / Evitar al aire                ║
║                                                                ║
║  📝 Notas Clínicas:                                           ║
║  [_________________________________________________________]  ║
║                                                                ║
║  [💾 GUARDAR EXAMEN]  [📊 VER HISTORIAL]  [🖨️ IMPRIMIR RX]   ║
╚════════════════════════════════════════════════════════════════╝
```

#### MODO VENDEDOR (Simplificado)
```
╔════════════════════════════════════════════════════════════════╗
║  🛒 NUEVA VENTA - MODO RÁPIDO                                 ║
╠════════════════════════════════════════════════════════════════╣
║  Cliente: Juan Pérez  |  RX Disponible: Sí (Hace 2 días)     ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │  👓 RECETA CARGADA AUTOMÁTICAMENTE                     │  ║
║  │                                                         │  ║
║  │  OD: -8.00 -2.00 x 90° (+2.50)                         │  ║
║  │  OI: -7.75 -1.75 x 85° (+2.50)                         │  ║
║  │                                                         │  ║
║  │  🎯 Tipo: PROGRESIVO  |  ⚠️ Graduación ALTA            │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  💰 COTIZACIÓN INTELIGENTE:                                   ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │  🏆 OPCIÓN RECOMENDADA (AUTO-FILTRADA)                 │  ║
║  │                                                         │  ║
║  │  Montura Ray-Ban Acetato           S/   450.00         │  ║
║  │  Lunas Varilux Physio 1.67         S/ 1,200.00         │  ║
║  │  Tratamiento AR + Blue Light       S/   180.00         │  ║
║  │                                    ──────────────       │  ║
║  │  SUBTOTAL                          S/ 1,830.00         │  ║
║  │  Descuento (10%)                   S/  -183.00         │  ║
║  │  ══════════════════════════════════════════════         │  ║
║  │  TOTAL                             S/ 1,647.00         │  ║
║  │                                                         │  ║
║  │  🚚 Entrega estimada: 7 días                           │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  💳 Adelanto: [S/ 500.00]  |  Saldo: S/ 1,147.00             ║
║                                                                ║
║  [🔄 CAMBIAR OPCIONES]  [✅ PROCESAR VENTA]                   ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔐 SEGURIDAD Y PERMISOS

```
┌─────────────────────────────────────────────────────┐
│  ROL          │  MÓDULO          │  PERMISOS        │
├─────────────────────────────────────────────────────┤
│  Optometrista │  RX              │  CRUD completo   │
│               │  Ventas          │  Solo lectura    │
│               │  Inventario      │  Solo lectura    │
├─────────────────────────────────────────────────────┤
│  Vendedor     │  RX              │  Solo lectura    │
│               │  Ventas          │  CRUD completo   │
│               │  Inventario      │  Lectura + venta │
├─────────────────────────────────────────────────────┤
│  Administrador│  Todos           │  CRUD completo   │
│               │  Configuración   │  Total           │
│               │  Reportes        │  Total           │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ FLUJOS DE TRABAJO CRÍTICOS

### FLUJO 1: Venta con RX Nueva
```mermaid
sequenceDiagram
    participant C as Cliente
    participant O as Optometrista
    participant V as Vendedor
    participant S as Sistema
    participant L as Laboratorio

    C->>O: Solicita examen visual
    O->>S: Ingresa medidas en Modo Clínico
    S->>S: Calcula Complejidad (8/10 - ALTA)
    S-->>O: Recomienda Alto Índice + Progresivo
    O->>S: Guarda RX validada

    C->>V: Pasa a mostrador de ventas
    V->>S: Abre Modo Vendedor con RX automática
    S->>S: Filtra catálogo (solo Premium)
    V->>S: Escanea montura (Ray-Ban)
    S->>S: Valida compatibilidad RX-Montura
    S-->>V: ✅ Compatible + Precio calculado
    V->>S: Procesa venta con adelanto
    S->>S: Genera Factura SUNAT
    S->>C: Envía PDF/XML por email
    S->>L: Imprime orden de trabajo con QR
```

---

## 📋 RESPONDE ESTAS PREGUNTAS Y COMENZAMOS

Copia y pega esto con tus respuestas:

```
### RESPUESTAS - MÓDULO 1: MOTOR DE LUNAS
P1.1: [Tu respuesta aquí]
P1.2: [Tu respuesta aquí]
P1.3: [Tu respuesta aquí]

### RESPUESTAS - MÓDULO 2: MONTURAS
P2.1: [Tu respuesta aquí]
P2.2: [Tu respuesta aquí]
P2.3: [Tu respuesta aquí]

### RESPUESTAS - MÓDULO 3: VENTAS + RX
P3.1: [Tu respuesta aquí]
P3.2: [Tu respuesta aquí]
P3.3: [Tu respuesta aquí]

### RESPUESTAS - MÓDULO 4: FACTURACIÓN
P4.1: [Tu respuesta aquí]
P4.2: [Tu respuesta aquí]
P4.3: [Tu respuesta aquí]

### RESPUESTAS - INFRAESTRUCTURA
P5.1: [Tu respuesta aquí]
P5.2: [Tu respuesta aquí]
P5.3: [Tu respuesta aquí]
```

---

Una vez tengas las respuestas, implemento:
1. ✅ Schema SQL completo ejecutable
2. ✅ API .NET con todos los endpoints
3. ✅ Componentes React con animaciones vanguardistas
4. ✅ Integración completa de hardware
5. ✅ Sistema SUNAT automatizado
6. ✅ Diseño UI/UX que impresiona

¿Listo para revolucionar el mercado óptico peruano? 🚀

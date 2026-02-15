-- ═══════════════════════════════════════════════════════════════════════════════
-- 🏛️ CENTRO ÓPTICO SICUANI - DATABASE SCHEMA COMPLETE
-- Sistema: Luxottica Killer Enterprise Edition
-- Motor: SQL Server 2019+
-- Versión: 6.0 Enterprise
-- ═══════════════════════════════════════════════════════════════════════════════

USE master;
GO

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'OpticaSicuani')
BEGIN
    CREATE DATABASE OpticaSicuani;
    PRINT '✅ Base de datos OpticaSicuani creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Base de datos OpticaSicuani ya existe';
END
GO

USE OpticaSicuani;
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Lens_Stock_Grids (CONFIGURACIÓN PARAMÉTRICA DE SERIES)
-- Propósito: Define las reglas de series sin hardcodear precios
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Lens_Stock_Grids', 'U') IS NOT NULL
    DROP TABLE dbo.Lens_Stock_Grids;
GO

CREATE TABLE dbo.Lens_Stock_Grids (
    GridID INT IDENTITY(1,1) PRIMARY KEY,
    GridName NVARCHAR(50) NOT NULL,              -- 'Serie 1', 'Serie 2', etc.
    GridDescription NVARCHAR(255) NULL,          -- Descripción comercial

    -- Rangos de Esfera
    MinSphere DECIMAL(4,2) NOT NULL,             -- Ejemplo: -8.00
    MaxSphere DECIMAL(4,2) NOT NULL,             -- Ejemplo: +6.00

    -- Rangos de Cilindro
    MinCyl DECIMAL(4,2) NOT NULL,                -- Ejemplo: 0.00
    MaxCyl DECIMAL(4,2) NOT NULL,                -- Ejemplo: -2.00

    -- Restricciones especiales
    IsOnlyNegative BIT NOT NULL DEFAULT 0,       -- Serie 4: Solo negativos
    IsOnlyPositive BIT NOT NULL DEFAULT 0,       -- Futuro: Series de hipermetropía

    -- Referencia de precio (NO el precio en sí)
    PriceReferenceCode NVARCHAR(20) NOT NULL,    -- 'PRICE_SERIE_1', 'PRICE_SERIE_2'

    -- Disponibilidad
    IsActive BIT NOT NULL DEFAULT 1,
    RequiresLaboratory BIT NOT NULL DEFAULT 0,   -- Si marcado, va a laboratorio

    -- Metadatos
    Priority INT NOT NULL DEFAULT 100,           -- Para resolver conflictos (menor = mayor prioridad)
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    -- Índices
    CONSTRAINT UQ_GridName UNIQUE (GridName),
    CONSTRAINT CK_SphereRange CHECK (MinSphere <= MaxSphere),
    CONSTRAINT CK_CylRange CHECK (MinCyl <= MaxCyl)
);
GO

-- Insertar configuración de series según especificaciones
INSERT INTO dbo.Lens_Stock_Grids
    (GridName, GridDescription, MinSphere, MaxSphere, MinCyl, MaxCyl, IsOnlyNegative, PriceReferenceCode, Priority)
VALUES
    -- SERIE 1: Baja graduación (0.00 a ±2.00)
    ('Serie 1', 'Graduaciones bajas - Stock inmediato', -2.00, 2.00, -2.00, 0.00, 0, 'PRICE_SERIE_1', 10),

    -- SERIE 2: Graduación media (±2.25 a ±4.00)
    ('Serie 2', 'Graduaciones medias - Stock estándar', -4.00, 4.00, -2.00, 0.00, 0, 'PRICE_SERIE_2', 20),

    -- SERIE 3: Graduación alta (±4.25 a ±6.00)
    ('Serie 3', 'Graduaciones altas - Stock premium', -6.00, 6.00, -2.00, 0.00, 0, 'PRICE_SERIE_3', 30),

    -- SERIE 4: Miopía muy alta (Solo negativos -6.25 a -8.00)
    ('Serie 4', 'Miopía alta - Solo negativos', -8.00, -6.25, -2.00, 0.00, 1, 'PRICE_SERIE_4', 40);
GO

PRINT '✅ Tabla Lens_Stock_Grids creada e inicializada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Price_References (CATÁLOGO DE PRECIOS INYECTABLE)
-- Propósito: Precios configurables por administrador sin tocar código
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Price_References', 'U') IS NOT NULL
    DROP TABLE dbo.Price_References;
GO

CREATE TABLE dbo.Price_References (
    PriceID INT IDENTITY(1,1) PRIMARY KEY,
    PriceCode NVARCHAR(20) NOT NULL UNIQUE,      -- 'PRICE_SERIE_1', etc.
    Description NVARCHAR(100) NOT NULL,

    -- Precios por unidad
    UnitPrice DECIMAL(10,2) NOT NULL,            -- Precio por ojo
    PairPrice DECIMAL(10,2) NOT NULL,            -- Precio por par (puede tener descuento)

    -- Precios por material (opcional)
    Material NVARCHAR(50) NULL,                  -- 'CR39', 'PC', 'HI167', etc.

    -- Control
    IsActive BIT NOT NULL DEFAULT 1,
    ValidFrom DATETIME2 NOT NULL DEFAULT GETDATE(),
    ValidUntil DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL
);
GO

-- Datos de ejemplo (Aldo puede actualizar después)
INSERT INTO dbo.Price_References (PriceCode, Description, UnitPrice, PairPrice, Material)
VALUES
    ('PRICE_SERIE_1', 'Serie 1 - CR39 Estándar', 80.00, 150.00, 'CR39'),
    ('PRICE_SERIE_2', 'Serie 2 - CR39 Estándar', 120.00, 220.00, 'CR39'),
    ('PRICE_SERIE_3', 'Serie 3 - CR39 Premium', 180.00, 340.00, 'CR39'),
    ('PRICE_SERIE_4', 'Serie 4 - Alto Índice Requerido', 350.00, 650.00, 'HI167'),
    ('PRICE_LABORATORY', 'Fabricación Laboratorio', 400.00, 750.00, 'Custom');
GO

PRINT '✅ Tabla Price_References creada e inicializada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Patients (PACIENTES)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Patients', 'U') IS NOT NULL
    DROP TABLE dbo.Patients;
GO

CREATE TABLE dbo.Patients (
    PatientID INT IDENTITY(1,1) PRIMARY KEY,

    -- Datos personales
    FullName NVARCHAR(150) NOT NULL,
    DNI NVARCHAR(12) NULL UNIQUE,                -- Puede ser null (menores sin DNI)
    BirthDate DATE NULL,
    Age AS (DATEDIFF(YEAR, BirthDate, GETDATE())), -- Columna computada
    Gender NVARCHAR(10) NULL,                     -- 'M', 'F', 'Otro'

    -- Contacto
    Phone NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    Address NVARCHAR(255) NULL,

    -- Control
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    -- Índices
    INDEX IX_DNI (DNI),
    INDEX IX_FullName (FullName)
);
GO

PRINT '✅ Tabla Patients creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Prescriptions (RECETAS CLÍNICAS - Single Source of Truth)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Prescriptions', 'U') IS NOT NULL
    DROP TABLE dbo.Prescriptions;
GO

CREATE TABLE dbo.Prescriptions (
    PrescriptionID INT IDENTITY(1,1) PRIMARY KEY,
    PatientID INT NOT NULL,

    -- Medidas Ojo Derecho (OD)
    OD_Sphere DECIMAL(5,2) NOT NULL,
    OD_Cylinder DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    OD_Axis INT NULL CHECK (OD_Axis >= 0 AND OD_Axis <= 180),
    OD_Addition DECIMAL(4,2) NULL,
    OD_PD DECIMAL(4,1) NULL,                      -- Distancia pupilar
    OD_Height DECIMAL(4,1) NULL,                  -- Altura de montaje
    OD_VA_Distance NVARCHAR(10) NULL,             -- Agudeza visual lejos
    OD_VA_Near NVARCHAR(10) NULL,                 -- Agudeza visual cerca

    -- Medidas Ojo Izquierdo (OI)
    OI_Sphere DECIMAL(5,2) NOT NULL,
    OI_Cylinder DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    OI_Axis INT NULL CHECK (OI_Axis >= 0 AND OI_Axis <= 180),
    OI_Addition DECIMAL(4,2) NULL,
    OI_PD DECIMAL(4,1) NULL,
    OI_Height DECIMAL(4,1) NULL,
    OI_VA_Distance NVARCHAR(10) NULL,
    OI_VA_Near NVARCHAR(10) NULL,

    -- Clasificación automática
    LensType NVARCHAR(50) NOT NULL,               -- 'Monofocal', 'Bifocal', 'Progresivo'
    ComplexityScore INT NOT NULL DEFAULT 1,       -- 1-10 (calculado automáticamente)
    DetectedSeries NVARCHAR(50) NULL,             -- 'Serie 1', 'Serie 2', etc.
    RequiresLaboratory BIT NOT NULL DEFAULT 0,

    -- Metadatos clínicos
    ExamDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    OptometristID INT NULL,                       -- FK a tabla Users (futuro)
    OptometristName NVARCHAR(100) NULL,
    IsValidated BIT NOT NULL DEFAULT 0,           -- Revisado por optometrista
    ClinicalNotes NVARCHAR(MAX) NULL,

    -- Control
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    -- Foreign Keys
    CONSTRAINT FK_Prescriptions_Patients FOREIGN KEY (PatientID)
        REFERENCES dbo.Patients(PatientID),

    -- Índices
    INDEX IX_PatientID (PatientID),
    INDEX IX_ExamDate (ExamDate DESC),
    INDEX IX_DetectedSeries (DetectedSeries)
);
GO

PRINT '✅ Tabla Prescriptions creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Frames (MONTURAS)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Frames', 'U') IS NOT NULL
    DROP TABLE dbo.Frames;
GO

CREATE TABLE dbo.Frames (
    FrameID INT IDENTITY(1,1) PRIMARY KEY,

    -- Identificación
    Barcode NVARCHAR(50) NOT NULL UNIQUE,        -- Código de barras EAN13
    SKU NVARCHAR(50) NULL,
    Brand NVARCHAR(100) NOT NULL,
    Model NVARCHAR(100) NOT NULL,
    Color NVARCHAR(50) NULL,

    -- Especificaciones técnicas
    Material NVARCHAR(50) NOT NULL,               -- 'Metal', 'Acetato', 'Al Aire', 'Titanio'
    EyeSize INT NOT NULL,                         -- Ancho de ojo en mm
    Bridge INT NOT NULL,                          -- Puente en mm
    TempleLength INT NOT NULL,                    -- Largo de brazo en mm
    DBL DECIMAL(4,1) NOT NULL,                    -- Distance Between Lenses

    -- Clasificación
    Gender NVARCHAR(20) NULL,                     -- 'Hombre', 'Mujer', 'Unisex', 'Niño'
    FrameType NVARCHAR(50) NULL,                  -- 'Completa', 'Al Aire', 'Media Montura'

    -- Inventario y precio
    Stock INT NOT NULL DEFAULT 0,
    MinStock INT NOT NULL DEFAULT 1,
    Price DECIMAL(10,2) NOT NULL,
    Cost DECIMAL(10,2) NULL,

    -- Multimedia
    ImageURL NVARCHAR(500) NULL,
    ImagePath NVARCHAR(500) NULL,

    -- Control
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    -- Índices
    INDEX IX_Barcode (Barcode),
    INDEX IX_Brand_Model (Brand, Model),
    INDEX IX_Stock (Stock)
);
GO

PRINT '✅ Tabla Frames creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: TryOn_History (HISTORIAL DE PROBADORES)
-- Propósito: Remarketing - qué monturas se probó pero no compró
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.TryOn_History', 'U') IS NOT NULL
    DROP TABLE dbo.TryOn_History;
GO

CREATE TABLE dbo.TryOn_History (
    TryOnID INT IDENTITY(1,1) PRIMARY KEY,
    PatientID INT NOT NULL,
    FrameID INT NOT NULL,

    TriedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    WasPurchased BIT NOT NULL DEFAULT 0,
    SalespersonID INT NULL,
    SalespersonName NVARCHAR(100) NULL,
    Notes NVARCHAR(500) NULL,

    -- Foreign Keys
    CONSTRAINT FK_TryOn_Patients FOREIGN KEY (PatientID)
        REFERENCES dbo.Patients(PatientID),
    CONSTRAINT FK_TryOn_Frames FOREIGN KEY (FrameID)
        REFERENCES dbo.Frames(FrameID),

    -- Índices
    INDEX IX_PatientID (PatientID),
    INDEX IX_TriedAt (TriedAt DESC)
);
GO

PRINT '✅ Tabla TryOn_History creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Sales_Orders (ÓRDENES DE VENTA)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Sales_Orders', 'U') IS NOT NULL
    DROP TABLE dbo.Sales_Orders;
GO

CREATE TABLE dbo.Sales_Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(20) NOT NULL UNIQUE,    -- Auto-generado: 'ORD-20260111-001'

    -- Relaciones
    PatientID INT NOT NULL,
    PrescriptionID INT NULL,                      -- Puede ser null (venta sin RX)

    -- Totales
    Subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    -- Pagos
    Deposit DECIMAL(10,2) NOT NULL DEFAULT 0.00,  -- Adelanto
    Balance AS (Total - Deposit),                  -- Saldo (columna computada)
    PaymentMethod NVARCHAR(50) NULL,               -- 'Efectivo', 'Tarjeta', 'Yape', 'Mixto'

    -- Estado del pedido
    OrderStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        -- 'Pending', 'Processing', 'Ready', 'Delivered', 'Cancelled'

    -- Fechas
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ExpectedDeliveryDate DATE NULL,
    DeliveredAt DATETIME2 NULL,

    -- Facturación SUNAT
    SunatDocumentType NVARCHAR(20) NULL,          -- 'Boleta', 'Factura'
    SunatSerieNumber NVARCHAR(10) NULL,           -- 'B001', 'F001'
    SunatCorrelative INT NULL,                     -- Correlativo numérico
    SunatXmlPath NVARCHAR(500) NULL,
    SunatPdfPath NVARCHAR(500) NULL,
    IsSunatSent BIT NOT NULL DEFAULT 0,
    SunatSentAt DATETIME2 NULL,
    SunatResponseCode NVARCHAR(10) NULL,

    -- Personal
    SalespersonID INT NULL,
    SalespersonName NVARCHAR(100) NULL,

    -- Notas
    Notes NVARCHAR(MAX) NULL,

    -- Control
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    -- Foreign Keys
    CONSTRAINT FK_Orders_Patients FOREIGN KEY (PatientID)
        REFERENCES dbo.Patients(PatientID),
    CONSTRAINT FK_Orders_Prescriptions FOREIGN KEY (PrescriptionID)
        REFERENCES dbo.Prescriptions(PrescriptionID),

    -- Índices
    INDEX IX_OrderNumber (OrderNumber),
    INDEX IX_OrderDate (OrderDate DESC),
    INDEX IX_OrderStatus (OrderStatus)
);
GO

PRINT '✅ Tabla Sales_Orders creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Sales_Items (ITEMS DE VENTA)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Sales_Items', 'U') IS NOT NULL
    DROP TABLE dbo.Sales_Items;
GO

CREATE TABLE dbo.Sales_Items (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,

    -- Tipo de item
    ItemType NVARCHAR(50) NOT NULL,               -- 'Frame', 'Lens', 'Accessory'

    -- Referencias opcionales
    FrameID INT NULL,
    PriceReferenceCode NVARCHAR(20) NULL,         -- Para lunas: 'PRICE_SERIE_2'

    -- Descripción y cantidades
    Description NVARCHAR(255) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total AS (Quantity * UnitPrice - Discount),   -- Columna computada

    -- Metadatos
    Notes NVARCHAR(500) NULL,

    -- Foreign Keys
    CONSTRAINT FK_Items_Orders FOREIGN KEY (OrderID)
        REFERENCES dbo.Sales_Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_Items_Frames FOREIGN KEY (FrameID)
        REFERENCES dbo.Frames(FrameID),

    -- Índices
    INDEX IX_OrderID (OrderID)
);
GO

PRINT '✅ Tabla Sales_Items creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLA: Audit_Log (AUDITORÍA DE CAMBIOS)
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.Audit_Log', 'U') IS NOT NULL
    DROP TABLE dbo.Audit_Log;
GO

CREATE TABLE dbo.Audit_Log (
    LogID INT IDENTITY(1,1) PRIMARY KEY,

    TableName NVARCHAR(100) NOT NULL,
    RecordID INT NOT NULL,
    Action NVARCHAR(20) NOT NULL,                 -- 'INSERT', 'UPDATE', 'DELETE'

    FieldName NVARCHAR(100) NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,

    UserID INT NULL,
    UserName NVARCHAR(100) NULL,
    ChangeSource NVARCHAR(50) NULL,               -- 'Ventas', 'Consultorio', 'Sistema'

    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),

    INDEX IX_TableName_RecordID (TableName, RecordID),
    INDEX IX_Timestamp (Timestamp DESC)
);
GO

PRINT '✅ Tabla Audit_Log creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STORED PROCEDURE: Calcular Complejidad de RX
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.sp_CalculateComplexityScore', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CalculateComplexityScore;
GO

CREATE PROCEDURE dbo.sp_CalculateComplexityScore
    @Sphere DECIMAL(5,2),
    @Cylinder DECIMAL(5,2),
    @LensType NVARCHAR(50),
    @ComplexityScore INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Score INT = 1;

    -- Factor 1: Esfera alta (±6.00 o mayor)
    IF ABS(@Sphere) >= 6.00
        SET @Score = @Score + 3;
    ELSE IF ABS(@Sphere) >= 4.00
        SET @Score = @Score + 2;
    ELSE IF ABS(@Sphere) >= 2.00
        SET @Score = @Score + 1;

    -- Factor 2: Cilindro alto (> 2.00)
    IF ABS(@Cylinder) > 2.00
        SET @Score = @Score + 4;
    ELSE IF ABS(@Cylinder) >= 1.00
        SET @Score = @Score + 2;

    -- Factor 3: Tipo de lente
    IF @LensType = 'Progresivo'
        SET @Score = @Score + 3;
    ELSE IF @LensType = 'Bifocal'
        SET @Score = @Score + 2;

    -- Limitar entre 1 y 10
    SET @ComplexityScore = CASE
        WHEN @Score > 10 THEN 10
        WHEN @Score < 1 THEN 1
        ELSE @Score
    END;

    RETURN @ComplexityScore;
END;
GO

PRINT '✅ Stored Procedure sp_CalculateComplexityScore creado';

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCIÓN: Detectar Serie Automáticamente
-- ═══════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.fn_DetectLensSeries', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_DetectLensSeries;
GO

CREATE FUNCTION dbo.fn_DetectLensSeries
(
    @Sphere DECIMAL(5,2),
    @Cylinder DECIMAL(5,2)
)
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @DetectedSeries NVARCHAR(50) = 'LABORATORIO';

    -- Validación de seguridad: Cilindro > 2.00 → Laboratorio
    IF ABS(@Cylinder) > 2.00
        RETURN 'LABORATORIO';

    -- Buscar serie que coincida (ordenado por prioridad)
    SELECT TOP 1 @DetectedSeries = GridName
    FROM dbo.Lens_Stock_Grids
    WHERE IsActive = 1
        AND @Sphere BETWEEN MinSphere AND MaxSphere
        AND @Cylinder BETWEEN MinCyl AND MaxCyl
        AND (IsOnlyNegative = 0 OR @Sphere < 0)  -- Validar si es solo negativos
    ORDER BY Priority ASC;

    RETURN @DetectedSeries;
END;
GO

PRINT '✅ Función fn_DetectLensSeries creada';

-- ═══════════════════════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (OPCIONAL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insertar paciente de prueba
INSERT INTO dbo.Patients (FullName, DNI, BirthDate, Phone, Email)
VALUES ('Juan Carlos Pérez', '12345678', '1985-05-15', '987654321', 'juan@example.com');

-- Insertar monturas de prueba
INSERT INTO dbo.Frames (Barcode, Brand, Model, Color, Material, EyeSize, Bridge, TempleLength, DBL, Price, Stock)
VALUES
    ('7501234567890', 'Ray-Ban', 'RB5150', 'Tartaruga', 'Acetato', 52, 18, 145, 70.0, 450.00, 3),
    ('7501234567891', 'Oakley', 'OX8156', 'Negro Mate', 'Metal', 54, 16, 140, 70.0, 380.00, 2);

PRINT '✅ Datos de prueba insertados';

-- ═══════════════════════════════════════════════════════════════════════════════
-- SCRIPT FINALIZADO
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '✅ DATABASE SCHEMA COMPLETO INSTALADO EXITOSAMENTE';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '';
PRINT '📊 Tablas creadas:';
PRINT '  • Lens_Stock_Grids (Configuración de series)';
PRINT '  • Price_References (Catálogo de precios)';
PRINT '  • Patients (Pacientes)';
PRINT '  • Prescriptions (Recetas clínicas)';
PRINT '  • Frames (Monturas)';
PRINT '  • TryOn_History (Historial de probadores)';
PRINT '  • Sales_Orders (Órdenes de venta)';
PRINT '  • Sales_Items (Items de venta)';
PRINT '  • Audit_Log (Auditoría)';
PRINT '';
PRINT '🔧 Objetos de lógica:';
PRINT '  • sp_CalculateComplexityScore (Calcular complejidad)';
PRINT '  • fn_DetectLensSeries (Detectar serie automáticamente)';
PRINT '';
PRINT '🚀 Sistema listo para recibir el backend .NET';
PRINT '═══════════════════════════════════════════════════════════════';
GO

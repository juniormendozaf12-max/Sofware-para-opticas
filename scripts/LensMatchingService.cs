// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 LENS MATCHING SERVICE - MOTOR DE INTELIGENCIA DE LUNAS
// Sistema: Centro Óptico Sicuani - Luxottica Killer
// Versión: 6.0 Enterprise
// ═══════════════════════════════════════════════════════════════════════════════

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OpticaSicuani.Services
{
    #region ═══ MODELOS DE DATOS ═══

    /// <summary>
    /// Resultado del análisis de compatibilidad de una receta
    /// </summary>
    public class LensMatchResult
    {
        public bool IsStock { get; set; }
        public string SeriesDetected { get; set; }
        public string PriceReferenceCode { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal PairPrice { get; set; }
        public string Material { get; set; }
        public string Message { get; set; }
        public bool RequiresLaboratory { get; set; }
        public int EstimatedDays { get; set; }
        public string RecommendedAction { get; set; }
        public LensValidation Validation { get; set; }
    }

    /// <summary>
    /// Resultado de validaciones de seguridad
    /// </summary>
    public class LensValidation
    {
        public bool IsValid { get; set; }
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> Errors { get; set; } = new List<string>();
        public string RiskLevel { get; set; } // "Low", "Medium", "High"
    }

    /// <summary>
    /// Datos de entrada de una receta
    /// </summary>
    public class PrescriptionInput
    {
        public decimal Sphere { get; set; }
        public decimal Cylinder { get; set; }
        public int Axis { get; set; }
        public decimal? Addition { get; set; }
        public string LensType { get; set; } // "Monofocal", "Bifocal", "Progresivo"
    }

    #endregion

    /// <summary>
    /// Servicio de matching inteligente de lunas
    /// Implementa el algoritmo Best-Match estilo Essilor/Luxottica
    /// </summary>
    public class LensMatchingService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<LensMatchingService> _logger;
        private readonly string _connectionString;

        public LensMatchingService(
            IConfiguration configuration,
            ILogger<LensMatchingService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _connectionString = configuration.GetConnectionString("OpticaSicuani");
        }

        // ═══════════════════════════════════════════════════════════════════════
        // MÉTODO PRINCIPAL: Analizar Receta y Determinar Serie
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Analiza una receta y determina automáticamente la serie,
        /// precios y disponibilidad
        /// </summary>
        public async Task<LensMatchResult> AnalyzePrescriptionAsync(PrescriptionInput prescription)
        {
            _logger.LogInformation($"🔍 Analizando receta: Esfera={prescription.Sphere}, " +
                                   $"Cilindro={prescription.Cylinder}, Tipo={prescription.LensType}");

            var result = new LensMatchResult
            {
                Validation = new LensValidation { IsValid = true }
            };

            try
            {
                // ═══ PASO 1: VALIDACIONES DE SEGURIDAD ═══
                var validation = PerformSafetyChecks(prescription);
                result.Validation = validation;

                if (!validation.IsValid)
                {
                    result.IsStock = false;
                    result.RequiresLaboratory = true;
                    result.SeriesDetected = "LABORATORIO";
                    result.Message = "Requiere fabricación en laboratorio";
                    result.EstimatedDays = 7;
                    result.PriceReferenceCode = "PRICE_LABORATORY";

                    await LoadPriceData(result);
                    return result;
                }

                // ═══ PASO 2: DETECCIÓN AUTOMÁTICA DE SERIE ═══
                string detectedSeries = await DetectSeriesFromDatabaseAsync(
                    prescription.Sphere,
                    prescription.Cylinder
                );

                result.SeriesDetected = detectedSeries;

                if (detectedSeries == "LABORATORIO")
                {
                    // Cilindro > 2.00 o fuera de rangos
                    result.IsStock = false;
                    result.RequiresLaboratory = true;
                    result.Message = "Graduación fuera de rango de stock - Requiere laboratorio";
                    result.EstimatedDays = 7;
                    result.PriceReferenceCode = "PRICE_LABORATORY";
                    result.RecommendedAction = "Contactar con laboratorio para cotización";
                }
                else
                {
                    // ═══ PASO 3: STOCK DISPONIBLE ═══
                    result.IsStock = true;
                    result.RequiresLaboratory = false;
                    result.Message = $"✅ Disponible en {detectedSeries} - Entrega inmediata";
                    result.EstimatedDays = 1;
                    result.PriceReferenceCode = $"PRICE_{detectedSeries.ToUpper().Replace(" ", "_")}";
                    result.RecommendedAction = "Proceder con la venta";
                }

                // ═══ PASO 4: CARGAR PRECIOS DESDE BD ═══
                await LoadPriceData(result);

                // ═══ PASO 5: RECOMENDACIONES SEGÚN COMPLEJIDAD ═══
                ApplyIntelligentRecommendations(prescription, result);

                _logger.LogInformation($"✅ Análisis completado: Serie={result.SeriesDetected}, " +
                                       $"Stock={result.IsStock}, Precio={result.PairPrice:C}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al analizar receta");
                throw;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VALIDACIONES DE SEGURIDAD (Safety Checks)
        // ═══════════════════════════════════════════════════════════════════════

        private LensValidation PerformSafetyChecks(PrescriptionInput prescription)
        {
            var validation = new LensValidation { IsValid = true };

            // ═══ REGLA 1: Cilindro Alto (> 2.00) ═══
            if (Math.Abs(prescription.Cylinder) > 2.00m)
            {
                validation.Errors.Add("Cilindro superior a 2.00D - Requiere surfacing");
                validation.RiskLevel = "High";
                validation.IsValid = false;
                return validation;
            }

            // ═══ REGLA 2: Esfera muy alta (> ±8.00) ═══
            if (Math.Abs(prescription.Sphere) > 8.00m)
            {
                validation.Errors.Add("Esfera superior a ±8.00D - Requiere laboratorio especializado");
                validation.RiskLevel = "High";
                validation.IsValid = false;
                return validation;
            }

            // ═══ REGLA 3: Hipermetropía alta con progresivos ═══
            if (prescription.Sphere > 6.00m && prescription.LensType == "Progresivo")
            {
                validation.Warnings.Add("⚠️ Hipermetropía alta con progresivo - Verificar adaptación del paciente");
                validation.RiskLevel = "Medium";
            }

            // ═══ REGLA 4: Progresivos requieren adición ═══
            if (prescription.LensType == "Progresivo" && !prescription.Addition.HasValue)
            {
                validation.Errors.Add("Lentes progresivos requieren especificar adición");
                validation.RiskLevel = "Medium";
                validation.IsValid = false;
                return validation;
            }

            // ═══ REGLA 5: Cilindro sin eje ═══
            if (Math.Abs(prescription.Cylinder) > 0.25m && prescription.Axis == 0)
            {
                validation.Warnings.Add("⚠️ Cilindro sin eje definido - Verificar medida");
                validation.RiskLevel = "Medium";
            }

            // Si no hay errores, es válido
            if (validation.Errors.Count == 0)
            {
                validation.RiskLevel = validation.Warnings.Count > 0 ? "Low" : "None";
            }

            return validation;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DETECCIÓN DE SERIE DESDE BASE DE DATOS
        // ═══════════════════════════════════════════════════════════════════════

        private async Task<string> DetectSeriesFromDatabaseAsync(decimal sphere, decimal cylinder)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Usar la función SQL creada
                    var command = new SqlCommand("SELECT dbo.fn_DetectLensSeries(@Sphere, @Cylinder)", connection);
                    command.Parameters.AddWithValue("@Sphere", sphere);
                    command.Parameters.AddWithValue("@Cylinder", cylinder);

                    var result = await command.ExecuteScalarAsync();

                    return result?.ToString() ?? "LABORATORIO";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al detectar serie desde BD");

                // Fallback: Lógica en código (redundancia)
                return DetectSeriesLocalLogic(sphere, cylinder);
            }
        }

        /// <summary>
        /// Lógica de detección local (fallback si BD no está disponible)
        /// </summary>
        private string DetectSeriesLocalLogic(decimal sphere, decimal cylinder)
        {
            // Safety check
            if (Math.Abs(cylinder) > 2.00m)
                return "LABORATORIO";

            // Serie 1: -2.00 a +2.00
            if (sphere >= -2.00m && sphere <= 2.00m)
                return "Serie 1";

            // Serie 2: -4.00 a +4.00 (excluyendo Serie 1)
            if (sphere >= -4.00m && sphere <= 4.00m)
                return "Serie 2";

            // Serie 3: -6.00 a +6.00 (excluyendo Serie 1 y 2)
            if (sphere >= -6.00m && sphere <= 6.00m)
                return "Serie 3";

            // Serie 4: SOLO negativos -6.25 a -8.00
            if (sphere >= -8.00m && sphere < -6.00m)
                return "Serie 4";

            // Hipermetropía alta (positivos > +6.00)
            if (sphere > 6.00m)
                return "LABORATORIO";

            return "LABORATORIO";
        }

        // ═══════════════════════════════════════════════════════════════════════
        // CARGAR PRECIOS DESDE BASE DE DATOS
        // ═══════════════════════════════════════════════════════════════════════

        private async Task LoadPriceData(LensMatchResult result)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT
                            PriceCode,
                            Description,
                            UnitPrice,
                            PairPrice,
                            Material
                        FROM dbo.Price_References
                        WHERE PriceCode = @PriceCode
                          AND IsActive = 1
                    ";

                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@PriceCode", result.PriceReferenceCode);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            result.UnitPrice = reader.GetDecimal(reader.GetOrdinal("UnitPrice"));
                            result.PairPrice = reader.GetDecimal(reader.GetOrdinal("PairPrice"));
                            result.Material = reader.GetString(reader.GetOrdinal("Material"));
                        }
                        else
                        {
                            // Precios por defecto si no se encuentra
                            _logger.LogWarning($"⚠️ Precio no encontrado para código: {result.PriceReferenceCode}");
                            result.UnitPrice = 0.00m;
                            result.PairPrice = 0.00m;
                            result.Material = "N/A";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar precios desde BD");
                throw;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // RECOMENDACIONES INTELIGENTES
        // ═══════════════════════════════════════════════════════════════════════

        private void ApplyIntelligentRecommendations(PrescriptionInput prescription, LensMatchResult result)
        {
            // Recomendación de Alto Índice para graduaciones altas
            if (Math.Abs(prescription.Sphere) >= 6.00m || Math.Abs(prescription.Cylinder) >= 2.00m)
            {
                result.Validation.Warnings.Add(
                    "💡 RECOMENDACIÓN: Sugerir Alto Índice 1.67 o 1.74 para reducir grosor"
                );
            }

            // Progresivos siempre requieren atención especial
            if (prescription.LensType == "Progresivo")
            {
                result.Validation.Warnings.Add(
                    "👓 IMPORTANTE: Verificar altura de montaje y distancia pupilar para progresivos"
                );
            }

            // Serie 4 (miopía alta) siempre necesita asesoramiento
            if (result.SeriesDetected == "Serie 4")
            {
                result.Validation.Warnings.Add(
                    "⚠️ ATENCIÓN: Miopía alta - Explicar al cliente sobre grosor de borde"
                );
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // MÉTODO AUXILIAR: Validar Compatibilidad Montura-RX
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Verifica si una montura es compatible con una receta específica
        /// </summary>
        public async Task<(bool IsCompatible, List<string> Issues)> CheckFrameCompatibilityAsync(
            PrescriptionInput prescription,
            int frameId)
        {
            var issues = new List<string>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT
                            Material,
                            FrameType,
                            EyeSize,
                            DBL
                        FROM dbo.Frames
                        WHERE FrameID = @FrameID
                    ";

                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@FrameID", frameId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var material = reader.GetString(reader.GetOrdinal("Material"));
                            var frameType = reader.GetString(reader.GetOrdinal("FrameType"));
                            var eyeSize = reader.GetInt32(reader.GetOrdinal("EyeSize"));

                            // REGLA: Metal/Al Aire con graduación alta
                            if ((material == "Metal" || frameType == "Al Aire") && Math.Abs(prescription.Sphere) > 4.00m)
                            {
                                issues.Add("⚠️ Montura metal/al aire no recomendada para graduación alta - Sugerir acetato");
                            }

                            // REGLA: Monturas pequeñas con progresivos
                            if (prescription.LensType == "Progresivo" && eyeSize < 50)
                            {
                                issues.Add("⚠️ Montura pequeña puede limitar área de visión en progresivos");
                            }

                            // REGLA: Al aire con cilindro alto
                            if (frameType == "Al Aire" && Math.Abs(prescription.Cylinder) > 1.50m)
                            {
                                issues.Add("⚠️ Monturas al aire no recomendadas con cilindro alto (riesgo de ruptura)");
                            }
                        }
                    }
                }

                return (issues.Count == 0, issues);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar compatibilidad montura-RX");
                throw;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTROLADOR API (Ejemplo de uso)
    // ═══════════════════════════════════════════════════════════════════════════

    /* EJEMPLO DE USO EN CONTROLADOR .NET

    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    public class LensController : ControllerBase
    {
        private readonly LensMatchingService _lensService;

        public LensController(LensMatchingService lensService)
        {
            _lensService = lensService;
        }

        [HttpPost("analyze")]
        public async Task<ActionResult<LensMatchResult>> AnalyzePrescription(
            [FromBody] PrescriptionInput prescription)
        {
            try
            {
                var result = await _lensService.AnalyzePrescriptionAsync(prescription);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("check-frame-compatibility")]
        public async Task<ActionResult> CheckFrameCompatibility(
            [FromBody] PrescriptionInput prescription,
            [FromQuery] int frameId)
        {
            var (isCompatible, issues) = await _lensService
                .CheckFrameCompatibilityAsync(prescription, frameId);

            return Ok(new { isCompatible, issues });
        }
    }

    */
}

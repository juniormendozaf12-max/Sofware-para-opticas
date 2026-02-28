// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 CLINICAL HUB - SINCRONIZACIÓN EN TIEMPO REAL (SIGNALR)
// Sistema: Centro Óptico Sicuani - "El Espejo"
// Versión: 6.0 Enterprise
// ═══════════════════════════════════════════════════════════════════════════════

using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace OpticaSicuani.Hubs
{
    #region ═══ MODELOS DE DATOS ═══

    /// <summary>
    /// Datos de RX transmitidos en tiempo real
    /// </summary>
    public class RxRealtimeData
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }

        // OD (Ojo Derecho)
        public decimal? OD_Sphere { get; set; }
        public decimal? OD_Cylinder { get; set; }
        public int? OD_Axis { get; set; }
        public decimal? OD_Addition { get; set; }

        // OI (Ojo Izquierdo)
        public decimal? OI_Sphere { get; set; }
        public decimal? OI_Cylinder { get; set; }
        public int? OI_Axis { get; set; }
        public decimal? OI_Addition { get; set; }

        // Metadatos
        public string LensType { get; set; }
        public string SalespersonName { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string SessionId { get; set; }
    }

    /// <summary>
    /// Alerta de validación en tiempo real
    /// </summary>
    public class ValidationAlert
    {
        public string AlertType { get; set; }        // "Error", "Warning", "Info"
        public string Message { get; set; }
        public string Field { get; set; }            // "OD_Sphere", "OI_Cylinder", etc.
        public string Severity { get; set; }         // "Low", "Medium", "High"
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Estado de sesión de venta activa
    /// </summary>
    public class ActiveSaleSession
    {
        public string SessionId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string SalespersonConnectionId { get; set; }
        public List<string> DoctorConnectionIds { get; set; } = new List<string>();
        public DateTime StartedAt { get; set; } = DateTime.Now;
        public RxRealtimeData CurrentRxData { get; set; }
    }

    #endregion

    /// <summary>
    /// Hub de SignalR para sincronización en tiempo real
    /// entre Vendedores y Optometristas (Sistema "Espejo")
    /// </summary>
    public class ClinicalHub : Hub
    {
        private readonly ILogger<ClinicalHub> _logger;

        // Diccionario en memoria para sesiones activas
        // En producción, usar Redis o SQL Server Backplane
        private static readonly ConcurrentDictionary<string, ActiveSaleSession> _activeSessions
            = new ConcurrentDictionary<string, ActiveSaleSession>();

        // Mapeo de usuarios a roles
        private static readonly ConcurrentDictionary<string, string> _userRoles
            = new ConcurrentDictionary<string, string>(); // connectionId -> "Salesperson" | "Doctor"

        public ClinicalHub(ILogger<ClinicalHub> logger)
        {
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // EVENTOS DE CONEXIÓN
        // ═══════════════════════════════════════════════════════════════════════

        public override async Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            _logger.LogInformation($"🔌 Cliente conectado: {connectionId}");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var connectionId = Context.ConnectionId;
            _logger.LogInformation($"🔌 Cliente desconectado: {connectionId}");

            // Limpiar sesiones activas
            foreach (var session in _activeSessions.Values)
            {
                if (session.SalespersonConnectionId == connectionId)
                {
                    _activeSessions.TryRemove(session.SessionId, out _);
                    _logger.LogInformation($"🗑️ Sesión cerrada: {session.SessionId}");
                }

                session.DoctorConnectionIds.Remove(connectionId);
            }

            _userRoles.TryRemove(connectionId, out _);

            await base.OnDisconnectedAsync(exception);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // REGISTRO DE ROLES
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Registra el rol del usuario conectado
        /// </summary>
        public async Task RegisterRole(string role)
        {
            var connectionId = Context.ConnectionId;
            _userRoles[connectionId] = role;

            _logger.LogInformation($"👤 Rol registrado: {connectionId} -> {role}");

            await Clients.Caller.SendAsync("RoleRegistered", new { role, connectionId });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // INICIAR SESIÓN DE VENTA (VENDEDOR)
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Inicia una nueva sesión de venta con sincronización
        /// </summary>
        public async Task StartSaleSession(int patientId, string patientName, string salespersonName)
        {
            var connectionId = Context.ConnectionId;
            var sessionId = Guid.NewGuid().ToString();

            var session = new ActiveSaleSession
            {
                SessionId = sessionId,
                PatientId = patientId,
                PatientName = patientName,
                SalespersonConnectionId = connectionId,
                CurrentRxData = new RxRealtimeData
                {
                    PatientId = patientId,
                    PatientName = patientName,
                    SalespersonName = salespersonName,
                    SessionId = sessionId
                }
            };

            _activeSessions[sessionId] = session;

            _logger.LogInformation($"🛒 Sesión de venta iniciada: {sessionId} - Paciente: {patientName}");

            // Notificar al vendedor
            await Clients.Caller.SendAsync("SaleSessionStarted", new
            {
                sessionId,
                patientId,
                patientName,
                message = "Sesión iniciada - Los optometristas pueden ver los datos en tiempo real"
            });

            // Notificar a todos los optometristas conectados
            await BroadcastToDoctors("NewSaleSessionStarted", new
            {
                sessionId,
                patientId,
                patientName,
                salespersonName,
                startedAt = session.StartedAt
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // TRANSMITIR MÉTRICAS DEL PACIENTE (VENDEDOR → DOCTOR)
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Transmite cambios de RX en tiempo real (delay 0ms)
        /// </summary>
        public async Task BroadcastPatientMetrics(string sessionId, RxRealtimeData rxData)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                _logger.LogWarning($"⚠️ Sesión no encontrada: {sessionId}");
                return;
            }

            // Actualizar datos de la sesión
            session.CurrentRxData = rxData;
            rxData.Timestamp = DateTime.Now;
            rxData.SessionId = sessionId;

            _logger.LogDebug($"📡 Broadcasting RX data: Paciente={rxData.PatientName}, " +
                             $"OD={rxData.OD_Sphere}/{rxData.OD_Cylinder}");

            // ═══ VALIDACIÓN AUTOMÁTICA EN TIEMPO REAL ═══
            var alerts = PerformRealtimeValidation(rxData);

            // ═══ ENVIAR A TODOS LOS DOCTORES CONECTADOS ═══
            await BroadcastToDoctors("PatientMetricsUpdated", new
            {
                sessionId,
                rxData,
                alerts
            });

            // Si hay alertas críticas, notificar también al vendedor
            if (alerts.Exists(a => a.Severity == "High"))
            {
                await Clients.Client(session.SalespersonConnectionId).SendAsync("CriticalAlert", alerts);
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VALIDACIÓN EN TIEMPO REAL
        // ═══════════════════════════════════════════════════════════════════════

        private List<ValidationAlert> PerformRealtimeValidation(RxRealtimeData rxData)
        {
            var alerts = new List<ValidationAlert>();

            // ═══ VALIDACIÓN 1: Cilindro Positivo (ERROR COMÚN) ═══
            if (rxData.OD_Cylinder.HasValue && rxData.OD_Cylinder > 0)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Error",
                    Message = "⚠️ CILINDRO POSITIVO detectado en OD - Verificar transposición",
                    Field = "OD_Cylinder",
                    Severity = "High"
                });
            }

            if (rxData.OI_Cylinder.HasValue && rxData.OI_Cylinder > 0)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Error",
                    Message = "⚠️ CILINDRO POSITIVO detectado en OI - Verificar transposición",
                    Field = "OI_Cylinder",
                    Severity = "High"
                });
            }

            // ═══ VALIDACIÓN 2: Cilindro sin Eje ═══
            if (rxData.OD_Cylinder.HasValue && Math.Abs(rxData.OD_Cylinder.Value) > 0.25m && !rxData.OD_Axis.HasValue)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Warning",
                    Message = "⚠️ Cilindro OD sin eje definido",
                    Field = "OD_Axis",
                    Severity = "Medium"
                });
            }

            if (rxData.OI_Cylinder.HasValue && Math.Abs(rxData.OI_Cylinder.Value) > 0.25m && !rxData.OI_Axis.HasValue)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Warning",
                    Message = "⚠️ Cilindro OI sin eje definido",
                    Field = "OI_Axis",
                    Severity = "Medium"
                });
            }

            // ═══ VALIDACIÓN 3: Esfera muy alta ═══
            if (rxData.OD_Sphere.HasValue && Math.Abs(rxData.OD_Sphere.Value) > 6.00m)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Info",
                    Message = "💡 Esfera alta en OD - Sugerir Alto Índice",
                    Field = "OD_Sphere",
                    Severity = "Low"
                });
            }

            if (rxData.OI_Sphere.HasValue && Math.Abs(rxData.OI_Sphere.Value) > 6.00m)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Info",
                    Message = "💡 Esfera alta en OI - Sugerir Alto Índice",
                    Field = "OI_Sphere",
                    Severity = "Low"
                });
            }

            // ═══ VALIDACIÓN 4: Progresivos sin adición ═══
            if (rxData.LensType == "Progresivo" && !rxData.OD_Addition.HasValue)
            {
                alerts.Add(new ValidationAlert
                {
                    AlertType = "Error",
                    Message = "⚠️ Lentes progresivos requieren adición",
                    Field = "OD_Addition",
                    Severity = "High"
                });
            }

            return alerts;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DOCTOR ENVÍA CORRECCIÓN AL VENDEDOR
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Permite al optometrista enviar una corrección al vendedor
        /// </summary>
        public async Task SendCorrectionToSalesperson(string sessionId, string field, string correctedValue, string notes)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                _logger.LogWarning($"⚠️ Sesión no encontrada: {sessionId}");
                return;
            }

            _logger.LogInformation($"📝 Corrección enviada: Sesión={sessionId}, Campo={field}, Valor={correctedValue}");

            // Enviar al vendedor
            await Clients.Client(session.SalespersonConnectionId).SendAsync("CorrectionReceived", new
            {
                field,
                correctedValue,
                notes,
                timestamp = DateTime.Now,
                message = $"🔬 El optometrista sugiere corregir {field} a {correctedValue}"
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // CERRAR SESIÓN DE VENTA
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Finaliza la sesión de venta
        /// </summary>
        public async Task EndSaleSession(string sessionId)
        {
            if (_activeSessions.TryRemove(sessionId, out var session))
            {
                _logger.LogInformation($"✅ Sesión finalizada: {sessionId}");

                await BroadcastToDoctors("SaleSessionEnded", new
                {
                    sessionId,
                    patientName = session.PatientName,
                    duration = (DateTime.Now - session.StartedAt).TotalMinutes
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // UTILIDADES INTERNAS
        // ═══════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Envía un mensaje a todos los optometristas conectados
        /// </summary>
        private async Task BroadcastToDoctors(string method, object data)
        {
            var doctorConnectionIds = _userRoles
                .Where(kvp => kvp.Value == "Doctor")
                .Select(kvp => kvp.Key)
                .ToList();

            if (doctorConnectionIds.Any())
            {
                await Clients.Clients(doctorConnectionIds).SendAsync(method, data);
            }
        }

        /// <summary>
        /// Obtiene sesiones activas (para monitoreo)
        /// </summary>
        public async Task<List<ActiveSaleSession>> GetActiveSessions()
        {
            var sessions = _activeSessions.Values.ToList();
            await Clients.Caller.SendAsync("ActiveSessionsList", sessions);
            return sessions;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN EN STARTUP.CS
    // ═══════════════════════════════════════════════════════════════════════════

    /* EJEMPLO DE CONFIGURACIÓN

    // En Program.cs o Startup.cs

    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    });

    // Configurar CORS si frontend está en otro puerto
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReact", builder =>
        {
            builder.WithOrigins("http://localhost:3000", "http://localhost:5173")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
    });

    var app = builder.Build();

    app.UseCors("AllowReact");

    app.MapHub<ClinicalHub>("/hubs/clinical");

    */
}

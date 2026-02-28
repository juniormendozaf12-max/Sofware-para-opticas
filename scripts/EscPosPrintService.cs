// ═══════════════════════════════════════════════════════════════════════════════
// 🖨️ ESC/POS PRINT SERVICE - IMPRESORA TÉRMICA ADVANCE ADV-8010N
// Sistema: Centro Óptico Sicuani
// Versión: 6.0 Enterprise
// ═══════════════════════════════════════════════════════════════════════════════

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace OpticaSicuani.Services
{
    #region ═══ MODELOS DE DATOS ═══

    /// <summary>
    /// Datos para orden de laboratorio
    /// </summary>
    public class LaboratoryOrder
    {
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public string PatientName { get; set; }

        // RX Data
        public string OD_Sphere { get; set; }
        public string OD_Cylinder { get; set; }
        public string OD_Axis { get; set; }
        public string OD_Addition { get; set; }

        public string OI_Sphere { get; set; }
        public string OI_Cylinder { get; set; }
        public string OI_Axis { get; set; }
        public string OI_Addition { get; set; }

        // Lens Data
        public string LensType { get; set; }
        public string Material { get; set; }
        public string SeriesDetected { get; set; }

        // Frame Data
        public string FrameBrand { get; set; }
        public string FrameModel { get; set; }
        public string FrameColor { get; set; }

        // QR Code
        public string QRCodeData { get; set; }

        // Delivery
        public DateTime ExpectedDeliveryDate { get; set; }
        public string Notes { get; set; }
    }

    #endregion

    /// <summary>
    /// Servicio de impresión ESC/POS para impresora térmica
    /// Compatible con Advance ADV-8010N (80mm)
    /// </summary>
    public class EscPosPrintService
    {
        private readonly ILogger<EscPosPrintService> _logger;
        private readonly string _printerName;

        // ═══ COMANDOS ESC/POS ═══
        private static class EscPos
        {
            // Control
            public static readonly byte[] ESC = { 0x1B };
            public static readonly byte[] GS = { 0x1D };

            // Inicialización
            public static readonly byte[] INIT = { 0x1B, 0x40 };

            // Alineación
            public static readonly byte[] ALIGN_LEFT = { 0x1B, 0x61, 0x00 };
            public static readonly byte[] ALIGN_CENTER = { 0x1B, 0x61, 0x01 };
            public static readonly byte[] ALIGN_RIGHT = { 0x1B, 0x61, 0x02 };

            // Tamaño de texto
            public static readonly byte[] TEXT_NORMAL = { 0x1D, 0x21, 0x00 };
            public static readonly byte[] TEXT_2HEIGHT = { 0x1D, 0x21, 0x01 };
            public static readonly byte[] TEXT_2WIDTH = { 0x1D, 0x21, 0x10 };
            public static readonly byte[] TEXT_DOUBLE = { 0x1D, 0x21, 0x11 };

            // Estilo
            public static readonly byte[] BOLD_ON = { 0x1B, 0x45, 0x01 };
            public static readonly byte[] BOLD_OFF = { 0x1B, 0x45, 0x00 };
            public static readonly byte[] UNDERLINE_ON = { 0x1B, 0x2D, 0x01 };
            public static readonly byte[] UNDERLINE_OFF = { 0x1B, 0x2D, 0x00 };

            // Saltos de línea
            public static readonly byte[] LINE_FEED = { 0x0A };
            public static readonly byte[] FORM_FEED = { 0x0C };

            // Corte de papel
            public static readonly byte[] CUT_PAPER_FULL = { 0x1D, 0x56, 0x00 };
            public static readonly byte[] CUT_PAPER_PARTIAL = { 0x1D, 0x56, 0x01 };

            // Código QR
            public static byte[] QR_MODEL(int model = 49) => new byte[] { 0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, (byte)model, 0x00 };
            public static byte[] QR_SIZE(int size = 5) => new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, (byte)size };
            public static byte[] QR_ERROR_CORRECTION(int level = 48) => new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, (byte)level };
            public static byte[] QR_PRINT = { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30 };
        }

        public EscPosPrintService(ILogger<EscPosPrintService> logger, string printerName = null)
        {
            _logger = logger;
            _printerName = printerName ?? "Advance ADV-8010N"; // Nombre por defecto
        }

        // ═══════════════════════════════════════════════════════════════════════
        // MÉTODO PRINCIPAL: Imprimir Orden de Laboratorio
        // ═══════════════════════════════════════════════════════════════════════

        public async Task<bool> PrintLaboratoryOrderAsync(LaboratoryOrder order)
        {
            try
            {
                _logger.LogInformation($"🖨️ Iniciando impresión de orden: {order.OrderNumber}");

                // Construir documento ESC/POS
                var escPosData = BuildLaboratoryOrderDocument(order);

                // Enviar a impresora
                bool success = await SendToP rinterAsync(escPosData);

                if (success)
                {
                    _logger.LogInformation($"✅ Orden impresa exitosamente: {order.OrderNumber}");
                }
                else
                {
                    _logger.LogError($"❌ Error al imprimir orden: {order.OrderNumber}");
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Excepción al imprimir orden: {order.OrderNumber}");
                return false;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // CONSTRUIR DOCUMENTO ESC/POS
        // ═══════════════════════════════════════════════════════════════════════

        private byte[] BuildLaboratoryOrderDocument(LaboratoryOrder order)
        {
            using (var ms = new MemoryStream())
            {
                // ═══ INICIALIZAR IMPRESORA ═══
                ms.Write(EscPos.INIT);

                // ═══ LOGO (Opcional - requiere imagen) ═══
                // byte[] logoBytes = LoadLogoImage();
                // if (logoBytes != null)
                //     ms.Write(logoBytes);

                // ═══ ENCABEZADO ═══
                ms.Write(EscPos.ALIGN_CENTER);
                ms.Write(EscPos.TEXT_DOUBLE);
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, "CENTRO ÓPTICO SICUANI");
                ms.Write(EscPos.LINE_FEED);

                ms.Write(EscPos.TEXT_NORMAL);
                ms.Write(EscPos.BOLD_OFF);
                WriteText(ms, "Dos de Mayo #123 - Sicuani");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, "Teléfono: (084) 123-4567");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.LINE_FEED);

                // ═══ TÍTULO ═══
                ms.Write(EscPos.TEXT_2HEIGHT);
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, "ORDEN DE LABORATORIO");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.TEXT_NORMAL);
                ms.Write(EscPos.BOLD_OFF);

                // Línea separadora
                ms.Write(EscPos.ALIGN_LEFT);
                WriteText(ms, new string('=', 48));
                ms.Write(EscPos.LINE_FEED);

                // ═══ DATOS DE LA ORDEN ═══
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, $"Orden: {order.OrderNumber}");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.BOLD_OFF);

                WriteText(ms, $"Fecha: {order.OrderDate:dd/MM/yyyy HH:mm}");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, $"Paciente: {order.PatientName}");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, new string('-', 48));
                ms.Write(EscPos.LINE_FEED);

                // ═══ RECETA (RX) - FORMATO TABLA ═══
                ms.Write(EscPos.BOLD_ON);
                ms.Write(EscPos.TEXT_2WIDTH);
                WriteText(ms, "RECETA:");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.TEXT_NORMAL);
                ms.Write(EscPos.BOLD_OFF);

                // Encabezado de tabla
                WriteText(ms, "       ESF    CIL    EJE    ADD");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, new string('-', 48));
                ms.Write(EscPos.LINE_FEED);

                // OJO DERECHO
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, "OD  ");
                ms.Write(EscPos.BOLD_OFF);
                WriteText(ms, string.Format("{0,6} {1,6} {2,4}° {3,6}",
                    order.OD_Sphere ?? "  -  ",
                    order.OD_Cylinder ?? "  -  ",
                    order.OD_Axis ?? "  -",
                    order.OD_Addition ?? "  -  "));
                ms.Write(EscPos.LINE_FEED);

                // OJO IZQUIERDO
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, "OI  ");
                ms.Write(EscPos.BOLD_OFF);
                WriteText(ms, string.Format("{0,6} {1,6} {2,4}° {3,6}",
                    order.OI_Sphere ?? "  -  ",
                    order.OI_Cylinder ?? "  -  ",
                    order.OI_Axis ?? "  -",
                    order.OI_Addition ?? "  -  "));
                ms.Write(EscPos.LINE_FEED);

                WriteText(ms, new string('-', 48));
                ms.Write(EscPos.LINE_FEED);

                // ═══ ESPECIFICACIONES DE LUNAS ═══
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, "ESPECIFICACIONES:");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.BOLD_OFF);

                WriteText(ms, $"Tipo: {order.LensType}");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, $"Material: {order.Material}");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, $"Serie: {order.SeriesDetected}");
                ms.Write(EscPos.LINE_FEED);

                // ═══ MONTURA ═══
                if (!string.IsNullOrEmpty(order.FrameBrand))
                {
                    ms.Write(EscPos.LINE_FEED);
                    ms.Write(EscPos.BOLD_ON);
                    WriteText(ms, "MONTURA:");
                    ms.Write(EscPos.LINE_FEED);
                    ms.Write(EscPos.BOLD_OFF);

                    WriteText(ms, $"{order.FrameBrand} {order.FrameModel}");
                    ms.Write(EscPos.LINE_FEED);
                    WriteText(ms, $"Color: {order.FrameColor}");
                    ms.Write(EscPos.LINE_FEED);
                }

                // ═══ FECHA DE ENTREGA ═══
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, new string('=', 48));
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.ALIGN_CENTER);
                ms.Write(EscPos.TEXT_2HEIGHT);
                ms.Write(EscPos.BOLD_ON);
                WriteText(ms, $"Entrega: {order.ExpectedDeliveryDate:dd/MM/yyyy}");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.TEXT_NORMAL);
                ms.Write(EscPos.BOLD_OFF);

                // ═══ NOTAS ═══
                if (!string.IsNullOrEmpty(order.Notes))
                {
                    ms.Write(EscPos.ALIGN_LEFT);
                    ms.Write(EscPos.LINE_FEED);
                    ms.Write(EscPos.BOLD_ON);
                    WriteText(ms, "NOTAS:");
                    ms.Write(EscPos.LINE_FEED);
                    ms.Write(EscPos.BOLD_OFF);
                    WriteText(ms, order.Notes);
                    ms.Write(EscPos.LINE_FEED);
                }

                // ═══ CÓDIGO QR ═══
                if (!string.IsNullOrEmpty(order.QRCodeData))
                {
                    ms.Write(EscPos.LINE_FEED);
                    ms.Write(EscPos.ALIGN_CENTER);
                    WriteText(ms, "Seguimiento:");
                    ms.Write(EscPos.LINE_FEED);
                    PrintQRCode(ms, order.QRCodeData);
                    ms.Write(EscPos.LINE_FEED);
                }

                // ═══ PIE DE PÁGINA ═══
                ms.Write(EscPos.ALIGN_CENTER);
                ms.Write(EscPos.TEXT_NORMAL);
                WriteText(ms, new string('-', 48));
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, "Gracias por su preferencia");
                ms.Write(EscPos.LINE_FEED);
                WriteText(ms, "www.opticasicuani.com");
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.LINE_FEED);
                ms.Write(EscPos.LINE_FEED);

                // ═══ CORTE DE PAPEL ═══
                ms.Write(EscPos.CUT_PAPER_PARTIAL);

                return ms.ToArray();
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // IMPRIMIR CÓDIGO QR
        // ═══════════════════════════════════════════════════════════════════════

        private void PrintQRCode(MemoryStream ms, string data)
        {
            // Configurar modelo QR
            ms.Write(EscPos.QR_MODEL());

            // Tamaño del QR (3-8, default 5)
            ms.Write(EscPos.QR_SIZE(5));

            // Nivel de corrección de errores (L=48, M=49, Q=50, H=51)
            ms.Write(EscPos.QR_ERROR_CORRECTION(49)); // Medium

            // Almacenar datos del QR
            var qrDataBytes = Encoding.UTF8.GetBytes(data);
            var qrDataLength = qrDataBytes.Length + 3;

            ms.Write(new byte[] { 0x1D, 0x28, 0x6B });
            ms.Write(BitConverter.GetBytes((short)qrDataLength), 0, 2);
            ms.Write(new byte[] { 0x31, 0x50, 0x30 });
            ms.Write(qrDataBytes);

            // Imprimir QR
            ms.Write(EscPos.QR_PRINT);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // UTILIDADES
        // ═══════════════════════════════════════════════════════════════════════

        private void WriteText(MemoryStream ms, string text)
        {
            var bytes = Encoding.GetEncoding(850).GetBytes(text); // Code Page 850 (Latin-1)
            ms.Write(bytes);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ENVIAR A IMPRESORA (WINDOWS)
        // ═══════════════════════════════════════════════════════════════════════

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOC_INFO_1 pDocInfo);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        private struct DOC_INFO_1
        {
            public string pDocName;
            public string pOutputFile;
            public string pDataType;
        }

        private async Task<bool> SendToPrinterAsync(byte[] data)
        {
            return await Task.Run(() =>
            {
                IntPtr hPrinter = IntPtr.Zero;
                try
                {
                    if (!OpenPrinter(_printerName, out hPrinter, IntPtr.Zero))
                    {
                        _logger.LogError($"❌ No se pudo abrir la impresora: {_printerName}");
                        return false;
                    }

                    DOC_INFO_1 docInfo = new DOC_INFO_1
                    {
                        pDocName = "Orden de Laboratorio",
                        pDataType = "RAW",
                        pOutputFile = null
                    };

                    if (!StartDocPrinter(hPrinter, 1, ref docInfo))
                    {
                        _logger.LogError("❌ No se pudo iniciar el documento de impresión");
                        return false;
                    }

                    if (!StartPagePrinter(hPrinter))
                    {
                        EndDocPrinter(hPrinter);
                        _logger.LogError("❌ No se pudo iniciar la página de impresión");
                        return false;
                    }

                    IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(data.Length);
                    Marshal.Copy(data, 0, pUnmanagedBytes, data.Length);

                    bool success = WritePrinter(hPrinter, pUnmanagedBytes, data.Length, out int bytesWritten);

                    Marshal.FreeCoTaskMem(pUnmanagedBytes);

                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);

                    return success;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error al enviar datos a impresora");
                    return false;
                }
                finally
                {
                    if (hPrinter != IntPtr.Zero)
                    {
                        ClosePrinter(hPrinter);
                    }
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EJEMPLO DE USO EN CONTROLADOR
    // ═══════════════════════════════════════════════════════════════════════════

    /* EJEMPLO

    [ApiController]
    [Route("api/[controller]")]
    public class PrintController : ControllerBase
    {
        private readonly EscPosPrintService _printService;

        public PrintController(EscPosPrintService printService)
        {
            _printService = printService;
        }

        [HttpPost("laboratory-order")]
        public async Task<IActionResult> PrintLaboratoryOrder([FromBody] LaboratoryOrder order)
        {
            bool success = await _printService.PrintLaboratoryOrderAsync(order);

            if (success)
                return Ok(new { message = "Orden impresa exitosamente" });
            else
                return StatusCode(500, new { error = "Error al imprimir" });
        }
    }

    */
}

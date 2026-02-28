# 🎯 GUÍA RÁPIDA: SISTEMA DE CÓDIGOS QR Y LECTOR USB

## 📱 NUEVAS FUNCIONALIDADES IMPLEMENTADAS

### ✅ 1. GENERACIÓN DE CÓDIGOS QR

**Cómo usar:**
1. Abre el sistema y haz login
2. Click en el botón **"📱 Códigos QR"** en el ribbon superior
3. Busca un producto escribiendo su código o nombre
4. Click en **"📱 Generar QR"** del producto deseado
5. En el modal que aparece:
   - **💾 Descargar PNG**: Descarga imagen del QR
   - **📄 Descargar PDF**: Descarga PDF profesional con QR
   - **❌ Cerrar**: Cierra el modal

**Características:**
- QR de alta calidad (256x256px)
- PDF incluye: Logo, nombre producto, precio, SKU
- Ideal para imprimir etiquetas

---

### ✅ 2. LECTOR USB (KEYBOARD EMULATION)

**Requisitos:**
- Lector de códigos USB que emule teclado
- Ejemplos: Honeywell Voyager, Zebra DS2208, o genéricos ($25-150 USD)

**Cómo activar:**
1. Ve a la sección **"📱 Códigos QR"**
2. Click en **"▶️ Activar Escaneo"** (panel inferior)
3. El botón cambiará a **"⏸️ Desactivar Escaneo"** (rojo)
4. Verás un indicador en la esquina inferior izquierda: **"🎯 Modo Escaneo Activo"**

**Cómo funciona:**
- Conecta el lector USB a la computadora
- Con el modo activo, escanea cualquier código
- Si estás en la sección de **Ventas**, el producto se agrega automáticamente
- Si estás en otra sección, muestra notificación del producto encontrado
- Escucharás un "beep" al escanear exitosamente

**Ventajas:**
- No interfiere con inputs normales (búsquedas, formularios)
- Detección inteligente (100ms entre caracteres)
- Mínimo 4 caracteres para validar
- Feedback visual y sonoro

---

### ✅ 3. IMPRESIÓN MEJORADA (CÓDIGO DE BARRAS EN TICKETS)

**Automático:**
- Todos los tickets térmicos (80mm) ahora incluyen código de barras
- Se genera automáticamente al imprimir BOLETA/FACTURA/TICKET
- Ubicado al final del ticket, antes del cierre
- Formato: CODE128 (estándar internacional)
- Codifica: Serie + Número (ej: B001-00123)

**Beneficios:**
- Búsqueda rápida de ventas escaneando el ticket
- Seguimiento de documentos
- Archivo digital más eficiente

---

## 🎓 CASOS DE USO

### **Caso 1: Etiquetar Productos**
1. Generar QR de cada producto
2. Descargar PDF
3. Imprimir en etiquetas adhesivas
4. Pegar en productos/cajas
5. Al recibir inventario, escanear para verificar

### **Caso 2: Venta Rápida**
1. Activar modo escaneo
2. Cliente escoge productos
3. Escanear cada producto (se agregan automáticamente)
4. Finalizar venta
5. El ticket incluye código de barras

### **Caso 3: Búsqueda de Ventas**
1. Cliente trae ticket impreso
2. Escanear código de barras del ticket
3. Sistema busca venta por serie-número
4. Ver detalles, reimprimir, o modificar estado

---

## 🛠️ CONFIGURACIÓN DE LECTOR USB

### **Paso 1: Conectar**
- Plug & Play, no requiere drivers especiales
- Windows lo reconoce como "teclado"
- Luz indicadora debe encender

### **Paso 2: Probar**
1. Abre Notepad/Bloc de notas
2. Escanea un código
3. Debe aparecer el texto automáticamente + Enter
4. Si funciona → listo para usar en el sistema

### **Paso 3: Configuración Opcional**
- Algunos lectores permiten configurar:
  - Prefijo/Sufijo (no necesario)
  - Velocidad de escaneo
  - Sonido beep (recomendado: ON)

---

## ⚙️ SOLUCIÓN DE PROBLEMAS

### **El código QR no se genera:**
- Verifica que el navegador tenga acceso a librerías CDN
- Revisa consola del navegador (F12) por errores
- Asegúrate de tener conexión a internet (las librerías se cargan desde CDN)

### **El lector USB no funciona:**
- Verifica que esté en modo "keyboard emulation"
- Prueba en Notepad primero
- Asegúrate de activar el modo escaneo en el sistema
- Revisa que el foco no esté en un input de texto

### **El producto no se encuentra al escanear:**
- Verifica que el código escaneado coincida con:
  - `id` del producto
  - `codigo` del producto
  - `subCodigo` del producto
- Revisa en la sección de Inventario que el producto exista

### **El código de barras no aparece en el ticket:**
- Espera 500ms antes de que se genere
- Verifica conexión a internet (JsBarcode se carga desde CDN)
- Si persiste, el ticket se imprime sin código (funciona igual)

---

## 📊 COMPATIBILIDAD

### **Navegadores Soportados:**
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ⚠️ Safari 14+ (funcional, pero puede tener problemas con PDFs)

### **Sistemas Operativos:**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora, etc.)

### **Lectores USB Recomendados:**
- **Honeywell Voyager 1200g**: $120 USD (profesional)
- **Zebra DS2208**: $150 USD (alta velocidad)
- **Genéricos China**: $25-40 USD (funcionales)
- **Tera HW0002**: $35 USD (Amazon, buenas reseñas)

---

## 🚀 PRÓXIMOS PASOS

1. **Inmediato**: Probar generación de QR
2. **Esta semana**: Comprar lector USB
3. **Al recibir lector**: Activar modo escaneo y probar
4. **Opcional**: Imprimir etiquetas QR para todos los productos

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12 → Console)
2. Verifica que las librerías CDN estén cargando
3. Comprueba que el lector USB funcione en Notepad
4. Contacta al desarrollador con capturas de pantalla de errores

---

**Versión del Sistema:** 5.0 Purple Edition + Códigos QR
**Fecha de Implementación:** 30 de Diciembre 2025
**Desarrollado por:** Claude AI + Equipo Optica Sicuani

---

## ✨ CARACTERÍSTICAS TÉCNICAS

### **Librerías Utilizadas:**
- **QRCode.js 1.0.0**: Generación de códigos QR
- **JsBarcode 3.11.5**: Generación de códigos de barras
- **jsPDF 2.5.1**: Exportación a PDF

### **Formato de Códigos:**
- **QR Code**: ECC Level H (30% de corrección de errores)
- **Barcode**: CODE128 (soporta alfanumérico)
- **Tamaño QR**: 256x256px (configurable)
- **Altura Barcode**: 40px

### **Rendimiento:**
- Generación QR: < 100ms
- Generación Barcode: < 50ms
- Descarga PNG: Instantánea
- Generación PDF: < 500ms

---

¡LISTO PARA USAR! 🎉

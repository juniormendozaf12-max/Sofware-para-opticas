# -*- coding: utf-8 -*-
"""
Script para generar el sistema OptiABI completo
"""

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sistema de Gestión Óptica - OptiABI v6.0</title>
<style>
/* ==================== VARIABLES GLOBALES ==================== */
:root {
  /* Colores Morado (Centro Óptico Sicuani - Dos de Mayo) */
  --morado-50: #faf5ff;
  --morado-100: #f3e8ff;
  --morado-200: #e9d5ff;
  --morado-300: #d8b4fe;
  --morado-400: #c084fc;
  --morado-500: #a855f7;
  --morado-600: #9333ea;
  --morado-700: #7c3aed;
  --morado-800: #6b21a8;
  --morado-900: #581c87;

  /* Colores Azul (Óptica Sicuani - Plaza de Armas) */
  --azul-50: #eff6ff;
  --azul-100: #dbeafe;
  --azul-200: #bfdbfe;
  --azul-300: #93c5fd;
  --azul-400: #60a5fa;
  --azul-500: #3b82f6;
  --azul-600: #2563eb;
  --azul-700: #1d4ed8;
  --azul-800: #1e40af;
  --azul-900: #1e3a8a;

  /* Grises */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Colores de estado */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  /* Variables dinámicas (cambian según establecimiento) */
  --primary-50: var(--morado-50);
  --primary-100: var(--morado-100);
  --primary-200: var(--morado-200);
  --primary-300: var(--morado-300);
  --primary-400: var(--morado-400);
  --primary-500: var(--morado-500);
  --primary-600: var(--morado-600);
  --primary-700: var(--morado-700);
  --primary-800: var(--morado-800);
  --primary-900: var(--morado-900);
}

/* Tema Azul para Plaza de Armas */
body.tema-azul {
  --primary-50: var(--azul-50);
  --primary-100: var(--azul-100);
  --primary-200: var(--azul-200);
  --primary-300: var(--azul-300);
  --primary-400: var(--azul-400);
  --primary-500: var(--azul-500);
  --primary-600: var(--azul-600);
  --primary-700: var(--azul-700);
  --primary-800: var(--azul-800);
  --primary-900: var(--azul-900);
}

/* ==================== RESET Y BASE ==================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  min-height: 100vh;
  overflow: hidden;
}

/* ==================== PANTALLA DE LOGIN ==================== */
#loginScreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

#loginScreen.hidden {
  display: none;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 50px;
  box-shadow: 0 25px 70px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 480px;
  animation: slideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-icon {
  font-size: 80px;
  margin-bottom: 15px;
  animation: floatGlasses 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
}

@keyframes floatGlasses {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-12px) rotate(-6deg);
  }
  50% {
    transform: translateY(0px) rotate(0deg);
  }
  75% {
    transform: translateY(-12px) rotate(6deg);
  }
}

.login-title {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: var(--gray-600);
  font-size: 15px;
  font-weight: 500;
}

.login-field {
  margin-bottom: 22px;
}

.login-field label {
  display: block;
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 10px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.login-field input,
.login-field select {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: var(--gray-50);
}

.login-field input:focus,
.login-field select:focus {
  outline: none;
  border-color: var(--primary-500);
  background: white;
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

.login-error {
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  display: none;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.login-error.show {
  display: block;
}

.login-buttons {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
  flex: 1;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before {
  width: 400px;
  height: 400px;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-700);
  flex: 1;
}

.btn-secondary:hover {
  background: var(--gray-300);
  transform: translateY(-2px);
}

/* ==================== SISTEMA PRINCIPAL ==================== */
#mainSystem {
  display: none;
  height: 100vh;
  flex-direction: column;
}

#mainSystem.active {
  display: flex;
}

/* Ribbon Superior */
.ribbon {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  padding: 12px 20px;
  display: flex;
  overflow-x: auto;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1000;
}

.ribbon::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-400), var(--primary-600), var(--primary-400));
}

.ribbon-btn {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 14px 22px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 110px;
  transition: all 0.3s;
  white-space: nowrap;
}

.ribbon-btn:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.ribbon-btn.active {
  background: white;
  color: var(--primary-700);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

.ribbon-btn-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

/* Contenedor principal */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--gray-100);
}

/* Módulos */
.module {
  display: none;
  flex: 1;
  overflow: auto;
  padding: 25px;
}

.module.active {
  display: flex;
  flex-direction: column;
}

/* Ventana de contenido */
.window {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  padding: 35px;
  margin-bottom: 20px;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--primary-200);
}

.window-title {
  font-size: 30px;
  font-weight: 800;
  color: var(--primary-700);
  display: flex;
  align-items: center;
  gap: 15px;
}

.window-title-icon {
  font-size: 36px;
}

.window-subtitle {
  color: var(--gray-600);
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
}

/* Cards */
.card {
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.card:hover {
  border-color: var(--primary-300);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-700);
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-200);
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Formularios */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 12px 15px;
  border: 2px solid var(--gray-300);
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s;
  background: var(--gray-50);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  background: white;
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

.form-field input[readonly] {
  background: var(--gray-100);
  cursor: not-allowed;
}

/* Tablas */
.table-container {
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
}

th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--gray-200);
  font-size: 14px;
}

tbody tr {
  transition: all 0.2s;
}

tbody tr:hover {
  background: var(--primary-50);
}

/* Botones específicos */
.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

.btn-info {
  background: var(--info);
  color: white;
}

.btn-info:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.btn-warning {
  background: var(--warning);
  color: white;
}

.btn-warning:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

/* Modal / Ventana flotante */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay.active {
  display: flex;
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 35px;
  max-width: 95%;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 25px 70px rgba(0,0,0,0.3);
  animation: zoomIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 18px;
  border-bottom: 3px solid var(--primary-200);
}

.modal-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary-700);
}

.modal-close {
  background: var(--error);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #dc2626;
  transform: rotate(90deg) scale(1.1);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  border-bottom: 3px solid var(--gray-200);
  overflow-x: auto;
}

.tab-btn {
  padding: 14px 24px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
  margin-bottom: -3px;
}

.tab-btn:hover {
  color: var(--primary-600);
  background: var(--primary-50);
}

.tab-btn.active {
  color: var(--primary-700);
  border-bottom-color: var(--primary-700);
  background: var(--primary-50);
}

.tab-content {
  display: none;
  animation: fadeIn 0.3s;
}

.tab-content.active {
  display: block;
}

/* Notificaciones Toast */
.toast-container {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  background: white;
  border-radius: 14px;
  padding: 18px 22px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 14px;
  animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-left: 5px solid;
}

@keyframes slideInRight {
  from {
    transform: translateX(450px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success {
  border-left-color: var(--success);
}

.toast-error {
  border-left-color: var(--error);
}

.toast-info {
  border-left-color: var(--info);
}

.toast-warning {
  border-left-color: var(--warning);
}

.toast-icon {
  font-size: 28px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  color: var(--gray-600);
}

/* Utilidades */
.hidden {
  display: none !important;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mt-1 { margin-top: 10px; }
.mt-2 { margin-top: 20px; }
.mt-3 { margin-top: 30px; }
.mb-1 { margin-bottom: 10px; }
.mb-2 { margin-bottom: 20px; }
.mb-3 { margin-bottom: 30px; }

.flex {
  display: flex;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-1 { gap: 10px; }
.gap-2 { gap: 20px; }
.gap-3 { gap: 30px; }

/* Badge */
.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

/* Grid de prescripción */
.prescription-grid {
  display: grid;
  grid-template-columns: 100px repeat(9, 1fr);
  gap: 1px;
  background: var(--gray-300);
  border: 2px solid var(--gray-300);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
}

.prescription-grid > div {
  background: white;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.prescription-grid .header {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
  font-weight: 700;
  padding: 14px 8px;
  font-size: 12px;
  text-align: center;
}

.prescription-grid .label {
  background: var(--primary-100);
  font-weight: 700;
  color: var(--primary-800);
}

.prescription-grid input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
}

.prescription-grid input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--gray-100);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-400);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-600);
}

/* Responsivo */
@media (max-width: 768px) {
  .ribbon {
    padding: 8px 10px;
  }

  .ribbon-btn {
    min-width: 80px;
    padding: 10px 14px;
    font-size: 12px;
  }

  .ribbon-btn-icon {
    font-size: 24px;
  }

  .window {
    padding: 20px;
  }

  .window-title {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 25px;
  }

  .toast {
    min-width: 280px;
  }
}

/* Loading spinner */
.spinner {
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-600);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>
</head>
<body>

<!-- ==================== PANTALLA DE LOGIN ==================== -->
<div id="loginScreen">
  <div class="login-card">
    <div class="login-header">
      <div class="login-icon">👓</div>
      <h1 class="login-title">Sistema OptiABI</h1>
      <p class="login-subtitle">Sistema de Gestión de Ópticas</p>
    </div>

    <div class="login-error" id="loginError"></div>

    <div class="login-field">
      <label>👤 USUARIO</label>
      <input type="text" id="loginUsuario" placeholder="Ingrese su usuario" autocomplete="username">
    </div>

    <div class="login-field">
      <label>🔒 CONTRASEÑA</label>
      <input type="password" id="loginPassword" placeholder="Ingrese su contraseña" autocomplete="current-password">
    </div>

    <div class="login-field">
      <label>🏪 ESTABLECIMIENTO</label>
      <select id="loginEstablecimiento">
        <option value="">-- Seleccione Establecimiento --</option>
        <option value="DOS_DE_MAYO">🟣 Centro Óptico Sicuani (Dos de Mayo)</option>
        <option value="PLAZA_DE_ARMAS">🔵 Óptica Sicuani (Plaza de Armas)</option>
      </select>
    </div>

    <div class="login-buttons">
      <button class="btn btn-primary" onclick="intentarLogin()">
        ✓ Entrar al Sistema
      </button>
      <button class="btn btn-secondary" onclick="limpiarLogin()">
        ✖ Limpiar
      </button>
    </div>
  </div>
</div>

<!-- ==================== SISTEMA PRINCIPAL ==================== -->
<div id="mainSystem">
  <!-- Ribbon de navegación -->
  <div class="ribbon">
    <button class="ribbon-btn active" onclick="cambiarModulo('ventas')">
      <span class="ribbon-btn-icon">💰</span>
      <span>Ventas</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('clientes')">
      <span class="ribbon-btn-icon">👤</span>
      <span>Clientes</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('consultorio')">
      <span class="ribbon-btn-icon">🏥</span>
      <span>Consultorio</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('consultas')">
      <span class="ribbon-btn-icon">📋</span>
      <span>Consultas</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('buscarVentas')">
      <span class="ribbon-btn-icon">🔍</span>
      <span>Buscar Ventas</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('buscarRX')">
      <span class="ribbon-btn-icon">📄</span>
      <span>Buscar RX</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('inventario')">
      <span class="ribbon-btn-icon">📦</span>
      <span>Inventario</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('lunas')">
      <span class="ribbon-btn-icon">🔬</span>
      <span>Lunas</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('almacen')">
      <span class="ribbon-btn-icon">🏪</span>
      <span>Almacén</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('reportes')">
      <span class="ribbon-btn-icon">📊</span>
      <span>Reportes</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('caja')">
      <span class="ribbon-btn-icon">💵</span>
      <span>Caja</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('importacion')">
      <span class="ribbon-btn-icon">📥</span>
      <span>Importación</span>
    </button>
    <button class="ribbon-btn" onclick="cambiarModulo('configuracion')">
      <span class="ribbon-btn-icon">⚙️</span>
      <span>Configuración</span>
    </button>
    <button class="ribbon-btn" onclick="cerrarSesion()" style="margin-left: auto; background: rgba(239, 68, 68, 0.2);">
      <span class="ribbon-btn-icon">🚪</span>
      <span>Salir</span>
    </button>
  </div>

  <!-- Contenedor de notificaciones -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Contenedor principal -->
  <div class="main-container">

    <!-- ==================== MÓDULO: VENTAS ==================== -->
    <div id="moduloVentas" class="module active">
      <div class="window">
        <div class="window-header">
          <div>
            <h2 class="window-title">
              <span class="window-title-icon">💰</span>
              Sistema de Ventas
            </h2>
            <p class="window-subtitle" id="nombreEstablecimiento">Base de datos local activa</p>
          </div>
          <div>
            <span class="badge badge-info" id="badgeEstablecimiento">💾 BD Local</span>
          </div>
        </div>

        <!-- Datos del documento -->
        <div class="card">
          <h3 class="card-title">📄 Datos del Documento</h3>
          <div class="form-row">
            <div class="form-field">
              <label>Tipo Documento</label>
              <select id="tipoDocumento">
                <option value="NOTA_DE_VENTA">NOTA DE VENTA</option>
                <option value="TICKET">TICKET DE RECIBO</option>
              </select>
            </div>
            <div class="form-field">
              <label>Serie</label>
              <input type="text" id="serieDocumento" value="0001" readonly>
            </div>
            <div class="form-field">
              <label>Número</label>
              <input type="text" id="numeroDocumento" value="000001" readonly>
            </div>
            <div class="form-field">
              <label>F. Emisión</label>
              <input type="date" id="fechaEmision">
            </div>
            <div class="form-field">
              <label>F. Vencimiento</label>
              <input type="date" id="fechaVencimiento">
            </div>
          </div>
        </div>

        <!-- Cliente -->
        <div class="card">
          <h3 class="card-title">👤 Cliente</h3>
          <div class="form-row">
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Nombre del Cliente</label>
              <div style="display: flex; gap: 12px;">
                <input type="text" id="nombreCliente" placeholder="Buscar cliente por DNI o nombre..." style="flex: 1;">
                <button class="btn btn-info" onclick="buscarCliente()">🔍 Buscar</button>
                <button class="btn btn-success" onclick="nuevoCliente()">+ Nuevo Cliente</button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>DNI Cliente</label>
              <input type="text" id="dniCliente" placeholder="DNI" readonly>
            </div>
            <div class="form-field">
              <label>Estado RX</label>
              <span class="badge badge-warning" id="estadoRX">SIN MEDIDA</span>
            </div>
            <div class="form-field">
              <button class="btn btn-info btn-sm" onclick="verMedidaCliente()" style="margin-top: 20px; width: 100%;">
                👁️ Ver RX
              </button>
            </div>
            <div class="form-field">
              <button class="btn btn-primary btn-sm" onclick="nuevaMedidaCliente()" style="margin-top: 20px; width: 100%;">
                + Nueva RX
              </button>
            </div>
          </div>
        </div>

        <!-- Productos -->
        <div class="card">
          <h3 class="card-title">🛒 Productos / Servicios</h3>
          <div style="display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="agregarProductoCatalogo()">+ Agregar del Catálogo</button>
            <button class="btn btn-primary" onclick="seleccionarLunas()">🔬 Seleccionar Lunas</button>
            <button class="btn btn-info" onclick="itemManual()">✏️ Item Manual</button>
            <button class="btn btn-warning" onclick="productoPersonalizado()">⭐ Producto Personalizado</button>
            <button class="btn btn-secondary" onclick="generarCodigoBarras()">🏷️ Código de Barras</button>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>CÓDIGO</th>
                  <th>DESCRIPCIÓN</th>
                  <th style="width: 80px;">CANT.</th>
                  <th style="width: 100px;">P. UNIT.</th>
                  <th style="width: 80px;">DESC %</th>
                  <th style="width: 120px;">IMPORTE</th>
                  <th style="width: 120px;">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="tablaProductos">
                <tr>
                  <td colspan="8" class="text-center" style="padding: 60px; color: var(--gray-500); font-size: 16px;">
                    📦 No hay productos agregados<br>
                    <small style="font-size: 14px; color: var(--gray-400);">Items: 0 | Cantidad total: 0</small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div class="form-field">
              <label>💰 SUBTOTAL</label>
              <input type="text" id="subtotal" value="S/ 0.00" readonly style="font-size: 18px; font-weight: 700;">
            </div>
            <div class="form-field">
              <label>🎯 DESCUENTO</label>
              <input type="number" id="descuento" value="0.00" min="0" step="0.01" onchange="calcularTotales()">
            </div>
            <div class="form-field">
              <label>💵 TOTAL A PAGAR</label>
              <input type="text" id="total" value="S/ 0.00" readonly style="font-size: 22px; font-weight: 800; color: var(--primary-700);">
            </div>
          </div>
        </div>

        <!-- Pago y Observación -->
        <div class="card">
          <div class="form-row">
            <div class="form-field">
              <label>💳 FORMA DE PAGO</label>
              <select id="tipoPago">
                <option value="CONTADO">CONTADO</option>
                <option value="CREDITO">CRÉDITO</option>
              </select>
            </div>
            <div class="form-field">
              <label>👨‍💼 VENDEDOR</label>
              <input type="text" id="vendedor" value="ADMINISTRADOR" readonly>
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>📝 OBSERVACIÓN</label>
              <textarea id="observacion" rows="3" placeholder="Observaciones adicionales de la venta..."></textarea>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="nuevaVenta()">🔄 Nueva Venta</button>
          <button class="btn btn-success" onclick="guardarVenta()">💾 Guardar Venta</button>
          <button class="btn btn-info" onclick="guardarEImprimir()">🖨️ Guardar e Imprimir</button>
        </div>
      </div>
    </div>

    <!-- ==================== OTROS MÓDULOS (Continuará...) ==================== -->
    <!-- Implementaré TODOS los módulos restantes -->

  </div>
</div>

<!-- ==================== MODAL: VER/NUEVA PRESCRIPCIÓN ==================== -->
<div class="modal-overlay" id="modalRX">
  <div class="modal" style="width: 95%; max-width: 1300px;">
    <div class="modal-header">
      <h3 class="modal-title" id="tituloModalRX">
        👁️ <span id="accionRX">Nueva</span> Prescripción - <span id="nombrePacienteRX">Sin paciente</span>
      </h3>
      <button class="modal-close" onclick="cerrarModalRX()">✖</button>
    </div>

    <!-- Datos del paciente -->
    <div class="card">
      <div class="form-row">
        <div class="form-field">
          <label>Paciente</label>
          <input type="text" id="rxPaciente" readonly>
        </div>
        <div class="form-field">
          <label>Ocupación</label>
          <input type="text" id="rxOcupacion" placeholder="Ocupación del paciente">
        </div>
        <div class="form-field">
          <label>Fecha</label>
          <input type="date" id="rxFecha">
        </div>
        <div class="form-field">
          <label>Edad</label>
          <input type="number" id="rxEdad" min="0" placeholder="Edad">
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Próxima Cita</label>
          <input type="datetime-local" id="rxProximaCita">
        </div>
        <div class="form-field">
          <label>Especialista</label>
          <select id="rxEspecialista">
            <option value="FREDDY MENDOZA FERNANDEZ">Dr. Freddy Mendoza Fernández</option>
            <option value="GLORIA ISABEL HUAMAN QUISPE">Dra. Gloria Isabel Huamán Quispe</option>
          </select>
        </div>
        <div class="form-field">
          <label>Tipo de Prescripción</label>
          <div style="display: flex; gap: 20px; padding-top: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="rxTipo" value="PROPIA" checked> Propia
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="rxTipo" value="EXTERNA"> Externa
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs de medidas -->
    <div class="tabs">
      <button class="tab-btn active" onclick="cambiarTabRX('medidas')">📏 Medidas</button>
      <button class="tab-btn" onclick="cambiarTabRX('lc')">👁️ L.C</button>
      <button class="tab-btn" onclick="cambiarTabRX('otros')">📋 Otros</button>
      <button class="tab-btn" onclick="cambiarTabRX('historial')">📖 Historial Clínico</button>
      <button class="tab-btn" onclick="cambiarTabRX('oftalmologia')">🏥 Oftalmología</button>
    </div>

    <!-- TAB: MEDIDAS -->
    <div id="tabMedidas" class="tab-content active">
      <h4 style="text-align: center; margin-bottom: 20px; color: var(--primary-700); font-weight: 800; font-size: 18px;">
        👁️ VISIÓN DE LEJOS
      </h4>
      <div class="prescription-grid">
        <div class="header"></div>
        <div class="header">ESFÉRICO</div>
        <div class="header">CILINDRO</div>
        <div class="header">EJE</div>
        <div class="header">A.V</div>
        <div class="header">DIST. PUPILAR</div>
        <div class="header">DIST. NP</div>
        <div class="header">PRISMA</div>
        <div class="header">ADICIÓN</div>
        <div class="header">AD. MEDIA</div>

        <div class="label">Ojo Der.</div>
        <div><input type="text" id="lOdEsferico"></div>
        <div><input type="text" id="lOdCilindro"></div>
        <div><input type="text" id="lOdEje"></div>
        <div><input type="text" id="lOdAv"></div>
        <div><input type="text" id="lOdDistPupilar"></div>
        <div><input type="text" id="lOdDistNp"></div>
        <div><input type="text" id="lOdPrisma"></div>
        <div><input type="text" id="lOdAdicion"></div>
        <div><input type="text" id="lOdAdMedia"></div>

        <div class="label">Ojo Izq.</div>
        <div><input type="text" id="lOiEsferico"></div>
        <div><input type="text" id="lOiCilindro"></div>
        <div><input type="text" id="lOiEje"></div>
        <div><input type="text" id="lOiAv"></div>
        <div><input type="text" id="lOiDistPupilar"></div>
        <div><input type="text" id="lOiDistNp"></div>
        <div><input type="text" id="lOiPrisma"></div>
        <div><input type="text" id="lOiAdicion"></div>
        <div><input type="text" id="lOiAdMedia"></div>
      </div>

      <h4 style="text-align: center; margin: 30px 0 20px; color: var(--primary-700); font-weight: 800; font-size: 18px;">
        📖 VISIÓN DE CERCA
      </h4>
      <div class="prescription-grid" style="grid-template-columns: 100px repeat(7, 1fr);">
        <div class="header"></div>
        <div class="header">ESFÉRICO</div>
        <div class="header">CILINDRO</div>
        <div class="header">EJE</div>
        <div class="header">DIST. PUPILAR</div>
        <div class="header">DIST. NP</div>
        <div class="header">PRISMA</div>
        <div class="header">ALTURA</div>

        <div class="label">Ojo Der.</div>
        <div><input type="text" id="cOdEsferico"></div>
        <div><input type="text" id="cOdCilindro"></div>
        <div><input type="text" id="cOdEje"></div>
        <div><input type="text" id="cOdDistPupilar"></div>
        <div><input type="text" id="cOdDistNp"></div>
        <div><input type="text" id="cOdPrisma"></div>
        <div><input type="text" id="cOdAltura"></div>

        <div class="label">Ojo Izq.</div>
        <div><input type="text" id="cOiEsferico"></div>
        <div><input type="text" id="cOiCilindro"></div>
        <div><input type="text" id="cOiEje"></div>
        <div><input type="text" id="cOiDistPupilar"></div>
        <div><input type="text" id="cOiDistNp"></div>
        <div><input type="text" id="cOiPrisma"></div>
        <div><input type="text" id="cOiAltura"></div>
      </div>
    </div>

    <!-- TAB: LC -->
    <div id="tabLC" class="tab-content">
      <div class="card">
        <h4 class="card-title">👁️ Lentes de Contacto</h4>
        <p class="text-center" style="color: var(--gray-600); padding: 40px;">
          Módulo de Lentes de Contacto en desarrollo
        </p>
      </div>
    </div>

    <!-- TAB: OTROS -->
    <div id="tabOtros" class="tab-content">
      <div class="card">
        <h4 class="card-title">📋 Otros Datos</h4>
        <p class="text-center" style="color: var(--gray-600); padding: 40px;">
          Módulo de Otros Datos en desarrollo
        </p>
      </div>
    </div>

    <!-- TAB: HISTORIAL -->
    <div id="tabHistorial" class="tab-content">
      <div class="card">
        <h4 class="card-title">📖 Historial Clínico</h4>
        <div id="historialClinico">
          <p class="text-center" style="color: var(--gray-600); padding: 40px;">
            No hay historial clínico registrado
          </p>
        </div>
      </div>
    </div>

    <!-- TAB: OFTALMOLOGÍA -->
    <div id="tabOftalmologia" class="tab-content">
      <div class="card">
        <h4 class="card-title">🏥 Oftalmología</h4>
        <p class="text-center" style="color: var(--gray-600); padding: 40px;">
          Módulo de Oftalmología en desarrollo
        </p>
      </div>
    </div>

    <!-- Botones de acción -->
    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 25px; flex-wrap: wrap;">
      <button class="btn btn-success" onclick="guardarPrescripcion()">💾 Guardar</button>
      <button class="btn btn-info" onclick="imprimirPrescripcion()">🖨️ Imprimir</button>
      <button class="btn btn-warning" onclick="exportarExcelRX()">📊 Excel</button>
      <button class="btn btn-danger" onclick="cerrarModalRX()">🚪 Cerrar</button>
    </div>
  </div>
</div>

<script>
// ==================== VARIABLES GLOBALES ====================
let establecimientoActual = '';
let usuarioActual = '';
let DB_PREFIX = '';
let clienteActual = null;
let productosVenta = [];
let nextProductoId = 1;

// ==================== CONSTANTES ====================
const USUARIOS = {
  DOS_DE_MAYO: {
    usuario: 'Centro Óptico Sicuani',
    password: 'ADMI',
    nombre: 'Centro Óptico Sicuani',
    tema: 'tema-morado'
  },
  PLAZA_DE_ARMAS: {
    usuario: 'Óptica Sicuani',
    password: 'ADMI',
    nombre: 'Óptica Sicuani',
    tema: 'tema-azul'
  }
};

const ESPECIALISTAS = [
  'FREDDY MENDOZA FERNANDEZ',
  'GLORIA ISABEL HUAMAN QUISPE'
];

// ==================== FUNCIONES DE BASE DE DATOS ====================
function getDBKey(key) {
  return `${DB_PREFIX}${key}`;
}

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(getDBKey(key), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
    toast('Error al guardar datos', 'error');
    return false;
  }
}

function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(getDBKey(key));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error cargando de localStorage:', e);
    return [];
  }
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function now() {
  return new Date().toISOString();
}

// ==================== FUNCIONES DE LOGIN ====================
function intentarLogin() {
  const usuario = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const establecimiento = document.getElementById('loginEstablecimiento').value;

  const errorDiv = document.getElementById('loginError');

  // Validaciones
  if (!usuario || !password || !establecimiento) {
    errorDiv.textContent = '⚠️ Complete todos los campos';
    errorDiv.classList.add('show');
    return;
  }

  const credenciales = USUARIOS[establecimiento];

  if (usuario === credenciales.usuario && password === credenciales.password) {
    // Login exitoso
    establecimientoActual = establecimiento;
    usuarioActual = usuario;
    DB_PREFIX = `optiabi_${establecimiento.toLowerCase()}_`;

    // Aplicar tema
    document.body.className = credenciales.tema;

    // Actualizar UI
    document.getElementById('nombreEstablecimiento').textContent = credenciales.nombre;
    document.getElementById('badgeEstablecimiento').innerHTML = `💾 ${credenciales.nombre}`;
    document.getElementById('#desktop::before').textContent = credenciales.nombre;

    // Mostrar sistema
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainSystem').classList.add('active');

    // Inicializar fechas
    document.getElementById('fechaEmision').value = today();
    document.getElementById('fechaVencimiento').value = today();
    document.getElementById('rxFecha').value = today();

    toast(`✓ Bienvenido ${usuario}`, 'success');

    // Cargar datos iniciales
    cargarDatosIniciales();
  } else {
    errorDiv.textContent = '❌ Usuario o contraseña incorrectos';
    errorDiv.classList.add('show');
  }
}

function limpiarLogin() {
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginEstablecimiento').value = '';
  document.getElementById('loginError').classList.remove('show');
}

function cerrarSesion() {
  if (confirm('¿Está seguro de cerrar sesión?')) {
    document.getElementById('mainSystem').classList.remove('active');
    document.getElementById('loginScreen').classList.remove('hidden');
    limpiarLogin();
    establecimientoActual = '';
    usuarioActual = '';
    clienteActual = null;
    productosVenta = [];
    toast('🚪 Sesión cerrada', 'info');
  }
}

// Enter en login
document.addEventListener('DOMContentLoaded', function() {
  ['loginUsuario', 'loginPassword', 'loginEstablecimiento'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') intentarLogin();
      });
    }
  });
});

// ==================== FUNCIONES DE NAVEGACIÓN ====================
function cambiarModulo(modulo) {
  // Ocultar todos los módulos
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));

  // Mostrar el módulo seleccionado
  const moduloId = 'modulo' + modulo.charAt(0).toUpperCase() + modulo.slice(1);
  const moduloElement = document.getElementById(moduloId);
  if (moduloElement) {
    moduloElement.classList.add('active');
  }

  // Actualizar botones del ribbon
  document.querySelectorAll('.ribbon-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.ribbon-btn').classList.add('active');
}

// ==================== FUNCIONES DE NOTIFICACIONES ====================
function toast(mensaje, tipo = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const iconos = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const titulos = {
    success: 'Éxito',
    error: 'Error',
    info: 'Información',
    warning: 'Advertencia'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconos[tipo]}</span>
    <div class="toast-content">
      <div class="toast-title">${titulos[tipo]}</div>
      <div class="toast-message">${mensaje}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.4s ease reverse';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==================== FUNCIONES DE CLIENTES ====================
function buscarCliente() {
  const termino = document.getElementById('nombreCliente').value.trim();
  if (!termino) {
    toast('Ingrese un DNI o nombre para buscar', 'warning');
    return;
  }

  const clientes = loadFromLocalStorage('clientes');
  const resultado = clientes.find(c =>
    c.dni === termino ||
    c.nombre.toLowerCase().includes(termino.toLowerCase())
  );

  if (resultado) {
    clienteActual = resultado;
    document.getElementById('nombreCliente').value = resultado.nombre;
    document.getElementById('dniCliente').value = resultado.dni;

    // Verificar si tiene medidas
    const medidas = loadFromLocalStorage('medidas');
    const tieneMedida = medidas.some(m => m.clienteId === resultado.id);

    if (tieneMedida) {
      document.getElementById('estadoRX').textContent = 'CON MEDIDA';
      document.getElementById('estadoRX').className = 'badge badge-success';
    } else {
      document.getElementById('estadoRX').textContent = 'SIN MEDIDA';
      document.getElementById('estadoRX').className = 'badge badge-warning';
    }

    toast(`Cliente encontrado: ${resultado.nombre}`, 'success');
  } else {
    toast('Cliente no encontrado', 'error');
  }
}

function nuevoCliente() {
  toast('Función de nuevo cliente en desarrollo', 'info');
  // TODO: Implementar modal de nuevo cliente
}

// ==================== FUNCIONES DE PRESCRIPCIÓN ====================
function verMedidaCliente() {
  if (!clienteActual) {
    toast('⚠️ Seleccione un cliente primero', 'warning');
    return;
  }

  document.getElementById('accionRX').textContent = 'Ver';
  document.getElementById('nombrePacienteRX').textContent = clienteActual.nombre;
  document.getElementById('rxPaciente').value = clienteActual.nombre;

  // Cargar medidas del cliente
  const medidas = loadFromLocalStorage('medidas');
  const medidaCliente = medidas.find(m => m.clienteId === clienteActual.id);

  if (medidaCliente) {
    cargarDatosMedida(medidaCliente);
  }

  document.getElementById('modalRX').classList.add('active');
}

function nuevaMedidaCliente() {
  if (!clienteActual) {
    toast('⚠️ Seleccione un cliente primero', 'warning');
    return;
  }

  document.getElementById('accionRX').textContent = 'Nueva';
  document.getElementById('nombrePacienteRX').textContent = clienteActual.nombre;
  document.getElementById('rxPaciente').value = clienteActual.nombre;
  document.getElementById('rxFecha').value = today();

  // Limpiar formulario
  limpiarFormularioRX();

  document.getElementById('modalRX').classList.add('active');
}

function cerrarModalRX() {
  document.getElementById('modalRX').classList.remove('active');
}

function cambiarTabRX(tab) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

  // Mostrar el tab seleccionado
  const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById(tabId).classList.add('active');

  // Actualizar botones
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function limpiarFormularioRX() {
  const campos = [
    'lOdEsferico', 'lOdCilindro', 'lOdEje', 'lOdAv', 'lOdDistPupilar', 'lOdDistNp', 'lOdPrisma', 'lOdAdicion', 'lOdAdMedia',
    'lOiEsferico', 'lOiCilindro', 'lOiEje', 'lOiAv', 'lOiDistPupilar', 'lOiDistNp', 'lOiPrisma', 'lOiAdicion', 'lOiAdMedia',
    'cOdEsferico', 'cOdCilindro', 'cOdEje', 'cOdDistPupilar', 'cOdDistNp', 'cOdPrisma', 'cOdAltura',
    'cOiEsferico', 'cOiCilindro', 'cOiEje', 'cOiDistPupilar', 'cOiDistNp', 'cOiPrisma', 'cOiAltura',
    'rxOcupacion', 'rxEdad', 'rxProximaCita'
  ];

  campos.forEach(campo => {
    const el = document.getElementById(campo);
    if (el) el.value = '';
  });
}

function cargarDatosMedida(medida) {
  // Cargar datos generales
  if (medida.ocupacion) document.getElementById('rxOcupacion').value = medida.ocupacion;
  if (medida.edad) document.getElementById('rxEdad').value = medida.edad;
  if (medida.proximaCita) document.getElementById('rxProximaCita').value = medida.proximaCita;
  if (medida.especialista) document.getElementById('rxEspecialista').value = medida.especialista;
  if (medida.tipo) {
    document.querySelector(`input[name="rxTipo"][value="${medida.tipo}"]`).checked = true;
  }

  // Cargar medidas de lejos OD
  if (medida.lejos && medida.lejos.od) {
    const od = medida.lejos.od;
    if (od.esferico) document.getElementById('lOdEsferico').value = od.esferico;
    if (od.cilindro) document.getElementById('lOdCilindro').value = od.cilindro;
    if (od.eje) document.getElementById('lOdEje').value = od.eje;
    if (od.av) document.getElementById('lOdAv').value = od.av;
    if (od.distPupilar) document.getElementById('lOdDistPupilar').value = od.distPupilar;
    if (od.distNp) document.getElementById('lOdDistNp').value = od.distNp;
    if (od.prisma) document.getElementById('lOdPrisma').value = od.prisma;
    if (od.adicion) document.getElementById('lOdAdicion').value = od.adicion;
    if (od.adMedia) document.getElementById('lOdAdMedia').value = od.adMedia;
  }

  // Cargar medidas de lejos OI
  if (medida.lejos && medida.lejos.oi) {
    const oi = medida.lejos.oi;
    if (oi.esferico) document.getElementById('lOiEsferico').value = oi.esferico;
    if (oi.cilindro) document.getElementById('lOiCilindro').value = oi.cilindro;
    if (oi.eje) document.getElementById('lOiEje').value = oi.eje;
    if (oi.av) document.getElementById('lOiAv').value = oi.av;
    if (oi.distPupilar) document.getElementById('lOiDistPupilar').value = oi.distPupilar;
    if (oi.distNp) document.getElementById('lOiDistNp').value = oi.distNp;
    if (oi.prisma) document.getElementById('lOiPrisma').value = oi.prisma;
    if (oi.adicion) document.getElementById('lOiAdicion').value = oi.adicion;
    if (oi.adMedia) document.getElementById('lOiAdMedia').value = oi.adMedia;
  }

  // Cargar medidas de cerca OD
  if (medida.cerca && medida.cerca.od) {
    const od = medida.cerca.od;
    if (od.esferico) document.getElementById('cOdEsferico').value = od.esferico;
    if (od.cilindro) document.getElementById('cOdCilindro').value = od.cilindro;
    if (od.eje) document.getElementById('cOdEje').value = od.eje;
    if (od.distPupilar) document.getElementById('cOdDistPupilar').value = od.distPupilar;
    if (od.distNp) document.getElementById('cOdDistNp').value = od.distNp;
    if (od.prisma) document.getElementById('cOdPrisma').value = od.prisma;
    if (od.altura) document.getElementById('cOdAltura').value = od.altura;
  }

  // Cargar medidas de cerca OI
  if (medida.cerca && medida.cerca.oi) {
    const oi = medida.cerca.oi;
    if (oi.esferico) document.getElementById('cOiEsferico').value = oi.esferico;
    if (oi.cilindro) document.getElementById('cOiCilindro').value = oi.cilindro;
    if (oi.eje) document.getElementById('cOiEje').value = oi.eje;
    if (oi.distPupilar) document.getElementById('cOiDistPupilar').value = oi.distPupilar;
    if (oi.distNp) document.getElementById('cOiDistNp').value = oi.distNp;
    if (oi.prisma) document.getElementById('cOiPrisma').value = oi.prisma;
    if (oi.altura) document.getElementById('cOiAltura').value = oi.altura;
  }
}

function guardarPrescripcion() {
  if (!clienteActual) {
    toast('No hay cliente seleccionado', 'error');
    return;
  }

  const medida = {
    id: genId('MED'),
    clienteId: clienteActual.id,
    fecha: document.getElementById('rxFecha').value,
    ocupacion: document.getElementById('rxOcupacion').value,
    edad: document.getElementById('rxEdad').value,
    proximaCita: document.getElementById('rxProximaCita').value,
    especialista: document.getElementById('rxEspecialista').value,
    tipo: document.querySelector('input[name="rxTipo"]:checked').value,
    lejos: {
      od: {
        esferico: document.getElementById('lOdEsferico').value,
        cilindro: document.getElementById('lOdCilindro').value,
        eje: document.getElementById('lOdEje').value,
        av: document.getElementById('lOdAv').value,
        distPupilar: document.getElementById('lOdDistPupilar').value,
        distNp: document.getElementById('lOdDistNp').value,
        prisma: document.getElementById('lOdPrisma').value,
        adicion: document.getElementById('lOdAdicion').value,
        adMedia: document.getElementById('lOdAdMedia').value
      },
      oi: {
        esferico: document.getElementById('lOiEsferico').value,
        cilindro: document.getElementById('lOiCilindro').value,
        eje: document.getElementById('lOiEje').value,
        av: document.getElementById('lOiAv').value,
        distPupilar: document.getElementById('lOiDistPupilar').value,
        distNp: document.getElementById('lOiDistNp').value,
        prisma: document.getElementById('lOiPrisma').value,
        adicion: document.getElementById('lOiAdicion').value,
        adMedia: document.getElementById('lOiAdMedia').value
      }
    },
    cerca: {
      od: {
        esferico: document.getElementById('cOdEsferico').value,
        cilindro: document.getElementById('cOdCilindro').value,
        eje: document.getElementById('cOdEje').value,
        distPupilar: document.getElementById('cOdDistPupilar').value,
        distNp: document.getElementById('cOdDistNp').value,
        prisma: document.getElementById('cOdPrisma').value,
        altura: document.getElementById('cOdAltura').value
      },
      oi: {
        esferico: document.getElementById('cOiEsferico').value,
        cilindro: document.getElementById('cOiCilindro').value,
        eje: document.getElementById('cOiEje').value,
        distPupilar: document.getElementById('cOiDistPupilar').value,
        distNp: document.getElementById('cOiDistNp').value,
        prisma: document.getElementById('cOiPrisma').value,
        altura: document.getElementById('cOiAltura').value
      }
    },
    createdAt: now(),
    createdBy: usuarioActual
  };

  const medidas = loadFromLocalStorage('medidas');
  medidas.push(medida);
  saveToLocalStorage('medidas', medidas);

  toast('✓ Prescripción guardada exitosamente', 'success');
  cerrarModalRX();

  // Actualizar estado de RX
  document.getElementById('estadoRX').textContent = 'CON MEDIDA';
  document.getElementById('estadoRX').className = 'badge badge-success';
}

function imprimirPrescripcion() {
  toast('Función de impresión en desarrollo', 'info');
  // TODO: Implementar impresión de prescripción
}

function exportarExcelRX() {
  toast('Función de exportación a Excel en desarrollo', 'info');
  // TODO: Implementar exportación a Excel
}

// ==================== FUNCIONES DE VENTAS ====================
function agregarProductoCatalogo() {
  toast('Función de catálogo de productos en desarrollo', 'info');
}

function seleccionarLunas() {
  toast('Función de selección de lunas en desarrollo', 'info');
}

function itemManual() {
  toast('Función de item manual en desarrollo', 'info');
}

function productoPersonalizado() {
  toast('Función de producto personalizado en desarrollo', 'info');
}

function generarCodigoBarras() {
  toast('Función de código de barras en desarrollo', 'info');
}

function calcularTotales() {
  let subtotal = 0;
  productosVenta.forEach(p => {
    subtotal += p.cantidad * p.precioUnitario * (1 - p.descuento / 100);
  });

  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const total = subtotal - descuento;

  document.getElementById('subtotal').value = `S/ ${subtotal.toFixed(2)}`;
  document.getElementById('total').value = `S/ ${total.toFixed(2)}`;
}

function nuevaVenta() {
  productosVenta = [];
  clienteActual = null;
  document.getElementById('nombreCliente').value = '';
  document.getElementById('dniCliente').value = '';
  document.getElementById('observacion').value = '';
  document.getElementById('descuento').value = '0.00';
  actualizarTablaProductos();
  calcularTotales();
  toast('Nueva venta iniciada', 'info');
}

function guardarVenta() {
  toast('Función de guardar venta en desarrollo', 'info');
}

function guardarEImprimir() {
  toast('Función de guardar e imprimir en desarrollo', 'info');
}

function actualizarTablaProductos() {
  const tbody = document.getElementById('tablaProductos');
  if (productosVenta.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 60px; color: var(--gray-500); font-size: 16px;">
          📦 No hay productos agregados<br>
          <small style="font-size: 14px; color: var(--gray-400);">Items: 0 | Cantidad total: 0</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = productosVenta.map((p, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${p.codigo || '-'}</td>
      <td>${p.descripcion}</td>
      <td>${p.cantidad}</td>
      <td>S/ ${p.precioUnitario.toFixed(2)}</td>
      <td>${p.descuento}%</td>
      <td>S/ ${(p.cantidad * p.precioUnitario * (1 - p.descuento / 100)).toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function eliminarProducto(index) {
  if (confirm('¿Eliminar este producto?')) {
    productosVenta.splice(index, 1);
    actualizarTablaProductos();
    calcularTotales();
    toast('Producto eliminado', 'info');
  }
}

// ==================== FUNCIONES DE CARGA INICIAL ====================
function cargarDatosIniciales() {
  // Inicializar datos de ejemplo si no existen
  let clientes = loadFromLocalStorage('clientes');
  if (clientes.length === 0) {
    clientes = [
      {
        id: genId('CLI'),
        dni: '12345678',
        nombre: 'JUAN PEREZ GARCIA',
        telefono: '987654321',
        email: 'juan@email.com',
        ocupacion: 'INGENIERO',
        edad: 35,
        createdAt: now()
      }
    ];
    saveToLocalStorage('clientes', clientes);
  }
}

// ==================== INICIALIZACIÓN ====================
console.log('✓ Sistema OptiABI v6.0 cargado correctamente');
</script>

</body>
</html>
"""

# Guardar archivo
with open('NuevoCentro_Optico.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✓ Archivo generado: NuevoCentro_Optico.html")
print("✓ Codificación: UTF-8")
print("✓ Tamaño aproximado:", len(html_content), "caracteres")

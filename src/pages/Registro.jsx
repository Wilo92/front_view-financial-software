import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import logoApp from "../assets/logo.png";
import {
  FaUser, FaEnvelope, FaPhone, FaLock,
  FaArrowLeft, FaIdCard, FaEye, FaEyeSlash, FaCheckCircle
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   CAMPOS — sin cambios en estructura de datos
───────────────────────────────────────────────────────────── */
const FIELDS = [
  { name: "name",            label: "Nombre Completo",    type: "text",    icon: FaUser,     placeholder: "Juan Pérez",           autoComplete: "name",         inputMode: "text"    },
  { name: "document_number", label: "Documento",          type: "text",    icon: FaIdCard,   placeholder: "1088...",               autoComplete: "off",          inputMode: "numeric" },
  { name: "email",           label: "Correo Electrónico", type: "email",   icon: FaEnvelope, placeholder: "usuario@kredi.com",     autoComplete: "email",        inputMode: "email"   },
  { name: "phone",           label: "Teléfono",           type: "tel",     icon: FaPhone,    placeholder: "+57 300...",            autoComplete: "tel",          inputMode: "tel"     },
  { name: "password",        label: "Contraseña",         type: "password",icon: FaLock,     placeholder: "••••••••", isPass: true, autoComplete: "new-password", inputMode: "text"    },
];

/* ─────────────────────────────────────────────────────────────
   LÓGICA DE FORTALEZA DE CONTRASEÑA — sin cambios
───────────────────────────────────────────────────────────── */
const getStrength = (p) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 4)                                                     s++;
  if (/[A-Z]/.test(p))                                                   s++;
  if (/\d/.test(p))                                                      s++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p))                 s++;
  return s;
};
const STRENGTH_META = [
  { label: "",        color: "#e2e8f0", bg: "#e2e8f0" },
  { label: "Débil",   color: "#ef4444", bg: "#fecaca" },
  { label: "Regular", color: "#f59e0b", bg: "#fde68a" },
  { label: "Buena",   color: "#3b82f6", bg: "#bfdbfe" },
  { label: "Fuerte",  color: "#10b981", bg: "#a7f3d0" },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENTE
══════════════════════════════════════════════════════════════ */
const Registro = () => {
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [formData, setFormData] = useState({
    name: "", document_number: "", email: "", phone: "", password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clienteAxios.get("/sanctum/csrf-cookie");
      const response = await clienteAxios.post("/api/register", formData);
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/deudores"), 1600);
      }
    } catch (error) {
      console.log("Status:", error.response?.status);
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const strength     = getStrength(formData.password);
  const strengthMeta = STRENGTH_META[strength];

  return (
    <div className="rg-root">

      {/* ══════════════════════════════════════════════════════
          ESTILOS
      ══════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        /* ── Base ── */
        .rg-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .rg-brand  { font-family: 'Sora', sans-serif !important; }

        /* ── Contenedor raíz ──
           100svh respeta el notch y la barra de navegación de iOS/Android.
           Overflow-y: auto permite scroll cuando el teclado virtual sube. */
        .rg-root {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;   /* top-align: mejor cuando el teclado sube */
          padding: 24px max(16px, env(safe-area-inset-left)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right));
          overflow-y: auto;
          /* Fondo mesh */
          background:
            radial-gradient(ellipse 60% 50% at 10% 20%, rgba(59,130,246,.14) 0%, transparent 65%),
            radial-gradient(ellipse 50% 60% at 90% 80%, rgba(99,102,241,.11) 0%, transparent 65%),
            radial-gradient(ellipse 80% 40% at 50% 50%, rgba(239,246,255,.9) 0%, transparent 100%),
            #eef2ff;
        }

        /* ════════════════════════════════════════
           CARD PRINCIPAL
        ════════════════════════════════════════ */
        .rg-card {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          position: relative;   /* para el success overlay */
          box-shadow:
            0 0 0 1px rgba(59,130,246,.07),
            0 4px 6px rgba(0,0,0,.03),
            0 20px 50px rgba(59,130,246,.14),
            0 40px 80px rgba(99,102,241,.06);
          /* margin: auto centra verticalmente cuando el contenido es menor que la pantalla */
          margin: auto 0;
        }

        /* ════════════════════════════════════════
           HEADER
        ════════════════════════════════════════ */
        .rg-header {
          position: relative;
          background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
          padding: 32px 32px 50px;
          text-align: center;
          overflow: hidden;
        }
        /* Círculos decorativos */
        .rg-header::before {
          content: ''; position: absolute;
          top: -40px; right: -40px;
          width: 150px; height: 150px;
          border-radius: 50%; background: rgba(255,255,255,.08);
          pointer-events: none;
        }
        .rg-header::after {
          content: ''; position: absolute;
          bottom: -25px; left: -25px;
          width: 100px; height: 100px;
          border-radius: 50%; background: rgba(255,255,255,.06);
          pointer-events: none;
        }

        /* ── Back button ──
           MEJORA: 44×44px mínimo touch target (era 34×34) */
        .rg-back {
          position: absolute;
          left: 14px; top: 50%; transform: translateY(-50%);
          z-index: 2;
          width: 44px; height: 44px;          /* ← touch target correcto */
          border-radius: 14px;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.22);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.92);
          cursor: pointer;
          transition: background .18s, transform .15s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .rg-back:hover  { background: rgba(255,255,255,.28); }
        .rg-back:active { transform: translateY(-50%) scale(0.94); }

        .rg-logo-wrap {
          position: relative; z-index: 1;
          width: 68px; height: 68px;
          margin: 0 auto 12px;
          background: rgba(255,255,255,.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.28);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
        }

        /* ── Wave ──
           MEJORA: mismo color de fondo que header en el SVG para eliminar gap */
        .rg-wave {
          display: block;
          width: 100%;
          margin-top: -2px;   /* cierra el posible 1px gap entre header y wave */
          background: linear-gradient(145deg, #1d4ed8, #3b82f6); /* mismo gradiente del header */
        }

        /* ════════════════════════════════════════
           BODY DEL FORMULARIO
        ════════════════════════════════════════ */
        .rg-body {
          padding: 4px 28px 32px;
        }

        /* Pill de paso */
        .rg-step-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 11.5px;
          font-weight: 700;
          color: #1d4ed8;
          letter-spacing: .03em;
          margin-bottom: 16px;
        }
        .rg-step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2563eb;
        }

        /* ════════════════════════════════════════
           GRUPOS DE CAMPOS
           MEJORA: layout 2 columnas en pantallas ≥480px
           — evita el muro de formulario vertical
        ════════════════════════════════════════ */
        .rg-fields-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 480px) {
          .rg-fields-grid {
            /* Nombre + Documento en fila 1 */
            /* Email ocupa full fila 2 */
            /* Teléfono + Contraseña en fila 3 */
            grid-template-columns: 1fr 1fr;
          }
          .rg-field-full { grid-column: 1 / -1; }
        }

        /* ── Un campo ── */
        .rg-field { display: flex; flex-direction: column; gap: 6px; }

        /* ── Label ── */
        .rg-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .10em;
          margin-left: 2px;
          line-height: 1;
        }

        /* ── Input wrapper ── */
        .rg-field-wrap { position: relative; }

        /* ── Ícono izquierdo ── */
        .rg-icon {
          position: absolute;
          left: 13px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 14px;
          pointer-events: none;
          transition: color .18s;
          z-index: 1;
        }
        .rg-field-wrap:focus-within .rg-icon { color: #3b82f6; }

        /* ── Input ──
           MEJORAS CRÍTICAS:
           · font-size: 16px → evita zoom en iOS Safari
           · min-height: 50px → touch target correcto
           · -webkit-appearance: none → quita estilos nativos inconsistentes
           · autoComplete y inputMode en el JSX */
        .rg-input {
          width: 100%;
          min-height: 50px;                  /* touch target */
          padding: 13px 13px 13px 40px;
          border-radius: 13px;
          border: 2px solid #e8edf5;
          background: #f8faff;
          font-size: 16px;                   /* ← evita zoom iOS */
          color: #1e293b;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          font-family: 'DM Sans', sans-serif;
          -webkit-appearance: none;
          appearance: none;
        }
        .rg-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10);
        }
        .rg-input.has-toggle { padding-right: 50px; }
        .rg-input.rg-error-input {
          border-color: #fca5a5;
          background: #fff5f5;
        }
        .rg-input.rg-error-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239,68,68,.09);
        }
        .rg-input::placeholder { color: #c8d4e3; font-size: 14px; }

        /* Autofill — evita fondo azul de Chrome */
        .rg-input:-webkit-autofill,
        .rg-input:-webkit-autofill:hover,
        .rg-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #f8faff inset;
          -webkit-text-fill-color: #1e293b;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ── Toggle contraseña ──
           MEJORA: área táctil 44×44px (era solo el ícono) */
        .rg-pw-toggle {
          position: absolute;
          right: 0; top: 50%; transform: translateY(-50%);
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          color: #94a3b8;
          border-radius: 0 11px 11px 0;
          transition: color .18s, background .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .rg-pw-toggle:hover  { color: #3b82f6; background: rgba(59,130,246,.05); }
        .rg-pw-toggle:active { background: rgba(59,130,246,.10); }

        /* ── Error inline ── */
        .rg-field-error {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 11.5px;
          color: #dc2626;
          font-weight: 500;
          line-height: 1.4;
          margin-top: -2px;
        }
        .rg-field-error-icon { flex-shrink: 0; margin-top: 1px; }

        /* ════════════════════════════════════════
           BARRA DE FORTALEZA DE CONTRASEÑA
        ════════════════════════════════════════ */
        .rg-strength-wrap { display: flex; flex-direction: column; gap: 4px; }
        .rg-strength-bars {
          display: flex; gap: 4px; height: 4px;
        }
        .rg-strength-segment {
          flex: 1; border-radius: 99px;
          background: #e8edf5;
          transition: background .3s;
        }
        .rg-strength-footer {
          display: flex; justify-content: space-between; align-items: center;
        }
        .rg-strength-label {
          font-size: 10px; font-weight: 700; letter-spacing: .03em;
          transition: color .3s;
        }
        .rg-strength-hint {
          font-size: 10px; color: #b0bccc; text-align: right;
        }

        /* ════════════════════════════════════════
           BOTÓN SUBMIT
           MEJORA: min-height 52px, touch-action
        ════════════════════════════════════════ */
        .rg-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%;
          min-height: 52px;
          padding: 14px 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%);
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15.5px;
          letter-spacing: .01em;
          border: none;
          cursor: pointer;
          box-shadow:
            0 1px 0 rgba(255,255,255,.15) inset,
            0 6px 20px rgba(37,99,235,.38);
          transition: transform .16s cubic-bezier(.22,1,.36,1), box-shadow .16s, opacity .16s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .rg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 1px 0 rgba(255,255,255,.15) inset, 0 10px 28px rgba(37,99,235,.42);
        }
        .rg-btn:active:not(:disabled) {
          transform: translateY(1px) scale(.99);
          box-shadow: 0 1px 0 rgba(255,255,255,.10) inset, 0 4px 12px rgba(37,99,235,.30);
        }
        .rg-btn:disabled { opacity: .62; cursor: not-allowed; transform: none; }
        .rg-btn:focus-visible { outline: 3px solid rgba(59,130,246,.50); outline-offset: 2px; }

        /* ── Spinner ── */
        @keyframes rg-spin { to { transform: rotate(360deg); } }
        .rg-spinner {
          width: 18px; height: 18px; flex-shrink: 0;
          border: 2.5px solid rgba(255,255,255,.30);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rg-spin .75s linear infinite;
        }

        /* ════════════════════════════════════════
           SUCCESS OVERLAY
           MEJORA: posición fija en viewport en vez
           de absolute en la card (no se corta en móvil)
        ════════════════════════════════════════ */
        @keyframes rg-pop {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .rg-success-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px;
          animation: rg-pop .38s cubic-bezier(.22,1,.36,1);
        }
        .rg-success-icon {
          width: 80px; height: 80px;
          background: rgba(255,255,255,.18);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .rg-success-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 700;
          color: #ffffff; letter-spacing: -.01em;
        }
        .rg-success-sub { font-size: 14px; color: rgba(219,234,254,.90); }

        /* ════════════════════════════════════════
           DIVISOR + FOOTER
        ════════════════════════════════════════ */
        .rg-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e8edf5, transparent);
          margin: 20px 0 18px;
        }
        .rg-footer-text { text-align: center; font-size: 13.5px; color: #64748b; }
        .rg-footer-link {
          color: #2563eb; font-weight: 600;
          text-decoration: underline; text-underline-offset: 2px;
          text-decoration-color: transparent;
          transition: color .15s, text-decoration-color .15s;
        }
        .rg-footer-link:hover { color: #1d4ed8; text-decoration-color: #1d4ed8; }

        /* ════════════════════════════════════════
           ANIMACIONES DE ENTRADA
        ════════════════════════════════════════ */
        @keyframes rg-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rg-field { animation: rg-fade .42s cubic-bezier(.22,1,.36,1) both; }
        /* Delays escalonados — usando atributo data-delay para más control */
        .rg-field:nth-child(1) { animation-delay: .05s; }
        .rg-field:nth-child(2) { animation-delay: .10s; }
        .rg-field:nth-child(3) { animation-delay: .15s; }
        .rg-field:nth-child(4) { animation-delay: .20s; }
        .rg-field:nth-child(5) { animation-delay: .25s; }

        /* ════════════════════════════════════════
           RESPONSIVE — pantallas muy pequeñas
        ════════════════════════════════════════ */
        @media (max-width: 380px) {
          .rg-root { padding: 16px 12px; }
          .rg-header { padding: 26px 20px 44px; }
          .rg-body { padding: 4px 18px 26px; }
          .rg-card { border-radius: 24px; }
        }

        /* ════════════════════════════════════════
           ACCESIBILIDAD — reduce motion
        ════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .rg-field, .rg-success-overlay {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SUCCESS OVERLAY — fixed, cubre toda la pantalla
          MEJORA: ya no se corta en móvil
      ══════════════════════════════════════════════════════ */}
      {success && (
        <div className="rg-success-overlay" role="status" aria-live="polite">
          <div className="rg-success-icon">
            <FaCheckCircle size={40} color="#ffffff" />
          </div>
          <p className="rg-success-title">¡Cuenta creada!</p>
          <p className="rg-success-sub">Redirigiendo a tu panel...</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          CARD
      ══════════════════════════════════════════════════════ */}
      <div className="rg-card" role="main">

        {/* ── HEADER ── */}
        <div className="rg-header">

          {/* Back — 44×44px tap target */}
          <button
            className="rg-back"
            onClick={() => navigate("/login")}
            aria-label="Volver al inicio de sesión"
            type="button"
          >
            <FaArrowLeft size={15} />
          </button>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="rg-logo-wrap">
              <img
                src={logoApp}
                alt="Logo de la aplicación"
                style={{ width: 44, height: 44, objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </div>
            <h1 className="rg-brand" style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>
              Registrarse
            </h1>
            <p style={{ color: "rgba(219,234,254,.90)", fontSize: 13.5, marginTop: 5 }}>
              Completa los datos de registro
            </p>
          </div>
        </div>

        {/* Wave — sin gap */}
        <svg
          className="rg-wave"
          viewBox="0 0 480 48"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0,24 C80,46 160,4 240,24 C320,44 400,6 480,24 L480,48 L0,48 Z" fill="white" />
        </svg>

        {/* ── FORMULARIO ── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rg-body"
          aria-label="Formulario de registro"
        >
         

          {/* Grid de campos */}
          <div className="rg-fields-grid">
            {FIELDS.map((f, idx) => {
              const Icon     = f.icon;
              const hasError = !!errors[f.name];
              const inputType = f.isPass ? (showPass ? "text" : "password") : f.type;
              // Email ocupa columna completa en grid de 2
              const isFullCol = f.name === "email";

              return (
                <div
                  key={f.name}
                  className={`rg-field${isFullCol ? " rg-field-full" : ""}`}
                >
                  {/* Label — asociado con htmlFor */}
                  <label htmlFor={`rg-${f.name}`} className="rg-label">
                    {f.label}
                  </label>

                  <div className="rg-field-wrap">
                    {/* Ícono izquierdo */}
                    <span className="rg-icon" aria-hidden="true">
                      <Icon />
                    </span>

                    {/* Input
                        MEJORAS: id, autoComplete, inputMode, font-size 16px, min-height 50px */}
                    <input
                      id={`rg-${f.name}`}
                      name={f.name}
                      type={inputType}
                      required
                      value={formData[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      inputMode={f.inputMode}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? `rg-err-${f.name}` : f.isPass ? `rg-hint-${f.name}` : undefined}
                      className={`rg-input${f.isPass ? " has-toggle" : ""}${hasError ? " rg-error-input" : ""}`}
                    />

                    {/* Toggle de contraseña — 48×48px área táctil */}
                    {f.isPass && (
                      <button
                        type="button"
                        className="rg-pw-toggle"
                        onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                      </button>
                    )}
                  </div>

                  {/* Barra de fortaleza — solo campo contraseña con valor */}
                  {f.isPass && formData.password && (
                    <div className="rg-strength-wrap">
                      <div className="rg-strength-bars" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Fortaleza de contraseña">
                        {[1,2,3,4].map(n => (
                          <div
                            key={n}
                            className="rg-strength-segment"
                            style={{ background: n <= strength ? strengthMeta.color : "#e8edf5" }}
                          />
                        ))}
                      </div>
                      <div className="rg-strength-footer">
                        <span className="rg-strength-label" style={{ color: strengthMeta.color }}>
                          {strengthMeta.label}
                        </span>
                        <span className="rg-strength-hint">
                          Mayúsc · número · símbolo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hint contraseña — solo cuando no hay error y no tiene valor */}
                  {f.isPass && !formData.password && !errors.password && (
                    <p
                      id={`rg-hint-${f.name}`}
                      style={{ fontSize: 10.5, color: "#b0bccc", lineHeight: 1.4, marginTop: -2 }}
                    >
                      4–10 caracteres · 1 mayúscula · 1 número · 1 símbolo
                    </p>
                  )}

                  {/* Error inline */}
                  {hasError && (
                    <p
                      id={`rg-err-${f.name}`}
                      className="rg-field-error"
                      role="alert"
                    >
                      <span className="rg-field-error-icon">⚠</span>
                      <span>{errors[f.name][0]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Botón submit ── */}
          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              disabled={loading}
              className="rg-btn"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="rg-spinner" role="status" aria-label="Creando cuenta" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="rg-divider" aria-hidden="true" />

          {/* Footer */}
          <p className="rg-footer-text">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="rg-footer-link">
              Acceder
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;
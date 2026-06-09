import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from '../api/axios';
import logoApp from "../assets/logo.png";
import wolfMascot from "../assets/Kredi.png";
import coinLottie from "../assets/img.lottie";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await clienteAxios.get("/sanctum/csrf-cookie");
      const response = await clienteAxios.post("/api/login", {
        email: formData.email,
        password: formData.password,
      });
      if (response.status === 200 || response.status === 400) {
        localStorage.setItem("user_active", "true");
        navigate("/deudores");
      }
    } catch (error) {
      console.error("error detallado:", error.response);
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">

      <style>{`
        /* ── Google Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        /* ── Reset base ── */
        .login-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .font-display  { font-family: 'Sora', sans-serif; }

        /* ════════════════════════════════════════
           FONDO GENERAL
        ════════════════════════════════════════ */
        .login-root {
          min-height: 100svh; /* svh = safe viewport height, respeta notch */
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(ellipse 70% 60% at 15% 20%, rgba(59,130,246,0.14) 0%, transparent 65%),
            radial-gradient(ellipse 60% 70% at 85% 80%, rgba(99,102,241,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(239,246,255,0.8) 0%, transparent 100%),
            #eef2ff;
          overflow-x: hidden;
        }

        /* ════════════════════════════════════════
           NAVBAR DE MONEDAS
           MEJORA: altura con safe-area + logo izq.
        ════════════════════════════════════════ */
        .coin-navbar {
          position: relative;
          width: 100%;
          height: 56px;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(95deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%);
          box-shadow: 0 2px 20px rgba(29,78,216,0.40);
          /* safe area top para iOS (notch/Dynamic Island) */
          padding-top: env(safe-area-inset-top);
        }

        /* glare superior */
        .coin-navbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        /* línea dorada inferior */
        .coin-navbar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.75) 50%, transparent 100%);
          pointer-events: none;
          z-index: 2;
        }

        /* Label centrado en la navbar */
        .coin-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 6px rgba(0,0,0,0.22);
          pointer-events: none;
          z-index: 3;
        }

        /* Monedas animadas */
        @keyframes coin-slide {
          0%   { transform: translateX(-90px); opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 90px)); opacity: 0; }
        }
        .coin-wrap {
          position: absolute;
          top: 50%;
          left: 0;
          margin-top: -28px;
          width: 56px;
          height: 56px;
          z-index: 0;
        }
        .coin-wrap-1 { animation: coin-slide 14s linear infinite; animation-delay: 0s; }
        .coin-wrap-2 { animation: coin-slide 14s linear infinite; animation-delay: -4.6s; }
        .coin-wrap-3 { animation: coin-slide 14s linear infinite; animation-delay: -9.2s; }

        /* ════════════════════════════════════════
           LAYOUT PRINCIPAL
        ════════════════════════════════════════ */
        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          /* padding lateral + safe-area para notch lateral en landscape */
          padding: 24px max(16px, env(safe-area-inset-left)) 24px max(16px, env(safe-area-inset-right));
        }

        .login-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 960px;
          gap: 32px;
        }

        /* ════════════════════════════════════════
           PANEL MASCOTA (solo desktop)
           MEJORA: glassmorphism + texto más cuidado
        ════════════════════════════════════════ */
        .mascot-panel {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 40px 24px;
          border-radius: 28px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.70);
          box-shadow:
            0 8px 32px rgba(59,130,246,0.10),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        @keyframes mascot-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-10px) rotate(0.5deg); }
          66%       { transform: translateY(-6px) rotate(-0.5deg); }
        }
        .mascot-float { animation: mascot-float 5s ease-in-out infinite; }

        .mascot-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08));
          border: 1px solid rgba(59,130,246,0.20);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #1d4ed8;
          letter-spacing: 0.02em;
          margin-top: 20px;
        }
        .mascot-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin-top: 12px;
          line-height: 1.3;
        }
        .mascot-subtitle {
          font-size: 14px;
          color: #64748b;
          text-align: center;
          margin-top: 6px;
          line-height: 1.5;
        }

        /* Estadísticas decorativas */
        .mascot-stats {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          width: 100%;
        }
        .stat-chip {
          flex: 1;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 14px;
          padding: 12px 8px;
          text-align: center;
        }
        .stat-chip-value {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1d4ed8;
          line-height: 1;
        }
        .stat-chip-label {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 3px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        /* ════════════════════════════════════════
           CARD LOGIN
           MEJORA: max-width más preciso, sombra cuidada
        ════════════════════════════════════════ */
        .login-card {
          width: 100%;
          /* 440px es el sweet spot: no aplasta en tablet, cómodo en móvil */
          max-width: 440px;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.07),
            0 4px 6px rgba(0,0,0,0.03),
            0 20px 50px rgba(59,130,246,0.13),
            0 40px 80px rgba(99,102,241,0.06);
          /* En desktop la card no crece más que el panel mascota */
          flex-shrink: 0;
        }

        /* ── Card Header ── */
        .card-header {
          position: relative;
          background: linear-gradient(145deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%);
          padding: 36px 32px 52px; /* padding bottom generoso para la wave */
          text-align: center;
          overflow: hidden;
        }
        /* Círculos decorativos */
        .card-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .card-header::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -30px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }

        .card-logo-wrap {
          position: relative;
          z-index: 1;
          width: 72px; height: 72px;
          margin: 0 auto 14px;
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.30);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .card-title {
          position: relative;
          z-index: 1;
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.2;
        }
        .card-subtitle {
          position: relative;
          z-index: 1;
          font-size: 13.5px;
          color: rgba(219,234,254,0.90);
          margin-top: 5px;
          line-height: 1.4;
        }

        /* Wave SVG — limpia y sin hueco */
        .card-wave {
          display: block;
          margin-top: -2px; /* soluciona el 1px gap que suele aparecer */
          background: linear-gradient(145deg, #3b82f6, #1d4ed8); /* mismo gradiente que el header para cerrar */
        }

        /* ── Cuerpo formulario ── */
        .card-body {
          padding: 8px 28px 32px;
        }

        /* ════════════════════════════════════════
           INPUTS
           MEJORA CRÍTICA: font-size 16px evita
           el auto-zoom de Safari/iOS en focus.
           min-height 52px = touch target correcto.
        ════════════════════════════════════════ */
        .field-group { margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          margin-bottom: 7px;
          margin-left: 2px;
        }

        .field-row {
          position: relative;
        }
        .field-icon {
          position: absolute;
          top: 50%;
          left: 15px;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.18s;
          /* Tamaño mínimo de ícono para legibilidad táctil */
          font-size: 15px;
          line-height: 1;
          z-index: 1;
        }
        .field-row:focus-within .field-icon { color: #3b82f6; }

        .input-field {
          width: 100%;
          min-height: 52px;               /* touch target */
          padding: 14px 14px 14px 44px;
          border-radius: 14px;
          border: 2px solid #e8edf5;
          background: #f8faff;
          /* ⚠️ 16px mínimo: evita zoom automático en iOS Safari */
          font-size: 16px;
          color: #1e293b;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
          /* Mejora: apariencia nativa desactivada para uniformidad cross-browser */
          -webkit-appearance: none;
          appearance: none;
        }
        .input-field:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
        }
        .input-field::placeholder { color: #c8d4e3; font-size: 15px; }
        /* Quita el borde rojo nativo de validación */
        .input-field:invalid:not(:placeholder-shown) {
          border-color: #fca5a5;
          box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
        }
        /* Estilos autofill — evita el fondo azul feo de Chrome */
        .input-field:-webkit-autofill,
        .input-field:-webkit-autofill:hover,
        .input-field:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #f8faff inset;
          -webkit-text-fill-color: #1e293b;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Toggle ver contraseña — área táctil correcta */
        .password-toggle {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          /* 44x44 mínimo para toque cómodo */
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 0 12px 12px 0;
          transition: color 0.18s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .password-toggle:hover { color: #3b82f6; background: rgba(59,130,246,0.05); }
        .password-toggle:active { background: rgba(59,130,246,0.10); }
        /* Asegurar que el input tiene espacio para el toggle */
        .input-field.has-toggle { padding-right: 52px; }

        /* ════════════════════════════════════════
           ERROR BANNER
           MEJORA: role=alert para accesibilidad,
           mejor jerarquía visual
        ════════════════════════════════════════ */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff5f5;
          border: 1.5px solid #fecaca;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 18px;
        }
        .error-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; line-height: 1; }
        .error-text { font-size: 13.5px; color: #dc2626; line-height: 1.45; font-weight: 500; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-5px); }
          30%       { transform: translateX(5px); }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(4px); }
          75%       { transform: translateX(-2px); }
          90%       { transform: translateX(2px); }
        }
        .shake { animation: shake 0.45s cubic-bezier(.36,.07,.19,.97); }

        /* ════════════════════════════════════════
           BOTÓN PRINCIPAL
           MEJORA: min-height 52px, font Sora,
           ripple visual en active
        ════════════════════════════════════════ */
        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 52px;
          padding: 14px 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%);
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15.5px;
          letter-spacing: 0.01em;
          border: none;
          cursor: pointer;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 6px 20px rgba(37,99,235,0.38),
            0 2px 4px rgba(37,99,235,0.20);
          transition: transform 0.16s cubic-bezier(.22,1,.36,1), box-shadow 0.16s, opacity 0.16s;
          -webkit-tap-highlight-color: transparent;
          /* Feedback táctil inmediato */
          touch-action: manipulation;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 10px 28px rgba(37,99,235,0.42),
            0 4px 8px rgba(37,99,235,0.20);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(1px) scale(0.99);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.10) inset,
            0 4px 12px rgba(37,99,235,0.30);
        }
        .btn-primary:disabled {
          opacity: 0.60;
          cursor: not-allowed;
          transform: none;
        }
        .btn-primary:focus-visible {
          outline: 3px solid rgba(59,130,246,0.50);
          outline-offset: 2px;
        }

        /* Spinner accesible */
        @keyframes spin-loader {
          to { transform: rotate(360deg); }
        }
        .spin-loader {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.30);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin-loader 0.75s linear infinite;
          flex-shrink: 0;
        }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e8edf5, transparent);
          margin: 20px 0 18px;
        }

        /* ── Footer del form ── */
        .form-footer { text-align: center; }
        .footer-question { font-size: 13.5px; color: #64748b; line-height: 1.5; }
        .footer-link {
          color: #2563eb;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          padding: 0;
          /* Área táctil expandida en móvil */
          display: inline-block;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.15s;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: transparent;
        }
        .footer-link:hover { color: #1d4ed8; text-decoration-color: #1d4ed8; }
        .footer-terms { font-size: 11.5px; color: #b0bccc; margin-top: 8px; line-height: 1.4; }

        /* ── Versión de app ── */
        .app-version {
          text-align: center;
          font-size: 11px;
          color: #c4cdd8;
          padding: 12px 0 max(12px, env(safe-area-inset-bottom));
          letter-spacing: 0.04em;
        }

        /* ════════════════════════════════════════
           ANIMACIONES DE ENTRADA
        ════════════════════════════════════════ */
        @keyframes float-up {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in   { animation: float-up 0.55s cubic-bezier(.22,1,.36,1) forwards; }
        .delay-1   { animation-delay: 0.05s; opacity: 0; }
        .delay-2   { animation-delay: 0.15s; opacity: 0; }
        .delay-3   { animation-delay: 0.22s; opacity: 0; }
        .delay-4   { animation-delay: 0.30s; opacity: 0; }
        .delay-5   { animation-delay: 0.38s; opacity: 0; }

        /* ════════════════════════════════════════
           RESPONSIVE — DESKTOP
           breakpoint md = 768px
        ════════════════════════════════════════ */
        @media (min-width: 768px) {
          .login-inner {
            flex-direction: row;
            align-items: stretch;
            gap: 40px;
          }
          .mascot-panel {
            display: flex;
            min-width: 280px;
          }
          .login-card {
            /* En desktop no limitamos tanto para que respire */
            max-width: 420px;
            flex: 0 0 420px;
          }
        }

        /* ════════════════════════════════════════
           RESPONSIVE — PANTALLAS PEQUEÑAS (<380px)
           ej: iPhone SE, Galaxy A series
        ════════════════════════════════════════ */
        @media (max-width: 380px) {
          .login-main { padding: 16px 12px; }
          .card-header { padding: 28px 22px 46px; }
          .card-body { padding: 6px 20px 26px; }
          .card-logo-wrap { width: 62px; height: 62px; border-radius: 17px; }
          .card-title { font-size: 19px; }
        }

        /* ════════════════════════════════════════
           MODO OSCURO (preparado, no activo)
        ════════════════════════════════════════ */
        @media (prefers-color-scheme: dark) {
          /* Descomentá si en el futuro querés soporte dark mode */
          /*
          .login-root { background: #0f172a; }
          .login-card { background: #1e293b; }
          .input-field { background: #0f172a; border-color: #334155; color: #f1f5f9; }
          */
        }

        /* ════════════════════════════════════════
           ACCESIBILIDAD — reduce motion
        ════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .coin-wrap-1, .coin-wrap-2, .coin-wrap-3,
          .mascot-float, .fade-in, .delay-1, .delay-2,
          .delay-3, .delay-4, .delay-5 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════
          NAVBAR DE MONEDAS
      ══════════════════════════════════ */}
      <div className="coin-navbar" aria-hidden="true">
        <div className="coin-label">
          <span>💳</span>
          <span>Gestiona créditos y fiados de forma inteligente</span>
        </div>

        {/* Monedas (3 instancias para loop continuo) */}
        {[0, -4.6, -9.2].map((delay, i) => (
          <div key={i} className={`coin-wrap coin-wrap-${i + 1}`}>
            <DotLottieReact
              src={coinLottie}
              loop
              autoplay
              style={{
                width: 56, height: 56,
                filter: "drop-shadow(0 0 10px rgba(251,191,36,0.85)) drop-shadow(0 3px 5px rgba(0,0,0,0.18))"
              }}
            />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════
          MAIN
      ══════════════════════════════════ */}
      <main className="login-main">
        <div className="login-inner">

          {/* ── PANEL MASCOTA (solo desktop) ── */}
          <div className="mascot-panel" aria-hidden="true">
            {/* Badge */}
            <div className="mascot-badge fade-in delay-1">
              <span>✦</span>
              <span>Software de Créditos</span>
            </div>

            {/* Mascota flotante */}
            <div className="mascot-float" style={{ marginTop: 20 }}>
              <img
                src={wolfMascot}
                alt=""
                style={{
                  width: "100%",
                  maxWidth: 260,
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(29,78,216,0.20))"
                }}
              />
            </div>

            {/* Textos */}
            <p className="mascot-title fade-in delay-2">
              Más control para tus<br />créditos y fiados.
            </p>
           

            {/* Stats decorativos */}
            <div className="mascot-stats fade-in delay-4">
              <div className="stat-chip">
                <div className="stat-chip-value">99.9%</div>
                <div className="stat-chip-label">Disponibilidad</div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip-value">256-bit</div>
                <div className="stat-chip-label">Cifrado ssl</div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip-value">24/7</div>
                <div className="stat-chip-label">Monitoreo</div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              CARD DE LOGIN
          ══════════════════════════════════ */}
          <div className="login-card" role="main">

            {/* ── Header ── */}
            <div className="card-header">
              <div className="card-logo-wrap fade-in delay-1">
                <img
                  src={logoApp}
                  alt="Logo de la aplicación"
                  style={{
                    width: 46, height: 46,
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)"
                  }}
                />
              </div>
              <h1 className="card-title fade-in delay-2">Bienvenido otra vez</h1>
              <p className="card-subtitle fade-in delay-3">
                Ingresa usuario y contraseña para continuar
              </p>
            </div>

            {/* Wave decorativa — cierra el header sin hueco */}
            <svg
              className="card-wave"
              viewBox="0 0 440 48"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0,24 C80,46 160,4 220,24 C280,44 360,6 440,24 L440,48 L0,48 Z"
                fill="white"
              />
            </svg>

            {/* ── Formulario ── */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card-body"
              aria-label="Formulario de inicio de sesión"
            >

              {/* Error banner — accesible con role=alert */}
              {error && (
                <div
                  className="error-banner shake"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              {/* ── Campo Email ── */}
              <div className="field-group fade-in delay-2">
                <label htmlFor="login-email" className="field-label">
                  Correo electrónico
                </label>
                <div className="field-row">
                  <span className="field-icon" aria-hidden="true">
                    <FaEnvelope />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="input-field"
                    aria-label="Correo electrónico"
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {/* ── Campo Contraseña ── */}
              <div className="field-group fade-in delay-3">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label htmlFor="login-password" className="field-label" style={{ marginBottom: 0 }}>
                    Contraseña
                  </label>
                  <a
                    href="#"
                    style={{
                      fontSize: 12,
                      color: "#2563eb",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "color 0.15s",
                      /* Área táctil mínima recomendada */
                      padding: "4px 2px",
                    }}
                    onMouseEnter={e => e.target.style.color = "#1d4ed8"}
                    onMouseLeave={e => e.target.style.color = "#2563eb"}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="field-row">
                  <span className="field-icon" aria-hidden="true">
                    <FaLock />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field has-toggle"
                    aria-label="Contraseña"
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* ── Botón Submit ── */}
              <div className="fade-in delay-4" style={{ marginBottom: 0 }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spin-loader"
                        role="status"
                        aria-label="Verificando credenciales"
                      />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    "Acceder"
                  )}
                </button>
              </div>

              {/* ── Divider ── */}
              <div className="divider fade-in delay-5" aria-hidden="true" />

              {/* ── Footer ── */}
              <div className="form-footer fade-in delay-5">
                <p className="footer-question">
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/registro")}
                    className="footer-link"
                  >
                    Regístrate aquí
                  </button>
                </p>
                <p className="footer-terms">
                  Al ingresar aceptas nuestros{" "}
                  <a href="#" style={{ color: "#94a3b8", textDecoration: "underline", textUnderlineOffset: 2 }}>
                    términos y condiciones
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>

        </div>
      </main>

      {/* Versión discreta al pie */}
      <footer className="app-version" aria-label="Versión de la aplicación">
        v1.0 · Gestión Financiera
      </footer>

    </div>
  );
};

export default Login;
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
    <div className="min-h-screen flex flex-col bg-[#f0f4ff] font-sans overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        /* ── Monedas: slide limpio de izquierda a derecha ── */
        @keyframes coin-slide {
          0%   { transform: translateX(-120px); opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 120px)); opacity: 0; }
        }

        .coin-wrap {
          position: absolute;
          top: 50%;
          left: 0;
          margin-top: -32px;   /* mitad de 64px para centrar verticalmente */
          width: 64px;
          height: 64px;
        }
        .coin-wrap-1 { animation: coin-slide 14s linear infinite; animation-delay: 0s; }
        .coin-wrap-2 { animation: coin-slide 14s linear infinite; animation-delay: -4.6s; }
        .coin-wrap-3 { animation: coin-slide 14s linear infinite; animation-delay: -9.2s; }



        /* ── Navbar ── */
        .coin-navbar {
          position: relative;
          width: 100%;
          height: 60px;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
          box-shadow: 0 4px 24px rgba(29,78,216,0.45);
        }
        .coin-navbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        .coin-navbar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.7) 50%, transparent 100%);
          pointer-events: none;
          z-index: 2;
        }
        .coin-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          text-shadow: 0 1px 8px rgba(0,0,0,0.25);
          pointer-events: none;
          z-index: 3;
        }

        /* ── Animaciones de entrada ── */
        @keyframes float-up {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: float-up 0.55s cubic-bezier(.22,1,.36,1) forwards; }
        .fade-in-1 { animation-delay: 0.05s; opacity: 0; }
        .fade-in-2 { animation-delay: 0.15s; opacity: 0; }
        .fade-in-3 { animation-delay: 0.25s; opacity: 0; }
        .fade-in-4 { animation-delay: 0.35s; opacity: 0; }
        .fade-in-5 { animation-delay: 0.45s; opacity: 0; }

        @keyframes mascot-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        .mascot-float { animation: mascot-float 4s ease-in-out infinite; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .shake { animation: shake 0.4s ease; }

        @keyframes spin-loader {
          to { transform: rotate(360deg); }
        }
        .spin-loader { animation: spin-loader 0.8s linear infinite; }

        /* ── Inputs ── */
        .input-field {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.85rem;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: #f8faff;
          font-size: 0.95rem;
          color: #1e293b;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .input-field::placeholder { color: #b0bec5; }

        /* ── Botón ── */
        .btn-primary {
          width: 100%;
          padding: 0.95rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.01em;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.4);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .card-glow {
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.08),
            0 20px 60px rgba(59,130,246,0.12),
            0 4px 16px rgba(0,0,0,0.06);
        }

        .bg-mesh {
          background:
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(59,130,246,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 70%, rgba(99,102,241,0.10) 0%, transparent 70%),
            #f0f4ff;
        }

        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }
      `}</style>

      {/* ── COIN NAVBAR ── */}
      <div className="coin-navbar">
        {/* Etiqueta central */}
        <div className="coin-label">
          <span>💳</span>
          <span>Gestión de crédito inteligente</span>
        </div>

        {/* Moneda 1 */}
        <div className="coin-wrap coin-wrap-1">
          <DotLottieReact
            src={coinLottie} loop autoplay
            style={{ width: 64, height: 64, filter: "drop-shadow(0 0 12px rgba(251,191,36,0.9)) drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}
          />
        </div>

        {/* Moneda 2 */}
        <div className="coin-wrap coin-wrap-2">
          <DotLottieReact
            src={coinLottie} loop autoplay
            style={{ width: 64, height: 64, filter: "drop-shadow(0 0 12px rgba(251,191,36,0.9)) drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}
          />
        </div>

        {/* Moneda 3 */}
        <div className="coin-wrap coin-wrap-3">
          <DotLottieReact
            src={coinLottie} loop autoplay
            style={{ width: 64, height: 64, filter: "drop-shadow(0 0 12px rgba(251,191,36,0.9)) drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}
          />
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="flex-grow flex items-center justify-center bg-mesh px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-16">

          {/* MASCOTA — oculta en mobile */}
          <div className="hidden md:flex flex-col items-center justify-center md:w-1/2">
            <div className="mascot-float">
              <img
                src={wolfMascot}
                alt="Kredi Mascot"
                className="w-full max-w-sm h-auto object-contain drop-shadow-2xl"
              />
            </div>
            <p className="font-display text-2xl font-800 text-blue-600 mt-6 text-center leading-snug">
              Tu aliado financiero<br />
              <span className="text-slate-500 font-semibold text-lg">siempre a tu lado 🐾</span>
            </p>
          </div>

          {/* ── CARD LOGIN ── */}
          <div className="w-full max-w-sm md:max-w-md bg-white rounded-3xl card-glow overflow-hidden">

            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 px-8 pt-10 pb-12 text-center overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/8" />

              <div className="fade-in fade-in-1 relative">
                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <img src={logoApp} alt="Logo" className="w-14 h-14 object-contain brightness-0 invert" />
                </div>
                <h1 className="font-display text-white text-2xl font-bold tracking-tight">
                  Bienvenido de nuevo
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Ingresa tus credenciales para continuar
                </p>
              </div>
            </div>

            {/* Onda decorativa */}
            <div className="-mt-6 relative z-10">
              <svg viewBox="0 0 400 40" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0,20 C100,40 300,0 400,20 L400,40 L0,40 Z" fill="white" />
              </svg>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="px-6 pb-8 -mt-2 space-y-5">

              {/* Error banner */}
              {error && (
                <div className="shake bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="fade-in fade-in-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <FaEnvelope size={15} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="fade-in fade-in-3 space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs text-blue-500 hover:text-blue-700 transition-colors font-medium">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <FaLock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Botón */}
              <div className="fade-in fade-in-4 pt-1">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spin-loader inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Verificando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </div>

              <div className="divider-line fade-in fade-in-5" />

              {/* Registro */}
              <div className="fade-in fade-in-5 text-center space-y-2">
                <p className="text-sm text-slate-500">
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/registro")}
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors hover:underline underline-offset-2"
                  >
                    Regístrate aquí
                  </button>
                </p>
                <p className="text-xs text-slate-400">
                  Al ingresar aceptas nuestros términos y condiciones.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
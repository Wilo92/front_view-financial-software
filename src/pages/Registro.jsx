import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import logoApp from "../assets/logo.png";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft, FaIdCard, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

/* ── Campos del formulario ────────────────────────────────────── */
const FIELDS = [
  { name: "name",            label: "Nombre Completo",    type: "text",     icon: FaUser,    placeholder: "Juan Pérez"          },
  { name: "document_number", label: "Documento",          type: "text",     icon: FaIdCard,  placeholder: "1088..."             },
  { name: "email",           label: "Correo Electrónico", type: "email",    icon: FaEnvelope,placeholder: "usuario@kredi.com"   },
  { name: "phone",           label: "Teléfono",           type: "text",     icon: FaPhone,   placeholder: "+57 300..."          },
  { name: "password",        label: "Contraseña",         type: "password", icon: FaLock,    placeholder: "••••••••", isPass: true },
];

const Registro = () => {
  const navigate  = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [errors,  setErrors]    = useState({});
  const [showPass, setShowPass] = useState(false);
  const [success,  setSuccess]  = useState(false);

  const [formData, setFormData] = useState({
    name: "", document_number: "", email: "", phone: "", password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validatePassword = (pass) => {
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{4,10}$/;
    return re.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clienteAxios.get("/sanctum/csrf-cookie");
      const response = await clienteAxios.post("/api/register", formData);
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/deudores"), 1400);
      }
    } catch (error) {
      console.log("Status:", error.response?.status);
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  /* ── Indicador de fortaleza de contraseña ─────────────────── */
  const passStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 4)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/\d/.test(p))            s++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][passStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][passStrength];

  return (
    <div className="rg-root min-h-screen bg-[#f0f4ff] flex items-center justify-center p-4 py-10">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .rg-root { font-family: 'DM Sans', sans-serif; }
        .rg-brand { font-family: 'Sora', sans-serif; }

        .rg-bg {
          background:
            radial-gradient(ellipse 55% 45% at 15% 25%, rgba(59,130,246,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 45% 55% at 85% 75%, rgba(99,102,241,0.10) 0%, transparent 70%),
            #f0f4ff;
        }

        .rg-card {
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.08),
            0 24px 64px rgba(59,130,246,0.14),
            0 4px 16px rgba(0,0,0,0.06);
        }

        /* Header */
        .rg-header {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
          padding: 28px 32px 36px;
          position: relative;
          text-align: center;
          overflow: hidden;
        }
        .rg-header::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 130px; height: 130px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }
        .rg-header::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -20px;
          width: 90px; height: 90px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }

        /* Onda */
        .rg-wave svg { display: block; }

        /* Back button */
        .rg-back {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.9);
          cursor: pointer;
          transition: background 0.18s;
        }
        .rg-back:hover { background: rgba(255,255,255,0.28); }

        /* Inputs */
        .rg-field-wrap { position: relative; }
        .rg-icon {
          position: absolute;
          left: 13px; top: 50%; transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .rg-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: #f8faff;
          font-size: 0.9rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .rg-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .rg-input.error { border-color: #ef4444; }
        .rg-input:focus ~ .rg-icon,
        .rg-field-wrap:focus-within .rg-icon { color: #3b82f6; }
        .rg-input::placeholder { color: #b0bec5; }

        .rg-error { color: #ef4444; font-size: 11px; margin-top: 4px; display: flex; align-items: center; gap: 4px; }

        /* Strength bar */
        .rg-strength-bar {
          height: 3px;
          border-radius: 99px;
          background: #e2e8f0;
          margin-top: 6px;
          overflow: hidden;
        }
        .rg-strength-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.35s, background 0.35s;
        }

        /* Botón */
        .rg-btn {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.97rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.4);
        }
        .rg-btn:active:not(:disabled) { transform: translateY(0); }
        .rg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        @keyframes rg-spin { to { transform: rotate(360deg); } }
        .rg-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rg-spin 0.75s linear infinite;
        }

        /* Success overlay */
        @keyframes rg-pop { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .rg-success {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 16px;
          animation: rg-pop 0.35s cubic-bezier(.22,1,.36,1);
          z-index: 50;
        }

        /* Fade in escalonado */
        @keyframes rg-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .rg-field { animation: rg-fade 0.4s cubic-bezier(.22,1,.36,1) both; }
        .rg-field:nth-child(1){animation-delay:0.05s}
        .rg-field:nth-child(2){animation-delay:0.10s}
        .rg-field:nth-child(3){animation-delay:0.15s}
        .rg-field:nth-child(4){animation-delay:0.20s}
        .rg-field:nth-child(5){animation-delay:0.25s}

        .rg-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }
      `}</style>

      <div className="rg-bg w-full min-h-screen fixed inset-0 -z-10" />

      <div className="rg-card w-full max-w-md relative">

        {/* ── SUCCESS OVERLAY ── */}
        {success && (
          <div className="rg-success rounded-[28px]">
            <FaCheckCircle size={52} color="#fff" />
            <p className="rg-brand text-white text-xl font-bold">¡Cuenta creada!</p>
            <p className="text-blue-200 text-sm">Redirigiendo...</p>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="rg-header">
          <button className="rg-back" onClick={() => navigate("/login")} aria-label="Volver">
            <FaArrowLeft size={14} />
          </button>

          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <img src={logoApp} alt="Logo" className="w-11 h-11 object-contain brightness-0 invert" />
            </div>
            <h1 className="rg-brand text-white text-2xl font-bold">Crea tu cuenta</h1>
            <p className="text-blue-200 text-sm mt-1">Completa los datos para registrarte</p>
          </div>
        </div>

        {/* Onda */}
        <div className="rg-wave -mt-5">
          <svg viewBox="0 0 400 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,16 C100,32 300,0 400,16 L400,32 L0,32 Z" fill="white"/>
          </svg>
        </div>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="px-6 pb-8 -mt-1 space-y-4">

          {FIELDS.map((f) => {
            const Icon = f.icon;
            const hasError = !!errors[f.name];
            const inputType = f.isPass ? (showPass ? "text" : "password") : f.type;

            return (
              <div key={f.name} className="rg-field space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {f.label}
                </label>
                <div className="rg-field-wrap">
                  <input
                    name={f.name}
                    type={inputType}
                    required
                    value={formData[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className={`rg-input ${hasError ? "error" : ""} ${f.isPass ? "pr-11" : ""}`}
                  />
                  <Icon className="rg-icon" />
                  {f.isPass && (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8", background: "none", border: "none",
                        cursor: "pointer", padding: 2,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#3b82f6"}
                      onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                    >
                      {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  )}
                </div>

                {/* Barra de fortaleza solo en el campo contraseña */}
                {f.isPass && formData.password && (
                  <div>
                    <div className="rg-strength-bar">
                      <div
                        className="rg-strength-fill"
                        style={{
                          width: `${(passStrength / 4) * 100}%`,
                          background: strengthColor,
                        }}
                      />
                    </div>
                    <p style={{ fontSize: 10, color: strengthColor, marginTop: 3, fontWeight: 600 }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}

                {f.isPass && !errors.password && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    * 4–10 caracteres, 1 mayúscula, 1 número y 1 símbolo.
                  </p>
                )}

                {hasError && (
                  <p className="rg-error">⚠ {errors[f.name][0]}</p>
                )}
              </div>
            );
          })}

          {/* Botón submit */}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="rg-btn">
              {loading ? <><div className="rg-spinner" /> Creando cuenta...</> : "Registrarme"}
            </button>
          </div>

          <div className="rg-divider" />

          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline underline-offset-2 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;
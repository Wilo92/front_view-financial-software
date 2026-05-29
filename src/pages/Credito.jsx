import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import {
  FaDollarSign, FaPercent, FaListOl, FaCalendarAlt,
  FaRedo, FaClock, FaSave, FaChevronDown, FaUserCircle,
  FaIdCard, FaChartLine, FaInfoCircle, FaCheckCircle,
  FaTimes, FaArrowLeft
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   HELPERS — sin cambios
───────────────────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("es-CO");

const FRECUENCIAS = [
  { value: "diario",    label: "Diario"    },
  { value: "semanal",   label: "Semanal"   },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual",   label: "Mensual"   },
];

const TIPOS = [
  { value: "cuota_fija",     label: "Cuotas Fijas"           },
  { value: "abono_capital",  label: "Abono Fijo a Capital"    },
  { value: "solo_intereses", label: "Solo Intereses (Final)"  },
  { value: "interes_simple", label: "Interés Simple (Fijo)"   },
];

const EMPTY_FORM = (id = "") => ({
  deudor_id: id, monto: "", tasa_interes: "", numero_cuotas: "",
  fecha_inicio: "", tipo_prestamo: "cuota_fija", frecuencia: "mensual",
  observaciones: "",
});

/* ─────────────────────────────────────────────────────────────
   TOAST — consistente con el resto de la app
───────────────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  const meta = {
    success: { bg:"#f0fdf4", border:"#bbf7d0", left:"#10b981", color:"#065f46", icon:"✓", iconBg:"#059669" },
    error:   { bg:"#fff1f2", border:"#fecaca", left:"#ef4444", color:"#991b1b", icon:"✕", iconBg:"#ef4444" },
  }[type];

  return (
    <div style={{
      position:"fixed",
      bottom:"max(24px, env(safe-area-inset-bottom))",
      left:"50%", transform:"translateX(-50%)",
      width:"calc(100% - 32px)", maxWidth:420,
      background:meta.bg, border:`1.5px solid ${meta.border}`,
      borderLeft:`4px solid ${meta.left}`,
      borderRadius:14, padding:"12px 14px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,.13)",
      zIndex:9999,
      animation:"crToastIn .32s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{
        width:30, height:30, borderRadius:9, flexShrink:0,
        background:meta.iconBg,
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontWeight:800, fontSize:13,
      }}>{meta.icon}</div>
      <p style={{ flex:1, fontSize:13.5, color:meta.color, fontWeight:500, lineHeight:1.4 }}>{message}</p>
      <button onClick={onClose} style={{
        width:26, height:26, border:"none", background:"transparent",
        cursor:"pointer", color:meta.color, opacity:.55,
        display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:7, flexShrink:0,
      }}><FaTimes size={10}/></button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Credito() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [form,              setForm]              = useState(EMPTY_FORM(id));
  const [deudor,            setDeudor]            = useState(null);
  const [planProyectado,    setPlanProyectado]    = useState([]);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [toast,             setToast]             = useState(null);
  const [simError,          setSimError]          = useState(false);

  /* ── Cargar deudor ── */
  useEffect(() => {
    const cargarDeudor = async () => {
      try {
        const res = await clienteAxios.get(`/api/deudores/${id}`);
        setDeudor(res.data);
      } catch (error) {
        console.error("Error al cargar los datos del deudor", error);
      }
    };
    if (id) {
      setForm((prev) => ({ ...prev, deudor_id: id }));
      cargarDeudor();
    }
  }, [id]);

  /* ── Simulación automática con debounce 500ms ── */
  useEffect(() => {
    const simular = async () => {
      const { monto, tasa_interes, numero_cuotas, fecha_inicio } = form;
      if (monto > 0 && tasa_interes > 0 && numero_cuotas > 0 && fecha_inicio) {
        setLoadingSimulation(true);
        setSimError(false);
        try {
          const res = await clienteAxios.post("/api/creditos/simular", form);
          setPlanProyectado(res.data);
        } catch (e) {
          console.error("Error en simulación", e);
          setSimError(true);
          setPlanProyectado([]);
        } finally {
          setLoadingSimulation(false);
        }
      } else {
        /* Limpiar simulación si faltan datos */
        setPlanProyectado([]);
      }
    };
    const timer = setTimeout(simular, 500);
    return () => clearTimeout(timer);
  }, [form]);

  /* ── Handlers ── */
  const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit  = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clienteAxios.post("/api/creditos", form);
      setToast({ type:"success", message:"Crédito creado correctamente. Redirigiendo..." });
      setTimeout(() => navigate("/deudores"), 1800);
      setForm(EMPTY_FORM(id));
      setPlanProyectado([]);
    } catch (error) {
      setToast({ type:"error", message:"Error al crear el crédito. Verifica los datos." });
    } finally {
      setSaving(false);
    }
  };

  /* ── Totales ── */
  const totalCapital = planProyectado.reduce((s, c) => s + Number(c.capital),    0);
  const totalInteres = planProyectado.reduce((s, c) => s + Number(c.interes),    0);
  const totalPagar   = planProyectado.reduce((s, c) => s + Number(c.monto_cuota),0);

  /* ── Initials del deudor ── */
  const initials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="cr-root">

      {/* ══════════════════════════════════
          ESTILOS
      ══════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .cr-root  { font-family:'DM Sans',sans-serif; min-height:100svh; background:#eef2ff; }
        .cr-brand { font-family:'Sora',sans-serif !important; }

        /* ════ PAGE HEADER ════ */
        .cr-page-header {
          background: linear-gradient(145deg,#1d4ed8 0%,#2563eb 55%,#3b82f6 100%);
          padding: 26px 20px 56px;
          position:relative; overflow:hidden;
        }
        .cr-page-header::before {
          content:''; position:absolute; top:-50px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          background:rgba(255,255,255,.07); pointer-events:none;
        }
        .cr-page-header::after {
          content:''; position:absolute; bottom:-30px; left:25%;
          width:150px; height:150px; border-radius:50%;
          background:rgba(255,255,255,.05); pointer-events:none;
        }
        .cr-hdr-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }

        /* Back button — 44×44px */
        .cr-back-btn {
          display:inline-flex; align-items:center; gap:7px;
          min-height:38px; padding:0 14px; border-radius:12px; margin-bottom:12px;
          background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.20);
          color:rgba(255,255,255,.90); font-size:12.5px; font-weight:600;
          cursor:pointer; transition:background .15s;
          -webkit-tap-highlight-color:transparent;
        }
        .cr-back-btn:hover { background:rgba(255,255,255,.22); }

        /* ════ SHELL ════ */
        .cr-shell {
          max-width: 1100px;
          margin: -32px auto 0;
          padding: 0 max(16px, env(safe-area-inset-left)) max(48px, env(safe-area-inset-bottom));
          position:relative; z-index:10;
        }

        /* ════ DEUDOR BANNER ════ */
        .cr-deudor-card {
          background: linear-gradient(135deg,#eff6ff,#f5f3ff);
          border: 1.5px solid #bfdbfe; border-radius:18px;
          padding: 14px 18px;
          display:flex; align-items:center; gap:14px;
          margin-bottom:18px;
        }
        .cr-deudor-avatar {
          width:46px; height:46px; border-radius:13px; flex-shrink:0;
          background:linear-gradient(135deg,#3b82f6,#6366f1);
          display:flex; align-items:center; justify-content:center;
          font-family:'Sora',sans-serif; font-weight:800; font-size:16px; color:#fff;
          box-shadow:0 4px 12px rgba(59,130,246,.30);
        }
        .cr-active-badge {
          padding:4px 14px; border-radius:100px; flex-shrink:0;
          background:linear-gradient(135deg,#3b82f6,#6366f1);
          color:#fff; font-size:11px; font-weight:700;
        }

        /* ════ GRID LAYOUT ════
           Mobile: columna única
           Desktop ≥900px: form | simulación lado a lado
        ═══════════════════════ */
        .cr-grid {
          display:grid;
          grid-template-columns:1fr;
          gap:18px;
          align-items:start;
        }
        @media (min-width:900px) {
          .cr-grid { grid-template-columns:1fr 1fr; }
        }

        /* ════ CARD ════ */
        .cr-card {
          background:#fff; border-radius:22px;
          box-shadow:
            0 0 0 1px rgba(59,130,246,.06),
            0 4px 6px rgba(0,0,0,.03),
            0 12px 40px rgba(59,130,246,.10);
          overflow:hidden;
          display:flex; flex-direction:column;
        }
        .cr-card-header {
          padding:14px 22px; border-bottom:1px solid #f1f5f9;
          display:flex; align-items:center; gap:12px;
          background:linear-gradient(135deg,#f8faff,#eff6ff);
          flex-shrink:0;
        }
        .cr-card-icon {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }

        /* ════ FORM BODY ════ */
        .cr-form-body {
          padding:20px 22px 24px;
          display:flex; flex-direction:column; gap:14px;
        }

        /* 2 col inline — interés + cuotas, frecuencia + tipo */
        .cr-row-2 {
          display:grid; grid-template-columns:1fr 1fr; gap:12px;
        }

        /* ════ LABELS + INPUTS ════
           font-size 16px → no zoom iOS
           min-height 50px → touch target
        ════ */
        .cr-field-group { display:flex; flex-direction:column; gap:6px; }
        .cr-label {
          font-size:10.5px; font-weight:700;
          text-transform:uppercase; letter-spacing:.10em;
          color:#94a3b8; margin-left:2px;
        }
        .cr-field { position:relative; }
        .cr-field-icon {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:#94a3b8; font-size:13px; pointer-events:none;
          transition:color .18s; z-index:1;
        }
        .cr-field:focus-within .cr-field-icon { color:#3b82f6; }
        .cr-input {
          width:100%; min-height:50px;
          padding:13px 13px 13px 40px;
          border-radius:13px; border:2px solid #e8edf5; background:#f8faff;
          font-size:16px;              /* ← evita zoom iOS */
          color:#1e293b; outline:none;
          transition:border-color .2s, background .2s, box-shadow .2s;
          font-family:'DM Sans',sans-serif;
          -webkit-appearance:none; appearance:none;
        }
        .cr-input:focus {
          border-color:#3b82f6; background:#fff;
          box-shadow:0 0 0 4px rgba(59,130,246,.10);
        }
        .cr-input::placeholder { color:#c8d4e3; font-size:14px; }
        /* Autofill sin fondo azul */
        .cr-input:-webkit-autofill,
        .cr-input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 1000px #f8faff inset;
          -webkit-text-fill-color:#1e293b;
          transition:background-color 5000s ease-in-out 0s;
        }

        /* input date — quita el ícono nativo en algunos browsers */
        .cr-input[type="date"]::-webkit-inner-spin-button,
        .cr-input[type="date"]::-webkit-calendar-picker-indicator {
          opacity:.5; cursor:pointer;
        }

        /* Select */
        .cr-select { padding-right:40px; cursor:pointer; }
        .cr-select-arrow {
          position:absolute; right:13px; top:50%; transform:translateY(-50%);
          color:#94a3b8; font-size:10px; pointer-events:none; z-index:1;
        }

        /* Textarea */
        .cr-textarea {
          min-height:auto;
          padding-top:13px; padding-bottom:13px;
          resize:none; line-height:1.5;
        }
        .cr-textarea-icon { top:15px !important; transform:none !important; }

        /* Divider */
        .cr-divider {
          height:1px;
          background:linear-gradient(90deg,transparent,#e8edf5,transparent);
        }

        /* ════ SUBMIT BUTTON ════ */
        .cr-btn-submit {
          display:flex; align-items:center; justify-content:center; gap:8px;
          min-height:52px; width:100%;
          border-radius:14px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#059669,#047857);
          color:#fff; font-family:'Sora',sans-serif;
          font-weight:700; font-size:15.5px;
          box-shadow:0 1px 0 rgba(255,255,255,.12) inset, 0 6px 20px rgba(5,150,105,.36);
          transition:transform .16s cubic-bezier(.22,1,.36,1), box-shadow .16s, opacity .16s;
          -webkit-tap-highlight-color:transparent;
          touch-action:manipulation;
        }
        .cr-btn-submit:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 1px 0 rgba(255,255,255,.12) inset, 0 10px 28px rgba(5,150,105,.42);
        }
        .cr-btn-submit:active:not(:disabled) { transform:scale(.99); }
        .cr-btn-submit:disabled { opacity:.62; cursor:not-allowed; }
        .cr-btn-submit:focus-visible { outline:3px solid rgba(5,150,105,.50); outline-offset:2px; }

        /* Spinner */
        @keyframes cr-spin { to{transform:rotate(360deg)} }
        .cr-spinner {
          width:16px; height:16px; border-radius:50%; flex-shrink:0;
          border:2.5px solid rgba(255,255,255,.30); border-top-color:#fff;
          animation:cr-spin .75s linear infinite;
        }

        /* ════ TOTALES CHIPS ════ */
        .cr-totals {
          display:grid; grid-template-columns:repeat(3,1fr); gap:10px;
          margin-bottom:16px;
        }
        .cr-total-chip {
          border-radius:14px; padding:12px 10px; text-align:center;
        }
        .cr-total-label {
          font-size:9.5px; font-weight:700; text-transform:uppercase;
          letter-spacing:.08em; margin-bottom:4px; display:block;
        }
        .cr-total-value {
          font-family:'Sora',sans-serif; font-weight:700; font-size:14px;
          line-height:1;
        }

        /* ════ TABLA SIMULACIÓN ════
           Desktop: tabla completa
           Mobile ≤640px: tarjetas apiladas (igual que Pagos)
        ═══════════════════════════ */
        .cr-table-wrap {
          flex:1; overflow-y:auto; border-radius:14px;
          border:1px solid #f1f5f9;
          max-height:340px;
          overscroll-behavior:contain;
        }
        .cr-sim-table {
          width:100%; border-collapse:collapse; font-size:13px;
        }
        .cr-sim-table thead th {
          padding:9px 12px; background:#fafbff;
          color:#94a3b8; font-size:9.5px; font-weight:700;
          text-transform:uppercase; letter-spacing:.08em;
          border-bottom:2px solid #f1f5f9;
          position:sticky; top:0; z-index:1;
        }
        .cr-sim-table tbody tr { border-bottom:1px solid #f1f5f9; transition:background .13s; }
        .cr-sim-table tbody tr:last-child { border-bottom:none; }
        .cr-sim-table tbody tr:hover { background:#f8faff; }
        .cr-sim-table td { padding:10px 12px; color:#475569; }
        .cr-num-badge {
          display:inline-flex; align-items:center; justify-content:center;
          width:24px; height:24px; border-radius:7px;
          background:#eff6ff; color:#3b82f6;
          font-family:'Sora',sans-serif; font-weight:800; font-size:10px;
        }
        .cr-cuota-total-badge {
          display:inline-block;
          background:#f0fdf4; color:#059669; font-weight:700;
          padding:3px 9px; border-radius:7px; font-size:12px;
        }

        /* Tabla mobile → oculta en <640px, cards mobile → visibles */
        .cr-table-desktop { display:block; }
        .cr-table-mobile  { display:none; padding:10px 14px; }
        @media (max-width:640px) {
          .cr-table-desktop { display:none; }
          .cr-table-mobile  { display:flex; flex-direction:column; gap:8px; }
        }

        /* Cuota card (mobile) */
        .cr-cuota-card {
          border:1.5px solid #e8edf5; border-radius:13px; overflow:hidden;
        }
        .cr-cuota-card-hdr {
          display:flex; align-items:center; gap:8px; padding:9px 12px;
          background:#fafbff; border-bottom:1px solid #f1f5f9;
        }
        .cr-cuota-card-body {
          padding:10px 12px; display:grid; grid-template-columns:1fr 1fr; gap:8px;
        }
        .cr-cuota-stat-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; }
        .cr-cuota-stat-val { font-size:13.5px; font-weight:700; color:#1e293b; margin-top:2px; }

        /* ════ ESTADOS EMPTY / LOADING ════ */
        .cr-sim-empty {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:12px; padding:48px 24px; text-align:center;
        }
        .cr-sim-empty-icon {
          width:64px; height:64px; border-radius:20px;
          background:linear-gradient(135deg,#eff6ff,#f5f3ff);
          display:flex; align-items:center; justify-content:center;
          border:1.5px dashed #bfdbfe;
        }

        /* Dots loader */
        @keyframes cr-bounce {
          0%,80%,100%{transform:scale(0);opacity:.4}
          40%{transform:scale(1);opacity:1}
        }
        .cr-dot {
          width:8px; height:8px; border-radius:50%;
          background:#3b82f6; display:inline-block;
        }
        .cr-dot:nth-child(1){animation:cr-bounce 1.2s ease infinite}
        .cr-dot:nth-child(2){animation:cr-bounce 1.2s ease infinite;animation-delay:.16s}
        .cr-dot:nth-child(3){animation:cr-bounce 1.2s ease infinite;animation-delay:.32s}

        /* ════ TOAST ════ */
        @keyframes crToastIn {
          from{opacity:0;transform:translateX(-50%) translateY(10px);}
          to{opacity:1;transform:translateX(-50%) translateY(0);}
        }

        /* ════ RESPONSIVE ════ */
        @media (max-width:380px) {
          .cr-shell { padding-left:12px; padding-right:12px; }
          .cr-page-header { padding:22px 16px 52px; }
          .cr-form-body { padding:16px 16px 20px; }
          .cr-row-2 { grid-template-columns:1fr; }
        }

        /* ════ REDUCE MOTION ════ */
        @media (prefers-reduced-motion:reduce) {
          .cr-dot, .cr-spinner { animation:none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════ */}
      <div className="cr-page-header">
        <div className="cr-hdr-inner">
          <button
            className="cr-back-btn"
            onClick={() => navigate("/deudores")}
            type="button"
            aria-label="Volver a clientes"
          >
            <FaArrowLeft size={12}/> Volver
          </button>
          <p className="cr-brand" style={{ color:"rgba(147,197,253,.85)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", marginBottom:4 }}>
            Gestión de crédito
          </p>
          <h1 className="cr-brand" style={{ color:"#fff", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, margin:0 }}>
            Nuevo Crédito
          </h1>
          <p style={{ color:"rgba(191,219,254,.85)", fontSize:13, marginTop:5 }}>
            Configura y simula el plan de pagos en tiempo real
          </p>
        </div>
      </div>

      <div className="cr-shell">

        {/* ══════════════════════════════════
            DEUDOR BANNER
        ══════════════════════════════════ */}
        {deudor && (
          <div className="cr-deudor-card" role="status">
            <div className="cr-deudor-avatar">
              {deudor.nombre
                ? deudor.nombre.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase()
                : <FaUserCircle size={20} color="#fff"/>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".10em", color:"#60a5fa", marginBottom:2 }}>
                Cliente seleccionado
              </p>
              <p className="cr-brand" style={{ fontWeight:700, color:"#1e293b", fontSize:15, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {deudor.nombre}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <FaIdCard size={10} color="#94a3b8"/>
                <span style={{ fontSize:12, color:"#64748b" }}>{deudor.documento_numero}</span>
              </div>
            </div>
            <div className="cr-active-badge">Activo</div>
          </div>
        )}

        {/* ══════════════════════════════════
            GRID: FORMULARIO + SIMULACIÓN
        ══════════════════════════════════ */}
        <div className="cr-grid">

          {/* ─────────────────────────────
              FORMULARIO
          ───────────────────────────── */}
          <div className="cr-card">
            <div className="cr-card-header">
              <div className="cr-card-icon" style={{ background:"linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                <FaDollarSign color="#fff" size={16}/>
              </div>
              <div>
                <p className="cr-brand" style={{ fontWeight:700, color:"#1e293b", fontSize:14, margin:0 }}>
                  Parámetros del crédito
                </p>
                <p style={{ fontSize:12, color:"#94a3b8", marginTop:1 }}>
                  Completa para simular automáticamente
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="cr-form-body" aria-label="Formulario de crédito">

              {/* Monto */}
              <div className="cr-field-group">
                <label htmlFor="cr-monto" className="cr-label">Monto del préstamo</label>
                <div className="cr-field">
                  <FaDollarSign className="cr-field-icon"/>
                  <input
                    id="cr-monto" type="number" name="monto"
                    value={form.monto} onChange={handleChange}
                    required placeholder="Ej: 500000"
                    inputMode="decimal" autoComplete="off"
                    className="cr-input"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Interés + Cuotas */}
              <div className="cr-row-2">
                <div className="cr-field-group">
                  <label htmlFor="cr-tasa" className="cr-label">% Interés por periodo</label>
                  <div className="cr-field">
                    <FaPercent className="cr-field-icon" style={{ fontSize:11 }}/>
                    <input
                      id="cr-tasa" type="number" name="tasa_interes"
                      value={form.tasa_interes} onChange={handleChange}
                      required placeholder="Ej: 5"
                      inputMode="decimal" autoComplete="off"
                      className="cr-input"
                      aria-required="true"
                    />
                  </div>
                </div>
                <div className="cr-field-group">
                  <label htmlFor="cr-cuotas" className="cr-label">Cant. cuotas</label>
                  <div className="cr-field">
                    <FaListOl className="cr-field-icon" style={{ fontSize:11 }}/>
                    <input
                      id="cr-cuotas" type="number" name="numero_cuotas"
                      value={form.numero_cuotas} onChange={handleChange}
                      required placeholder="Ej: 12"
                      inputMode="numeric" autoComplete="off"
                      className="cr-input"
                      aria-required="true"
                    />
                  </div>
                </div>
              </div>

              {/* Frecuencia + Tipo */}
              <div className="cr-row-2">
                <div className="cr-field-group">
                  <label htmlFor="cr-frecuencia" className="cr-label">Frecuencia de pago</label>
                  <div className="cr-field">
                    <FaClock className="cr-field-icon" style={{ fontSize:11 }}/>
                    <select
                      id="cr-frecuencia" name="frecuencia"
                      value={form.frecuencia} onChange={handleChange}
                      className="cr-input cr-select"
                    >
                      {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <FaChevronDown className="cr-select-arrow"/>
                  </div>
                </div>
                <div className="cr-field-group">
                  <label htmlFor="cr-tipo" className="cr-label">Método de pago</label>
                  <div className="cr-field">
                    <FaRedo className="cr-field-icon" style={{ fontSize:11 }}/>
                    <select
                      id="cr-tipo" name="tipo_prestamo"
                      value={form.tipo_prestamo} onChange={handleChange}
                      className="cr-input cr-select"
                    >
                      {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <FaChevronDown className="cr-select-arrow"/>
                  </div>
                </div>
              </div>

              {/* Fecha primer pago */}
              <div className="cr-field-group">
                <label htmlFor="cr-fecha" className="cr-label">Fecha del primer pago</label>
                <div className="cr-field">
                  <FaCalendarAlt className="cr-field-icon" style={{ fontSize:12 }}/>
                  <input
                    id="cr-fecha" type="date" name="fecha_inicio"
                    value={form.fecha_inicio} onChange={handleChange}
                    required className="cr-input"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="cr-field-group">
                <label htmlFor="cr-obs" className="cr-label">Observaciones</label>
                <div className="cr-field">
                  <FaInfoCircle className="cr-field-icon cr-textarea-icon"/>
                  <textarea
                    id="cr-obs" name="observaciones"
                    value={form.observaciones} onChange={handleChange}
                    rows={2} placeholder="Notas adicionales..."
                    className="cr-input cr-textarea"
                    aria-label="Observaciones adicionales"
                  />
                </div>
              </div>

              <div className="cr-divider" aria-hidden="true"/>

              <button
                type="submit"
                disabled={saving || planProyectado.length === 0}
                className="cr-btn-submit"
                aria-busy={saving}
              >
                {saving
                  ? <><span className="cr-spinner"/><span>Guardando crédito...</span></>
                  : <><FaSave size={14}/><span>Generar y Guardar Crédito</span></>
                }
              </button>

              {planProyectado.length === 0 && !saving && (
                <p style={{ fontSize:11.5, color:"#94a3b8", textAlign:"center", marginTop:-6 }}>
                  Completa todos los campos para habilitar el guardado
                </p>
              )}
            </form>
          </div>

          {/* ─────────────────────────────
              SIMULACIÓN
          ───────────────────────────── */}
          <div className="cr-card" style={{ minHeight:400 }}>
            <div className="cr-card-header">
              <div className="cr-card-icon" style={{ background:"linear-gradient(135deg,#059669,#047857)" }}>
                <FaChartLine color="#fff" size={15}/>
              </div>
              <div style={{ flex:1 }}>
                <p className="cr-brand" style={{ fontWeight:700, color:"#1e293b", fontSize:14, margin:0 }}>
                  Simulación en tiempo real
                </p>
                <p style={{ fontSize:12, color:"#94a3b8", marginTop:1 }}>
                  Se actualiza automáticamente
                </p>
              </div>
              {/* Loader en header */}
              {loadingSimulation && (
                <div style={{ display:"flex", alignItems:"flex-end", gap:3, marginLeft:"auto", paddingBottom:2 }}>
                  <div className="cr-dot"/>
                  <div className="cr-dot"/>
                  <div className="cr-dot"/>
                </div>
              )}
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column" }}>

              {/* ── CARGANDO ── */}
              {loadingSimulation && planProyectado.length === 0 && (
                <div className="cr-sim-empty">
                  <div style={{ display:"flex", gap:5 }}>
                    <div className="cr-dot"/>
                    <div className="cr-dot"/>
                    <div className="cr-dot"/>
                  </div>
                  <p style={{ color:"#94a3b8", fontSize:13, fontStyle:"italic" }}>Calculando cuotas...</p>
                </div>
              )}

              {/* ── ERROR DE SIMULACIÓN ── */}
              {simError && (
                <div className="cr-sim-empty">
                  <div className="cr-sim-empty-icon" style={{ borderColor:"#fecdd3", background:"#fff1f2" }}>
                    <FaInfoCircle size={24} color="#f87171"/>
                  </div>
                  <p className="cr-brand" style={{ fontWeight:700, color:"#ef4444", fontSize:14 }}>
                    Error en simulación
                  </p>
                  <p style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.5 }}>
                    Verifica los parámetros ingresados.
                  </p>
                </div>
              )}

              {/* ── PLAN PROYECTADO ── */}
              {!loadingSimulation && !simError && planProyectado.length > 0 && (
                <>
                  {/* Totales */}
                  <div style={{ padding:"16px 22px 0" }}>
                    <div className="cr-totals">
                      <div className="cr-total-chip" style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe" }}>
                        <span className="cr-total-label" style={{ color:"#93c5fd" }}>Capital</span>
                        <span className="cr-total-value" style={{ color:"#1d4ed8" }}>${fmt(totalCapital)}</span>
                      </div>
                      <div className="cr-total-chip" style={{ background:"#fff1f2", border:"1.5px solid #fecdd3" }}>
                        <span className="cr-total-label" style={{ color:"#fca5a5" }}>Intereses</span>
                        <span className="cr-total-value" style={{ color:"#ef4444" }}>${fmt(totalInteres)}</span>
                      </div>
                      <div className="cr-total-chip" style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0" }}>
                        <span className="cr-total-label" style={{ color:"#86efac" }}>Total</span>
                        <span className="cr-total-value" style={{ color:"#059669" }}>${fmt(totalPagar)}</span>
                      </div>
                    </div>
                  </div>

                  {/* TABLA DESKTOP */}
                  <div className="cr-table-desktop cr-table-wrap" style={{ margin:"0 22px 22px" }}>
                    <table className="cr-sim-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign:"left" }}>#</th>
                          <th style={{ textAlign:"left" }}>Fecha</th>
                          <th style={{ textAlign:"right" }}>Capital</th>
                          <th style={{ textAlign:"right" }}>Interés</th>
                          <th style={{ textAlign:"right" }}>Total cuota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planProyectado.map((cuota, i) => (
                          <tr key={i}>
                            <td><span className="cr-num-badge">{cuota.numero_cuota}</span></td>
                            <td style={{ fontSize:12, color:"#64748b" }}>{cuota.fecha_vencimiento}</td>
                            <td style={{ textAlign:"right", color:"#475569", fontWeight:500 }}>${fmt(cuota.capital)}</td>
                            <td style={{ textAlign:"right", color:"#ef4444", fontWeight:500 }}>${fmt(cuota.interes)}</td>
                            <td style={{ textAlign:"right" }}>
                              <span className="cr-cuota-total-badge">${fmt(cuota.monto_cuota)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TARJETAS MOBILE */}
                  <div className="cr-table-mobile">
                    {planProyectado.map((cuota, i) => (
                      <div key={i} className="cr-cuota-card">
                        <div className="cr-cuota-card-hdr">
                          <span className="cr-num-badge">{cuota.numero_cuota}</span>
                          <span style={{ fontSize:11.5, color:"#64748b", flex:1 }}>
                            📅 {cuota.fecha_vencimiento}
                          </span>
                          <span className="cr-cuota-total-badge">${fmt(cuota.monto_cuota)}</span>
                        </div>
                        <div className="cr-cuota-card-body">
                          <div>
                            <div className="cr-cuota-stat-lbl">Capital</div>
                            <div className="cr-cuota-stat-val" style={{ color:"#475569" }}>${fmt(cuota.capital)}</div>
                          </div>
                          <div>
                            <div className="cr-cuota-stat-lbl">Interés</div>
                            <div className="cr-cuota-stat-val" style={{ color:"#ef4444" }}>${fmt(cuota.interes)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── EMPTY STATE ── */}
              {!loadingSimulation && !simError && planProyectado.length === 0 && (
                <div className="cr-sim-empty">
                  <div className="cr-sim-empty-icon">
                    <FaChartLine size={24} color="#93c5fd"/>
                  </div>
                  <p className="cr-brand" style={{ fontWeight:700, color:"#64748b", fontSize:14 }}>
                    Sin simulación aún
                  </p>
                  <p style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.5, maxWidth:220 }}>
                    Completa monto, tasa, cuotas y fecha para ver la proyección automáticamente.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════
          TOAST
      ══════════════════════════════════ */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>
      )}

    </div>
  );
}
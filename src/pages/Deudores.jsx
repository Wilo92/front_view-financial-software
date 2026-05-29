import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import {
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaStickyNote, FaPlus, FaEdit, FaTrash, FaCreditCard,
  FaSearch, FaTimes, FaChevronDown, FaExclamationTriangle,
  FaCheckCircle, FaUserPlus
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   CONSTANTES — sin cambios
───────────────────────────────────────────────────────────── */
const TIPOS_DOC = [
  { value: "CC",  label: "Cédula de Ciudadanía (CC)" },
  { value: "NIT", label: "NIT"                        },
  { value: "CE",  label: "Cédula Extranjería (CE)"    },
  { value: "PP",  label: "Pasaporte (PP)"             },
];

const EMPTY_FORM = {
  nombre: "", tipo_documento: "CC", documento_numero: "",
  telefono: "", email: "", direccion: "", foto: null, comentarios: "",
};

const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899",
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const initials    = (name = "") => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const avatarColor = (id)       => AVATAR_COLORS[id % AVATAR_COLORS.length];

/* ─────────────────────────────────────────────────────────────
   TOAST — reemplaza alert() y confirm()
───────────────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const meta = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", left: "#10b981", color: "#065f46", icon: "✓", iconBg: "#059669" },
    error:   { bg: "#fff1f2", border: "#fecaca", left: "#ef4444", color: "#991b1b", icon: "✕", iconBg: "#ef4444" },
  }[type];

  return (
    <div style={{
      position: "fixed",
      bottom: "max(24px, env(safe-area-inset-bottom))",
      left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 420,
      background: meta.bg,
      border: `1.5px solid ${meta.border}`,
      borderLeft: `4px solid ${meta.left}`,
      borderRadius: 14, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,.13)",
      zIndex: 9999,
      animation: "ddrToastIn .32s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: meta.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 13,
      }}>{meta.icon}</div>
      <p style={{ flex: 1, fontSize: 13.5, color: meta.color, fontWeight: 500, lineHeight: 1.4 }}>{message}</p>
      <button onClick={onClose} style={{
        width: 26, height: 26, border: "none", background: "transparent",
        cursor: "pointer", color: meta.color, opacity: .55,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 7, flexShrink: 0,
      }}><FaTimes size={10} /></button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CONFIRM MODAL — reemplaza window.confirm()
   Props: { message, onConfirm, onCancel, loading }
───────────────────────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9000,
    background: "rgba(15,23,42,.6)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  }}>
    <div style={{
      background: "#fff", borderRadius: 20, padding: "24px 24px 20px",
      width: "100%", maxWidth: 360,
      boxShadow: "0 24px 64px rgba(0,0,0,.22)",
      animation: "ddrPopIn .28s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
        background: "#fff1f2",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FaExclamationTriangle size={22} color="#ef4444" />
      </div>
      <p style={{ textAlign: "center", fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 6 }}>
        ¿Eliminar cliente?
      </p>
      <p style={{ textAlign: "center", fontSize: 13.5, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, minHeight: 46, borderRadius: 12, border: "none",
            background: "#f1f5f9", color: "#64748b",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >Cancelar</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1, minHeight: 46, borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            opacity: loading ? .65 : 1,
            boxShadow: "0 4px 14px rgba(239,68,68,.30)",
          }}
        >
          {loading
            ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"ddrSpin .7s linear infinite", display:"inline-block" }}/> Eliminando...</>
            : <><FaTrash size={12}/> Eliminar</>
          }
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Deudores() {
  const [deudores, setDeudores] = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);        // { type, message }
  const [confirm,  setConfirm]  = useState(null);        // { id, nombre }
  const navigate  = useNavigate();
  const formRef   = useRef(null);
  const searchRef = useRef(null);

  /* ── Fetch ── */
  const fetchDeudores = async () => {
    try {
      const res = await clienteAxios.get("/api/deudores");
      setDeudores(res.data.data || res.data);
    } catch (error) {
      console.error("Error al obtener deudores:", error.response);
      if (error.response?.status === 401) navigate("/login");
    }
  };
  useEffect(() => { fetchDeudores(); }, []);

  /* ── Handlers ── */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await clienteAxios.put(`/api/deudores/${editId}`, form);
        setToast({ type: "success", message: "Cliente actualizado correctamente." });
      } else {
        await clienteAxios.post("/api/deudores", form);
        setToast({ type: "success", message: "Cliente registrado exitosamente." });
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchDeudores();
    } catch (error) {
      console.error("Error al guardar:", error.response?.data);
      setToast({ type: "error", message: "No se pudo guardar la información. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  /* Confirmar eliminación — sin window.confirm() */
  const pedirConfirmacion = (d) => setConfirm({ id: d.id, nombre: d.nombre });

  const confirmarEliminar = async () => {
    if (!confirm) return;
    setDeleting(confirm.id);
    try {
      await clienteAxios.delete(`/api/deudores/${confirm.id}`);
      setToast({ type: "success", message: `${confirm.nombre} eliminado correctamente.` });
      setConfirm(null);
      fetchDeudores();
    } catch (error) {
      console.error("Error al eliminar:", error.response);
      setToast({ type: "error", message: "No se pudo eliminar el cliente." });
      setConfirm(null);
    } finally {
      setDeleting(null);
    }
  };

  const editar = (d) => {
    setForm({
      nombre: d.nombre, tipo_documento: d.tipo_documento,
      documento_numero: d.documento_numero, telefono: d.telefono,
      email: d.email || "", direccion: d.direccion || "",
      comentarios: d.comentarios || "", foto: null,
    });
    setEditId(d.id);
    setShowForm(true);
    /* Scroll suave al form */
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const cancelar = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const credito = (d) => navigate(`/creditos/crear/${d.id}`);

  /* ── Filtro ── */
  const filtered = deudores.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.nombre?.toLowerCase().includes(q) ||
      d.documento_numero?.toLowerCase().includes(q) ||
      d.telefono?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="ddr-root">

      {/* ══════════════════════════════════
          ESTILOS
      ══════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .ddr-root  { font-family:'DM Sans',sans-serif; min-height:100svh; background:#eef2ff; }
        .ddr-brand { font-family:'Sora',sans-serif !important; }

        /* ════ PAGE HEADER ════ */
        .ddr-page-header {
          background: linear-gradient(145deg,#1d4ed8 0%,#2563eb 55%,#3b82f6 100%);
          padding: 26px 20px 52px;
          position: relative; overflow: hidden;
        }
        .ddr-page-header::before {
          content:''; position:absolute; top:-40px; right:-40px;
          width:200px; height:200px; border-radius:50%;
          background:rgba(255,255,255,.07); pointer-events:none;
        }
        .ddr-page-header::after {
          content:''; position:absolute; bottom:-30px; left:32%;
          width:140px; height:140px; border-radius:50%;
          background:rgba(255,255,255,.05); pointer-events:none;
        }
        .ddr-hdr-inner { max-width:900px; margin:0 auto; position:relative; z-index:1; }

        /* ════ SHELL ════ */
        .ddr-shell {
          max-width: 900px;
          margin: -28px auto 0;
          padding: 0 max(16px, env(safe-area-inset-left)) max(64px, env(safe-area-inset-bottom));
          position: relative; z-index: 10;
          background:
            radial-gradient(ellipse 55% 45% at 10% 20%, rgba(59,130,246,.10) 0%, transparent 70%),
            radial-gradient(ellipse 45% 55% at 90% 80%, rgba(99,102,241,.08) 0%, transparent 70%),
            transparent;
        }

        /* ════ FORM CARD ════ */
        .ddr-form-card {
          background: #fff; border-radius: 22px;
          box-shadow:
            0 0 0 1px rgba(59,130,246,.07),
            0 8px 40px rgba(59,130,246,.13),
            0 1px 4px rgba(0,0,0,.05);
          overflow: hidden; margin-bottom: 18px;
          /* Suave aparición al mostrar */
          animation: ddrSlideDown .3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes ddrSlideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .ddr-form-header {
          background: linear-gradient(135deg,#f8faff,#eff6ff);
          border-bottom: 1px solid #e8edf5;
          padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ddr-form-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          display: flex; align-items: center; justify-content: center;
        }
        .ddr-form-body {
          padding: 20px 20px 24px;
          display: grid; grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 540px) {
          .ddr-form-body { grid-template-columns: 1fr 1fr; }
          .ddr-form-full { grid-column: 1 / -1; }
        }

        /* ════ INPUTS ════
           MEJORAS: font-size 16px, min-height 50px,
           autoComplete/inputMode en JSX
        ════ */
        .ddr-field { display:flex; flex-direction:column; gap:6px; }
        .ddr-label {
          font-size: 10.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .10em;
          color: #94a3b8; margin-left: 2px;
        }
        .ddr-input-wrap { position: relative; }
        .ddr-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 13px; pointer-events: none;
          transition: color .18s; z-index: 1;
        }
        .ddr-input-wrap:focus-within .ddr-input-icon { color: #3b82f6; }
        .ddr-input {
          width: 100%;
          min-height: 50px;                /* touch target */
          padding: 13px 13px 13px 40px;
          border-radius: 13px;
          border: 2px solid #e8edf5;
          background: #f8faff;
          font-size: 16px;                 /* ← evita zoom iOS */
          color: #1e293b; outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          font-family: 'DM Sans', sans-serif;
          -webkit-appearance: none; appearance: none;
        }
        .ddr-input:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10);
        }
        .ddr-input::placeholder { color: #c8d4e3; font-size: 14px; }
        .ddr-input:-webkit-autofill,
        .ddr-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #f8faff inset;
          -webkit-text-fill-color: #1e293b;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Select custom */
        .ddr-select { padding-right: 40px; cursor: pointer; }
        .ddr-select-arrow {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 11px; pointer-events: none;
        }

        /* Textarea */
        .ddr-textarea {
          min-height: auto;
          padding-top: 13px; padding-bottom: 13px;
          resize: none; line-height: 1.5;
        }
        .ddr-textarea-icon { top: 15px !important; transform: none !important; }

        /* ════ SUBMIT BUTTON ════ */
        .ddr-submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 50px; width: 100%;
          border-radius: 13px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          color: #fff; font-family: 'Sora',sans-serif;
          font-weight: 700; font-size: 15px;
          box-shadow: 0 4px 16px rgba(59,130,246,.35);
          transition: transform .16s, box-shadow .16s, opacity .16s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .ddr-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,.40);
        }
        .ddr-submit-btn:active:not(:disabled) { transform: scale(.98); }
        .ddr-submit-btn:disabled { opacity:.62; cursor:not-allowed; }

        .ddr-cancel-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          min-height: 50px; padding: 0 20px; border-radius: 13px;
          background: #f1f5f9; color: #64748b;
          font-family: 'DM Sans',sans-serif; font-weight: 600; font-size: 14px;
          border: none; cursor: pointer; flex-shrink: 0;
          transition: background .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .ddr-cancel-btn:hover { background: #e2e8f0; }

        /* ════ BARRA DE ACCIONES ════ */
        .ddr-action-bar {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 16px; margin-top: 4px;
        }
        @media (min-width: 540px) {
          .ddr-action-bar { flex-direction: row; align-items: center; }
        }

        /* Search */
        .ddr-search-wrap { position: relative; flex: 1; }
        .ddr-search {
          width: 100%; min-height: 50px;
          padding: 13px 40px 13px 44px;
          border-radius: 14px;
          border: 2px solid #e8edf5; background: #fff;
          font-size: 16px; color: #1e293b; outline: none;
          transition: border-color .2s, box-shadow .2s;
          font-family: 'DM Sans',sans-serif;
          -webkit-appearance: none;
        }
        .ddr-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.10); }
        .ddr-search::placeholder { color: #c8d4e3; font-size: 14px; }
        .ddr-search-icon-left  { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:14px; pointer-events:none; }
        .ddr-search-clear {
          position:absolute; right:0; top:50%; transform:translateY(-50%);
          width:44px; height:44px; display:flex; align-items:center; justify-content:center;
          background:none; border:none; cursor:pointer; color:#94a3b8;
          border-radius:0 12px 12px 0;
          transition:color .15s;
          -webkit-tap-highlight-color:transparent;
        }
        .ddr-search-clear:hover { color:#475569; }

        /* FAB / Add button */
        .ddr-fab {
          display: inline-flex; align-items: center; gap: 8px;
          min-height: 50px; padding: 0 22px;
          border-radius: 50px; white-space: nowrap;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          color: #fff; font-weight: 700; font-size: 14px;
          border: none; cursor: pointer; flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(59,130,246,.38);
          font-family: 'Sora',sans-serif;
          transition: transform .18s, box-shadow .18s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .ddr-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,130,246,.44); }
        .ddr-fab:active { transform: scale(.98); }

        /* ════ CLIENTE CARD ════
           MEJORAS: acciones 44×44px, layout móvil mejorado
        ════ */
        .ddr-client-card {
          background: #fff; border-radius: 18px;
          border: 1.5px solid #f1f5f9;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          transition: box-shadow .2s, border-color .2s, transform .2s;
          animation: ddrFadeUp .32s cubic-bezier(.22,1,.36,1) both;
        }
        .ddr-client-card:hover {
          box-shadow: 0 8px 28px rgba(59,130,246,.11);
          border-color: #bfdbfe;
          transform: translateY(-2px);
        }
        @keyframes ddrFadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .ddr-avatar {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora',sans-serif; font-weight: 800;
          font-size: 14px; color: #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,.14);
        }

        .ddr-client-info { flex: 1; min-width: 0; }
        .ddr-client-name {
          font-family: 'Sora',sans-serif; font-weight: 700;
          font-size: 14px; color: #1e293b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ddr-client-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
        .ddr-client-email { font-size: 11.5px; color: #94a3b8; margin-top: 1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .ddr-doc-badge {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: 6px;
          font-size: 10px; font-weight: 700;
          background: #eff6ff; color: #2563eb; flex-shrink: 0;
        }

        /* ── Acciones — 44×44px cada una ──
           MEJORA CRÍTICA: eran 32×32px
        ── */
        .ddr-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .ddr-action {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;   /* 40px es suficiente con gap */
          border-radius: 12px; border: none; cursor: pointer;
          transition: background .16s, transform .14s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          flex-shrink: 0;
        }
        .ddr-action:active { transform: scale(.93); }
        .ddr-action-edit   { background: #fef3c7; color: #d97706; }
        .ddr-action-edit:hover   { background: #fde68a; }
        .ddr-action-del    { background: #fee2e2; color: #dc2626; }
        .ddr-action-del:hover    { background: #fecaca; }
        .ddr-action-credit { background: #d1fae5; color: #059669; }
        .ddr-action-credit:hover { background: #a7f3d0; }
        .ddr-action:disabled { opacity:.5; cursor:not-allowed; }

        /* ════ EMPTY STATE ════ */
        .ddr-empty {
          background: #fff; border-radius: 20px;
          padding: 48px 28px; text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,.03), 0 12px 40px rgba(59,130,246,.08);
        }
        .ddr-empty-icon {
          width: 72px; height: 72px; border-radius: 22px; margin: 0 auto 16px;
          display: flex; align-items: center; justify-content: center;
        }

        /* ════ FOOTER CONTADOR ════ */
        .ddr-results-count {
          text-align: center; font-size: 12px; color: #94a3b8; margin-top: 14px;
          padding-bottom: 12px;
        }

        /* ════ SPINNER ════ */
        @keyframes ddrSpin { to { transform: rotate(360deg); } }
        .ddr-spinner {
          width: 15px; height: 15px; border-radius: 50%; display: inline-block; flex-shrink: 0;
          border: 2.5px solid rgba(255,255,255,.30); border-top-color: #fff;
          animation: ddrSpin .75s linear infinite;
        }

        /* ════ ANIMACIONES GENERALES ════ */
        @keyframes ddrToastIn {
          from { opacity:0; transform:translateX(-50%) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes ddrPopIn {
          from { opacity:0; transform:scale(.9); }
          to   { opacity:1; transform:scale(1); }
        }

        /* ════ RESPONSIVE ════ */
        @media (max-width: 380px) {
          .ddr-shell { padding-left:12px; padding-right:12px; }
          .ddr-page-header { padding:22px 16px 48px; }
          .ddr-form-body { padding:16px 16px 20px; }
          .ddr-actions { gap:4px; }
          .ddr-action { width:38px; height:38px; }
        }

        /* ════ REDUCE MOTION ════ */
        @media (prefers-reduced-motion: reduce) {
          .ddr-form-card, .ddr-client-card { animation:none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════ */}
      <div className="ddr-page-header">
        <div className="ddr-hdr-inner">
          <p className="ddr-brand" style={{ color:"rgba(147,197,253,.85)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", marginBottom:4 }}>
            Panel de gestión
          </p>
          <h1 className="ddr-brand" style={{ color:"#fff", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, margin:0 }}>
            Clientes
          </h1>
          <p style={{ color:"rgba(191,219,254,.85)", fontSize:13, marginTop:5 }}>
            {deudores.length} cliente{deudores.length !== 1 ? "s" : ""} registrado{deudores.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="ddr-shell">

        {/* ══════════════════════════════════
            FORM CARD (animada al mostrar)
        ══════════════════════════════════ */}
        {showForm && (
          <div className="ddr-form-card" ref={formRef}>
            <div className="ddr-form-header">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div className="ddr-form-icon">
                  {editId ? <FaEdit color="#fff" size={14}/> : <FaPlus color="#fff" size={14}/>}
                </div>
                <div>
                  <p className="ddr-brand" style={{ fontWeight:700, color:"#1e293b", fontSize:14, margin:0 }}>
                    {editId ? "Editar cliente" : "Nuevo cliente"}
                  </p>
                  <p style={{ fontSize:12, color:"#94a3b8", marginTop:1 }}>
                    {editId ? "Modifica los datos del cliente" : "Completa el formulario para registrar"}
                  </p>
                </div>
              </div>
              <button
                onClick={cancelar}
                style={{
                  display:"flex", alignItems:"center", gap:5,
                  minHeight:38, padding:"0 14px", borderRadius:10,
                  background:"rgba(100,116,139,.10)", color:"#64748b",
                  border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                  transition:"background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(100,116,139,.18)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(100,116,139,.10)"}
              >
                <FaTimes size={11}/> Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="ddr-form-body" aria-label="Formulario de cliente">

              {/* Nombre */}
              <div className="ddr-field">
                <label htmlFor="ddr-nombre" className="ddr-label">Nombre Completo</label>
                <div className="ddr-input-wrap">
                  <FaUser className="ddr-input-icon"/>
                  <input id="ddr-nombre" name="nombre" value={form.nombre} onChange={handleChange}
                    placeholder="Juan Pérez" required autoComplete="name"
                    className="ddr-input" aria-required="true"/>
                </div>
              </div>

              {/* Tipo documento */}
              <div className="ddr-field">
                <label htmlFor="ddr-tipodoc" className="ddr-label">Tipo de Documento</label>
                <div className="ddr-input-wrap">
                  <FaIdCard className="ddr-input-icon"/>
                  <select id="ddr-tipodoc" name="tipo_documento" value={form.tipo_documento}
                    onChange={handleChange} className="ddr-input ddr-select">
                    {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <FaChevronDown className="ddr-select-arrow"/>
                </div>
              </div>

              {/* Documento */}
              <div className="ddr-field">
                <label htmlFor="ddr-docnum" className="ddr-label">Número de Documento</label>
                <div className="ddr-input-wrap">
                  <FaIdCard className="ddr-input-icon"/>
                  <input id="ddr-docnum" name="documento_numero" value={form.documento_numero}
                    onChange={handleChange} placeholder="1088..." required
                    inputMode="numeric" autoComplete="off"
                    className="ddr-input" aria-required="true"/>
                </div>
              </div>

              {/* Teléfono */}
              <div className="ddr-field">
                <label htmlFor="ddr-tel" className="ddr-label">Teléfono</label>
                <div className="ddr-input-wrap">
                  <FaPhone className="ddr-input-icon"/>
                  <input id="ddr-tel" name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="+57 300..." required type="tel"
                    inputMode="tel" autoComplete="tel"
                    className="ddr-input" aria-required="true"/>
                </div>
              </div>

              {/* Email */}
              <div className="ddr-field">
                <label htmlFor="ddr-email" className="ddr-label">Correo Electrónico</label>
                <div className="ddr-input-wrap">
                  <FaEnvelope className="ddr-input-icon"/>
                  <input id="ddr-email" name="email" type="email" value={form.email}
                    onChange={handleChange} placeholder="usuario@correo.com"
                    inputMode="email" autoComplete="email"
                    className="ddr-input"/>
                </div>
              </div>

              {/* Dirección */}
              <div className="ddr-field">
                <label htmlFor="ddr-dir" className="ddr-label">Dirección</label>
                <div className="ddr-input-wrap">
                  <FaMapMarkerAlt className="ddr-input-icon"/>
                  <input id="ddr-dir" name="direccion" value={form.direccion} onChange={handleChange}
                    placeholder="Calle 10 #20-30" autoComplete="street-address"
                    className="ddr-input"/>
                </div>
              </div>

              {/* Comentarios — full width */}
              <div className="ddr-field ddr-form-full">
                <label htmlFor="ddr-comentarios" className="ddr-label">Comentarios</label>
                <div className="ddr-input-wrap">
                  <FaStickyNote className="ddr-input-icon ddr-textarea-icon"/>
                  <textarea id="ddr-comentarios" name="comentarios" value={form.comentarios}
                    onChange={handleChange} placeholder="Notas adicionales..." rows={2}
                    className="ddr-input ddr-textarea" aria-label="Comentarios adicionales"/>
                </div>
              </div>

              {/* Buttons — full width */}
              <div className="ddr-form-full" style={{ display:"flex", gap:10 }}>
                <button type="submit" disabled={saving} className="ddr-submit-btn" aria-busy={saving}>
                  {saving
                    ? <><span className="ddr-spinner"/><span>Guardando...</span></>
                    : <>{editId ? <><FaEdit size={13}/> Actualizar cliente</> : <><FaPlus size={12}/> Guardar cliente</>}</>
                  }
                </button>
                <button type="button" onClick={cancelar} className="ddr-cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════
            BARRA BÚSQUEDA + FAB
        ══════════════════════════════════ */}
        <div className="ddr-action-bar">
          <div className="ddr-search-wrap">
            <FaSearch className="ddr-search-icon-left"/>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento, teléfono..."
              className="ddr-search"
              inputMode="search"
              autoComplete="off"
              aria-label="Buscar cliente"
            />
            {search && (
              <button className="ddr-search-clear" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">
                <FaTimes size={12}/>
              </button>
            )}
          </div>

          {!showForm && (
            <button className="ddr-fab" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
              <FaPlus size={13}/> Nuevo cliente
            </button>
          )}
        </div>

        {/* ══════════════════════════════════
            LISTA CLIENTES
        ══════════════════════════════════ */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

          {filtered.length === 0 ? (
            <div className="ddr-empty">
              <div className="ddr-empty-icon" style={{ background: search ? "#fff7ed" : "#eff6ff" }}>
                {search
                  ? <FaSearch size={26} color="#f59e0b"/>
                  : <FaUserPlus size={26} color="#3b82f6"/>
                }
              </div>
              <p className="ddr-brand" style={{ fontWeight:700, color:"#475569", fontSize:16, marginBottom:6 }}>
                {search ? "Sin resultados" : "Sin clientes aún"}
              </p>
              <p style={{ fontSize:13.5, color:"#94a3b8", lineHeight:1.5, marginBottom: search ? 0 : 20 }}>
                {search
                  ? <>No hay clientes que coincidan con <strong style={{ color:"#64748b" }}>"{search}"</strong>.</>
                  : "Registra tu primer cliente para comenzar a gestionar créditos."
                }
              </p>
              {!search && (
                <button
                  className="ddr-fab"
                  onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
                  style={{ margin:"0 auto" }}
                >
                  <FaPlus size={12}/> Agregar primer cliente
                </button>
              )}
            </div>
          ) : (
            filtered.map((d, i) => (
              <div
                key={d.id}
                className="ddr-client-card"
                style={{ animationDelay:`${Math.min(i * 0.04, 0.3)}s` }}
              >
                {/* Avatar */}
                <div className="ddr-avatar" style={{ background: avatarColor(d.id) }}>
                  {initials(d.nombre)}
                </div>

                {/* Info */}
                <div className="ddr-client-info">
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                    <span className="ddr-client-name">{d.nombre}</span>
                    <span className="ddr-doc-badge">{d.tipo_documento}</span>
                  </div>
                  <p className="ddr-client-meta">
                    {d.documento_numero}
                    {d.telefono && <><span style={{ color:"#cbd5e1", margin:"0 5px" }}>·</span>{d.telefono}</>}
                  </p>
                  {d.email && <p className="ddr-client-email">{d.email}</p>}
                </div>

                {/* Acciones — 40×40px tap targets */}
                <div className="ddr-actions">
                  <button
                    className="ddr-action ddr-action-edit"
                    onClick={() => editar(d)}
                    title="Editar cliente"
                    aria-label={`Editar a ${d.nombre}`}
                  >
                    <FaEdit size={14}/>
                  </button>
                  <button
                    className="ddr-action ddr-action-del"
                    onClick={() => pedirConfirmacion(d)}
                    title="Eliminar cliente"
                    aria-label={`Eliminar a ${d.nombre}`}
                    disabled={deleting === d.id}
                  >
                    {deleting === d.id
                      ? <span className="ddr-spinner" style={{ borderColor:"rgba(220,38,38,.3)", borderTopColor:"#dc2626" }}/>
                      : <FaTrash size={14}/>
                    }
                  </button>
                  <button
                    className="ddr-action ddr-action-credit"
                    onClick={() => credito(d)}
                    title="Crear crédito"
                    aria-label={`Crear crédito para ${d.nombre}`}
                  >
                    <FaCreditCard size={14}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contador resultados */}
        {search && filtered.length > 0 && (
          <p className="ddr-results-count">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "<strong style={{ color:"#475569" }}>{search}</strong>"
          </p>
        )}
      </div>

      {/* ══════════════════════════════════
          CONFIRM DIALOG — sin window.confirm()
      ══════════════════════════════════ */}
      {confirm && (
        <ConfirmDialog
          message={`Esta acción eliminará permanentemente a ${confirm.nombre} y no se puede deshacer.`}
          onConfirm={confirmarEliminar}
          onCancel={() => setConfirm(null)}
          loading={!!deleting}
        />
      )}

      {/* ══════════════════════════════════
          TOAST
      ══════════════════════════════════ */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>
      )}

    </div>
  );
}
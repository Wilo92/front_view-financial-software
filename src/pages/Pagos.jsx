import { useState, useEffect, useRef } from "react";
import clienteAxios from "../api/axios";
import {
  FaSearch, FaIdCard, FaMoneyBillWave,
  FaCreditCard, FaCalendarAlt, FaCheckCircle, FaTimes,
  FaExclamationTriangle, FaHashtag,
  FaUniversity, FaHandHoldingUsd, FaChevronRight,
  FaLock, FaInfoCircle
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   HELPERS — sin cambios de lógica
───────────────────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("es-CO");

const ESTADO_STYLE = {
  pendiente: { bg: "#fff7ed", color: "#f59e0b", dot: "#f59e0b", label: "Pendiente" },
  pagada: { bg: "#f0fdf4", color: "#10b981", dot: "#10b981", label: "Pagada" },
  vencido: { bg: "#fff1f2", color: "#ef4444", dot: "#ef4444", label: "Vencido" },
  parcial: { bg: "#eff6ff", color: "#3b82f6", dot: "#3b82f6", label: "Parcial" },
};

const METODOS = [
  { value: "efectivo", label: "Efectivo", icon: FaMoneyBillWave },
  { value: "transferencia", label: "Transferencia", icon: FaUniversity },
  { value: "consignacion", label: "Consignación", icon: FaHandHoldingUsd },
];

const TIPO_LABEL = {
  cuota_fija: "Cuotas Fijas",
  abono_capital: "Abono Capital",
  solo_intereses: "Solo Intereses",
  interes_simple: "Interés Simple",
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

/* ─────────────────────────────────────────────────────────────
   TOAST — reemplaza alert() nativo
   Props: { type: "success"|"error"|"warning", message, onClose }
───────────────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  const meta = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#065f46", icon: "✓", iconBg: "#059669" },
    error: { bg: "#fff1f2", border: "#fecaca", color: "#991b1b", icon: "✕", iconBg: "#ef4444" },
    warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "!", iconBg: "#f59e0b" },
  }[type] || {};

  return (
    <div style={{
      position: "fixed", bottom: "max(24px, env(safe-area-inset-bottom))",
      left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 420,
      background: meta.bg, border: `1.5px solid ${meta.border}`,
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      zIndex: 9999,
      animation: "pgToastIn .32s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: meta.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 14,
      }}>{meta.icon}</div>
      <p style={{ flex: 1, fontSize: 13.5, color: meta.color, fontWeight: 500, lineHeight: 1.4 }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent",
          cursor: "pointer", color: meta.color, opacity: .6, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      ><FaTimes size={11} /></button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Pagos() {
  const [deudor, setDeudor] = useState(null);
  const [documento, setDocumento] = useState("");
  const [creditos, setCreditos] = useState([]);
  const [buscado, setBuscado] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [creditoModal, setCreditoModal] = useState(null);
  const [toast, setToast] = useState(null); // { type, message }
  const [expandidos, setExpandidos] = useState({});   // creditoId -> bool (mobile accordion)
  const [formPago, setFormPago] = useState({
    monto: "", metodo_pago: "efectivo", referencia: "", notas: "",
  });

  const searchRef = useRef(null);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  /* ── Auto-focus al abrir modal ── */
  useEffect(() => {
    if (modalAbierto && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [modalAbierto]);

  /* ── Cerrar modal con Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && modalAbierto) setModalAbierto(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalAbierto]);

  /* ── Bloquear scroll del body cuando modal está abierto ── */
  useEffect(() => {
    document.body.style.overflow = modalAbierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalAbierto]);

  /* ── Buscar ── */
  const handleBuscar = async () => {
    if (!documento.trim()) return;
    setBuscando(true);
    try {
      setDeudor(null); setBuscado(false); setCreditos([]); setExpandidos({});
      const res = await clienteAxios.get(`/api/cuotas/pendientes/${documento}`);
      setDeudor(res.data.deudor);
      setCreditos(res.data.creditos);
      setBuscado(true);
      // Auto-expandir el primer crédito
      if (res.data.creditos?.length) {
        setExpandidos({ [res.data.creditos[0].id]: true });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCreditos([]); setDeudor(null); setBuscado(true);
      } else {
        setToast({ type: "error", message: "Error al consultar. Verifica tu conexión." });
      }
    } finally {
      setBuscando(false);
    }
  };

  /* ── Registrar pago — usa Toast en lugar de alert() ── */
  const registrarPago = async () => {
    setLoading(true);
    try {
      const datos = {
        cuota_id: cuotaSeleccionada.id,
        monto: formPago.monto,
        metodo_pago: formPago.metodo_pago,
        referencia: formPago.referencia,
        notas: formPago.notas,
      };
      const respuesta = await clienteAxios.post("/api/pagos", datos);
      setModalAbierto(false);
      setToast({ type: "success", message: respuesta.data.mensaje || "Pago registrado exitosamente." });
      handleBuscar();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al procesar el pago. Intenta de nuevo.";
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const formatMontoPago = (valor) => {
    if (!valor) return "";
    return Number(valor).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const abrirModal = (cuota, credito) => {
    setCuotaSeleccionada(cuota);
    setCreditoModal(credito);
    setFormPago({
      monto: cuota.monto_cuota - (cuota.total_pagado ?? 0),
      metodo_pago: "efectivo",
      referencia: "",
      notas: "",
    });
    setModalAbierto(true);
  };

  const toggleExpand = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const puedeConfirmar = formPago.metodo_pago === "efectivo" || !!formPago.referencia;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="pg-root">

      {/* ══════════════════════════════════════════════
          ESTILOS
      ══════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .pg-root  { font-family:'DM Sans',sans-serif; min-height:100svh; background:#eef2ff; }
        .pg-brand { font-family:'Sora',sans-serif !important; }

        /* ════════════════════ PAGE HEADER ════════════════════ */
        .pg-page-header {
          background: linear-gradient(145deg,#1d4ed8 0%,#2563eb 55%,#3b82f6 100%);
          padding: 28px 20px 56px;
          position: relative; overflow: hidden;
        }
        .pg-page-header::before {
          content:''; position:absolute; top:-50px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          background:rgba(255,255,255,.07); pointer-events:none;
        }
        .pg-page-header::after {
          content:''; position:absolute; bottom:-30px; left:35%;
          width:140px; height:140px; border-radius:50%;
          background:rgba(255,255,255,.05); pointer-events:none;
        }
        .pg-header-inner {
          max-width:960px; margin:0 auto; position:relative; z-index:1;
        }

        /* ════════════════════ SHELL ════════════════════ */
        .pg-shell {
          max-width: 960px;
          margin: -32px auto 0;
          padding: 0 max(16px, env(safe-area-inset-left)) max(48px, env(safe-area-inset-bottom));
          position: relative; z-index: 10;
        }

        /* ════════════════════ BUSCADOR ════════════════════
           MEJORAS:
           · min-height: 56px (touch target)
           · font-size: 16px en input (no-zoom iOS)
           · inputMode="numeric" en JSX
        ═══════════════════════════════════════════════ */
        .pg-search-bar {
          display: flex; gap: 10px; align-items: center;
          background: #fff; border-radius: 18px;
          padding: 6px 6px 6px 18px;
          box-shadow:
            0 0 0 1px rgba(59,130,246,.07),
            0 8px 32px rgba(59,130,246,.11),
            0 1px 4px rgba(0,0,0,.04);
          margin-bottom: 18px;
          min-height: 56px;
        }
        .pg-search-icon { color:#94a3b8; font-size:15px; flex-shrink:0; }
        .pg-search-input {
          flex: 1; border: none; outline: none;
          font-size: 16px;             /* ← evita zoom iOS */
          color: #1e293b;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          min-width: 0;
          -webkit-appearance: none;
        }
        .pg-search-input::placeholder { color:#c0cdd8; font-size:14px; }
        .pg-search-btn {
          display: flex; align-items: center; gap: 7px;
          min-height: 44px;            /* touch target */
          padding: 0 20px;
          border-radius: 13px;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          color: #fff; font-weight: 700; font-size: 13.5px;
          border: none; cursor: pointer; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(59,130,246,.35);
          transition: transform .15s, box-shadow .15s;
          font-family: 'Sora', sans-serif;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .pg-search-btn:hover:not(:disabled) {
          transform: translateY(-1px); box-shadow: 0 7px 18px rgba(59,130,246,.40);
        }
        .pg-search-btn:active:not(:disabled) { transform: translateY(0); }
        .pg-search-btn:disabled { opacity:.65; cursor:not-allowed; }

        /* ════════════════════ DEUDOR BANNER ════════════════════ */
        .pg-deudor {
          background: linear-gradient(135deg,#eff6ff,#f5f3ff);
          border: 1.5px solid #bfdbfe; border-radius: 18px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 18px;
        }
        .pg-avatar {
          width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg,#3b82f6,#6366f1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: 15px; color: #fff;
          box-shadow: 0 4px 12px rgba(59,130,246,.30);
        }
        .pg-creditos-badge {
          padding: 4px 12px; border-radius: 100px; flex-shrink: 0;
          background: linear-gradient(135deg,#059669,#047857);
          color: #fff; font-size: 11px; font-weight: 700;
        }

        /* ════════════════════ CARD CRÉDITO ════════════════════ */
        .pg-card {
          background: #fff; border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(59,130,246,.06),
            0 4px 6px rgba(0,0,0,.03),
            0 12px 40px rgba(59,130,246,.09);
          overflow: hidden; margin-bottom: 18px;
        }

        /* Header del crédito */
        .pg-credito-header {
          background: linear-gradient(145deg,#1e3a8a,#1d4ed8);
          padding: 14px 18px;
          display: flex; flex-wrap: wrap; gap: 10px 20px;
          align-items: center; cursor: pointer;
          /* touch target mínimo */
          min-height: 60px;
          -webkit-tap-highlight-color: transparent;
        }
        .pg-credito-stat { display:flex; flex-direction:column; gap:2px; }
        .pg-credito-stat-label {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .10em; color: rgba(255,255,255,.50);
        }
        .pg-credito-stat-val {
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 13px; color: #fff;
        }
        .pg-expand-icon {
          margin-left: auto; flex-shrink: 0;
          color: rgba(255,255,255,.6);
          transition: transform .25s cubic-bezier(.22,1,.36,1);
        }
        .pg-expand-icon.open { transform: rotate(90deg); }

        /* ════════════════════════════════════════════
           TABLA DE CUOTAS — DESKTOP
           9 columnas. Visible en ≥768px.
        ═════════════════════════════════════════════*/
        .pg-table-desktop {
          display: none;
        }
        @media (min-width: 768px) {
          .pg-table-desktop { display: block; }
          .pg-table-mobile  { display: none !important; }
        }

        .pg-col-head {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 1fr 1fr 1fr 110px 80px 120px;
          gap: 6px;
          padding: 10px 18px 8px;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .08em; color: #94a3b8;
          border-bottom: 2px solid #f1f5f9;
          background: #fafbff;
        }
        .pg-cuota-row {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 1fr 1fr 1fr 110px 80px 120px;
          align-items: center; gap: 6px;
          padding: 12px 18px;
          border-bottom: 1px solid #f1f5f9;
          transition: background .14s;
          font-size: 13px;
        }
        .pg-cuota-row:last-child { border-bottom: none; }
        .pg-cuota-row:hover { background: #f8faff; }

        .pg-num-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 8px;
          background: #eff6ff; color: #3b82f6;
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 11px;
        }
        .pg-estado-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 7px;
          font-size: 10.5px; font-weight: 700;
        }
        .pg-estado-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }

        /* ── Botón pagar (desktop) ──
           MEJORA: min-height 36px, padding horizontal correcto */
        .pg-pay-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 10px;
          font-weight: 700; font-size: 12px;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: transform .14s, box-shadow .14s, opacity .14s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          white-space: nowrap;
        }
        .pg-pay-btn:not(:disabled):hover { transform: translateY(-1px); }
        .pg-pay-btn:not(:disabled):active { transform: translateY(0) scale(.98); }
        .pg-pay-btn:disabled { cursor: not-allowed; pointer-events: none; }

        /* ════════════════════════════════════════════
           TABLA MOBILE — tarjetas apiladas
           Visible en <768px.
           MEJORA CRÍTICA: reemplaza la tabla de scroll
           horizontal que era casi ilegible en teléfono.
        ═════════════════════════════════════════════*/
        .pg-table-mobile {
          padding: 8px 14px 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        /* Tarjeta de cuota para móvil */
        .pg-cuota-card {
          border: 1.5px solid #e8edf5; border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }
        .pg-cuota-card-header {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px;
          background: #fafbff; border-bottom: 1px solid #f1f5f9;
        }
        .pg-cuota-card-body {
          padding: 12px 14px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .pg-cuota-card-stat { display: flex; flex-direction: column; gap: 2px; }
        .pg-cuota-card-stat-label {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .08em; color: #94a3b8;
        }
        .pg-cuota-card-stat-val {
          font-size: 14px; font-weight: 700; color: #1e293b;
        }
        .pg-cuota-card-footer {
          padding: 10px 14px;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        /* Botón pagar mobile — touch target correcto */
        .pg-pay-btn-mobile {
          display: inline-flex; align-items: center; gap: 6px;
          min-height: 44px;            /* touch target */
          padding: 0 18px;
          border-radius: 12px;
          font-weight: 700; font-size: 13.5px;
          border: none; cursor: pointer;
          font-family: 'Sora', sans-serif;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: transform .14s, box-shadow .14s;
          flex-shrink: 0;
        }
        .pg-pay-btn-mobile:not(:disabled):active { transform: scale(.97); }
        .pg-pay-btn-mobile:disabled { cursor: not-allowed; pointer-events: none; }

        /* Bloqueada hint */
        .pg-locked-hint {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; color: #94a3b8; font-weight: 500;
        }

        /* ════════════════════ EMPTY STATE ════════════════════ */
        .pg-empty {
          background: #fff; border-radius: 20px;
          padding: 40px 24px; text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,.03), 0 12px 40px rgba(59,130,246,.08);
        }
        .pg-empty-icon {
          width: 60px; height: 60px; border-radius: 18px; margin: 0 auto 14px;
          display: flex; align-items: center; justify-content: center;
        }

        /* ════════════════════ MODAL ════════════════════
           MEJORAS:
           · overflow-y:auto + max-height:90svh → scroll propio, no del body
           · padding-bottom con safe-area
           · X button 44×44px
           · inputs font-size 16px
        ═══════════════════════════════════════════════ */
        .pg-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-end;        /* bottom sheet en móvil */
          justify-content: center;
          z-index: 900;
          padding: 0;
        }
        @media (min-width: 540px) {
          .pg-modal-overlay {
            align-items: center;        /* centrado en tablet/desktop */
            padding: 16px;
          }
          .pg-modal { border-radius: 24px !important; }
        }

        @keyframes pgModalIn {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pgModalInCenter {
          from { opacity:0; transform:scale(.93) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .pg-modal {
          background: #fff;
          border-radius: 24px 24px 0 0;  /* bottom sheet radius en móvil */
          width: 100%; max-width: 460px;
          max-height: 90svh;
          overflow-y: auto;
          overscroll-behavior: contain;
          box-shadow: 0 -4px 32px rgba(0,0,0,.18), 0 24px 64px rgba(0,0,0,.25);
          animation: pgModalIn .3s cubic-bezier(.22,1,.36,1);
        }
        /* Handle pill — bottom sheet UX */
        .pg-modal-handle {
          width: 40px; height: 4px; border-radius: 99px;
          background: rgba(255,255,255,.35);
          margin: 10px auto 0;
        }
        @media (min-width: 540px) {
          .pg-modal-handle { display: none; }
          .pg-modal { animation: pgModalInCenter .28s cubic-bezier(.22,1,.36,1); }
        }

        .pg-modal-header {
          background: linear-gradient(135deg,#1d4ed8,#3b82f6);
          padding: 12px 20px 20px;
          display: flex; align-items: flex-start; justify-content: space-between;
          position: sticky; top: 0; z-index: 1; /* sticky header dentro del modal */
        }
        /* X button — 44×44px touch target */
        .pg-modal-close {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,.15); border: none;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
          transition: background .15s;
          margin-top: -4px; margin-right: -8px;
        }
        .pg-modal-close:hover  { background: rgba(255,255,255,.25); }
        .pg-modal-close:active { background: rgba(255,255,255,.35); }

        /* Modal body */
        .pg-modal-body {
          padding: 20px 20px 8px;
        }
        .pg-modal-footer {
          padding: 4px 20px max(20px, env(safe-area-inset-bottom));
          display: flex; gap: 10px;
          position: sticky; bottom: 0;
          background: #fff;
          border-top: 1px solid #f1f5f9;
        }

        /* ── Modal inputs ──
           font-size 16px → evita zoom iOS
           min-height 50px → touch target */
        .pg-m-label {
          display: block;
          font-size: 10.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .10em; color: #94a3b8; margin-bottom: 6px;
        }
        .pg-m-input {
          width: 100%; min-height: 50px;
          padding: 13px 14px;
          border-radius: 13px;
          border: 2px solid #e8edf5;
          background: #f8faff;
          font-size: 16px;             /* ← evita zoom iOS */
          color: #1e293b; outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          font-family: 'DM Sans', sans-serif;
          -webkit-appearance: none;
        }
        .pg-m-input:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10);
        }
        .pg-m-input::placeholder { color: #c0cdd8; }
        .pg-m-textarea {
          resize: none; min-height: auto;
          padding-top: 12px; padding-bottom: 12px;
          line-height: 1.5;
        }

        /* Método pills */
        .pg-method-pills { display: flex; gap: 8px; }
        .pg-method-pill {
          flex: 1; padding: 10px 6px; border-radius: 13px;
          border: 2px solid #e8edf5; background: #f8faff;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          cursor: pointer; font-size: 11px; font-weight: 700;
          color: #64748b; text-align: center;
          transition: border-color .18s, background .18s, color .18s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 64px;            /* touch target */
        }
        .pg-method-pill.active {
          border-color: #3b82f6; background: #eff6ff; color: #2563eb;
        }

        /* Modal confirm btn */
        .pg-confirm-btn {
          flex: 1; min-height: 50px; padding: 14px 20px; border-radius: 13px;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .pg-confirm-btn:not(:disabled):hover  { transform: translateY(-1px); }
        .pg-confirm-btn:not(:disabled):active { transform: scale(.98); }
        .pg-confirm-btn:disabled { opacity: .55; cursor: not-allowed; }

        .pg-cancel-btn {
          min-height: 50px; padding: 14px 20px; border-radius: 13px;
          background: #f1f5f9; color: #64748b;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px;
          border: none; cursor: pointer; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .pg-cancel-btn:hover { background: #e8edf5; }

        /* Spinner */
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .pg-spinner {
          width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
          border: 2.5px solid rgba(255,255,255,.30);
          border-top-color: #fff;
          animation: pg-spin .75s linear infinite;
        }

        /* Divider */
        .pg-divider {
          height: 1px;
          background: linear-gradient(90deg,transparent,#e8edf5,transparent);
          margin: 16px 0;
        }

        /* Toast entrada */
        @keyframes pgToastIn {
          from { opacity:0; transform: translateX(-50%) translateY(12px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }

        /* ════════════════════ RESPONSIVE ════════════════════ */
        @media (max-width: 380px) {
          .pg-shell { padding-left: 12px; padding-right: 12px; }
          .pg-page-header { padding: 22px 16px 50px; }
          .pg-search-bar { padding-left: 14px; }
        }

        /* ════════════════════ REDUCE MOTION ════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .pg-modal, .pg-spinner { animation: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════ */}
      <div className="pg-page-header">
        <div className="pg-header-inner">
          <p className="pg-brand" style={{
            color: "rgba(147,197,253,.85)", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4,
          }}>
            Módulo de pagos
          </p>
          <h1 className="pg-brand" style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 700, margin: 0 }}>
            Consulta y Registro de Pagos
          </h1>
          <p style={{ color: "rgba(191,219,254,.85)", fontSize: 13, marginTop: 5 }}>
            Busca un cliente por documento y gestiona sus cuotas pendientes
          </p>
        </div>
      </div>

      <div className="pg-shell">

        {/* ══════════════════════════════════════════════
            BUSCADOR
        ══════════════════════════════════════════════ */}
        <div className="pg-search-bar">
          <FaSearch className="pg-search-icon" />
          <input
            ref={searchRef}
            className="pg-search-input"
            type="text"
            inputMode="numeric"         /* teclado numérico en móvil */
            placeholder="Número de documento del cliente..."
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            autoComplete="off"
            aria-label="Número de documento"
          />
          <button
            className="pg-search-btn"
            onClick={handleBuscar}
            disabled={buscando}
            aria-label="Buscar cliente"
            aria-busy={buscando}
          >
            {buscando
              ? <div className="pg-spinner" />
              : <><FaSearch size={11} /><span>Buscar</span></>
            }
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            DEUDOR BANNER
        ══════════════════════════════════════════════ */}
        {deudor && (
          <div className="pg-deudor" role="status" aria-live="polite">
            <div className="pg-avatar">{initials(deudor.nombre)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".10em", color: "#60a5fa", marginBottom: 2 }}>
                Cliente encontrado
              </p>
              <p className="pg-brand" style={{ fontWeight: 700, color: "#1e293b", fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {deudor.nombre}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <FaIdCard size={10} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#64748b" }}>{deudor.numero_documento}</span>
              </div>
            </div>
            <div className="pg-creditos-badge">
              {creditos.length} crédito{creditos.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ESTADO VACÍO
        ══════════════════════════════════════════════ */}
        {buscado && creditos.length === 0 && (
          <div className="pg-empty" role="status">
            <div className="pg-empty-icon" style={{ background: "#fff7ed" }}>
              <FaExclamationTriangle size={22} color="#f59e0b" />
            </div>
            <p className="pg-brand" style={{ fontWeight: 700, color: "#475569", fontSize: 15 }}>
              Sin cuotas pendientes
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 5, lineHeight: 1.5 }}>
              No se encontraron cuotas para el documento{" "}
              <strong style={{ color: "#64748b" }}>{documento}</strong>.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            LISTA DE CRÉDITOS
        ══════════════════════════════════════════════ */}
        {creditos.map((credito) => {
          const isOpen = !!expandidos[credito.id];

          return (
            <div key={credito.id} className="pg-card">

              {/* ── Header crédito (accordion toggle) ── */}
              <div
                className="pg-credito-header"
                onClick={() => toggleExpand(credito.id)}
                role="button"
                aria-expanded={isOpen}
                aria-controls={`cuotas-${credito.id}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleExpand(credito.id)}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,255,255,.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FaCreditCard color="#fff" size={14} />
                </div>

                <div className="pg-credito-stat">
                  <span className="pg-credito-stat-label">Crédito</span>
                  <span className="pg-credito-stat-val">#{credito.id}</span>
                </div>
                <div className="pg-credito-stat">
                  <span className="pg-credito-stat-label">Monto</span>
                  <span className="pg-credito-stat-val">${fmt(credito.monto)}</span>
                </div>
                <div className="pg-credito-stat">
                  <span className="pg-credito-stat-label">Tipo</span>
                  <span className="pg-credito-stat-val">{TIPO_LABEL[credito.tipo_prestamo] || credito.tipo_prestamo}</span>
                </div>
                <div className="pg-credito-stat">
                  <span className="pg-credito-stat-label">Pendientes</span>
                  <span className="pg-credito-stat-val">{credito.cuotas_pendientes} cuota{credito.cuotas_pendientes !== 1 ? "s" : ""}</span>
                </div>

                {/* Chevron */}
                <FaChevronRight
                  className={`pg-expand-icon${isOpen ? " open" : ""}`}
                  size={12}
                />
              </div>

              {/* ── Cuotas (colapsable) ── */}
              {isOpen && (
                <div id={`cuotas-${credito.id}`}>

                  {/* ── DESKTOP TABLE ── */}
                  <div className="pg-table-desktop">
                    {/* Cabecera */}
                    <div className="pg-col-head">
                      <span>#</span>
                      <span>Total cuota</span>
                      <span>Capital</span>
                      <span>Interés</span>
                      <span>Saldo</span>
                      <span>Por pagar</span>
                      <span>Vencimiento</span>
                      <span>Estado</span>
                      <span>Acción</span>
                    </div>

                    {(credito.cuotas ?? []).map((c, index) => {
                      const est = ESTADO_STYLE[c.estado] || ESTADO_STYLE.pendiente;
                      const cuotaAnterior = credito.cuotas[index - 1];
                      const bloqueadaOrden = index > 0 && cuotaAnterior?.estado !== "pagada";
                      const bloqueada = c.estado === "pagada" || bloqueadaOrden;
                      const porPagar = c.monto_cuota - (c.total_pagado ?? 0);

                      return (
                        <div key={c.id} className="pg-cuota-row">
                          <span className="pg-num-badge">{c.numero_cuota}</span>
                          <span style={{ fontWeight: 700, color: "#1e293b" }}>${fmt(c.monto_cuota)}</span>
                          <span style={{ color: "#475569" }}>${fmt(c.capital)}</span>
                          <span style={{ color: "#ef4444" }}>${fmt(c.interes)}</span>
                          <span style={{ color: "#64748b" }}>${fmt(c.saldo_remanente)}</span>
                          <span style={{
                            fontWeight: c.estado === "parcial" ? 700 : 500,
                            color: c.estado === "parcial" ? "#ef4444" : c.estado === "pagada" ? "#10b981" : "#64748b",
                          }}>
                            ${fmt(porPagar)}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
                            <FaCalendarAlt size={9} color="#94a3b8" />
                            {c.fecha_vencimiento}
                          </div>
                          <span
                            className="pg-estado-badge"
                            style={{ background: est.bg, color: est.color }}
                          >
                            <span className="pg-estado-dot" style={{ background: est.dot }} />
                            {est.label}
                          </span>
                          <button
                            className="pg-pay-btn"
                            disabled={bloqueada}
                            onClick={() => !bloqueada && abrirModal(c, credito)}
                            title={bloqueadaOrden ? `Pague primero la cuota #${cuotaAnterior.numero_cuota}` : ""}
                            aria-label={bloqueada ? "Cuota bloqueada" : `Pagar cuota ${c.numero_cuota}`}
                            style={{
                              background: c.estado === "pagada"
                                ? "linear-gradient(135deg,#d1fae5,#a7f3d0)"
                                : bloqueadaOrden ? "#f1f5f9"
                                  : "linear-gradient(135deg,#059669,#047857)",
                              color: c.estado === "pagada" ? "#059669"
                                : bloqueadaOrden ? "#94a3b8" : "#fff",
                              boxShadow: bloqueada ? "none" : "0 3px 10px rgba(5,150,105,.30)",
                              opacity: c.estado === "pagada" ? .85 : 1,
                            }}
                          >
                            {c.estado === "pagada"
                              ? <><FaCheckCircle size={10} /> Pagada</>
                              : bloqueadaOrden
                                ? <><FaLock size={9} /> Bloqueada</>
                                : <><FaCheckCircle size={10} /> Pagar</>
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── MOBILE CARDS ──
                      Una tarjeta por cuota en lugar de fila de tabla.
                      Mucho más legible en pantallas pequeñas.
                  ── */}
                  <div className="pg-table-mobile">
                    {(credito.cuotas ?? []).map((c, index) => {
                      const est = ESTADO_STYLE[c.estado] || ESTADO_STYLE.pendiente;
                      const cuotaAnterior = credito.cuotas[index - 1];
                      const bloqueadaOrden = index > 0 && cuotaAnterior?.estado !== "pagada";
                      const bloqueada = c.estado === "pagada" || bloqueadaOrden;
                      const porPagar = c.monto_cuota - (c.total_pagado ?? 0);

                      return (
                        <div key={c.id} className="pg-cuota-card">
                          {/* Card header: número + estado + fecha */}
                          <div className="pg-cuota-card-header">
                            <span className="pg-num-badge">{c.numero_cuota}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                                <FaCalendarAlt size={9} color="#94a3b8" />
                                {c.fecha_vencimiento}
                              </div>
                            </div>
                            <span
                              className="pg-estado-badge"
                              style={{ background: est.bg, color: est.color, fontSize: 10 }}
                            >
                              <span className="pg-estado-dot" style={{ background: est.dot }} />
                              {est.label}
                            </span>
                          </div>

                          {/* Card body: importes */}
                          <div className="pg-cuota-card-body">
                            <div className="pg-cuota-card-stat">
                              <span className="pg-cuota-card-stat-label">Total cuota</span>
                              <span className="pg-cuota-card-stat-val" style={{ color: "#1e293b" }}>
                                ${fmt(c.monto_cuota)}
                              </span>
                            </div>
                            <div className="pg-cuota-card-stat">
                              <span className="pg-cuota-card-stat-label">Por pagar</span>
                              <span className="pg-cuota-card-stat-val" style={{
                                color: c.estado === "parcial" ? "#ef4444" : c.estado === "pagada" ? "#10b981" : "#1d4ed8",
                              }}>
                                ${fmt(porPagar)}
                              </span>
                            </div>
                            <div className="pg-cuota-card-stat">
                              <span className="pg-cuota-card-stat-label">Capital</span>
                              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>${fmt(c.capital)}</span>
                            </div>
                            <div className="pg-cuota-card-stat">
                              <span className="pg-cuota-card-stat-label">Interés</span>
                              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>${fmt(c.interes)}</span>
                            </div>
                          </div>

                          {/* Card footer: saldo + botón */}
                          <div className="pg-cuota-card-footer">
                            <div>
                              <span style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Saldo remanente</span>
                              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginTop: 1 }}>${fmt(c.saldo_remanente)}</div>
                            </div>

                            {c.estado === "pagada" ? (
                              <button className="pg-pay-btn-mobile" disabled style={{
                                background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                                color: "#059669",
                              }}>
                                <FaCheckCircle size={12} /> Pagada
                              </button>
                            ) : bloqueadaOrden ? (
                              <div className="pg-locked-hint">
                                <FaLock size={11} />
                                <span>Pague cuota #{cuotaAnterior.numero_cuota} antes</span>
                              </div>
                            ) : (
                              <button
                                className="pg-pay-btn-mobile"
                                onClick={() => abrirModal(c, credito)}
                                style={{
                                  background: "linear-gradient(135deg,#059669,#047857)",
                                  color: "#fff",
                                  boxShadow: "0 4px 14px rgba(5,150,105,.32)",
                                }}
                                aria-label={`Pagar cuota ${c.numero_cuota}`}
                              >
                                <FaCheckCircle size={12} /> Pagar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          MODAL DE PAGO
      ══════════════════════════════════════════════ */}
      {modalAbierto && (
        <div
          className="pg-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Registrar pago"
        >
          <div className="pg-modal pg-root" ref={modalRef}>

            {/* Handle (bottom sheet en móvil) */}
            <div className="pg-modal-handle" aria-hidden="true" />

            {/* ── Header (sticky) ── */}
            <div className="pg-modal-header">
              <div>
                <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.55)", marginBottom: 3 }}>
                  Registrar pago
                </p>
                <p className="pg-brand" style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>
                  Cuota #{cuotaSeleccionada?.numero_cuota}
                  {creditoModal && (
                    <span style={{ fontWeight: 400, fontSize: 12, opacity: .7, marginLeft: 8 }}>
                      Crédito #{creditoModal.id}
                    </span>
                  )}
                </p>
              </div>
              <button
                className="pg-modal-close"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar modal"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="pg-modal-body">

              {/* Info monto sugerido */}
              <div style={{
                background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
                border: "1.5px solid #bbf7d0", borderRadius: 14,
                padding: "12px 16px", marginBottom: 18,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg,#059669,#047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FaMoneyBillWave color="#fff" size={15} />
                </div>
                <div>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>
                    Monto sugerido
                  </p>
                  <p className="pg-brand" style={{ fontWeight: 700, color: "#065f46", fontSize: 22, lineHeight: 1 }}>
                    ${fmt(cuotaSeleccionada?.monto_cuota - (cuotaSeleccionada?.total_pagado ?? 0))}
                  </p>
                </div>
              </div>

              {/* Monto a pagar */}
              <div style={{ marginBottom: 16 }}>
                <label className="pg-m-label" htmlFor="modal-monto">Monto a pagar</label>
                <input
                  id="modal-monto"
                  ref={firstInputRef}
                  type="number"
                  inputMode="decimal"
                  className="pg-m-input"
                  style={{ fontWeight: 700, color: "#1d4ed8" }}
                  value={formPago.monto}
                  onChange={(e) =>
                    setFormPago({
                      ...formPago,
                      monto: e.target.value,
                    })
                  }
                  aria-label="Monto a pagar"
                />
                <p>
                  ${fmt(formPago.monto || 0)}
                </p>
              </div>

              {/* Método de pago */}
              <div style={{ marginBottom: 16 }}>
                <label className="pg-m-label">Método de pago</label>
                <div className="pg-method-pills" role="group" aria-label="Método de pago">
                  {METODOS.map((m) => {
                    const Icon = m.icon;
                    const active = formPago.metodo_pago === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        className={`pg-method-pill${active ? " active" : ""}`}
                        onClick={() => setFormPago({
                          ...formPago,
                          metodo_pago: m.value,
                          referencia: m.value === "efectivo" ? "" : formPago.referencia,
                        })}
                        aria-pressed={active}
                      >
                        <Icon size={17} color={active ? "#3b82f6" : "#94a3b8"} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referencia (condicional) */}
              {formPago.metodo_pago !== "efectivo" && (
                <div style={{ marginBottom: 16 }}>
                  <label className="pg-m-label" htmlFor="modal-ref">
                    Referencia <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="modal-ref"
                    type="text"
                    inputMode="text"
                    className="pg-m-input"
                    placeholder="N° de operación bancaria"
                    value={formPago.referencia}
                    onChange={(e) => setFormPago({ ...formPago, referencia: e.target.value })}
                    aria-required="true"
                    aria-label="Referencia de operación"
                  />
                </div>
              )}

              {/* Notas */}
              <div style={{ marginBottom: 8 }}>
                <label className="pg-m-label" htmlFor="modal-notas">Notas <span style={{ color: "#b0bccc", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                <textarea
                  id="modal-notas"
                  className="pg-m-input pg-m-textarea"
                  rows={2}
                  value={formPago.notas}
                  onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                  aria-label="Notas adicionales"
                />
              </div>
            </div>

            {/* ── Footer (sticky) ── */}
            <div className="pg-modal-footer">
              <button
                className="pg-cancel-btn"
                onClick={() => setModalAbierto(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="pg-confirm-btn"
                disabled={!puedeConfirmar || loading}
                onClick={registrarPago}
                aria-busy={loading}
                style={{
                  background: puedeConfirmar
                    ? "linear-gradient(135deg,#059669,#047857)"
                    : "#e2e8f0",
                  color: puedeConfirmar ? "#fff" : "#94a3b8",
                  boxShadow: puedeConfirmar ? "0 6px 18px rgba(5,150,105,.35)" : "none",
                }}
              >
                {loading
                  ? <><div className="pg-spinner" /><span>Procesando...</span></>
                  : <><FaCheckCircle size={14} /><span>Confirmar Pago</span></>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TOAST — reemplaza alert() nativo
      ══════════════════════════════════════════════ */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
import { useState } from "react";
import clienteAxios from "../api/axios";
import {
  FaSearch, FaUserCircle, FaIdCard, FaMoneyBillWave,
  FaCreditCard, FaCalendarAlt, FaCheckCircle, FaTimes,
  FaExclamationTriangle, FaStickyNote, FaHashtag,
  FaUniversity, FaHandHoldingUsd, FaChevronDown
} from "react-icons/fa";

const fmt = (n) => Number(n).toLocaleString("es-CO");

const ESTADO_STYLE = {
  pendiente: { bg: "#fff7ed", color: "#f59e0b", label: "Pendiente" },
  pagada: { bg: "#f0fdf4", color: "#10b981", label: "Pagada" },
  vencido: { bg: "#fff1f2", color: "#ef4444", label: "Vencido" },
  parcial: { bg: "#eff6ff", color: "#3b82f6", label: "Parcial" }
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
  const [formPago, setFormPago] = useState({
    monto: "", metodo_pago: "efectivo", referencia: "", notas: ""
  });

  /* ── Buscar ─────────────────────────────────────────────────── */
  const handleBuscar = async () => {
    if (!documento.trim()) return;
    setBuscando(true);
    try {
      setDeudor(null); setBuscado(false); setCreditos([]);
      const res = await clienteAxios.get(`/api/cuotas/pendientes/${documento}`);
      console.log("RESPUESTA:", res.data);
      setDeudor(res.data.deudor);
      setCreditos(res.data.creditos);
      setBuscado(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setCreditos([]); setDeudor(null); setBuscado(true);
      } else {
        console.error("Error al consultar:", error);
      }
    } finally {
      setBuscando(false);
    }
  };

  /* ── Registrar pago ─────────────────────────────────────────── */
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
      alert("¡Éxito! " + respuesta.data.mensaje);
      setModalAbierto(false);
      handleBuscar();
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.error || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (cuota, credito) => {
    setCuotaSeleccionada(cuota);
    setCreditoModal(credito);
    setFormPago({ monto: cuota.monto_cuota - (cuota.total_pagado ?? 0), metodo_pago: "efectivo", referencia: "", notas: "" });
    setModalAbierto(true);
  };

  const puedeConfirmar = formPago.metodo_pago === "efectivo" || !!formPago.referencia;

  /* ── Initials avatar ────────────────────────────────────────── */
  const initials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

 


  return (
    <div className="pg-root min-h-screen" style={{ background: "#f0f4ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .pg-root  { font-family:'DM Sans',sans-serif; }
        .pg-title { font-family:'Sora',sans-serif; }

        /* Header */
        .pg-page-header {
          background: linear-gradient(135deg,#1d4ed8 0%,#2563eb 55%,#3b82f6 100%);
          padding: 28px 24px 52px;
          position:relative; overflow:hidden;
        }
        .pg-page-header::before {
          content:'';position:absolute;top:-50px;right:-50px;
          width:220px;height:220px;border-radius:50%;
          background:rgba(255,255,255,0.07);
        }
        .pg-page-header::after {
          content:'';position:absolute;bottom:-30px;left:30%;
          width:140px;height:140px;border-radius:50%;
          background:rgba(255,255,255,0.05);
        }

        .pg-shell {
          max-width:960px; margin:-28px auto 0;
          padding:0 16px 48px; position:relative; z-index:10;
        }

        /* Card */
        .pg-card {
          background:#fff; border-radius:22px;
          box-shadow:0 8px 40px rgba(59,130,246,0.11),0 1px 4px rgba(0,0,0,0.05);
          overflow:hidden; margin-bottom:20px;
        }
        .pg-card-header {
          padding:14px 20px; border-bottom:1px solid #f1f5f9;
          display:flex; align-items:center; gap:10px;
          background:linear-gradient(135deg,#f8faff,#eff6ff);
        }
        .pg-chip {
          display:inline-flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:9px;flex-shrink:0;
        }

        /* Buscador */
        .pg-search-bar {
          display:flex; gap:10px; align-items:center;
          background:#fff; border-radius:18px;
          padding:8px 8px 8px 16px;
          box-shadow:0 8px 40px rgba(59,130,246,0.11),0 1px 4px rgba(0,0,0,0.05);
          margin-bottom:20px;
        }
        .pg-search-input {
          flex:1; border:none; outline:none;
          font-size:0.9rem; color:#1e293b;
          font-family:'DM Sans',sans-serif;
          background:transparent;
        }
        .pg-search-input::placeholder { color:#c0cdd8; }
        .pg-search-btn {
          display:flex;align-items:center;gap:7px;
          padding:10px 20px; border-radius:12px;
          background:linear-gradient(135deg,#3b82f6,#2563eb);
          color:#fff; font-weight:700; font-size:0.85rem;
          border:none; cursor:pointer; flex-shrink:0;
          box-shadow:0 4px 14px rgba(59,130,246,0.35);
          transition:transform 0.15s,box-shadow 0.15s;
          font-family:'Sora',sans-serif;
        }
        .pg-search-btn:hover { transform:translateY(-1px); box-shadow:0 7px 18px rgba(59,130,246,0.4); }

        /* Deudor banner */
        .pg-deudor {
          background:linear-gradient(135deg,#eff6ff,#f5f3ff);
          border:1.5px solid #bfdbfe; border-radius:18px;
          padding:16px 20px; display:flex; align-items:center; gap:14px;
          margin-bottom:20px;
        }
        .pg-avatar {
          width:48px;height:48px;border-radius:14px;
          background:linear-gradient(135deg,#3b82f6,#6366f1);
          display:flex;align-items:center;justify-content:center;
          font-family:'Sora',sans-serif;font-weight:800;font-size:16px;
          color:#fff;flex-shrink:0;
          box-shadow:0 4px 12px rgba(59,130,246,0.3);
        }

        /* Crédito header */
        .pg-credito-header {
          padding:14px 18px;
          background:linear-gradient(135deg,#1e3a8a,#1d4ed8);
          display:flex; flex-wrap:wrap; gap:10px 20px; align-items:center;
        }
        .pg-credito-stat {
          display:flex;flex-direction:column;gap:1px;
        }
        .pg-credito-stat-label {
          font-size:9px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.1em;color:rgba(255,255,255,0.5);
        }
        .pg-credito-stat-val {
          font-family:'Sora',sans-serif;font-weight:700;
          font-size:0.85rem;color:#fff;
        }

        /* Cuota fila */
        .pg-cuota-row {
          display:grid;
          grid-template-columns: 44px 1fr 1fr 1fr 1fr 1fr 90px 80px 110px;
          align-items:center; gap:6px;
          padding:11px 16px;
          border-bottom:1px solid #f1f5f9;
          transition:background 0.15s;
          font-size:0.82rem;
        }
        .pg-cuota-row:hover { background:#f8faff; }
        .pg-cuota-row:last-child { border-bottom:none; }

        .pg-col-head {
          font-size:9px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.08em;color:#94a3b8;padding:10px 16px 8px;
          display:grid;
          grid-template-columns: 44px 1fr 1fr 1fr 1fr 1fr 90px 80px 110px;
          gap:6px; border-bottom:2px solid #f1f5f9;
          background:#fafbff;
        }

        .pg-badge {
          display:inline-flex;align-items:center;
          padding:3px 9px;border-radius:6px;
          font-size:10px;font-weight:700;
        }
        .pg-num-badge {
          display:inline-flex;align-items:center;justify-content:center;
          width:26px;height:26px;border-radius:8px;
          background:#eff6ff;color:#3b82f6;
          font-family:'Sora',sans-serif;font-weight:800;font-size:11px;
        }

        /* Botón pagar */
        .pg-pay-btn {
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 12px;border-radius:9px;
          background:linear-gradient(135deg,#059669,#047857);
          color:#fff;font-weight:700;font-size:11px;
          border:none;cursor:pointer;
          box-shadow:0 3px 10px rgba(5,150,105,0.3);
          transition:transform 0.15s,box-shadow 0.15s;
          font-family:'DM Sans',sans-serif;
        }
        .pg-pay-btn:hover { transform:translateY(-1px);box-shadow:0 6px 14px rgba(5,150,105,0.35); }

        /* Modal */
        .pg-modal-overlay {
          position:fixed;inset:0;
          background:rgba(15,23,42,0.6);
          backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;
          z-index:50;padding:16px;
        }
        .pg-modal {
          background:#fff; border-radius:24px;
          width:100%;max-width:440px;overflow:hidden;
          box-shadow:0 24px 64px rgba(0,0,0,0.25);
          animation:pg-pop 0.28s cubic-bezier(.22,1,.36,1);
        }
        @keyframes pg-pop {
          from{opacity:0;transform:scale(0.9) translateY(20px)}
          to{opacity:1;transform:scale(1) translateY(0)}
        }
        .pg-modal-header {
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
          padding:20px 22px; display:flex;
          align-items:center;justify-content:space-between;
        }

        /* Modal inputs */
        .pg-m-label {
          font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.1em;color:#94a3b8;margin-bottom:5px;
        }
        .pg-m-input {
          width:100%;padding:11px 12px;border-radius:12px;
          border:2px solid #e2e8f0;background:#f8faff;
          font-size:0.9rem;color:#1e293b;outline:none;
          transition:all 0.2s;font-family:'DM Sans',sans-serif;
        }
        .pg-m-input:focus {
          border-color:#3b82f6;background:#fff;
          box-shadow:0 0 0 4px rgba(59,130,246,0.1);
        }
        .pg-m-input::placeholder { color:#c0cdd8; }

        /* Método pills */
        .pg-method-pills { display:flex;gap:8px; }
        .pg-method-pill {
          flex:1;padding:9px 6px;border-radius:12px;
          border:2px solid #e2e8f0;background:#f8faff;
          display:flex;flex-direction:column;align-items:center;gap:4px;
          cursor:pointer;transition:all 0.18s;font-size:10px;font-weight:700;
          color:#64748b;text-align:center;
        }
        .pg-method-pill.active {
          border-color:#3b82f6;background:#eff6ff;color:#2563eb;
        }

        /* Botones modal */
        .pg-modal-btn {
          flex:1;padding:12px;border-radius:12px;
          font-family:'Sora',sans-serif;font-weight:700;font-size:0.9rem;
          border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:7px;
          transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s;
        }
        .pg-modal-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .pg-modal-btn:disabled { opacity:0.55;cursor:not-allowed; }

        @keyframes pg-spin { to{transform:rotate(360deg)} }
        .pg-spinner {
          width:15px;height:15px;border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:pg-spin 0.7s linear infinite;
        }

        .pg-divider {
          height:1px;
          background:linear-gradient(90deg,transparent,#e2e8f0,transparent);
        }

        /* Responsive tabla → scroll en mobile */
        .pg-table-scroll { overflow-x:auto; }
        @media(max-width:700px){
          .pg-cuota-row,.pg-col-head {
            grid-template-columns: 36px 90px 80px 80px 80px 80px 70px 100px;
            font-size:0.75rem;
          }
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="pg-page-header">
        <div className="relative z-10" style={{ maxWidth: 960, margin: "0 auto" }}>
          <p className="pg-title text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Módulo de pagos
          </p>
          <h1 className="pg-title text-white text-2xl md:text-3xl font-bold">
            Consulta y Registro de Pagos
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Busca un cliente por documento y gestiona sus cuotas pendientes
          </p>
        </div>
      </div>

      <div className="pg-shell">

        {/* ── BUSCADOR ── */}
        <div className="pg-search-bar">
          <FaSearch style={{ color: "#94a3b8", fontSize: 14, flexShrink: 0 }} />
          <input
            className="pg-search-input"
            type="text"
            placeholder="Número de documento del cliente..."
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          />
          <button className="pg-search-btn" onClick={handleBuscar} disabled={buscando}>
            {buscando
              ? <div className="pg-spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              : <><FaSearch size={11} /> Buscar</>
            }
          </button>
        </div>

        {/* ── DEUDOR BANNER ── */}
        {deudor && (
          <div className="pg-deudor">
            <div className="pg-avatar">{initials(deudor.nombre)}</div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#60a5fa", marginBottom: 2 }}>
                Cliente encontrado
              </p>
              <p className="pg-title font-bold text-slate-800 text-base truncate">{deudor.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <FaIdCard size={10} color="#94a3b8" />
                <p style={{ fontSize: 12, color: "#64748b" }}>{deudor.numero_documento}</p>
              </div>
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: 50,
              background: "linear-gradient(135deg,#059669,#047857)",
              color: "#fff", fontSize: 11, fontWeight: 700,
            }}>
              {creditos.length} crédito{creditos.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* ── SIN RESULTADOS ── */}
        {buscado && creditos.length === 0 && (
          <div className="pg-card" style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
              background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaExclamationTriangle size={22} color="#f59e0b" />
            </div>
            <p className="pg-title font-bold text-slate-500 text-base">Sin cuotas pendientes</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              No se encontraron cuotas pendientes para el documento <strong>{documento}</strong>.
            </p>
          </div>
        )}

        {/* ── CRÉDITOS ── */}
        {creditos.map((credito) => (
          <div key={credito.id} className="pg-card" style={{ marginBottom: 20 }}>

            {/* Header crédito */}
            <div className="pg-credito-header">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <FaCreditCard color="#fff" size={15} />
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
            </div>

            {/* Tabla cuotas */}
            <div className="pg-table-scroll">
              {/* Encabezados */}
              <div className="pg-col-head">
                <span>#</span>
                <span>Total cuota</span>
                <span>Capital</span>
                <span>Interés</span>
                <span>Saldo</span>
                <span>Por Pagar</span>
                <span>Vencimiento</span>
                <span>Estado</span>
                <span>Acción</span>

              </div>

              {(credito.cuotas ?? []).map((c, index) => {
                const est = ESTADO_STYLE[c.estado] || ESTADO_STYLE.pendiente;
                const cuotaAnterior = credito.cuotas[index - 1];
                const bloqueadaPorOrden = index > 0 && cuotaAnterior?.estado !== 'pagada';
                const bloqueada = c.estado === 'pagada' || bloqueadaPorOrden;

                return (
                  <div key={c.id} className="pg-cuota-row">
                    <span className="pg-num-badge">{c.numero_cuota}</span>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>${fmt(c.monto_cuota)}</span>
                    <span style={{ color: "#475569" }}>${fmt(c.capital)}</span>
                    <span style={{ color: "#ef4444" }}>${fmt(c.interes)}</span>
                    <span style={{ color: "#64748b" }}>${fmt(c.saldo_remanente)}</span>
                    <span style={{
                      fontWeight: c.estado === 'parcial' ? 700 : 400,
                      color: c.estado === 'parcial' ? "#ef4444" : c.estado === 'pagada' ? "#10b981" : "#64748b",
                    }}>

                      ${fmt(c.monto_cuota - (c.total_pagado ?? 0))}

                    </span>



                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: "0.78rem" }}>
                      <FaCalendarAlt size={9} color="#94a3b8" />
                      {c.fecha_vencimiento}
                    </div>
                    <span className="pg-badge" style={{ background: est.bg, color: est.color }}>
                      {est.label}
                    </span>


                    <button className="pg-pay-btn" disabled={bloqueada}
                      onClick={() => !bloqueada && abrirModal(c, credito)}
                      title={bloqueadaPorOrden
                        ? `Primero pague la cuota #${cuotaAnterior.numero_cuota}` :
                        ""}

                      style={{
                        background: c.estado === 'pagada'
                          ? "linear-gradient(135deg,#d1fae5,#a7f3d0)"
                          : bloqueadaPorOrden
                            ? "#f1f5f9"
                            : "linear-gradient(135deg,#059669,#047857)",
                        color: c.estado === 'pagada' ? "#059669"
                          : bloqueadaPorOrden ? "#94a3b8" : "#fff",
                        cursor: bloqueada ? "not-allowed" : "pointer",
                        boxShadow: bloqueada ? "none" : "0 3px 10px rgba(5,150,105,0.3)",
                        opacity: c.estado === 'pagada' ? 0.8 : 1,
                      }}
                    >
                      {c.estado === 'pagada'
                        ? <><FaCheckCircle size={10} /> Pagada</>
                        : bloqueadaPorOrden ? <><FaTimes size={10} /> Bloqueada</>
                          : <><FaCheckCircle size={10} /> Pagar</>
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL DE PAGO
      ══════════════════════════════════════════════════════════ */}
      {
        modalAbierto && (
          <div className="pg-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAbierto(false)}>
            <div className="pg-modal pg-root">

              {/* Header */}
              <div className="pg-modal-header">
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>
                    Registrar pago
                  </p>
                  <p className="pg-title text-white font-bold text-base">
                    Cuota #{cuotaSeleccionada?.numero_cuota}
                    {creditoModal && (
                      <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.7, marginLeft: 8 }}>
                        — Crédito #{creditoModal.id}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setModalAbierto(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "rgba(255,255,255,0.15)", border: "none",
                    color: "#fff", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "22px 22px 6px" }}>

                {/* Info cuota */}
                <div style={{
                  background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
                  border: "1.5px solid #bbf7d0", borderRadius: 14,
                  padding: "12px 16px", marginBottom: 18,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#059669,#047857)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <FaMoneyBillWave color="#fff" size={14} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Monto sugerido
                    </p>
                    <p className="pg-title font-bold text-emerald-700 text-xl">
                      ${fmt(cuotaSeleccionada?.monto_cuota - (cuotaSeleccionada?.total_pagado ?? 0))}
                    </p>
                  </div>
                </div>

                {/* Monto */}
                <div style={{ marginBottom: 14 }}>
                  <p className="pg-m-label">Monto a pagar</p>
                  <input
                    type="number" className="pg-m-input"
                    style={{ fontWeight: 700, fontSize: "1rem", color: "#1d4ed8" }}
                    value={formPago.monto}
                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                  />
                </div>

                {/* Método pills */}
                <div style={{ marginBottom: 14 }}>
                  <p className="pg-m-label">Método de pago</p>
                  <div className="pg-method-pills">
                    {METODOS.map((m) => {
                      const Icon = m.icon;
                      const active = formPago.metodo_pago === m.value;
                      return (
                        <button
                          key={m.value} type="button"
                          className={`pg-method-pill ${active ? "active" : ""}`}
                          onClick={() => setFormPago({
                            ...formPago,
                            metodo_pago: m.value,
                            referencia: m.value === "efectivo" ? "" : formPago.referencia
                          })}
                        >
                          <Icon size={16} color={active ? "#3b82f6" : "#94a3b8"} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Referencia condicional */}
                {formPago.metodo_pago !== "efectivo" && (
                  <div style={{ marginBottom: 14 }}>
                    <p className="pg-m-label">
                      Referencia <span style={{ color: "#ef4444" }}>*</span>
                    </p>
                    <input
                      type="text" className="pg-m-input"
                      placeholder="N° de operación bancaria"
                      value={formPago.referencia}
                      onChange={(e) => setFormPago({ ...formPago, referencia: e.target.value })}
                    />
                  </div>
                )}

                {/* Notas */}
                <div style={{ marginBottom: 20 }}>
                  <p className="pg-m-label">Notas (opcional)</p>
                  <textarea
                    className="pg-m-input" rows={2}
                    style={{ resize: "none", paddingTop: 10, paddingBottom: 10 }}
                    value={formPago.notas}
                    onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
                <button
                  className="pg-modal-btn"
                  style={{ background: "#f1f5f9", color: "#64748b", flex: "0 0 auto", padding: "12px 18px" }}
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  className="pg-modal-btn"
                  disabled={!puedeConfirmar || loading}
                  style={{
                    background: puedeConfirmar
                      ? "linear-gradient(135deg,#059669,#047857)"
                      : "#e2e8f0",
                    color: puedeConfirmar ? "#fff" : "#94a3b8",
                    boxShadow: puedeConfirmar ? "0 6px 18px rgba(5,150,105,0.35)" : "none",
                  }}
                  onClick={registrarPago}
                >
                  {loading
                    ? <><div className="pg-spinner" /> Procesando...</>
                    : <><FaCheckCircle size={13} /> Confirmar Pago</>
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
// src/pages/Dashboard.jsx
// Dashboard ejecutivo KREDII
// Usa SOLO las dependencias ya instaladas: react-icons/fa, react-router-dom
// Sin librerías extra. Gráfica de cartera hecha con SVG puro.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUsers, FaCreditCard, FaDollarSign, FaChartLine,
    FaExclamationTriangle, FaClock, FaUserPlus, FaPlus,
    FaFileAlt, FaArrowUp, FaArrowDown, FaChevronRight,
    FaCheckCircle, FaTimesCircle, FaBell
} from "react-icons/fa";

// ─── MOCK DATA ───────────────────────────────────────────────
const KPI_DATA = [
    { id: "clientes", label: "Clientes activos", value: "124", trend: "+8", trendUp: true, icon: FaUsers, color: "#2563eb", bg: "#eff6ff" },
    { id: "creditos", label: "Créditos activos", value: "87", trend: "+3", trendUp: true, icon: FaCreditCard, color: "#7c3aed", bg: "#f5f3ff" },
    { id: "cartera", label: "Cartera total", value: "$48.2M", trend: "+5.4%", trendUp: true, icon: FaDollarSign, color: "#059669", bg: "#ecfdf5" },
    { id: "recaudo", label: "Recaudo del mes", value: "$6.8M", trend: "-2.1%", trendUp: false, icon: FaChartLine, color: "#d97706", bg: "#fffbeb" },
    { id: "mora", label: "Créditos en mora", value: "11", trend: "+2", trendUp: false, icon: FaExclamationTriangle, color: "#dc2626", bg: "#fef2f2" },
    { id: "cuotas", label: "Cuotas hoy", value: "34", trend: "hoy", trendUp: null, icon: FaClock, color: "#0891b2", bg: "#ecfeff" },
];

const QUICK_ACTIONS = [
    { label: "Nuevo cliente", icon: FaUserPlus, to: "/Deudores", color: "#2563eb" },
    { label: "Nuevo crédito", icon: FaCreditCard, to: "/Deudores", color: "#7c3aed" },
    { label: "Registrar pago", icon: FaDollarSign, to: "/pagos", color: "#059669" },
    { label: "Ver reportes", icon: FaFileAlt, to: "#", color: "#d97706" },
];

const ALERTS = [
    { type: "error", icon: FaTimesCircle, title: "Crédito vencido hoy", desc: "María López · $320.000 · Cuota #4" },
    { type: "warning", icon: FaExclamationTriangle, title: "Cliente en mora", desc: "Carlos Ríos · 18 días · $980.000" },
    { type: "warning", icon: FaClock, title: "Próxima a vencer", desc: "Ana Gómez · vence mañana · $215.000" },
];

const ACTIVITY = [
    { action: "Crédito creado", detail: "Pedro Salcedo · $2.500.000 a 12 meses", time: "Hace 1h", icon: FaCreditCard, color: "#7c3aed" },
    { action: "Pago registrado", detail: "Luz Marina Torres · $180.000", time: "Hace 3h", icon: FaCheckCircle, color: "#059669" },
    { action: "Cliente agregado", detail: "Jorge Castillo · CC 1.087.432.198", time: "Ayer", icon: FaUsers, color: "#2563eb" },
    { action: "Pago registrado", detail: "René Osorio · $240.000", time: "Ayer", icon: FaCheckCircle, color: "#059669" },
];

const VENCIMIENTOS = [
    { cliente: "Beatriz Soto", fecha: "Hoy", valor: "$420.000", estado: "vencido" },
    { cliente: "Luis Fernando Ruiz", fecha: "Mañana", valor: "$315.000", estado: "proximo" },
    { cliente: "Sandra Mejía", fecha: "13 jun", valor: "$560.000", estado: "proximo" },
    { cliente: "Hernán Correa", fecha: "15 jun", valor: "$198.000", estado: "vigente" },
    { cliente: "Gloria Patiño", fecha: "18 jun", valor: "$740.000", estado: "vigente" },
];

// Cartera en % para la dona SVG
const CARTERA = [
    { name: "Vigente", pct: 68, color: "#2563eb" },
    { name: "En mora", pct: 17, color: "#dc2626" },
    { name: "Recuperada", pct: 15, color: "#059669" },
];

// ─── DONA SVG (sin librería) ─────────────────────────────────
const DonaChart = ({ data, size = 160, thickness = 28 }) => {
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const slices = data.map(d => {
        const dash = (d.pct / 100) * circumference;
        const slice = { ...d, dash, gap: circumference - dash, offset };
        offset += dash;
        return slice;
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            {slices.map((s, i) => (
                <circle
                    key={i}
                    cx={cx} cy={cx} r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${s.dash} ${s.gap}`}
                    strokeDashoffset={-s.offset}
                />
            ))}
        </svg>
    );
};

// ─── BARRA MINI DE RECAUDO ───────────────────────────────────
const barData = [5.2, 6.1, 5.8, 7.0, 6.4, 6.8];
const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const maxBar = Math.max(...barData);

// ─── BADGE ESTADO ────────────────────────────────────────────
const estadoMap = {
    vencido: { bg: "#fef2f2", color: "#dc2626", label: "Vencido" },
    proximo: { bg: "#fffbeb", color: "#d97706", label: "Próximo" },
    vigente: { bg: "#ecfdf5", color: "#059669", label: "Vigente" },
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const fecha = new Date().toLocaleDateString("es-CO", {
        weekday: "long", day: "numeric", month: "long"
    });

    return (
        <>
            {/* ── ESTILOS SCOPED (misma técnica que Navbar.jsx) ── */}
            <style>{`
        .dash-page { background:#f8fafc; min-height:100vh; font-family:'DM Sans',sans-serif; }

        /* KPI grid: 2 col mobile → 3 tablet → 6 desktop */
        .dash-kpi-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:10px;
        }
        @media(min-width:640px){ .dash-kpi-grid{grid-template-columns:repeat(3,1fr);} }
        @media(min-width:1280px){ .dash-kpi-grid{grid-template-columns:repeat(6,1fr);} }

        /* Acciones rápidas: 2 col mobile → 4 desktop */
        .dash-actions-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:10px;
        }
        @media(min-width:480px){ .dash-actions-grid{grid-template-columns:repeat(4,1fr);} }

        /* Dos columnas en tablet+ */
        .dash-twocol {
          display:grid;
          grid-template-columns:1fr;
          gap:0;
        }
        @media(min-width:768px){
          .dash-twocol{
            grid-template-columns:1.2fr 1fr;
            gap:0 16px;
          }
        }

        /* Card base */
        .dash-card {
          background:#fff;
          border-radius:14px;
          padding:14px;
          border:1px solid #f1f5f9;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
        }

        /* KPI card hover */
        .dash-kpi-card {
          background:#fff;
          border-radius:14px;
          padding:12px 14px;
          border:1px solid #f1f5f9;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
          transition:box-shadow .2s, transform .15s;
          cursor:default;
        }
        .dash-kpi-card:hover {
          box-shadow:0 4px 16px rgba(0,0,0,.09);
          transform:translateY(-1px);
        }

        /* Action btn */
        .dash-action-btn {
          background:#fff;
          border:1px solid #f1f5f9;
          border-radius:14px;
          padding:14px 8px;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:8px;
          cursor:pointer;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
          transition:box-shadow .15s, transform .12s;
          -webkit-tap-highlight-color:transparent;
        }
        .dash-action-btn:hover {
          box-shadow:0 4px 14px rgba(37,99,235,.14);
          transform:translateY(-2px);
        }
        .dash-action-btn:active { transform:scale(.97); }

        /* Alert items */
        .dash-alert-e {
          background:#fef2f2;
          border:1px solid #fca5a5;
          border-radius:10px;
          padding:10px 12px;
          margin-bottom:8px;
          display:flex;
          align-items:flex-start;
          gap:10px;
        }
        .dash-alert-w {
          background:#fffbeb;
          border:1px solid #fcd34d;
          border-radius:10px;
          padding:10px 12px;
          margin-bottom:8px;
          display:flex;
          align-items:flex-start;
          gap:10px;
        }

        /* Venc row */
        .dash-vrow {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          background:#fff;
          border:1px solid #f1f5f9;
          border-radius:10px;
          padding:10px 14px;
          margin-bottom:8px;
          box-shadow:0 1px 2px rgba(0,0,0,.04);
        }

        /* Activity row */
        .dash-arow {
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 0;
          border-bottom:1px solid #f1f5f9;
        }
        .dash-arow:last-child { border-bottom:none; }

        .dash-section { margin-bottom:22px; }
        .dash-section-title {
          font-size:13px;
          font-weight:700;
          color:#1e293b;
          margin:0 0 10px;
          letter-spacing:-.1px;
        }

        /* Badge */
        .dash-badge {
          font-size:10px;
          font-weight:600;
          padding:2px 8px;
          border-radius:999px;
          white-space:nowrap;
        }

        /* Link btn */
        .dash-link-btn {
          background:none;
          border:none;
          cursor:pointer;
          font-size:12px;
          color:#2563eb;
          font-weight:600;
          display:flex;
          align-items:center;
          gap:2px;
          padding:0;
        }

        /* Barras del chart */
        .dash-bar {
          border-radius:4px 4px 0 0;
          transition:opacity .15s;
        }
        .dash-bar:hover { opacity:.8; }
      `}</style>

            <div className="dash-page">
                {/* ── HEADER ── */}
                <div style={{
                    background: "#fff",
                    borderBottom: "1px solid #f1f5f9",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
                            Buen día 👋
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, textTransform: "capitalize" }}>
                            {fecha}
                        </div>
                    </div>
                    <button style={{
                        position: "relative",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        width: 38, height: 38,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer"
                    }}>
                        <FaBell style={{ color: "#64748b", fontSize: 16 }} />
                        <span style={{
                            position: "absolute", top: 7, right: 7,
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#dc2626", border: "2px solid #f1f5f9"
                        }} />
                    </button>
                </div>

                {/* ── CONTENIDO ── */}
                <div style={{ padding: 14, maxWidth: 1100, margin: "0 auto" }}>

                    {/* ── KPIs ── */}
                    <div className="dash-section">
                        <p className="dash-section-title">Resumen del negocio</p>
                        <div className="dash-kpi-grid">
                            {KPI_DATA.map(k => {
                                const Icon = k.icon;
                                return (
                                    <div key={k.id} className="dash-kpi-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 9,
                                                background: k.bg,
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Icon style={{ color: k.color, fontSize: 16 }} />
                                            </div>
                                            {k.trendUp !== null ? (
                                                <span style={{
                                                    display: "flex", alignItems: "center", gap: 2,
                                                    fontSize: 11, fontWeight: 600,
                                                    color: k.trendUp ? "#059669" : "#dc2626"
                                                }}>
                                                    {k.trendUp
                                                        ? <FaArrowUp style={{ fontSize: 10 }} />
                                                        : <FaArrowDown style={{ fontSize: 10 }} />
                                                    }
                                                    {k.trend}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{k.trend}</span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: "-.5px" }}>
                                                {k.value}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                                {k.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── ACCIONES RÁPIDAS ── */}
                    <div className="dash-section">
                        <p className="dash-section-title">Acciones rápidas</p>
                        <div className="dash-actions-grid">
                            {QUICK_ACTIONS.map(a => {
                                const Icon = a.icon;
                                return (
                                    <button
                                        key={a.label}
                                        className="dash-action-btn"
                                        onClick={() => navigate(a.to)}
                                    >
                                        <div style={{
                                            width: 42, height: 42, borderRadius: 12,
                                            background: a.color,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <Icon style={{ color: "#fff", fontSize: 18 }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", textAlign: "center", lineHeight: 1.3 }}>
                                            {a.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── ALERTAS ── */}
                    <div className="dash-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <p className="dash-section-title" style={{ margin: 0 }}>Alertas del día</p>
                            <span style={{
                                background: "#dc2626", color: "#fff",
                                fontSize: 11, fontWeight: 700,
                                padding: "2px 8px", borderRadius: 999
                            }}>3</span>
                        </div>
                        {ALERTS.map((a, i) => {
                            const Icon = a.icon;
                            const isE = a.type === "error";
                            return (
                                <div key={i} className={isE ? "dash-alert-e" : "dash-alert-w"}>
                                    <Icon style={{ color: isE ? "#dc2626" : "#d97706", fontSize: 16, marginTop: 1, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: isE ? "#7f1d1d" : "#78350f" }}>
                                            {a.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                                            {a.desc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── GRÁFICA RECAUDO ── */}
                    <div className="dash-section">
                        <p className="dash-section-title">Recaudo mensual</p>
                        <div className="dash-card">
                            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                                Millones COP · Últimos 6 meses
                            </div>
                            {/* Barras SVG simples */}
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
                                {barData.map((v, i) => {
                                    const h = Math.round((v / maxBar) * 100);
                                    const isLast = i === barData.length - 1;
                                    return (
                                        <div key={i} style={{
                                            flex: 1, display: "flex", flexDirection: "column",
                                            alignItems: "center", gap: 4
                                        }}>
                                            <div style={{
                                                fontSize: 9, color: isLast ? "#2563eb" : "#94a3b8",
                                                fontWeight: isLast ? 700 : 400
                                            }}>
                                                ${v}M
                                            </div>
                                            <div
                                                className="dash-bar"
                                                style={{
                                                    width: "100%",
                                                    height: h + "%",
                                                    background: isLast
                                                        ? "linear-gradient(180deg,#3b82f6,#2563eb)"
                                                        : "#e2e8f0",
                                                    minHeight: 4
                                                }}
                                            />
                                            <div style={{ fontSize: 9, color: "#94a3b8" }}>{meses[i]}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── DOS COLUMNAS ── */}
                    <div className="dash-twocol">

                        {/* Actividad reciente */}
                        <div className="dash-section">
                            <p className="dash-section-title">Actividad reciente</p>
                            <div className="dash-card">
                                {ACTIVITY.map((a, i) => {
                                    const Icon = a.icon;
                                    return (
                                        <div key={i} className="dash-arow">
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                                background: a.color + "18",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Icon style={{ color: a.color, fontSize: 14 }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{a.action}</div>
                                                <div style={{
                                                    fontSize: 11, color: "#64748b", marginTop: 1,
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                                }}>{a.detail}</div>
                                            </div>
                                            <div style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>{a.time}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Estado de cartera */}
                        <div className="dash-section">
                            <p className="dash-section-title">Estado de cartera</p>
                            <div className="dash-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <DonaChart data={CARTERA} size={150} thickness={28} />
                                <div style={{
                                    display: "flex", gap: 10, justifyContent: "center",
                                    flexWrap: "wrap", marginTop: 10
                                }}>
                                    {CARTERA.map(c => (
                                        <div key={c.name} style={{
                                            display: "flex", alignItems: "center", gap: 5,
                                            fontSize: 11, color: "#475569"
                                        }}>
                                            <span style={{
                                                width: 9, height: 9, borderRadius: 3,
                                                background: c.color, display: "inline-block"
                                            }} />
                                            {c.name} · <b style={{ color: "#1e293b" }}>{c.pct}%</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── VENCIMIENTOS ── */}
                    <div className="dash-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <p className="dash-section-title" style={{ margin: 0 }}>Próximos vencimientos</p>
                            <button className="dash-link-btn" onClick={() => navigate("/pagos")}>
                                Ver todos <FaChevronRight style={{ fontSize: 10 }} />
                            </button>
                        </div>
                        {VENCIMIENTOS.map((v, i) => {
                            const s = estadoMap[v.estado];
                            return (
                                <div key={i} className="dash-vrow">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 12, fontWeight: 600, color: "#1e293b",
                                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                        }}>{v.cliente}</div>
                                        <div style={{ fontSize: 11, color: "#64748b" }}>{v.fecha}</div>
                                    </div>
                                    <div style={{
                                        textAlign: "right", display: "flex",
                                        flexDirection: "column", alignItems: "flex-end", gap: 4
                                    }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{v.valor}</span>
                                        <span className="dash-badge" style={{ background: s.bg, color: s.color }}>
                                            {s.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>{/* /contenido */}
            </div>{/* /page */}
        </>
    );
}
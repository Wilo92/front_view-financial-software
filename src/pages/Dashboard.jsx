import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   1. DATOS DE EJEMPLO (luego vendrán de Laravel)
   ========================================================= */
const DATA = {
  porCobrar: 48250000,
  evolucionCartera: [40100000, 41200000, 40800000, 44500000, 45800000, 48250000],
  salud: { alDia: 68, mora1a30: 15, moraMas30: 17 },
  totalCreditos: 87,
  recaudoMes: 6800000,
  recaudoEsperado: 9400000,
  enMora: { cantidad: 11, monto: 8200000 },
  creditosActivos: 87,
  creditosNuevosMes: 3,
  clientesConCredito: 24,
  clientesRegistrados: 124,
  recaudoMensual: [
    { mes: "Abr", valor: 5200000 },
    { mes: "May", valor: 6100000 },
    { mes: "Jun", valor: 5800000 },
    { mes: "Jul", valor: 7000000 },
    { mes: "Ago", valor: 6400000 },
    { mes: "Sep", valor: 6800000 },
  ],
  atencion: [
    { id: 1, nombre: "Carlos Ríos", cuota: 6, totalCuotas: 12, valor: 980000, diasAtraso: 18 },
    { id: 2, nombre: "María López", cuota: 4, totalCuotas: 10, valor: 320000, diasAtraso: 0 },
    { id: 3, nombre: "Ana Gómez", cuota: 2, totalCuotas: 6, valor: 215000, diasAtraso: -1 },
  ],
};

/* =========================================================
   2. FUNCIONES DE AYUDA
   ========================================================= */
const formatCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

const formatCompacto = (valor) => {
  if (valor >= 1_000_000) {
    return "$" + (valor / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + "M";
  }
  if (valor >= 1_000) return "$" + Math.round(valor / 1_000) + "K";
  return "$" + valor;
};

const iniciales = (nombre) =>
  nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

const saludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
};

const fechaHoy = () => {
  const texto = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Decide qué etiqueta y color lleva cada cliente según su atraso
const estadoAtraso = (dias) => {
  if (dias > 0) return { texto: `${dias} días de atraso`, tipo: "bad" };
  if (dias === 0) return { texto: "Vence hoy", tipo: "bad" };
  if (dias === -1) return { texto: "Vence mañana", tipo: "warn" };
  return { texto: `Vence en ${Math.abs(dias)} días`, tipo: "neutral" };
};

/* =========================================================
   3. COMPONENTES PEQUEÑOS
   ========================================================= */

// Línea de evolución de la cartera
function Sparkline({ valores }) {
  const ancho = 300;
  const alto = 56;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;

  const puntos = valores
    .map((v, i) => {
      const x = (i / (valores.length - 1)) * ancho;
      const y = alto - 6 - ((v - min) / rango) * (alto - 12);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="dsh-spark" viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none"
      role="img" aria-label="Evolución de la cartera en los últimos 6 meses">
      <polyline points={puntos} fill="none" stroke="var(--dsh-brand)" strokeWidth="2"
        vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

// Barra de salud: al día / 1-30 / +30
function SaludCartera({ salud, totalCreditos }) {
  const tramos = [
    { label: "Al día", valor: salud.alDia, color: "var(--dsh-brand)" },
    { label: "1–30 días", valor: salud.mora1a30, color: "var(--dsh-warn)" },
    { label: "+30 días", valor: salud.moraMas30, color: "var(--dsh-bad)" },
  ];

  return (
    <div className="dsh-salud">
      <div className="dsh-salud-head">
        <span>Estado de la cartera</span>
        <span>{totalCreditos} créditos</span>
      </div>
      <div className="dsh-stack">
        {tramos.map((t) => (
          <i key={t.label} style={{ width: `${t.valor}%`, background: t.color }}
            title={`${t.label}: ${t.valor}%`} />
        ))}
      </div>
      <div className="dsh-legend">
        {tramos.map((t) => (
          <span key={t.label}>
            <i style={{ background: t.color }} />
            {t.label} · <b>{t.valor}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}

// Tarjeta pequeña reutilizable
function KpiCard({ label, valor, detalle, peligro = false, children }) {
  return (
    <div className="dsh-card">
      <div className="dsh-label">{label}</div>
      <div className={`dsh-num ${peligro ? "is-bad" : ""}`}>{valor}</div>
      {children}
      {detalle && <div className="dsh-muted">{detalle}</div>}
    </div>
  );
}

// Gráfica de barras del recaudo mensual
function RecaudoChart({ datos }) {
  const max = Math.max(...datos.map((d) => d.valor));

  return (
    <div className="dsh-card">
      <p className="dsh-title">Recaudo mensual</p>
      <p className="dsh-subtitle">Últimos 6 meses</p>
      <div className="dsh-bars">
        {datos.map((d, i) => {
          const esActual = i === datos.length - 1;
          return (
            <div key={d.mes} className="dsh-bcol">
              {esActual && <span className="dsh-bval">{formatCompacto(d.valor)}</span>}
              <div className={`dsh-bar ${esActual ? "is-current" : ""}`}
                style={{ height: `${(d.valor / max) * 100}%` }}>
                <span className="dsh-tip">{d.mes} · {formatCOP(d.valor)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dsh-xaxis">
        {datos.map((d, i) => (
          <span key={d.mes} className={i === datos.length - 1 ? "is-current" : ""}>{d.mes}</span>
        ))}
      </div>
    </div>
  );
}

// Lista de clientes que requieren atención
function AtencionList({ clientes, onVerTodo }) {
  return (
    <div className="dsh-card">
      <p className="dsh-title">Requieren atención</p>
      <p className="dsh-subtitle">Ordenado por días de atraso</p>
      {clientes.map((c) => {
        const estado = estadoAtraso(c.diasAtraso);
        return (
          <div key={c.id} className="dsh-row">
            <div className="dsh-avatar">{iniciales(c.nombre)}</div>
            <div className="dsh-grow">
              <div className="dsh-name">{c.nombre}</div>
              <div className="dsh-muted">Cuota {c.cuota} de {c.totalCuotas}</div>
            </div>
            <div className="dsh-right">
              <div className="dsh-amount">{formatCOP(c.valor)}</div>
              <span className={`dsh-chip is-${estado.tipo}`}>{estado.texto}</span>
            </div>
          </div>
        );
      })}
      <div className="dsh-footer">
        <button className="dsh-btn-ghost" onClick={onVerTodo}>Ver cartera en mora →</button>
      </div>
    </div>
  );
}

/* =========================================================
   4. PÁGINA PRINCIPAL
   ========================================================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("mes");
  const d = DATA;

  const nombre = localStorage.getItem("user_name") || "";
  const porcentajeRecaudo = Math.round((d.recaudoMes / d.recaudoEsperado) * 100);

  return (
    <div className="dsh-page">
      <style>{CSS}</style>

      {/* Encabezado */}
      <header className="dsh-header">
        <div>
          <h1 className="dsh-hello">{saludo()}{nombre && `, ${nombre}`}</h1>
          <div className="dsh-date">{fechaHoy()}</div>
        </div>
        <div className="dsh-seg" role="tablist" aria-label="Periodo">
          {[
            { id: "hoy", label: "Hoy" },
            { id: "mes", label: "Este mes" },
            { id: "anio", label: "Año" },
          ].map((p) => (
            <button key={p.id} role="tab" aria-selected={periodo === p.id}
              className={periodo === p.id ? "is-on" : ""} onClick={() => setPeriodo(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <main className="dsh-body">
        {/* Fila de arriba: tarjeta grande + 4 KPIs */}
        <section className="dsh-top">
          <div className="dsh-card">
            <div className="dsh-label">Total por cobrar</div>
            <div className="dsh-big">{formatCOP(d.porCobrar)}</div>
            <Sparkline valores={d.evolucionCartera} />
            <SaludCartera salud={d.salud} totalCreditos={d.totalCreditos} />
          </div>

          <div className="dsh-kpis">
            <KpiCard label="Recaudo del mes" valor={formatCompacto(d.recaudoMes)}
              detalle={`${porcentajeRecaudo}% de ${formatCompacto(d.recaudoEsperado)} esperado`}>
              <div className="dsh-progress">
                <i style={{ width: `${Math.min(porcentajeRecaudo, 100)}%` }} />
              </div>
            </KpiCard>

            <KpiCard label="En mora" valor={d.enMora.cantidad} peligro
              detalle={`${formatCOP(d.enMora.monto)} comprometidos`} />

            <KpiCard label="Créditos activos" valor={d.creditosActivos}
              detalle={`${d.creditosNuevosMes} nuevos este mes`} />

            <KpiCard label="Clientes con crédito" valor={d.clientesConCredito}
              detalle={`de ${d.clientesRegistrados} registrados`} />
          </div>
        </section>

        {/* Fila de abajo: gráfica + lista */}
        <section className="dsh-bottom">
          <RecaudoChart datos={d.recaudoMensual} />
          <AtencionList clientes={d.atencion} onVerTodo={() => navigate("/pagos")} />
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   5. ESTILOS
   ========================================================= */
const CSS = `
.dsh-page{
  --dsh-brand:#2563eb; --dsh-brand-soft:#eff6ff; --dsh-brand-light:#dbeafe;
  --dsh-warn:#d97706; --dsh-warn-soft:#fffbeb;
  --dsh-bad:#dc2626;  --dsh-bad-soft:#fef2f2;
  --dsh-good:#059669;
  --dsh-ink:#0f172a; --dsh-ink2:#475569; --dsh-muted:#94a3b8;
  --dsh-line:#e2e8f0; --dsh-line2:#f1f5f9;
  background:#f8fafc; min-height:100vh; font-family:'DM Sans',system-ui,sans-serif; color:var(--dsh-ink);
}
.dsh-header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;
  padding:16px 20px;background:#fff;border-bottom:1px solid var(--dsh-line2)}
.dsh-hello{font-size:18px;font-weight:700;margin:0}
.dsh-date{font-size:12px;color:var(--dsh-muted);margin-top:2px}

.dsh-seg{display:flex;background:var(--dsh-line2);border-radius:10px;padding:3px}
.dsh-seg button{border:0;background:none;font:600 12px 'DM Sans',system-ui,sans-serif;color:var(--dsh-ink2);
  padding:6px 12px;border-radius:8px;cursor:pointer}
.dsh-seg button.is-on{background:#fff;color:var(--dsh-ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}

.dsh-body{padding:18px 20px;max-width:1180px;margin:0 auto}
.dsh-top,.dsh-bottom{display:grid;gap:14px;grid-template-columns:1fr}
.dsh-bottom{margin-top:14px}
@media (min-width:900px){
  .dsh-top{grid-template-columns:1.25fr 1fr}
  .dsh-bottom{grid-template-columns:1.4fr 1fr}
}
.dsh-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px}

.dsh-card{background:#fff;border:1px solid var(--dsh-line2);border-radius:14px;padding:16px;
  box-shadow:0 1px 3px rgba(0,0,0,.05)}
.dsh-label{font-size:12px;font-weight:500;color:var(--dsh-ink2)}
.dsh-big{font-size:34px;font-weight:800;letter-spacing:-1px;line-height:1.1;margin-top:6px}
.dsh-num{font-size:22px;font-weight:800;letter-spacing:-.5px;margin:6px 0 8px}
.dsh-num.is-bad{color:var(--dsh-bad)}
.dsh-muted{font-size:11px;color:var(--dsh-muted)}
.dsh-title{font-size:13px;font-weight:700;margin:0 0 2px}
.dsh-subtitle{font-size:11px;color:var(--dsh-muted);margin:0 0 12px}

.dsh-spark{display:block;width:100%;height:56px;margin-top:14px}

.dsh-salud{margin-top:12px}
.dsh-salud-head{display:flex;justify-content:space-between;font-size:11px;color:var(--dsh-muted)}
.dsh-stack{display:flex;gap:2px;height:14px;border-radius:7px;overflow:hidden;margin-top:6px}
.dsh-stack i{display:block;height:100%}
.dsh-legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px}
.dsh-legend span{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsh-ink2)}
.dsh-legend i{width:9px;height:9px;border-radius:3px;display:inline-block}

.dsh-progress{height:8px;border-radius:4px;background:var(--dsh-line2);overflow:hidden;margin-bottom:6px}
.dsh-progress i{display:block;height:100%;background:var(--dsh-good);border-radius:4px}

.dsh-bars{display:flex;align-items:flex-end;gap:10px;height:150px;padding-top:18px;border-bottom:1px solid var(--dsh-line)}
.dsh-bcol{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
.dsh-bar{width:70%;max-width:34px;border-radius:4px 4px 0 0;background:var(--dsh-brand-light);position:relative}
.dsh-bar.is-current{background:var(--dsh-brand)}
.dsh-bar:hover{filter:brightness(.92)}
.dsh-tip{display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
  background:var(--dsh-ink);color:#fff;font-size:11px;padding:4px 7px;border-radius:6px;white-space:nowrap;z-index:2}
.dsh-bar:hover .dsh-tip{display:block}
.dsh-bval{font-size:10px;font-weight:700;color:var(--dsh-brand);margin-bottom:4px}
.dsh-xaxis{display:flex;gap:10px;margin-top:6px}
.dsh-xaxis span{flex:1;text-align:center;font-size:10px;color:var(--dsh-muted)}
.dsh-xaxis span.is-current{color:var(--dsh-ink);font-weight:700}

.dsh-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--dsh-line2)}
.dsh-row:last-of-type{border-bottom:0}
.dsh-avatar{width:32px;height:32px;border-radius:9px;background:var(--dsh-brand-soft);color:var(--dsh-brand);
  font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dsh-grow{flex:1;min-width:0}
.dsh-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-right{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.dsh-amount{font-size:13px;font-weight:700}
.dsh-chip{font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap}
.dsh-chip.is-bad{background:var(--dsh-bad-soft);color:var(--dsh-bad)}
.dsh-chip.is-warn{background:var(--dsh-warn-soft);color:var(--dsh-warn)}
.dsh-chip.is-neutral{background:var(--dsh-line2);color:var(--dsh-ink2)}
.dsh-footer{text-align:right;margin-top:8px}
.dsh-btn-ghost{border:0;background:var(--dsh-brand-soft);color:var(--dsh-brand);
  font:600 12px 'DM Sans',system-ui,sans-serif;padding:7px 12px;border-radius:9px;cursor:pointer}
.dsh-btn-ghost:hover{background:var(--dsh-brand-light)}
`;
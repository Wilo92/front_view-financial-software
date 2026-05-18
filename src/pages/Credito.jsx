import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import {
  FaDollarSign, FaPercent, FaListOl, FaCalendarAlt,
  FaRedo, FaClock, FaSave, FaChevronDown, FaUserCircle,
  FaIdCard, FaChartLine, FaInfoCircle
} from "react-icons/fa";

const fmt = (n) => Number(n).toLocaleString("es-CO");

const FRECUENCIAS = [
  { value: "diario",    label: "Diario"      },
  { value: "semanal",   label: "Semanal"     },
  { value: "quincenal", label: "Quincenal"   },
  { value: "mensual",   label: "Mensual"     },
];

const TIPOS = [
  { value: "cuota_fija",     label: "Cuotas Fijas"              },
  { value: "abono_capital",  label: "Abono Fijo a Capital"       },
  { value: "solo_intereses", label: "Solo Intereses (Final)"     },
  { value: "interes_simple", label: "Interés Simple (Fijo)"      },
];

const EMPTY_FORM = (id = "") => ({
  deudor_id: id, monto: "", tasa_interes: "", numero_cuotas: "",
  fecha_inicio: "", tipo_prestamo: "cuota_fija", frecuencia: "mensual",
  observaciones: ""
});

export default function Credito() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form,              setForm]              = useState(EMPTY_FORM(id));
  const [deudor,            setDeudor]            = useState(null);
  const [planProyectado,    setPlanProyectado]    = useState([]);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [saving,            setSaving]            = useState(false);

  /* ── Cargar deudor ─────────────────────────────────────────── */
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

  /* ── Simulación automática ─────────────────────────────────── */
  useEffect(() => {
    const simular = async () => {
      const { monto, tasa_interes, numero_cuotas, fecha_inicio } = form;
      if (monto > 0 && tasa_interes > 0 && numero_cuotas > 0 && fecha_inicio) {
        setLoadingSimulation(true);
        try {
          const res = await clienteAxios.post("/api/creditos/simular", form);
          setPlanProyectado(res.data);
        } catch (e) {
          console.error("Error en simulación", e);
        } finally {
          setLoadingSimulation(false);
        }
      }
    };
    const timer = setTimeout(simular, 500);
    return () => clearTimeout(timer);
  }, [form]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clienteAxios.post("/api/creditos", form);
      setForm(EMPTY_FORM(id));
      setPlanProyectado([]);
      alert("Crédito creado correctamente");
    } catch (error) {
      alert("Error al crear crédito");
    } finally {
      setSaving(false);
    }
  };

  /* ── Totales simulación ────────────────────────────────────── */
  const totalCapital  = planProyectado.reduce((s, c) => s + Number(c.capital), 0);
  const totalInteres  = planProyectado.reduce((s, c) => s + Number(c.interes), 0);
  const totalPagar    = planProyectado.reduce((s, c) => s + Number(c.monto_cuota), 0);

  return (
    <div className="cr-root min-h-screen" style={{ background: "#f0f4ff" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .cr-root  { font-family: 'DM Sans', sans-serif; }
        .cr-title { font-family: 'Sora', sans-serif; }

        /* Header */
        .cr-page-header {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
          padding: 28px 24px 52px;
          position: relative; overflow: hidden;
        }
        .cr-page-header::before {
          content:''; position:absolute; top:-50px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          background:rgba(255,255,255,0.07);
        }
        .cr-page-header::after {
          content:''; position:absolute; bottom:-30px; left:25%;
          width:150px; height:150px; border-radius:50%;
          background:rgba(255,255,255,0.05);
        }

        .cr-shell {
          max-width: 1100px;
          margin: -28px auto 0;
          padding: 0 16px 48px;
          position: relative; z-index: 10;
        }

        /* Cards base */
        .cr-card {
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 8px 40px rgba(59,130,246,0.11), 0 1px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .cr-card-header {
          padding: 16px 22px;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(135deg, #f8faff, #eff6ff);
        }
        .cr-card-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* Deudor badge */
        .cr-deudor-card {
          background: linear-gradient(135deg, #eff6ff, #f5f3ff);
          border: 1.5px solid #bfdbfe;
          border-radius: 18px;
          padding: 18px 20px;
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .cr-deudor-avatar {
          width: 50px; height: 50px; border-radius: 15px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* Labels e inputs */
        .cr-label {
          display: block;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #94a3b8; margin-bottom: 5px; margin-left: 2px;
        }
        .cr-field { position: relative; }
        .cr-field-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 13px; pointer-events: none;
          transition: color 0.2s;
        }
        .cr-input {
          width: 100%;
          padding: 11px 12px 11px 36px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #f8faff;
          font-size: 0.875rem; color: #1e293b;
          outline: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cr-input:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .cr-field:focus-within .cr-field-icon { color: #3b82f6; }
        .cr-input::placeholder { color: #c0cdd8; }

        /* Select */
        .cr-select-wrap { position: relative; }
        .cr-select-wrap .cr-chev {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          color:#94a3b8; font-size:10px; pointer-events:none;
        }
        .cr-select { appearance: none; padding-right: 30px; cursor: pointer; }

        /* Submit */
        .cr-btn-submit {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700; font-size: 0.95rem;
          border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(5,150,105,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
        }
        .cr-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(5,150,105,0.4);
        }
        .cr-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        @keyframes cr-spin { to{transform:rotate(360deg)} }
        .cr-spinner {
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:cr-spin 0.7s linear infinite;
        }

        /* Totales */
        .cr-totals {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
          margin-bottom: 16px;
        }
        .cr-total-chip {
          border-radius: 14px; padding: 12px 10px; text-align: center;
        }

        /* Tabla simulación */
        .cr-sim-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
        .cr-sim-table thead th {
          padding: 8px 10px;
          background: #f8faff;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 2px solid #e2e8f0;
          position: sticky; top: 0;
        }
        .cr-sim-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }
        .cr-sim-table tbody tr:hover { background: #f0f9ff; }
        .cr-sim-table td { padding: 8px 10px; color: #475569; }

        /* Loader dots */
        @keyframes cr-bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .cr-dot { width:8px;height:8px;border-radius:50%;background:#3b82f6;display:inline-block; }
        .cr-dot:nth-child(1){animation:cr-bounce 1.2s ease infinite}
        .cr-dot:nth-child(2){animation:cr-bounce 1.2s ease infinite;animation-delay:0.16s}
        .cr-dot:nth-child(3){animation:cr-bounce 1.2s ease infinite;animation-delay:0.32s}

        .cr-divider {
          height:1px;
          background:linear-gradient(90deg,transparent,#e2e8f0,transparent);
          margin: 4px 0 16px;
        }

        /* Grid layout */
        .cr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media(min-width:768px){
          .cr-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="cr-page-header">
        <div className="relative z-10" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="cr-title text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Gestión de crédito
          </p>
          <h1 className="cr-title text-white text-2xl md:text-3xl font-bold">
            Nuevo Crédito
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Configura y simula el plan de pagos en tiempo real
          </p>
        </div>
      </div>

      <div className="cr-shell">

        {/* ── DEUDOR CARD ── */}
        {deudor && (
          <div className="cr-deudor-card">
            <div className="cr-deudor-avatar">
              <FaUserCircle color="#fff" size={24}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">
                Cliente seleccionado
              </p>
              <p className="cr-title font-bold text-slate-800 text-base truncate">{deudor.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <FaIdCard size={10} color="#94a3b8"/>
                <p className="text-xs text-slate-500">{deudor.documento_numero}</p>
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 50,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              color:"#fff", fontSize:11, fontWeight:700,
            }}>
              Activo
            </div>
          </div>
        )}

        {/* ── GRID FORM + SIMULACIÓN ── */}
        <div className="cr-grid">

          {/* ── FORMULARIO ── */}
          <div className="cr-card">
            <div className="cr-card-header">
              <div className="cr-card-icon" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                <FaDollarSign color="#fff" size={16}/>
              </div>
              <div>
                <p className="cr-title font-bold text-slate-700 text-sm">Parámetros del crédito</p>
                <p className="text-xs text-slate-400">Completa para simular automáticamente</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Monto */}
              <div>
                <label className="cr-label">Monto del préstamo</label>
                <div className="cr-field">
                  <FaDollarSign className="cr-field-icon"/>
                  <input type="number" name="monto" value={form.monto}
                    onChange={handleChange} required placeholder="Ej: 500000"
                    className="cr-input"/>
                </div>
              </div>

              {/* Interés + Cuotas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="cr-label">% Interés por periodo</label>
                  <div className="cr-field">
                    <FaPercent className="cr-field-icon" style={{ fontSize:11 }}/>
                    <input type="number" name="tasa_interes" value={form.tasa_interes}
                      onChange={handleChange} required placeholder="Ej: 5"
                      className="cr-input"/>
                  </div>
                </div>
                <div>
                  <label className="cr-label">Cant. cuotas</label>
                  <div className="cr-field">
                    <FaListOl className="cr-field-icon" style={{ fontSize:11 }}/>
                    <input type="number" name="numero_cuotas" value={form.numero_cuotas}
                      onChange={handleChange} required placeholder="Ej: 12"
                      className="cr-input"/>
                  </div>
                </div>
              </div>

              {/* Frecuencia + Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="cr-label">Frecuencia de pago</label>
                  <div className="cr-field cr-select-wrap">
                    <FaClock className="cr-field-icon" style={{ fontSize:11 }}/>
                    <select name="frecuencia" value={form.frecuencia}
                      onChange={handleChange} className="cr-input cr-select">
                      {FRECUENCIAS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="cr-chev"/>
                  </div>
                </div>
                <div>
                  <label className="cr-label">Método de pago</label>
                  <div className="cr-field cr-select-wrap">
                    <FaRedo className="cr-field-icon" style={{ fontSize:11 }}/>
                    <select name="tipo_prestamo" value={form.tipo_prestamo}
                      onChange={handleChange} className="cr-input cr-select">
                      {TIPOS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="cr-chev"/>
                  </div>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="cr-label">Fecha del primer pago</label>
                <div className="cr-field">
                  <FaCalendarAlt className="cr-field-icon" style={{ fontSize:12 }}/>
                  <input type="date" name="fecha_inicio" value={form.fecha_inicio}
                    onChange={handleChange} required className="cr-input"/>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="cr-label">Observaciones</label>
                <div className="cr-field">
                  <FaInfoCircle className="cr-field-icon" style={{ top:14, transform:"none", fontSize:12 }}/>
                  <textarea name="observaciones" value={form.observaciones}
                    onChange={handleChange} rows={2}
                    placeholder="Notas adicionales..."
                    className="cr-input" style={{ paddingTop:10, paddingBottom:10, resize:"none" }}/>
                </div>
              </div>

              <div className="cr-divider"/>

              <button type="submit" disabled={saving} className="cr-btn-submit">
                {saving
                  ? <><div className="cr-spinner"/> Guardando crédito...</>
                  : <><FaSave size={14}/> Generar y Guardar Crédito</>
                }
              </button>
            </form>
          </div>

          {/* ── SIMULACIÓN ── */}
          <div className="cr-card flex flex-col">
            <div className="cr-card-header">
              <div className="cr-card-icon" style={{ background:"linear-gradient(135deg,#059669,#047857)" }}>
                <FaChartLine color="#fff" size={15}/>
              </div>
              <div>
                <p className="cr-title font-bold text-slate-700 text-sm">Simulación en tiempo real</p>
                <p className="text-xs text-slate-400">Se actualiza automáticamente</p>
              </div>
              {loadingSimulation && (
                <div className="ml-auto flex items-end gap-1 pb-1">
                  <div className="cr-dot"/>
                  <div className="cr-dot"/>
                  <div className="cr-dot"/>
                </div>
              )}
            </div>

            <div className="flex-1 p-5 flex flex-col">
              {loadingSimulation && planProyectado.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                  <div className="flex gap-1.5">
                    <div className="cr-dot"/>
                    <div className="cr-dot"/>
                    <div className="cr-dot"/>
                  </div>
                  <p className="text-slate-400 text-sm italic">Calculando cuotas...</p>
                </div>
              ) : planProyectado.length > 0 ? (
                <>
                  {/* Totales */}
                  <div className="cr-totals">
                    <div className="cr-total-chip" style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe" }}>
                      <p style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#93c5fd",marginBottom:4 }}>
                        Capital
                      </p>
                      <p className="cr-title font-bold text-blue-700 text-sm">${fmt(totalCapital)}</p>
                    </div>
                    <div className="cr-total-chip" style={{ background:"#fff1f2", border:"1.5px solid #fecdd3" }}>
                      <p style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#fca5a5",marginBottom:4 }}>
                        Intereses
                      </p>
                      <p className="cr-title font-bold text-red-500 text-sm">${fmt(totalInteres)}</p>
                    </div>
                    <div className="cr-total-chip" style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0" }}>
                      <p style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#86efac",marginBottom:4 }}>
                        Total
                      </p>
                      <p className="cr-title font-bold text-emerald-600 text-sm">${fmt(totalPagar)}</p>
                    </div>
                  </div>

                  {/* Tabla */}
                  <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100" style={{ maxHeight:380 }}>
                    <table className="cr-sim-table">
                      <thead>
                        <tr>
                          <th className="text-left">#</th>
                          <th className="text-left">Fecha</th>
                          <th className="text-right">Capital</th>
                          <th className="text-right">Interés</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planProyectado.map((cuota, i) => (
                          <tr key={i}>
                            <td>
                              <span style={{
                                display:"inline-flex",alignItems:"center",justifyContent:"center",
                                width:22,height:22,borderRadius:6,
                                background:"#eff6ff",color:"#3b82f6",
                                fontSize:10,fontWeight:700,
                              }}>
                                {cuota.numero_cuota}
                              </span>
                            </td>
                            <td style={{ fontSize:"0.75rem", color:"#64748b" }}>
                              {cuota.fecha_vencimiento}
                            </td>
                            <td className="text-right" style={{ color:"#475569", fontWeight:500 }}>
                              ${fmt(cuota.capital)}
                            </td>
                            <td className="text-right" style={{ color:"#ef4444", fontWeight:500 }}>
                              ${fmt(cuota.interes)}
                            </td>
                            <td className="text-right">
                              <span style={{
                                fontWeight:700, color:"#059669",
                                background:"#f0fdf4", padding:"2px 8px",
                                borderRadius:6, fontSize:"0.8rem",
                              }}>
                                ${fmt(cuota.monto_cuota)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                  <div style={{
                    width:64,height:64,borderRadius:20,
                    background:"linear-gradient(135deg,#eff6ff,#f5f3ff)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    border:"1.5px dashed #bfdbfe",
                  }}>
                    <FaChartLine size={24} color="#93c5fd"/>
                  </div>
                  <div className="text-center">
                    <p className="cr-title font-bold text-slate-400 text-sm">Sin simulación aún</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Completa los datos del formulario para ver la proyección automáticamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
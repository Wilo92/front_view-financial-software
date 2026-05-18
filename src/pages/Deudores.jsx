import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import {
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaStickyNote, FaPlus, FaEdit, FaTrash, FaCreditCard,
  FaSearch, FaTimes, FaChevronDown
} from "react-icons/fa";

const TIPOS_DOC = [
  { value: "CC",  label: "Cédula de Ciudadanía (CC)" },
  { value: "NIT", label: "NIT" },
  { value: "CE",  label: "Cédula Extranjería (CE)" },
  { value: "PP",  label: "Pasaporte (PP)" },
];

const EMPTY_FORM = {
  nombre: "", tipo_documento: "CC", documento_numero: "",
  telefono: "", email: "", direccion: "", foto: null, comentarios: ""
};

export default function Deudores() {
  const [deudores,    setDeudores]    = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editId,      setEditId]      = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [search,      setSearch]      = useState("");
  const [deleting,    setDeleting]    = useState(null);   // id en proceso de eliminar
  const [saving,      setSaving]      = useState(false);
  const navigate = useNavigate();

  /* ── Fetch ────────────────────────────────────────────────── */
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

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await clienteAxios.put(`/api/deudores/${editId}`, form);
      } else {
        await clienteAxios.post("/api/deudores", form);
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchDeudores();
    } catch (error) {
      console.error("Error al guardar:", error.response?.data);
      alert("No se pudo guardar la información.");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    setDeleting(id);
    try {
      await clienteAxios.delete(`/api/deudores/${id}`);
      fetchDeudores();
    } catch (error) {
      console.error("Error al eliminar:", error.response);
    } finally {
      setDeleting(null);
    }
  };

  const editar = (d) => {
    setForm({
      nombre: d.nombre, tipo_documento: d.tipo_documento,
      documento_numero: d.documento_numero, telefono: d.telefono,
      email: d.email || "", direccion: d.direccion || "",
      comentarios: d.comentarios || "", foto: null
    });
    setEditId(d.id);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const cancelar = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const credito = (d) => navigate(`/creditos/crear/${d.id}`);

  /* ── Filtro búsqueda ──────────────────────────────────────── */
  const filtered = deudores.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.nombre?.toLowerCase().includes(q) ||
      d.documento_numero?.toLowerCase().includes(q) ||
      d.telefono?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  /* ── Initiales avatar ─────────────────────────────────────── */
  const initials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  const AVATAR_COLORS = [
    "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"
  ];
  const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  return (
    <div className="ddr-root min-h-screen bg-[#f0f4ff] pb-16">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .ddr-root { font-family: 'DM Sans', sans-serif; }
        .ddr-title { font-family: 'Sora', sans-serif; }

        .ddr-bg {
          background:
            radial-gradient(ellipse 50% 40% at 10% 20%, rgba(59,130,246,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 90% 80%, rgba(99,102,241,0.09) 0%, transparent 70%),
            #f0f4ff;
        }

        /* ── Page header ── */
        .ddr-page-header {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
          padding: 28px 24px 48px;
          position: relative;
          overflow: hidden;
        }
        .ddr-page-header::before {
          content:'';position:absolute;top:-40px;right:-40px;
          width:200px;height:200px;border-radius:50%;
          background:rgba(255,255,255,0.07);
        }
        .ddr-page-header::after {
          content:'';position:absolute;bottom:-30px;left:30%;
          width:140px;height:140px;border-radius:50%;
          background:rgba(255,255,255,0.05);
        }

        /* ── Card contenedor ── */
        .ddr-shell {
          max-width: 900px;
          margin: -24px auto 0;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }

        /* ── Form card ── */
        .ddr-form-card {
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 8px 40px rgba(59,130,246,0.13), 0 1px 4px rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .ddr-form-header {
          background: linear-gradient(135deg, #eff6ff, #f0f4ff);
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Inputs ── */
        .ddr-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-bottom: 5px;
          margin-left: 2px;
        }
        .ddr-input-wrap { position: relative; }
        .ddr-input-icon {
          position: absolute;
          left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 13px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .ddr-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #f8faff;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddr-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .ddr-input-wrap:focus-within .ddr-input-icon { color: #3b82f6; }
        .ddr-input::placeholder { color: #c0cdd8; }

        /* Select flecha custom */
        .ddr-select-wrap { position: relative; }
        .ddr-select-wrap .ddr-chevron {
          position: absolute;
          right: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 11px; pointer-events: none;
        }
        .ddr-select { appearance: none; padding-right: 32px; }

        /* ── Botones ── */
        .ddr-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 10px;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; border: none;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddr-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ddr-btn:active:not(:disabled) { transform: translateY(0); }
        .ddr-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ddr-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .ddr-btn-ghost {
          background: rgba(100,116,139,0.1);
          color: #64748b;
        }
        .ddr-btn-ghost:hover:not(:disabled) { background: rgba(100,116,139,0.18); }

        /* ── FAB ── */
        .ddr-fab {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 20px; border-radius: 50px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; font-weight: 700; font-size: 0.88rem;
          border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(59,130,246,0.4);
          transition: transform 0.18s, box-shadow 0.18s;
          font-family: 'Sora', sans-serif;
        }
        .ddr-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,130,246,0.45); }

        /* ── Search bar ── */
        .ddr-search-wrap { position: relative; }
        .ddr-search {
          width: 100%;
          padding: 11px 16px 11px 40px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: #fff;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddr-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .ddr-search::placeholder { color: #c0cdd8; }

        /* ── Cliente card ── */
        .ddr-client-card {
          background: #fff;
          border-radius: 18px;
          border: 1.5px solid #f1f5f9;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
        }
        .ddr-client-card:hover {
          box-shadow: 0 8px 28px rgba(59,130,246,0.12);
          border-color: #bfdbfe;
          transform: translateY(-2px);
        }

        .ddr-avatar {
          width: 46px; height: 46px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 15px;
          color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        /* Acciones */
        .ddr-action {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 9px;
          border: none; cursor: pointer;
          transition: background 0.18s, transform 0.15s;
          flex-shrink: 0;
        }
        .ddr-action:hover { transform: scale(1.1); }
        .ddr-action-edit  { background: #fef3c7; color: #d97706; }
        .ddr-action-edit:hover  { background: #fde68a; }
        .ddr-action-del   { background: #fee2e2; color: #dc2626; }
        .ddr-action-del:hover   { background: #fecaca; }
        .ddr-action-credit { background: #d1fae5; color: #059669; }
        .ddr-action-credit:hover { background: #a7f3d0; }

        /* Spinner */
        @keyframes ddr-spin { to{transform:rotate(360deg)} }
        .ddr-spinner {
          width:14px;height:14px;border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:ddr-spin 0.7s linear infinite;
        }

        /* Empty state */
        .ddr-empty {
          text-align: center;
          padding: 48px 20px;
          color: #94a3b8;
        }

        /* Animación entrada cards */
        @keyframes ddr-slide-in {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ddr-client-card { animation: ddr-slide-in 0.3s ease both; }

        .ddr-divider {
          height:1px;
          background:linear-gradient(90deg,transparent,#e2e8f0,transparent);
          margin: 0;
        }

        /* Badge tipo doc */
        .ddr-badge {
          display:inline-flex;align-items:center;
          padding:2px 8px;border-radius:6px;
          font-size:10px;font-weight:700;
          background:#eff6ff;color:#2563eb;
          flex-shrink:0;
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="ddr-page-header">
        <div className="relative z-10 max-w-900 mx-auto px-2">
          <p className="ddr-title text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Panel de gestión
          </p>
          <h1 className="ddr-title text-white text-2xl md:text-3xl font-bold">
            Clientes
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {deudores.length} cliente{deudores.length !== 1 ? "s" : ""} registrado{deudores.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="ddr-shell ddr-bg" style={{ maxWidth: 900, margin: "-24px auto 0", padding: "0 16px", position: "relative", zIndex: 10 }}>

        {/* ── FORM CARD ── */}
        {showForm && (
          <div className="ddr-form-card">
            <div className="ddr-form-header">
              <div className="flex items-center gap-3">
                <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {editId ? <FaEdit color="#fff" size={14}/> : <FaPlus color="#fff" size={14}/>}
                </div>
                <div>
                  <p className="ddr-title font-bold text-slate-700 text-sm">
                    {editId ? "Editar cliente" : "Nuevo cliente"}
                  </p>
                  <p className="text-xs text-slate-400">{editId ? "Modifica los datos del cliente" : "Completa el formulario para registrar"}</p>
                </div>
              </div>
              <button onClick={cancelar} className="ddr-btn ddr-btn-ghost" style={{ padding:"6px 10px" }}>
                <FaTimes size={12}/> Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Nombre */}
              <div>
                <label className="ddr-label">Nombre Completo</label>
                <div className="ddr-input-wrap">
                  <FaUser className="ddr-input-icon"/>
                  <input name="nombre" value={form.nombre} onChange={handleChange}
                    placeholder="Juan Pérez" required className="ddr-input"/>
                </div>
              </div>

              {/* Tipo documento */}
              <div>
                <label className="ddr-label">Tipo de Documento</label>
                <div className="ddr-input-wrap ddr-select-wrap">
                  <FaIdCard className="ddr-input-icon"/>
                  <select name="tipo_documento" value={form.tipo_documento}
                    onChange={handleChange} className="ddr-input ddr-select">
                    {TIPOS_DOC.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <FaChevronDown className="ddr-chevron"/>
                </div>
              </div>

              {/* Documento */}
              <div>
                <label className="ddr-label">Número de Documento</label>
                <div className="ddr-input-wrap">
                  <FaIdCard className="ddr-input-icon"/>
                  <input name="documento_numero" value={form.documento_numero}
                    onChange={handleChange} placeholder="1088..." required className="ddr-input"/>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="ddr-label">Teléfono</label>
                <div className="ddr-input-wrap">
                  <FaPhone className="ddr-input-icon"/>
                  <input name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="+57 300..." required className="ddr-input"/>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="ddr-label">Correo Electrónico</label>
                <div className="ddr-input-wrap">
                  <FaEnvelope className="ddr-input-icon"/>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="usuario@correo.com" className="ddr-input"/>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="ddr-label">Dirección</label>
                <div className="ddr-input-wrap">
                  <FaMapMarkerAlt className="ddr-input-icon"/>
                  <input name="direccion" value={form.direccion} onChange={handleChange}
                    placeholder="Calle 10 #20-30" className="ddr-input"/>
                </div>
              </div>

              {/* Comentarios */}
              <div className="sm:col-span-2">
                <label className="ddr-label">Comentarios</label>
                <div className="ddr-input-wrap">
                  <FaStickyNote className="ddr-input-icon" style={{ top: 14, transform: "none" }}/>
                  <textarea name="comentarios" value={form.comentarios} onChange={handleChange}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="ddr-input" style={{ paddingTop: 10, paddingBottom: 10, resize: "none" }}/>
                </div>
              </div>

              {/* Submit */}
              <div className="sm:col-span-2 flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="ddr-btn ddr-btn-primary flex-1 justify-center" style={{ padding:"11px" }}>
                  {saving
                    ? <><div className="ddr-spinner"/> Guardando...</>
                    : <><FaPlus size={11}/> {editId ? "Actualizar cliente" : "Guardar cliente"}</>
                  }
                </button>
                <button type="button" onClick={cancelar} className="ddr-btn ddr-btn-ghost">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── BARRA DE ACCIONES ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 mt-2">
          {/* Búsqueda */}
          <div className="ddr-search-wrap flex-1">
            <FaSearch style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13 }}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento, teléfono..."
              className="ddr-search"
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",background:"none",border:"none",cursor:"pointer" }}>
                <FaTimes size={12}/>
              </button>
            )}
          </div>

          {/* Botón nuevo */}
          {!showForm && (
            <button className="ddr-fab" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
              <FaPlus size={13}/> Nuevo cliente
            </button>
          )}
        </div>

        {/* ── LISTA DE CLIENTES ── */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="ddr-empty bg-white rounded-2xl">
              <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
              <p className="ddr-title font-bold text-slate-400 text-base">
                {search ? "Sin resultados" : "Sin clientes aún"}
              </p>
              <p className="text-sm mt-1">
                {search ? "Intenta con otro término de búsqueda." : "Agrega tu primer cliente con el botón de arriba."}
              </p>
            </div>
          ) : (
            filtered.map((d, i) => (
              <div key={d.id} className="ddr-client-card" style={{ animationDelay: `${i * 0.04}s` }}>

                {/* Avatar */}
                <div className="ddr-avatar" style={{ background: avatarColor(d.id) }}>
                  {initials(d.nombre)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="ddr-title font-bold text-slate-800 text-sm truncate">{d.nombre}</p>
                    <span className="ddr-badge">{d.tipo_documento}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {d.documento_numero}
                    {d.telefono && <span className="text-slate-300 mx-1">·</span>}
                    {d.telefono}
                  </p>
                  {d.email && (
                    <p className="text-xs text-slate-400 truncate">{d.email}</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => editar(d)} className="ddr-action ddr-action-edit" title="Editar">
                    <FaEdit size={13}/>
                  </button>
                  <button onClick={() => eliminar(d.id)} className="ddr-action ddr-action-del" title="Eliminar"
                    disabled={deleting === d.id} style={{ opacity: deleting === d.id ? 0.5 : 1 }}>
                    <FaTrash size={13}/>
                  </button>
                  <button onClick={() => credito(d)} className="ddr-action ddr-action-credit" title="Crédito">
                    <FaCreditCard size={13}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contador resultados */}
        {search && filtered.length > 0 && (
          <p className="text-xs text-slate-400 text-center mt-4">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "<strong>{search}</strong>"
          </p>
        )}
      </div>
    </div>
  );
}
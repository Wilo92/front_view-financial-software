import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import {
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaStickyNote, FaPlus, FaEdit, FaTrash, FaCreditCard,
  FaSearch, FaTimes, FaChevronDown, FaExclamationTriangle,
  FaUserPlus
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────────── */
const TIPOS_DOC = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "NIT", label: "NIT" },
  { value: "CE", label: "Cédula Extranjería (CE)" },
  { value: "PP", label: "Pasaporte (PP)" },
];

const EMPTY_FORM = {
  nombre: "", tipo_documento: "CC", documento_numero: "",
  telefono: "", email: "", direccion: "", foto: null, comentarios: "",
};

const AVATAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899",
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const initials = (name = "") => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

/* ─────────────────────────────────────────────────────────────
   ERROR DE CAMPO — mensaje rojo debajo de un input
   Laravel manda los errores como arreglos: { nombre: ["mensaje 1", ...] }
   Mostramos solo el primero (mensajes[0]) para no saturar.
───────────────────────────────────────────────────────────── */
const ErrorCampo = ({ id, mensajes }) =>
  mensajes?.length ? (
    <p id={`${id}-error`} className="ddr-error" role="alert">{mensajes[0]}</p>
  ) : null;

/* ─────────────────────────────────────────────────────────────
   TOAST — aviso flotante abajo
───────────────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const meta = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", left: "#10b981", color: "#065f46", icon: "✓", iconBg: "#059669" },
    error: { bg: "#fff1f2", border: "#fecaca", left: "#ef4444", color: "#991b1b", icon: "✕", iconBg: "#ef4444" },
  }[type];

  return (
    <div role="status" aria-live="polite" style={{
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
      <p style={{ flex: 1, fontSize: 13.5, color: meta.color, fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{message}</p>
      <button onClick={onClose} aria-label="Cerrar aviso" style={{
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
───────────────────────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => (
  <div role="dialog" aria-modal="true" aria-labelledby="ddr-confirm-title" style={{
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
      <p id="ddr-confirm-title" style={{ textAlign: "center", fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 6 }}>
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
            ? <><span className="ddr-spinner" /> Eliminando...</>
            : <><FaTrash size={12} /> Eliminar</>
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState({});          // { campo: ["mensaje"] } que manda Laravel
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);        // { type, message }
  const [confirm, setConfirm] = useState(null);        // { id, nombre }
  const navigate = useNavigate();
  const formRef = useRef(null);
  const searchRef = useRef(null);

  /* ── Cargar clientes ── */
  const fetchDeudores = async () => {
    try {
      const res = await clienteAxios.get("/api/deudores");
      setDeudores(res.data.data || res.data);
    } catch (error) {
      // Si es 401, el interceptor de axios ya redirige al login.
      console.error("Error al obtener deudores:", error.response?.status);
    }
  };
  useEffect(() => { fetchDeudores(); }, []);

  /* ─────────────────────────────────────────────────────────────
     estadoCampo: devuelve las props que marcan un campo como inválido.
     Se usa así:  <input {...estadoCampo("nombre", "ddr-nombre")} />
     - className con "is-invalid" si hay error (borde rojo).
     - aria-invalid: le dice al lector de pantalla que el campo tiene error.
     - aria-describedby: conecta el campo con su mensaje de error.
  ───────────────────────────────────────────────────────────── */
  const estadoCampo = (name, id, claseExtra = "") => ({
    className: `ddr-input ${claseExtra}${errores[name] ? " is-invalid" : ""}`,
    "aria-invalid": !!errores[name],
    "aria-describedby": errores[name] ? `${id}-error` : undefined,
  });

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Al corregir un campo le quitamos el error, para que el rojo desaparezca.
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrores({});
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
      if (error.response?.status === 422) {
        // 422 = Laravel rechazó los datos. "errors" dice qué campo falló.
        setErrores(error.response.data.errors || {});
        setToast({ type: "error", message: "Revisa los campos marcados en rojo." });
      } else {
        // Otro error: usamos el mensaje del backend si viene, o uno genérico.
        setToast({
          type: "error",
          message: error.response?.data?.message || "No se pudo guardar. Revisa tu conexión e intenta de nuevo.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Eliminar ── */
  const pedirConfirmacion = (d) => setConfirm({ id: d.id, nombre: d.nombre });

  const confirmarEliminar = async () => {
    if (!confirm) return;
    setDeleting(confirm.id);
    try {
      await clienteAxios.delete(`/api/deudores/${confirm.id}`);
      setToast({ type: "success", message: `${confirm.nombre} eliminado correctamente.` });
      fetchDeudores();
    } catch (error) {
      // Si tiene créditos, Laravel responde 409 con el motivo en "message".
      setToast({
        type: "error",
        message: error.response?.data?.message || "No se pudo eliminar el cliente.",
      });
    } finally {
      setConfirm(null);
      setDeleting(null);
    }
  };

  /* ── Abrir / cerrar formulario ── */
  const abrirNuevo = () => {
    setForm(EMPTY_FORM);
    setErrores({});
    setEditId(null);
    setShowForm(true);
  };

  const editar = (d) => {
    setForm({
      nombre: d.nombre, tipo_documento: d.tipo_documento,
      documento_numero: d.documento_numero, telefono: d.telefono,
      email: d.email || "", direccion: d.direccion || "",
      comentarios: d.comentarios || "", foto: null,
    });
    setErrores({});
    setEditId(d.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const cancelar = () => {
    setForm(EMPTY_FORM);
    setErrores({});
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
      <style>{CSS}</style>

      {/* ══ ENCABEZADO ══ */}
      <div className="ddr-page-header">
        <div className="ddr-hdr-inner">
          <p className="ddr-brand ddr-hdr-kicker">Panel de gestión</p>
          <h1 className="ddr-brand ddr-hdr-title">Clientes</h1>
          <p className="ddr-hdr-sub">
            {deudores.length} cliente{deudores.length !== 1 ? "s" : ""} registrado{deudores.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="ddr-shell">

        {/* ══ FORMULARIO ══ */}
        {showForm && (
          <div className="ddr-form-card" ref={formRef}>
            <div className="ddr-form-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="ddr-form-icon">
                  {editId ? <FaEdit color="#fff" size={14} /> : <FaPlus color="#fff" size={14} />}
                </div>
                <div>
                  <p className="ddr-brand" style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, margin: 0 }}>
                    {editId ? "Editar cliente" : "Nuevo cliente"}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "1px 0 0" }}>
                    {editId ? "Modifica los datos del cliente" : "Completa el formulario para registrar"}
                  </p>
                </div>
              </div>
              <button onClick={cancelar} className="ddr-close-form">
                <FaTimes size={11} /> Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="ddr-form-body" aria-label="Formulario de cliente">

              {/* Nombre */}
              <div className="ddr-field">
                <label htmlFor="ddr-nombre" className="ddr-label">Nombre completo</label>
                <div className="ddr-input-wrap">
                  <FaUser className="ddr-input-icon" />
                  <input id="ddr-nombre" name="nombre" value={form.nombre} onChange={handleChange}
                    placeholder="Juan Pérez" required autoComplete="name" aria-required="true"
                    {...estadoCampo("nombre", "ddr-nombre")} />
                </div>
                <ErrorCampo id="ddr-nombre" mensajes={errores.nombre} />
              </div>

              {/* Tipo de documento */}
              <div className="ddr-field">
                <label htmlFor="ddr-tipodoc" className="ddr-label">Tipo de documento</label>
                <div className="ddr-input-wrap">
                  <FaIdCard className="ddr-input-icon" />
                  <select id="ddr-tipodoc" name="tipo_documento" value={form.tipo_documento}
                    onChange={handleChange}
                    {...estadoCampo("tipo_documento", "ddr-tipodoc", "ddr-select")}>
                    {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <FaChevronDown className="ddr-select-arrow" />
                </div>
                <ErrorCampo id="ddr-tipodoc" mensajes={errores.tipo_documento} />
              </div>

              {/* Número de documento */}
              <div className="ddr-field">
                <label htmlFor="ddr-docnum" className="ddr-label">Número de documento</label>
                <div className="ddr-input-wrap">
                  <FaIdCard className="ddr-input-icon" />
                  <input id="ddr-docnum" name="documento_numero" value={form.documento_numero}
                    onChange={handleChange} placeholder="1088300953" required
                    inputMode={["CC", "NIT"].includes(form.tipo_documento) ? "numeric" : "text"}
                    autoComplete="off" aria-required="true"
                    {...estadoCampo("documento_numero", "ddr-docnum")} />
                </div>
                <ErrorCampo id="ddr-docnum" mensajes={errores.documento_numero} />
              </div>

              {/* Teléfono */}
              <div className="ddr-field">
                <label htmlFor="ddr-tel" className="ddr-label">Teléfono</label>
                <div className="ddr-input-wrap">
                  <FaPhone className="ddr-input-icon" />
                  <input id="ddr-tel" name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="3001234567" required type="tel"
                    inputMode="tel" autoComplete="tel" aria-required="true"
                    {...estadoCampo("telefono", "ddr-tel")} />
                </div>
                <ErrorCampo id="ddr-tel" mensajes={errores.telefono} />
              </div>

              {/* Correo */}
              <div className="ddr-field">
                <label htmlFor="ddr-email" className="ddr-label">Correo electrónico <span className="ddr-optional">(opcional)</span></label>
                <div className="ddr-input-wrap">
                  <FaEnvelope className="ddr-input-icon" />
                  <input id="ddr-email" name="email" type="email" value={form.email}
                    onChange={handleChange} placeholder="usuario@correo.com"
                    inputMode="email" autoComplete="email"
                    {...estadoCampo("email", "ddr-email")} />
                </div>
                <ErrorCampo id="ddr-email" mensajes={errores.email} />
              </div>

              {/* Dirección */}
              <div className="ddr-field">
                <label htmlFor="ddr-dir" className="ddr-label">Dirección <span className="ddr-optional">(opcional)</span></label>
                <div className="ddr-input-wrap">
                  <FaMapMarkerAlt className="ddr-input-icon" />
                  <input id="ddr-dir" name="direccion" value={form.direccion} onChange={handleChange}
                    placeholder="Calle 10 #20-30" autoComplete="street-address"
                    {...estadoCampo("direccion", "ddr-dir")} />
                </div>
                <ErrorCampo id="ddr-dir" mensajes={errores.direccion} />
              </div>

              {/* Comentarios */}
              <div className="ddr-field ddr-form-full">
                <label htmlFor="ddr-comentarios" className="ddr-label">Comentarios <span className="ddr-optional">(opcional)</span></label>
                <div className="ddr-input-wrap">
                  <FaStickyNote className="ddr-input-icon ddr-textarea-icon" />
                  <textarea id="ddr-comentarios" name="comentarios" value={form.comentarios}
                    onChange={handleChange} placeholder="Notas adicionales..." rows={2}
                    {...estadoCampo("comentarios", "ddr-comentarios", "ddr-textarea")} />
                </div>
                <ErrorCampo id="ddr-comentarios" mensajes={errores.comentarios} />
              </div>

              {/* Botones */}
              <div className="ddr-form-full" style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={saving} className="ddr-submit-btn" aria-busy={saving}>
                  {saving
                    ? <><span className="ddr-spinner" /><span>Guardando...</span></>
                    : <>{editId ? <><FaEdit size={13} /> Actualizar cliente</> : <><FaPlus size={12} /> Guardar cliente</>}</>
                  }
                </button>
                <button type="button" onClick={cancelar} className="ddr-cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══ BÚSQUEDA + BOTÓN NUEVO ══ */}
        <div className="ddr-action-bar">
          <div className="ddr-search-wrap">
            <FaSearch className="ddr-search-icon-left" />
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
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {!showForm && (
            <button className="ddr-fab" onClick={abrirNuevo}>
              <FaPlus size={13} /> Nuevo cliente
            </button>
          )}
        </div>

        {/* ══ LISTA ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="ddr-empty">
              <div className="ddr-empty-icon" style={{ background: search ? "#fff7ed" : "#eff6ff" }}>
                {search
                  ? <FaSearch size={26} color="#f59e0b" />
                  : <FaUserPlus size={26} color="#3b82f6" />
                }
              </div>
              <p className="ddr-brand" style={{ fontWeight: 700, color: "#475569", fontSize: 16, marginBottom: 6 }}>
                {search ? "Sin resultados" : "Sin clientes aún"}
              </p>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.5, marginBottom: search ? 0 : 20 }}>
                {search
                  ? <>No hay clientes que coincidan con <strong style={{ color: "#64748b" }}>"{search}"</strong>.</>
                  : "Registra tu primer cliente para comenzar a gestionar créditos."
                }
              </p>
              {!search && (
                <button className="ddr-fab" onClick={abrirNuevo} style={{ margin: "0 auto" }}>
                  <FaPlus size={12} /> Agregar primer cliente
                </button>
              )}
            </div>
          ) : (
            filtered.map((d, i) => (
              <div
                key={d.id}
                className="ddr-client-card"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
              >
                <div className="ddr-avatar" style={{ background: avatarColor(d.id) }}>
                  {initials(d.nombre)}
                </div>

                <div className="ddr-client-info">
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span className="ddr-client-name">{d.nombre}</span>
                    <span className="ddr-doc-badge">{d.tipo_documento}</span>
                  </div>
                  <p className="ddr-client-meta">
                    {d.documento_numero}
                    {d.telefono && <><span style={{ color: "#cbd5e1", margin: "0 5px" }}>·</span>{d.telefono}</>}
                  </p>
                  {d.email && <p className="ddr-client-email">{d.email}</p>}
                </div>

                <div className="ddr-actions">
                  <button className="ddr-action ddr-action-edit" onClick={() => editar(d)}
                    title="Editar cliente" aria-label={`Editar a ${d.nombre}`}>
                    <FaEdit size={14} />
                  </button>
                  <button className="ddr-action ddr-action-del" onClick={() => pedirConfirmacion(d)}
                    title="Eliminar cliente" aria-label={`Eliminar a ${d.nombre}`}
                    disabled={deleting === d.id}>
                    {deleting === d.id
                      ? <span className="ddr-spinner" style={{ borderColor: "rgba(220,38,38,.3)", borderTopColor: "#dc2626" }} />
                      : <FaTrash size={14} />
                    }
                  </button>
                  <button className="ddr-action ddr-action-credit" onClick={() => credito(d)}
                    title="Crear crédito" aria-label={`Crear crédito para ${d.nombre}`}>
                    <FaCreditCard size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {search && filtered.length > 0 && (
          <p className="ddr-results-count">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "<strong style={{ color: "#475569" }}>{search}</strong>"
          </p>
        )}
      </div>

      {/* ══ CONFIRMAR ELIMINACIÓN ══ */}
      {confirm && (
        <ConfirmDialog
          message={`Se eliminará a ${confirm.nombre}. Si tiene créditos registrados, no se podrá eliminar.`}
          onConfirm={confirmarEliminar}
          onCancel={() => setConfirm(null)}
          loading={!!deleting}
        />
      )}

      {/* ══ AVISO ══ */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ESTILOS
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

.ddr-root  { font-family:'DM Sans',system-ui,sans-serif; min-height:100svh; background:#eef2ff; }
.ddr-brand { font-family:'Sora',system-ui,sans-serif !important; }

/* ════ ENCABEZADO ════ */
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
.ddr-hdr-kicker { color:rgba(147,197,253,.85); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; margin:0 0 4px; }
.ddr-hdr-title  { color:#fff; font-size:clamp(20px,5vw,28px); font-weight:700; margin:0; }
.ddr-hdr-sub    { color:rgba(191,219,254,.85); font-size:13px; margin:5px 0 0; }

/* ════ CONTENEDOR ════ */
.ddr-shell {
  max-width: 900px;
  margin: -28px auto 0;
  padding: 0 max(16px, env(safe-area-inset-left)) max(64px, env(safe-area-inset-bottom));
  position: relative; z-index: 10;
}

/* ════ TARJETA DEL FORMULARIO ════ */
.ddr-form-card {
  background: #fff; border-radius: 22px;
  box-shadow: 0 0 0 1px rgba(59,130,246,.07), 0 8px 40px rgba(59,130,246,.13), 0 1px 4px rgba(0,0,0,.05);
  overflow: hidden; margin-bottom: 18px;
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
  display: flex; align-items: center; justify-content: space-between; gap:10px;
}
.ddr-form-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg,#3b82f6,#2563eb);
  display: flex; align-items: center; justify-content: center;
}
.ddr-close-form {
  display:flex; align-items:center; gap:5px;
  min-height:38px; padding:0 14px; border-radius:10px;
  background:rgba(100,116,139,.10); color:#64748b;
  border:none; cursor:pointer; font-size:13px; font-weight:600; font-family:inherit;
  transition:background .15s;
}
.ddr-close-form:hover { background:rgba(100,116,139,.18); }
.ddr-form-body {
  padding: 20px 20px 24px;
  display: grid; grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 540px) {
  .ddr-form-body { grid-template-columns: 1fr 1fr; }
  .ddr-form-full { grid-column: 1 / -1; }
}

/* ════ CAMPOS ════ */
.ddr-field { display:flex; flex-direction:column; gap:6px; }
.ddr-label {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .10em;
  color: #94a3b8; margin-left: 2px;
}
.ddr-optional { text-transform:none; letter-spacing:0; font-weight:500; color:#cbd5e1; }
.ddr-input-wrap { position: relative; }
.ddr-input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; font-size: 13px; pointer-events: none;
  transition: color .18s; z-index: 1;
}
.ddr-input-wrap:focus-within .ddr-input-icon { color: #3b82f6; }
.ddr-input {
  width: 100%;
  min-height: 50px;
  padding: 13px 13px 13px 40px;
  border-radius: 13px;
  border: 2px solid #e8edf5;
  background: #f8faff;
  font-size: 16px;
  color: #1e293b; outline: none;
  transition: border-color .2s, background .2s, box-shadow .2s;
  font-family: 'DM Sans',system-ui,sans-serif;
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

/* Campo con error */
.ddr-input.is-invalid { border-color:#ef4444; background:#fff5f5; }
.ddr-input.is-invalid:focus { box-shadow:0 0 0 4px rgba(239,68,68,.12); }
.ddr-input-wrap:has(.is-invalid) .ddr-input-icon { color:#ef4444; }
.ddr-error {
  font-size:12px; font-weight:500; color:#dc2626;
  margin:0 0 0 4px; line-height:1.4;
  animation: ddrSlideDown .2s ease;
}

.ddr-select { padding-right: 40px; cursor: pointer; }
.ddr-select-arrow {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; font-size: 11px; pointer-events: none;
}
.ddr-textarea {
  min-height: auto;
  padding-top: 13px; padding-bottom: 13px;
  resize: none; line-height: 1.5;
}
.ddr-textarea-icon { top: 15px !important; transform: none !important; }

/* ════ BOTONES DEL FORMULARIO ════ */
.ddr-submit-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 50px; width: 100%;
  border-radius: 13px; border: none; cursor: pointer;
  background: linear-gradient(135deg,#3b82f6,#2563eb);
  color: #fff; font-family: 'Sora',system-ui,sans-serif;
  font-weight: 700; font-size: 15px;
  box-shadow: 0 4px 16px rgba(59,130,246,.35);
  transition: transform .16s, box-shadow .16s, opacity .16s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.ddr-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,.40); }
.ddr-submit-btn:active:not(:disabled) { transform: scale(.98); }
.ddr-submit-btn:disabled { opacity:.62; cursor:not-allowed; }

.ddr-cancel-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 50px; padding: 0 20px; border-radius: 13px;
  background: #f1f5f9; color: #64748b;
  font-family: 'DM Sans',system-ui,sans-serif; font-weight: 600; font-size: 14px;
  border: none; cursor: pointer; flex-shrink: 0;
  transition: background .15s;
}
.ddr-cancel-btn:hover { background: #e2e8f0; }

/* ════ BARRA DE BÚSQUEDA ════ */
.ddr-action-bar {
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 16px; margin-top: 4px;
}
@media (min-width: 540px) {
  .ddr-action-bar { flex-direction: row; align-items: center; }
}
.ddr-search-wrap { position: relative; flex: 1; }
.ddr-search {
  width: 100%; min-height: 50px;
  padding: 13px 40px 13px 44px;
  border-radius: 14px;
  border: 2px solid #e8edf5; background: #fff;
  font-size: 16px; color: #1e293b; outline: none;
  transition: border-color .2s, box-shadow .2s;
  font-family: 'DM Sans',system-ui,sans-serif;
  -webkit-appearance: none;
}
.ddr-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.10); }
.ddr-search::placeholder { color: #c8d4e3; font-size: 14px; }
.ddr-search-icon-left { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:14px; pointer-events:none; }
.ddr-search-clear {
  position:absolute; right:0; top:50%; transform:translateY(-50%);
  width:44px; height:44px; display:flex; align-items:center; justify-content:center;
  background:none; border:none; cursor:pointer; color:#94a3b8;
  border-radius:0 12px 12px 0;
  transition:color .15s;
}
.ddr-search-clear:hover { color:#475569; }

.ddr-fab {
  display: inline-flex; align-items: center; gap: 8px;
  min-height: 50px; padding: 0 22px;
  border-radius: 50px; white-space: nowrap;
  background: linear-gradient(135deg,#3b82f6,#2563eb);
  color: #fff; font-weight: 700; font-size: 14px;
  border: none; cursor: pointer; flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(59,130,246,.38);
  font-family: 'Sora',system-ui,sans-serif;
  transition: transform .18s, box-shadow .18s;
  touch-action: manipulation;
}
.ddr-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,130,246,.44); }
.ddr-fab:active { transform: scale(.98); }

/* ════ TARJETA DE CLIENTE ════ */
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
  font-family: 'Sora',system-ui,sans-serif; font-weight: 800;
  font-size: 14px; color: #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,.14);
}
.ddr-client-info { flex: 1; min-width: 0; }
.ddr-client-name {
  font-family: 'Sora',system-ui,sans-serif; font-weight: 700;
  font-size: 14px; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ddr-client-meta { font-size: 12px; color: #64748b; margin: 2px 0 0; }
.ddr-client-email { font-size: 11.5px; color: #94a3b8; margin: 1px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ddr-doc-badge {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 6px;
  font-size: 10px; font-weight: 700;
  background: #eff6ff; color: #2563eb; flex-shrink: 0;
}
.ddr-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.ddr-action {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  border-radius: 12px; border: none; cursor: pointer;
  transition: background .16s, transform .14s;
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

/* ════ ESTADO VACÍO ════ */
.ddr-empty {
  background: #fff; border-radius: 20px;
  padding: 48px 28px; text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,.03), 0 12px 40px rgba(59,130,246,.08);
}
.ddr-empty-icon {
  width: 72px; height: 72px; border-radius: 22px; margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
}
.ddr-results-count {
  text-align: center; font-size: 12px; color: #94a3b8; margin-top: 14px;
  padding-bottom: 12px;
}

/* ════ SPINNER Y ANIMACIONES ════ */
@keyframes ddrSpin { to { transform: rotate(360deg); } }
.ddr-spinner {
  width: 15px; height: 15px; border-radius: 50%; display: inline-block; flex-shrink: 0;
  border: 2.5px solid rgba(255,255,255,.30); border-top-color: #fff;
  animation: ddrSpin .75s linear infinite;
}
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
@media (prefers-reduced-motion: reduce) {
  .ddr-form-card, .ddr-client-card, .ddr-error { animation:none !important; opacity:1 !important; transform:none !important; }
}
`;
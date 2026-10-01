import { useState, useEffect, useRef, useCallback } from "react";
import logoApp from "../assets/logo.png";
import "../index.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle, FaSignOutAlt,
  FaBars, FaTimes, FaChevronDown,
} from "react-icons/fa";
import {
  FiHome, FiUsers, FiCreditCard, FiDollarSign,
  FiBarChart2, FiShield, FiTrendingUp, FiClock, FiFileText, FiSettings,
  FiChevronRight, FiChevronLeft, FiLogOut,
} from "react-icons/fi";
import clienteAxios from "../api/axios";

/* =========================================================
   1. DATOS DEL MENÚ
   ========================================================= */

// Enlaces directos: lo que más se usa, a un solo clic
const NAV_LINKS = [
  { to: "/inicio",   label: "Inicio",   icon: FiHome },
  { to: "/deudores", label: "Clientes", icon: FiUsers },
  { to: "/deudores", label: "Créditos", icon: FiCreditCard },
  { to: "/pagos",    label: "Pagos",    icon: FiDollarSign },
];

// Grupos con desplegable (en PC) o segundo nivel (en celular)
const NAV_GROUPS = [
  {
    id: "reportes",
    label: "Reportes",
    icon: FiBarChart2,
    items: [
      { to: "/reportes/estadisticas", label: "Estadísticas", desc: "Recaudo, mora y crecimiento", icon: FiTrendingUp, pronto: true },
      { to: "/reportes/historial",    label: "Historial",    desc: "Movimientos de pagos y créditos", icon: FiClock, pronto: true },
    ],
  },
  {
    id: "auditoria",
    label: "Auditoría",
    icon: FiShield,
    items: [
      { to: "/auditoria/registros", label: "Registros",     desc: "Quién hizo qué y cuándo", icon: FiFileText, pronto: true },
      { to: "/configuracion",       label: "Configuración", desc: "Usuarios y parámetros",   icon: FiSettings, pronto: true },
    ],
  },
];

/* =========================================================
   2. LOGO CON EFECTO MÁQUINA DE ESCRIBIR (EN BUCLE)
   ========================================================= */
const PALABRA = "KREDI";

function TypewriterLogo() {
  const reducirMovimiento =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [texto, setTexto] = useState(reducirMovimiento ? PALABRA : "");
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (reducirMovimiento) return;

    let espera;

    if (!borrando && texto === PALABRA) {
      // Terminó de escribir: se queda quieta 2,5 segundos
      espera = setTimeout(() => setBorrando(true), 2500);
    } else if (borrando && texto === "") {
      // Terminó de borrar: pausa corta antes de volver a escribir
      espera = setTimeout(() => setBorrando(false), 500);
    } else {
      // Agrega o quita una letra
      espera = setTimeout(() => {
        const largo = borrando ? texto.length - 1 : texto.length + 1;
        setTexto(PALABRA.slice(0, largo));
      }, borrando ? 70 : 140);
    }

    return () => clearTimeout(espera);
  }, [texto, borrando, reducirMovimiento]);

  return (
    <span className="nb-logo-text nb-brand" aria-label={PALABRA}>
      {/* Palabra completa invisible: reserva el ancho para que nada se mueva */}
      <span className="nb-logo-ghost" aria-hidden="true">
        {PALABRA}<span className="nb-cursor">|</span>
      </span>
      {/* Palabra animada encima */}
      <span className="nb-logo-live" aria-hidden="true">
        {texto}<span className="nb-cursor">|</span>
      </span>
    </span>
  );
}

/* =========================================================
   3. NAVBAR
   ========================================================= */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);       // desplegable abierto en PC
  const [mobileOpen, setMobileOpen] = useState(false);  // menú del celular abierto
  const [subId, setSubId] = useState(null);             // qué grupo se muestra en el 2º nivel
  const [subOpen, setSubOpen] = useState(false);        // si el 2º nivel está visible

  const menuRef = useRef(null);
  const closeBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* localStorage leído una sola vez */
  const [userInfo] = useState(() => ({
    name: localStorage.getItem("user_name") || "Admin",
    email: localStorage.getItem("user_email") || "online",
  }));

  const cerrarMovil = useCallback(() => {
    setMobileOpen(false);
    setSubOpen(false);
  }, []);

  const abrirSub = (id) => {
    setSubId(id);
    setSubOpen(true);
  };

  const grupoActivo = NAV_GROUPS.find((g) => g.id === subId);

  /* Sombra al hacer scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Click fuera cierra el desplegable de PC */
  useEffect(() => {
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* Escape cierra todo */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { cerrarMovil(); setMenuOpen(null); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [cerrarMovil]);

  /* Bloquear scroll del body con el menú móvil abierto */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Cerrar menús al cambiar de ruta */
  useEffect(() => {
    cerrarMovil();
    setMenuOpen(null);
  }, [location.pathname, cerrarMovil]);

  /* Foco en el botón cerrar al abrir el menú móvil */
  useEffect(() => {
    if (mobileOpen) closeBtnRef.current?.focus();
  }, [mobileOpen]);

  /* Cerrar sesión */
  const handleLogout = useCallback(async () => {
    try { await clienteAxios.post("api/logout"); }
    catch (err) { console.error("error al cerrar sesión", err); }
    finally { localStorage.clear(); navigate("/login"); }
  }, [navigate]);

  const toggle = (id) => setMenuOpen((prev) => (prev === id ? null : id));
  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <>
      <style>{CSS}</style>

      {/* ═══ BARRA PRINCIPAL ═══ */}
      <nav
        ref={menuRef}
        className={`nb-nav nb-root${scrolled ? " scrolled" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="nb-inner">

          {/* Logo */}
          <Link to="/inicio" className="nb-logo-wrap" aria-label="Ir al inicio">
            <img src={logoApp} alt="" className="nb-logo" />
            <TypewriterLogo />
          </Link>

          {/* Enlaces de escritorio */}
          <div className="nb-menus">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const activo = isActive(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`nb-link${activo ? " is-active" : ""}`}
                  aria-current={activo ? "page" : undefined}
                >
                  <Icon size={16} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}

            {NAV_GROUPS.map((grupo) => {
              const Icon = grupo.icon;
              const abierto = menuOpen === grupo.id;
              return (
                <div key={grupo.id} className="nb-group">
                  <button
                    className={`nb-link${abierto ? " is-open" : ""}`}
                    onClick={() => toggle(grupo.id)}
                    aria-expanded={abierto}
                    aria-haspopup="true"
                  >
                    <Icon size={16} aria-hidden="true" />
                    {grupo.label}
                    <FaChevronDown className={`nb-chevron${abierto ? " open" : ""}`} aria-hidden="true" />
                  </button>

                  {abierto && (
                    <div className="nb-dropdown nb-dropdown-wide" role="menu">
                      {grupo.items.map((item) => {
                        const ItemIcon = item.icon;
                        const contenido = (
                          <>
                            <span className="nb-dd-icon"><ItemIcon size={16} aria-hidden="true" /></span>
                            <span className="nb-dd-text">
                              <span className="nb-dd-title">
                                {item.label}
                                {item.pronto && <span className="nb-soon">Pronto</span>}
                              </span>
                              <span className="nb-dd-desc">{item.desc}</span>
                            </span>
                          </>
                        );

                        return item.pronto ? (
                          <div key={item.label} className="nb-dd-item is-disabled" aria-disabled="true">
                            {contenido}
                          </div>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="nb-dd-item"
                            role="menuitem"
                            onClick={() => setMenuOpen(null)}
                          >
                            {contenido}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lado derecho */}
          <div className="nb-right">

            {/* Perfil (solo PC) */}
            <div className="nb-profile-zone">
              <button
                className="nb-profile-btn"
                onClick={() => toggle("profile")}
                aria-expanded={menuOpen === "profile"}
                aria-haspopup="true"
                aria-label="Menú de perfil"
              >
                <div className="nb-avatar" aria-hidden="true">
                  <FaUserCircle style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div className="nb-profile-text">
                  <p className="nb-profile-name">{userInfo.name}</p>
                  <p className="nb-profile-mail">{userInfo.email}</p>
                </div>
                <FaChevronDown
                  className={`nb-chevron${menuOpen === "profile" ? " open" : ""}`}
                  style={{ color: "rgba(255,255,255,.70)" }}
                  aria-hidden="true"
                />
              </button>

              {menuOpen === "profile" && (
                <div className="nb-dropdown nb-dropdown-right" role="menu">
                  <div className="nb-dd-user">
                    <p className="nb-dd-user-name">{userInfo.name}</p>
                    <p className="nb-dd-user-mail">{userInfo.email}</p>
                  </div>
                  <div className="nb-dd-divider" aria-hidden="true" />
                  <button onClick={handleLogout} className="nb-dd-item danger" role="menuitem">
                    <FaSignOutAlt aria-hidden="true" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón de barras (solo celular) */}
            <button
              className="nb-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="nb-mobile-menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Espacio que ocupa la barra fija */}
      <div className="nb-spacer" aria-hidden="true" />

      {/* ═══ MENÚ MÓVIL POR NIVELES ═══ */}
      <div
        id="nb-mobile-menu"
        className={`nb-mwrap nb-root${mobileOpen ? " is-open" : ""}${subOpen ? " is-sub" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        {/* ── Nivel 1 ── */}
        <div className="nb-mpanel l1" inert={subOpen}>
          <div className="nb-mtop">
            <img src={logoApp} alt="KREDI" className="nb-mlogo" />
            <button ref={closeBtnRef} className="nb-mclose" onClick={cerrarMovil} aria-label="Cerrar menú">
              <FaTimes size={16} />
            </button>
          </div>

          <nav className="nb-mlist" aria-label="Menú principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`nb-mitem${isActive(link.to) ? " is-active" : ""}`}
                aria-current={isActive(link.to) ? "page" : undefined}
                onClick={cerrarMovil}
              >
                {link.label}
              </Link>
            ))}

            {NAV_GROUPS.map((grupo) => (
              <button key={grupo.id} className="nb-mitem" onClick={() => abrirSub(grupo.id)}>
                {grupo.label}
                <FiChevronRight size={24} aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="nb-mfoot">
            <div className="nb-muser">
              <div className="nb-avatar" style={{ width: 42, height: 42 }} aria-hidden="true">
                <FaUserCircle style={{ color: "#fff", fontSize: 22 }} />
              </div>
              <div>
                <p className="nb-muser-name">{userInfo.name}</p>
                <p className="nb-muser-mail">{userInfo.email}</p>
              </div>
            </div>
            <button className="nb-mbtn" onClick={handleLogout}>
              <FiLogOut size={16} aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        </div>

        {/* ── Nivel 2 ── */}
        <div className="nb-mpanel l2" inert={!subOpen}>
          <div className="nb-mtop">
            <button className="nb-mback" onClick={() => setSubOpen(false)}>
              <FiChevronLeft size={20} aria-hidden="true" /> Menú
            </button>
            <button className="nb-mclose" onClick={cerrarMovil} aria-label="Cerrar menú">
              <FaTimes size={16} />
            </button>
          </div>

          {grupoActivo && (
            <nav className="nb-mlist" aria-label={grupoActivo.label}>
              <h2 className="nb-mtitle">{grupoActivo.label}</h2>
              {grupoActivo.items.map((item) =>
                item.pronto ? (
                  <div key={item.label} className="nb-mitem sm is-disabled" aria-disabled="true">
                    {item.label}
                    <span className="nb-soon">Pronto</span>
                  </div>
                ) : (
                  <Link key={item.label} to={item.to} className="nb-mitem sm" onClick={cerrarMovil}>
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;

/* =========================================================
   4. ESTILOS
   ========================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

.nb-root  { font-family:'DM Sans',system-ui,sans-serif; }
.nb-brand { font-family:'Sora',system-ui,sans-serif !important; }

/* ── Barra ── */
.nb-nav {
  position:fixed; top:0; left:0; width:100%; z-index:100;
  background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%);
  border-bottom:1px solid rgba(255,255,255,.10);
  padding-top:env(safe-area-inset-top);
  transition:box-shadow .3s;
}
.nb-nav.scrolled { box-shadow:0 4px 32px rgba(29,78,216,.50); }

.nb-inner {
  max-width:1280px; margin:0 auto;
  padding:0 max(16px,env(safe-area-inset-left));
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  height:60px; transition:height .2s;
}
.nb-nav.scrolled .nb-inner { height:54px; }

/* Reserva el alto de la barra fija para que no tape el contenido */
.nb-spacer { height:calc(60px + env(safe-area-inset-top)); }

/* ── Logo ── */
.nb-logo-wrap { display:flex; align-items:center; gap:10px; flex-shrink:0; text-decoration:none; }
.nb-logo { height:36px; width:auto; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
.nb-logo-text {
  display:inline-grid;
  font-family:'Sora',system-ui,sans-serif; font-size:20px; font-weight:800; font-style:italic;
  letter-spacing:.20em; color:#fff; white-space:nowrap;
}
.nb-logo-ghost, .nb-logo-live { grid-area:1 / 1; }
.nb-logo-ghost { visibility:hidden; }
.nb-cursor { animation:nbBlink .9s step-end infinite; color:#93c5fd; margin-left:1px; font-style:normal; }
@keyframes nbBlink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Enlaces de escritorio ── */
.nb-menus { display:none; }
@media(min-width:1024px){ .nb-menus{ display:flex; align-items:center; gap:2px; } }

/* En PC: logo a la izquierda, enlaces al centro, perfil a la derecha */
@media(min-width:1024px){
  .nb-inner { display:grid; grid-template-columns:1fr auto 1fr; }
  .nb-logo-wrap { justify-self:start; }
  .nb-menus { justify-self:center; }
  .nb-right { justify-self:end; }
}

.nb-group { position:relative; }

.nb-link {
  display:flex; align-items:center; gap:7px;
  padding:8px 12px; border-radius:9px;
  font-family:inherit; font-size:13.5px; font-weight:600;
  color:rgba(255,255,255,.82); text-decoration:none;
  background:none; border:0; cursor:pointer; white-space:nowrap;
  transition:background .15s, color .15s;
}
.nb-link:hover, .nb-link.is-open { background:rgba(255,255,255,.12); color:#fff; }
.nb-link.is-active { background:#fff; color:#2563eb; }
.nb-link:focus-visible { outline:2px solid #fff; outline-offset:2px; }

.nb-chevron { transition:transform .22s; font-size:10px; opacity:.75; flex-shrink:0; }
.nb-chevron.open { transform:rotate(180deg); }

/* ── Desplegables de escritorio ── */
.nb-dropdown {
  position:absolute; top:calc(100% + 8px); left:0; min-width:210px;
  background:#fff; border-radius:16px;
  border:1px solid rgba(59,130,246,.14);
  box-shadow:0 16px 48px rgba(29,78,216,.20),0 2px 8px rgba(0,0,0,.08);
  padding:6px; z-index:200;
  animation:nbPop .18s cubic-bezier(.22,1,.36,1);
}
.nb-dropdown-right { left:auto; right:0; }
.nb-dropdown-wide { min-width:290px; }
@keyframes nbPop { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

.nb-dd-item {
  display:flex; align-items:center; gap:10px;
  padding:10px 14px; border-radius:10px;
  font-family:inherit; font-size:13.5px; font-weight:500; color:#1e293b;
  text-decoration:none; background:none; border:none;
  cursor:pointer; width:100%; text-align:left;
  transition:background .14s,color .14s;
}
.nb-dd-item:hover { background:#eff6ff; color:#2563eb; }
.nb-dd-item.danger { color:#dc2626; font-weight:700; }
.nb-dd-item.danger:hover { background:#fff1f2; }
.nb-dd-item.is-disabled { cursor:default; opacity:.65; }
.nb-dd-item.is-disabled:hover { background:none; color:#1e293b; }

.nb-dd-icon {
  width:34px; height:34px; border-radius:9px; flex-shrink:0;
  background:#eff6ff; color:#2563eb;
  display:flex; align-items:center; justify-content:center;
}
.nb-dd-text { display:flex; flex-direction:column; gap:1px; }
.nb-dd-title { font-size:13px; font-weight:600; color:#0f172a; display:flex; align-items:center; gap:6px; }
.nb-dd-desc { font-size:11.5px; font-weight:400; color:#94a3b8; }
.nb-dd-divider { height:1px; background:#f1f5f9; margin:4px 6px; }
.nb-dd-user { padding:10px 14px; }
.nb-dd-user-name { font-weight:700; font-size:13px; color:#1e293b; margin:0; }
.nb-dd-user-mail { font-size:11px; color:#94a3b8; margin:1px 0 0; }

.nb-soon {
  font-size:9px; font-weight:700; padding:2px 6px; border-radius:999px;
  background:#f1f5f9; color:#475569; letter-spacing:0;
}

/* ── Lado derecho ── */
.nb-right { display:flex; align-items:center; gap:10px; }

.nb-profile-zone { display:none; position:relative; }
@media(min-width:1024px){ .nb-profile-zone{ display:block; } }

.nb-profile-btn {
  display:flex; align-items:center; gap:9px;
  padding:5px 12px 5px 6px; border-radius:50px;
  background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.20);
  cursor:pointer; min-height:44px; font-family:inherit;
  transition:background .18s;
}
.nb-profile-btn:hover { background:rgba(255,255,255,.22); }
.nb-profile-text { text-align:left; line-height:1.3; }
.nb-profile-name { font-size:11px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:.04em; margin:0; }
.nb-profile-mail { font-size:10px; color:rgba(191,219,254,.85); margin:0; }

.nb-avatar {
  width:32px; height:32px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#60a5fa,#a78bfa);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 0 2px rgba(255,255,255,.28);
}

/* ── Botón de barras (celular) ── */
.nb-hamburger {
  display:flex; align-items:center; justify-content:center;
  width:44px; height:44px; border-radius:12px;
  background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.16);
  color:#fff; cursor:pointer; flex-shrink:0;
  transition:background .16s,transform .14s;
  -webkit-tap-highlight-color:transparent; touch-action:manipulation;
}
.nb-hamburger:hover { background:rgba(255,255,255,.20); }
.nb-hamburger:active { transform:scale(.94); }
@media(min-width:1024px){ .nb-hamburger{ display:none; } }

/* ── Menú móvil por niveles ── */
.nb-mwrap {
  position:fixed; inset:0; z-index:950;
  visibility:hidden; pointer-events:none;
  transition:visibility 0s .35s;
}
.nb-mwrap.is-open { visibility:visible; pointer-events:auto; transition:visibility 0s; }
@media(min-width:1024px){ .nb-mwrap{ display:none; } }

.nb-mpanel {
  position:absolute; inset:0; background:#fff;
  display:flex; flex-direction:column;
  padding-top:env(safe-area-inset-top);
  transform:translateX(100%);
  transition:transform .35s cubic-bezier(.22,1,.36,1);
}
.nb-mpanel.l2 { z-index:2; }
.nb-mwrap.is-open .nb-mpanel.l1 { transform:translateX(0); }
.nb-mwrap.is-open.is-sub .nb-mpanel.l1 { transform:translateX(-30%); }
.nb-mwrap.is-sub .nb-mpanel.l2 { transform:translateX(0); }

.nb-mtop {
  display:flex; align-items:center; justify-content:space-between;
  height:64px; padding:0 16px 0 24px; flex-shrink:0;
}
.nb-mlogo { height:30px; width:auto; }
.nb-mclose {
  width:44px; height:44px; border-radius:50%; border:0; cursor:pointer;
  background:#f1f5f9; color:#0f172a;
  display:flex; align-items:center; justify-content:center;
}
.nb-mclose:hover { background:#e2e8f0; }
.nb-mback {
  display:flex; align-items:center; gap:6px; padding:10px 0;
  border:0; background:none; cursor:pointer;
  font-family:inherit; font-size:16px; font-weight:600; color:#0f172a;
}

.nb-mlist { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:8px 28px 24px; }
.nb-mtitle { font-size:28px; font-weight:800; letter-spacing:-.5px; color:#0f172a; margin:4px 0 16px; }

.nb-mitem {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  width:100%; padding:12px 0; border:0; background:none; cursor:pointer;
  font-family:inherit; font-size:26px; font-weight:700; letter-spacing:-.5px;
  color:#0f172a; text-decoration:none; text-align:left;
  -webkit-tap-highlight-color:transparent;
}
.nb-mitem:hover, .nb-mitem.is-active { color:#2563eb; }
.nb-mitem.sm { font-size:19px; font-weight:600; }
.nb-mitem.is-disabled { color:#94a3b8; cursor:default; }
.nb-mitem.is-disabled:hover { color:#94a3b8; }

.nb-mfoot {
  flex-shrink:0; border-top:1px solid #f1f5f9;
  padding:20px 28px calc(24px + env(safe-area-inset-bottom));
}
.nb-muser { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.nb-muser-name { font-size:15px; font-weight:700; color:#0f172a; margin:0; }
.nb-muser-mail { font-size:12px; color:#94a3b8; margin:2px 0 0; }
.nb-mbtn {
  display:inline-flex; align-items:center; gap:8px;
  padding:11px 20px; border-radius:999px; cursor:pointer;
  border:1px solid #e2e8f0; background:#fff; color:#0f172a;
  font-family:inherit; font-size:14px; font-weight:600;
}
.nb-mbtn:hover { border-color:#cbd5e1; background:#f8fafc; }

/* ── Menos movimiento ── */
@media(prefers-reduced-motion:reduce){
  .nb-dropdown, .nb-mpanel { animation:none !important; transition:none !important; }
  .nb-cursor { animation:none !important; }
}
`;
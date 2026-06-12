import React, { useState, useEffect, useRef, useCallback } from "react";
import logoApp from "../assets/logo.png";
import "../index.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle, FaSignOutAlt, FaClock,
  FaBars, FaTimes, FaChevronDown
} from "react-icons/fa";
import clienteAxios from "../api/axios";

const MENUS = [
  {
    id: "gestion", label: "Gestión", icon: "📋",
    items: [
      { to: "/inicio", icon: "🏠", label: "Inicio" },
      { to: "/Deudores", icon: "👤", label: "Clientes" },
      { to: "/Deudores", icon: "💳", label: "Créditos" },
      { to: "/Pagos", icon: "💸", label: "Pagos" },
    ],
  },
  {
    id: "reportes", label: "Reportes", icon: "📊",
    items: [
      { to: "#", icon: "📈", label: "Estadísticas" },
      { to: "#", icon: "🗂️", label: "Historial" },
    ],
  },
  {
    id: "auditoria", label: "Auditoría", icon: "🔍",
    items: [
      { to: "#", icon: "🛡️", label: "Registros" },
      { to: "#", icon: "⚙️", label: "Configuración" },
    ],
  },
];

const formatColombiaDate = (dt) =>
  new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true,
  }).format(dt);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [text, setText] = useState("KREDI");

  /* MEJORA: localStorage leído una sola vez */
  const [userInfo] = useState(() => ({
    name: localStorage.getItem("user_name") || "Admin",
    email: localStorage.getItem("user_email") || "online",
  }));

  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* Texto animado — solo primer ciclo, luego se detiene */
  useEffect(() => {
    const fullText = "KREDI";
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(iv);
    }, 120);
    return () => clearInterval(iv);
  }, []);

  /* Reloj */
  useEffect(() => {
    const t = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Click fuera cierra dropdown */
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
      if (e.key === "Escape") { setMobileOpen(false); setMenuOpen(null); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  /* Bloquear scroll del body con drawer abierto */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Cerrar al cambiar de ruta */
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(null);
  }, [location.pathname]);

  /* Logout */
  const handleLogout = useCallback(async () => {
    try { await clienteAxios.post("api/logout"); }
    catch (err) { console.error("error al cerrar sesión", err); }
    finally { localStorage.clear(); navigate("/login"); }
  }, [navigate]);

  const toggle = (id) => setMenuOpen((prev) => (prev === id ? null : id));
  const isActive = (to) => to !== "#" && location.pathname === to;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .nb-root  { font-family:'DM Sans',sans-serif; }
        .nb-brand { font-family:'Sora',sans-serif !important; }

        /* NAV — safe-area-inset-top para notch */
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

        /* Logo */
        .nb-logo-wrap { display:flex; align-items:center; gap:10px; flex-shrink:0; text-decoration:none; }
        .nb-logo { height:36px; width:auto; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
        .nb-logo-text { font-family:'Sora',sans-serif; font-size:20px; font-weight:900; font-style:italic; letter-spacing:.20em; color:#fff; min-width:86px; }
        .nb-cursor { animation:nbBlink .9s step-end infinite; color:#93c5fd; margin-left:1px; }
        @keyframes nbBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Menús desktop */
        .nb-menus { display:none; }
        @media(min-width:1024px){ .nb-menus{display:flex;align-items:center;gap:6px;flex:1;margin-left:16px;} }

        .nb-menu-btn {
          display:flex; align-items:center; gap:6px;
          padding:7px 16px; border-radius:10px;
          font-size:13px; font-weight:600; color:rgba(255,255,255,.90);
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14);
          cursor:pointer; white-space:nowrap;
          transition:background .18s,transform .14s;
          -webkit-tap-highlight-color:transparent;
        }
        .nb-menu-btn:hover,.nb-menu-btn.active { background:rgba(255,255,255,.20); transform:translateY(-1px); }
        .nb-menu-btn:active { transform:scale(.98); }
        .nb-chevron { transition:transform .22s; font-size:10px; opacity:.75; flex-shrink:0; }
        .nb-chevron.open { transform:rotate(180deg); }

        /* Dropdown desktop */
        .nb-dropdown {
          position:absolute; top:calc(100% + 8px); left:0; min-width:210px;
          background:#fff; border-radius:16px;
          border:1px solid rgba(59,130,246,.14);
          box-shadow:0 16px 48px rgba(29,78,216,.20),0 2px 8px rgba(0,0,0,.08);
          padding:6px; z-index:200;
          animation:nbPop .18s cubic-bezier(.22,1,.36,1);
        }
        .nb-dropdown-right { left:auto; right:0; }
        @keyframes nbPop { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .nb-dd-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:10px;
          font-size:13.5px; font-weight:500; color:#1e293b;
          text-decoration:none; background:none; border:none;
          cursor:pointer; width:100%; text-align:left;
          transition:background .14s,color .14s;
          -webkit-tap-highlight-color:transparent;
        }
        .nb-dd-item:hover { background:#eff6ff; color:#2563eb; }
        .nb-dd-item.active-route { background:#eff6ff; color:#2563eb; font-weight:700; }
        .nb-dd-item.danger { color:#dc2626; font-weight:700; }
        .nb-dd-item.danger:hover { background:#fff1f2; }
        .nb-dd-divider { height:1px; background:#f1f5f9; margin:4px 6px; }

        /* Reloj */
        .nb-clock {
          display:flex; align-items:center; gap:7px;
          font-family:monospace; font-size:11px; color:rgba(255,255,255,.85);
          background:rgba(0,0,0,.18); padding:6px 12px; border-radius:8px;
          border:1px solid rgba(255,255,255,.10); white-space:nowrap;
        }

        /* Separador */
        .nb-sep { width:1px; height:26px; background:rgba(255,255,255,.16); flex-shrink:0; }

        /* Perfil */
        .nb-profile-btn {
          display:flex; align-items:center; gap:9px;
          padding:5px 12px 5px 6px; border-radius:50px;
          background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.20);
          cursor:pointer; min-height:44px;
          transition:background .18s;
          -webkit-tap-highlight-color:transparent;
        }
        .nb-profile-btn:hover { background:rgba(255,255,255,.22); }
        .nb-avatar {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#60a5fa,#a78bfa);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 0 2px rgba(255,255,255,.28);
        }

        /* Right side show/hide helpers */
        .nb-right { display:flex; align-items:center; gap:10px; }
        .nb-clock-zone { display:none; }
        @media(min-width:1280px){ .nb-clock-zone{display:flex;} }
        .nb-sep-zone { display:none; }
        @media(min-width:1024px){ .nb-sep-zone{display:flex;} }

        /* Hamburguesa — 44×44px */
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
        @media(min-width:1024px){ .nb-hamburger{display:none;} }

        /* ── MOBILE DRAWER ── */
        .nb-overlay {
          position:fixed; inset:0; z-index:900;
          background:rgba(15,23,42,.55);
          backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
          animation:nbFade .2s ease;
        }
        @keyframes nbFade { from{opacity:0} to{opacity:1} }

        .nb-drawer {
          position:fixed; top:0; left:0;
          width:min(320px,88vw); height:100dvh;
          background:#fff; z-index:910;
          display:flex; flex-direction:column; overflow:hidden;
          box-shadow:6px 0 48px rgba(29,78,216,.22);
          animation:nbSlide .26s cubic-bezier(.22,1,.36,1);
        }
        @keyframes nbSlide { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        .nb-drawer-hdr {
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
          padding:max(20px,calc(env(safe-area-inset-top) + 12px)) 20px 20px;
          flex-shrink:0;
        }
        .nb-drawer-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }

        /* X del drawer — 44×44px */
        .nb-drawer-close {
          width:44px; height:44px; border-radius:12px;
          background:rgba(255,255,255,.15); border:none; color:rgba(255,255,255,.90);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:background .15s;
          -webkit-tap-highlight-color:transparent;
        }
        .nb-drawer-close:hover { background:rgba(255,255,255,.25); }
        .nb-drawer-close:active { background:rgba(255,255,255,.35); }

        .nb-drawer-user {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,.14); border-radius:14px; padding:10px 14px;
        }

        .nb-drawer-body {
          flex:1; overflow-y:auto; overscroll-behavior:contain; padding:8px 12px;
          padding-bottom:max(16px,env(safe-area-inset-bottom));
        }

        .nb-drawer-section-lbl {
          font-size:10px; font-weight:700; text-transform:uppercase;
          letter-spacing:.12em; color:#94a3b8; padding:10px 10px 5px;
          display:flex; align-items:center; gap:6px;
        }

        /* Drawer items — 52px min-height */
        .nb-drawer-item {
          display:flex; align-items:center; gap:12px;
          min-height:52px; padding:0 12px; border-radius:12px;
          font-size:14px; font-weight:500; color:#1e293b;
          text-decoration:none; cursor:pointer;
          background:none; border:none; width:100%; text-align:left;
          transition:background .14s,color .14s;
          -webkit-tap-highlight-color:transparent; touch-action:manipulation;
        }
        .nb-drawer-item:hover { background:#eff6ff; color:#2563eb; }
        .nb-drawer-item:active { background:#dbeafe; }
        .nb-drawer-item.active-route { background:#eff6ff; color:#2563eb; font-weight:700; }
        .nb-drawer-item.danger { color:#dc2626; font-weight:700; }
        .nb-drawer-item.danger:hover { background:#fff1f2; }

        .nb-drawer-divider { height:1px; background:#f1f5f9; margin:4px 0; }

        .nb-drawer-clock {
          display:flex; align-items:center; gap:8px;
          background:#f0f4ff; border:1px solid #e2e8f0;
          border-radius:10px; padding:9px 14px;
          font-family:monospace; font-size:12px; color:#475569;
          margin:8px 0 4px;
        }

        /* Reduce motion */
        @media(prefers-reduced-motion:reduce){
          .nb-drawer,.nb-overlay,.nb-dropdown{animation:none!important;}
          .nb-cursor{animation:none!important;}
        }
      `}</style>

      {/* ═══ NAV PRINCIPAL ═══ */}
      <nav
        ref={menuRef}
        className={`nb-nav nb-root${scrolled ? " scrolled" : ""}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="nb-inner">

          {/* Logo */}
          <Link to="/" className="nb-logo-wrap" aria-label="Inicio">
            <img src={logoApp} alt="Logo KREDI" className="nb-logo" />
            <span className="nb-logo-text nb-brand">
              {text}<span className="nb-cursor" aria-hidden="true">|</span>
            </span>
          </Link>

          {/* Menús desktop */}
          <nav className="nb-menus" aria-label="Menú principal">
            {MENUS.map((m) => (
              <div key={m.id} style={{ position: "relative" }}>
                <button
                  className={`nb-menu-btn${menuOpen === m.id ? " active" : ""}`}
                  onClick={() => toggle(m.id)}
                  aria-expanded={menuOpen === m.id}
                  aria-haspopup="true"
                >
                  <span aria-hidden="true">{m.icon}</span>
                  {m.label}
                  <FaChevronDown className={`nb-chevron${menuOpen === m.id ? " open" : ""}`} aria-hidden="true" />
                </button>
                {menuOpen === m.id && (
                  <div className="nb-dropdown" role="menu">
                    {m.items.map((item) => (
                      <Link
                        key={item.to + item.label}
                        to={item.to}
                        className={`nb-dd-item${isActive(item.to) ? " active-route" : ""}`}
                        onClick={() => setMenuOpen(null)}
                        role="menuitem"
                        aria-current={isActive(item.to) ? "page" : undefined}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Lado derecho */}
          <div className="nb-right">

            <div className="nb-clock-zone">
              <div className="nb-clock">
                <FaClock style={{ color: "#93c5fd", fontSize: 11 }} aria-hidden="true" />
                {formatColombiaDate(dateTime)}
              </div>
            </div>

            <div className="nb-sep-zone"><div className="nb-sep" aria-hidden="true" /></div>

            {/* Perfil */}
            <div style={{ position: "relative" }}>
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
                <div style={{ textAlign: "left", lineHeight: 1.3 }} className="hidden sm:block">
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: ".04em" }}>
                    {userInfo.name}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(191,219,254,.85)" }}>{userInfo.email}</p>
                </div>
                <FaChevronDown className={`nb-chevron${menuOpen === "profile" ? " open" : ""}`} style={{ color: "rgba(255,255,255,.70)" }} aria-hidden="true" />
              </button>

              {menuOpen === "profile" && (
                <div className="nb-dropdown nb-dropdown-right" role="menu">
                  <div style={{ padding: "10px 14px 10px", marginBottom: 2 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{userInfo.name}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{userInfo.email}</p>
                  </div>
                  <div className="nb-dd-divider" aria-hidden="true" />
                  <button onClick={handleLogout} className="nb-dd-item danger" role="menuitem">
                    <FaSignOutAlt aria-hidden="true" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Hamburguesa — 44×44px */}
            <button
              className="nb-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="nb-mobile-drawer"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE DRAWER ═══ */}
      {mobileOpen && (
        <>
          <div className="nb-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside
            id="nb-mobile-drawer"
            className="nb-drawer nb-root"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Header */}
            <div className="nb-drawer-hdr">
              <div className="nb-drawer-top">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={logoApp} alt="" aria-hidden="true" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
                  <span className="nb-brand" style={{ color: "#fff", fontWeight: 900, fontStyle: "italic", letterSpacing: ".18em", fontSize: 17 }}>
                    KREDI
                  </span>
                </div>
                <button className="nb-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
                  <FaTimes size={15} />
                </button>
              </div>
              <div className="nb-drawer-user">
                <div className="nb-avatar" style={{ width: 38, height: 38 }} aria-hidden="true">
                  <FaUserCircle style={{ color: "#fff", fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{userInfo.name}</p>
                  <p style={{ color: "rgba(191,219,254,.85)", fontSize: 12, marginTop: 2 }}>{userInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="nb-drawer-body">
              <div className="nb-drawer-clock">
                <FaClock style={{ color: "#3b82f6", fontSize: 11, flexShrink: 0 }} aria-hidden="true" />
                {formatColombiaDate(dateTime)}
              </div>

              {MENUS.map((m) => (
                <div key={m.id}>
                  <p className="nb-drawer-section-lbl">
                    <span aria-hidden="true">{m.icon}</span>{m.label}
                  </p>
                  {m.items.map((item) => (
                    <Link
                      key={item.to + item.label}
                      to={item.to}
                      className={`nb-drawer-item${isActive(item.to) ? " active-route" : ""}`}
                      aria-current={isActive(item.to) ? "page" : undefined}
                    >
                      <span aria-hidden="true" style={{ fontSize: 18 }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div className="nb-drawer-divider" aria-hidden="true" />
                </div>
              ))}

              <button onClick={handleLogout} className="nb-drawer-item danger" style={{ marginTop: 4 }}>
                <FaSignOutAlt aria-hidden="true" /> Cerrar Sesión
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
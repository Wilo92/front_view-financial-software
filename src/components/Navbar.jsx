import React, { useState, useEffect, useRef } from "react";
import logoApp from "../assets/logo.png";
import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaClock, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import clienteAxios from "../api/axios";

/* ─── Datos de menús (fácil de editar) ─────────────────────────── */
const MENUS = [
  {
    id: "gestion",
    label: "Gestión",
    icon: "📋",
    items: [
      { to: "/",          icon: "👤", label: "Clientes" },
      { to: "/creditos",  icon: "💳", label: "Créditos" },
      { to: "/Pagos",     icon: "💸", label: "Pagos"    },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: "📊",
    items: [
      { to: "#", icon: "📈", label: "Estadísticas" },
      { to: "#", icon: "🗂️",  label: "Historial"    },
    ],
  },
  {
    id: "auditoria",
    label: "Auditoría",
    icon: "🔍",
    items: [
      { to: "#", icon: "🛡️", label: "Registros"  },
      { to: "#", icon: "⚙️", label: "Configuración" },
    ],
  },
];

const Navbar = () => {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(null);   // id del dropdown abierto
  const [mobileOpen, setMobileOpen] = useState(false);  // menú hamburguesa
  const [dateTime,   setDateTime]   = useState(new Date());
  const menuRef  = useRef(null);
  const navigate = useNavigate();

  // ── Texto animado ──────────────────────────────────────────────
  const fullText = "KREDI";
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i = (i + 1) % fullText.length;
    }, 200);
    return () => clearInterval(iv);
  }, []);

  // ── Reloj ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatColombiaDate = (dt) =>
    new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: true,
    }).format(dt);

  // ── Scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Click fuera cierra dropdown ────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await clienteAxios.post("api/logout"); }
    catch (err) { console.error("error al cerrar la sesion en el servidor", err); }
    finally {
      localStorage.clear();
      navigate("/login");
      window.location.href = "/login";
    }
  };

  const toggle = (id) => setMenuOpen((prev) => (prev === id ? null : id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .nb-root { font-family: 'DM Sans', sans-serif; }
        .nb-brand { font-family: 'Sora', sans-serif; }

        /* Fondo con vidrio suave */
        .nb-glass {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .nb-glass.scrolled {
          box-shadow: 0 4px 32px rgba(29,78,216,0.45);
        }

        /* Botones de menú */
        .nb-menu-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: background 0.18s, transform 0.15s;
          white-space: nowrap;
        }
        .nb-menu-btn:hover, .nb-menu-btn.active {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .nb-chevron {
          transition: transform 0.25s;
          font-size: 10px;
          opacity: 0.8;
        }
        .nb-chevron.open { transform: rotate(180deg); }

        /* Dropdown */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 210px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(59,130,246,0.15);
          box-shadow: 0 16px 48px rgba(29,78,216,0.2), 0 2px 8px rgba(0,0,0,0.08);
          padding: 6px;
          z-index: 200;
          animation: nb-pop 0.18s cubic-bezier(.22,1,.36,1);
        }
        @keyframes nb-pop {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .nb-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e293b;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .nb-dropdown-item:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        /* Reloj */
        .nb-clock {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.85);
          background: rgba(0,0,0,0.18);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
        }

        /* Avatar / perfil */
        .nb-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 8px;
          border-radius: 50px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          transition: background 0.18s;
        }
        .nb-profile-btn:hover { background: rgba(255,255,255,0.22); }

        .nb-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
        }

        /* Separador vertical */
        .nb-sep {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.18);
          flex-shrink: 0;
        }

        /* Mobile drawer */
        .nb-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.5);
          backdrop-filter: blur(4px);
          z-index: 150;
          animation: nb-fade 0.2s ease;
        }
        @keyframes nb-fade { from{opacity:0} to{opacity:1} }

        .nb-mobile-drawer {
          position: fixed;
          top: 0; left: 0;
          width: 80%; max-width: 300px;
          height: 100%;
          background: #fff;
          z-index: 160;
          padding: 0;
          overflow-y: auto;
          animation: nb-slide 0.25s cubic-bezier(.22,1,.36,1);
          box-shadow: 4px 0 40px rgba(29,78,216,0.25);
        }
        @keyframes nb-slide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        .nb-drawer-header {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          padding: 20px 20px 24px;
        }
        .nb-drawer-section {
          padding: 6px 10px;
          margin-bottom: 4px;
        }
        .nb-drawer-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          padding: 8px 8px 4px;
        }
        .nb-drawer-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #1e293b;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nb-drawer-item:hover { background: #eff6ff; color: #2563eb; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          NAV PRINCIPAL
      ═══════════════════════════════════════════════════════ */}
      <nav
        ref={menuRef}
        className={`nb-root nb-glass fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? "scrolled py-1" : "py-2"}`}
      >
        <div className="max-w-full mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">

            {/* ── LOGO + MARCA ── */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img src={logoApp} alt="logo" className="h-9 w-auto object-contain drop-shadow-md" />
              <h1 className="nb-brand text-white text-xl font-black italic tracking-[0.2em] hidden sm:block min-w-[80px]">
                {text}
                <span className="animate-pulse ml-1 text-blue-200">|</span>
              </h1>
            </div>

            {/* ── MENÚS DESKTOP ── */}
            <div className="hidden lg:flex items-center gap-2 flex-1 ml-6">
              {MENUS.map((m) => (
                <div key={m.id} className="relative">
                  <button
                    className={`nb-menu-btn ${menuOpen === m.id ? "active" : ""}`}
                    onClick={() => toggle(m.id)}
                  >
                    <span>{m.icon}</span>
                    {m.label}
                    <FaChevronDown className={`nb-chevron ${menuOpen === m.id ? "open" : ""}`} />
                  </button>

                  {menuOpen === m.id && (
                    <div className="nb-dropdown">
                      {m.items.map((item) => (
                        <Link key={item.to + item.label} to={item.to} className="nb-dropdown-item" onClick={() => setMenuOpen(null)}>
                          <span>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── LADO DERECHO ── */}
            <div className="flex items-center gap-3">

              {/* Reloj */}
              <div className="nb-clock hidden xl:flex">
                <FaClock style={{ color: "#93c5fd", fontSize: 11 }} />
                {formatColombiaDate(dateTime)}
              </div>

              <div className="nb-sep hidden lg:block" />

              {/* Perfil */}
              <div className="relative">
                <button
                  className="nb-profile-btn"
                  onClick={() => toggle("profile")}
                >
                  <div className="nb-avatar">
                    <FaUserCircle style={{ color: "#fff", fontSize: 18 }} />
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wide">
                      {localStorage.getItem("user_name") || "Admin"}
                    </p>
                    <p className="text-[10px] text-blue-200">
                      {localStorage.getItem("user_email") || "online"}
                    </p>
                  </div>
                  <FaChevronDown className={`nb-chevron text-white/70 ${menuOpen === "profile" ? "open" : ""}`} />
                </button>

                {menuOpen === "profile" && (
                  <div className="nb-dropdown" style={{ left: "auto", right: 0, minWidth: 180 }}>
                    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                        {localStorage.getItem("user_name") || "Admin"}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>
                        {localStorage.getItem("user_email") || "online"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="nb-dropdown-item w-full text-left"
                      style={{ color: "#dc2626", fontWeight: 700 }}
                    >
                      <FaSignOutAlt /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Hamburguesa (mobile/tablet) */}
              <button
                className="lg:hidden nb-menu-btn px-3"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          <div className="nb-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="nb-mobile-drawer nb-root">

            {/* Header drawer */}
            <div className="nb-drawer-header">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={logoApp} alt="logo" className="h-8 w-auto brightness-0 invert" />
                  <span className="nb-brand text-white font-black italic tracking-widest text-lg">KREDI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Info usuario */}
              <div className="flex items-center gap-3 bg-white/15 rounded-xl px-3 py-2.5">
                <div className="nb-avatar"><FaUserCircle style={{ color: "#fff", fontSize: 18 }} /></div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {localStorage.getItem("user_name") || "Admin"}
                  </p>
                  <p className="text-blue-200 text-xs">
                    {localStorage.getItem("user_email") || "online"}
                  </p>
                </div>
              </div>
            </div>

            {/* Reloj móvil */}
            <div className="px-4 pt-4">
              <div className="nb-clock" style={{ background: "#f0f4ff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <FaClock style={{ color: "#3b82f6", fontSize: 11 }} />
                {formatColombiaDate(dateTime)}
              </div>
            </div>

            {/* Secciones de menú */}
            {MENUS.map((m) => (
              <div key={m.id} className="nb-drawer-section">
                <p className="nb-drawer-label">{m.icon} {m.label}</p>
                {m.items.map((item) => (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    className="nb-drawer-item"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Logout */}
            <div className="nb-drawer-section" style={{ borderTop: "1px solid #f1f5f9", marginTop: 8, paddingTop: 12 }}>
              <button
                onClick={handleLogout}
                className="nb-drawer-item w-full text-left"
                style={{ color: "#dc2626", fontWeight: 700 }}
              >
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
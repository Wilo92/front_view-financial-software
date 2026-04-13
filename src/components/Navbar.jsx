import React, { useState, useEffect, useRef } from "react";
import logoApp from "../assets/logo.png";
import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaClock } from "react-icons/fa";

const Navbar = () => {

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const userData = {
    name: localStorage.getItem("user_name") || "Usuario Kartero",
    email: localStorage.getItem("user_email") || "usuario@correo.com"
  }

  const [text, setText] = useState("");
  const fullText = "KARTERO";
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formateador de fecha/hora para Colombia
  const formatColombiaDate = (dateTime) => {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(dateTime);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {

    let index = 0;

    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;

      if (index === fullText.length) {
        index = 0;
      }

    }, 200);

    return () => clearInterval(interval);

  }, []);


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setMenuOpen(null);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_active");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (

    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? "shadow-2xl py-1" : "shadow-none py-2"
        }`}
      style={{ backgroundColor: "#3d6ff8" }}
    >

      <div ref={menuRef} className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between w-full">

          <div className="flex items-center justify-start gap-10">

            {/* LOGO + NOMBRE */}

            <div className="flex items-center gap-5">

              <div className="w-25 md:w-25 transition-all">
                <img
                  src={logoApp}
                  alt="logo"
                  className="w-full h-auto object-contain drop-shadow-md"
                />
              </div>

              <div className="min-w-[300px] flex items-center">
                <h1 className="text-white text-xl md:text-2xl font-black italic tracking-[0.2em]">
                  {text}
                  <span className="animate-pulse ml-1 text-blue-200">|</span>
                </h1>
              </div>

            </div>


            {/* MENU 1 */}

            <div className="relative">

              <button
                onClick={() =>
                  setMenuOpen(menuOpen === "comparaciones" ? null : "comparaciones")
                }
                className="flex items-center text-white bg-[#3d6ff8] hover:bg-blue-600 px-5 py-2 rounded-full text-sm font-bold border border-white/20"
              >
                Menu

                <span
                  className={`ml-2 transition-transform ${menuOpen === "comparaciones" ? "rotate-180" : ""
                    }`}
                >
                  ▼
                </span>

              </button>

              {menuOpen === "comparaciones" && (

                <div className="absolute left-0 mt-4 w-60 bg-white rounded-xl shadow-2xl py-2 border">

                  <Link to="/" className="block px-4 py-3 hover:bg-blue-50">📄 Gestion de clientes</Link>
                  <Link to="/creditos" className="block px-4 py-3 hover:bg-blue-50">📄 Gestion de credito</Link>
                  <Link to="/Pagos" className="block px-4 py-3 hover:bg-blue-50">📄 Gestion de pagos</Link>


                </div>

              )}

            </div>



            {/* MENU 2 */}

            <div className="relative">

              <button
                onClick={() =>
                  setMenuOpen(menuOpen === "reportes" ? null : "reportes")
                }
                className="flex items-center text-white bg-[#3d6ff8] hover:bg-blue-600 px-5 py-2 rounded-full text-sm font-bold border border-white/20"
              >

                أنا عظيم

                <span
                  className={`ml-2 transition-transform ${menuOpen === "reportes" ? "rotate-180" : ""
                    }`}
                >
                  ▼
                </span>

              </button>


              {menuOpen === "reportes" && (

                <div className="absolute left-0 mt-4 w-60 bg-white rounded-xl shadow-2xl py-2 border">

                  <a className="block px-4 py-3 hover:bg-blue-50">أنا عظيم وسأصبح أفضل</a>
                  <a className="block px-4 py-3 hover:bg-blue-50">أنا عظيم وسأصبح أفضل</a>

                </div>

              )}

            </div>



            {/* MENU 3 */}

            <div className="relative">

              <button
                onClick={() =>
                  setMenuOpen(menuOpen === "auditoria" ? null : "auditoria")
                }
                className="flex items-center text-white bg-[#3d6ff8] hover:bg-blue-600 px-5 py-2 rounded-full text-sm font-bold border border-white/20"
              >

                أنا عظيم

                <span
                  className={`ml-2 transition-transform ${menuOpen === "auditoria" ? "rotate-180" : ""
                    }`}
                >
                  ▼
                </span>

              </button>


              {menuOpen === "auditoria" && (

                <div className="absolute left-0 mt-4 w-60 bg-white rounded-xl shadow-2xl py-2 border">

                  <a className="block px-4 py-3 hover:bg-blue-50">أنا عظيم وسأصبح أفضل</a>
                  <a className="block px-4 py-3 hover:bg-blue-50">أنا عظيم وسأصبح أفضل</a>

                </div>

              )}

            </div>
            <div className="flex-grow"></div>
            {/* LADO DERECHO: HORA + USUARIO */}
            <div className="flex items-center gap-6">

              {/* RELOJ COLOMBIA */}
              <div className="hidden lg:flex items-center gap-2 text-white/90 font-mono text-xs bg-black/20 px-4 py-2 rounded-lg border border-white/10">
                <FaClock className="text-blue-300" />
                {formatColombiaDate(dateTime)}
              </div>

              {/* PERFIL / LOGOUT */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === "profile" ? null : "profile")}
                  className="flex items-center gap-3 text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full border border-white/20 transition-all"
                >
                  <div className="text-right leading-tight hidden sm:block">
                    <p className="text-[10px] font-bold uppercase ">
                      {localStorage.getItem("user_name") || "Admin"}
                    </p>
                    <p className="text-[9px] text-blue-200 ">
                      {localStorage.getItem("user_email") || "online"}
                    </p>
                  </div>
                  <FaUserCircle className="text-2xl" />
                </button>

                {menuOpen === "profile" && (
                  <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-2xl py-2 border overflow-hidden">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center gap-2">
                      <FaSignOutAlt /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>

    </nav >

  );


};

export default Navbar;
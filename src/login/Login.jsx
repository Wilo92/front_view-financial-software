import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from '../api/axios';
import logoApp from "../assets/logo.png";
import wolfMascot from "../assets/kartero_wolf.png"; // ¡ASEGÚRATE DE ESTA RUTA!
import Footer from "../components/Footer";
import coinLottie from "../assets/img.lottie";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await clienteAxios.get("/sanctum/csrf-cookie");
      const response = await clienteAxios.post("/login", {
        email: formData.email,
        password: formData.password
      });

      if (response.status === 200 || response.status === 400) {
        localStorage.setItem("user_active", 'true');
        navigate("/");
      }

    } catch (error) {
      console.error("error detallado:", error.response);
      alert('error con las credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray overflow-x-hidden">
      {/* 💰 NAVBAR DE LA MONEDA */}
      <div className="relative w-full h-20 bg-white/60 backdrop-blur-sm border-b border-gray-100 flex items-center overflow-hidden">

        {/* Forzamos la animación mediante clases arbitrarias de Tailwind */}
        <div className="absolute w-20 h-20 will-change-transform 
                  animate-[coin-slide_23s_linear_infinite]">
          <DotLottieReact
            src={coinLottie}
            loop
            autoplay
          />
        </div>

        <div className="absolute w-20 h-20 will-change-transform 
                  animate-[coin-slide_23s_linear_infinite] [animation-delay:1s]">
          <DotLottieReact
            src={coinLottie}
            loop
            autoplay
          />
        </div>
        <div className="absolute w-20 h-20 will-change-transform 
                  animate-[coin-slide_23s_linear_infinite] [animation-delay:2s]">
          <DotLottieReact
            src={coinLottie}
            loop
            autoplay
          />
        </div>


        <style>{
          `
    @keyframes coin-slide {
      0% { left: -5%; }
      50% { left: 105%; }
      100% { left: -5%; }
    }
  `} </style>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-evenly w-full max-w-7xl gap-10 ">


          <div className="hidden md:flex md:w-[55%] justify-center items-center p-4">
            <img
              src={wolfMascot}
              alt="Kartero Wolf Mascot"
              className="w-full max-w-4xl h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] transition-all duration-500 hover:scale-105" />
          </div>

          {/* EL LOGIN (Tu diseño original, INTOCABLE) */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex-shrink-0">
            {/* Encabezado del Formulario - Branding */}
            <div className="bg-[#3b82f6] p-8 text-center">
              <img
                src={logoApp}
                alt="Kartero Logo"
                className="w-32 mx-auto mb-4 brightness-0 invert"
              />
              <h2 className="text-white text-2xl font-bold tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="text-blue-100 text-sm mt-2">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Campo: Correo Electrónico */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#3b82f6] transition-colors">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@kartero.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#3b82f6] transition-colors">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </button>

              <p className="text-center text-gray-500 text-xs">
                Al ingresar aceptas nuestros términos y condiciones.
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER REUTILIZADO */}
      <Footer />
    </div>
  );
};

export default Login;
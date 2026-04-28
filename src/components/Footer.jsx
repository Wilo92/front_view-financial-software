import React from "react";
import logoApp from "../assets/logo.png";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";
import useRandomPhrase from "../hooks/userRandomPhrase";




const Footer = () => {
  const frase = useRandomPhrase();
  return (
    <footer className="relative bg-[#0f172a] text-white py-2 overflow-hidden border-t border-white/20">

      <div className="absolute top-0 left-1/4 w-96 h-24 bg-blue-600/20 blur-[100px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">

          <div className="flex flex-col items-center md:items-start">
            <div className="w-32 mb-4 cursor-pointer animate-glitch">
              <img
                src={logoApp}
                alt="Logo Kartero"
                className="w-full h-auto object-contain"
              />
            </div>

          </div>


          <div className="flex justify-center">
            <p className="text-lg font-medium italic text-white max-w-[250px] leading-relaxed border-l-2 border-blue-500 pl-4">
              "{frase}"
            </p>
          </div>

          {/* COLUMNA 3: REDES SOCIALES */}
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs uppercase tracking-[0.3em] mb-4 text-white-500">
              Contactanos
            </span>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-blue-500 hover:text-white transition-all transform hover:scale-125"
              >
                <FaFacebook size={30} />
              </a>
              <a
                href="https://github.com/Wilo92"
                className="text-blue-500 hover:text-white transition-all transform hover:scale-125"
              >
                <FaGithub size={30} />
              </a>
              <a
                href="https://www.linkedin.com/in/wilmer-restrepo-830544242/"
                className="text-blue-500 hover:text-white transition-all transform hover:scale-125"
              >
                <FaLinkedin size={30} />
              </a>
            </div>
          </div>
        </div>


        <div className="mt-1 pt-1 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white font-mono">
            &copy; 2026 KREDI-www.crediorbit.com{" "}
            <span className="text-orange-500">Desarrollado por @wilo - www.wilolink.online</span>
          </p>
          <div className="flex gap-6 text-[10px] uppercase tracking-widest text-white">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

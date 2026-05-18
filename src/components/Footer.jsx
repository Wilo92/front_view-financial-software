import React from "react";
import logoApp from "../assets/logo.png";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";
import useRandomPhrase from "../hooks/userRandomPhrase";

const Footer = () => {
  const frase = useRandomPhrase();

  return (
    <footer className="relative bg-[#0a0f1e] text-white overflow-hidden border-t border-white/10">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

        .ft-root { font-family: 'DM Sans', sans-serif; }
        .ft-brand { font-family: 'Sora', sans-serif; }

        /* Glow orbs */
        .ft-orb-1 {
          position: absolute;
          width: 320px; height: 180px;
          left: -60px; top: -40px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .ft-orb-2 {
          position: absolute;
          width: 260px; height: 160px;
          right: -40px; bottom: -20px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Social icons */
        .ft-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px; height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: #93c5fd;
          transition: background 0.2s, color 0.2s, transform 0.2s, border-color 0.2s;
        }
        .ft-social:hover {
          background: #2563eb;
          color: #fff;
          border-color: #3b82f6;
          transform: translateY(-3px);
        }

        /* Frase quote */
        .ft-quote {
          position: relative;
          font-style: italic;
          font-size: 0.92rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.75);
          padding-left: 16px;
        }
        .ft-quote::before {
          content: '';
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 2px;
          border-radius: 2px;
          background: linear-gradient(180deg, #3b82f6, #818cf8);
        }

        /* Divider */
        .ft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 0;
        }

        /* Tag label */
        .ft-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 14px;
        }
        .ft-tag::before {
          content: '';
          display: inline-block;
          width: 16px; height: 1px;
          background: #334155;
        }
      `}</style>

      {/* Orbs de fondo */}
      <div className="ft-orb-1" />
      <div className="ft-orb-2" />

      <div className="ft-root relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* ── GRID PRINCIPAL ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* COL 1 — Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img
              src={logoApp}
              alt="Logo KREDI"
              className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
            <p className="ft-brand text-xs font-semibold tracking-[0.3em] text-blue-400/80 uppercase">
              Sistema de crédito
            </p>
          </div>

          {/* COL 2 — Frase */}
          <div className="flex justify-center">
            <blockquote className="ft-quote max-w-[240px] text-center md:text-left">
              "{frase}"
            </blockquote>
          </div>

          {/* COL 3 — Redes */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="ft-tag">Contáctanos</span>
            <div className="flex gap-3">
              <a href="#" className="ft-social" aria-label="Facebook">
                <FaFacebook size={17} />
              </a>
              <a
                href="https://github.com/Wilo92"
                target="_blank"
                rel="noreferrer"
                className="ft-social"
                aria-label="GitHub"
              >
                <FaGithub size={17} />
              </a>
              <a
                href="https://www.linkedin.com/in/wilmer-restrepo-830544242/"
                target="_blank"
                rel="noreferrer"
                className="ft-social"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="ft-divider mt-8 mb-5" />

        {/* ── COPYRIGHT ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-mono text-center sm:text-left">
            © 2026 KREDI —{" "}
            <a
              href="https://www.crediorbit.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              crediorbit.com
            </a>{" "}
            ·{" "}
            <span className="text-orange-400/80">
              Desarrollado por{" "}
              <a
                href="https://www.wilolink.online"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-300 transition-colors underline underline-offset-2"
              >
                @wilo
              </a>
            </span>
          </p>

          <div className="flex gap-5 text-[10px] uppercase tracking-widest text-slate-600">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import logoApp from "../assets/logo.png";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";
import useRandomPhrase from "../hooks/userRandomPhrase";

/* ══════════════════════════════════════════════════════════════
   FOOTER — KREDI
   Mejoras aplicadas:
   · safe-area-inset-bottom → no se corta en iPhone con home bar
   · Social icons: 44×44px tap target + gap mayor en móvil
   · Quote: barra izquierda solo en desktop, centrado limpio en móvil
   · Links legales: min-height 44px (área táctil correcta)
   · ft-tag sin línea decorativa en móvil (se ve suelta centrada)
   · Consistencia max-width con el resto de la app (960-1100px)
══════════════════════════════════════════════════════════════ */

const Footer = () => {
  const frase = useRandomPhrase();

  return (
    <footer className="ft-footer">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

        .ft-footer {
          position: relative;
          background: #0a0f1e;
          color: #fff;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,.08);
          font-family: 'DM Sans', sans-serif;
        }
        .ft-brand { font-family: 'Sora', sans-serif !important; }

        /* ── Glow orbs — sin cambios visuales ── */
        .ft-orb-1 {
          position: absolute; width: 320px; height: 180px;
          left: -60px; top: -40px;
          background: radial-gradient(ellipse, rgba(59,130,246,.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .ft-orb-2 {
          position: absolute; width: 260px; height: 160px;
          right: -40px; bottom: -20px;
          background: radial-gradient(ellipse, rgba(99,102,241,.14) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Inner wrapper ──
           MEJORA: padding-bottom con safe-area → no se corta
           en iPhone con home indicator (barra inferior)
        ── */
        .ft-inner {
          position: relative; z-index: 10;
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px max(24px, env(safe-area-inset-left))
                   max(28px, env(safe-area-inset-bottom))
                   max(24px, env(safe-area-inset-right));
        }

        /* ── Grid principal ── */
        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .ft-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        }

        /* ── COL 1: Logo ── */
        .ft-logo-col {
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
        }
        @media (min-width: 768px) { .ft-logo-col { align-items: flex-start; } }

        .ft-logo {
          height: 38px; width: auto;
          object-fit: contain;
          opacity: .88;
          transition: opacity .2s;
        }
        .ft-logo:hover { opacity: 1; }
        .ft-logo-label {
          font-family: 'Sora', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: .28em; text-transform: uppercase;
          color: rgba(96,165,250,.75);
        }

        /* ── COL 2: Quote ──
           MEJORA:
           · Mobile: centrado sin barra izquierda suelta
           · Desktop: barra izquierda con texto left-aligned
        ── */
        .ft-quote-col {
          display: flex; justify-content: center;
        }
        .ft-quote {
          position: relative;
          font-style: italic;
          font-size: 13.5px;
          line-height: 1.65;
          color: rgba(255,255,255,.70);
          text-align: center;
          max-width: 260px;
        }
        /* Barra izquierda — solo desktop */
        @media (min-width: 768px) {
          .ft-quote {
            text-align: left;
            padding-left: 16px;
          }
          .ft-quote::before {
            content: '';
            position: absolute;
            left: 0; top: 4px; bottom: 4px;
            width: 2px; border-radius: 2px;
            background: linear-gradient(180deg, #3b82f6, #818cf8);
          }
        }

        /* ── COL 3: Redes sociales ── */
        .ft-social-col {
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        @media (min-width: 768px) { .ft-social-col { align-items: flex-end; } }

        /* Label "Contáctanos"
           MEJORA: sin línea decorativa en móvil (se ve suelta) */
        .ft-contact-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: .15em; text-transform: uppercase;
          color: #64748b;
          display: flex; align-items: center; gap: 6px;
        }
        @media (min-width: 768px) {
          .ft-contact-label::before {
            content: '';
            display: inline-block;
            width: 16px; height: 1px; background: #334155;
          }
        }

        /* Social icons row */
        .ft-social-row { display: flex; gap: 10px; }

        /* ── Social icon ──
           MEJORA: 44×44px tap target (era 42×42)
           Gap aumentado para no tocarse en móvil
        ── */
        .ft-social-icon {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px;    /* ← tap target correcto */
          border-radius: 13px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
          color: #93c5fd;
          text-decoration: none;
          transition: background .2s, color .2s, transform .2s, border-color .2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .ft-social-icon:hover {
          background: #2563eb; color: #fff;
          border-color: #3b82f6; transform: translateY(-3px);
        }
        .ft-social-icon:active { transform: scale(.94); }

        /* ── Divider ── */
        .ft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent);
          margin: 28px 0 20px;
        }

        /* ── Copyright row ── */
        .ft-copyright-row {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
        }
        @media (min-width: 640px) {
          .ft-copyright-row { flex-direction: row; justify-content: space-between; gap: 8px; }
        }

        .ft-copyright {
          font-family: monospace;
          font-size: 11px; color: #475569;
          text-align: center; line-height: 1.6;
        }
        @media (min-width: 640px) { .ft-copyright { text-align: left; } }

        .ft-copyright a { color: #64748b; text-decoration: none; transition: color .15s; }
        .ft-copyright a:hover { color: #60a5fa; }
        .ft-copyright .ft-dev { color: rgba(251,146,60,.75); }
        .ft-copyright .ft-dev a { color: rgba(251,146,60,.75); text-decoration: underline; text-underline-offset: 2px; }
        .ft-copyright .ft-dev a:hover { color: #fb923c; }

        /* Links legales
           MEJORA: min-height 44px para área táctil correcta
        ── */
        .ft-legal-links {
          display: flex; gap: 4px;
        }
        .ft-legal-link {
          display: inline-flex; align-items: center;
          min-height: 44px; padding: 0 10px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .10em;
          color: #475569; text-decoration: none;
          transition: color .15s;
          -webkit-tap-highlight-color: transparent;
          border-radius: 8px;
        }
        .ft-legal-link:hover { color: #60a5fa; }

        /* ── Reduce motion ── */
        @media (prefers-reduced-motion: reduce) {
          .ft-social-icon { transition: none !important; }
        }
      `}</style>

      {/* Orbs decorativos */}
      <div className="ft-orb-1" aria-hidden="true" />
      <div className="ft-orb-2" aria-hidden="true" />

      <div className="ft-inner">

        {/* ── GRID PRINCIPAL ── */}
        <div className="ft-grid">

          {/* COL 1 — Logo */}
          <div className="ft-logo-col">
            <img src={logoApp} alt="Logo KREDI" className="ft-logo" />
            <span className="ft-logo-label">Sistema de crédito</span>
          </div>

          {/* COL 2 — Frase aleatoria */}
          <div className="ft-quote-col">
            <blockquote className="ft-quote" cite="#">
              "{frase}"
            </blockquote>
          </div>

          {/* COL 3 — Redes sociales */}
          <div className="ft-social-col">
            <span className="ft-contact-label">Contáctanos</span>
            <div className="ft-social-row" role="list">
              <a
                href="#"
                className="ft-social-icon"
                aria-label="Facebook"
                role="listitem"
              >
                <FaFacebook size={17} />
              </a>
              <a
                href="https://github.com/Wilo92"
                target="_blank"
                rel="noreferrer"
                className="ft-social-icon"
                aria-label="GitHub de Wilo92"
                role="listitem"
              >
                <FaGithub size={17} />
              </a>
              <a
                href="https://www.linkedin.com/in/wilmer-restrepo-830544242/"
                target="_blank"
                rel="noreferrer"
                className="ft-social-icon"
                aria-label="LinkedIn de Wilmer Restrepo"
                role="listitem"
              >
                <FaLinkedin size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="ft-divider" aria-hidden="true" />

        {/* ── COPYRIGHT ── */}
        <div className="ft-copyright-row">
          <p className="ft-copyright">
            © 2026 KREDI —{" "}
            <a href="https://www.crediorbit.com" target="_blank" rel="noreferrer">
              crediorbit.com
            </a>
            {" · "}
            <span className="ft-dev">
              Desarrollado por{" "}
              <a href="https://www.wilolink.online" target="_blank" rel="noreferrer">
                @wilo
              </a>
            </span>
          </p>

          <nav className="ft-legal-links" aria-label="Legal">
            <a href="#" className="ft-legal-link">Privacidad</a>
            <a href="#" className="ft-legal-link">Términos</a>
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
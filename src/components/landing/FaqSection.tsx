"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "¿Necesito hardware especial o tablets propias?",
    answer:
      "No. Bouquet funciona en cualquier dispositivo con navegador: celulares del equipo, tablets, laptops o incluso la computadora de caja. No hay que invertir en hardware costoso.",
  },
  {
    question: "¿Funciona si se va el internet del restaurante?",
    answer:
      "Sí. Bouquet tiene modo offline que guarda órdenes localmente y las sincroniza automáticamente cuando la conexión regresa. El turno no se detiene.",
  },
  {
    question: "¿Cuánto tarda la implementación?",
    answer:
      "Desde el primer contacto hasta tu primer turno operativo: un día. Te guiamos en la configuración de mesas, menú y usuarios. No detenemos tu operación.",
  },
  {
    question: "¿Puedo dividir la cuenta entre comensales?",
    answer:
      "Sí. Los comensales escanean el QR, ven su consumo individual y pagan solo lo que ordenaron. También pueden dividir equitativamente o pagar todo junto.",
  },
  {
    question: "¿Tiene integración con mi POS actual?",
    answer:
      "Bouquet se conecta nativamente con los principales POS del mercado. Si usas uno específico, nuestro equipo técnico evalúa la integración sin costo adicional.",
  },
  {
    question: "¿Hay contrato de permanencia?",
    answer:
      "No. Puedes cancelar cuando quieras sin penalizaciones. Creemos que el software debe retenerte por utilidad, no por contrato.",
  },
];

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item opacity-0 border-b border-burgundy/[0.08]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-burgundy lg:py-6"
        aria-expanded={isOpen}
      >
        <span className="text-[0.95rem] font-semibold text-burgundy lg:text-[1.05rem]">
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-burgundy/10 bg-white/60 transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <svg
            className="h-3.5 w-3.5 text-burgundy/60"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-5 text-[0.9rem] leading-[1.75] text-burgundy/60 lg:pb-6 lg:text-[0.95rem]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set([".faq-header > *", ".faq-item"], { opacity: 1, y: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".faq-header > *",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ".faq-header",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );

        gsap.fromTo(
          ".faq-item",
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: ".faq-list",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative flex min-h-[80dvh] flex-col justify-center overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#FDF2F5_0%,#FAF6F3_100%)] py-24 lg:py-36"
    >
      <div className="relative mx-auto max-w-[88rem] px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr] lg:gap-20">
          {/* Columna izquierda — sticky en desktop */}
          <div className="faq-header lg:sticky lg:top-32 lg:self-start">
            <p className="opacity-0 mb-5 inline-flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-burgundy/45">
              <span
                className="h-px w-12 bg-gradient-to-r from-rose/80 to-rose/20"
                aria-hidden="true"
              />
              Preguntas frecuentes
            </p>
            <h2 className="opacity-0 font-serif text-[clamp(2rem,4vw,3.5rem)] font-medium italic leading-[1.05] tracking-tight text-burgundy">
              Todo lo que necesitas saber.
            </h2>
            <p className="opacity-0 mt-6 max-w-sm text-[1rem] leading-[1.75] text-burgundy/55">
              Si no encontrás tu respuesta, escribinos. Respondemos en menos de
              2 horas.
            </p>

            <a
              className="opacity-0 mt-8 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-rose transition-colors hover:text-rose-light"
              href="#contacto"
            >
              Hablar con el equipo
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 10h12m-6-6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          {/* Columna derecha — preguntas */}
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <FaqItem key={i} index={i} {...faq} />
            ))}
          </div>
        </div>
      </div>

      {/* Schema JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}

import { useState, useEffect } from "react";

/**
 * CookieBanner — Winkü
 *
 * Banner de consentimiento de cookies con identidad visual andina oscura.
 * Guarda la elección del usuario y no vuelve a mostrarse en visitas posteriores
 * (salvo que se borre el storage o cambie la versión de la política).
 *
 * Uso en Inertia/React (por ejemplo en tu layout principal App.jsx):
 *   import CookieBanner from "@/Components/CookieBanner";
 *   ...
 *   <CookieBanner />
 *
 * Requiere Tailwind configurado (ya lo tienes en el proyecto).
 */

const CONSENT_KEY = "winku_cookie_consent";
const POLICY_VERSION = "1.0";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(stored);
      if (parsed.version !== POLICY_VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function saveConsent(choice) {
    const payload = {
      choice, // "accepted" | "rejected"
      version: POLICY_VERSION,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch {
      // localStorage no disponible; el banner simplemente se ocultará por esta sesión
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-900/40 bg-stone-950/95 shadow-2xl shadow-black/50 backdrop-blur-sm">
        {/* franja superior con motivo de borde andino, sutil */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-amber-700 via-red-800 to-amber-700" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-semibold tracking-wide text-amber-100">
                Usamos cookies
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-stone-300">
                Usamos cookies esenciales para que Winkü funcione y, si nos
                lo permites, cookies de preferencias y analíticas para
                mejorar la experiencia entre estudiantes.{" "}
                <a
                  href="/legal/cookies"
                  className="underline decoration-amber-600 underline-offset-2 hover:text-amber-200"
                >
                  Ver Política de Cookies
                </a>
              </p>

              {expanded && (
                <div className="mt-3 space-y-2 rounded-lg bg-stone-900/60 p-3 text-xs text-stone-400">
                  <p>
                    <span className="font-medium text-stone-300">
                      Esenciales:
                    </span>{" "}
                    necesarias para mantener tu sesión iniciada. No se pueden
                    desactivar.
                  </p>
                  <p>
                    <span className="font-medium text-stone-300">
                      Preferencias y analíticas:
                    </span>{" "}
                    nos ayudan a recordar tus filtros y a entender el uso de
                    la plataforma de forma agregada.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-300"
              >
                {expanded ? "Ocultar detalles" : "Ver detalles"}
              </button>
            </div>

            <div className="flex shrink-0 gap-2 sm:flex-col">
              <button
                type="button"
                onClick={() => saveConsent("accepted")}
                className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-600 sm:flex-none"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={() => saveConsent("rejected")}
                className="flex-1 rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition hover:bg-stone-800 sm:flex-none"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
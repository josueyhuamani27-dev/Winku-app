import { Link } from "@inertiajs/react";

/**
 * Layout compartido para las páginas legales de Winkü.
 * Ubicación sugerida: resources/js/Layouts/LegalLayout.jsx
 */
export default function LegalLayout({ title, updatedAt = "[fecha]", version = "1.0", children }) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <header className="border-b border-stone-800 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wide text-amber-500">
            Winkü
          </Link>
          <nav className="flex gap-4 text-xs text-stone-400">
            <Link href="/legal/terminos" className="hover:text-amber-400">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-amber-400">Privacidad</Link>
            <Link href="/legal/cookies" className="hover:text-amber-400">Cookies</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-8 border-b border-stone-800 pb-4">
          <h1 className="text-2xl font-bold text-amber-100">{title}</h1>
          <p className="mt-1 text-xs text-stone-500">
            Última actualización: {updatedAt} · Versión {version}
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-stone-300">
          {children}
        </div>
      </main>
    </div>
  );
}

/* Componentes de apoyo para mantener consistencia tipográfica */
export function H2({ children }) {
  return <h2 className="mt-8 text-lg font-semibold text-amber-100">{children}</h2>;
}
export function H3({ children }) {
  return <h3 className="mt-5 text-sm font-semibold text-stone-100">{children}</h3>;
}
export function P({ children }) {
  return <p>{children}</p>;
}
export function Ul({ children }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}
export function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-800">
      <table className="w-full text-left text-xs">
        <thead className="bg-stone-900 text-stone-400">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-stone-800">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-stone-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
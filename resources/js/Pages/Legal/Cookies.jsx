import LegalLayout, { H2, P, Table } from "@/Layouts/LegalLayout";

/**
 * Ubicación sugerida: resources/js/Pages/Legal/Cookies.jsx
 * Ruta sugerida: GET /legal/cookies -> Inertia::render('Legal/Cookies')
 */
export default function Cookies() {
  return (
    <LegalLayout title="Política de Cookies">
      <H2>3.1 ¿Qué son las cookies?</H2>
      <P>
        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo al
        navegar por Winkü, y que permiten recordar tus preferencias y mejorar tu experiencia.
      </P>

      <H2>3.2 Tipos de cookies que utilizamos</H2>
      <Table
        headers={["Tipo", "Finalidad", "¿Se pueden rechazar?"]}
        rows={[
          ["Esenciales", "Mantener la sesión iniciada, seguridad (CSRF), funcionamiento básico del sitio", "No, son indispensables"],
          ["Preferencias", "Recordar configuraciones como tema visual o filtros de búsqueda", "Sí"],
          ["Analíticas", "Entender cómo se usa la Plataforma para mejorarla (uso agregado, no identifica individualmente)", "Sí"],
        ]}
      />

      <H2>3.3 Gestión de cookies</H2>
      <P>
        Al ingresar por primera vez a Winkü, se te mostrará un banner donde podrás
        <strong> Aceptar</strong> o <strong>Rechazar</strong> las cookies no esenciales.
        Puedes cambiar tu elección en cualquier momento desde la configuración de tu
        navegador.
      </P>

      <H2>3.4 Cookies de terceros</H2>
      <P>
        La pasarela de pagos integrada puede utilizar sus propias cookies durante el proceso
        de pago, sujetas a su propia política de privacidad.
      </P>
    </LegalLayout>
  );
}
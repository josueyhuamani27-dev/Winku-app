import LegalLayout, { H2, P, Ul } from "@/Layouts/LegalLayout";

/**
 * Ubicación sugerida: resources/js/Pages/Legal/Privacidad.jsx
 * Ruta sugerida: GET /legal/privacidad -> Inertia::render('Legal/Privacidad')
 */
export default function Privacidad() {
  return (
    <LegalLayout title="Política de Privacidad">
      <H2>2.1 Responsable del tratamiento</H2>
      <P>
        Winkü, plataforma desarrollada en el marco de un proyecto estudiantil de la UNSCH,
        es responsable del tratamiento de los datos personales recolectados a través de la
        Plataforma.
      </P>

      <H2>2.2 Datos que recolectamos</H2>
      <Ul>
        <li><strong>Datos de registro:</strong> nombre completo, correo institucional (@unsch.edu.pe), número de WhatsApp (opcional, para contacto entre usuarios).</li>
        <li><strong>Datos de perfil:</strong> foto de perfil, descripción, categorías de servicios ofrecidos.</li>
        <li><strong>Datos de uso:</strong> historial de servicios solicitados/ofrecidos, calificaciones, mensajes relacionados con la coordinación de servicios.</li>
        <li><strong>Datos de pago:</strong> procesados a través de la pasarela de pagos integrada; Winkü no almacena números completos de tarjetas.</li>
        <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, cookies (ver Política de Cookies).</li>
      </Ul>

      <H2>2.3 Finalidad del tratamiento</H2>
      <P>Los datos se utilizan para:</P>
      <Ul>
        <li>Verificar la identidad estudiantil y habilitar el registro.</li>
        <li>Facilitar la conexión entre Prestadores y Clientes de servicios.</li>
        <li>Procesar pagos y prevenir fraudes.</li>
        <li>Mejorar la Plataforma mediante análisis agregado y anónimo de uso.</li>
        <li>Cumplir obligaciones legales aplicables.</li>
      </Ul>

      <H2>2.4 Compartición de datos</H2>
      <P>Winkü no vende datos personales a terceros. Los datos podrán compartirse únicamente con:</P>
      <Ul>
        <li>La pasarela de pagos, para procesar transacciones.</li>
        <li>Autoridades competentes, cuando exista una obligación legal o una investigación relacionada con el incumplimiento de estos Términos (incluyendo casos de la cláusula de deepfakes).</li>
      </Ul>

      <H2>2.5 Derechos del usuario (ARCO)</H2>
      <P>De acuerdo con la Ley N.º 29733, el usuario tiene derecho a:</P>
      <Ul>
        <li><strong>Acceso:</strong> conocer qué datos personales se tienen sobre él/ella.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
        <li><strong>Cancelación:</strong> solicitar la eliminación de sus datos, sujeto a obligaciones legales de conservación.</li>
        <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines específicos.</li>
      </Ul>
      <P>Estas solicitudes pueden realizarse escribiendo a [correo de contacto del equipo].</P>

      <H2>2.6 Conservación de datos</H2>
      <P>
        Los datos se conservarán mientras la cuenta esté activa y por el periodo adicional
        que exijan las obligaciones legales aplicables tras la eliminación de la cuenta.
      </P>

      <H2>2.7 Seguridad</H2>
      <P>
        Winkü implementa medidas técnicas razonables (cifrado de contraseñas, control de
        acceso, backups) para proteger los datos personales contra accesos no autorizados.
      </P>
    </LegalLayout>
  );
}
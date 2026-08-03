import LegalLayout, { H2, H3, P, Ul } from "@/Layouts/LegalLayout";

/**
 * Ubicación sugerida: resources/js/Pages/Legal/Terminos.jsx
 * Ruta sugerida: GET /legal/terminos -> Inertia::render('Legal/Terminos')
 */
export default function Terminos() {
  return (
    <LegalLayout title="Términos y Condiciones de Uso">
      <H2>1.1 Aceptación de los términos</H2>
      <P>
        Al registrarte y utilizar Winkü ("la Plataforma"), aceptas cumplir con estos
        Términos y Condiciones. Si no estás de acuerdo, no debes utilizar la Plataforma.
      </P>

      <H2>1.2 Descripción del servicio</H2>
      <P>
        Winkü es un marketplace de servicios entre pares (P2P/C2C) dirigido exclusivamente
        a estudiantes de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH),
        identificados mediante correo institucional (@unsch.edu.pe). La Plataforma permite
        publicar, buscar y contratar servicios entre estudiantes en categorías como tutoría
        académica, tecnología, diseño, apoyo social y eventos.
      </P>

      <H2>1.3 Registro y elegibilidad</H2>
      <Ul>
        <li>El registro requiere un correo institucional válido (@unsch.edu.pe) y verificación de identidad mediante dicho correo.</li>
        <li>El usuario es responsable de la veracidad de la información proporcionada en su perfil.</li>
        <li>Está prohibido crear cuentas falsas, suplantar la identidad de otro estudiante, o utilizar el correo institucional de un tercero sin autorización.</li>
      </Ul>

      <H2>1.4 Responsabilidades del usuario</H2>
      <Ul>
        <li>Los usuarios que ofrecen servicios ("Prestadores") son responsables de la calidad, veracidad y cumplimiento de lo ofrecido.</li>
        <li>Los usuarios que contratan servicios ("Clientes") son responsables de verificar la información antes de contratar y de cumplir con los acuerdos de pago establecidos.</li>
        <li>Winkü actúa como intermediario tecnológico y no es parte del acuerdo de servicio entre Prestador y Cliente, salvo en lo relacionado con el procesamiento de pagos a través de la Plataforma.</li>
      </Ul>

      <H2>1.5 Conducta prohibida</H2>
      <P>Está prohibido:</P>
      <Ul>
        <li>Publicar servicios ilegales, fraudulentos o que infrinjan normas de la universidad.</li>
        <li>Realizar acoso, discriminación o cualquier forma de violencia hacia otros usuarios.</li>
        <li>Manipular calificaciones o reseñas de forma fraudulenta.</li>
        <li>Utilizar la Plataforma para fines distintos a los de un marketplace de servicios estudiantiles.</li>
      </Ul>

      <H2>1.6 Cláusula de Deepfakes y contenido manipulado con IA</H2>
      <P>
        Queda <strong>expresamente prohibido</strong> el uso de imágenes, videos, audios o
        cualquier contenido generado o manipulado mediante inteligencia artificial
        (incluyendo, pero no limitado a, tecnologías de "deepfake") con el fin de:
      </P>
      <Ul>
        <li>Suplantar la identidad visual o de voz de otro usuario, estudiante o tercero.</li>
        <li>Falsificar evidencia de la realización, calidad o finalización de un servicio (por ejemplo, capturas o videos alterados que simulen un trabajo no realizado).</li>
        <li>Crear perfiles falsos utilizando rostros o voces generadas o manipuladas artificialmente.</li>
        <li>Difamar, acosar o dañar la reputación de otro usuario mediante contenido sintético.</li>
      </Ul>

      <H3>Consecuencias del incumplimiento</H3>
      <Ul>
        <li>Suspensión inmediata y temporal de la cuenta mientras se investiga el caso.</li>
        <li>Eliminación permanente del contenido infractor.</li>
        <li>Suspensión definitiva de la cuenta en caso de reincidencia o gravedad del hecho.</li>
        <li>Cuando corresponda, Winkü podrá reportar el incidente a las autoridades competentes de la UNSCH y, de ser necesario, a las autoridades legales pertinentes.</li>
      </Ul>

      <H2>1.7 Pagos y comisiones</H2>
      <Ul>
        <li>Winkü podrá cobrar una comisión sobre las transacciones realizadas a través de la Plataforma, la cual será informada de forma clara antes de confirmar cualquier pago.</li>
        <li>Los pagos se procesan a través de la pasarela de pagos integrada. Winkü no almacena datos completos de tarjetas de pago.</li>
      </Ul>

      <H2>1.8 Suspensión y terminación de cuentas</H2>
      <P>
        Winkü se reserva el derecho de suspender o eliminar cuentas que incumplan estos
        Términos, sin perjuicio de otras acciones legales que correspondan.
      </P>

      <H2>1.9 Modificaciones</H2>
      <P>
        Winkü podrá modificar estos Términos en cualquier momento. Los cambios significativos
        serán notificados y podrán requerir una nueva aceptación por parte del usuario.
      </P>

      <H2>1.10 Legislación aplicable</H2>
      <P>
        Estos Términos se rigen por las leyes de la República del Perú, incluyendo la Ley
        N.º 29733 (Ley de Protección de Datos Personales) y normativa conexa.
      </P>
    </LegalLayout>
  );
}
import { faqData, FAQItem, faqCategories } from '../data/faqData';
import { blogArticles, BlogArticle, blogCategories } from '../data/blogData';

export type Locale = 'en' | 'es';

export interface NavItem {
  name: string;
  desc: string;
  slug: string;
}

export const navTranslations: Record<Locale, {
  creativeStation: string;
  freeQrTools: string;
  designStudio: string;
  workspaces: string;
  faqTitle: string;
  blogTitle: string;
  signIn: string;
  signUp: string;
  signOut: string;
  secureDatabox: string;
  expertPresets: string;
  channelsCount: string;
  backToCreative: string;
  aboutUs: string;
  privacyPolicy: string;
  contactSupport: string;
  termsConditions: string;
  backToBlogList: string;
  cookieConsentTitle: string;
  cookieConsentText: string;
  accept: string;
  decline: string;
}> = {
  en: {
    creativeStation: "Creative Station",
    freeQrTools: "Free QR Tools",
    designStudio: "Design Studio",
    workspaces: "6 WORKSPACES",
    faqTitle: "FAQ",
    blogTitle: "Guides Blog",
    signIn: "Sign In / Sign Up",
    signUp: "Sign Up",
    signOut: "Sign Out",
    secureDatabox: "SECURE DATABOX",
    expertPresets: "Expert Presets & Converters",
    channelsCount: "10 CHANNELS AVAILABLE",
    backToCreative: "Back to Creative Station",
    aboutUs: "About Us",
    privacyPolicy: "Privacy Policy",
    contactSupport: "Contact & Support",
    termsConditions: "Terms & Conditions",
    backToBlogList: "Back to Article Hub",
    cookieConsentTitle: "Cookie Consent",
    cookieConsentText: "We use cookies to analyze scan counts, track campaign ROI, and improve your secure drawing station options.",
    accept: "Accept",
    decline: "Decline",
  },
  es: {
    creativeStation: "Estación Creativa",
    freeQrTools: "Herramientas QR Gratis",
    designStudio: "Estudio de Diseño",
    workspaces: "6 ESPACIOS",
    faqTitle: "Preguntas Frecuentes",
    blogTitle: "Blog de Guías",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    signOut: "Cerrar Sesión",
    secureDatabox: "BANCO DE DATOS SEGURO",
    expertPresets: "Ajustes Preestablecidos y Convertidores",
    channelsCount: "10 CANALES DISPONIBLES",
    backToCreative: "Volver a la Estación Creativa",
    aboutUs: "Nosotros",
    privacyPolicy: "Política de Privacidad",
    contactSupport: "Contacto y Soporte",
    termsConditions: "Términos y Condiciones",
    backToBlogList: "Volver al Centro de Artículos",
    cookieConsentTitle: "Consentimiento de Cookies",
    cookieConsentText: "Utilizamos cookies para analizar estadísticas, rastrear el ROI de campañas y mejorar las opciones de su estación segura.",
    accept: "Aceptar",
    decline: "Rechazar",
  }
};

// Creative Station Sub-items
export const creativeSubItems: Record<Locale, { name: string; desc: string }[]> = {
  en: [
    { name: 'AI QR Generator', desc: 'Design beautiful prompt-to-artwork QR templates' },
    { name: 'QR Designer', desc: 'Customize eye grids, gradients and quiet spaces' },
    { name: 'QR Templates', desc: 'Apply readymade premium business templates' },
    { name: 'QR Animations', desc: 'Apply sleek scanning indicators and sweep transitions' },
    { name: 'Brand Assets', desc: 'Upload centerpiece logos and corporate symbols' },
    { name: 'Marketing Materials', desc: 'Scale print formats, cards, flyers and media packs' }
  ],
  es: [
    { name: 'Generador de QR con IA', desc: 'Diseñe hermosas plantillas de arte mediante descripciones de texto' },
    { name: 'Diseñador de QR', desc: 'Personalice marcos de ojos, degradados y márgenes silenciosos' },
    { name: 'Plantillas de QR', desc: 'Aplique plantillas comerciales listas para usar' },
    { name: 'Animaciones de QR', desc: 'Aplique indicadores de escaneo y transiciones elegantes' },
    { name: 'Activos de Marca', desc: 'Cargue logotipos centrales y símbolos corporativos' },
    { name: 'Material de Marketing', desc: 'Escale formatos impresos, tarjetas, folletos y paquetes promocionales' }
  ]
};

// Translated Expert Preset Tools List
export const presetToolsTranslations: Record<Locale, { name: string; desc: string; slug: string }[]> = {
  en: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Secure web redirects with live trackable shortened links.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Contactless dynamic documents loading restaurant menus & guides.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Auto-pair guests to local wireless routers with no password typed.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Share rich digital contact records immediately to scanners.' },
    { name: 'Email QR', slug: 'email-qr-generator', desc: 'Preconfigure receiver addresses with customized boilerplate body text.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Compose direct-to-text messages with pre-allocated phone nodes.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Trigger instant customized chat logs instantly with customer staff.' },
    { name: 'Social QR', slug: 'instagram-qr-generator', desc: 'Consolidate bio-links directly to Instagram, Facebook and Youtube.' },
    { name: 'Text QR', slug: 'text-qr', desc: 'Store raw text keys, offline copyable logs and secret key matrices.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Direct visitors directly to App Store / Play Store download entries.' },
  ],
  es: [
    { name: 'URL de QR', slug: 'url-qr-generator', desc: 'Redirecciones web seguras con enlaces cortos rastreables en vivo.' },
    { name: 'PDF de QR', slug: 'pdf-qr-generator', desc: 'Documentos dinámicos para menús de restaurantes y guías sin contacto.' },
    { name: 'WiFi de QR', slug: 'wifi-qr-generator', desc: 'Conecte invitados de forma automática sin ingresar contraseñas.' },
    { name: 'vCard de QR', slug: 'vcard-qr-generator', desc: 'Comparta tarjetas de contacto digitales de inmediato con escáneres.' },
    { name: 'Email de QR', slug: 'email-qr-generator', desc: 'Preconfigure direcciones de destino con plantillas de cuerpo de texto.' },
    { name: 'SMS de QR', slug: 'sms-qr-generator', desc: 'Redacte mensajes de texto directos con números de teléfono dedicados.' },
    { name: 'WhatsApp de QR', slug: 'whatsapp-qr-generator', desc: 'Inicie chats de WhatsApp instantáneos con soporte o agentes.' },
    { name: 'Redes de QR', slug: 'instagram-qr-generator', desc: 'Consolide enlaces múltiples para Instagram, Facebook y Youtube.' },
    { name: 'Texto de QR', slug: 'text-qr', desc: 'Guarde texto plano, registros sin conexión y matrices de claves secretas.' },
    { name: 'App Store de QR', slug: 'app-store-qr', desc: 'Dirija a sus clientes a las páginas de descarga de App Store.' },
  ]
};

// FAQ Translations Mapping
export const faqCategoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    all: "All Questions",
    general: "General & Basics",
    creation: "QR Creation",
    customization: "Customization & Styling",
    security: "Security & Privacy",
    business: "Business & Commercial"
  },
  es: {
    all: "Todas las preguntas",
    general: "Conceptos Básicos",
    creation: "Creación de QR",
    customization: "Personalización y Estilo",
    security: "Seguridad y Privacidad",
    business: "Comercial y Negocios"
  }
};

const faqTranslationsEs: Record<string, { question: string; answer: string }> = {
  "what-is-qr-code": {
    question: "¿Qué es un código QR?",
    answer: "Un código QR (código de respuesta rápida) es un código de barras matricial bidimensional diseñado originalmente en 1994 para la industria de la automotriz en Japón. Consiste en cuadrados negros dispuestos en una cuadrícula sobre un fondo blanco, legibles por cámaras, teléfonos inteligentes y escáneres dedicados. Almacenan significativamente más datos que los códigos de barras de una dimensión estándar, incluidos enlaces, texto plano, información de contacto, credenciales de redes inalámbricas y coordenadas."
  },
  "how-do-qr-codes-work": {
    question: "¿Cómo funcionan los códigos QR?",
    answer: "Los códigos QR funcionan traduciendo información digital en números binarios representados por patrones de puntos claros y oscuros. Tres grandes cuadrados de posicionamiento en las esquinas ayudan a la cámara a detectar la rotación y el ángulo de lectura. Además, cuentan con algoritmos de corrección de errores matemáticos integrados (como Reed-Solomon), lo que permite que sigan siendo completamente utilizables incluso si se ensucian, dañan, rayan o cubren parcialmente."
  },
  "is-unlimited-qr-free": {
    question: "¿Es gratis el Generador de QR Ilimitado?",
    answer: "Sí, Unlimited QR Generator es 100% gratuito. No hay tarifas de suscripción mensuales, compras en la aplicación ni muros de pago premium requeridos para diseñar, descargar o guardar códigos QR vectoriales de alta calidad en su computadora o móvil."
  },
  "can-i-create-unlimited": {
    question: "¿Puedo crear códigos QR ilimitados?",
    answer: "¡Absolutamente! No hay límites en la cantidad de códigos QR estáticos o dinámicos que puede crear en nuestra plataforma. Puede diseñar tantos códigos como sea necesario para uso personal o comercial. Todo el motor vectorial compila localmente en su propio navegador en tiempo real."
  },
  "do-qr-codes-expire": {
    question: "¿Caducan los códigos QR?",
    answer: "No, los códigos QR estáticos nunca caducan. Debido a que codifican los datos (como una URL de destino, una contraseña de WiFi o un vCard) directamente en la cuadrícula visible, seguirán funcionando para siempre mientras los datos de destino permanezcan sin cambios. Los códigos QR dinámicos en nuestra plataforma también permanecen activos a menos que decida eliminarlos manualmente desde su panel."
  },
  "can-i-customize-colors": {
    question: "¿Puedo personalizar los colores del código QR?",
    answer: "Sí, nuestro diseñador interactivo le permite modificar por completo los colores de primer plano y de fondo. Puede configurar colores sólidos, degradados lineales o radiales suaves con transiciones de color, y estilos de esquinas de ojos personalizados. Le sugerimos mantener un alto contraste con el fondo para que cualquier cámara física lo escanee de inmediato."
  },
  "can-i-add-logos": {
    question: "¿Puedo agregar logotipos a mis códigos QR?",
    answer: "Sí, puede arrastrar y soltar cualquier logotipo de marca o cargar imágenes personalizadas en formato PNG o SVG para incrustarlo en el centro exacto de su código QR. La plataforma aplica niveles robustos de corrección de errores para asegurar que la lectura del escáner ignore la sección del logotipo central y recupere todos los datos sin problemas."
  },
  "are-qr-codes-secure": {
    question: "¿Son seguros los códigos QR?",
    answer: "En sí mismos, los códigos de barras bidimensionales son contenedores pasivos de datos y no pueden albergar virus o software malicioso de forma activa. Sin embargo, pueden dirigir a los usuarios a sitios web con software fraudulento o descargas maliciosas. Siempre verifique la URL mostrada por su aplicación de escáner de cámara preferida antes de descargar archivos o introducir información confidencial."
  },
  "can-businesses-use-them": {
    question: "¿Pueden las empresas usarlos comercialmente?",
    answer: "Sí, la tecnología de códigos QR es de dominio público, lo que significa que cualquier empresa o particular puede usarlos globalmente sin pagar regalías o licencias comerciales. Son soluciones perfectas para dirigir la publicidad tradicional a experiencias web dinámicas e interactivas."
  },
  "wifi-qr-codes": {
    question: "¿Puedo crear códigos QR para WiFi?",
    answer: "Sí, ofrecemos un generador dedicado para redes WiFi. Puede ingresar el nombre exacto de la red (SSID), la clave de acceso de su enrutador inalámbrico y seleccionar el protocolo de encriptación estándar (WPA/WPA2, WEP o Abierto). Al escanear el código en dispositivos móviles, se mostrará un aviso del sistema para conectarse a la red en un solo toque."
  },
  "vcard-qr-codes": {
    question: "¿Puedo crear códigos de vCard?",
    answer: "Sí, puede ingresar nombres de contacto, números de teléfono, correos electrónicos, direcciones y enlaces comerciales para generar archivos de contacto vCard completos. Al escanearse, sugerirá inmediatamente agregar toda la información directamente a la agenda del dispositivo físico, evitando errores ortográficos de entrada."
  },
  "social-media-qr": {
    question: "¿Puedo crear códigos de redes sociales?",
    answer: "¡Sí! Nuestra sección de páginas de biografía le permite unificar múltiples enlaces a Instagram, YouTube, Facebook, TikTok y X en una hermosa página integrada, para simplificar los embudos de conversión y maximizar las métricas sociales corporativas."
  },
  "can-qr-be-printed": {
    question: "¿Se pueden imprimir los códigos QR?",
    answer: "Por supuesto. De hecho, se imprimen comúnmente en folletos, vallas publicitarias, tarjetas de presentación, menús de restaurantes y etiquetas de empaque. Recomendamos descargar el archivo en formato SVG vectorial para escalar su tamaño indefinidamente sin perder resolución en imprentas masivas."
  },
  "why-not-scanning": {
    question: "¿Por qué mi código QR no se escanea?",
    answer: "Los problemas más comunes son: bajo contraste de color entre el primer plano y el fondo (por ejemplo, amarillo sobre blanco); modificaciones de diseño demasiado agresivas que alteran los patrones oculares del lector; impresiones borrosas con tinta corrida o tamaños inferiores a 2 cm. Asegúrese de que la relación de contraste sea óptima antes de imprimir."
  },
  "formats-supported": {
    question: "¿Qué formatos de archivo se admiten?",
    answer: "Nuestra estación admite la exportación en PNG de alta resolución para usos cotidianos en web y SVG vectorial para impresiones a gran escala en pancartas y materiales corporativos."
  },
  "no-account-needed": {
    question: "¿Necesito registrarme para obtener una cuenta?",
    answer: "No, el generador funciona en su totalidad de forma abierta y totalmente local en su navegador web. El registro de cuenta le ofrece funciones de guardado en la nube para sus plantillas preferidas y acceso completo a los reportes históricos del panel de análisis."
  },
  "are-qr-stored": {
    question: "¿Se almacenan mis códigos QR en el servidor?",
    answer: "Los códigos estáticos se evalúan de forma puramente local en el espacio aislado de su navegador sandbox y nunca se envían a nuestros servidores web. Los códigos dinámicos con estadísticas se registran de forma segura en bases de datosFirestore cifradas en la nube para facilitar flujos analíticos en tiempo real."
  },
  "how-to-contact-support": {
    question: "¿Cómo contacto al soporte técnico?",
    answer: "Puede enviar sus preguntas directamente a admin@isolutionsico.com o completar el práctico formulario interactivo en la sección de contacto. El equipo busca resolver todas las inquietudes técnicas dentro de las 24 horas hábiles posteriores a su recepción."
  },
  "can-i-change-static-qr": {
    question: "¿Puede modificarse el enlace de un QR estático impreso?",
    answer: "No, los códigos estáticos hornean la información en el patrón visual, lo que requiere volver a imprimir el código si la URL de destino cambia. Para actualizaciones flexibles sin reimpresión, use nuestros códigos dinámicos en su lugar."
  },
  "what-is-error-correction": {
    question: "¿Qué es la corrección de errores de códigos QR?",
    answer: "La corrección de errores integrada le permite al código seguir siendo elegible para la cámara incluso si se ensucia o se rompe parcialmente. Se admiten cuatro niveles generales: Bajo (L) de 7%, Medio (M) de 15%, Cuartil (Q) de 25% y Alto (H) de 30% (perfecto para soportar logotipos agregados)."
  },
  "best-size-for-printing": {
    question: "¿Cuál es el tamaño ideal para impresión?",
    answer: "El tamaño final depende de la distancia del escáner al objeto físico, manteniendo una relación promedio de 10:1 (un folleto a 1 metro de distancia debe usar al menos un código impreso de 10x10 cm). En general, mantenga un tamaño de al menos 2x2 cm."
  },
  "can-qr-record-gps": {
    question: "¿Escanear un código QR puede recopilar mi GPS?",
    answer: "No de forma automática, puesto que la lectura de la cámara no tiene privilegios de geolocalización propios sin consentimiento. Sin embargo, los códigos dinámicos estiman métricas agregadas aproximadas utilizando la dirección IP de la solicitud de redirección."
  },
  "how-many-characters": {
    question: "¿Cuántos caracteres puede almacenar un código QR?",
    answer: "Admite hasta 7,089 caracteres numéricos, 4,296 alfanuméricos o 2,953 bytes tradicionales. Cuantos más datos agregue, más denso será el patrón visual de la cuadrícula, por lo que sugerimos usar enlaces cortos en sus campañas."
  },
  "are-there-hidden-scans": {
    question: "¿Existe un límite de escaneos para sus códigos?",
    answer: "No, no hay límites de escaneo en Unlimited QR Generator. Los códigos se pueden escanear millones de veces sin interrupción de conexiones, redirecciones intermedias o tarifas de tráfico ocultas."
  },
  "do-qr-work-offline": {
    question: "¿Funcionan los códigos QR sin conexión a Internet?",
    answer: "Los códigos estáticos que almacenan contenido puramente fuera de línea (como WiFi, vCard, texto o SMS) se procesan instantáneamente en las apps de cámara nativas sin internet. Los códigos que enlazan a sitios web requerirán de conexión activa."
  }
};

export function getLocalizedFaq(locale: Locale): FAQItem[] {
  if (locale === 'en') return faqData;
  return faqData.map(item => {
    const translation = faqTranslationsEs[item.id];
    if (translation) {
      return {
        ...item,
        question: translation.question,
        answer: translation.answer
      };
    }
    return item;
  });
}

// Blog Articles Translations
const blogTranslationsEs: Record<string, {
  title: string;
  intro: string;
  contentMarkdown: string;
  relatedFAQs: { question: string; answer: string }[];
  internalLinks: { label: string; url: string }[];
}> = {
  "what-is-qr-code-how-it-works": {
    title: "¿Qué es un código QR y cómo funciona?",
    intro: "Los códigos QR de respuesta rápida han pasado de ser sistemas especializados de seguimiento automotriz en los años 90 a convertirse en símbolos mundiales de conveniencia interactiva. Esta guía revela los algoritmos y la ciencia de los gráficos bidimensionales.",
    contentMarkdown: `## Comprensión del estándar de matriz 2D

A diferencia de los códigos de barras unidimensionales tradicionales que codifican números a lo largo de un solo eje de escaneo lineal, los códigos QR son **símbolos de matriz bidimensional**. Almacenan datos tanto en el eje horizontal como en el vertical, lo que les permite capturar hasta 300 veces más información que los códigos estándar.

### Componentes visuales clave de un código QR

Cuando observa un código QR de diseño personalizado, verá varios elementos lógicos que ayudan a la cámara a leerlo con precisión:
1. **Patrones de posición (Finder)**: Los tres cuadrados grandes concéntricos en las esquinas que orientan rápidamente el escáner y detectan la rotación del papel.
2. **Patrones de alineación**: Cuadrículas de posicionamiento menores útiles para ajustar la legibilidad en formas curvas como botellas o vasos.
3. **Patrón de tiempo (Timing)**: Líneas alternas de puntos que conectan las guías para mapear la escala de la cuadrícula física.
4. **Información de formato**: Detalla la versión de datos y el corrector de errores activo.
5. **Zona silenciosa (Quiet Zone)**: El margen libre de ruido o letras que enmarca todo el perímetro para aislar el código.

### Codificación del canal binario

Los motores de cálculo dividen la información (ya sean redes WiFi, enlaces o tarjetas de presentación) en una estructura binaria de blanco y negro, organizados en módulos:
* **Formato numérico**: Ideal para números de serie o teléfonos.
* **Formato alfanumérico**: Permite mayúsculas, algunos caracteres de puntuación y números.
* **Formato Byte (binario de 8 bits)**: El estándar universal para textos, URLs y campañas de marketing dinámico.

### El poder del algoritmo corrector Reed-Solomon

Una de las grandes ventajas de la tecnología QR es su resistencia a daños. Gracias al **algoritmo algebraico de Reed-Solomon**, el software de renderizado escribe redundancias matemáticas en la imagen. Si el papel impreso se rompe, ensucia o raya, la cámara es capaz de reconstruir la matriz sin perder información. Ofrecemos cuatro niveles:
* **Nivel L**: Corrige hasta el 7% de módulos perdidos.
* **Nivel M**: Corrige hasta el 15% de módulos perdidos.
* **Nivel Q**: Corrige hasta el 25% de módulos perdidos.
* **Nivel H**: Corrige hasta el 30% de módulos perdidos (ideal para logotipos centralizados).`,
    relatedFAQs: [
      {
        question: "¿Pueden las cámaras comunes leer un código dañado?",
        answer: "Sí, si se genera en nivel de corrección Q o H, puede resistir rayones severos o logotipos sin fallar en el escaneo."
      }
    ],
    internalLinks: [
      { label: "Crear un código QR personalizado", url: "/" },
      { label: "Ver preguntas frecuentes", url: "/faq" }
    ]
  },
  "10-ways-businesses-use-qr-codes-increase-sales": {
    title: "10 Formas en que las Empresas utilizan Códigos QR para aumentar las Ventas",
    intro: "Las marcas buscan constantemente conectar la publicidad física con interacciones web inmediatas de alta conversión. Descubra diez formas innovadoras para optimizar sus campañas comerciales hoy.",
    contentMarkdown: `## Conectando el marketing tradicional con herramientas web

El material impreso tradicional (letreros, cajas o volantes) tiene una limitación clásica de interacción: los usuarios se cansan de escribir enlaces largos en sus móviles de forma manual. El código QR unifica ambos mundos con un solo escaneo.

### 10 Estrategias comerciales de alto impacto

1. **Vínculos de empaque interactivos**: Acceda a manuales de ensamble detallados o videos instructivos escaneando un código en la caja del producto.
2. **Soportes de mesa inalámbricos**: Implemente menús digitales cómodos en restaurantes para reducir tiempos de atención del camarero.
3. **Escaneo de tiendas de apps**: Comparta un solo código dinámico que reconozca si el visitante usa iOS o Android, para dirigirlo a la tienda correcta.
4. **Incentivos de cupón rápido**: Ofrezca descuentos rápidos en caja a cambio del registro del cliente en su boletín mensual.
5. **Programas dinámicos de eventos**: Permita a los asistentes de congresos descargar planos pdf del recinto y agendas actualizadas.
6. **Tarjetas de presentación inteligentes**: Guarde datos completos de contacto comercial de vCard para evitar ingresos ortográficos manuales en la agenda de teléfonos.
7. **Consolidadores de perfiles sociales (Bio Links)**: Centralice enlaces a redes sociales (YouTube, TikTok, Facebook) en una sola landing.
8. **Pagos instantáneos sin contacto**: Muestre códigos QR fijos para recibir transferencias bancarias de inmediato.
9. **Formularios de contacto directos**: Facilite encuestas de servicio al cliente en puntos físicos para fidelizar la atención.
10. **Recopiladores de reseñas públicas**: Anime a los comensales y visitantes a dejar calificaciones agregadas en plataformas de reputación internacional mediante stands de mesa.`,
    relatedFAQs: [
      {
        question: "¿Sugieren usar estadísticas de escaneo para campañas?",
        answer: "Sí, el rastreo dinámico le permite conocer horas de escaneo, navegadores más comunes y áreas metropolitanas para fundamentar sus inversiones."
      }
    ],
    internalLinks: [
      { label: "Comience a diseñar un vCard", url: "/" }
    ]
  },
  "how-to-create-wifi-qr-code": {
    title: "Cómo crear un Código QR de WiFi para Invitados",
    intro: "¿Cansado de dictar contraseñas largas y repetir caracteres especiales a los invitados de su local? Aprenda a consolidar las contraseñas en un código QR de emparejamiento automático.",
    contentMarkdown: `## Evitando contraseñas difíciles escritas en papel

Proporcionar WiFi en oficinas, hoteles y restaurantes de paso suele generar fricción técnica y contraseñas equivocadas debido a caracteres confusos. Con un código QR el proceso se realiza con un rápido enfoque.

### Sintaxis del protocolo de encriptación inalámbrica

El código de barras WiFi utiliza una estructura de sintaxis estándar reconocida por las cámaras nativas de iOS y Android:

\`WIFI:S:MyNetworkSSID;T:WPA;P:SecretMyPassword;H:false;;\`

Donde:
* **WIFI:** Inicia la interpretación del enrutador.
* **S:** Es el nombre de la red SSID exacto (sensible a mayúsculas).
* **T:** El tipo de seguridad web de su módem (WPA/WPA2, WEP).
* **P:** La contraseña de red.
* **H:** Indica si es una red invisible u oculta (verdadero/falso).

### Configuración paso a paso

1. **Seleccione la pestaña de WiFi**: Abra el Unlimited QR Generator y marque el canal de emparejamiento WiFi.
2. **Escriba el SSID**: Ingrese el nombre exacto de la red WiFi de su router.
3. **Seguridad**: Elija WPA/WPA2 para routers estándar del mercado.
4. **Introduzca la contraseña**: Ingrese la contraseña de red de su establecimiento.
5. **Estilice a mano**: Añada colores, marcos de ojos circulares o un icono para sugerir la naturaleza inalámbrica de la conexión.
6. **Descargue el SVG**: Descargue el archivo en vectores e imprímalo en stands de mesa.`,
    relatedFAQs: [
      {
        question: "¿Los clientes necesitan una app para emparejar la WiFi?",
        answer: "No, las cámaras incorporadas en la mayoría de los sistemas operativos interpretan este protocolo de forma automática."
      }
    ],
    internalLinks: [
      { label: "Generar código WiFi de inmediato", url: "/" }
    ]
  },
  "qr-codes-restaurants-digital-menus": {
    title: "Códigos QR en Restaurantes y Menús Digitales",
    intro: "Modernice el servicio de mesa de su restaurante disminuyendo costos de reimpresión de cartas de papel mediante el uso de menús sin contacto.",
    contentMarkdown: `## La transformación digital de la gastronomía

Las cartas tradicionales de cartón se desgastan con facilidad, son difíciles de sanitizar y caras de modificar ante cambios estacionales. Los stands QR en las mesas permiten enlazar a los clientes con un sitio web con menús digitales interactivos.

### Beneficios operativos principales

* **Precios actualizados al instante**: Si un platillo se agota antes del cierre de cocina, puede actualizar la carta en línea sin gastos de imprenta.
* **Fomento del ticket promedio**: Una carta digital con fotos atractivas y sugerencias cruzadas aumenta el valor de cada orden de comida habitualmente.
* **Eficiencia de camareros**: Los clientes revisan y ordenan apenas se sientan, permitiendo al staff enfocarse en un servicio de mesa impecable.
* **Cartas en múltiples idiomas**: Configure redirecciones de acuerdo al idioma preferido de cada comensal para acoger turistas extranjeros.`,
    relatedFAQs: [
      {
        question: "¿Puedo usar el mismo código QR para actualizar menús estacionales?",
        answer: "Sí, mediante la opción de QR dinámico, puede redefinir la dirección de red o el menú PDF de destino sin cambiar el gráfico impreso."
      }
    ],
    internalLinks: [
      { label: "Diseñar un menú QR", url: "/" }
    ]
  },
  "best-qr-code-marketing-strategies": {
    title: "Mejores Estrategias de Marketing con Códigos QR",
    intro: "Simplemente colocar un gráfico de puntos oscuros sobre un cartel pasivo ya no es suficiente para asegurar escaneos de clientes. Aprenda a estilizar estos códigos de manera atractiva.",
    contentMarkdown: `## Convirtiendo el Código QR en una Herramienta de Conversión Activa

El marketing actual de alto nivel combina tipografías seleccionadas, consistencia de colores y llamadas a la acción explícitas. El código QR debe diseñarse de forma coherente con su marca gráfica para maximizar retornos empresariales.

### Reglas clave para el diseño de campañas QR

* **Llamada a la Acción (CTA) específica**: Un código sin indicaciones recibe poca atención. Use textos complementarios como *"Escanee para ver el menú"* o *"Obtenga 15% de descuento aquí"*.
* **Monitoreo de estadísticas dinámicas**: Registre el ROI de su publicidad en exteriores revisando estadísticas geográficas de escaneo en tiempo real.
* **Colores corporativos e inserción de logos**: Agregue los colores principales de su negocio y coloque su logotipo para inspirar confianza y profesionalidad.
* **Ubicaciones aptas**: Evite la instalación de códigos en vehículos en movimiento rápido o pancartas reflectantes con brillos excesivos que impidan la lectura de la lente.`,
    relatedFAQs: [
      {
        question: "¿Cómo monitoreo las estadísticas agregadas de escaneo?",
        answer: "Acceda a la sección de análisis para consultar reportes históricos clasificados por hora, zona geográfica estimada y tipos de móvil."
      }
    ],
    internalLinks: [
      { label: "Iniciar campaña y revisar análisis", url: "/analytics" }
    ]
  },
  "qr-codes-events-conferences": {
    title: "Códigos QR para Eventos y Conferencias",
    intro: "Optimice el ingreso de miles de visitantes a sus congresos mediante credenciales con códigos QR, simplificando acreditaciones y accesos a salas de expositores.",
    contentMarkdown: `## Acreditación rápida y carpetas digitales sin papel

La logística de eventos suele ser compleja. Integrar códigos QR en acreditaciones impresas y salas físicas acelera el flujo de registro considerablemente.

### Flujos sencillos de agilización logística

1. **Ingresos rápidos sin filas**: Envíe pases digitales cómodos por correo que el staff pueda escanear de manera ágil en las entradas.
2. **Agendas y perfiles digitales**: Coloque letreros exteriores en la entrada de las salas que apunten a los horarios de ponencias y biografías de los expertos.
3. **Guías de salas de exhibición**: Reduzca mapas impresos permitiendo descargar planos interactivos del recinto desde un código QR principal.
4. **Resumen de encuestas de satisfacción**: Facilite encuestas de ponencia rápidas instalando códigos de Google Forms en los asientos o salidas.`,
    relatedFAQs: [
      {
        question: "¿Se admiten creaciones de códigos en volumen masivo?",
        answer: "Nuestra infraestructura está preparada para responder de forma masiva. Contáctenos para recibir asesoramiento de integraciones de bases de datos."
      }
    ],
    internalLinks: [
      { label: "Diseñar pases de eventos impresos", url: "/" }
    ]
  },
  "qr-codes-in-education": {
    title: "Los Códigos QR en la Educación Escolar",
    intro: "Las aulas se benefician de herramientas interactivas eficaces. Aprenda a enriquecer los libros de texto y las tareas con recursos en audio y lecciones en video.",
    contentMarkdown: `## Vinculando textos escolares con actividades interactivas

Instalar códigos QR en esquinas de hojas impresas o en pizarras de avisos estimula el autoaprendizaje interactivo en escuelas de educación inicial y superior.

### Casos de uso escolar cotidianos

* **Audio de idiomas directo**: Facilite grabaciones de pronunciación correctas al lado de listas de palabras extranjeras en folletos escolares de estudio.
* **Consultas de hojas de resultados**: Proporcione códigos de respuestas de exámenes en paneles públicos para promover la autoevaluación guiada.
* **Tutoriales de tareas complejas**: Agregue códigos que apunten a explicaciones en video sencillas de álgebra o ciencia junto a las actividades.
* **Informes de padres y apoderados**: Imprima códigos en informes escolares para abrir bitácoras de profesores de forma cómoda.`,
    relatedFAQs: [
      {
        question: "¿Los códigos estáticos son seguros frente a accesos infantiles?",
        answer: "Sí, puesto que el código únicamente contiene la dirección escrita. Siempre verifique que la URL de destino sea adecuada para los estudiantes antes de imprimir."
      }
    ],
    internalLinks: [
      { label: "Diseñar pases de estudio", url: "/" }
    ]
  },
  "common-qr-code-mistakes-avoid": {
    title: "Errores Comunes al Crear Códigos QR y cómo evitarlos",
    intro: "Evite fallas de lectura y pérdidas económicas en impresión. Aprenda sobre reglas de contraste, distancia de enfoque y tamaño físico.",
    contentMarkdown: `## Asegurando una Legibilidad de Lectura Perfecta en sus Impresos

Aunque el software genera gráficos en segundos, que estos se lean en condiciones de poca luz requiere cumplir con ciertos parámetros de diseño básicos.

### 8 Errores críticos de diseño a resolver

1. **Baja relación de contraste**: Evite el uso de colores con diferencias menores (por ejemplo, puntos naranja sobre fondo crema). Use relaciones mínimas de contraste superiores a 4:1.
2. **Textos excesivamente extensos en modo estático**: No cargue enlaces cargados de parámetros largos. La cuadrícula de puntos se volverá densa de leer. Use redirecciones de enlaces cortos.
3. **Ignorar el margen perimetral**: Mantenga vacío el espacio perimetral (Zona de Silencio). Si coloca texto o márgenes decorativos muy cerca, los lectores no decodificarán con éxito.
4. **Impresiones inferiores al tamaño recomendado**: Tamaños menores a 2x2 cm dificultan el enfoque en lentes de teléfonos antiguos de enfoque fijo.
5. **Cortar patrones de las esquinas**: Respete la integridad visual de los tres cuadrados de posicionamiento grandes. De lo contrario, los procesadores gráficos no orientarán la imagen.
6. **Error de corrección insuficiente**: Si añade imágenes o emojis personalizados en el centro del código sin configurar la corrección de errores en nivel Q u H, el QR quedará corrupto.
7. **Bajo brillo ambiental y reflejos**: Evite imprimir sobre materiales metálicos, plastificados excesivamente brillantes o pantallas expuestas al sol directo, ya que causan destellos.
8. **Vínculos dinámicos caídos o rotos**: Pruebe físicamente el escaneo en múltiples marcas de dispositivos móviles antes de autorizar tirajes masivos de publicidad en imprentas.`,
    relatedFAQs: [
      {
        question: "¿Cómo compruebo la seguridad de escaneo antes de imprimir?",
        answer: "Use formato vectorial de alta resolución SVG, mantenga un perfil de alto contraste de color y realice pruebas de muestra física."
      }
    ],
    internalLinks: [
      { label: "Conocer mejores prácticas en nuestra FAQ", url: "/faq" }
    ]
  },
  "how-qr-codes-improve-customer-experience": {
    title: "Cómo los Códigos QR mejoran la Experiencia del Cliente",
    intro: "El éxito de un negocio físico actual reside en retirar fricciones de compra. Conozca cómo agilizar los flujos de autoservicio y los reportes de opinión.",
    contentMarkdown: `## Acelerando el acceso al servicio mediante accesos rápidos en mesa

La comodidad es una ventaja competitiva fundamental en retail y restaurantes. El código QR ahorra tiempo de espera y agiliza las gestiones cotidianas.

### Ejemplos prácticos de experiencia de usuario

* **Manuales de instrucciones interactivos**: Sustituya los folletos de papel gruesos por un código en la caja del artículo que abra instructivos de montaje rápidos.
* **Procesamiento de ingresos hoteleros**: Ofrezca lecturas de reserva en recepción para dar de alta registros de entrada de manera rápida directamente en el teléfono del cliente.
* **Atención y soporte telefónico de inmediato**: Permita iniciar conversaciones de chat directo con asesores de venta en segundos resolviendo inquietudes posventa.
* **Repetición ágil de pedidos de insumos**: Instale códigos fijos en máquinas para facilitar reposiciones inmediatas de consumibles en el almacén del cliente.`,
    relatedFAQs: [
      {
        question: "¿Es posible usar códigos de barras 2D para reseñas en Google?",
        answer: "Sí, pegue su enlace de opinión comercial de Google My Business en nuestro diseñador para animar a sus clientes a valorarle tras el consumo."
      }
    ],
    internalLinks: [
      { label: "Explorar propuestas de diseño", url: "/" }
    ]
  },
  "future-of-qr-code-technology": {
    title: "El Futuro de la Tecnología de Códigos QR",
    intro: "Los códigos bidimensionales evolucionan constantemente hacia la Web3, redes neuronales creativas, realidad aumentada y autenticación segura.",
    contentMarkdown: `## La evolución inteligente del escaneo cotidiano

Los códigos de barras 2D continúan ganando espacio y protagonismo técnico integrándose en experiencias cotidianas digitales seguras.

### Tendencias tecnológicas próximas de los códigos de respuesta rápida

* **Gráficos estéticos con Inteligencia Artificial**: Las herramientas generativas permiten incrustar códigos QR completamente compatibles dentro de ilustraciones y pinturas artísticas de alta fidelidad, unificando marca y función.
* **Integraciones interactivas de Realidad Aumentada (AR)**: Proyecte visualizaciones de modelos y objetos en tres dimensiones sobre su entorno escaneando un código en cajas físicas o revistas.
* **Identidad Web3 e industrializada segura**: Asegure la trazabilidad de la cadena de frío, revise la procedencia y originalidad de bienes de lujo en blockchain y realice ingresos en plataformas web seguras.
* **Estándar Universal GS1 Digital Link**: El sistema mundial de retail planea transiciones de los códigos clásicos UPC a los de formato QR, lo que permitirá a un único código abastecer tanto la caja registradora como las especificaciones del fabricante para el cliente.`,
    relatedFAQs: [
      {
        question: "¿El diseño clásico va a cambiar radicalmente?",
        answer: "El motor Reed-Solomon y las bibliotecas gráficas nativas seguirán siendo plenamente funcionales. La diferencia radicará en estilos integrados creativos y mayor interactividad conectada."
      }
    ],
    internalLinks: [
      { label: "Crear un código QR de alta resolución", url: "/" }
    ]
  }
};

export function getLocalizedBlog(locale: Locale): BlogArticle[] {
  if (locale === 'en') return blogArticles;
  return blogArticles.map(art => {
    const translation = blogTranslationsEs[art.slug];
    if (translation) {
      return {
        ...art,
        title: translation.title,
        intro: translation.intro,
        contentMarkdown: translation.contentMarkdown,
        relatedFAQs: translation.relatedFAQs,
        internalLinks: translation.internalLinks
      };
    }
    return art;
  });
}

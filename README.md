Mi Asistente - Aplicación de Recordatorios para el Día a Día
Descripción
Mi Asistente es una aplicación web moderna diseñada para ayudar a los usuarios a gestionar sus tareas diarias, recordatorios de medicamentos, comidas y actividades importantes a través de una interfaz intuitiva y asistencia por voz. La aplicación está especialmente diseñada para ser accesible y fácil de usar para personas mayores o con dificultades tecnológicas.

Características Principales
Asistente por Voz: Interactúa con la aplicación mediante comandos de voz para crear, gestionar y recibir recordatorios.
Gestión de Tareas: Crea, edita y elimina tareas con fechas y horas específicas.
Recordatorios Personalizados: Configura recordatorios para medicamentos, comidas y actividades importantes.
Perfil Personalizable: Adapta la aplicación a tus necesidades y preferencias.
Interfaz Bilingüe: Disponible en español por defecto, con soporte para múltiples idiomas.
Modo Oscuro/Claro: Cambia entre temas de visualización según tus preferencias.
Asistente IA Configurable: Personaliza el comportamiento del asistente según tus necesidades.
Procesamiento de Documentos: Capacidad para procesar y extraer información de documentos médicos y recetas.
Tecnologías Utilizadas
Frontend: React, TypeScript, Tailwind CSS, Radix UI
Backend: Node.js, Express
IA: Integración con OpenAI, Google Gemini y Anthropic Claude
Base de Datos: PostgreSQL (Neon Database)
Herramientas Adicionales: React Query, Zod para validación, APIs de reconocimiento de voz
Requisitos Previos
Node.js (versión 18 o superior)
npm (incluido con Node.js)
Claves API para servicios de IA (opcional, sólo si se desea utilizar las funciones de IA)
Instalación
Clonar el repositorio
git clone <url-del-repositorio>
cd mi-asistente
Instalar dependencias
npm install
Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto con las siguientes variables:

# Claves API (opcionales para funcionalidades de IA)
OPENAI_API_KEY=tu_clave_api_de_openai
GEMINI_API_KEY=tu_clave_api_de_gemini
ANTHROPIC_API_KEY=tu_clave_api_de_anthropic
 
# Configuración de la base de datos (si se utiliza)
DATABASE_URL=tu_url_de_conexion_a_la_base_de_datos
Ejecución en Desarrollo
Para iniciar la aplicación en modo desarrollo:

npm run dev
Esto iniciará:

El servidor backend en el puerto 5000
El servidor de desarrollo frontend de Vite
Navega a http://localhost:5000 para ver la aplicación.

Ejecución en Producción
Para desplegar la aplicación en producción:

Compilar la aplicación
npm run build
Iniciar el servidor
npm start
La aplicación estará disponible en el puerto 5000.

Estructura del Proyecto
├── client/              # Código frontend
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilidades y servicios
│   │   ├── pages/       # Páginas principales
│   │   └── App.tsx      # Componente principal
├── server/              # Código backend
│   ├── routes/          # Rutas API
│   ├── ai-service.ts    # Servicios de IA
│   ├── document-service.ts # Procesamiento de documentos
│   └── index.ts         # Punto de entrada del servidor
└── shared/              # Código compartido entre cliente y servidor
    └── schema.ts        # Esquemas de validación
Uso de la Aplicación
Pantalla de Inicio
La pantalla principal muestra un resumen de tus próximas tareas y recordatorios, así como acceso rápido al asistente de voz.

Gestión de Tareas
En la sección "Tareas", puedes:

Crear nuevas tareas con título, descripción, fecha y hora
Editar tareas existentes
Marcar tareas como completadas
Eliminar tareas
Asistente por Voz
Puedes interactuar con el asistente utilizando comandos como:

"Crear recordatorio para tomar medicina a las 3 de la tarde"
"Mostrar mis tareas de hoy"
"Recordarme comer a las 12 del mediodía"
Configuración del Asistente
En la sección "Config", puedes personalizar:

El modelo de IA a utilizar
El comportamiento y personalidad del asistente
Las instrucciones específicas para el asistente
Contribución
Si deseas contribuir al proyecto, por favor:

Haz un fork del repositorio
Crea una rama para tu funcionalidad (git checkout -b feature/nueva-funcionalidad)
Haz commit de tus cambios (git commit -m 'Añadir nueva funcionalidad')
Envía un Pull Request
Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

Contacto
Para preguntas o soporte, por favor contacta al equipo de desarrollo en [correo@ejemplo.com].

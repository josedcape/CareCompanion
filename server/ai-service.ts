import OpenAI from 'openai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIResponse {
  text: string;
  success: boolean;
  source: 'openai' | 'fallback';
}

interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Servicio de inteligencia artificial para mejorar la interacción por voz
 */
export class AIService {
  /**
   * Analiza un texto para extraer información relevante sobre una tarea
   */
  async enhanceTaskUnderstanding(transcript: string): Promise<AIResponse> {
    try {
      // Solo usar el servicio si tenemos la clave API
      if (!process.env.OPENAI_API_KEY) {
        return this.getFallbackResponse(transcript);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: 
              "Eres un asistente especializado en entender instrucciones para crear recordatorios. " +
              "Tu trabajo es extraer: título de la tarea, hora, fecha, categoría (medicina, comida, o general), " +
              "y frecuencia (una vez, diario, semanal, mensual) del texto proporcionado por un usuario mayor. " +
              "Responde solo en formato JSON sin explicaciones adicionales."
          },
          {
            role: "user",
            content: transcript
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      return {
        text: response.choices[0].message.content || '',
        success: true,
        source: 'openai'
      };
    } catch (error) {
      console.error("Error al procesar con IA:", error);
      return this.getFallbackResponse(transcript);
    }
  }

  /**
   * Genera una respuesta natural para el usuario
   */
  async generateNaturalResponse(context: string): Promise<AIResponse> {
    try {
      // Solo usar el servicio si tenemos la clave API
      if (!process.env.OPENAI_API_KEY) {
        return {
          text: "Entendido. He creado tu recordatorio.",
          success: true,
          source: 'fallback'
        };
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: 
              "Eres un asistente amable y respetuoso que habla con personas mayores. " +
              "Responde de manera clara, sencilla y con calidez. " +
              "Tus respuestas deben ser breves (máximo 2 frases)."
          },
          {
            role: "user",
            content: `Genera una respuesta natural para confirmar que he creado un recordatorio con estos detalles: ${context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return {
        text: response.choices[0].message.content || '',
        success: true,
        source: 'openai'
      };
    } catch (error) {
      console.error("Error al generar respuesta natural:", error);
      return {
        text: "Entendido. He creado tu recordatorio.",
        success: true,
        source: 'fallback'
      };
    }
  }

  /**
   * Genera una respuesta utilizando documentos de contexto
   * @param query La consulta o pregunta del usuario
   * @param context El contexto adicional (instrucciones, documentos)
   * @param options Opciones de configuración para la generación
   */
  async generateWithContext(
    query: string, 
    context: string, 
    options: AIOptions = {}
  ): Promise<AIResponse> {
    try {
      // Solo usar el servicio si tenemos la clave API
      if (!process.env.OPENAI_API_KEY) {
        return {
          text: "No puedo responder a esa pregunta sin acceso a la IA.",
          success: false,
          source: 'fallback'
        };
      }

      // Configurar opciones por defecto
      const model = options.model || "gpt-3.5-turbo";
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 500;

      // Crear el prompt para la IA
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: 
              "Eres un asistente muy útil y amable para personas mayores. " +
              "Responde de manera clara, sencilla y con calidez. " +
              "Utiliza la información proporcionada en el contexto para dar respuestas más precisas y útiles. " +
              "Si la información no está en el contexto proporcionado, indica esto con claridad y responde lo mejor que puedas." +
              "\n\nContexto:\n" + context
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature,
        max_tokens: maxTokens
      });

      return {
        text: response.choices[0].message.content || '',
        success: true,
        source: 'openai'
      };
    } catch (error) {
      console.error("Error al generar respuesta con contexto:", error);
      return {
        text: "Lo siento, no puedo responder a esa pregunta en este momento.",
        success: false,
        source: 'fallback'
      };
    }
  }

  /**
   * Respuesta alternativa sin usar IA
   */
  private getFallbackResponse(transcript: string): AIResponse {
    return {
      text: transcript,
      success: false,
      source: 'fallback'
    };
  }
}

// Exportar una instancia del servicio
export const aiService = new AIService();
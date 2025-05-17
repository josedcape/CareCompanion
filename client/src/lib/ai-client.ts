import { apiRequest } from "@/lib/queryClient";

interface AIAnalysisResponse {
  text: string;
  success: boolean;
  source: 'openai' | 'fallback';
}

/**
 * Analiza un texto utilizando el servicio de IA para extraer información sobre tareas
 */
export async function analyzeText(text: string): Promise<AIAnalysisResponse> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze", { text });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en la llamada al servicio de IA:", error);
    return {
      text: text,
      success: false,
      source: 'fallback'
    };
  }
}

/**
 * Genera una respuesta natural basada en un contexto utilizando IA
 */
export async function generateResponse(context: string): Promise<AIAnalysisResponse> {
  try {
    const response = await apiRequest("POST", "/api/ai/respond", { context });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generando respuesta natural:", error);
    return {
      text: "Entendido. He creado tu recordatorio.",
      success: false,
      source: 'fallback'
    };
  }
}
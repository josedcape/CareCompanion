import { Request, Response } from "express";
import { aiService } from "../ai-service";

/**
 * Procesa un texto utilizando IA para extraer información relevante sobre tareas
 */
export async function analyzeText(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: "Se requiere un texto para analizar"
      });
    }
    
    const result = await aiService.enhanceTaskUnderstanding(text);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en el endpoint de análisis:", error);
    return res.status(500).json({
      error: "Error al procesar la solicitud",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Genera una respuesta natural basada en el contexto proporcionado
 */
export async function generateResponse(req: Request, res: Response) {
  try {
    const { context } = req.body;
    
    if (!context || typeof context !== 'string') {
      return res.status(400).json({
        error: "Se requiere un contexto para generar una respuesta"
      });
    }
    
    const result = await aiService.generateNaturalResponse(context);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en el endpoint de respuesta:", error);
    return res.status(500).json({
      error: "Error al procesar la solicitud",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
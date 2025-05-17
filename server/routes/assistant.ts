import { Request, Response } from "express";
import { db } from "../db";
import { assistantConfig, insertConfigSchema, assistantDocuments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { aiService } from "../ai-service";

/**
 * Obtiene la configuración actual del asistente
 */
export async function getAssistantConfig(req: Request, res: Response) {
  try {
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    // Buscar configuración existente
    let [config] = await db.select().from(assistantConfig)
      .where(eq(assistantConfig.userId, userId));
    
    // Si no existe, crear una configuración por defecto
    if (!config) {
      [config] = await db.insert(assistantConfig).values({
        name: "Asistente principal",
        instructions: "Eres un asistente amable y respetuoso que ayuda a personas mayores a recordar sus tareas y actividades.",
        model: "gpt-3.5-turbo",
        temperature: "0.7",
        maxTokens: 500,
        activeDocuments: [],
        userId
      }).returning();
    }
    
    return res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener configuración del asistente:", error);
    return res.status(500).json({
      error: "Error al obtener la configuración del asistente",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Actualiza la configuración del asistente
 */
export async function updateAssistantConfig(req: Request, res: Response) {
  try {
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    // Validar datos de entrada
    const configData = insertConfigSchema.parse({
      ...req.body,
      userId
    });
    
    // Verificar si ya existe una configuración
    const [existingConfig] = await db.select({ id: assistantConfig.id })
      .from(assistantConfig)
      .where(eq(assistantConfig.userId, userId));
    
    let config;
    
    if (existingConfig) {
      // Actualizar configuración existente
      [config] = await db.update(assistantConfig)
        .set({
          ...configData,
          updatedAt: new Date()
        })
        .where(eq(assistantConfig.id, existingConfig.id))
        .returning();
    } else {
      // Crear nueva configuración
      [config] = await db.insert(assistantConfig)
        .values(configData)
        .returning();
    }
    
    return res.status(200).json(config);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({
        error: "Datos de configuración inválidos",
        details: validationError.message
      });
    }
    
    console.error("Error al actualizar configuración del asistente:", error);
    return res.status(500).json({
      error: "Error al actualizar la configuración del asistente",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Prueba el asistente con una consulta de prueba
 */
export async function testAssistant(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: "Se requiere una consulta para probar el asistente"
      });
    }
    
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    // Obtener configuración del asistente
    const [config] = await db.select().from(assistantConfig)
      .where(eq(assistantConfig.userId, userId));
    
    if (!config) {
      return res.status(404).json({
        error: "No se encontró configuración del asistente"
      });
    }
    
    // Obtener documentos activos
    let contextDocs = [];
    
    if (config.activeDocuments && config.activeDocuments.length > 0) {
      const activeDocIds = config.activeDocuments as number[];
      
      contextDocs = await db.select({
        id: assistantDocuments.id,
        name: assistantDocuments.name,
        content: assistantDocuments.content
      }).from(assistantDocuments)
        .where(eq(assistantDocuments.userId, userId))
        .where(assistantDocuments.id.in(activeDocIds));
    }
    
    // Crear contexto para la consulta
    let context = config.instructions || "";
    
    // Añadir contenido de documentos al contexto
    if (contextDocs.length > 0) {
      context += "\n\nDatos proporcionados para referencia:\n\n";
      
      contextDocs.forEach(doc => {
        if (doc.content) {
          context += `--- Documento: ${doc.name} ---\n${doc.content}\n\n`;
        }
      });
    }
    
    // Realizar consulta al asistente de IA
    const response = await aiService.generateWithContext(query, context, {
      model: config.model,
      temperature: parseFloat(config.temperature),
      maxTokens: config.maxTokens
    });
    
    // Actualizar timestamp de uso de documentos
    if (contextDocs.length > 0) {
      const docIds = contextDocs.map(doc => doc.id);
      await db.update(assistantDocuments)
        .set({ lastUsed: new Date() })
        .where(assistantDocuments.id.in(docIds));
    }
    
    return res.status(200).json({
      response: response.text,
      success: response.success,
      source: response.source
    });
  } catch (error) {
    console.error("Error al probar el asistente:", error);
    return res.status(500).json({
      error: "Error al probar el asistente",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
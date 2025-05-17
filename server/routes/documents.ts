import { Request, Response } from "express";
import multer from "multer";
import { documentService } from "../document-service";
import { db } from "../db";
import { assistantDocuments, DOCUMENT_TYPES, insertDocumentSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Configuración de multer para manejar la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Máximo 100MB
  },
});

const singleFileUpload = upload.single('file');

/**
 * Sube un nuevo documento para usar como contexto en el asistente
 */
export async function uploadDocument(req: Request, res: Response) {
  try {
    // Middleware para procesar la carga del archivo
    singleFileUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: "Error al cargar el archivo",
          details: err.message
        });
      }

      // Verificar que el archivo se haya cargado
      if (!req.file) {
        return res.status(400).json({
          error: "No se ha proporcionado ningún archivo"
        });
      }

      const { name, description } = req.body;
      const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
      
      // Obtener tipo de archivo de la extensión
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
      let fileType: string;
      
      // Validar tipo de archivo
      switch (fileExtension) {
        case 'pdf':
          fileType = DOCUMENT_TYPES.PDF;
          break;
        case 'docx':
          fileType = DOCUMENT_TYPES.DOCX;
          break;
        case 'txt':
          fileType = DOCUMENT_TYPES.TXT;
          break;
        default:
          return res.status(400).json({
            error: "Tipo de archivo no soportado",
            details: "Solo se permiten archivos PDF, DOCX y TXT"
          });
      }

      try {
        // Guardar el archivo en el sistema
        const filePath = await documentService.saveFile(req.file, userId);
        
        // Obtener tamaño del archivo
        const fileSize = req.file.size;
        
        // Extraer texto del documento
        const content = await documentService.extractTextFromDocument(filePath, fileType);
        
        // Crear registro en la base de datos
        const [document] = await db.insert(assistantDocuments).values({
          name: name || req.file.originalname,
          description: description || null,
          filePath,
          fileType,
          fileSize,
          content,
          userId
        }).returning();
        
        return res.status(201).json({
          id: document.id,
          name: document.name,
          description: document.description,
          fileType: document.fileType,
          fileSize: document.fileSize,
          createdAt: document.createdAt
        });
      } catch (error) {
        console.error("Error procesando documento:", error);
        return res.status(500).json({
          error: "Error al procesar el documento",
          details: error.message
        });
      }
    });
  } catch (error) {
    console.error("Error en uploadDocument:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
}

/**
 * Obtiene la lista de documentos del usuario
 */
export async function getDocuments(req: Request, res: Response) {
  try {
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    const documents = await db.select({
      id: assistantDocuments.id,
      name: assistantDocuments.name,
      description: assistantDocuments.description,
      fileType: assistantDocuments.fileType,
      fileSize: assistantDocuments.fileSize,
      createdAt: assistantDocuments.createdAt,
      lastUsed: assistantDocuments.lastUsed
    }).from(assistantDocuments)
      .where(eq(assistantDocuments.userId, userId))
      .orderBy(assistantDocuments.createdAt);
    
    return res.status(200).json(documents);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return res.status(500).json({
      error: "Error al obtener los documentos",
      details: error.message
    });
  }
}

/**
 * Obtiene un documento específico
 */
export async function getDocument(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de documento inválido" });
    }
    
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    const [document] = await db.select().from(assistantDocuments)
      .where(eq(assistantDocuments.id, id))
      .where(eq(assistantDocuments.userId, userId));
    
    if (!document) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    
    return res.status(200).json({
      id: document.id,
      name: document.name,
      description: document.description,
      fileType: document.fileType,
      fileSize: document.fileSize,
      createdAt: document.createdAt,
      lastUsed: document.lastUsed
    });
  } catch (error) {
    console.error("Error al obtener documento:", error);
    return res.status(500).json({
      error: "Error al obtener el documento",
      details: error.message
    });
  }
}

/**
 * Elimina un documento
 */
export async function deleteDocument(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de documento inválido" });
    }
    
    const userId = 1; // Por ahora, usamos un ID fijo; después implementar autenticación
    
    // Obtener información del documento antes de eliminarlo
    const [document] = await db.select().from(assistantDocuments)
      .where(eq(assistantDocuments.id, id))
      .where(eq(assistantDocuments.userId, userId));
    
    if (!document) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    
    // Eliminar el archivo físico
    await documentService.deleteFile(document.filePath);
    
    // Eliminar el registro de la base de datos
    await db.delete(assistantDocuments)
      .where(eq(assistantDocuments.id, id))
      .where(eq(assistantDocuments.userId, userId));
    
    return res.status(200).json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return res.status(500).json({
      error: "Error al eliminar el documento",
      details: error.message
    });
  }
}
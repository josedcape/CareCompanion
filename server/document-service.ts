import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

// Directorio para almacenar los documentos cargados
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Asegurar que el directorio de carga existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Servicio para gestionar documentos de contexto para el asistente
 */
export class DocumentService {
  /**
   * Guarda un archivo cargado en el sistema
   */
  async saveFile(file: Express.Multer.File, userId: number): Promise<string> {
    const timestamp = Date.now();
    const uniqueFilename = `${userId}_${timestamp}_${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    
    // Crear stream de escritura
    const writeStream = fs.createWriteStream(filePath);
    
    return new Promise((resolve, reject) => {
      // Escribir el archivo al sistema
      writeStream.write(file.buffer);
      writeStream.end();
      
      writeStream.on('finish', () => {
        resolve(uniqueFilename);
      });
      
      writeStream.on('error', (err) => {
        reject(new Error(`Error al guardar el archivo: ${err.message}`));
      });
    });
  }
  
  /**
   * Extrae el contenido textual de un documento
   */
  async extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }
    
    // Leer el archivo según su tipo
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return this.extractTextFromPdf(fullPath);
      case 'docx':
        return this.extractTextFromDocx(fullPath);
      case 'txt':
        return this.extractTextFromTxt(fullPath);
      default:
        throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }
  }
  
  /**
   * Extrae texto de un archivo PDF
   */
  private async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error extrayendo texto de PDF:', error);
      throw new Error(`Error al procesar archivo PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extrae texto de un archivo DOCX
   */
  private async extractTextFromDocx(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extrayendo texto de DOCX:', error);
      throw new Error(`Error al procesar archivo DOCX: ${error.message}`);
    }
  }
  
  /**
   * Lee texto de un archivo TXT
   */
  private async extractTextFromTxt(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error leyendo archivo TXT:', error);
      throw new Error(`Error al leer archivo TXT: ${error.message}`);
    }
  }
  
  /**
   * Elimina un archivo del sistema
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  
  /**
   * Verifica si un archivo existe
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(path.join(UPLOAD_DIR, filePath));
  }
  
  /**
   * Obtiene el tamaño de un archivo en bytes
   */
  getFileSize(filePath: string): number {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }
    
    const stats = fs.statSync(fullPath);
    return stats.size;
  }
}

// Exportar una instancia del servicio
export const documentService = new DocumentService();
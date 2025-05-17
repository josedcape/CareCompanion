import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  time: text("time").notNull(),
  date: text("date").notNull(),
  frequency: text("frequency").notNull().default("once"),
  category: text("category").notNull(),
  userId: integer("user_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  time: z.string(),
  date: z.string(),
  frequency: z.string(),
  category: z.string(),
  userId: z.number(),
  completed: z.boolean(),
  createdAt: z.string(),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task categories
export const TASK_CATEGORIES = {
  MEDICINE: "medicine",
  MEAL: "meal",
  GENERAL: "general"
} as const;

export type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

// Task frequencies
export const TASK_FREQUENCIES = {
  ONCE: "once",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly"
} as const;

export type TaskFrequency = typeof TASK_FREQUENCIES[keyof typeof TASK_FREQUENCIES];

// Tabla de documentos de contexto para el asistente
export const assistantDocuments = pgTable("assistant_documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(), // pdf, docx, txt
  fileSize: integer("file_size").notNull(), // en bytes
  content: text("content"), // Contenido extraído del documento
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used")
});

export const insertDocumentSchema = createInsertSchema(assistantDocuments).omit({
  id: true,
  createdAt: true,
  lastUsed: true
});

export const documentSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  filePath: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  content: z.string().optional(),
  userId: z.number(),
  createdAt: z.string(),
  lastUsed: z.string().optional()
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type AssistantDocument = typeof assistantDocuments.$inferSelect;

// Tabla de configuración del asistente
export const assistantConfig = pgTable("assistant_config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Asistente principal"),
  instructions: text("instructions"),
  model: text("model").default("gpt-3.5-turbo").notNull(),
  temperature: text("temperature").default("0.7").notNull(),
  maxTokens: integer("max_tokens").default(500).notNull(),
  activeDocuments: jsonb("active_documents").$type<number[]>(), // IDs de documentos activos
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertConfigSchema = createInsertSchema(assistantConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const configSchema = z.object({
  id: z.number(),
  name: z.string(),
  instructions: z.string().optional(),
  model: z.string(),
  temperature: z.string(),
  maxTokens: z.number(),
  activeDocuments: z.array(z.number()).optional(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type AssistantConfig = typeof assistantConfig.$inferSelect;

// Constantes para tipos de documentos
export const DOCUMENT_TYPES = {
  PDF: "pdf",
  DOCX: "docx",
  TXT: "txt"
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Constantes para modelos de IA
export const AI_MODELS = {
  GPT_3_5: "gpt-3.5-turbo",
  GPT_4: "gpt-4",
  GPT_4O: "gpt-4o"
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

import { users, type User, type InsertUser, type Task, type InsertTask, tasks } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, asc, or, gt } from "drizzle-orm";

// Interface for storage implementation
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task related methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getUpcomingTasks(userId: number): Promise<Task[]>;
}

// Database implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async getTasks(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task> {
    const result = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteTask(id: number): Promise<void> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    
    if (result.length === 0) {
      throw new Error(`Task with id ${id} not found`);
    }
  }
  
  async getUpcomingTasks(userId: number): Promise<Task[]> {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, false),
          and(
            gte(tasks.date, currentDate),
            or(
              // If the date is greater, include it
              // If the date is the same, only include if time is greater or equal
              gt(tasks.date, currentDate),
              and(
                eq(tasks.date, currentDate),
                gte(tasks.time, currentTime)
              )
            )
          )
        )
      )
      .orderBy(
        asc(tasks.date),
        asc(tasks.time)
      );
  }
}

// Create and export a default instance with sample data
export const storage = new DatabaseStorage();

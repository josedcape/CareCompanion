import { users, type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userIdCounter: number;
  private taskIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    
    // Add some default tasks for demonstration
    const currentDate = new Date().toISOString().split('T')[0];
    
    this.createTask({
      title: "Tomar pastilla para la presión",
      time: "09:00",
      date: currentDate,
      frequency: "daily",
      category: "medicine",
      userId: 1,
      completed: false
    });
    
    this.createTask({
      title: "Hora de almuerzo",
      time: "12:30",
      date: currentDate,
      frequency: "daily",
      category: "meal",
      userId: 1,
      completed: false
    });
    
    this.createTask({
      title: "Llamar a María",
      time: "16:00",
      date: currentDate,
      frequency: "once",
      category: "general",
      userId: 1,
      completed: false
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: now.toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    if (!this.tasks.has(id)) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    this.tasks.delete(id);
  }
  
  async getUpcomingTasks(userId: number): Promise<Task[]> {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    return Array.from(this.tasks.values())
      .filter(task => {
        // Filter by user
        if (task.userId !== userId) return false;
        
        // Filter incomplete tasks
        if (task.completed) return false;
        
        // Filter by date and time
        if (task.date < currentDate) return false;
        if (task.date === currentDate && task.time < currentTime) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date first
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        
        // Then by time
        return a.time.localeCompare(b.time);
      });
  }
}

export const storage = new MemStorage();

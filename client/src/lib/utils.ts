import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { Task, TASK_CATEGORIES } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  
  if (isToday(date)) {
    return "Hoy";
  } else if (isTomorrow(date)) {
    return "Mañana";
  }
  
  return format(date, "d 'de' MMMM", { locale: es });
}

export function formatTime(timeStr: string): string {
  // Convert 24h format to 12h format
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const formattedHour = hour % 12 || 12;
  
  return `${formattedHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)}, ${formatTime(time)}`;
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case TASK_CATEGORIES.MEDICINE:
      return "medication";
    case TASK_CATEGORIES.MEAL:
      return "restaurant";
    case TASK_CATEGORIES.GENERAL:
    default:
      return "event";
  }
}

export function getCategoryColor(category: string) {
  switch (category) {
    case TASK_CATEGORIES.MEDICINE:
      return "text-primary bg-blue-100";
    case TASK_CATEGORIES.MEAL:
      return "text-success bg-green-100";
    case TASK_CATEGORIES.GENERAL:
    default:
      return "text-secondary bg-orange-100";
  }
}

export function getRandomId() {
  return Math.random().toString(36).substring(2, 9);
}

// Parse a task description from speech recognition
export function parseTaskFromSpeech(transcript: string): Partial<Task> | null {
  try {
    // Basic intent detection
    const lowerTranscript = transcript.toLowerCase();
    
    // Check if this is a reminder request
    if (!lowerTranscript.includes('recordar') && 
        !lowerTranscript.includes('recordatorio') && 
        !lowerTranscript.includes('recuérdame')) {
      return null;
    }
    
    // Try to extract time
    let time = '';
    const timeRegex = /(\d{1,2})[:\s]?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i;
    const timeMatch = lowerTranscript.match(timeRegex);
    
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] || '00';
      let formattedHour = hour;
      
      // Convert to 24-hour format if PM
      if (timeMatch[3] && (
          timeMatch[3].toLowerCase() === 'pm' || 
          timeMatch[3].toLowerCase() === 'p.m.')) {
        formattedHour = hour < 12 ? hour + 12 : hour;
      }
      
      // Format time as HH:MM
      time = `${formattedHour.toString().padStart(2, '0')}:${minute}`;
    }
    
    // Default to current date
    const today = new Date();
    let date = format(today, 'yyyy-MM-dd');
    
    // Check for specific days
    if (lowerTranscript.includes('mañana')) {
      date = format(addDays(today, 1), 'yyyy-MM-dd');
    }
    
    // Try to determine category
    let category = TASK_CATEGORIES.GENERAL;
    
    if (lowerTranscript.includes('medicin') || 
        lowerTranscript.includes('pastilla') || 
        lowerTranscript.includes('píldora') ||
        lowerTranscript.includes('medicamento')) {
      category = TASK_CATEGORIES.MEDICINE;
    } else if (lowerTranscript.includes('comer') || 
               lowerTranscript.includes('comida') || 
               lowerTranscript.includes('almuerzo') ||
               lowerTranscript.includes('desayuno') ||
               lowerTranscript.includes('cena') ||
               lowerTranscript.includes('merienda')) {
      category = TASK_CATEGORIES.MEAL;
    }
    
    // Extract title - take everything after "recordar" or similar words
    let title = '';
    const titleMarkers = ['recordar', 'recordarme', 'recuérdame', 'recordatorio para'];
    
    for (const marker of titleMarkers) {
      if (lowerTranscript.includes(marker)) {
        const parts = transcript.split(new RegExp(`${marker}\\s+`, 'i'));
        if (parts.length > 1) {
          title = parts[1].trim();
          // Clean up the title by removing time information if present
          title = title.replace(timeRegex, '').trim();
          break;
        }
      }
    }
    
    // If we couldn't extract a title, use a default one based on category
    if (!title) {
      if (category === TASK_CATEGORIES.MEDICINE) {
        title = 'Tomar medicina';
      } else if (category === TASK_CATEGORIES.MEAL) {
        title = 'Hora de comer';
      } else {
        title = 'Nuevo recordatorio';
      }
    }
    
    return {
      title,
      time,
      date,
      category,
      frequency: 'once',
    };
  } catch (error) {
    console.error('Error parsing speech:', error);
    return null;
  }
}

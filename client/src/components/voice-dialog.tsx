import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { insertTaskSchema, TASK_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { CategoryIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface VoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type AssistantState = "listening" | "processing" | "confirming" | "success" | "error";

const VoiceDialog: React.FC<VoiceDialogProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assistantState, setAssistantState] = useState<AssistantState>("listening");
  const [pendingText, setPendingText] = useState<string>("");
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    parsedTask
  } = useSpeechRecognition();
  
  const { speak, isSpeaking } = useTextToSpeech();

  // Generate visualizer bars
  const [visualizerBars] = useState(() => 
    Array.from({ length: 16 }).map(() => Math.random() * 60 + 20)
  );

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setAssistantState("listening");
      setPendingText("");
      
      // Start with a welcome message after a slight delay for better UX
      const timer = setTimeout(() => {
        speak("¿Qué necesitas recordar y cuándo?");
        startListening();
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [isOpen, startListening, stopListening, resetTranscript, speak]);

  // Effect to update state based on transcript and parsing
  useEffect(() => {
    if (parsedTask && transcript && assistantState === "listening") {
      setPendingText(transcript);
      // A slight delay to show transitions
      const timer = setTimeout(() => {
        setAssistantState("confirming");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [parsedTask, transcript, assistantState]);

  const handleCancel = () => {
    speak("Operación cancelada. ¿En qué más puedo ayudarte?");
    stopListening();
    
    // Short delay before closing
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleConfirm = async () => {
    if (!parsedTask || !parsedTask.title || !parsedTask.time || !parsedTask.date) {
      setAssistantState("error");
      speak("No he podido entender completamente. Por favor, intenta nuevamente.");
      toast({
        title: "Información incompleta",
        description: "No se pudo crear el recordatorio con la información proporcionada.",
        variant: "destructive"
      });
      
      // Reset after delay
      setTimeout(() => {
        setAssistantState("listening");
        resetTranscript();
        startListening();
      }, 3000);
      
      return;
    }

    try {
      setAssistantState("processing");
      
      // Default values for userId and completed
      const taskData = {
        ...parsedTask,
        userId: 1,
        completed: false
      };

      // Validate the data
      insertTaskSchema.parse(taskData);

      // Create the task
      const response = await apiRequest("POST", "/api/tasks", taskData);
      await response.json();

      // Show success state
      setAssistantState("success");
      
      // Success message
      speak(`He creado un recordatorio para ${parsedTask.title} a las ${parsedTask.time.replace(':', ' y ')}.`);
      
      toast({
        title: "Recordatorio creado",
        description: "Tu recordatorio ha sido creado exitosamente."
      });
      
      // Invalidate tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Close after delay to show success state
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setAssistantState("error");
      
      if (error instanceof z.ZodError) {
        speak("No he podido crear el recordatorio. Falta información importante.");
      } else {
        speak("Ha ocurrido un error al crear el recordatorio. Por favor intenta nuevamente.");
      }
      
      toast({
        title: "Error",
        description: "No se pudo crear el recordatorio.",
        variant: "destructive"
      });
      
      // Reset after delay
      setTimeout(() => {
        setAssistantState("listening");
        resetTranscript();
        startListening();
      }, 3000);
    }
  };

  // Retry handler
  const handleRetry = () => {
    resetTranscript();
    setAssistantState("listening");
    speak("Intentémoslo de nuevo. ¿Qué necesitas recordar?");
    startListening();
  };

  // Determine which visualization to show based on state
  const renderAssistantVisualization = () => {
    switch (assistantState) {
      case "listening":
        return (
          <div className="relative">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping opacity-60"></div>
            
            {/* Voice visualizer */}
            <div className="absolute inset-[-10px] flex items-center justify-center">
              {visualizerBars.map((height, i) => (
                <div 
                  key={i}
                  className="w-1 mx-[2px] bg-primary rounded-full opacity-70"
                  style={{ 
                    height: `${isListening ? Math.random() * 40 + 10 : 5}px`,
                    animationDelay: `${i * 0.05}s`,
                    transition: "height 0.2s ease",
                  }}
                />
              ))}
            </div>
            
            {/* Main circle */}
            <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center glow-effect z-10">
              <Icon name="mic" className="text-primary text-4xl pulse-animation" />
            </div>
          </div>
        );
      
      case "processing":
        return (
          <div className="relative w-32 h-32">
            {/* Spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-accent/10 border-t-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Processing icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="memory" className="text-primary text-4xl" />
            </div>
          </div>
        );
        
      case "confirming":
        return (
          <div className="relative">
            {/* Task category visualization */}
            <div className="relative w-32 h-32 bg-card/80 rounded-full border-2 border-primary/30 flex items-center justify-center overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
              
              <CategoryIcon 
                category={parsedTask?.category || TASK_CATEGORIES.GENERAL} 
                size="lg" 
                withBackground 
                className="float-animation"
              />
            </div>
          </div>
        );
        
      case "success":
        return (
          <div className="relative w-32 h-32">
            {/* Success animation */}
            <div className="absolute inset-0 bg-success/20 rounded-full flex items-center justify-center animate-pulse"></div>
            <div className="absolute inset-4 rounded-full border-2 border-success animate-ping opacity-50"></div>
            
            {/* Check icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="check_circle" className="text-success text-5xl animate-bounce" />
            </div>
          </div>
        );
        
      case "error":
        return (
          <div className="relative w-32 h-32">
            {/* Error animation */}
            <div className="absolute inset-0 bg-destructive/20 rounded-full flex items-center justify-center"></div>
            <div className="absolute inset-4 rounded-full border-2 border-destructive pulse-animation"></div>
            
            {/* Error icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="error" className="text-destructive text-5xl" />
            </div>
          </div>
        );
    }
  };

  // Determine dialog title and message
  const getDialogContent = () => {
    switch (assistantState) {
      case "listening":
        return {
          title: "Escuchando...",
          message: transcript || "Estoy escuchando. Puedes decirme qué recordatorio crear."
        };
      case "processing":
        return {
          title: "Procesando...",
          message: "Estoy creando tu recordatorio, por favor espera."
        };
      case "confirming":
        return {
          title: "¿Confirmar recordatorio?",
          message: parsedTask ? `${parsedTask.title} - ${parsedTask.time.replace(':', ':')}` : pendingText
        };
      case "success":
        return {
          title: "¡Recordatorio creado!",
          message: "Tu recordatorio ha sido guardado correctamente."
        };
      case "error":
        return {
          title: "No pude entender",
          message: "No logré entender completamente. ¿Quieres intentarlo de nuevo?"
        };
    }
  };

  const content = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-2xl border-0 p-0 w-full max-w-md mx-auto text-center overflow-hidden shadow-2xl">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-accent/5 z-0"></div>
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-accent/10 to-transparent z-0"></div>
        
        {/* Main content */}
        <div className="relative z-10 p-6">
          <div className="mb-8 pt-2">
            {/* Assistant visualization */}
            <div className="flex justify-center mb-6">
              {renderAssistantVisualization()}
            </div>
            
            {/* Title and message */}
            <h2 className={cn(
              "text-xl font-bold mb-3 transition-all duration-500",
              assistantState === "success" ? "text-success" : 
              assistantState === "error" ? "text-destructive" : 
              "text-card-foreground"
            )}>
              {content.title}
            </h2>
            
            <div className="min-h-16 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/40 mb-4">
              <p className="text-base text-card-foreground">
                {content.message}
              </p>
            </div>
            
            {/* Parsed task details (show in confirm state) */}
            {assistantState === "confirming" && parsedTask && (
              <div className="text-left bg-background/40 rounded-xl p-3 mb-4 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {parsedTask.time && (
                    <div className="flex items-center">
                      <Icon name="schedule" className="mr-1 text-primary/70 text-sm" />
                      <span>Hora: {parsedTask.time.replace(':', ':')}</span>
                    </div>
                  )}
                  {parsedTask.date && (
                    <div className="flex items-center">
                      <Icon name="today" className="mr-1 text-primary/70 text-sm" />
                      <span>Fecha: {new Date(parsedTask.date).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {parsedTask.category && (
                    <div className="flex items-center">
                      <CategoryIcon category={parsedTask.category} className="mr-1 text-sm" />
                      <span>Categoría: {parsedTask.category === 'medicine' ? 'Medicina' : 
                        parsedTask.category === 'meal' ? 'Comida' : 'General'}</span>
                    </div>
                  )}
                  {parsedTask.frequency && (
                    <div className="flex items-center">
                      <Icon name="repeat" className="mr-1 text-primary/70 text-sm" />
                      <span>Frecuencia: {
                        parsedTask.frequency === 'once' ? 'Una vez' :
                        parsedTask.frequency === 'daily' ? 'Diario' :
                        parsedTask.frequency === 'weekly' ? 'Semanal' : 'Mensual'
                      }</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action buttons based on state */}
          <div className="flex space-x-3">
            {(assistantState === "listening" || assistantState === "error") && (
              <Button 
                variant="outline" 
                className="flex-1 py-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
              >
                <Icon name="close" className="mr-2" />
                Cancelar
              </Button>
            )}
            
            {assistantState === "confirming" && (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 py-3 border-muted-foreground/30 hover:bg-muted/40"
                  onClick={handleRetry}
                >
                  <Icon name="refresh" className="mr-2" />
                  Repetir
                </Button>
                <Button 
                  className="flex-1 py-3 relative overflow-hidden group"
                  onClick={handleConfirm}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex items-center">
                    <Icon name="check" className="mr-2" />
                    <span>Confirmar</span>
                  </div>
                </Button>
              </>
            )}
            
            {assistantState === "processing" && (
              <Button 
                className="flex-1 py-3 opacity-70 cursor-not-allowed"
                disabled
              >
                Procesando...
              </Button>
            )}
            
            {assistantState === "success" && (
              <Button 
                className="flex-1 py-3 bg-success hover:bg-success/90"
                onClick={onClose}
              >
                <Icon name="check" className="mr-2" />
                Entendido
              </Button>
            )}
            
            {assistantState === "error" && (
              <Button 
                className="flex-1 py-3"
                onClick={handleRetry}
              >
                <Icon name="refresh" className="mr-2" />
                Intentar de nuevo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceDialog;

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface VoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceDialog: React.FC<VoiceDialogProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    parsedTask
  } = useSpeechRecognition();
  
  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      // Start with a welcome message
      speak("¿Qué necesitas recordar y cuándo?");
      startListening();
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [isOpen, startListening, stopListening, resetTranscript, speak]);

  const handleCancel = () => {
    stopListening();
    onClose();
  };

  const handleConfirm = async () => {
    if (!parsedTask || !parsedTask.title || !parsedTask.time || !parsedTask.date) {
      speak("No he podido entender completamente. Por favor, intenta nuevamente.");
      toast({
        title: "Información incompleta",
        description: "No se pudo crear el recordatorio con la información proporcionada.",
        variant: "destructive"
      });
      return;
    }

    try {
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
      const data = await response.json();

      // Success message
      speak(`He creado un recordatorio para ${parsedTask.title} a las ${parsedTask.time.replace(':', ' y ')}.`);
      
      toast({
        title: "Recordatorio creado",
        description: "Tu recordatorio ha sido creado exitosamente."
      });
      
      // Invalidate tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      onClose();
    } catch (error) {
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-xl p-6 w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className={`w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 ${isListening ? "pulse-animation" : ""}`}>
            <Icon name="mic" className="text-primary text-4xl" />
          </div>
          <h2 className="text-lg font-bold mb-2">
            {isListening ? "Escuchando..." : "Procesando..."}
          </h2>
          <p className="text-base text-gray-600">
            {transcript || "Dime qué necesitas recordar y cuándo"}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="destructive" 
            className="flex-1 py-3 px-4 rounded-lg font-medium"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium"
            onClick={handleConfirm}
            disabled={!parsedTask}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceDialog;

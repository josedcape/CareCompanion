import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { formatTime } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/icons";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  variant?: "compact" | "full";
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, variant = "full" }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTextToSpeech();
  
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Recordatorio eliminado",
        description: "El recordatorio ha sido eliminado exitosamente."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el recordatorio: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const toggleTaskCompletion = useMutation({
    mutationFn: async (taskToUpdate: Task) => {
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      const response = await apiRequest("PATCH", `/api/tasks/${taskToUpdate.id}`, updatedTask);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });

  const handleDelete = () => {
    deleteTask.mutate(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleToggleComplete = () => {
    toggleTaskCompletion.mutate(task);
  };

  const handleReadAloud = () => {
    speak(`${task.title} a las ${formatTime(task.time)}`);
  };

  if (variant === "compact") {
    return (
      <div className="border-b border-border/40 py-4 hover:bg-card/60 transition-colors duration-300 group rounded-lg px-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="relative mr-3 mt-1">
              <CategoryIcon 
                category={task.category} 
                className="text-lg relative z-10" 
                withBackground
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full filter blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
            </div>
            <div>
              <h3 className="text-md font-bold text-card-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Icon name="schedule" className="text-xs mr-1 opacity-70" />
                {formatTime(task.time)}
              </p>
            </div>
          </div>
          <button 
            onClick={handleReadAloud} 
            className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
          >
            <Icon name="volume_up" className="text-primary/70 group-hover:text-primary transition-colors duration-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-card rounded-xl overflow-hidden group">
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-xl p-0.5">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/40 via-accent/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>
      
      {/* Task content */}
      <div className="relative p-5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full"></div>
        
        <div className="flex items-start mb-4">
          <div className="relative">
            <CategoryIcon 
              category={task.category} 
              size="lg" 
              withBackground 
              className="mr-4 float-animation"
            />
            <div className="absolute inset-0 bg-primary/30 rounded-full filter blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-card-foreground mb-1">{task.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="flex items-center bg-primary/10 rounded-full py-1 px-2 mr-2">
                <Icon name="schedule" className="text-sm mr-1 text-primary/80" />
                <span>{formatTime(task.time)}</span>
              </div>
              <div className="flex items-center bg-accent/10 rounded-full py-1 px-2">
                <Icon name="repeat" className="text-sm mr-1 text-accent/80" />
                <span>
                  {task.frequency === "once" ? "Una vez" : 
                   task.frequency === "daily" ? "Diario" : 
                   task.frequency === "weekly" ? "Semanal" : "Mensual"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex -mr-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10"
              onClick={handleEdit}
            >
              <Icon name="edit" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Icon name="delete" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-border/30">
          <Button 
            variant="ghost" 
            className="text-primary/80 hover:text-primary hover:bg-primary/10 rounded-full"
            onClick={handleReadAloud}
          >
            <div className="relative">
              <Icon name="volume_up" className="mr-1" />
              <span className="absolute inset-0 bg-primary/30 rounded-full filter blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></span>
            </div>
            <span>Leer</span>
          </Button>
          
          <Button 
            variant={task.completed ? "outline" : "default"} 
            size="sm" 
            className={`rounded-full transition-all duration-300 ${
              task.completed 
                ? "bg-success/10 text-success border-success/30 hover:bg-success/20" 
                : "bg-primary hover:bg-primary/90"
            }`}
            onClick={handleToggleComplete}
          >
            <Icon 
              name={task.completed ? "check_circle" : "radio_button_unchecked"} 
              className={`mr-1 ${task.completed ? "text-success" : ""}`} 
            />
            <span>{task.completed ? "Completado" : "Completar"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

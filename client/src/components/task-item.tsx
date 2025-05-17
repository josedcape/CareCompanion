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
      <div className="border-b border-gray-100 py-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <CategoryIcon category={task.category} className="mr-3 mt-1" />
            <div>
              <h3 className="text-md font-bold">{task.title}</h3>
              <p className="text-sm text-gray-600">{formatTime(task.time)}</p>
            </div>
          </div>
          <button onClick={handleReadAloud} className="p-2">
            <Icon name="volume_up" className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <div className="flex items-start mb-3">
        <CategoryIcon category={task.category} withBackground className="mr-3" />
        <div className="flex-1">
          <h3 className="text-md font-bold">{task.title}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Icon name="schedule" className="text-sm mr-1" />
            <span>{formatTime(task.time)}</span>
            <span className="mx-2">•</span>
            <span>{task.frequency === "once" ? "Sólo hoy" : 
                  task.frequency === "daily" ? "Diariamente" : 
                  task.frequency === "weekly" ? "Semanalmente" : "Mensualmente"}</span>
          </div>
        </div>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 text-gray-500 hover:text-primary"
            onClick={handleEdit}
          >
            <Icon name="edit" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 text-gray-500 hover:text-error"
            onClick={handleDelete}
          >
            <Icon name="delete" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Button 
          variant="ghost" 
          className="text-primary"
          onClick={handleReadAloud}
        >
          <Icon name="volume_up" className="mr-1" />
          Leer
        </Button>
        <Button 
          variant={task.completed ? "outline" : "default"} 
          size="sm" 
          className={task.completed ? "text-success" : ""}
          onClick={handleToggleComplete}
        >
          <Icon name={task.completed ? "check_circle" : "radio_button_unchecked"} className="mr-1" />
          {task.completed ? "Completado" : "Marcar como completado"}
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, TASK_CATEGORIES } from "@shared/schema";
import TaskItem from "@/components/task-item";
import AddTaskModal from "@/components/add-task-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskListProps {
  variant?: "compact" | "full";
  limit?: number;
}

const TaskList: React.FC<TaskListProps> = ({ variant = "full", limit }) => {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by date and time
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, limit);

  const filteredTasks = activeFilter === "all" 
    ? tasks 
    : tasks.filter(task => task.category === activeFilter);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setTaskToEdit(null);
    setIsAddModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="schedule" className="text-primary text-lg" />
          </div>
        </div>
        <span className="ml-4 text-muted-foreground font-medium">Cargando recordatorios...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-xl p-6 mb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-destructive/5"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Icon name="error" className="text-destructive text-3xl" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-card-foreground">Error al cargar los recordatorios</h3>
          <p className="text-muted-foreground mb-4">No se pudieron cargar tus recordatorios. Intenta nuevamente más tarde.</p>
          <Button 
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
          >
            <Icon name="refresh" className="mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    if (upcomingTasks.length === 0) {
      return (
        <div className="bg-card rounded-xl overflow-hidden mb-6 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5 opacity-80"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
          
          <div className="relative z-10 p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
              <Icon name="emoji_events" className="text-primary text-2xl" />
            </div>
            <p className="text-muted-foreground mb-4">¡Todo listo! No tienes recordatorios próximos.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <span className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9ImdiIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTUiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiAvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2diKSIgLz4KPC9zdmc+')]"></span>
              <span className="relative z-10 flex items-center text-white">
                <Icon name="add" className="mr-2" />
                Crear recordatorio
              </span>
            </Button>
            <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl overflow-hidden mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-[2px]"></div>
        <div className="relative z-10 p-6 bg-card/80">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/10 p-2 mr-3">
                <Icon name="schedule" className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-card-foreground">Próximas tareas</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:bg-primary/10 rounded-full" 
              onClick={() => setActiveFilter("all")}
            >
              <span>Ver todas</span>
              <Icon name="arrow_forward" className="ml-1 text-sm" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={handleEditTask} 
                variant="compact" 
              />
            ))}
          </div>
          
          <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 glow-effect">
            <Icon name="format_list_bulleted" className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground">Mis recordatorios</h2>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-full p-3 hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <div className="relative">
            <Icon name="add" />
            <span className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></span>
          </div>
        </Button>
      </div>

      <div className="mb-6 relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-[1px]"></div>
        <Tabs defaultValue="all" className="relative z-10">
          <TabsList className="flex overflow-x-auto p-1 space-x-2 bg-card/30 backdrop-blur-sm rounded-xl">
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveFilter("all")} 
              className={`rounded-full py-2 px-4 whitespace-nowrap transition-all duration-300 ${
                activeFilter === "all" 
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                  : "bg-card/80 text-card-foreground hover:bg-primary/10"
              }`}
            >
              <Icon name="apps" className="mr-2 text-sm" />
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="medicine" 
              onClick={() => setActiveFilter(TASK_CATEGORIES.MEDICINE)}
              className={`rounded-full py-2 px-4 whitespace-nowrap transition-all duration-300 ${
                activeFilter === TASK_CATEGORIES.MEDICINE 
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                  : "bg-card/80 text-card-foreground hover:bg-primary/10"
              }`}
            >
              <Icon name="medication" className="mr-2 text-sm" />
              Medicinas
            </TabsTrigger>
            <TabsTrigger 
              value="meal" 
              onClick={() => setActiveFilter(TASK_CATEGORIES.MEAL)}
              className={`rounded-full py-2 px-4 whitespace-nowrap transition-all duration-300 ${
                activeFilter === TASK_CATEGORIES.MEAL 
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                  : "bg-card/80 text-card-foreground hover:bg-primary/10"
              }`}
            >
              <Icon name="restaurant" className="mr-2 text-sm" />
              Comidas
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              onClick={() => setActiveFilter(TASK_CATEGORIES.GENERAL)}
              className={`rounded-full py-2 px-4 whitespace-nowrap transition-all duration-300 ${
                activeFilter === TASK_CATEGORIES.GENERAL 
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                  : "bg-card/80 text-card-foreground hover:bg-primary/10"
              }`}
            >
              <Icon name="event" className="mr-2 text-sm" />
              General
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-card rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5 opacity-80"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 float-animation">
              <Icon name="search" className="text-primary text-3xl" />
            </div>
            
            <h3 className="text-lg font-bold mb-2 text-card-foreground">No hay recordatorios</h3>
            <p className="text-muted-foreground mb-5">No se encontraron recordatorios en esta categoría.</p>
            
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <span className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9ImdiIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTUiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiAvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2diKSIgLz4KPC9zdmc+')]"></span>
              <span className="relative z-10 flex items-center text-white">
                <Icon name="add" className="mr-2" />
                Crear recordatorio
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/20 to-transparent"></div>
          {filteredTasks.map((task) => (
            <div key={task.id} className="pl-6 relative">
              <div className="absolute left-2 top-7 w-4 h-4 rounded-full bg-card border-4 border-primary/50 z-10"></div>
              <TaskItem task={task} onEdit={handleEditTask} />
            </div>
          ))}
        </div>
      )}

      <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default TaskList;

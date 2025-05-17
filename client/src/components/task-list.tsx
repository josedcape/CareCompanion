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
      <div className="flex justify-center items-center py-8">
        <Icon name="hourglass_empty" className="text-primary animate-spin mr-2" />
        <span>Cargando recordatorios...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card mb-6 text-center">
        <Icon name="error" className="text-error text-4xl mb-2" />
        <h3 className="text-lg font-bold mb-2">Error al cargar los recordatorios</h3>
        <p className="text-gray-600">No se pudieron cargar tus recordatorios. Intenta nuevamente más tarde.</p>
      </div>
    );
  }

  if (variant === "compact") {
    if (upcomingTasks.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-card mb-6 text-center">
          <p className="text-gray-600">No tienes recordatorios próximos.</p>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="mt-4 bg-primary text-white"
          >
            <Icon name="add" className="mr-2" />
            Crear recordatorio
          </Button>
          <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Próximas tareas</h2>
          <Button variant="link" className="text-primary" onClick={() => setActiveFilter("all")}>
            Ver todas
          </Button>
        </div>
        
        {upcomingTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onEdit={handleEditTask} 
            variant="compact" 
          />
        ))}
        
        <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Mis recordatorios</h2>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-primary text-white rounded-full p-3"
        >
          <Icon name="add" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="flex overflow-x-auto pb-2 space-x-2 bg-transparent">
          <TabsTrigger 
            value="all" 
            onClick={() => setActiveFilter("all")} 
            className={`rounded-full py-2 px-4 whitespace-nowrap ${
              activeFilter === "all" ? "bg-primary text-white" : "bg-white text-textDark"
            }`}
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="medicine" 
            onClick={() => setActiveFilter(TASK_CATEGORIES.MEDICINE)}
            className={`rounded-full py-2 px-4 whitespace-nowrap ${
              activeFilter === TASK_CATEGORIES.MEDICINE ? "bg-primary text-white" : "bg-white text-textDark"
            }`}
          >
            Medicinas
          </TabsTrigger>
          <TabsTrigger 
            value="meal" 
            onClick={() => setActiveFilter(TASK_CATEGORIES.MEAL)}
            className={`rounded-full py-2 px-4 whitespace-nowrap ${
              activeFilter === TASK_CATEGORIES.MEAL ? "bg-primary text-white" : "bg-white text-textDark"
            }`}
          >
            Comidas
          </TabsTrigger>
          <TabsTrigger 
            value="general" 
            onClick={() => setActiveFilter(TASK_CATEGORIES.GENERAL)}
            className={`rounded-full py-2 px-4 whitespace-nowrap ${
              activeFilter === TASK_CATEGORIES.GENERAL ? "bg-primary text-white" : "bg-white text-textDark"
            }`}
          >
            General
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-card mb-6 text-center">
          <p className="text-gray-600">No tienes recordatorios en esta categoría.</p>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="mt-4 bg-primary text-white"
          >
            <Icon name="add" className="mr-2" />
            Crear recordatorio
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
          ))}
        </div>
      )}

      <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default TaskList;

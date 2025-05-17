import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import TaskList from "@/components/task-list";
import VoiceDialog from "@/components/voice-dialog";
import AddTaskModal from "@/components/add-task-modal";

const Home: React.FC = () => {
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const handleVoiceAssistant = () => {
    setIsVoiceDialogOpen(true);
  };

  return (
    <div className="mb-8">
      {/* Welcome Card with Image */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <img 
          src="https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
          alt="Persona mayor usando un smartphone" 
          className="w-full h-auto rounded-lg mb-4"
        />
        <h2 className="text-lg font-bold mb-2">¡Bienvenido de nuevo!</h2>
        <p className="text-base mb-4">Tu asistente está listo para ayudarte a recordar tus actividades diarias.</p>
        
        {/* Voice Assistant Button */}
        <Button 
          className="w-full bg-primary text-white rounded-full py-4 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
          onClick={handleVoiceAssistant}
        >
          <Icon name="mic" className="mr-2 pulse-animation" />
          <span className="text-md font-bold">Hablar con mi asistente</span>
        </Button>
      </div>

      {/* Upcoming Tasks Summary */}
      <TaskList variant="compact" limit={3} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button 
          variant="outline" 
          className="bg-white rounded-xl p-5 flex flex-col items-center justify-center shadow-card hover:bg-gray-50 transition-colors h-auto"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <Icon name="add_alarm" className="text-secondary text-2xl mb-2" />
          <span className="text-base font-medium">Nuevo recordatorio</span>
        </Button>
        <Button 
          variant="outline" 
          className="bg-white rounded-xl p-5 flex flex-col items-center justify-center shadow-card hover:bg-gray-50 transition-colors h-auto"
        >
          <Icon name="help" className="text-primary text-2xl mb-2" />
          <span className="text-base font-medium">Ayuda</span>
        </Button>
      </div>

      {/* Modals */}
      <VoiceDialog isOpen={isVoiceDialogOpen} onClose={() => setIsVoiceDialogOpen(false)} />
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} />
    </div>
  );
};

export default Home;

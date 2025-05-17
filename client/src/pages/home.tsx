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
      {/* Welcome Card with Futuristic Design */}
      <div className="relative bg-card rounded-2xl overflow-hidden mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/30 z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-card/90 to-transparent z-10"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
          alt="Persona mayor usando un smartphone" 
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="relative z-20 p-6">
          <div className="flex items-center mb-3">
            <div className="mr-3 flex-shrink-0 rounded-full w-12 h-12 bg-primary/30 flex items-center justify-center glow-effect">
              <Icon name="timeline" className="text-primary text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">¡Bienvenido de nuevo!</h2>
              <p className="text-sm text-muted-foreground">Tu asistente personal inteligente</p>
            </div>
          </div>
          
          <p className="text-base mb-5 text-card-foreground/80">
            Estoy aquí para ayudarte a recordar tus actividades importantes de manera fácil y sin complicaciones.
          </p>
          
          {/* Voice Assistant Button */}
          <Button 
            className="w-full py-5 rounded-xl flex items-center justify-center futuristic-border relative overflow-hidden group transition-all duration-300"
            onClick={handleVoiceAssistant}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9ImdiIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTUiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiAvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2diKSIgLz4KPC9zdmc+')]"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary to-accent blur-2xl transition-opacity duration-1000"></div>
            <div className="relative z-10 flex items-center">
              <span className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Icon name="mic" className="text-white text-xl pulse-animation" />
                <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-75"></span>
              </span>
              <span className="text-lg font-semibold text-white">Hablar con mi asistente</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Upcoming Tasks Summary */}
      <TaskList variant="compact" limit={3} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button 
          variant="outline" 
          className="bg-card rounded-xl p-5 flex flex-col items-center justify-center shadow-lg hover:bg-primary/5 transition-all duration-300 h-auto border border-primary/20 hover:border-primary/50"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <div className="rounded-full p-3 bg-primary/10 mb-3 glow-effect">
            <Icon name="add_alarm" className="text-primary text-2xl" />
          </div>
          <span className="text-base font-medium">Nuevo recordatorio</span>
        </Button>
        <Button 
          variant="outline" 
          className="bg-card rounded-xl p-5 flex flex-col items-center justify-center shadow-lg hover:bg-accent/5 transition-all duration-300 h-auto border border-accent/20 hover:border-accent/50"
        >
          <div className="rounded-full p-3 bg-accent/10 mb-3">
            <Icon name="help" className="text-accent text-2xl" />
          </div>
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

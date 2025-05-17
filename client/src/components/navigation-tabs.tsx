import React from "react";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const tabs = [
    { id: "home", icon: "home", label: "Inicio" },
    { id: "tasks", icon: "list", label: "Tareas" },
    { id: "profile", icon: "person", label: "Perfil" }
  ];

  return (
    <div className="relative mb-8 py-2 rounded-xl glass-card backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl"></div>
      <div className="flex relative z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex-1 py-3 px-2 text-md font-medium flex flex-col items-center transition-all duration-300",
              activeTab === tab.id
                ? "text-primary scale-110"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className={cn(
              "rounded-full p-2 mb-1 transition-colors",
              activeTab === tab.id
                ? "bg-primary/20 glow-effect"
                : "bg-transparent"
            )}>
              <Icon 
                name={tab.icon} 
                className={cn(
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                )} 
              />
            </div>
            <span className="text-sm">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;

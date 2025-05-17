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
    <div className="flex mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex-1 py-4 px-2 text-md font-medium flex flex-col items-center",
            activeTab === tab.id
              ? "text-primary font-bold border-b-4 border-primary"
              : "text-gray-500"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <Icon name={tab.icon} className="mb-1" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default NavigationTabs;

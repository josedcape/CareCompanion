import React from "react";
import { Icon } from "@/components/ui/icons";

const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="relative w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-effect">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-60"></div>
          <Icon name="smart_toy" className="text-4xl text-primary float-animation" />
        </div>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
        Mi Asistente
      </h1>
      <p className="text-base text-muted-foreground">
        Tu acompañante digital inteligente
      </p>
    </header>
  );
};

export default Header;

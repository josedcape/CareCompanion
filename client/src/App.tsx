import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import Header from "@/components/layout/header";
import NavigationTabs from "@/components/navigation-tabs";
import Home from "@/pages/home";
import Tasks from "@/pages/tasks";
import Profile from "@/pages/profile";
import AssistantConfig from "@/pages/assistant-config";
import NotFound from "@/pages/not-found";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="fixed top-3 right-3 z-50">
        <button 
          onClick={toggleTheme} 
          className="rounded-full p-2 bg-primary/20 hover:bg-primary/30 transition-colors"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <Header />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Switch>
        <Route path="/">
          {activeTab === "home" && <Home />}
          {activeTab === "tasks" && <Tasks />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "settings" && <AssistantConfig />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;

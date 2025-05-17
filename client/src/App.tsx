import { useState } from "react";
import { Route, Switch } from "wouter";
import Header from "@/components/layout/header";
import NavigationTabs from "@/components/navigation-tabs";
import Home from "@/pages/home";
import Tasks from "@/pages/tasks";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-background">
      <Header />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Switch>
        <Route path="/">
          {activeTab === "home" && <Home />}
          {activeTab === "tasks" && <Tasks />}
          {activeTab === "profile" && <Profile />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;

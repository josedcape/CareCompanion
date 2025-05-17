import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

const Profile: React.FC = () => {
  const { speak } = useTextToSpeech();
  
  const userProfile = {
    name: "Roberto García",
    email: "roberto.garcia@email.com",
    profileImage: "https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  };
  
  const settings = [
    { id: "notifications", icon: "notifications", label: "Notificaciones" },
    { id: "language", icon: "language", label: "Idioma" },
    { id: "help", icon: "help", label: "Ayuda" },
    { id: "logout", icon: "logout", label: "Cerrar sesión", type: "danger" }
  ];
  
  const handleSpeakName = () => {
    speak(`Hola ${userProfile.name}, bienvenido a tu perfil`);
  };
  
  return (
    <div>
      {/* User Profile Card */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6 text-center">
        <div className="relative inline-block">
          <img 
            src={userProfile.profileImage} 
            alt="Foto de perfil" 
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-3 right-0 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
            onClick={handleSpeakName}
          >
            <Icon name="volume_up" className="text-primary" />
          </Button>
        </div>
        <h2 className="text-lg font-bold mb-1">{userProfile.name}</h2>
        <p className="text-base text-gray-600 mb-4">{userProfile.email}</p>
        <Button className="bg-primary text-white rounded-full py-3 px-6 text-md font-medium">
          Editar perfil
        </Button>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-xl overflow-hidden shadow-card mb-6">
        {settings.map((setting, index) => (
          <div key={setting.id} className={index < settings.length - 1 ? "border-b border-gray-100" : ""}>
            <Button 
              variant="ghost" 
              className="w-full py-4 px-6 flex justify-between items-center hover:bg-gray-50 rounded-none h-auto"
            >
              <div className="flex items-center">
                <Icon 
                  name={setting.icon} 
                  className={setting.type === "danger" ? "text-error mr-3" : "text-gray-500 mr-3"} 
                />
                <span className={`text-base font-medium ${setting.type === "danger" ? "text-error" : ""}`}>
                  {setting.label}
                </span>
              </div>
              {setting.type !== "danger" && (
                <Icon name="chevron_right" className="text-gray-400" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;

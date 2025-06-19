import React, { useState } from "react";
import { UserPlus, Users, Stethoscope, Crown, Shield } from "lucide-react";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ViewMode = "login" | "register" | "user-selection";

const Home = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [selectedUserType, setSelectedUserType] = useState<UserRole | null>(
    null,
  );
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const userTypes = [
    {
      type: "super_admin" as UserRole,
      title: "Super Administrador",
      description: "Gerencia todo o sistema e múltiplas clínicas",
      icon: Shield,
      color: "bg-purple-500",
    },
    {
      type: "chief_specialist" as UserRole,
      title: "Especialista Chefe",
      description: "Lidera equipe de especialistas e gerencia clínica",
      icon: Crown,
      color: "bg-blue-500",
    },
    {
      type: "specialist" as UserRole,
      title: "Especialista",
      description: "Profissional de saúde que atende pacientes",
      icon: Stethoscope,
      color: "bg-green-500",
    },
    {
      type: "patient" as UserRole,
      title: "Paciente",
      description: "Usuário que recebe cuidados e acompanhamento",
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  const handleUserTypeSelect = (userType: UserRole) => {
    setSelectedUserType(userType);
    setViewMode("register");
  };

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setViewMode("login");
    setSelectedUserType(null);
  };

  const handleBackToLogin = () => {
    setViewMode("login");
    setSelectedUserType(null);
    setRegistrationSuccess(false);
  };

  const handleBackToUserSelection = () => {
    setViewMode("user-selection");
    setSelectedUserType(null);
  };

  if (viewMode === "register" && selectedUserType) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-colors duration-300 p-4">
        <RegisterForm
          userType={selectedUserType}
          onBack={handleBackToUserSelection}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    );
  }

  if (viewMode === "user-selection") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-colors duration-300 p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&q=80"
                alt="Clinic Management Logo"
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Clinic Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecione o tipo de conta que deseja criar
            </p>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="mb-6"
            >
              Voltar ao Login
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((userType) => {
              const IconComponent = userType.icon;
              return (
                <Card
                  key={userType.type}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleUserTypeSelect(userType.type)}
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{userType.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {userType.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {registrationSuccess && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
            <AlertDescription>
              Conta criada com sucesso! Faça login para continuar.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <LoginForm onRegisterClick={() => setViewMode("user-selection")} />
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLogo from "./AppLogo";

type ViewMode = "login" | "register" | "userTypeSelection";

const LoginPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [selectedUserType, setSelectedUserType] = useState<UserRole | null>(
    null,
  );

  const handleUserTypeSelect = (userType: UserRole) => {
    setSelectedUserType(userType);
    setViewMode("register");
  };

  const handleBackToLogin = () => {
    setViewMode("login");
    setSelectedUserType(null);
  };

  const handleBackToUserTypeSelection = () => {
    setViewMode("userTypeSelection");
    setSelectedUserType(null);
  };

  const handleRegistrationSuccess = () => {
    setViewMode("login");
    setSelectedUserType(null);
  };

  if (viewMode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <LoginForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <button
                onClick={() => setViewMode("userTypeSelection")}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "userTypeSelection") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <AppLogo type="login" size="lg" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Tipo de Conta
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                Selecione o tipo de conta que deseja criar
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleUserTypeSelect("patient")}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <div>
                <div className="font-medium">Paciente</div>
                <div className="text-sm text-gray-500">
                  Acesso a dicas e questionários
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleUserTypeSelect("specialist")}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <div>
                <div className="font-medium">Especialista</div>
                <div className="text-sm text-gray-500">
                  Gerenciar pacientes e criar fluxos
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleUserTypeSelect("chief_specialist")}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <div>
                <div className="font-medium">Especialista Chefe</div>
                <div className="text-sm text-gray-500">
                  Gerenciar equipe e configurações
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleUserTypeSelect("super_admin")}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <div>
                <div className="font-medium">Super Administrador</div>
                <div className="text-sm text-gray-500">
                  Acesso completo ao sistema
                </div>
              </div>
            </Button>

            <div className="pt-4">
              <Button
                onClick={handleBackToLogin}
                variant="ghost"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "register" && selectedUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <RegisterForm
          userType={selectedUserType}
          onBack={handleBackToUserTypeSelection}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    );
  }

  return null;
};

export default LoginPage;

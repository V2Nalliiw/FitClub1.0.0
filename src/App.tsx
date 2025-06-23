import { Suspense } from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./components/home";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import ChiefSpecialistDashboard from "./components/dashboards/ChiefSpecialistDashboard";
import PatientDashboard from "./components/dashboards/PatientDashboard";
import AchievementsPage from "./components/dashboards/AchievementsPage";
import UnifiedSettingsPage from "./components/UnifiedSettingsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import FormularioPage from "./components/FormularioPage";

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "super_admin":
        return "/dashboard/super-admin";
      case "chief_specialist":
        return "/dashboard/chief-specialist";
      case "specialist":
        return "/dashboard/specialist";
      case "patient":
        return "/dashboard/patient";
      default:
        return "/login";
    }
  };

  // Tempo routes for storyboards
  const tempoRoutes = import.meta.env.VITE_TEMPO
    ? useRoutes(require("tempo-routes").default || [])
    : null;

  return (
    <>
      {tempoRoutes}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardPath()} replace />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={getDashboardPath()} replace />
            )
          }
        />
        <Route
          path="/login-page"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={getDashboardPath()} replace />
            )
          }
        />

        {/* Public form access route - no authentication required */}
        <Route path="/formulario" element={<FormularioPage />} />

        <Route
          path="/dashboard/super-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chief-specialist"
          element={
            <ProtectedRoute allowedRoles={["chief_specialist"]}>
              <ChiefSpecialistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chief-specialist/flowbuilder"
          element={
            <ProtectedRoute allowedRoles={["chief_specialist"]}>
              <ChiefSpecialistDashboard view="flowbuilder" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist"
          element={
            <ProtectedRoute allowedRoles={["specialist", "chief_specialist"]}>
              <ChiefSpecialistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/achievements"
          element={
            <ProtectedRoute allowedRoles={["chief_specialist", "super_admin"]}>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
                "chief_specialist",
                "specialist",
                "patient",
              ]}
            >
              <UnifiedSettingsPage onBack={() => window.history.back()} />
            </ProtectedRoute>
          }
        />

        {/* Tempo routes catch-all */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const AppContent = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AppRoutes />
    </Suspense>
  );
};

function App() {
  const basename = import.meta.env.VITE_BASENAME || "/";

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

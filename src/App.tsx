import { Suspense, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./components/home";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import SpecialistDashboard from "./components/dashboards/SpecialistDashboard";
import ChiefSpecialistDashboard from "./components/dashboards/ChiefSpecialistDashboard";
import PatientDashboard from "./components/dashboards/PatientDashboard";
import AchievementsPage from "./components/dashboards/AchievementsPage";
import UnifiedSettingsPage from "./components/UnifiedSettingsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginForm from "./components/auth/LoginForm";
import LoginPage from "./components/auth/LoginPage";
import routes from "tempo-routes";

// Component to handle role-based routing
const AppRoutes = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Store current path in sessionStorage to preserve it on refresh
  useEffect(() => {
    if (isAuthenticated && user && location.pathname !== "/") {
      sessionStorage.setItem("lastVisitedPath", location.pathname);
    }
  }, [location.pathname, isAuthenticated, user]);

  // Show loading state with better UX
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const getDashboardPath = () => {
    if (!user) return "/";

    // Check if there's a stored path to return to after refresh
    const lastVisitedPath = sessionStorage.getItem("lastVisitedPath");
    if (
      lastVisitedPath &&
      lastVisitedPath !== "/" &&
      lastVisitedPath !== "/login"
    ) {
      // Verify the user has access to this path based on their role
      const allowedPaths = {
        super_admin: [
          "/dashboard/super-admin",
          "/settings",
          "/dashboard/achievements",
        ],
        chief_specialist: [
          "/dashboard/chief-specialist",
          "/settings",
          "/dashboard/achievements",
        ],
        specialist: ["/dashboard/specialist", "/settings"],
        patient: ["/dashboard/patient", "/settings"],
      };

      const userAllowedPaths = allowedPaths[user.role] || [];
      const isPathAllowed = userAllowedPaths.some((allowedPath) =>
        lastVisitedPath.startsWith(allowedPath),
      );

      if (isPathAllowed) {
        return lastVisitedPath;
      }
    }

    // Default dashboard based on role
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
        return "/";
    }
  };

  return (
    <Routes>
      {/* Root route - always accessible */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath()} replace />
          ) : (
            <Home />
          )
        }
      />

      {/* Login route */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath()} replace />
          ) : (
            <Home />
          )
        }
      />

      {/* Dedicated login page route */}
      <Route
        path="/login-page"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Register route */}
      <Route path="/register" element={<Home />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard/super-admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/super-admin/*"
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
        path="/dashboard/chief-specialist/*"
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
        path="/dashboard/achievements"
        element={
          <ProtectedRoute allowedRoles={["chief_specialist", "super_admin"]}>
            <AchievementsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/specialist"
        element={
          <ProtectedRoute allowedRoles={["specialist"]}>
            <SpecialistDashboard />
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

      {/* Tempo routes for development */}
      {import.meta.env.VITE_TEMPO === "true" && (
        <Route path="/tempobook/*" element={<div />} />
      )}

      {/* Unified Settings route */}
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
      <Route
        path="/settings/*"
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

      {/* Legacy preferences route - redirect to unified settings */}
      <Route
        path="/preferences"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "chief_specialist",
              "specialist",
              "patient",
            ]}
          >
            <Navigate to="/settings" replace />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath()} replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p>Loading...</p>
          </div>
        }
      >
        {/* Tempo routes for development */}
        {import.meta.env.VITE_TEMPO === "true" && routes && useRoutes(routes)}
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;

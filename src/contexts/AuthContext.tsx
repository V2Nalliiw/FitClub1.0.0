import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  User,
  ROLE_PERMISSIONS,
} from "@/types/auth";
import { AuthService } from "@/services/authService";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        const user = await AuthService.getCurrentUser();
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (error) {
        // Handle AuthSessionMissingError gracefully - this is expected on first load
        if (
          error instanceof Error &&
          error.message.includes("Auth session missing")
        ) {
          console.log("No existing session found - user needs to login");
        } else {
          console.error("Error checking session:", error);
        }
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Small delay to ensure DOM is ready before checking session
    const timer = setTimeout(() => {
      checkSession();
    }, 100);

    checkSession();
    clearTimeout(timer);

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
          const user = await AuthService.getCurrentUser();
          console.log("User profile loaded:", user);
          setAuthState({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error loading user profile:", error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Redirect to login when signed out
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      } else if (event === "USER_UPDATED") {
        // Refresh user data when updated
        const user = await AuthService.getCurrentUser();
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const user = await AuthService.login(credentials);

      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      return false;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Force redirect to login page after logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if logout fails, redirect to login
      window.location.href = "/login";
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;

    const userPermissions = ROLE_PERMISSIONS[authState.user.role] || [];
    return userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the useAuth hook as a separate named function export
// This format ensures compatibility with React's Fast Refresh
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

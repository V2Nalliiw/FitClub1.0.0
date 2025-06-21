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
  Clinic,
  ROLE_PERMISSIONS,
} from "@/types/auth";
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
    clinic: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchUserAndClinicData = async (sessionUser: any) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (profileError || !userProfile) {
        console.error("No user profile found for session user:", sessionUser.id, profileError);
        return { user: null, clinic: null };
      }

      let clinicData: Clinic | null = null;
      if (userProfile.clinic_id) {
        const { data, error: clinicError } = await supabase
          .from("clinics")
          .select("*")
          .eq("id", userProfile.clinic_id)
          .single();
        if (clinicError) {
          console.error("Error fetching clinic data:", clinicError);
        } else {
          clinicData = data;
        }
      }

      const user: User = {
        id: userProfile.id,
        email: sessionUser.email,
        name: userProfile.name,
        role: userProfile.role,
        clinicId: userProfile.clinic_id,
        clinicLogoUrl: clinicData?.logo_mobile_url || null,
        avatar: userProfile.avatar_url,
        createdAt: sessionUser.created_at,
      };
      return { user, clinic: clinicData };
    } catch (error) {
      console.error("Error fetching user and clinic data:", error);
      return { user: null, clinic: null };
    }
  };

  // Checagem inicial da sessão ao montar o contexto
  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { user, clinic } = await fetchUserAndClinicData(session.user);
        setAuthState({
          user,
          clinic,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          clinic: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) return false;

    // Buscar perfil e atualizar o contexto imediatamente
    const { user, clinic } = await fetchUserAndClinicData(data.user);
    setAuthState({
      user,
      clinic,
      isAuthenticated: !!user,
      isLoading: false,
    });

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
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

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

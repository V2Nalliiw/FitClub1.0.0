import { supabase } from "@/lib/supabase";
import { User, LoginCredentials, UserRole } from "@/types/auth";

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clinicId?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      console.log("Tentando fazer login com:", credentials.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error("Erro no login:", error);
        throw new Error(`Erro no login: ${error.message}`);
      }

      if (!data.user) {
        throw new Error("Falha na autenticação - usuário não encontrado");
      }

      console.log("Login bem-sucedido, buscando perfil do usuário...");

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw new Error(
          `Perfil do usuário não encontrado: ${profileError.message}`,
        );
      }

      if (!profile) {
        throw new Error("Perfil do usuário não encontrado");
      }

      console.log("Perfil encontrado:", profile);

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        clinicId: profile.clinic_id || undefined,
        avatar: profile.avatar_url || undefined,
        createdAt: profile.created_at,
      };
    } catch (error) {
      console.error("Erro completo no login:", error);
      throw error;
    }
  }

  static async register(registerData: RegisterData): Promise<User | null> {
    try {
      console.log(
        "Iniciando registro para:",
        registerData.email,
        "Papel:",
        registerData.role,
      );

      // Verificar se todos os campos necessários estão presentes
      if (
        !registerData.email ||
        !registerData.password ||
        !registerData.name ||
        !registerData.role
      ) {
        throw new Error("Dados de registro incompletos");
      }

      // Primeiro, criar o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            role: registerData.role,
          },
        },
      });

      if (authError) {
        console.error("Erro na criação do usuário de autenticação:", authError);
        throw new Error(`Erro no registro: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Falha no registro: Usuário não foi criado");
      }

      console.log(
        "Usuário de autenticação criado com sucesso:",
        authData.user.id,
      );

      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Criar perfil do usuário manualmente
      console.log("Criando perfil do usuário...");
      let { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: registerData.email,
          name: registerData.name,
          role: registerData.role,
          clinic_id: registerData.clinicId || null,
          phone: registerData.phone || null,
          specialization: registerData.specialization || null,
          license_number: registerData.licenseNumber || null,
        })
        .select()
        .single();

      if (profileError) {
        console.error("Erro ao criar perfil do usuário:", profileError);

        // Se o erro for de conflito (registro já existe), tente atualizar em vez de inserir
        if (profileError.code === "23505") {
          // Código de erro para violação de chave única
          console.log("Perfil já existe, tentando atualizar...");
          const { data: updateData, error: updateError } = await supabase
            .from("user_profiles")
            .update({
              email: registerData.email,
              name: registerData.name,
              role: registerData.role,
              clinic_id: registerData.clinicId || null,
              phone: registerData.phone || null,
              specialization: registerData.specialization || null,
              license_number: registerData.licenseNumber || null,
            })
            .eq("id", authData.user.id)
            .select()
            .single();

          if (updateError) {
            console.error("Erro ao atualizar perfil existente:", updateError);
            throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
          }

          profileData = updateData;
        } else {
          // Tentar limpar o usuário de autenticação se o perfil falhou
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (cleanupError) {
            console.error(
              "Erro ao limpar usuário após falha no perfil:",
              cleanupError,
            );
          }
          throw new Error(`Erro ao criar perfil: ${profileError.message}`);
        }
      }

      console.log("Perfil criado com sucesso:", profileData);

      // Criar registros específicos por papel
      if (
        registerData.role === "specialist" ||
        registerData.role === "chief_specialist"
      ) {
        console.log("Criando registro de especialista...");
        try {
          const { error: specialistError } = await supabase
            .from("specialists")
            .insert({
              user_id: authData.user.id,
              clinic_id: registerData.clinicId || null,
              specialization: registerData.specialization || "Não especificado",
              license_number: registerData.licenseNumber || null,
              is_approved: registerData.role === "chief_specialist",
            });

          if (specialistError) {
            console.error(
              "Erro ao criar registro de especialista:",
              specialistError,
            );
          } else {
            console.log("Registro de especialista criado com sucesso");
          }
        } catch (error) {
          console.error("Exceção ao criar registro de especialista:", error);
          // Continue with registration even if this fails
        }
      }

      if (registerData.role === "patient") {
        console.log("Criando registro de paciente...");
        try {
          const { error: patientError } = await supabase
            .from("patients")
            .insert({
              user_id: authData.user.id,
              clinic_id: registerData.clinicId || null,
              date_of_birth: registerData.dateOfBirth || null,
              gender: registerData.gender || null,
              emergency_contact_name: registerData.emergencyContactName || null,
              emergency_contact_phone:
                registerData.emergencyContactPhone || null,
            });

          if (patientError) {
            console.error("Erro ao criar registro de paciente:", patientError);
          } else {
            console.log("Registro de paciente criado com sucesso");
          }
        } catch (error) {
          console.error("Exceção ao criar registro de paciente:", error);
          // Continue with registration even if this fails
        }
      }

      console.log("Registro completado com sucesso!");

      return {
        id: authData.user.id,
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        clinicId: registerData.clinicId,
        createdAt: authData.user.created_at,
      };
    } catch (error) {
      console.error("Processo de registro falhou:", error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro no logout:", error);
        throw new Error(`Erro no logout: ${error.message}`);
      }
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        // Handle AuthSessionMissingError gracefully
        if (userError.message.includes("Auth session missing")) {
          console.log("No auth session found - user needs to login");
          return null;
        }
        console.error("Erro ao obter usuário autenticado:", userError);
        return null;
      }

      if (!user) {
        console.log("Nenhum usuário autenticado encontrado");
        return null;
      }

      console.log("Usuário autenticado encontrado, buscando perfil:", user.id);

      // Tentar buscar o perfil várias vezes com delay crescente
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!profile && attempts < maxAttempts) {
        const { data: profileData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && profileData) {
          profile = profileData;
          break;
        }

        if (attempts < maxAttempts - 1) {
          console.log(
            `Perfil não encontrado, tentando novamente (tentativa ${attempts + 1}/${maxAttempts})`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts)),
          );
        }

        attempts++;
      }

      if (!profile) {
        console.error(
          "Perfil do usuário não encontrado após múltiplas tentativas",
        );
        return null;
      }

      console.log("Perfil encontrado:", profile);

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        clinicId: profile.clinic_id || undefined,
        avatar: profile.avatar_url || undefined,
        createdAt: profile.created_at,
      };
    } catch (error) {
      console.error("Erro em getCurrentUser:", error);
      return null;
    }
  }

  static async getClinics() {
    try {
      console.log("Buscando clínicas disponíveis...");

      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .order("name");

      if (error) {
        console.error("Erro ao buscar clínicas:", error);
        throw new Error(`Erro ao buscar clínicas: ${error.message}`);
      }

      // Se não há clínicas, criar uma padrão
      if (!data || data.length === 0) {
        console.log("Nenhuma clínica encontrada, criando clínica padrão...");

        const { data: newClinic, error: insertError } = await supabase
          .from("clinics")
          .insert({
            name: "Clínica Padrão",
            description: "Clínica padrão do sistema",
            primary_color: "#3B82F6",
            secondary_color: "#10B981",
            accent_color: "#F59E0B",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Erro ao criar clínica padrão:", insertError);
          return [];
        }

        console.log("Clínica padrão criada:", newClinic);
        return [newClinic];
      }

      console.log(`${data.length} clínicas encontradas`);
      return data;
    } catch (error) {
      console.error("Exceção em getClinics:", error);
      return [];
    }
  }

  static isAuthenticated(): boolean {
    return supabase.auth.getSession() !== null;
  }
}

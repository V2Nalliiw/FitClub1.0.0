import { User, LoginCredentials, UserRole } from "@/types/auth";

// Mock users for testing
export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@sistema.com",
    name: "Super Administrador",
    role: "super_admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "chefe@clinica.com",
    name: "Dr. João Silva",
    role: "chief_specialist", // This is correct - chief_specialist role
    clinicId: "clinic-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "4",
    email: "especialista@exemplo.com",
    name: "Dra. Maria Santos",
    role: "specialist",
    clinicId: "clinic-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "5",
    email: "paciente@exemplo.com",
    name: "Carlos Oliveira",
    role: "patient",
    clinicId: "clinic-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    createdAt: "2024-01-04T00:00:00Z",
  },
];

// Mock authentication service
export class MockAuthService {
  private static readonly STORAGE_KEY = "clinic_auth_user";
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async login(credentials: LoginCredentials): Promise<User | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user by email
    const user = MOCK_USERS.find((u) => u.email === credentials.email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Simple password validation (in real app, this would be hashed)
    if (credentials.password !== "123456") {
      throw new Error("Senha incorreta");
    }

    // Store user session
    const session = {
      user,
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    return user;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session.user;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

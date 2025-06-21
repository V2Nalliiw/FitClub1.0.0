export type UserRole =
  | "super_admin"
  | "clinic_admin"
  | "specialist"
  | "chief_specialist"
  | "patient";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId?: string; // For clinic_admin, specialist, and patient
  clinicLogoUrl?: string | null;
  avatar?: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  logo_url?: string;
  [key: string]: any; // Allow other properties
}

export interface AuthState {
  user: User | null;
  clinic: Clinic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Role-based permissions
export const PERMISSIONS = {
  // Super Admin permissions
  MANAGE_CLINICS: "manage_clinics",
  MANAGE_GLOBAL_SETTINGS: "manage_global_settings",
  APPROVE_SPECIALISTS: "approve_specialists",
  VIEW_ALL_REPORTS: "view_all_reports",

  // Clinic Admin permissions
  MANAGE_SPECIALISTS: "manage_specialists",
  MANAGE_BRANDING: "manage_branding",
  VIEW_CLINIC_REPORTS: "view_clinic_reports",
  MANAGE_CLINIC_FLOWS: "manage_clinic_flows",

  // Chief Specialist permissions (extends specialist)
  VIEW_TEAM_OVERVIEW: "view_team_overview",
  MANAGE_TEAM_PERMISSIONS: "manage_team_permissions",
  EDIT_CLINIC_SETTINGS: "edit_clinic_settings",
  VIEW_TEAM_ACTIVITY: "view_team_activity",
  INVITE_SPECIALISTS: "invite_specialists",

  // Specialist permissions
  MANAGE_PATIENTS: "manage_patients",
  CREATE_CUSTOM_FLOWS: "create_custom_flows",
  SEND_TIPS: "send_tips",
  TRACK_PATIENT_PROGRESS: "track_patient_progress",
  MANAGE_SCHEDULE: "manage_schedule",
  ACCESS_FLOWBUILDER: "access_flowbuilder",

  // Patient permissions
  ACCESS_TIPS: "access_tips",
  ANSWER_QUESTIONNAIRES: "answer_questionnaires",
  VIEW_ACHIEVEMENTS: "view_achievements",
  VIEW_PROGRESS: "view_progress",
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    PERMISSIONS.MANAGE_CLINICS,
    PERMISSIONS.MANAGE_GLOBAL_SETTINGS,
    PERMISSIONS.APPROVE_SPECIALISTS,
    PERMISSIONS.VIEW_ALL_REPORTS,
    PERMISSIONS.MANAGE_SPECIALISTS,
    PERMISSIONS.MANAGE_BRANDING,
    PERMISSIONS.VIEW_CLINIC_REPORTS,
    PERMISSIONS.MANAGE_CLINIC_FLOWS,
  ],
  clinic_admin: [
    PERMISSIONS.MANAGE_SPECIALISTS,
    PERMISSIONS.MANAGE_BRANDING,
    PERMISSIONS.VIEW_CLINIC_REPORTS,
    PERMISSIONS.MANAGE_CLINIC_FLOWS,
  ],
  chief_specialist: [
    // All specialist permissions
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.CREATE_CUSTOM_FLOWS,
    PERMISSIONS.SEND_TIPS,
    PERMISSIONS.TRACK_PATIENT_PROGRESS,
    PERMISSIONS.MANAGE_SCHEDULE,
    PERMISSIONS.ACCESS_FLOWBUILDER,
    // Additional chief specialist permissions
    PERMISSIONS.VIEW_TEAM_OVERVIEW,
    PERMISSIONS.MANAGE_TEAM_PERMISSIONS,
    PERMISSIONS.EDIT_CLINIC_SETTINGS, // This permission is needed for clinic administration button
    PERMISSIONS.VIEW_TEAM_ACTIVITY,
    PERMISSIONS.INVITE_SPECIALISTS,
    PERMISSIONS.VIEW_CLINIC_REPORTS,
  ],
  specialist: [
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.CREATE_CUSTOM_FLOWS,
    PERMISSIONS.SEND_TIPS,
    PERMISSIONS.TRACK_PATIENT_PROGRESS,
    PERMISSIONS.MANAGE_SCHEDULE,
    PERMISSIONS.ACCESS_FLOWBUILDER,
  ],
  patient: [
    PERMISSIONS.ACCESS_TIPS,
    PERMISSIONS.ANSWER_QUESTIONNAIRES,
    PERMISSIONS.VIEW_ACHIEVEMENTS,
    PERMISSIONS.VIEW_PROGRESS,
  ],
};

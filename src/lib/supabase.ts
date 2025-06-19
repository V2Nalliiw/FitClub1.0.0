import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables:", {
    url: supabaseUrl ? "present" : "missing",
    key: supabaseAnonKey ? "present" : "missing",
    env: import.meta.env.MODE,
  });
  throw new Error(
    `Missing Supabase environment variables. URL: ${supabaseUrl ? "OK" : "MISSING"}, Key: ${supabaseAnonKey ? "OK" : "MISSING"}`,
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
};

// Helper function to check if user has permission
export const hasPermission = async (permission: string) => {
  const profile = await getCurrentUserProfile();
  if (!profile) return false;

  // Import permissions from auth types
  const { ROLE_PERMISSIONS } = await import("@/types/auth");
  const userPermissions = ROLE_PERMISSIONS[profile.role] || [];
  return userPermissions.includes(permission);
};

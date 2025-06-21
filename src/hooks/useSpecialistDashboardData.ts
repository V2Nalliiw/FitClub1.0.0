import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useSpecialistDashboardData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    appointments: [],
    tips: [],
    libraryItems: [],
    patients: [],
    stats: {},
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    async function fetchData() {
      try {
        // Appointments: apenas do especialista logado
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select(
            `*,
            patients!appointments_patient_id_fkey(
              id,
              user_profiles!patients_user_id_fkey(
                name,
                email
              )
            )
          `
          )
          .eq("specialist_id", user.id)
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true });

        // Tips: criadas pelo especialista
        const { data: tips, error: tipsError } = await supabase
          .from("tips")
          .select("*")
          .eq("created_by", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        // Biblioteca: arquivos enviados pelo especialista
        const { data: libraryItems, error: libraryError } = await supabase
          .from("image_gallery")
          .select("*")
          .eq("uploaded_by", user.id)
          .order("created_at", { ascending: false });

        // Buscar pacientes do especialista logado
        const { data: patients, error: patientsError } = await supabase
          .from("patients")
          .select(
            `*, user_profiles: user_profiles!patients_user_id_fkey(*)`
          )
          .eq("assigned_specialist", user.id);

        setData({
          appointments: appointments || [],
          tips: tips || [],
          libraryItems: libraryItems || [],
          patients: patients || [],
          stats: {}, // Pode adicionar estatísticas se necessário
        });
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard do especialista:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return { ...data, loading };
} 
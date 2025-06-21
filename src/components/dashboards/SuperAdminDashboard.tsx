import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  UserCheck,
  Activity,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Trophy,
  Workflow,
  Menu,
  X,
  Clock,
  UserPlus,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/auth/ThemeToggle";
import AppLogo from "@/components/auth/AppLogo";
import ImageGallery from "@/components/ImageGallery";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

// Helper function to format time ago
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor(
    (now.getTime() - past.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutos atrás`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
  }
};

// Helper function to get month name in Portuguese
const getMonthName = (monthIndex: number) => {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return months[monthIndex];
};

interface Clinic {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  status: "active" | "inactive";
  logo: string | null;
  chiefSpecialistName?: string;
  chiefSpecialistEmail?: string;
  chiefSpecialistPhone?: string;
  chiefSpecialistSpecialization?: string;
  chiefSpecialistLicense?: string;
}

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "clinics" | "settings" | "profile"
  >("dashboard");

  // Real data states
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalClinics: 0,
    totalSpecialists: 0,
    totalPatients: 0,
    activeUsersToday: 0,
  });
  const [patientGrowthData, setPatientGrowthData] = useState<any[]>([]);
  const [clinicActivityData, setClinicActivityData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    logo: null as File | null,
    mobileLogo: null as File | null,
    chiefSpecialistName: "",
    chiefSpecialistEmail: "",
    chiefSpecialistPhone: "",
    chiefSpecialistSpecialization: "",
    chiefSpecialistLicense: "",
    chiefSpecialistPassword: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [mobileLogoPreview, setMobileLogoPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Visual Identity Settings State
  const [visualIdentity, setVisualIdentity] = useState({
    mainLogo: null as File | null,
    mobileLogo: null as File | null,
    loginLogo: null as File | null,
    pwaLogo: null as File | null,
    favicon: null as File | null,
    primaryColor: "#10B981",
    mainLogoPreview: "",
    mobileLogoPreview: "",
    loginLogoPreview: "",
    pwaLogoPreview: "",
    faviconPreview: "",
  });

  // System Information Settings State
  const [systemInfo, setSystemInfo] = useState({
    version: "v1.3.0",
    baseUrl: "https://app.clinicsys.com",
    termsUrl: "https://clinicsys.com/termos",
    maintenanceMode: false,
  });

  // Global Preferences Settings State
  const [globalPreferences, setGlobalPreferences] = useState({
    defaultTheme: "light",
    defaultLanguage: "pt-BR",
    pushNotifications: true,
    autoActivateClinics: false,
    individualBranding: true,
  });

  const itemsPerPage = 5;

  const navigate = useNavigate();

  // Load real data from Supabase
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Theme consistency
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      // Theme is already applied by ThemeToggle, just ensure consistency
      console.log("Theme changed to:", e.detail);
    };

    window.addEventListener("themeChange", handleThemeChange as EventListener);
    return () =>
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener,
      );
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);

      // Load clinics data
      await loadClinicsData();

      // Load dashboard statistics
      await loadDashboardStats();

      // Load chart data
      await loadChartData();

      // Load recent activities
      await loadRecentActivities();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadClinicsData = async () => {
    try {
      // Fetch clinics with their chief specialists
      const { data: clinicsData, error } = await supabase
        .from("clinics")
        .select(
          `
          id,
          name,
          email,
          phone,
          address,
          logo_url,
          mobile_logo_url,
          created_at,
          updated_at,
          user_profiles!inner(
            id,
            name,
            email,
            phone,
            role,
            specialization,
            license_number
          )
        `,
        )
        .eq("user_profiles.role", "chief_specialist");

      if (error) {
        console.error("Error fetching clinics:", error);
        return;
      }

      console.log("Clinics data from Supabase:", clinicsData);

      // Transform data to match interface
      const transformedClinics: Clinic[] =
        clinicsData?.map((clinic) => {
          // Extract city and state from address if possible
          const addressParts = clinic.address ? clinic.address.split(",") : [];
          const city =
            addressParts.length > 2
              ? addressParts[addressParts.length - 2].trim()
              : "";
          const state =
            addressParts.length > 1
              ? addressParts[addressParts.length - 1].trim()
              : "";

          // Get chief specialist data
          const chiefSpecialist = clinic.user_profiles?.[0];

          return {
            id: clinic.id,
            name: clinic.name || "Clínica sem nome",
            cnpj: "", // Not stored in current schema
            email: clinic.email || "",
            phone: clinic.phone || "",
            city: city,
            state: state,
            address: clinic.address || "",
            status: "active" as const, // Default to active since we don't have is_active field
            logo: clinic.logo_url,
            chiefSpecialistName: chiefSpecialist?.name || "",
            chiefSpecialistEmail: chiefSpecialist?.email || "",
            chiefSpecialistPhone: chiefSpecialist?.phone || "",
            chiefSpecialistSpecialization:
              chiefSpecialist?.specialization || "",
            chiefSpecialistLicense: chiefSpecialist?.license_number || "",
          };
        }) || [];

      console.log("Transformed clinics:", transformedClinics);
      setClinics(transformedClinics);
    } catch (error) {
      console.error("Error loading clinics:", error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Get total clinics
      const { count: clinicsCount } = await supabase
        .from("clinics")
        .select("*", { count: "exact", head: true });

      // Get total specialists
      const { count: specialistsCount } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["specialist", "chief_specialist"]);

      // Get total patients
      const { count: patientsCount } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "patient");

      // Get active users today (corrected date format)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: activeUsersCount } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_sign_in_at", todayISO);

      setDashboardStats({
        totalClinics: clinicsCount || 0,
        totalSpecialists: specialistsCount || 0,
        totalPatients: patientsCount || 0,
        activeUsersToday: activeUsersCount || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Set fallback values on error
      setDashboardStats({
        totalClinics: 0,
        totalSpecialists: 0,
        totalPatients: 0,
        activeUsersToday: 0,
      });
    }
  };

  const loadChartData = async () => {
    try {
      // Patient growth data - last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: patientsData } = await supabase
        .from("user_profiles")
        .select("created_at")
        .eq("role", "patient")
        .gte("created_at", sixMonthsAgo.toISOString());

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const currentDate = new Date();

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1,
        );
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[monthKey] = 0;
      }

      // Count patients by month
      patientsData?.forEach((patient) => {
        const date = new Date(patient.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey]++;
        }
      });

      // Transform to chart format
      const chartData = Object.entries(monthlyData).map(([monthKey, count]) => {
        const [year, month] = monthKey.split("-");
        return {
          month: getMonthName(parseInt(month) - 1),
          patients: count,
        };
      });

      setPatientGrowthData(chartData);

      // Clinic activity data - corrected query
      const { data: clinicsActivity, error: clinicsError } = await supabase
        .from("clinics")
        .select("name")
        .limit(5);

      if (clinicsError) {
        console.error("Error fetching clinics activity:", clinicsError);
      }

      const activityData =
        clinicsActivity?.map((clinic) => ({
          clinic: clinic.name,
          activity: Math.floor(Math.random() * 40) + 60, // Simulated activity data
        })) || [];

      setClinicActivityData(activityData);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Get recent user registrations
      const { data: recentUsers } = await supabase
        .from("user_profiles")
        .select("name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const activities =
        recentUsers?.map((user, index) => ({
          id: index + 1,
          icon:
            user.role === "specialist" || user.role === "chief_specialist"
              ? UserPlus
              : Users,
          description: `${user.role === "specialist" ? "Novo especialista" : user.role === "patient" ? "Novo paciente" : "Novo usuário"} ${user.name} se registrou`,
          time: formatTimeAgo(user.created_at),
        })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading recent activities:", error);
      // Fallback to empty array
      setRecentActivities([]);
    }
  };

  // Filter clinics based on search and status
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || clinic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered clinics
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClinics = filteredClinics.slice(startIndex, endIndex);

  // Reset to page 1 if current page is beyond available pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleCreateClinic = async () => {
    try {
      setIsUploading(true);

      // Validate required fields
      if (
        !formData.name ||
        !formData.cnpj ||
        !formData.email ||
        !formData.phone ||
        !formData.city ||
        !formData.state ||
        !formData.address ||
        !formData.chiefSpecialistName ||
        !formData.chiefSpecialistEmail ||
        !formData.chiefSpecialistPassword ||
        !formData.chiefSpecialistSpecialization
      ) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      if (formData.chiefSpecialistPassword.length < 6) {
        alert(
          "A senha do especialista chefe deve ter pelo menos 6 caracteres.",
        );
        return;
      }

      // Upload images to Supabase storage if they exist
      let logoUrl = null;
      let mobileLogoUrl = null;

      // Helper function to upload with fallback
      const uploadWithFallback = async (file: File, fileName: string) => {
        try {
          // Try to upload to app-images bucket first
          const { data, error } = await supabase.storage
            .from("app-images")
            .upload(fileName, file);

          if (error) {
            console.warn("Failed to upload to app-images bucket:", error);
            throw error;
          }
          return data;
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          throw uploadError;
        }
      };

      if (formData.logo) {
        try {
          const logoFileName = `${Date.now()}-${formData.logo.name}`;
          await uploadWithFallback(formData.logo, logoFileName);
          logoUrl = supabase.storage
            .from("app-images")
            .getPublicUrl(logoFileName).data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload do logo:", error);
          alert(
            "Aviso: Erro ao fazer upload do logo principal. A clínica será criada sem logo.",
          );
        }
      }

      if (formData.mobileLogo) {
        try {
          const mobileLogoFileName = `${Date.now()}-mobile-${formData.mobileLogo.name}`;
          await uploadWithFallback(formData.mobileLogo, mobileLogoFileName);
          mobileLogoUrl = supabase.storage
            .from("app-images")
            .getPublicUrl(mobileLogoFileName).data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload do logo mobile:", error);
          alert(
            "Aviso: Erro ao fazer upload do logo mobile. A clínica será criada sem logo mobile.",
          );
        }
      }

      // Create chief specialist first (mandatory)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.chiefSpecialistEmail,
        password: formData.chiefSpecialistPassword,
        options: {
          data: {
            name: formData.chiefSpecialistName,
            role: "chief_specialist",
          },
        },
      });

      if (authError) {
        console.error(
          "Erro ao criar usuário do especialista chefe:",
          authError,
        );
        alert(`Erro ao criar especialista chefe: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        alert("Erro: Não foi possível criar o usuário do especialista chefe.");
        return;
      }

      // Create clinic in Supabase
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .insert({
          name: formData.name,
          description: `Clínica ${formData.name}`,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          logo_url: logoUrl,
          mobile_logo_url: mobileLogoUrl,
        })
        .select()
        .single();

      if (clinicError) {
        console.error("Erro ao criar clínica:", clinicError);
        alert(`Erro ao criar clínica: ${clinicError.message}`);
        return;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: formData.chiefSpecialistEmail,
          name: formData.chiefSpecialistName,
          role: "chief_specialist",
          clinic_id: clinicData.id,
          phone: formData.chiefSpecialistPhone || null,
          specialization: formData.chiefSpecialistSpecialization,
          license_number: formData.chiefSpecialistLicense || null,
        });

      if (profileError) {
        console.error(
          "Erro ao criar perfil do especialista chefe:",
          profileError,
        );
        alert(`Erro ao criar perfil: ${profileError.message}`);
        return;
      }

      // Create specialist record
      const { error: specialistError } = await supabase
        .from("specialists")
        .insert({
          user_id: authData.user.id,
          clinic_id: clinicData.id,
          specialization: formData.chiefSpecialistSpecialization,
          license_number: formData.chiefSpecialistLicense || null,
          is_approved: true,
        });

      if (specialistError) {
        console.error(
          "Erro ao criar registro de especialista:",
          specialistError,
        );
        alert(`Erro ao criar especialista: ${specialistError.message}`);
        return;
      }

      // Reload clinics data to get the updated list
      await loadClinicsData();

      // Reload dashboard stats
      await loadDashboardStats();

      setIsCreateModalOpen(false);
      resetForm();
      alert("Clínica e especialista chefe criados com sucesso!");
    } catch (error) {
      console.error("Erro ao criar clínica:", error);
      alert("Erro inesperado ao criar clínica. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      cnpj: clinic.cnpj,
      email: clinic.email,
      phone: clinic.phone,
      city: clinic.city,
      state: clinic.state,
      address: clinic.address,
      logo: null,
      mobileLogo: null,
      chiefSpecialistName: clinic.chiefSpecialistName || "",
      chiefSpecialistEmail: clinic.chiefSpecialistEmail || "",
      chiefSpecialistPhone: clinic.chiefSpecialistPhone || "",
      chiefSpecialistSpecialization: clinic.chiefSpecialistSpecialization || "",
      chiefSpecialistLicense: clinic.chiefSpecialistLicense || "",
      chiefSpecialistPassword: "", // Don't pre-fill password for security
    });
  };

  const handleUpdateClinic = async () => {
    if (!editingClinic) return;

    try {
      setIsUploading(true);

      // Upload new logos if provided
      let logoUrl = null;
      let mobileLogoUrl = null;

      const uploadWithFallback = async (file: File, fileName: string) => {
        try {
          const { data, error } = await supabase.storage
            .from("app-images")
            .upload(fileName, file);

          if (error) {
            console.warn("Failed to upload to app-images bucket:", error);
            throw error;
          }
          return data;
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          throw uploadError;
        }
      };

      if (formData.logo) {
        try {
          const logoFileName = `${Date.now()}-${formData.logo.name}`;
          await uploadWithFallback(formData.logo, logoFileName);
          logoUrl = supabase.storage
            .from("app-images")
            .getPublicUrl(logoFileName).data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload do logo:", error);
          alert("Aviso: Erro ao fazer upload do logo principal.");
        }
      }

      if (formData.mobileLogo) {
        try {
          const mobileLogoFileName = `${Date.now()}-mobile-${formData.mobileLogo.name}`;
          await uploadWithFallback(formData.mobileLogo, mobileLogoFileName);
          mobileLogoUrl = supabase.storage
            .from("app-images")
            .getPublicUrl(mobileLogoFileName).data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload do logo mobile:", error);
          alert("Aviso: Erro ao fazer upload do logo mobile.");
        }
      }

      // Update clinic data
      const clinicUpdateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (logoUrl) clinicUpdateData.logo_url = logoUrl;
      if (mobileLogoUrl) clinicUpdateData.mobile_logo_url = mobileLogoUrl;

      const { error: clinicError } = await supabase
        .from("clinics")
        .update(clinicUpdateData)
        .eq("id", editingClinic.id);

      if (clinicError) {
        console.error("Error updating clinic:", clinicError);
        alert("Erro ao atualizar clínica. Tente novamente.");
        return;
      }

      // Update chief specialist data if provided
      if (
        formData.chiefSpecialistName ||
        formData.chiefSpecialistEmail ||
        formData.chiefSpecialistSpecialization
      ) {
        // Find the chief specialist for this clinic
        const { data: chiefSpecialist, error: findError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("clinic_id", editingClinic.id)
          .eq("role", "chief_specialist")
          .single();

        if (findError) {
          console.error("Error finding chief specialist:", findError);
        } else if (chiefSpecialist) {
          const specialistUpdateData: any = {
            name: formData.chiefSpecialistName,
            phone: formData.chiefSpecialistPhone || null,
            specialization: formData.chiefSpecialistSpecialization,
            license_number: formData.chiefSpecialistLicense || null,
          };

          // Only update email if it's different and provided
          if (
            formData.chiefSpecialistEmail &&
            formData.chiefSpecialistEmail !== editingClinic.chiefSpecialistEmail
          ) {
            specialistUpdateData.email = formData.chiefSpecialistEmail;
          }

          const { error: specialistError } = await supabase
            .from("user_profiles")
            .update(specialistUpdateData)
            .eq("id", chiefSpecialist.id);

          if (specialistError) {
            console.error("Error updating chief specialist:", specialistError);
            alert("Aviso: Erro ao atualizar dados do especialista chefe.");
          }
        }
      }

      // Reload clinics data
      await loadClinicsData();

      setEditingClinic(null);
      resetForm();
      alert("Clínica atualizada com sucesso!");
    } catch (error) {
      console.error("Error updating clinic:", error);
      alert("Erro inesperado ao atualizar clínica.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeactivateClinic = async (clinicId: number) => {
    try {
      const clinic = clinics.find((c) => c.id === clinicId);
      if (!clinic) return;

      // For now, just toggle the status locally since we don't have is_active field in schema
      const newStatus = clinic.status === "active" ? "inactive" : "active";

      // Update local state
      setClinics((prevClinics) =>
        prevClinics.map((c) =>
          c.id === clinicId ? { ...c, status: newStatus } : c,
        ),
      );

      alert(
        `Clínica ${newStatus === "active" ? "ativada" : "desativada"} com sucesso!`,
      );
    } catch (error) {
      console.error("Error updating clinic status:", error);
      alert("Erro inesperado ao alterar status da clínica.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      address: "",
      logo: null,
      mobileLogo: null,
      chiefSpecialistName: "",
      chiefSpecialistEmail: "",
      chiefSpecialistPhone: "",
      chiefSpecialistSpecialization: "",
      chiefSpecialistLicense: "",
      chiefSpecialistPassword: "",
    });
    setLogoPreview("");
    setMobileLogoPreview("");
  };

  const handleFileUpload = (file: File, type: "logo" | "mobileLogo") => {
    if (file.size > 2 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "logo") {
        setFormData((prev) => ({ ...prev, logo: file }));
        setLogoPreview(result);
      } else {
        setFormData((prev) => ({ ...prev, mobileLogo: file }));
        setMobileLogoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" as const },
    { icon: Building2, label: "Clínicas", view: "clinics" as const },
  ];

  const stats = [
    {
      title: "Total de Clínicas Ativas",
      value: isLoadingData ? "..." : dashboardStats.totalClinics.toString(),
      change: "Clínicas cadastradas",
      icon: Building2,
    },
    {
      title: "Total de Especialistas Registrados",
      value: isLoadingData ? "..." : dashboardStats.totalSpecialists.toString(),
      change: "Especialistas no sistema",
      icon: UserCheck,
    },
    {
      title: "Total de Pacientes no Sistema",
      value: isLoadingData ? "..." : dashboardStats.totalPatients.toString(),
      change: "Pacientes cadastrados",
      icon: Users,
    },
    {
      title: "Usuários Ativos Hoje",
      value: isLoadingData ? "..." : dashboardStats.activeUsersToday.toString(),
      change: "Acessos hoje",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar - Hidden on mobile */}
      <div
        className={`sidebar-fixed bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-foreground))] shadow-xl border-r border-border/50 backdrop-blur-md bg-opacity-80 hidden lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--sidebar-muted))]">
          <div className="flex items-center justify-center flex-1 pr-2">
            <div>
              <AppLogo
                size={sidebarCollapsed ? "sm" : "md"}
                type={sidebarCollapsed ? "mobile" : "main"}
              />
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex transition-transform duration-200 hover:scale-110"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="mt-6 px-3 flex-1 overflow-y-auto pb-16">
          {/* Added padding at bottom to prevent overlap with fixed logout button */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={index}
                onClick={() => item.view && setCurrentView(item.view)}
                className={`w-full flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"}`} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(var(--sidebar-muted))] mt-auto sticky bottom-0 bg-[hsl(var(--sidebar-bg))] backdrop-blur-md bg-opacity-80 space-y-3">
          <div className="flex items-center justify-end mb-2">
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))] ${
                  sidebarCollapsed ? "justify-center px-0" : "justify-start"
                }`}
                title={sidebarCollapsed ? user?.name : undefined}
              >
                <User className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"}`} />
                {!sidebarCollapsed && "Conta"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/settings?tab=preferences")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Preferências
              </DropdownMenuItem>
              {user?.role === "super_admin" && (
                <DropdownMenuItem
                  onClick={() => navigate("/settings?tab=system")}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-[hsl(var(--sidebar-muted))]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-[hsl(var(--sidebar-foreground))] opacity-70 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto dashboard-mobile-content p-4 sm:p-5 lg:p-6 pt-4 lg:pt-6 pb-24 lg:pb-6">
          {currentView === "dashboard" ? (
            <>
              {/* Admin Stats */}
              <div className="grid mobile-grid-compact sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={index}
                      className="supabase-card stats-card-mobile"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium mobile-text-compact">
                          {stat.title}
                        </CardTitle>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </CardHeader>
                      <CardContent className="mobile-card-spacing">
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-6 mb-6 lg:mb-8">
                {/* Patient Growth Chart */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Crescimento de Pacientes (6 meses)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 sm:h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={patientGrowthData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--card-foreground))",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="patients"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{
                              fill: "hsl(var(--primary))",
                              strokeWidth: 2,
                              r: 3,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Clinic Activity Chart */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Atividade por Clínica (última semana)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 sm:h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={clinicActivityData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="clinic"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--card-foreground))",
                            }}
                          />
                          <Bar
                            dataKey="activity"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <Card className="supabase-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Últimas Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                              {activity.description}
                            </p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : currentView === "clinics" ? (
            <>
              {/* Clinic Management Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 dashboard-mobile-header">
                <div className="mb-3 sm:mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Clínicas Cadastradas
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Gerencie todas as clínicas do sistema
                  </p>
                </div>
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Clínica
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Clínica *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Digite o nome da clínica"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ *</Label>
                          <Input
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cnpj: formatCNPJ(e.target.value),
                              })
                            }
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail Institucional *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="contato@clinica.com.br"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: formatPhone(e.target.value),
                              })
                            }
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            placeholder="Digite a cidade"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                state: e.target.value,
                              })
                            }
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço Completo *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Rua, número, bairro, CEP"
                          rows={3}
                        />
                      </div>
                      {/* Logo Principal */}
                      <div className="space-y-2">
                        <Label htmlFor="logo">Logo Principal</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          {logoPreview ? (
                            <div className="space-y-2">
                              <img
                                src={logoPreview}
                                alt="Preview"
                                className="h-20 w-auto mx-auto object-contain"
                              />
                              <div className="flex justify-center space-x-2">
                                <ImageGallery
                                  bucketId="app-images"
                                  onImageSelect={(imageUrl) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      logo: null,
                                    }));
                                    setLogoPreview(imageUrl);
                                  }}
                                  trigger={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                    >
                                      Galeria
                                    </Button>
                                  }
                                  allowedTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/jpg",
                                  ]}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("logo-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      logo: null,
                                    }));
                                    setLogoPreview("");
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecione da galeria ou faça upload
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PNG, JPG até 2MB
                              </p>
                              <div className="flex justify-center space-x-2 mt-2">
                                <ImageGallery
                                  bucketId="app-images"
                                  onImageSelect={(imageUrl) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      logo: null,
                                    }));
                                    setLogoPreview(imageUrl);
                                  }}
                                  trigger={
                                    <Button type="button" variant="outline">
                                      Galeria
                                    </Button>
                                  }
                                  allowedTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/jpg",
                                  ]}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById("logo-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                              </div>
                            </div>
                          )}
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "logo");
                            }}
                          />
                        </div>
                      </div>

                      {/* Logo Mobile */}
                      <div className="space-y-2">
                        <Label htmlFor="mobile-logo">
                          Logo Mobile (Opcional)
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          {mobileLogoPreview ? (
                            <div className="space-y-2">
                              <img
                                src={mobileLogoPreview}
                                alt="Preview Mobile"
                                className="h-16 w-auto mx-auto object-contain"
                              />
                              <div className="flex justify-center space-x-2">
                                <ImageGallery
                                  bucketId="app-images"
                                  onImageSelect={(imageUrl) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      mobileLogo: null,
                                    }));
                                    setMobileLogoPreview(imageUrl);
                                  }}
                                  trigger={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                    >
                                      Galeria
                                    </Button>
                                  }
                                  allowedTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/jpg",
                                  ]}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("mobile-logo-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      mobileLogo: null,
                                    }));
                                    setMobileLogoPreview("");
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecione da galeria ou faça upload
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PNG, JPG até 2MB
                              </p>
                              <div className="flex justify-center space-x-2 mt-2">
                                <ImageGallery
                                  bucketId="app-images"
                                  onImageSelect={(imageUrl) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      mobileLogo: null,
                                    }));
                                    setMobileLogoPreview(imageUrl);
                                  }}
                                  trigger={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                    >
                                      Galeria
                                    </Button>
                                  }
                                  allowedTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/jpg",
                                  ]}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("mobile-logo-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                              </div>
                            </div>
                          )}
                          <input
                            id="mobile-logo-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "mobileLogo");
                            }}
                          />
                        </div>
                      </div>

                      {/* Especialista Chefe Section */}
                      <div className="col-span-2 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">
                          Especialista Chefe (Obrigatório)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="chief-name">Nome Completo *</Label>
                            <Input
                              id="chief-name"
                              value={formData.chiefSpecialistName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistName: e.target.value,
                                })
                              }
                              placeholder="Nome do especialista chefe"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chief-email">E-mail *</Label>
                            <Input
                              id="chief-email"
                              type="email"
                              value={formData.chiefSpecialistEmail}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistEmail: e.target.value,
                                })
                              }
                              placeholder="email@especialista.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chief-password">Senha *</Label>
                            <Input
                              id="chief-password"
                              type="password"
                              value={formData.chiefSpecialistPassword}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistPassword: e.target.value,
                                })
                              }
                              placeholder="Senha do especialista chefe"
                              required
                              minLength={6}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chief-phone">
                              Telefone (Opcional)
                            </Label>
                            <Input
                              id="chief-phone"
                              value={formData.chiefSpecialistPhone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistPhone: formatPhone(
                                    e.target.value,
                                  ),
                                })
                              }
                              placeholder="(00) 00000-0000"
                              maxLength={15}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chief-specialization">
                              Especialização *
                            </Label>
                            <Input
                              id="chief-specialization"
                              value={formData.chiefSpecialistSpecialization}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistSpecialization: e.target.value,
                                })
                              }
                              placeholder="Ex: Psicologia Clínica"
                              required
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="chief-license">
                              Número do Registro Profissional (Opcional)
                            </Label>
                            <Input
                              id="chief-license"
                              value={formData.chiefSpecialistLicense}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  chiefSpecialistLicense: e.target.value,
                                })
                              }
                              placeholder="Ex: CRP 01/12345"
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Importante:</strong> O especialista chefe é
                            obrigatório para todas as clínicas. Ele será criado
                            automaticamente como usuário do sistema com acesso
                            completo à gestão da clínica.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateClinic}
                        className="bg-primary hover:bg-primary/90"
                        disabled={
                          isUploading ||
                          !formData.name ||
                          !formData.cnpj ||
                          !formData.email ||
                          !formData.phone ||
                          !formData.city ||
                          !formData.state ||
                          !formData.address ||
                          !formData.chiefSpecialistName ||
                          !formData.chiefSpecialistEmail ||
                          !formData.chiefSpecialistPassword ||
                          !formData.chiefSpecialistSpecialization ||
                          formData.chiefSpecialistPassword.length < 6
                        }
                      >
                        {isUploading ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters and Search */}
              <Card className="supabase-card mb-4 sm:mb-6">
                <CardContent className="mobile-card-spacing p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, cidade ou estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: "all" | "active" | "inactive") =>
                        setStatusFilter(value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="active">Ativas</SelectItem>
                        <SelectItem value="inactive">Inativas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Clinics Table */}
              <Card className="supabase-card">
                <CardContent className="p-0">
                  {filteredClinics.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm || statusFilter !== "all"
                          ? "Nenhuma clínica encontrada"
                          : "Nenhuma clínica cadastrada"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Tente ajustar os filtros de busca"
                          : "Comece cadastrando a primeira clínica do sistema"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Cadastrar Primeira Clínica
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mobile-table-container overflow-x-auto max-w-full">
                        <Table
                          className="supabase-table"
                          style={{ minWidth: "350px", width: "100%" }}
                        >
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[100px] mobile-table-cell text-foreground">
                                Nome
                              </TableHead>
                              <TableHead className="min-w-[60px] mobile-table-cell hidden md:table-cell text-foreground">
                                Cidade
                              </TableHead>
                              <TableHead className="min-w-[40px] mobile-table-cell hidden md:table-cell text-foreground">
                                Estado
                              </TableHead>
                              <TableHead className="min-w-[60px] mobile-table-cell text-foreground">
                                Status
                              </TableHead>
                              <TableHead className="text-right min-w-[70px] mobile-table-cell text-foreground">
                                Ações
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedClinics.map((clinic) => (
                              <TableRow key={clinic.id}>
                                <TableCell className="font-medium mobile-table-cell">
                                  <div>
                                    <div className="font-semibold text-foreground whitespace-nowrap text-xs sm:text-sm">
                                      {clinic.name}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                      {clinic.email}
                                    </div>
                                    {clinic.chiefSpecialistName && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        Chefe: {clinic.chiefSpecialistName}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap mobile-table-cell text-xs sm:text-sm hidden md:table-cell text-foreground">
                                  {clinic.city}
                                </TableCell>
                                <TableCell className="whitespace-nowrap mobile-table-cell text-xs sm:text-sm hidden md:table-cell text-foreground">
                                  {clinic.state}
                                </TableCell>
                                <TableCell className="mobile-table-cell">
                                  <Badge
                                    variant={
                                      clinic.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      clinic.status === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 whitespace-nowrap text-xs"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 whitespace-nowrap text-xs"
                                    }
                                  >
                                    {clinic.status === "active"
                                      ? "Ativa"
                                      : "Inativa"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right mobile-table-cell">
                                  <div className="flex justify-end space-x-1 sm:space-x-2 whitespace-nowrap">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 sm:h-9 sm:w-9 md:hidden"
                                      title="Ver detalhes"
                                    >
                                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Dialog
                                      open={editingClinic?.id === clinic.id}
                                      onOpenChange={(open) =>
                                        !open && setEditingClinic(null)
                                      }
                                    >
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 hidden md:inline-flex"
                                          onClick={() =>
                                            handleEditClinic(clinic)
                                          }
                                        >
                                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Editar Clínica
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-name">
                                                Nome da Clínica *
                                              </Label>
                                              <Input
                                                id="edit-name"
                                                value={formData.name}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                  })
                                                }
                                                placeholder="Digite o nome da clínica"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-cnpj">
                                                CNPJ *
                                              </Label>
                                              <Input
                                                id="edit-cnpj"
                                                value={formData.cnpj}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    cnpj: formatCNPJ(
                                                      e.target.value,
                                                    ),
                                                  })
                                                }
                                                placeholder="00.000.000/0000-00"
                                                maxLength={18}
                                              />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-email">
                                                E-mail Institucional *
                                              </Label>
                                              <Input
                                                id="edit-email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                  })
                                                }
                                                placeholder="contato@clinica.com.br"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-phone">
                                                Telefone *
                                              </Label>
                                              <Input
                                                id="edit-phone"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    phone: formatPhone(
                                                      e.target.value,
                                                    ),
                                                  })
                                                }
                                                placeholder="(00) 00000-0000"
                                                maxLength={15}
                                              />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-city">
                                                Cidade *
                                              </Label>
                                              <Input
                                                id="edit-city"
                                                value={formData.city}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    city: e.target.value,
                                                  })
                                                }
                                                placeholder="Digite a cidade"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-state">
                                                Estado *
                                              </Label>
                                              <Input
                                                id="edit-state"
                                                value={formData.state}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    state: e.target.value,
                                                  })
                                                }
                                                placeholder="SP"
                                                maxLength={2}
                                              />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-address">
                                              Endereço Completo *
                                            </Label>
                                            <Textarea
                                              id="edit-address"
                                              value={formData.address}
                                              onChange={(e) =>
                                                setFormData({
                                                  ...formData,
                                                  address: e.target.value,
                                                })
                                              }
                                              placeholder="Rua, número, bairro, CEP"
                                              rows={3}
                                            />
                                          </div>

                                          {/* Especialista Chefe Section */}
                                          <div className="col-span-2 border-t pt-6">
                                            <h3 className="text-lg font-semibold mb-4 text-foreground">
                                              Dados do Especialista Chefe
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-chief-name">
                                                  Nome Completo
                                                </Label>
                                                <Input
                                                  id="edit-chief-name"
                                                  value={
                                                    formData.chiefSpecialistName
                                                  }
                                                  onChange={(e) =>
                                                    setFormData({
                                                      ...formData,
                                                      chiefSpecialistName:
                                                        e.target.value,
                                                    })
                                                  }
                                                  placeholder="Nome do especialista chefe"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-chief-email">
                                                  E-mail
                                                </Label>
                                                <Input
                                                  id="edit-chief-email"
                                                  type="email"
                                                  value={
                                                    formData.chiefSpecialistEmail
                                                  }
                                                  onChange={(e) =>
                                                    setFormData({
                                                      ...formData,
                                                      chiefSpecialistEmail:
                                                        e.target.value,
                                                    })
                                                  }
                                                  placeholder="email@especialista.com"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-chief-phone">
                                                  Telefone
                                                </Label>
                                                <Input
                                                  id="edit-chief-phone"
                                                  value={
                                                    formData.chiefSpecialistPhone
                                                  }
                                                  onChange={(e) =>
                                                    setFormData({
                                                      ...formData,
                                                      chiefSpecialistPhone:
                                                        formatPhone(
                                                          e.target.value,
                                                        ),
                                                    })
                                                  }
                                                  placeholder="(00) 00000-0000"
                                                  maxLength={15}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-chief-specialization">
                                                  Especialização
                                                </Label>
                                                <Input
                                                  id="edit-chief-specialization"
                                                  value={
                                                    formData.chiefSpecialistSpecialization
                                                  }
                                                  onChange={(e) =>
                                                    setFormData({
                                                      ...formData,
                                                      chiefSpecialistSpecialization:
                                                        e.target.value,
                                                    })
                                                  }
                                                  placeholder="Ex: Psicologia Clínica"
                                                />
                                              </div>
                                              <div className="space-y-2 col-span-2">
                                                <Label htmlFor="edit-chief-license">
                                                  Número do Registro
                                                  Profissional
                                                </Label>
                                                <Input
                                                  id="edit-chief-license"
                                                  value={
                                                    formData.chiefSpecialistLicense
                                                  }
                                                  onChange={(e) =>
                                                    setFormData({
                                                      ...formData,
                                                      chiefSpecialistLicense:
                                                        e.target.value,
                                                    })
                                                  }
                                                  placeholder="Ex: CRP 01/12345"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setEditingClinic(null);
                                              resetForm();
                                            }}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            onClick={handleUpdateClinic}
                                            className="bg-primary hover:bg-primary/90"
                                            disabled={
                                              isUploading ||
                                              !formData.name ||
                                              !formData.cnpj ||
                                              !formData.email ||
                                              !formData.phone ||
                                              !formData.city ||
                                              !formData.state ||
                                              !formData.address
                                            }
                                          >
                                            {isUploading
                                              ? "Salvando..."
                                              : "Salvar Alterações"}
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hidden md:inline-flex"
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            {clinic.status === "active"
                                              ? "Desativar"
                                              : "Ativar"}{" "}
                                            Clínica
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja{" "}
                                            {clinic.status === "active"
                                              ? "desativar"
                                              : "ativar"}{" "}
                                            a clínica &quot;{clinic.name}&quot;?
                                            {clinic.status === "active" &&
                                              " Esta ação impedirá que a clínica acesse o sistema."}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeactivateClinic(clinic.id)
                                            }
                                            className={
                                              clinic.status === "active"
                                                ? "bg-red-600 hover:bg-red-700 text-white"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                            }
                                          >
                                            {clinic.status === "active"
                                              ? "Desativar"
                                              : "Ativar"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 p-4 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* General Settings */}
              <div className="flex flex-col mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Configurações Gerais do Sistema
                </h2>
                <p className="text-muted-foreground">
                  Personalize a identidade visual e configure as preferências
                  globais da plataforma
                </p>
              </div>

              {/* Visual Identity Section */}
              <Card className="mb-8 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Identidade Visual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Logo Upload */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="main-logo"
                        className="text-base font-medium"
                      >
                        Logo Principal
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {/* Logo Preview Area */}
                        <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                          {visualIdentity.mainLogoPreview ? (
                            <img
                              src={visualIdentity.mainLogoPreview}
                              alt="Logo principal"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <label htmlFor="main-logo-upload">
                            <Button
                              variant="outline"
                              className="mr-2"
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById("main-logo-upload")
                                  ?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Escolher arquivo
                            </Button>
                            <input
                              id="main-logo-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert("O arquivo deve ter no máximo 2MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    setVisualIdentity((prev) => ({
                                      ...prev,
                                      mainLogo: file,
                                      mainLogoPreview: result,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setVisualIdentity((prev) => ({
                                ...prev,
                                mainLogo: null,
                                mainLogoPreview: "",
                              }));
                            }}
                            disabled={!visualIdentity.mainLogoPreview}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG ou SVG (máx. 2MB)
                        </p>
                      </div>
                    </div>

                    {/* Mobile Logo Upload */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="mobile-logo"
                        className="text-base font-medium"
                      >
                        Logo Mobile
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {/* Logo Preview Area */}
                        <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                          {visualIdentity.mobileLogoPreview ? (
                            <img
                              src={visualIdentity.mobileLogoPreview}
                              alt="Logo mobile"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <label htmlFor="mobile-logo-upload">
                            <Button
                              variant="outline"
                              className="mr-2"
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById("mobile-logo-upload")
                                  ?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Escolher arquivo
                            </Button>
                            <input
                              id="mobile-logo-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 1 * 1024 * 1024) {
                                    alert("O arquivo deve ter no máximo 1MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    setVisualIdentity((prev) => ({
                                      ...prev,
                                      mobileLogo: file,
                                      mobileLogoPreview: result,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setVisualIdentity((prev) => ({
                                ...prev,
                                mobileLogo: null,
                                mobileLogoPreview: "",
                              }));
                            }}
                            disabled={!visualIdentity.mobileLogoPreview}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Versão reduzida ou ícone (máx. 1MB)
                        </p>
                      </div>
                    </div>

                    {/* Login Logo Upload */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="login-logo"
                        className="text-base font-medium"
                      >
                        Logo da Tela de Login
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {/* Logo Preview Area */}
                        <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                          {visualIdentity.loginLogoPreview ? (
                            <img
                              src={visualIdentity.loginLogoPreview}
                              alt="Logo da tela de login"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <label htmlFor="login-logo-upload">
                            <Button
                              variant="outline"
                              className="mr-2"
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById("login-logo-upload")
                                  ?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Escolher arquivo
                            </Button>
                            <input
                              id="login-logo-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert("O arquivo deve ter no máximo 2MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    setVisualIdentity((prev) => ({
                                      ...prev,
                                      loginLogo: file,
                                      loginLogoPreview: result,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setVisualIdentity((prev) => ({
                                ...prev,
                                loginLogo: null,
                                loginLogoPreview: "",
                              }));
                            }}
                            disabled={!visualIdentity.loginLogoPreview}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Logo específico para a tela de login (máx. 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Favicon Upload */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="favicon"
                        className="text-base font-medium"
                      >
                        Favicon
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {/* Favicon Preview Area */}
                        <div className="h-16 flex items-center justify-center mb-4 bg-muted rounded-md">
                          {visualIdentity.faviconPreview ? (
                            <img
                              src={visualIdentity.faviconPreview}
                              alt="Favicon"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted-foreground/20 rounded-sm flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <label htmlFor="favicon-upload">
                            <Button
                              variant="outline"
                              className="mr-2"
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById("favicon-upload")
                                  ?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Escolher arquivo
                            </Button>
                            <input
                              id="favicon-upload"
                              type="file"
                              accept="image/png,image/x-icon"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    setVisualIdentity((prev) => ({
                                      ...prev,
                                      favicon: file,
                                      faviconPreview: result,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setVisualIdentity((prev) => ({
                                ...prev,
                                favicon: null,
                                faviconPreview: "",
                              }));
                            }}
                            disabled={!visualIdentity.faviconPreview}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG ou ICO (16x16 ou 32x32)
                        </p>
                      </div>
                    </div>

                    {/* Primary Color */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="primary-color"
                        className="text-base font-medium"
                      >
                        Cor Primária
                      </Label>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-md border border-border"
                          style={{
                            backgroundColor: visualIdentity.primaryColor,
                          }}
                        />
                        <Input
                          id="primary-color"
                          type="text"
                          placeholder="#10B981"
                          value={visualIdentity.primaryColor}
                          onChange={(e) => {
                            // Basic validation for hex color
                            const value = e.target.value;
                            if (
                              value.match(/^#([0-9A-F]{3}){1,2}$/i) ||
                              value === "#" ||
                              value === ""
                            ) {
                              setVisualIdentity((prev) => ({
                                ...prev,
                                primaryColor: value || "#10B981",
                              }));
                            }
                          }}
                          className="max-w-[150px]"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Create a color input element and trigger it
                            const input = document.createElement("input");
                            input.type = "color";
                            input.value = visualIdentity.primaryColor;
                            input.addEventListener("input", (e) => {
                              const target = e.target as HTMLInputElement;
                              setVisualIdentity((prev) => ({
                                ...prev,
                                primaryColor: target.value,
                              }));
                            });
                            input.click();
                          }}
                        >
                          Escolher
                        </Button>
                      </div>
                      <div className="flex mt-4">
                        <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 border border-border text-foreground flex items-center justify-center text-xs">
                          50
                        </div>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          100
                        </div>
                        <div className="w-8 h-8 bg-green-200 dark:bg-green-700/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          200
                        </div>
                        <div className="w-8 h-8 bg-green-300 dark:bg-green-600/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          300
                        </div>
                        <div className="w-8 h-8 bg-green-400 dark:bg-green-500/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          400
                        </div>
                        <div className="w-8 h-8 bg-green-500 dark:bg-green-400/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          500
                        </div>
                        <div className="w-8 h-8 bg-green-600 dark:bg-green-300/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          600
                        </div>
                        <div className="w-8 h-8 bg-green-700 dark:bg-green-200/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          700
                        </div>
                        <div className="w-8 h-8 bg-green-800 dark:bg-green-100/30 border-t border-b border-border text-foreground flex items-center justify-center text-xs">
                          800
                        </div>
                        <div className="w-8 h-8 rounded-r-md bg-green-900 dark:bg-green-50/30 border border-border text-foreground flex items-center justify-center text-xs">
                          900
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={async () => {
                        try {
                          // Save visual identity settings
                          console.log(
                            "Salvando configurações de identidade visual:",
                            visualIdentity,
                          );

                          // Upload images to storage if they exist
                          let mainLogoUrl = null;
                          let mobileLogoUrl = null;
                          let loginLogoUrl = null;
                          let faviconUrl = null;

                          // Helper function to upload files
                          const uploadFile = async (file, name) => {
                            if (!file) return null;
                            const fileName = `${Date.now()}-${name}-${file.name}`;
                            const { data, error } = await supabase.storage
                              .from("app-assets")
                              .upload(fileName, file);

                            if (error) {
                              console.error(`Error uploading ${name}:`, error);
                              throw error;
                            }

                            return supabase.storage
                              .from("app-assets")
                              .getPublicUrl(fileName).data.publicUrl;
                          };

                          // Upload all files in parallel
                          if (visualIdentity.mainLogo) {
                            mainLogoUrl = await uploadFile(
                              visualIdentity.mainLogo,
                              "main-logo",
                            );
                          }

                          if (visualIdentity.mobileLogo) {
                            mobileLogoUrl = await uploadFile(
                              visualIdentity.mobileLogo,
                              "mobile-logo",
                            );
                          }

                          if (visualIdentity.loginLogo) {
                            loginLogoUrl = await uploadFile(
                              visualIdentity.loginLogo,
                              "login-logo",
                            );
                          }

                          if (visualIdentity.favicon) {
                            faviconUrl = await uploadFile(
                              visualIdentity.favicon,
                              "favicon",
                            );
                          }

                          // Update app_settings table
                          const { error: updateError } = await supabase
                            .from("app_settings")
                            .upsert(
                              {
                                id: "global",
                                logo_url: mainLogoUrl || undefined,
                                mobile_logo_url: mobileLogoUrl || undefined,
                                login_logo_url: loginLogoUrl || undefined,
                                favicon_url: faviconUrl || undefined,
                                updated_at: new Date().toISOString(),
                              },
                              { onConflict: "id" },
                            );

                          if (updateError) {
                            console.error(
                              "Error updating app settings:",
                              updateError,
                            );
                            alert(
                              "Erro ao salvar configurações. Tente novamente.",
                            );
                            return;
                          }

                          alert(
                            "Configurações de identidade visual salvas com sucesso!",
                          );
                        } catch (error) {
                          console.error(
                            "Error saving visual identity settings:",
                            error,
                          );
                          alert(
                            "Erro ao salvar configurações. Tente novamente.",
                          );
                        }
                      }}
                    >
                      Salvar alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Information Section */}
              <Card className="mb-8 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Version */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="system-version"
                        className="text-base font-medium"
                      >
                        Versão do Sistema
                      </Label>
                      <Input
                        id="system-version"
                        value={systemInfo.version}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    {/* Base URL */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="base-url"
                        className="text-base font-medium"
                      >
                        URL Base do Sistema
                      </Label>
                      <Input
                        id="base-url"
                        placeholder="https://app.clinicsys.com"
                        value={systemInfo.baseUrl}
                        onChange={(e) =>
                          setSystemInfo((prev) => ({
                            ...prev,
                            baseUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Terms URL */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="terms-url"
                      className="text-base font-medium"
                    >
                      URL de Termos de Uso e Privacidade
                    </Label>
                    <Input
                      id="terms-url"
                      placeholder="https://clinicsys.com/termos"
                      value={systemInfo.termsUrl}
                      onChange={(e) =>
                        setSystemInfo((prev) => ({
                          ...prev,
                          termsUrl: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h3 className="text-base font-medium text-foreground">
                        Modo de Manutenção
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ativa uma mensagem de manutenção para todos os usuários
                      </p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={systemInfo.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSystemInfo((prev) => ({
                          ...prev,
                          maintenanceMode: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Save system information settings
                        console.log(
                          "Salvando informações do sistema:",
                          systemInfo,
                        );

                        // In a real app, this would send the data to an API
                        // For now, just show a success message
                        alert("Informações do sistema salvas com sucesso!");
                      }}
                    >
                      Salvar alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Global Preferences Section */}
              <Card className="mb-8 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Preferências Globais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Default Theme */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Tema Padrão</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="theme-light"
                          name="default-theme"
                          className="h-4 w-4 text-primary"
                          checked={globalPreferences.defaultTheme === "light"}
                          onChange={() =>
                            setGlobalPreferences((prev) => ({
                              ...prev,
                              defaultTheme: "light",
                            }))
                          }
                        />
                        <Label
                          htmlFor="theme-light"
                          className="text-sm font-normal"
                        >
                          Claro
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="theme-dark"
                          name="default-theme"
                          className="h-4 w-4 text-primary"
                          checked={globalPreferences.defaultTheme === "dark"}
                          onChange={() =>
                            setGlobalPreferences((prev) => ({
                              ...prev,
                              defaultTheme: "dark",
                            }))
                          }
                        />
                        <Label
                          htmlFor="theme-dark"
                          className="text-sm font-normal"
                        >
                          Escuro
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="theme-auto"
                          name="default-theme"
                          className="h-4 w-4 text-primary"
                          checked={globalPreferences.defaultTheme === "auto"}
                          onChange={() =>
                            setGlobalPreferences((prev) => ({
                              ...prev,
                              defaultTheme: "auto",
                            }))
                          }
                        />
                        <Label
                          htmlFor="theme-auto"
                          className="text-sm font-normal"
                        >
                          Automático (SO)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Default Language */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="default-language"
                      className="text-base font-medium"
                    >
                      Idioma Padrão
                    </Label>
                    <Select
                      value={globalPreferences.defaultLanguage}
                      onValueChange={(value) =>
                        setGlobalPreferences((prev) => ({
                          ...prev,
                          defaultLanguage: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">
                          Português (Brasil)
                        </SelectItem>
                        <SelectItem value="en-US" disabled>
                          English (US) - Em breve
                        </SelectItem>
                        <SelectItem value="es-ES" disabled>
                          Español - Em breve
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-foreground">
                          Notificações push ativas por padrão
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ativa notificações push para novos usuários
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={globalPreferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setGlobalPreferences((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-foreground">
                          Ativar novos cadastros de clínicas automaticamente
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Novas clínicas ficam ativas sem aprovação manual
                        </p>
                      </div>
                      <Switch
                        id="auto-activate-clinics"
                        checked={globalPreferences.autoActivateClinics}
                        onCheckedChange={(checked) =>
                          setGlobalPreferences((prev) => ({
                            ...prev,
                            autoActivateClinics: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-foreground">
                          Permitir branding individual por clínica
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cada clínica pode personalizar sua própria marca
                        </p>
                      </div>
                      <Switch
                        id="individual-branding"
                        checked={globalPreferences.individualBranding}
                        onCheckedChange={(checked) =>
                          setGlobalPreferences((prev) => ({
                            ...prev,
                            individualBranding: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                      onClick={() => {
                        // Save global preferences settings
                        console.log(
                          "Salvando preferências globais:",
                          globalPreferences,
                        );

                        // In a real app, this would send the data to an API
                        // For now, just show a success message
                        alert("Preferências globais salvas com sucesso!");
                      }}
                    >
                      Salvar Todas as Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border/50 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center justify-around py-2 px-4">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === "dashboard"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView("clinics")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === "clinics"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-xs mt-1">Clínicas</span>
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-background border-l border-border/50 shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
            <span className="text-lg font-semibold">Super Admin</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="p-4 space-y-2">
            <div className="border-t border-border/50 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggle />
              </div>

              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
              >
                <User className="h-5 w-5 mr-3" />
                Perfil
              </button>
              <button
                onClick={() => navigate("/settings?tab=preferences")}
                className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
              >
                <Settings className="h-5 w-5 mr-3" />
                Preferências
              </button>
              {user?.role === "super_admin" && (
                <button
                  onClick={() => navigate("/settings?tab=system")}
                  className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
                >
                  <Palette className="h-5 w-5 mr-3" />
                  Sistema
                </button>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
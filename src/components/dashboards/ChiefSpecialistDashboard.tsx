import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ImageGallery from "@/components/ImageGallery";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Settings,
  Palette,
  Upload,
  Trash2,
  Save,
  ArrowLeft,
  GitBranch,
  User,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  TrendingUp,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Activity,
  MessageSquare,
  Workflow,
  FileText,
  Shield,
  Menu,
  LogOut,
  Plus,
  Edit,
  Search,
  Filter,
  Clock,
  Send,
  Eye,
  Download,
  BookOpen,
  Image,
  Video,
  FileImage,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays,
  UserPlus,
  Target,
  Timer,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SpecialistDashboard from "./SpecialistDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { FlowBuilder } from "@/components/FlowBuilder";
import AppLogo from "@/components/auth/AppLogo";
import ThemeToggle from "@/components/auth/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

// Chief Specialist Dashboard extends the Specialist Dashboard
// with additional clinic administration features
const ChiefSpecialistDashboard = () => {
  const { hasPermission, user, logout } = useAuth();
  const [showClinicAdmin, setShowClinicAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    specialists: [],
    appointments: [],
    tips: [],
    libraryItems: [],
    stats: {
      totalPatients: 0,
      activePatients: 0,
      weeklyAppointments: 0,
      monthlyRevenue: 0,
      totalSpecialists: 0,
      clinicAppointments: 0,
      patientEngagement: 0,
      flowsCreated: 0,
      tipsSent: 0,
    },
  });

  // State for team management
  const [isAddSpecialistModalOpen, setIsAddSpecialistModalOpen] =
    useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isViewTeamModalOpen, setIsViewTeamModalOpen] = useState(false);

  // State for different views
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newTip, setNewTip] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [isCreateTipModalOpen, setIsCreateTipModalOpen] = useState(false);

  // New state for enhanced tip functionality
  const [isEditTipModalOpen, setIsEditTipModalOpen] = useState(false);
  const [isAssignTipModalOpen, setIsAssignTipModalOpen] = useState(false);
  const [isScheduleTipModalOpen, setIsScheduleTipModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [selectedTipForAssign, setSelectedTipForAssign] = useState(null);
  const [selectedTipForSchedule, setSelectedTipForSchedule] = useState(null);
  const [assignTipData, setAssignTipData] = useState({
    selectedPatients: [],
    sendNow: true,
  });
  const [scheduleTipData, setScheduleTipData] = useState({
    scheduleDate: "",
    scheduleTime: "",
    selectedPatients: [],
  });

  // State for patient profile and edit modals
  const [isViewPatientProfileOpen, setIsViewPatientProfileOpen] =
    useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatientData, setEditPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    assignedSpecialist: "",
  });

  // State for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] =
    useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: "",
    time: "",
    type: "Consulta",
    duration: 60,
    notes: "",
  });
  const [clinicSettings, setClinicSettings] = useState({
    name: "Clínica Bem-Estar",
    description: "Especializada em saúde mental e bem-estar",
    address: "Rua das Flores, 123 - Centro",
    phone: "(11) 99999-9999",
    email: "contato@clinicabemestar.com",
    website: "https://clinicabemestar.com",
    webLogo: null as File | null,
    mobileLogo: null as File | null,
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    webLogoPreview: "",
    mobileLogoPreview: "",
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
    },
    preferences: {
      defaultTheme: "light",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      autoBackup: true,
      patientDataRetention: "5", // years
    },
  });

  // Chief specialists always have clinic administration permissions
  // This is just for logging purposes
  const canManageClinic = true;
  const isChiefSpecialist = user?.role === "chief_specialist";

  const menuItems = [
    { icon: UserCheck, label: "Dashboard", view: "dashboard" as const },
    { icon: Users, label: "Meus Pacientes", view: "patients" as const },
    { icon: Calendar, label: "Agenda", view: "schedule" as const },
    { icon: MessageSquare, label: "Dicas Diárias", view: "tips" as const },
    { icon: FileText, label: "Biblioteca", view: "library" as const },
    {
      icon: Shield,
      label: "Administração",
      view: "administration" as const,
    },
  ];

  console.log("Chief Specialist Dashboard - canManageClinic:", canManageClinic);
  console.log("User role:", useAuth().user?.role);

  // Fetch real data from Supabase
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch patients assigned to this specialist or clinic
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select(
          `
          *,
          user_profiles!patients_user_id_fkey(
            id,
            name,
            email,
            avatar_url
          )
        `,
        )
        .eq("clinic_id", user.clinicId || "");

      if (patientsError) {
        console.error("Error fetching patients:", patientsError);
      }

      // Fetch flows created by this user
      const { data: flows, error: flowsError } = await supabase
        .from("flows")
        .select("*")
        .eq("created_by", user.id);

      if (flowsError) {
        console.error("Error fetching flows:", flowsError);
      }

      // Fetch specialists in the same clinic with their user profiles
      const { data: specialists, error: specialistsError } = await supabase
        .from("specialists")
        .select(
          `
          *,
          user_profiles!specialists_user_id_fkey(
            id,
            name,
            email,
            role,
            avatar_url,
            phone,
            is_active
          )
        `,
        )
        .eq("clinic_id", user.clinicId || "");

      if (specialistsError) {
        console.error("Error fetching specialists:", specialistsError);
      }

      // Count patients per specialist
      const specialistsWithPatientCount = await Promise.all(
        (specialists || []).map(async (specialist) => {
          const { count, error: countError } = await supabase
            .from("patients")
            .select("id", { count: "exact" })
            .eq("assigned_specialist", specialist.id);

          if (countError) {
            console.error(
              "Error counting patients for specialist:",
              countError,
            );
            return { ...specialist, patientCount: 0 };
          }

          return { ...specialist, patientCount: count || 0 };
        }),
      );

      // Fetch flow assignments for statistics
      const { data: flowAssignments, error: assignmentsError } = await supabase
        .from("flow_assignments")
        .select("*")
        .eq("assigned_by", user.id);

      if (assignmentsError) {
        console.error("Error fetching flow assignments:", assignmentsError);
      }

      // Fetch image gallery items for library
      const { data: libraryItems, error: libraryError } = await supabase
        .from("image_gallery")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("created_at", { ascending: false });

      if (libraryError) {
        console.error("Error fetching library items:", libraryError);
      }

      // Fetch real appointments (including past ones for calendar)
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients!appointments_patient_id_fkey(
            id,
            user_profiles!patients_user_id_fkey(
              name,
              email
            )
          )
        `,
        )
        .eq("clinic_id", user.clinicId || "")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      // Separate current and future appointments for display
      const currentDate = new Date().toISOString().split("T")[0];
      const futureAppointments = (appointments || []).filter(
        (apt) => apt.appointment_date >= currentDate,
      );

      // Set calendar appointments for visual calendar
      setCalendarAppointments(appointments || []);

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
      }

      // Fetch real tips
      const { data: tips, error: tipsError } = await supabase
        .from("tips")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (tipsError) {
        console.error("Error fetching tips:", tipsError);
      }

      // Count tip assignments for each tip
      const tipsWithCounts = await Promise.all(
        (tips || []).map(async (tip) => {
          const { count, error: countError } = await supabase
            .from("tip_assignments")
            .select("id", { count: "exact" })
            .eq("tip_id", tip.id);

          if (countError) {
            console.error("Error counting tip assignments:", countError);
            return { ...tip, sentTo: 0 };
          }

          return {
            ...tip,
            sentTo: count || 0,
            createdAt:
              tip.created_at?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
          };
        }),
      );

      // Calculate statistics
      const totalPatients = patients?.length || 0;
      const activePatients =
        patients?.filter((p) =>
          flowAssignments?.some(
            (fa) => fa.patient_id === p.id && fa.status === "active",
          ),
        ).length || 0;

      const totalSpecialists = specialists?.length || 0;
      const flowsCreated = flows?.length || 0;
      const tipsSent =
        flowAssignments?.reduce((sum, fa) => {
          return sum + (fa.progress?.tips_sent || 0);
        }, 0) || 0;

      // Mock some data that would require more complex queries
      const weeklyAppointments = Math.floor(totalPatients * 0.3);
      const monthlyRevenue = totalPatients * 150; // Estimate based on patients
      const clinicAppointments = totalSpecialists * 15; // Estimate
      const patientEngagement = Math.min(
        89,
        Math.floor((activePatients / Math.max(totalPatients, 1)) * 100),
      );

      // Format real appointments (only future ones for the list)
      const formattedAppointments = futureAppointments.map((appointment) => ({
        id: appointment.id,
        patientName: appointment.patients?.user_profiles?.name || "Paciente",
        date: appointment.appointment_date,
        time: appointment.appointment_time?.substring(0, 5) || "00:00",
        type: appointment.appointment_type || "Consulta",
        status: appointment.status || "pending",
        duration: appointment.duration_minutes || 60,
        notes: appointment.notes || "",
      }));

      setDashboardData({
        patients: patients || [],
        specialists: specialistsWithPatientCount || [],
        appointments: formattedAppointments,
        tips: tipsWithCounts || [],
        libraryItems: libraryItems || [],
        stats: {
          totalPatients,
          activePatients,
          weeklyAppointments: futureAppointments.length,
          monthlyRevenue,
          totalSpecialists,
          clinicAppointments,
          patientEngagement,
          flowsCreated,
          tipsSent:
            tipsWithCounts?.reduce((sum, tip) => sum + tip.sentTo, 0) || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Sync with URL parameters for view switching
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view && ["dashboard", "flowbuilder", "admin"].includes(view)) {
      if (view === "admin") {
        setShowClinicAdmin(true);
      } else {
        setCurrentView(view);
      }
    }
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("view", currentView);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  }, [currentView]);

  if (showClinicAdmin) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowClinicAdmin(false)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Administração da Clínica
            </h1>
            <p className="text-muted-foreground">
              Configure as informações, branding e preferências da clínica
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações da Clínica */}
          <Card className="supabase-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informações da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Nome da Clínica</Label>
                <Input
                  id="clinic-name"
                  value={clinicSettings.name}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-description">Descrição</Label>
                <Textarea
                  id="clinic-description"
                  value={clinicSettings.description}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Endereço</Label>
                <Textarea
                  id="clinic-address"
                  value={clinicSettings.address}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      address: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Telefone</Label>
                  <Input
                    id="clinic-phone"
                    value={clinicSettings.phone}
                    onChange={(e) =>
                      setClinicSettings({
                        ...clinicSettings,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-email">E-mail</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    value={clinicSettings.email}
                    onChange={(e) =>
                      setClinicSettings({
                        ...clinicSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-website">Website</Label>
                <Input
                  id="clinic-website"
                  value={clinicSettings.website}
                  onChange={(e) =>
                    setClinicSettings({
                      ...clinicSettings,
                      website: e.target.value,
                    })
                  }
                  placeholder="https://"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logos da Clínica */}
          <Card className="supabase-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Logos da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Web */}
              <div className="space-y-3">
                <Label>Logo para Web</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <div className="h-24 flex items-center justify-center mb-3 bg-muted rounded-md">
                    {clinicSettings.webLogoPreview ? (
                      <img
                        src={clinicSettings.webLogoPreview}
                        alt="Logo web"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/png,image/jpeg,image/svg+xml";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Arquivo muito grande. Máximo 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setClinicSettings({
                                ...clinicSettings,
                                webLogo: file,
                                webLogoPreview: e.target?.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher arquivo
                    </Button>
                    {clinicSettings.webLogoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          setClinicSettings({
                            ...clinicSettings,
                            webLogo: null,
                            webLogoPreview: "",
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG ou SVG (máx. 2MB)
                  </p>
                </div>
              </div>

              {/* Logo Mobile */}
              <div className="space-y-3">
                <Label>Logo para Mobile</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <div className="h-16 flex items-center justify-center mb-3 bg-muted rounded-md">
                    {clinicSettings.mobileLogoPreview ? (
                      <img
                        src={clinicSettings.mobileLogoPreview}
                        alt="Logo mobile"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/png,image/jpeg,image/svg+xml";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            if (file.size > 1 * 1024 * 1024) {
                              alert("Arquivo muito grande. Máximo 1MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setClinicSettings({
                                ...clinicSettings,
                                mobileLogo: file,
                                mobileLogoPreview: e.target?.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher arquivo
                    </Button>
                    {clinicSettings.mobileLogoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          setClinicSettings({
                            ...clinicSettings,
                            mobileLogo: null,
                            mobileLogoPreview: "",
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Versão compacta (máx. 1MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cores da Clínica */}
          <Card className="supabase-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Cores da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Cor Primária</Label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-md border border-border"
                    style={{ backgroundColor: clinicSettings.primaryColor }}
                  />
                  <Input
                    type="text"
                    value={clinicSettings.primaryColor}
                    onChange={(e) =>
                      setClinicSettings({
                        ...clinicSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="max-w-[120px]"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Cor Secundária</Label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-md border border-border"
                    style={{ backgroundColor: clinicSettings.secondaryColor }}
                  />
                  <Input
                    type="text"
                    value={clinicSettings.secondaryColor}
                    onChange={(e) =>
                      setClinicSettings({
                        ...clinicSettings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="max-w-[120px]"
                    placeholder="#10B981"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Cor de Destaque</Label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-md border border-border"
                    style={{ backgroundColor: clinicSettings.accentColor }}
                  />
                  <Input
                    type="text"
                    value={clinicSettings.accentColor}
                    onChange={(e) =>
                      setClinicSettings({
                        ...clinicSettings,
                        accentColor: e.target.value,
                      })
                    }
                    className="max-w-[120px]"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferências da Clínica */}
          <Card className="supabase-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Preferências da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações importantes
                    </p>
                  </div>
                  <Switch
                    checked={clinicSettings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setClinicSettings({
                        ...clinicSettings,
                        notifications: {
                          ...clinicSettings.notifications,
                          emailNotifications: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações em tempo real
                    </p>
                  </div>
                  <Switch
                    checked={clinicSettings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setClinicSettings({
                        ...clinicSettings,
                        notifications: {
                          ...clinicSettings.notifications,
                          pushNotifications: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumo semanal de atividades
                    </p>
                  </div>
                  <Switch
                    checked={clinicSettings.notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setClinicSettings({
                        ...clinicSettings,
                        notifications: {
                          ...clinicSettings.notifications,
                          weeklyReports: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Backup diário dos dados
                    </p>
                  </div>
                  <Switch
                    checked={clinicSettings.preferences.autoBackup}
                    onCheckedChange={(checked) =>
                      setClinicSettings({
                        ...clinicSettings,
                        preferences: {
                          ...clinicSettings.preferences,
                          autoBackup: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts Section for Chief Specialist */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Análise de Desempenho</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="supabase-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Performance da Clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="#3b82f6"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${(85 / 100) * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">85%</span>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Eficiência Geral
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="supabase-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-16">
                    {[45, 52, 48, 65, 72, 68].map((value, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-green-500 rounded-t w-4 transition-all duration-1000 ease-out"
                          style={{ height: `${(value / 100) * 50}px` }}
                        ></div>
                        <span className="text-xs mt-1 text-muted-foreground">
                          {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-sm">
                    <span className="font-semibold text-green-600">
                      +18% este mês
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="supabase-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Distribuição da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Psicólogos</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">6</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Terapeutas</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">4</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Psiquiatras</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from("clinics")
                  .update({
                    name: clinicSettings.name,
                    description: clinicSettings.description,
                    address: clinicSettings.address,
                    phone: clinicSettings.phone,
                    email: clinicSettings.email,
                    website: clinicSettings.website,
                    primary_color: clinicSettings.primaryColor,
                    secondary_color: clinicSettings.secondaryColor,
                    accent_color: clinicSettings.accentColor,
                    settings: {
                      notifications: clinicSettings.notifications,
                      preferences: clinicSettings.preferences,
                    },
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", user?.clinicId);

                if (error) {
                  console.error("Error saving clinic settings:", error);
                  alert("Erro ao salvar configurações. Tente novamente.");
                  return;
                }

                alert("Configurações salvas com sucesso!");
              } catch (error) {
                console.error("Error saving clinic settings:", error);
                alert("Erro ao salvar configurações. Tente novamente.");
              }
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    );
  }

  // Show FlowBuilder if that view is selected
  if (currentView === "flowbuilder") {
    return (
      <div className="relative min-h-screen bg-background p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              FlowBuilder - Especialista Chefe
            </h1>
            <p className="text-muted-foreground">
              Crie fluxos interativos para seus pacientes
            </p>
          </div>
        </div>

        {/* FlowBuilder Component - Clean interface without clinic admin button */}
        <div className="flowbuilder-container">
          <FlowBuilder />
        </div>
      </div>
    );
  }

  // Render the specialist dashboard with real data and clinic admin button
  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Fixed Sidebar - Hidden on mobile */}
      <div
        className={`sidebar-fixed bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-foreground))] shadow-xl border-r border-border/50 backdrop-blur-md bg-opacity-80 hidden lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--sidebar-muted))]">
          <div className="flex items-center justify-center flex-1 pr-2">
            {sidebarCollapsed ? (
              <div>
                <AppLogo size="sm" type="mobile" />
              </div>
            ) : (
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-semibold">
                  Especialista-Chefe
                </span>
              </div>
            )}
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
                onClick={() => (window.location.href = "/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
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
                  {user?.name?.charAt(0) || "E"}
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
        <main className="flex-1 overflow-y-auto dashboard-mobile-content p-3 sm:p-5 lg:p-6 pt-3 sm:pt-4 lg:pt-6 pb-24 lg:pb-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard do Especialista-Chefe
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua prática clínica e supervisione a equipe
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-muted-foreground">
                Carregando dados...
              </div>
            </div>
          ) : (
            <>
              {/* Render different views based on currentView */}
              {currentView === "dashboard" && (
                <>
                  {/* Personal Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Meus Pacientes
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.totalPatients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardData.stats.activePatients} ativos
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Atendimentos Semanais
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.weeklyAppointments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          esta semana
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Fluxos Criados
                        </CardTitle>
                        <Workflow className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.flowsCreated}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          criados por você
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Dicas Enviadas
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.tipsSent}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          este mês
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Team Stats */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Indicadores da Equipe
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      <Card className="supabase-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total de Especialistas
                          </CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {dashboardData.stats.totalSpecialists}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            na clínica
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="supabase-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Atendimentos da Clínica
                          </CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {dashboardData.stats.clinicAppointments}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            esta semana
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="supabase-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Engajamento de Pacientes
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {dashboardData.stats.patientEngagement}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            taxa de participação
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Patients */}
                    <Card className="supabase-card">
                      <CardHeader>
                        <CardTitle>Pacientes Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.patients.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            Nenhum paciente encontrado
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {dashboardData.patients
                              .slice(0, 5)
                              .map((patient) => (
                                <div
                                  key={patient.id}
                                  className="flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {patient.user_profiles?.name ||
                                        "Nome não disponível"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {patient.user_profiles?.email ||
                                        "Email não disponível"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Tips */}
                    <Card className="supabase-card">
                      <CardHeader>
                        <CardTitle>Dicas Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.tips.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            Nenhuma dica criada ainda
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {dashboardData.tips.map((tip) => (
                              <div
                                key={tip.id}
                                className="border-l-2 border-primary pl-3"
                              >
                                <p className="text-sm font-medium">
                                  {tip.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {tip.category} • Enviado para {tip.sentTo}{" "}
                                  pacientes
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Patients View */}
              {currentView === "patients" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Meus Pacientes</h2>
                      <p className="text-muted-foreground">
                        Gerencie todos os pacientes da clínica
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsAddPatientModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Paciente
                    </Button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar pacientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>

                  {/* Patients List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.patients
                      .filter(
                        (patient) =>
                          patient.user_profiles?.name
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          patient.user_profiles?.email
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((patient) => (
                        <Card
                          key={patient.id}
                          className="supabase-card hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={patient.user_profiles?.avatar_url}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {patient.user_profiles?.name?.charAt(0) ||
                                    "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {patient.user_profiles?.name ||
                                    "Nome não disponível"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {patient.user_profiles?.email ||
                                    "Email não disponível"}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Gênero:
                                </span>
                                <span>{patient.gender || "Não informado"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Data de Nascimento:
                                </span>
                                <span>
                                  {patient.date_of_birth
                                    ? new Date(
                                        patient.date_of_birth,
                                      ).toLocaleDateString()
                                    : "Não informado"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Status:
                                </span>
                                <Badge variant="default">Ativo</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsViewPatientProfileOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Perfil
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setEditPatientData({
                                    name: patient.user_profiles?.name || "",
                                    email: patient.user_profiles?.email || "",
                                    phone: patient.user_profiles?.phone || "",
                                    dateOfBirth: patient.date_of_birth || "",
                                    gender: patient.gender || "",
                                    assignedSpecialist:
                                      patient.assigned_specialist || "",
                                  });
                                  setIsEditPatientModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {dashboardData.patients.length === 0 && (
                    <Card className="supabase-card">
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhum paciente encontrado
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Comece adicionando seu primeiro paciente
                        </p>
                        <Button onClick={() => setIsAddPatientModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Paciente
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Schedule View */}
              {currentView === "schedule" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Agenda</h2>
                      <p className="text-muted-foreground">
                        Visualize e gerencie os agendamentos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto"
                      />
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setIsCreateAppointmentModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Agendamento
                      </Button>
                    </div>
                  </div>

                  {/* Schedule Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Hoje
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            dashboardData.appointments.filter(
                              (apt) =>
                                apt.date ===
                                new Date().toISOString().split("T")[0],
                            ).length
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          agendamentos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Esta Semana
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.weeklyAppointments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          consultas
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pendentes
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            dashboardData.appointments.filter(
                              (apt) => apt.status === "pending",
                            ).length
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          confirmações
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Visual Calendar */}
                  <Card className="supabase-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Calendário de Agendamentos</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMonth = new Date(currentMonth);
                              newMonth.setMonth(newMonth.getMonth() - 1);
                              setCurrentMonth(newMonth);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[120px] text-center">
                            {currentMonth.toLocaleDateString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMonth = new Date(currentMonth);
                              newMonth.setMonth(newMonth.getMonth() + 1);
                              setCurrentMonth(newMonth);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CalendarView
                        currentMonth={currentMonth}
                        appointments={calendarAppointments}
                        onDateSelect={setSelectedDate}
                        selectedDate={selectedDate}
                      />
                    </CardContent>
                  </Card>

                  {/* Appointments List */}
                  <Card className="supabase-card">
                    <CardHeader>
                      <CardTitle>
                        Agendamentos de{" "}
                        {new Date(selectedDate).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {appointment.time}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  45min
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {appointment.patientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  appointment.status === "confirmed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {appointment.status === "confirmed"
                                  ? "Confirmado"
                                  : "Pendente"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Menu className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // TODO: Implement edit appointment functionality
                                      alert(
                                        `Editar agendamento: ${appointment.patientName}`,
                                      );
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase
                                          .from("appointments")
                                          .update({ status: "confirmed" })
                                          .eq("id", appointment.id);

                                        if (error) {
                                          console.error(
                                            "Error confirming appointment:",
                                            error,
                                          );
                                          alert(
                                            "Erro ao confirmar agendamento.",
                                          );
                                          return;
                                        }

                                        alert(
                                          "Agendamento confirmado com sucesso!",
                                        );
                                        fetchDashboardData();
                                      } catch (error) {
                                        console.error(
                                          "Error confirming appointment:",
                                          error,
                                        );
                                        alert("Erro ao confirmar agendamento.");
                                      }
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Tem certeza que deseja cancelar este agendamento?",
                                        )
                                      ) {
                                        try {
                                          const { error } = await supabase
                                            .from("appointments")
                                            .update({ status: "cancelled" })
                                            .eq("id", appointment.id);

                                          if (error) {
                                            console.error(
                                              "Error cancelling appointment:",
                                              error,
                                            );
                                            alert(
                                              "Erro ao cancelar agendamento.",
                                            );
                                            return;
                                          }

                                          alert(
                                            "Agendamento cancelado com sucesso!",
                                          );
                                          fetchDashboardData();
                                        } catch (error) {
                                          console.error(
                                            "Error cancelling appointment:",
                                            error,
                                          );
                                          alert(
                                            "Erro ao cancelar agendamento.",
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tips View */}
              {currentView === "tips" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Dicas Diárias</h2>
                      <p className="text-muted-foreground">
                        Crie e gerencie dicas para seus pacientes
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsCreateTipModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Dica
                    </Button>
                  </div>

                  {/* Tips Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total de Dicas
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.tips.length}
                        </div>
                        <p className="text-xs text-muted-foreground">criadas</p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Enviadas
                        </CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.stats.tipsSent}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          este mês
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Engajamento
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">87%</div>
                        <p className="text-xs text-muted-foreground">
                          taxa de leitura
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tips List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.tips.map((tip) => (
                      <Card
                        key={tip.id}
                        className="supabase-card hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">
                                {tip.title}
                              </CardTitle>
                              <Badge variant="outline" className="mt-2">
                                {tip.category}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Menu className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTip(tip);
                                    setNewTip({
                                      title: tip.title,
                                      content: tip.content,
                                      category: tip.category,
                                    });
                                    setIsEditTipModalOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTipForAssign(tip);
                                    setAssignTipData({
                                      selectedPatients: [],
                                      sendNow: true,
                                    });
                                    setIsAssignTipModalOpen(true);
                                  }}
                                >
                                  <Target className="mr-2 h-4 w-4" />
                                  Atribuir
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTipForSchedule(tip);
                                    setScheduleTipData({
                                      scheduleDate: "",
                                      scheduleTime: "",
                                      selectedPatients: [],
                                    });
                                    setIsScheduleTipModalOpen(true);
                                  }}
                                >
                                  <Timer className="mr-2 h-4 w-4" />
                                  Programar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      // Get all patients from the clinic
                                      const {
                                        data: patients,
                                        error: patientsError,
                                      } = await supabase
                                        .from("patients")
                                        .select("id")
                                        .eq("clinic_id", user?.clinicId || "");

                                      if (patientsError || !patients) {
                                        console.error(
                                          "Error fetching patients:",
                                          patientsError,
                                        );
                                        alert("Erro ao buscar pacientes.");
                                        return;
                                      }

                                      // Create tip assignments for all patients
                                      const assignments = patients.map(
                                        (patient) => ({
                                          tip_id: tip.id,
                                          patient_id: patient.id,
                                          assigned_by: user?.id,
                                        }),
                                      );

                                      const { error } = await supabase
                                        .from("tip_assignments")
                                        .insert(assignments);

                                      if (error) {
                                        console.error(
                                          "Error sending tip:",
                                          error,
                                        );
                                        alert("Erro ao enviar dica.");
                                        return;
                                      }

                                      alert(
                                        `Dica enviada para ${patients.length} pacientes!`,
                                      );
                                      fetchDashboardData();
                                    } catch (error) {
                                      console.error(
                                        "Error sending tip:",
                                        error,
                                      );
                                      alert("Erro ao enviar dica.");
                                    }
                                  }}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Enviar para Todos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Tem certeza que deseja excluir esta dica?",
                                      )
                                    ) {
                                      try {
                                        const { error } = await supabase
                                          .from("tips")
                                          .update({ is_active: false })
                                          .eq("id", tip.id);

                                        if (error) {
                                          console.error(
                                            "Error deleting tip:",
                                            error,
                                          );
                                          alert("Erro ao excluir dica.");
                                          return;
                                        }

                                        alert("Dica excluída com sucesso!");
                                        fetchDashboardData();
                                      } catch (error) {
                                        console.error(
                                          "Error deleting tip:",
                                          error,
                                        );
                                        alert("Erro ao excluir dica.");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {tip.content}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Enviado para {tip.sentTo} pacientes</span>
                            <span>{tip.createdAt}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {dashboardData.tips.length === 0 && (
                    <Card className="supabase-card">
                      <CardContent className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhuma dica criada
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Comece criando sua primeira dica para os pacientes
                        </p>
                        <Button onClick={() => setIsCreateTipModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Dica
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Library View */}
              {currentView === "library" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Biblioteca de Recursos
                      </h2>
                      <p className="text-muted-foreground">
                        Gerencie materiais e recursos para pacientes
                      </p>
                    </div>
                    <ImageGallery
                      bucketId="library-resources"
                      onImageSelect={(imageUrl) => {
                        console.log("Image selected:", imageUrl);
                        // Refresh library items after upload
                        fetchDashboardData();
                      }}
                      trigger={
                        <Button className="bg-primary hover:bg-primary/90">
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Recurso
                        </Button>
                      }
                      allowedTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                        "video/mp4",
                        "video/webm",
                        "video/ogg",
                        "video/avi",
                        "video/mov",
                        "application/pdf",
                        "text/plain",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      ]}
                      maxFileSize={50 * 1024 * 1024}
                    />
                  </div>

                  {/* Library Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.libraryItems.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          recursos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Imagens
                        </CardTitle>
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            dashboardData.libraryItems.filter((item) =>
                              item.mime_type?.startsWith("image"),
                            ).length
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          arquivos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Vídeos
                        </CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            dashboardData.libraryItems.filter((item) =>
                              item.mime_type?.startsWith("video"),
                            ).length
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          arquivos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Documentos
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            dashboardData.libraryItems.filter(
                              (item) =>
                                !item.mime_type?.startsWith("image") &&
                                !item.mime_type?.startsWith("video"),
                            ).length
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          arquivos
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Library Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.libraryItems.map((item) => (
                      <Card
                        key={item.id}
                        className="supabase-card hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {item.mime_type?.startsWith("image") ? (
                                <FileImage className="h-5 w-5 text-blue-500" />
                              ) : item.mime_type?.startsWith("video") ? (
                                <Video className="h-5 w-5 text-green-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-orange-500" />
                              )}
                              <CardTitle className="text-sm truncate">
                                {item.name}
                              </CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Menu className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(item.url, "_blank");
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = item.url;
                                    link.download = item.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Tem certeza que deseja excluir este arquivo?",
                                      )
                                    ) {
                                      try {
                                        // Extract filename from URL
                                        const urlParts = item.url.split("/");
                                        const fileName =
                                          urlParts[urlParts.length - 1];

                                        // Delete from storage
                                        const { error: storageError } =
                                          await supabase.storage
                                            .from("library-resources")
                                            .remove([fileName]);

                                        if (storageError) {
                                          console.warn(
                                            "Storage deletion error:",
                                            storageError,
                                          );
                                        }

                                        // Delete from gallery table
                                        const { error: dbError } =
                                          await supabase
                                            .from("image_gallery")
                                            .delete()
                                            .eq("id", item.id);

                                        if (dbError) {
                                          console.error(
                                            "Error deleting from database:",
                                            dbError,
                                          );
                                          alert("Erro ao excluir arquivo.");
                                          return;
                                        }

                                        alert("Arquivo excluído com sucesso!");
                                        fetchDashboardData();
                                      } catch (error) {
                                        console.error(
                                          "Error deleting file:",
                                          error,
                                        );
                                        alert("Erro ao excluir arquivo.");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {item.mime_type?.startsWith("image") && (
                            <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {item.mime_type?.startsWith("video") && (
                            <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                              />
                            </div>
                          )}
                          {item.mime_type === "application/pdf" && (
                            <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  PDF Document
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Tamanho:</span>
                              <span>
                                {(item.file_size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tipo:</span>
                              <span>{item.mime_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Criado:</span>
                              <span>
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {dashboardData.libraryItems.length === 0 && (
                    <Card className="supabase-card">
                      <CardContent className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Biblioteca vazia
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione recursos para compartilhar com seus pacientes
                        </p>
                        <ImageGallery
                          bucketId="library-resources"
                          onImageSelect={(imageUrl) => {
                            console.log("Image selected:", imageUrl);
                            fetchDashboardData();
                          }}
                          trigger={
                            <Button>
                              <Upload className="h-4 w-4 mr-2" />
                              Adicionar Recurso
                            </Button>
                          }
                          allowedTypes={[
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                            "image/gif",
                            "video/mp4",
                            "video/webm",
                            "video/ogg",
                            "video/avi",
                            "video/mov",
                            "application/pdf",
                            "text/plain",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          ]}
                          maxFileSize={50 * 1024 * 1024}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Administration View */}
              {currentView === "administration" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold">Administração</h2>
                    <p className="text-muted-foreground">
                      Gerencie a equipe e configurações da clínica
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      className="supabase-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setIsAddSpecialistModalOpen(true)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                          <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          Adicionar Especialista
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cadastre um novo especialista na equipe
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className="supabase-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setIsAddPatientModalOpen(true)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                          <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          Adicionar Paciente
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cadastre um novo paciente no sistema
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className="supabase-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setIsViewTeamModalOpen(true)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                          <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Ver Equipe</h3>
                        <p className="text-sm text-muted-foreground">
                          Visualize e gerencie a equipe de especialistas
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Team Overview */}
                  <Card className="supabase-card">
                    <CardHeader>
                      <CardTitle>Visão Geral da Equipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">
                            Especialistas por Função
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Especialistas</span>
                              <span className="text-sm font-medium">
                                {
                                  dashboardData.specialists.filter(
                                    (s) =>
                                      s.user_profiles?.role === "specialist",
                                  ).length
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Especialistas-Chefe
                              </span>
                              <span className="text-sm font-medium">
                                {
                                  dashboardData.specialists.filter(
                                    (s) =>
                                      s.user_profiles?.role ===
                                      "chief_specialist",
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">
                            Distribuição de Pacientes
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Total de Pacientes
                              </span>
                              <span className="text-sm font-medium">
                                {dashboardData.stats.totalPatients}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Pacientes Ativos</span>
                              <span className="text-sm font-medium">
                                {dashboardData.stats.activePatients}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Specialists */}
                  <Card className="supabase-card">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Especialistas Recentes</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsViewTeamModalOpen(true)}
                        >
                          Ver Todos
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.specialists
                          .slice(0, 5)
                          .map((specialist) => (
                            <div
                              key={specialist.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={specialist.user_profiles?.avatar_url}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {specialist.user_profiles?.name?.charAt(
                                      0,
                                    ) || "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {specialist.user_profiles?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {specialist.specialization}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    specialist.user_profiles?.is_active
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {specialist.user_profiles?.is_active
                                    ? "Ativo"
                                    : "Inativo"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {specialist.patientCount} pacientes
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
            <UserCheck className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView("patients")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === "patients"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Pacientes</span>
          </button>

          <button
            onClick={() => setCurrentView("schedule")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === "schedule"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Agenda</span>
          </button>

          <button
            onClick={() => setCurrentView("tips")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === "tips"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Dicas</span>
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
      {/* Add Specialist Modal */}
      <Dialog
        open={isAddSpecialistModalOpen}
        onOpenChange={setIsAddSpecialistModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Especialista</DialogTitle>
          </DialogHeader>
          <AddSpecialistForm
            onClose={() => setIsAddSpecialistModalOpen(false)}
            clinicId={user?.clinicId}
          />
        </DialogContent>
      </Dialog>

      {/* Create Tip Modal */}
      <Dialog
        open={isCreateTipModalOpen}
        onOpenChange={setIsCreateTipModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Dica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tip-title">Título</Label>
              <Input
                id="tip-title"
                placeholder="Título da dica"
                value={newTip.title}
                onChange={(e) =>
                  setNewTip({ ...newTip, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip-category">Categoria</Label>
              <Select
                value={newTip.category}
                onValueChange={(value) =>
                  setNewTip({ ...newTip, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                  <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                  <SelectItem value="Exercícios">Exercícios</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="Sono">Sono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip-content">Conteúdo</Label>
              <Textarea
                id="tip-content"
                placeholder="Escreva o conteúdo da dica..."
                value={newTip.content}
                onChange={(e) =>
                  setNewTip({ ...newTip, content: e.target.value })
                }
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateTipModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!newTip.title || !newTip.content || !newTip.category) {
                      alert(
                        "Por favor, preencha todos os campos obrigatórios.",
                      );
                      return;
                    }

                    const { error } = await supabase.from("tips").insert({
                      title: newTip.title,
                      content: newTip.content,
                      category: newTip.category,
                      created_by: user?.id,
                      clinic_id: user?.clinicId,
                    });

                    if (error) {
                      console.error("Error creating tip:", error);
                      alert("Erro ao criar dica. Tente novamente.");
                      return;
                    }

                    alert("Dica criada com sucesso!");
                    setNewTip({ title: "", content: "", category: "" });
                    setIsCreateTipModalOpen(false);
                    fetchDashboardData(); // Refresh data
                  } catch (error) {
                    console.error("Error creating tip:", error);
                    alert("Erro ao criar dica. Tente novamente.");
                  }
                }}
              >
                Criar Dica
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Patient Modal */}
      <Dialog
        open={isAddPatientModalOpen}
        onOpenChange={setIsAddPatientModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Paciente</DialogTitle>
          </DialogHeader>
          <AddPatientForm
            onClose={() => setIsAddPatientModalOpen(false)}
            clinicId={user?.clinicId}
            specialists={dashboardData.specialists}
          />
        </DialogContent>
      </Dialog>

      {/* Create Appointment Modal */}
      <Dialog
        open={isCreateAppointmentModalOpen}
        onOpenChange={setIsCreateAppointmentModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-patient">Paciente</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData.patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.user_profiles?.name || "Nome não disponível"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Data</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-time">Horário</Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-type">Tipo</Label>
                <Select
                  value={newAppointment.type}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Primeira Consulta">
                      Primeira Consulta
                    </SelectItem>
                    <SelectItem value="Avaliação">Avaliação</SelectItem>
                    <SelectItem value="Terapia">Terapia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-duration">Duração (min)</Label>
                <Input
                  id="appointment-duration"
                  type="number"
                  value={newAppointment.duration}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  min="15"
                  max="180"
                  step="15"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-notes">Observações</Label>
              <Textarea
                id="appointment-notes"
                placeholder="Observações sobre o agendamento..."
                value={newAppointment.notes}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    notes: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateAppointmentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (
                      !newAppointment.patientId ||
                      !newAppointment.date ||
                      !newAppointment.time
                    ) {
                      alert(
                        "Por favor, preencha todos os campos obrigatórios.",
                      );
                      return;
                    }

                    // Find the specialist ID for the current user
                    const { data: specialist, error: specialistError } =
                      await supabase
                        .from("specialists")
                        .select("id")
                        .eq("user_id", user?.id)
                        .single();

                    if (specialistError || !specialist) {
                      console.error(
                        "Error finding specialist:",
                        specialistError,
                      );
                      alert("Erro ao encontrar especialista. Tente novamente.");
                      return;
                    }

                    const { error } = await supabase
                      .from("appointments")
                      .insert({
                        patient_id: newAppointment.patientId,
                        specialist_id: specialist.id,
                        clinic_id: user?.clinicId,
                        appointment_date: newAppointment.date,
                        appointment_time: newAppointment.time,
                        duration_minutes: newAppointment.duration,
                        appointment_type: newAppointment.type,
                        notes: newAppointment.notes,
                        created_by: user?.id,
                        status: "pending",
                      });

                    if (error) {
                      console.error("Error creating appointment:", error);
                      alert("Erro ao criar agendamento. Tente novamente.");
                      return;
                    }

                    alert("Agendamento criado com sucesso!");
                    setNewAppointment({
                      patientId: "",
                      date: "",
                      time: "",
                      type: "Consulta",
                      duration: 60,
                      notes: "",
                    });
                    setIsCreateAppointmentModalOpen(false);
                    fetchDashboardData(); // Refresh data
                  } catch (error) {
                    console.error("Error creating appointment:", error);
                    alert("Erro ao criar agendamento. Tente novamente.");
                  }
                }}
              >
                Criar Agendamento
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Team Modal */}
      <Dialog open={isViewTeamModalOpen} onOpenChange={setIsViewTeamModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Equipe de Especialistas</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Especialista</TableHead>
                  <TableHead>Especialização</TableHead>
                  <TableHead>Pacientes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.specialists.map((specialist) => (
                  <TableRow key={specialist.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={specialist.user_profiles?.avatar_url}
                          />
                          <AvatarFallback>
                            {specialist.user_profiles?.name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {specialist.user_profiles?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {specialist.user_profiles?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{specialist.specialization}</TableCell>
                    <TableCell>{specialist.patientCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          specialist.user_profiles?.is_active
                            ? "default"
                            : "secondary"
                        }
                      >
                        {specialist.user_profiles?.is_active
                          ? "Ativo"
                          : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Abrir menu</span>
                            <Menu className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement specialist edit functionality
                              alert(
                                `Editar especialista: ${specialist.user_profiles?.name}`,
                              );
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Especialista
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement view specialist patients functionality
                              alert(
                                `Ver pacientes de: ${specialist.user_profiles?.name}`,
                              );
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Ver Pacientes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                              if (
                                confirm(
                                  `Tem certeza que deseja desativar a conta de ${specialist.user_profiles?.name}?`,
                                )
                              ) {
                                try {
                                  const { error } = await supabase
                                    .from("user_profiles")
                                    .update({ is_active: false })
                                    .eq("id", specialist.user_profiles?.id);

                                  if (error) {
                                    console.error(
                                      "Error deactivating specialist:",
                                      error,
                                    );
                                    alert("Erro ao desativar conta.");
                                    return;
                                  }

                                  alert("Conta desativada com sucesso!");
                                  fetchDashboardData();
                                } catch (error) {
                                  console.error(
                                    "Error deactivating specialist:",
                                    error,
                                  );
                                  alert("Erro ao desativar conta.");
                                }
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desativar Conta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tip Modal */}
      <Dialog open={isEditTipModalOpen} onOpenChange={setIsEditTipModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Dica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tip-title">Título</Label>
              <Input
                id="edit-tip-title"
                placeholder="Título da dica"
                value={newTip.title}
                onChange={(e) =>
                  setNewTip({ ...newTip, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tip-category">Categoria</Label>
              <Select
                value={newTip.category}
                onValueChange={(value) =>
                  setNewTip({ ...newTip, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                  <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                  <SelectItem value="Exercícios">Exercícios</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="Sono">Sono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tip-content">Conteúdo</Label>
              <Textarea
                id="edit-tip-content"
                placeholder="Escreva o conteúdo da dica..."
                value={newTip.content}
                onChange={(e) =>
                  setNewTip({ ...newTip, content: e.target.value })
                }
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditTipModalOpen(false);
                  setEditingTip(null);
                  setNewTip({ title: "", content: "", category: "" });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!newTip.title || !newTip.content || !newTip.category) {
                      alert(
                        "Por favor, preencha todos os campos obrigatórios.",
                      );
                      return;
                    }

                    const { error } = await supabase
                      .from("tips")
                      .update({
                        title: newTip.title,
                        content: newTip.content,
                        category: newTip.category,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", editingTip.id);

                    if (error) {
                      console.error("Error updating tip:", error);
                      alert("Erro ao atualizar dica. Tente novamente.");
                      return;
                    }

                    alert("Dica atualizada com sucesso!");
                    setNewTip({ title: "", content: "", category: "" });
                    setIsEditTipModalOpen(false);
                    setEditingTip(null);
                    fetchDashboardData();
                  } catch (error) {
                    console.error("Error updating tip:", error);
                    alert("Erro ao atualizar dica. Tente novamente.");
                  }
                }}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Tip Modal */}
      <Dialog
        open={isAssignTipModalOpen}
        onOpenChange={setIsAssignTipModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Atribuir Dica: {selectedTipForAssign?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Pacientes</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                {dashboardData.patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center space-x-2 p-2"
                  >
                    <input
                      type="checkbox"
                      id={`patient-${patient.id}`}
                      checked={assignTipData.selectedPatients.includes(
                        patient.id,
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignTipData({
                            ...assignTipData,
                            selectedPatients: [
                              ...assignTipData.selectedPatients,
                              patient.id,
                            ],
                          });
                        } else {
                          setAssignTipData({
                            ...assignTipData,
                            selectedPatients:
                              assignTipData.selectedPatients.filter(
                                (id) => id !== patient.id,
                              ),
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`patient-${patient.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {patient.user_profiles?.name || "Nome não disponível"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="send-now"
                checked={assignTipData.sendNow}
                onChange={(e) =>
                  setAssignTipData({
                    ...assignTipData,
                    sendNow: e.target.checked,
                  })
                }
              />
              <Label htmlFor="send-now">Enviar imediatamente</Label>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignTipModalOpen(false);
                  setSelectedTipForAssign(null);
                  setAssignTipData({ selectedPatients: [], sendNow: true });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (assignTipData.selectedPatients.length === 0) {
                      alert("Selecione pelo menos um paciente.");
                      return;
                    }

                    const assignments = assignTipData.selectedPatients.map(
                      (patientId) => ({
                        tip_id: selectedTipForAssign.id,
                        patient_id: patientId,
                        assigned_by: user?.id,
                        status: assignTipData.sendNow ? "sent" : "pending",
                        sent_at: assignTipData.sendNow
                          ? new Date().toISOString()
                          : null,
                      }),
                    );

                    const { error } = await supabase
                      .from("tip_assignments")
                      .insert(assignments);

                    if (error) {
                      console.error("Error assigning tip:", error);
                      alert("Erro ao atribuir dica.");
                      return;
                    }

                    alert(
                      `Dica atribuída para ${assignTipData.selectedPatients.length} pacientes!`,
                    );
                    setIsAssignTipModalOpen(false);
                    setSelectedTipForAssign(null);
                    setAssignTipData({ selectedPatients: [], sendNow: true });
                    fetchDashboardData();
                  } catch (error) {
                    console.error("Error assigning tip:", error);
                    alert("Erro ao atribuir dica.");
                  }
                }}
              >
                Atribuir Dica
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Tip Modal */}
      <Dialog
        open={isScheduleTipModalOpen}
        onOpenChange={setIsScheduleTipModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Programar Dica: {selectedTipForSchedule?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Data</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleTipData.scheduleDate}
                  onChange={(e) =>
                    setScheduleTipData({
                      ...scheduleTipData,
                      scheduleDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Horário</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTipData.scheduleTime}
                  onChange={(e) =>
                    setScheduleTipData({
                      ...scheduleTipData,
                      scheduleTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Selecionar Pacientes</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                {dashboardData.patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center space-x-2 p-2"
                  >
                    <input
                      type="checkbox"
                      id={`schedule-patient-${patient.id}`}
                      checked={scheduleTipData.selectedPatients.includes(
                        patient.id,
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setScheduleTipData({
                            ...scheduleTipData,
                            selectedPatients: [
                              ...scheduleTipData.selectedPatients,
                              patient.id,
                            ],
                          });
                        } else {
                          setScheduleTipData({
                            ...scheduleTipData,
                            selectedPatients:
                              scheduleTipData.selectedPatients.filter(
                                (id) => id !== patient.id,
                              ),
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`schedule-patient-${patient.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {patient.user_profiles?.name || "Nome não disponível"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsScheduleTipModalOpen(false);
                  setSelectedTipForSchedule(null);
                  setScheduleTipData({
                    scheduleDate: "",
                    scheduleTime: "",
                    selectedPatients: [],
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (
                      !scheduleTipData.scheduleDate ||
                      !scheduleTipData.scheduleTime
                    ) {
                      alert("Por favor, selecione data e horário.");
                      return;
                    }
                    if (scheduleTipData.selectedPatients.length === 0) {
                      alert("Selecione pelo menos um paciente.");
                      return;
                    }

                    const scheduledDateTime = `${scheduleTipData.scheduleDate}T${scheduleTipData.scheduleTime}:00`;

                    const assignments = scheduleTipData.selectedPatients.map(
                      (patientId) => ({
                        tip_id: selectedTipForSchedule.id,
                        patient_id: patientId,
                        assigned_by: user?.id,
                        status: "scheduled",
                        scheduled_for: scheduledDateTime,
                      }),
                    );

                    const { error } = await supabase
                      .from("tip_assignments")
                      .insert(assignments);

                    if (error) {
                      console.error("Error scheduling tip:", error);
                      alert("Erro ao programar dica.");
                      return;
                    }

                    alert(
                      `Dica programada para ${scheduleTipData.selectedPatients.length} pacientes!`,
                    );
                    setIsScheduleTipModalOpen(false);
                    setSelectedTipForSchedule(null);
                    setScheduleTipData({
                      scheduleDate: "",
                      scheduleTime: "",
                      selectedPatients: [],
                    });
                    fetchDashboardData();
                  } catch (error) {
                    console.error("Error scheduling tip:", error);
                    alert("Erro ao programar dica.");
                  }
                }}
              >
                Programar Dica
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Patient Profile Modal */}
      <Dialog
        open={isViewPatientProfileOpen}
        onOpenChange={setIsViewPatientProfileOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedPatient.user_profiles?.avatar_url}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedPatient.user_profiles?.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedPatient.user_profiles?.name ||
                      "Nome não disponível"}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedPatient.user_profiles?.email ||
                      "Email não disponível"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </Label>
                  <p className="text-sm">
                    {selectedPatient.user_profiles?.phone || "Não informado"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Gênero
                  </Label>
                  <p className="text-sm">
                    {selectedPatient.gender || "Não informado"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Data de Nascimento
                  </Label>
                  <p className="text-sm">
                    {selectedPatient.date_of_birth
                      ? new Date(
                          selectedPatient.date_of_birth,
                        ).toLocaleDateString()
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Especialista Responsável
                </Label>
                <p className="text-sm">
                  {dashboardData.specialists.find(
                    (s) => s.id === selectedPatient.assigned_specialist,
                  )?.user_profiles?.name || "Não atribuído"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Data de Cadastro
                </Label>
                <p className="text-sm">
                  {selectedPatient.created_at
                    ? new Date(selectedPatient.created_at).toLocaleDateString()
                    : "Não disponível"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog
        open={isEditPatientModalOpen}
        onOpenChange={setIsEditPatientModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-patient-name">Nome Completo</Label>
                <Input
                  id="edit-patient-name"
                  value={editPatientData.name}
                  onChange={(e) =>
                    setEditPatientData({
                      ...editPatientData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patient-email">Email</Label>
                <Input
                  id="edit-patient-email"
                  type="email"
                  value={editPatientData.email}
                  onChange={(e) =>
                    setEditPatientData({
                      ...editPatientData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-patient-phone">Telefone</Label>
                <Input
                  id="edit-patient-phone"
                  value={editPatientData.phone}
                  onChange={(e) =>
                    setEditPatientData({
                      ...editPatientData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patient-birth">Data de Nascimento</Label>
                <Input
                  id="edit-patient-birth"
                  type="date"
                  value={editPatientData.dateOfBirth}
                  onChange={(e) =>
                    setEditPatientData({
                      ...editPatientData,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-patient-gender">Gênero</Label>
                <Select
                  value={editPatientData.gender}
                  onValueChange={(value) =>
                    setEditPatientData({ ...editPatientData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro_nao_informar">
                      Prefiro não informar
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patient-specialist">
                  Especialista Responsável
                </Label>
                <Select
                  value={editPatientData.assignedSpecialist}
                  onValueChange={(value) =>
                    setEditPatientData({
                      ...editPatientData,
                      assignedSpecialist: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardData.specialists.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        {specialist.user_profiles?.name} -{" "}
                        {specialist.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditPatientModalOpen(false);
                  setSelectedPatient(null);
                  setEditPatientData({
                    name: "",
                    email: "",
                    phone: "",
                    dateOfBirth: "",
                    gender: "",
                    assignedSpecialist: "",
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!editPatientData.name || !editPatientData.email) {
                      alert("Nome e email são obrigatórios.");
                      return;
                    }

                    // Update user profile
                    const { error: profileError } = await supabase
                      .from("user_profiles")
                      .update({
                        name: editPatientData.name,
                        email: editPatientData.email,
                        phone: editPatientData.phone,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", selectedPatient.user_id);

                    if (profileError) {
                      console.error(
                        "Error updating user profile:",
                        profileError,
                      );
                      alert("Erro ao atualizar perfil do usuário.");
                      return;
                    }

                    // Update patient record
                    const { error: patientError } = await supabase
                      .from("patients")
                      .update({
                        date_of_birth: editPatientData.dateOfBirth || null,
                        gender: editPatientData.gender || null,
                        assigned_specialist:
                          editPatientData.assignedSpecialist || null,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", selectedPatient.id);

                    if (patientError) {
                      console.error("Error updating patient:", patientError);
                      alert("Erro ao atualizar dados do paciente.");
                      return;
                    }

                    alert("Paciente atualizado com sucesso!");
                    setIsEditPatientModalOpen(false);
                    setSelectedPatient(null);
                    setEditPatientData({
                      name: "",
                      email: "",
                      phone: "",
                      dateOfBirth: "",
                      gender: "",
                      assignedSpecialist: "",
                    });
                    fetchDashboardData();
                  } catch (error) {
                    console.error("Error updating patient:", error);
                    alert("Erro ao atualizar paciente.");
                  }
                }}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
            <span className="text-lg font-semibold">Especialista-Chefe</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.slice(4).map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.view) setCurrentView(item.view);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}

            <div className="border-t border-border/50 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggle />
              </div>

              <button
                onClick={() => {
                  window.location.href = "/settings";
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-foreground hover:bg-muted"
              >
                <Settings className="h-5 w-5 mr-3" />
                Configurações
              </button>

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

      {/* Floating Clinic Admin Button */}
      <div className="fixed bottom-20 right-4 lg:bottom-4 z-50">
        <Button
          onClick={() => setShowClinicAdmin(true)}
          className="bg-primary hover:bg-primary/90 shadow-lg"
          size="lg"
        >
          <Building2 className="h-5 w-5 mr-2" />
          Administração da Clínica
        </Button>
      </div>

      {/* Floating FlowBuilder Button */}
      <div className="fixed bottom-36 right-4 lg:bottom-20 z-50">
        <Button
          onClick={() => setCurrentView("flowbuilder")}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
          size="lg"
        >
          <GitBranch className="h-5 w-5 mr-2" />
          FlowBuilder
        </Button>
      </div>
    </div>
  );
};

// Add Specialist Form
const specialistFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  phone: z.string().optional(),
  specialization: z
    .string()
    .min(2, { message: "Especialização é obrigatória" }),
  licenseNumber: z.string().optional(),
  role: z.enum(["specialist", "chief_specialist"]),
});

type SpecialistFormValues = z.infer<typeof specialistFormSchema>;

const AddSpecialistForm = ({
  onClose,
  clinicId,
}: {
  onClose: () => void;
  clinicId?: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SpecialistFormValues>({
    resolver: zodResolver(specialistFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      licenseNumber: "",
      role: "specialist",
    },
  });

  async function onSubmit(data: SpecialistFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Register the new specialist using AuthService
      const registerData = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        clinicId: clinicId,
        phone: data.phone,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
      };

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        },
      });

      if (authError) {
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          clinic_id: clinicId,
          phone: data.phone,
          specialization: data.specialization,
          license_number: data.licenseNumber,
          is_active: true,
        });

      if (profileError) {
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      // Create specialist record
      const { error: specialistError } = await supabase
        .from("specialists")
        .insert({
          user_id: authData.user.id,
          clinic_id: clinicId,
          specialization: data.specialization,
          license_number: data.licenseNumber,
          is_approved: data.role === "chief_specialist", // Chief specialists are auto-approved
        });

      if (specialistError) {
        throw new Error(
          `Erro ao criar registro de especialista: ${specialistError.message}`,
        );
      }

      alert(`Especialista ${data.name} adicionado com sucesso!`);
      onClose();

      // Refresh the page to show the new specialist
      window.location.reload();
    } catch (error) {
      console.error("Erro ao adicionar especialista:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar especialista",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do especialista" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialização</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Psicólogo Clínico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Registro</FormLabel>
                <FormControl>
                  <Input placeholder="CRP/CRM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="specialist">Especialista</SelectItem>
                  <SelectItem value="chief_specialist">
                    Especialista-Chefe
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Especialistas-chefe têm permissões administrativas adicionais.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Especialista"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Add Patient Form
const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  assignedSpecialist: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const AddPatientForm = ({
  onClose,
  clinicId,
  specialists,
}: {
  onClose: () => void;
  clinicId?: string;
  specialists: any[];
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      assignedSpecialist: "",
    },
  });

  async function onSubmit(data: PatientFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: "patient",
          },
        },
      });

      if (authError) {
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: "patient",
          clinic_id: clinicId,
          phone: data.phone,
          is_active: true,
        });

      if (profileError) {
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      // Create patient record
      const { error: patientError } = await supabase.from("patients").insert({
        user_id: authData.user.id,
        clinic_id: clinicId,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        assigned_specialist: data.assignedSpecialist || null,
      });

      if (patientError) {
        throw new Error(
          `Erro ao criar registro de paciente: ${patientError.message}`,
        );
      }

      alert(`Paciente ${data.name} adicionado com sucesso!`);
      onClose();

      // Refresh the page to show the new patient
      window.location.reload();
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao adicionar paciente",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro_nao_informar">
                      Prefiro não informar
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assignedSpecialist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialista Responsável</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.user_profiles?.name} -{" "}
                      {specialist.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Paciente"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Calendar View Component
const CalendarView = ({
  currentMonth,
  appointments,
  onDateSelect,
  selectedDate,
}) => {
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.appointment_date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSelected = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return dateStr === selectedDate;
  };

  return (
    <div className="w-full">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const hasAppointments = dayAppointments.length > 0;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date.toISOString().split("T")[0])}
              className={`
                relative p-2 text-sm border rounded-md transition-colors min-h-[40px] flex flex-col items-center justify-center
                ${
                  isSelected(date)
                    ? "bg-primary text-primary-foreground border-primary"
                    : isToday(date)
                      ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100"
                      : isCurrentMonth(date)
                        ? "hover:bg-muted border-border"
                        : "text-muted-foreground border-transparent"
                }
                ${
                  hasAppointments && !isSelected(date)
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : ""
                }
              `}
            >
              <span className={`${!isCurrentMonth(date) ? "opacity-50" : ""}`}>
                {date.getDate()}
              </span>
              {hasAppointments && (
                <div className="flex space-x-1 mt-1">
                  {dayAppointments.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected(date)
                          ? "bg-primary-foreground"
                          : "bg-green-500"
                      }`}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="text-xs">
                      +{dayAppointments.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Com agendamentos</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  );
};

export default ChiefSpecialistDashboard;

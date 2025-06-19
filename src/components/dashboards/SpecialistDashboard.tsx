import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  UserCheck,
  Workflow,
  MessageSquare,
  TrendingUp,
  Users,
  Settings,
  Calendar,
  FileText,
  Plus,
  Edit,
  Shield,
  Activity,
  Upload,
  Trash2,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Save,
  Eye,
  Copy,
  HelpCircle,
  Check,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ListChecks,
  BarChart3,
  ToggleLeft,
  GitBranch,
  CheckCircle,
  Video,
  Headphones,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/auth/ThemeToggle";
import AppLogo from "@/components/auth/AppLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { FlowBuilder } from "@/components/FlowBuilder";

// Mock data for team members (only visible to chief specialists)
const mockTeamMembers = [
  {
    id: "1",
    name: "Dr. Carlos Mendes",
    email: "carlos@clinica.com",
    role: "Psicólogo",
    status: "active" as const,
    patients: 18,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
  },
  {
    id: "2",
    name: "Dra. Ana Silva",
    email: "ana@clinica.com",
    role: "Terapeuta",
    status: "active" as const,
    patients: 22,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
  },
  {
    id: "3",
    name: "Dr. Roberto Santos",
    email: "roberto@clinica.com",
    role: "Psiquiatra",
    status: "inactive" as const,
    patients: 0,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=roberto",
  },
];

// Safe hook wrapper to handle context errors
const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    console.warn("AuthContext not available, using mock data:", error);
    return {
      user: {
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
        role: "specialist" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      },
      isAuthenticated: true,
      isLoading: false,
      login: async () => true,
      logout: () => {},
      hasPermission: (permission: string) => permission === "VIEW_PATIENTS",
    };
  }
};

const SpecialistDashboard = () => {
  const { user, logout, hasPermission } = useSafeAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toolsCollapsed, setToolsCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "patients"
    | "schedule"
    | "tips"
    | "library"
    | "administration"
    | "flowbuilder"
  >("dashboard");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] =
    useState(false);
  const [isNewTipModalOpen, setIsNewTipModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState({
    name: "Clínica Bem-Estar",
    logo: null as string | null,
    primaryColor: "#3B82F6",
    plan: "Premium",
  });

  const isChiefSpecialist = hasPermission("VIEW_TEAM_OVERVIEW");

  // Sync with URL parameters for view switching
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (
      view &&
      [
        "dashboard",
        "flowbuilder",
        "patients",
        "schedule",
        "tips",
        "library",
        "administration",
      ].includes(view)
    ) {
      setCurrentView(view as any);
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

  const menuItems = [
    { icon: UserCheck, label: "Dashboard", view: "dashboard" as const },
    { icon: Users, label: "Meus Pacientes", view: "patients" as const },
    { icon: Calendar, label: "Agenda", view: "schedule" as const },
    { icon: MessageSquare, label: "Dicas Diárias", view: "tips" as const },
    { icon: FileText, label: "Biblioteca", view: "library" as const },
    ...(isChiefSpecialist
      ? [
          {
            icon: Shield,
            label: "Administração",
            view: "administration" as const,
          },
        ]
      : []),
  ];

  const handleInviteSpecialist = () => {
    // Mock invite functionality
    console.log("Inviting:", { email: inviteEmail, role: inviteRole });
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteRole("");
  };

  // Mock data for patients
  const mockPatients = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      lastSession: "2024-01-15",
      nextSession: "2024-01-22",
      status: "active" as const,
      progress: 75,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      lastSession: "2024-01-14",
      nextSession: "2024-01-21",
      status: "active" as const,
      progress: 60,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777",
      lastSession: "2024-01-10",
      nextSession: "2024-01-24",
      status: "inactive" as const,
      progress: 30,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    },
  ];

  // Mock data for appointments
  const mockAppointments = [
    {
      id: "1",
      patientName: "Maria Silva",
      date: "2024-01-22",
      time: "09:00",
      type: "Consulta",
      status: "confirmed" as const,
    },
    {
      id: "2",
      patientName: "João Santos",
      date: "2024-01-22",
      time: "10:30",
      type: "Retorno",
      status: "confirmed" as const,
    },
    {
      id: "3",
      patientName: "Ana Costa",
      date: "2024-01-23",
      time: "14:00",
      type: "Primeira Consulta",
      status: "pending" as const,
    },
  ];

  // Mock data for tips
  const mockTips = [
    {
      id: "1",
      title: "Técnicas de Respiração",
      content: "Pratique a respiração diafragmática por 5 minutos diários",
      category: "Ansiedade",
      sentTo: 12,
      createdAt: "2024-01-20",
    },
    {
      id: "2",
      title: "Mindfulness Matinal",
      content: "Dedique 10 minutos pela manhã para meditação mindfulness",
      category: "Bem-estar",
      sentTo: 8,
      createdAt: "2024-01-19",
    },
  ];

  // Mock data for library
  const mockLibraryItems = [
    {
      id: "1",
      title: "Manual de Terapia Cognitivo-Comportamental",
      type: "PDF",
      category: "Manuais",
      size: "2.5 MB",
      uploadedAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Exercícios de Relaxamento",
      type: "Video",
      category: "Exercícios",
      size: "45 MB",
      uploadedAt: "2024-01-10",
    },
  ];

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
              FlowBuilder - Especialista
            </h1>
            <p className="text-muted-foreground">
              Crie fluxos interativos para seus pacientes
            </p>
          </div>
        </div>

        {/* FlowBuilder Component */}
        <div className="flowbuilder-container">
          <FlowBuilder />
        </div>
      </div>
    );
  }

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
                  {isChiefSpecialist ? "Especialista-Chefe" : "Especialista"}
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
          {currentView === "patients" ? (
            <>
              {/* Patients Page */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 dashboard-mobile-header">
                <div className="mb-3 sm:mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Meus Pacientes
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Gerencie e acompanhe seus pacientes
                  </p>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsNewPatientModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Paciente
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Buscar pacientes..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patients Table */}
              <Card className="supabase-card">
                <CardContent className="p-0">
                  <div className="mobile-table-container overflow-x-auto max-w-full">
                    <Table
                      className="supabase-table"
                      style={{ minWidth: "350px", width: "100%" }}
                    >
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px] mobile-table-cell">
                            Paciente
                          </TableHead>
                          <TableHead className="min-w-[80px] mobile-table-cell">
                            Progresso
                          </TableHead>
                          <TableHead className="min-w-[60px] mobile-table-cell">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[70px] mobile-table-cell text-right">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="mobile-table-cell">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                  <AvatarImage
                                    src={patient.avatar}
                                    alt={patient.name}
                                  />
                                  <AvatarFallback className="text-xs sm:text-sm">
                                    {patient.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium whitespace-nowrap text-xs sm:text-sm">
                                    {patient.name}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                    {patient.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="mobile-table-cell">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="w-12 sm:w-16 bg-muted rounded-full h-2 flex-shrink-0">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${patient.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs sm:text-sm whitespace-nowrap">
                                  {patient.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="mobile-table-cell">
                              <Badge
                                variant={
                                  patient.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="whitespace-nowrap text-xs"
                              >
                                {patient.status === "active"
                                  ? "Ativo"
                                  : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="mobile-table-cell text-right">
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
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Paciente
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver Prontuário
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Última Sessão: {patient.lastSession}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Próxima Sessão: {patient.nextSession}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Enviar Mensagem
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : currentView === "schedule" ? (
            <>
              {/* Schedule Page */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
                  <p className="text-muted-foreground mt-1">
                    Gerencie seus horários e compromissos
                  </p>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsNewAppointmentModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>

              {/* Calendar View Toggle */}
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" size="sm">
                  Hoje
                </Button>
                <Button variant="outline" size="sm">
                  Semana
                </Button>
                <Button variant="default" size="sm">
                  Mês
                </Button>
              </div>

              {/* Appointments List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.date} às {appointment.time}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.type}
                          </div>
                        </div>
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
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Estatísticas da Agenda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Agendamentos Hoje</span>
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Esta Semana</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Taxa de Comparecimento</span>
                      <span className="font-bold">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Horários Livres Hoje</span>
                      <span className="font-bold">2</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : currentView === "tips" ? (
            <>
              {/* Daily Tips Page */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-foreground">
                    Dicas Diárias
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Crie e envie dicas personalizadas para seus pacientes
                  </p>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsNewTipModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Dica
                </Button>
              </div>

              {/* Tips Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default">Todas</Badge>
                <Badge variant="outline">Ansiedade</Badge>
                <Badge variant="outline">Depressão</Badge>
                <Badge variant="outline">Bem-estar</Badge>
                <Badge variant="outline">Exercícios</Badge>
              </div>

              {/* Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTips.map((tip) => (
                  <Card key={tip.id} className="supabase-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                        <Badge variant="outline">{tip.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {tip.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Enviado para {tip.sentTo} pacientes</span>
                        <span>{tip.createdAt}</span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : currentView === "profile" ? (
            <>
              {/* Profile Page */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Meu Perfil
                </h2>
                <p className="text-muted-foreground mt-1">
                  Gerencie suas informações pessoais e profissionais
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Foto do Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-2xl">
                        {user?.name?.charAt(0) || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert(
                          "Funcionalidade de upload será implementada com Supabase",
                        )
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </Button>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="supabase-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={user?.name || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" value={user?.email || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" placeholder="(11) 99999-9999" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade</Label>
                        <Input id="specialty" placeholder="Psicólogo Clínico" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia Profissional</Label>
                      <Textarea
                        id="bio"
                        placeholder="Descreva sua experiência e abordagem profissional..."
                        rows={4}
                      />
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() =>
                        alert(
                          "Funcionalidade de salvar perfil será implementada com Supabase",
                        )
                      }
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : currentView === "settings" ? (
            <>
              {/* Settings Page */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Configurações
                </h2>
                <p className="text-muted-foreground mt-1">
                  Personalize suas preferências e configurações do sistema
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações por E-mail</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações sobre agendamentos
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lembretes de Sessão</Label>
                        <p className="text-sm text-muted-foreground">
                          Lembrete 1 hora antes da sessão
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumo semanal de atividades
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Privacidade e Segurança</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        alert("Funcionalidade será implementada com Supabase")
                      }
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        alert("Funcionalidade será implementada com Supabase")
                      }
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Autenticação em Duas Etapas
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        alert("Funcionalidade de exportação será implementada")
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Baixar Dados Pessoais
                    </Button>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Preferências</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Input value="Português (Brasil)" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Fuso Horário</Label>
                      <Input value="(GMT-3) Brasília" disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo Escuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Alternar tema da interface
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Ações da Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        alert("Funcionalidade de exportação será implementada")
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => {
                        if (
                          confirm(
                            "Tem certeza que deseja desativar sua conta? Esta ação não pode ser desfeita.",
                          )
                        ) {
                          alert(
                            "Funcionalidade será implementada com Supabase",
                          );
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Desativar Conta
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : currentView === "library" ? (
            <>
              {/* Library Page */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-foreground">
                    Biblioteca
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Gerencie seus recursos, documentos e materiais
                  </p>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsFileUploadModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Arquivo
                </Button>
              </div>

              {/* Library Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default">Todos</Badge>
                <Badge variant="outline">Manuais</Badge>
                <Badge variant="outline">Exercícios</Badge>
                <Badge variant="outline">Vídeos</Badge>
                <Badge variant="outline">Formulários</Badge>
              </div>

              {/* Library Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockLibraryItems.map((item) => (
                  <Card key={item.id} className="supabase-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Categoria:
                          </span>
                          <span>{item.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tamanho:
                          </span>
                          <span>{item.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Upload:</span>
                          <span>{item.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : currentView === "administration" && isChiefSpecialist ? (
            <>
              {/* Administration Page - Only for Chief Specialists */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Administração da Clínica
                </h2>
                <p className="text-muted-foreground mt-1">
                  Gerencie a clínica, especialistas e configurações
                  administrativas
                </p>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Card className="supabase-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Especialistas
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 este mês</p>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pacientes Ativos
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">248</div>
                    <p className="text-xs text-muted-foreground">
                      +15 esta semana
                    </p>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sessões do Mês
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">
                      +8% vs mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Mensal
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 45.2k</div>
                    <p className="text-xs text-muted-foreground">
                      +12% vs mês anterior
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Gerenciar Especialistas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione, edite ou remova especialistas da clínica
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Ver Todos os Especialistas
                      </Button>
                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Convidar Especialista
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Configurações da Clínica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure informações, branding e preferências
                    </p>
                    <Button className="w-full" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar Clínica
                    </Button>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Relatórios e Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Visualize relatórios detalhados e métricas
                    </p>
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ver Relatórios
                    </Button>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Gestão Financeira</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Controle de pagamentos e faturamento
                    </p>
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Financeiro
                    </Button>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Backup e Segurança</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gerencie backups e configurações de segurança
                    </p>
                    <Button className="w-full" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Segurança
                    </Button>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Suporte e Ajuda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Acesse documentação e suporte técnico
                    </p>
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Suporte
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : currentView === "dashboard" ? (
            <>
              {/* Personal Stats */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                  {isChiefSpecialist
                    ? "Dashboard do Especialista-Chefe"
                    : "Dashboard do Especialista"}
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {isChiefSpecialist
                    ? "Gerencie sua prática clínica e supervisione a equipe"
                    : "Gerencie pacientes, crie fluxos personalizados e acompanhe a evolução"}
                </p>
              </div>

              {/* Interactive Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                      Progresso dos Pacientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Progresso Médio</span>
                        <span className="font-semibold">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: "78%" }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">12</div>
                          <div className="text-muted-foreground">Excelente</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">8</div>
                          <div className="text-muted-foreground">Bom</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">4</div>
                          <div className="text-muted-foreground">Regular</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Tendência Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-end justify-between h-20">
                        {[65, 72, 68, 75, 82, 78, 85].map((value, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div
                              className="bg-green-500 rounded-t w-3 transition-all duration-1000 ease-out"
                              style={{ height: `${(value / 100) * 60}px` }}
                            ></div>
                            <span className="text-xs mt-1 text-muted-foreground">
                              {["S", "T", "Q", "Q", "S", "S", "D"][index]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Esta semana
                        </span>
                        <span className="font-semibold text-green-600">
                          +7% ↗
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Stats Cards */}
              <div className="grid mobile-grid-compact sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
                <Card className="supabase-card stats-card-mobile">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium mobile-text-compact">
                      Meus Pacientes
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="mobile-card-spacing">
                    <div className="text-xl sm:text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      +3 esta semana
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
                    <div className="text-2xl font-bold">32</div>
                    <p className="text-xs text-muted-foreground">
                      +5 desde a semana passada
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
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">2 ativos</p>
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
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+12 hoje</p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Stats (only for chief specialists) */}
              {isChiefSpecialist && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Indicadores da Equipe
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <Card className="supabase-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total de Especialistas
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                          2 ativos hoje
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
                        <div className="text-2xl font-bold">127</div>
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
                        <div className="text-2xl font-bold">89%</div>
                        <p className="text-xs text-muted-foreground">
                          +3% este mês
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Quick Actions */}
              <div className="grid mobile-grid-compact md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                <Card className="supabase-card">
                  <CardHeader className="mobile-card-spacing">
                    <CardTitle className="text-base sm:text-lg">
                      Meus Pacientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mobile-card-spacing">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      Visualize e gerencie seus pacientes ativos
                    </p>
                    <Button
                      className="w-full mobile-button-compact"
                      onClick={() => setCurrentView("patients")}
                    >
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Ver Pacientes
                    </Button>
                  </CardContent>
                </Card>
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Agenda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gerencie seus horários e compromissos
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setCurrentView("schedule")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Ver Agenda
                    </Button>
                  </CardContent>
                </Card>
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Dicas Diárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Envie dicas e orientações para pacientes
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setCurrentView("tips")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Nova Dica
                    </Button>
                  </CardContent>
                </Card>
                <Card className="supabase-card">
                  <CardHeader>
                    <CardTitle>Biblioteca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Acesse seus recursos e materiais
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setCurrentView("library")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Biblioteca
                    </Button>
                  </CardContent>
                </Card>

                {isChiefSpecialist && <></>}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Página em Desenvolvimento
              </h3>
              <p className="text-muted-foreground">
                Esta funcionalidade será implementada em breve.
              </p>
            </div>
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
            <span className="text-lg font-semibold">
              {isChiefSpecialist ? "Especialista-Chefe" : "Especialista"}
            </span>
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
      {/* New Patient Modal */}
      <Dialog
        open={isNewPatientModalOpen}
        onOpenChange={setIsNewPatientModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Paciente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo paciente para adicioná-lo à sua lista.
            </DialogDescription>
          </DialogHeader>
          <NewPatientForm onClose={() => setIsNewPatientModalOpen(false)} />
        </DialogContent>
      </Dialog>
      {/* New Appointment Modal */}
      <Dialog
        open={isNewAppointmentModalOpen}
        onOpenChange={setIsNewAppointmentModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Agende uma nova consulta ou retorno para um paciente.
            </DialogDescription>
          </DialogHeader>
          <NewAppointmentForm
            onClose={() => setIsNewAppointmentModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* New Tip Modal */}
      <Dialog open={isNewTipModalOpen} onOpenChange={setIsNewTipModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Dica</DialogTitle>
            <DialogDescription>
              Crie uma nova dica para enviar aos seus pacientes.
            </DialogDescription>
          </DialogHeader>
          <NewTipForm onClose={() => setIsNewTipModalOpen(false)} />
        </DialogContent>
      </Dialog>
      {/* File Upload Modal */}
      <Dialog
        open={isFileUploadModalOpen}
        onOpenChange={setIsFileUploadModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload de Arquivo</DialogTitle>
            <DialogDescription>
              Adicione um novo arquivo à biblioteca da clínica.
            </DialogDescription>
          </DialogHeader>
          <FileUploadForm onClose={() => setIsFileUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Floating FlowBuilder Button */}
      <div className="fixed bottom-20 right-4 lg:bottom-4 z-50">
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

// New Patient Form Component
const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(8, { message: "Telefone inválido" }),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const NewPatientForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "active",
      notes: "",
    },
  });

  function onSubmit(data: PatientFormValues) {
    console.log("Novo paciente:", data);
    // Here you would typically save the patient to your database
    // For now, we'll just close the modal
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o paciente"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// New Appointment Form Component
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: "Selecione um paciente" }),
  date: z.string().min(1, { message: "Selecione uma data" }),
  time: z.string().min(1, { message: "Selecione um horário" }),
  type: z.enum(["Consulta", "Retorno", "Primeira Consulta"]),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const NewAppointmentForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      date: "",
      time: "",
      type: "Consulta",
      notes: "",
    },
  });

  function onSubmit(data: AppointmentFormValues) {
    console.log("Novo agendamento:", data);
    // Here you would typically save the appointment to your database
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Primeira Consulta">
                    Primeira Consulta
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a consulta"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Agendar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// New Tip Form Component
const tipFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  content: z
    .string()
    .min(10, { message: "Conteúdo deve ter pelo menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  patients: z.array(z.string()).optional(),
});

type TipFormValues = z.infer<typeof tipFormSchema>;

const NewTipForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      patients: [],
    },
  });

  function onSubmit(data: TipFormValues) {
    console.log("Nova dica:", data);
    // Here you would typically save the tip to your database
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título da dica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                  <SelectItem value="Depressão">Depressão</SelectItem>
                  <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                  <SelectItem value="Exercícios">Exercícios</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conteúdo da dica"
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// File Upload Form Component
const fileUploadSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  file: z.any().optional(),
  description: z.string().optional(),
});

type FileUploadFormValues = z.infer<typeof fileUploadSchema>;

const FileUploadForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
    },
  });

  function onSubmit(data: FileUploadFormValues) {
    console.log("Novo arquivo:", data);
    // Here you would typically upload the file and save metadata to your database
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título do arquivo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Manuais">Manuais</SelectItem>
                  <SelectItem value="Exercícios">Exercícios</SelectItem>
                  <SelectItem value="Vídeos">Vídeos</SelectItem>
                  <SelectItem value="Formulários">Formulários</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arquivo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  className="cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do arquivo"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Enviar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Custom Node Components
const QuestionNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with visible connection line
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "0",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6b7280",
        },
        data: { label: "Conexão Ativa" },
        className: "flow-edge",
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Function to initiate a connection from this node
  const initiateConnection = (optionIndex) => {
    if (window.flowConnectionInfo) {
      // Cancel existing connection
      window.flowConnectionInfo = null;
      window.dispatchEvent(new Event("flowConnectionStateChange"));
      return;
    }

    // Store connection info in a global variable
    window.flowConnectionInfo = {
      sourceId: id,
      sourceHandle: `${id}-option-${optionIndex}`,
    };

    // Dispatch custom event to notify all nodes
    window.dispatchEvent(new Event("flowConnectionStateChange"));
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-blue-500 hover:bg-blue-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-2">
          <MessageSquare className="h-4 w-4 mr-2" />
          {data.label || "Pergunta"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {data.question || "Sem texto de pergunta"}
        </div>
        <div className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-2 py-1 rounded mb-2">
          {data.type === "text" && "Resposta em texto"}
          {data.type === "number" && "Resposta numérica"}
          {data.type === "choice" && "Múltipla escolha"}
          {data.type === "scale" && "Escala 1-10"}
          {data.type === "boolean" && "Sim/Não"}
        </div>

        {data.type === "choice" && data.options && data.options.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Opções:
            </div>
            {data.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
              >
                <span className="text-sm">
                  {option || `Opção ${index + 1}`}
                </span>
                <button
                  className={`rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                    window.flowConnectionInfo &&
                    window.flowConnectionInfo.sourceId === id &&
                    window.flowConnectionInfo.sourceHandle ===
                      `${id}-option-${index}`
                      ? "bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700"
                      : "bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    initiateConnection(index);
                  }}
                  title={
                    window.flowConnectionInfo &&
                    window.flowConnectionInfo.sourceId === id
                      ? "Cancelar conexão"
                      : "Conectar esta resposta a outro nó"
                  }
                >
                  {window.flowConnectionInfo &&
                  window.flowConnectionInfo.sourceId === id &&
                  window.flowConnectionInfo.sourceHandle ===
                    `${id}-option-${index}` ? (
                    <X className="h-3 w-3 text-red-600 dark:text-red-300" />
                  ) : (
                    <Plus className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {data.type === "boolean" && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Opções:
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
              <span className="text-sm">Sim</span>
              <button
                className={`rounded-full w-6 h-6 flex items-center justify-center transition-colors border-2 ${
                  window.flowConnectionInfo &&
                  window.flowConnectionInfo.sourceId === id &&
                  window.flowConnectionInfo.sourceHandle === `${id}-option-0`
                    ? "bg-red-500 border-red-600 hover:bg-red-600"
                    : getEdges().some(
                          (e) =>
                            e.source === id &&
                            e.sourceHandle === `${id}-option-0`,
                        )
                      ? "bg-gray-500 border-gray-600 hover:bg-gray-600"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  initiateConnection(0);
                }}
                title={
                  window.flowConnectionInfo &&
                  window.flowConnectionInfo.sourceId === id
                    ? "Cancelar conexão"
                    : getEdges().some(
                          (e) =>
                            e.source === id &&
                            e.sourceHandle === `${id}-option-0`,
                        )
                      ? "Editar conexão"
                      : "Conectar esta resposta a outro nó"
                }
              >
                {window.flowConnectionInfo &&
                window.flowConnectionInfo.sourceId === id &&
                window.flowConnectionInfo.sourceHandle === `${id}-option-0` ? (
                  <X className="h-3 w-3 text-white" />
                ) : getEdges().some(
                    (e) =>
                      e.source === id && e.sourceHandle === `${id}-option-0`,
                  ) ? (
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                ) : (
                  <Plus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
              <span className="text-sm">Não</span>
              <button
                className={`rounded-full w-6 h-6 flex items-center justify-center transition-colors border-2 ${
                  window.flowConnectionInfo &&
                  window.flowConnectionInfo.sourceId === id &&
                  window.flowConnectionInfo.sourceHandle === `${id}-option-1`
                    ? "bg-red-500 border-red-600 hover:bg-red-600"
                    : getEdges().some(
                          (e) =>
                            e.source === id &&
                            e.sourceHandle === `${id}-option-1`,
                        )
                      ? "bg-gray-500 border-gray-600 hover:bg-gray-600"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  initiateConnection(1);
                }}
                title={
                  window.flowConnectionInfo &&
                  window.flowConnectionInfo.sourceId === id
                    ? "Cancelar conexão"
                    : getEdges().some(
                          (e) =>
                            e.source === id &&
                            e.sourceHandle === `${id}-option-1`,
                        )
                      ? "Editar conexão"
                      : "Conectar esta resposta a outro nó"
                }
              >
                {window.flowConnectionInfo &&
                window.flowConnectionInfo.sourceId === id &&
                window.flowConnectionInfo.sourceHandle === `${id}-option-1` ? (
                  <X className="h-3 w-3 text-white" />
                ) : getEdges().some(
                    (e) =>
                      e.source === id && e.sourceHandle === `${id}-option-1`,
                  ) ? (
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                ) : (
                  <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {(data.type === "text" ||
          data.type === "number" ||
          data.type === "scale") && (
          <div className="mt-3 flex justify-end">
            <button
              className={`rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                window.flowConnectionInfo &&
                window.flowConnectionInfo.sourceId === id &&
                window.flowConnectionInfo.sourceHandle === `${id}-option-0`
                  ? "bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700"
                  : getEdges().some(
                        (e) =>
                          e.source === id &&
                          e.sourceHandle === `${id}-option-0`,
                      )
                    ? "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
                    : "bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                initiateConnection(0);
              }}
              title={
                window.flowConnectionInfo &&
                window.flowConnectionInfo.sourceId === id
                  ? "Cancelar conexão"
                  : getEdges().some(
                        (e) =>
                          e.source === id &&
                          e.sourceHandle === `${id}-option-0`,
                      )
                    ? "Editar conexão"
                    : "Conectar esta resposta a outro nó"
              }
            >
              {window.flowConnectionInfo &&
              window.flowConnectionInfo.sourceId === id &&
              window.flowConnectionInfo.sourceHandle === `${id}-option-0` ? (
                <X className="h-3 w-3 text-white" />
              ) : getEdges().some(
                  (e) => e.source === id && e.sourceHandle === `${id}-option-0`,
                ) ? (
                <div className="h-3 w-3 bg-white rounded-full"></div>
              ) : (
                <Plus className="h-3 w-3 text-blue-600 dark:text-blue-300" />
              )}
            </button>
          </div>
        )}

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Pergunta</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "questionNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const MessageNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with Supabase table-like style
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: { stroke: "#e2e8f0", strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#94a3b8",
        },
        data: { label: "Conexão" },
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Function to initiate a connection from this node
  const initiateConnection = () => {
    // Store connection info in a global variable
    window.flowConnectionInfo = {
      sourceId: id,
      sourceHandle: `${id}-message`,
    };

    // Dispatch custom event to notify all nodes
    window.dispatchEvent(new Event("flowConnectionStateChange"));
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-green-500 hover:bg-green-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-2">
          <FileText className="h-4 w-4 mr-2" />
          {data.label || "Mensagem"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.message || "Sem conteúdo de mensagem"}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            className={`rounded-full w-5 h-5 flex items-center justify-center transition-colors ${getEdges().some((e) => e.source === id && e.sourceHandle === `${id}-message`) ? "bg-gray-500 dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            onClick={initiateConnection}
            title={
              getEdges().some(
                (e) => e.source === id && e.sourceHandle === `${id}-message`,
              )
                ? "Editar conexão"
                : "Conectar a outro nó"
            }
          >
            {getEdges().some(
              (e) => e.source === id && e.sourceHandle === `${id}-message`,
            ) ? (
              <div className="h-2 w-2 bg-white rounded-full"></div>
            ) : (
              <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Mensagem</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "messageNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Logic node is no longer needed as a separate component since logic is now visual on each answer

const VideoNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with visible connection line
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "0",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6b7280",
        },
        data: { label: "Conexão Ativa" },
        className: "flow-edge",
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Function to initiate a connection from this node
  const initiateConnection = () => {
    if (window.flowConnectionInfo) {
      // Cancel existing connection
      window.flowConnectionInfo = null;
      window.dispatchEvent(new Event("flowConnectionStateChange"));
      return;
    }

    // Store connection info in a global variable
    window.flowConnectionInfo = {
      sourceId: id,
      sourceHandle: `${id}-video`,
    };

    // Dispatch custom event to notify all nodes
    window.dispatchEvent(new Event("flowConnectionStateChange"));
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-purple-500 hover:bg-purple-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-2">
          <Video className="h-4 w-4 mr-2" />
          {data.label || "Vídeo"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {data.videoUrl ? (
            <a
              href={data.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.title || "Vídeo sem título"}
            </a>
          ) : (
            "URL do vídeo não definida"
          )}
        </div>
        <div className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-2 py-1 rounded mb-2">
          Conteúdo em vídeo
        </div>

        <div className="mt-2 flex justify-end">
          <button
            className={`rounded-full w-5 h-5 flex items-center justify-center transition-colors ${getEdges().some((e) => e.source === id && e.sourceHandle === `${id}-video`) ? "bg-gray-500 dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            onClick={initiateConnection}
            title={
              getEdges().some(
                (e) => e.source === id && e.sourceHandle === `${id}-video`,
              )
                ? "Editar conexão"
                : "Conectar a outro nó"
            }
          >
            {getEdges().some(
              (e) => e.source === id && e.sourceHandle === `${id}-video`,
            ) ? (
              <div className="h-2 w-2 bg-white rounded-full"></div>
            ) : (
              <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Vídeo</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "videoNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const AudioNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with visible connection line
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "0",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6b7280",
        },
        data: { label: "Conexão Ativa" },
        className: "flow-edge",
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Function to initiate a connection from this node
  const initiateConnection = () => {
    if (window.flowConnectionInfo) {
      // Cancel existing connection
      window.flowConnectionInfo = null;
      window.dispatchEvent(new Event("flowConnectionStateChange"));
      return;
    }

    // Store connection info in a global variable
    window.flowConnectionInfo = {
      sourceId: id,
      sourceHandle: `${id}-audio`,
    };

    // Dispatch custom event to notify all nodes
    window.dispatchEvent(new Event("flowConnectionStateChange"));
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-orange-500 hover:bg-orange-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-2">
          <Headphones className="h-4 w-4 mr-2" />
          {data.label || "Áudio"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {data.audioUrl ? (
            <a
              href={data.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.title || "Áudio sem título"}
            </a>
          ) : (
            "URL do áudio não definida"
          )}
        </div>
        <div className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-2 py-1 rounded mb-2">
          Conteúdo em áudio
        </div>

        <div className="mt-2 flex justify-end">
          <button
            className={`rounded-full w-5 h-5 flex items-center justify-center transition-colors ${getEdges().some((e) => e.source === id && e.sourceHandle === `${id}-audio`) ? "bg-gray-500 dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            onClick={initiateConnection}
            title={
              getEdges().some(
                (e) => e.source === id && e.sourceHandle === `${id}-audio`,
              )
                ? "Editar conexão"
                : "Conectar a outro nó"
            }
          >
            {getEdges().some(
              (e) => e.source === id && e.sourceHandle === `${id}-audio`,
            ) ? (
              <div className="h-2 w-2 bg-white rounded-full"></div>
            ) : (
              <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Áudio</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "audioNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const EbookNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with visible connection line
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "0",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6b7280",
        },
        data: { label: "Conexão Ativa" },
        className: "flow-edge",
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Function to initiate a connection from this node
  const initiateConnection = () => {
    if (window.flowConnectionInfo) {
      // Cancel existing connection
      window.flowConnectionInfo = null;
      window.dispatchEvent(new Event("flowConnectionStateChange"));
      return;
    }

    // Store connection info in a global variable
    window.flowConnectionInfo = {
      sourceId: id,
      sourceHandle: `${id}-ebook`,
    };

    // Dispatch custom event to notify all nodes
    window.dispatchEvent(new Event("flowConnectionStateChange"));
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-indigo-500 hover:bg-indigo-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-2">
          <BookOpen className="h-4 w-4 mr-2" />
          {data.label || "E-book"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {data.ebookUrl ? (
            <a
              href={data.ebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.title || "E-book sem título"}
            </a>
          ) : (
            "URL do e-book não definida"
          )}
        </div>
        <div className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-2 py-1 rounded mb-2">
          Material de leitura
        </div>

        <div className="mt-2 flex justify-end">
          <button
            className={`rounded-full w-5 h-5 flex items-center justify-center transition-colors ${getEdges().some((e) => e.source === id && e.sourceHandle === `${id}-ebook`) ? "bg-gray-500 dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            onClick={initiateConnection}
            title={
              getEdges().some(
                (e) => e.source === id && e.sourceHandle === `${id}-ebook`,
              )
                ? "Editar conexão"
                : "Conectar a outro nó"
            }
          >
            {getEdges().some(
              (e) => e.source === id && e.sourceHandle === `${id}-ebook`,
            ) ? (
              <div className="h-2 w-2 bg-white rounded-full"></div>
            ) : (
              <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar E-book</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "ebookNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const EndNode = ({ data, id }) => {
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Get access to the React Flow instance
  const { setEdges, getEdges, setNodes, getNodes } = useReactFlow();

  // Check if this node is connected (has incoming edges)
  React.useEffect(() => {
    const edges = getEdges();
    const hasIncomingEdge = edges.some((edge) => edge.target === id);
    setIsConnected(hasIncomingEdge);
  }, [getEdges, id]);

  // Check if this node is a connection target
  React.useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnectionTarget(
        !!window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== id,
      );
    };

    // Set up a custom event listener for connection state changes
    window.addEventListener(
      "flowConnectionStateChange",
      handleConnectionStateChange,
    );

    return () => {
      window.removeEventListener(
        "flowConnectionStateChange",
        handleConnectionStateChange,
      );
    };
  }, [id]);

  // Handle node click when a connection is in progress
  const handleNodeClick = (e) => {
    e.stopPropagation();

    if (
      window.flowConnectionInfo &&
      window.flowConnectionInfo.sourceId !== id
    ) {
      // Complete the connection
      const { sourceId, sourceHandle } = window.flowConnectionInfo;
      const targetId = id;

      // Create a new edge with Supabase table-like style
      const newEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        sourceHandle: sourceHandle,
        target: targetId,
        animated: false,
        style: { stroke: "#e2e8f0", strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#94a3b8",
        },
        data: { label: "Conexão" },
      };

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);

      // Reset connection state
      window.flowConnectionInfo = null;

      // Dispatch custom event to notify all nodes
      window.dispatchEvent(new Event("flowConnectionStateChange"));
    }
  };

  // Handle edit node
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle duplicate node
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const nodes = getNodes();
    const newNode = {
      ...nodes.find((n) => n.id === id),
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodes.find((n) => n.id === id).position.x + 50,
        y: nodes.find((n) => n.id === id).position.y + 50,
      },
      data: {
        ...data,
        label: `${data.label} (Cópia)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle delete node
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este nó?")) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  };

  // Update node data
  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
    );
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] flow-node ${isConnectionTarget ? "connection-target" : ""}`}
        id={id}
        onClick={handleNodeClick}
      >
        {/* Connection point on the left side */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              isConnectionTarget
                ? "bg-gray-500 hover:bg-gray-600"
                : isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            {isConnectionTarget ? (
              <Plus className="h-4 w-4 text-white" />
            ) : isConnected ? (
              <X className="h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 font-medium mb-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          {data.label || "Fim"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {data.message || "Fluxo finalizado"}
        </div>

        {/* Action buttons at bottom left */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-1 transition-colors"
            title="Editar"
          >
            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded p-1 transition-colors"
            title="Duplicar"
          >
            <Copy className="h-3 w-3 text-green-600 dark:text-green-300" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-300" />
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Finalização</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NodeProperties
              node={{ id, data, type: "endNode" }}
              updateNodeData={updateNodeData}
              deleteNode={() => {
                setShowEditModal(false);
                handleDelete({ stopPropagation: () => {} });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// FlowBuilder Component
const nodeTypes = {
  questionNode: QuestionNode,
  messageNode: MessageNode,
  videoNode: VideoNode,
  audioNode: AudioNode,
  ebookNode: EbookNode,
  endNode: EndNode,
};

export const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "demo-question-1",
      type: "questionNode",
      position: { x: 100, y: 100 },
      data: {
        label: "Pergunta Inicial",
        question: "Como você está se sentindo hoje?",
        type: "choice",
        options: ["Muito bem", "Bem", "Regular", "Mal", "Muito mal"],
        required: true,
      },
    },
    {
      id: "demo-message-1",
      type: "messageNode",
      position: { x: 400, y: 100 },
      data: {
        label: "Mensagem de Apoio",
        message:
          "Obrigado por compartilhar como se sente. Vamos continuar nossa conversa.",
        showIcon: true,
      },
    },
    {
      id: "demo-question-2",
      type: "questionNode",
      position: { x: 700, y: 100 },
      data: {
        label: "Pergunta de Acompanhamento",
        question: "Em uma escala de 1 a 10, qual seu nível de ansiedade?",
        type: "scale",
        required: true,
      },
    },
    {
      id: "demo-end-1",
      type: "endNode",
      position: { x: 1000, y: 100 },
      data: {
        label: "Finalização",
        message:
          "Obrigado por responder! Suas respostas nos ajudam a entender melhor seu estado atual.",
      },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "demo-edge-1",
      source: "demo-question-1",
      target: "demo-message-1",
      sourceHandle: "demo-question-1-option-0",
      animated: false,
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
      className: "flow-edge",
    },
    {
      id: "demo-edge-2",
      source: "demo-message-1",
      target: "demo-question-2",
      sourceHandle: "demo-message-1-message",
      animated: false,
      style: { stroke: "#10b981", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
      className: "flow-edge",
    },
    {
      id: "demo-edge-3",
      source: "demo-question-2",
      target: "demo-end-1",
      sourceHandle: "demo-question-2-option-0",
      animated: false,
      style: { stroke: "#6b7280", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
      className: "flow-edge",
    },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowName, setFlowName] = useState("Novo Fluxo");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [nodeCounter, setNodeCounter] = useState({
    question: 0,
    message: 0,
    video: 0,
    audio: 0,
    ebook: 0,
    end: 0,
  });
  const [toolsCollapsed, setToolsCollapsed] = useState(true);
  const [connectingNodes, setConnectingNodes] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const reactFlowWrapper = useRef(null);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Initialize global connection info and custom event
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.flowConnectionInfo = null;

      // Add a click handler to the document to cancel connections when clicking on canvas
      const handleDocumentClick = (e) => {
        // Only cancel if clicking on the canvas background, not on nodes
        if (
          e.target.closest(".flow-node") === null &&
          window.flowConnectionInfo
        ) {
          window.flowConnectionInfo = null;
          window.dispatchEvent(new Event("flowConnectionStateChange"));
        }
      };

      document.addEventListener("click", handleDocumentClick);

      return () => {
        document.removeEventListener("click", handleDocumentClick);
      };
    }
  }, []);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#3b82f6",
            },
            label: "Conexão",
            className: "flow-edge",
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Handle node connection from visual logic
  const handleNodeConnection = useCallback(
    (sourceNodeId, sourceHandle, targetNodeId) => {
      try {
        // Check if connection already exists
        const existingEdge = edges.find(
          (edge) =>
            edge.source === sourceNodeId &&
            edge.sourceHandle === sourceHandle &&
            edge.target === targetNodeId,
        );

        if (existingEdge) {
          console.log("Connection already exists");
          return;
        }

        // Get source node type to determine edge color
        const sourceNode = nodes.find((node) => node.id === sourceNodeId);
        let edgeColor = "#3b82f6"; // Default blue

        if (sourceNode) {
          if (sourceNode.type === "messageNode") {
            edgeColor = "#10b981"; // Green for message nodes
          } else if (sourceNode.type === "endNode") {
            edgeColor = "#6b7280"; // Gray for end nodes
          }
        }

        const newEdge = {
          id: `e-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
          source: sourceNodeId,
          sourceHandle: sourceHandle,
          target: targetNodeId,
          animated: false,
          style: { stroke: edgeColor, strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
          data: { label: "Conexão" },
          className: "flow-edge",
        };

        setEdges((eds) => [...eds, newEdge]);
      } catch (error) {
        console.error("Error connecting nodes:", error);
      }
    },
    [setEdges, edges, nodes],
  );

  // Handle node selection with double tap support for mobile
  const onNodeClick = useCallback(
    (event, node) => {
      try {
        // If we're in connection mode, handle the connection instead of selecting the node
        if (
          window.flowConnectionInfo &&
          window.flowConnectionInfo.sourceId !== node.id
        ) {
          // Connection is handled by the node components themselves
          return;
        }

        // On mobile, implement double-tap to open properties
        if (isMobile) {
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTap;

          // Set last tap time for next comparison
          setLastTap(currentTime);

          // Double tap detected (tap within 300ms of last tap)
          if (tapLength < 300 && tapLength > 0) {
            setSelectedNode(node);
            setIsPropertiesPanelOpen(true);
          }
        } else {
          // On desktop, single click is enough
          setSelectedNode(node);
          setIsPropertiesPanelOpen(true);
        }
      } catch (error) {
        console.error("Error selecting node:", error);
      }
    },
    [isMobile, lastTap],
  );

  // Add a new node to the canvas
  const addNode = (type, questionType = null) => {
    try {
      const newNodeId = `${type}-${nodeCounter[type]}`;
      // Position the node in the center of the visible canvas
      const position = {
        x: reactFlowWrapper.current
          ? reactFlowWrapper.current.offsetWidth / 2 - 100
          : 100,
        y: reactFlowWrapper.current
          ? reactFlowWrapper.current.offsetHeight / 2 - 100
          : 100 + nodes.length * 100,
      };
      let newNode;

      switch (type) {
        case "question":
          newNode = {
            id: newNodeId,
            type: "questionNode",
            position,
            data: {
              label: `Pergunta ${nodeCounter.question + 1}`,
              question: "",
              type: questionType || "text",
              options: questionType === "choice" ? ["Opção 1", "Opção 2"] : [],
              required: true,
            },
          };
          setNodeCounter((prev) => ({ ...prev, question: prev.question + 1 }));
          break;
        case "message":
          newNode = {
            id: newNodeId,
            type: "messageNode",
            position,
            data: {
              label: `Mensagem ${nodeCounter.message + 1}`,
              message: "",
              showIcon: true,
            },
          };
          setNodeCounter((prev) => ({ ...prev, message: prev.message + 1 }));
          break;
        case "video":
          newNode = {
            id: newNodeId,
            type: "videoNode",
            position,
            data: {
              label: `Vídeo ${nodeCounter.video + 1}`,
              title: "",
              videoUrl: "",
              description: "",
            },
          };
          setNodeCounter((prev) => ({ ...prev, video: prev.video + 1 }));
          break;
        case "audio":
          newNode = {
            id: newNodeId,
            type: "audioNode",
            position,
            data: {
              label: `Áudio ${nodeCounter.audio + 1}`,
              title: "",
              audioUrl: "",
              description: "",
            },
          };
          setNodeCounter((prev) => ({ ...prev, audio: prev.audio + 1 }));
          break;
        case "ebook":
          newNode = {
            id: newNodeId,
            type: "ebookNode",
            position,
            data: {
              label: `E-book ${nodeCounter.ebook + 1}`,
              title: "",
              ebookUrl: "",
              description: "",
            },
          };
          setNodeCounter((prev) => ({ ...prev, ebook: prev.ebook + 1 }));
          break;
        case "end":
          newNode = {
            id: newNodeId,
            type: "endNode",
            position,
            data: {
              label: `Fim ${nodeCounter.end + 1}`,
              message: "Fluxo finalizado",
            },
          };
          setNodeCounter((prev) => ({ ...prev, end: prev.end + 1 }));
          break;
        default:
          return;
      }

      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode);
      setIsPropertiesPanelOpen(true);
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  // Update node data
  const updateNodeData = (id, newData) => {
    try {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // Create a new data object with the updated values
            const updatedData = { ...node.data, ...newData };
            // Return a new node object with the updated data
            return { ...node, data: updatedData };
          }
          return node;
        }),
      );
      // Force a re-render to ensure the UI updates
      setNodes((nds) => [...nds]);
    } catch (error) {
      console.error("Error updating node data:", error);
    }
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (
      confirm(
        "Tem certeza que deseja limpar o canvas? Todas as alterações serão perdidas.",
      )
    ) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
      setNodeCounter({
        question: 0,
        message: 0,
        video: 0,
        audio: 0,
        ebook: 0,
        end: 0,
      });
    }
  };

  // Save the flow
  const saveFlow = () => {
    const flow = {
      name: flowName,
      nodes,
      edges,
    };
    console.log("Flow saved:", flow);
    // Here you would typically save to a database
    alert("Fluxo salvo com sucesso!");
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
    setIsNodePanelOpen(false);
    setIsPropertiesPanelOpen(false);
  };

  // Toggle tools panel collapse
  const toggleToolsPanel = () => {
    setToolsCollapsed(!toolsCollapsed);
  };

  // Tool configuration
  const tools = [
    // Question tools
    {
      id: "question-text",
      title: "Texto",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      nodeType: "question",
      questionType: "text",
    },
    {
      id: "question-number",
      title: "Número",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      nodeType: "question",
      questionType: "number",
    },
    {
      id: "question-choice",
      title: "Múltipla Escolha",
      icon: ListChecks,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      nodeType: "question",
      questionType: "choice",
    },
    {
      id: "question-scale",
      title: "Escala",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      nodeType: "question",
      questionType: "scale",
    },
    {
      id: "question-boolean",
      title: "Sim/Não",
      icon: ToggleLeft,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      nodeType: "question",
      questionType: "boolean",
    },
    // Message tools
    {
      id: "message",
      title: "Mensagem",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
      nodeType: "message",
    },
    // Media tools
    {
      id: "video",
      title: "Vídeo",
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      nodeType: "video",
    },
    {
      id: "audio",
      title: "Áudio",
      icon: Headphones,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      nodeType: "audio",
    },
    {
      id: "ebook",
      title: "E-book",
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      nodeType: "ebook",
    },
    // End tools
    {
      id: "end",
      title: "Finalização",
      icon: CheckCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-800/50",
      borderColor: "border-gray-200 dark:border-gray-700",
      nodeType: "end",
    },
  ];

  return (
    <>
      {/* FlowBuilder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-foreground">FlowBuilder</h2>
          <p className="text-muted-foreground mt-1">
            Crie fluxos interativos personalizados para seus pacientes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            onClick={togglePreviewMode}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            {isPreviewMode ? "Editar" : "Preview"}
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={saveFlow}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Fluxo
          </Button>
        </div>
      </div>
      {/* Flow Name Input */}
      <div className="mb-6">
        <Label htmlFor="flowName">Nome do Fluxo</Label>
        <Input
          id="flowName"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="max-w-md"
          placeholder="Digite o nome do fluxo"
        />
      </div>
      {/* Main FlowBuilder Interface */}
      <div className="relative">
        {/* Tools Panel (now inside canvas) */}
        {!isPreviewMode && (
          <div
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-background dark:bg-gray-800 rounded-lg shadow-lg border border-border transition-all duration-200 ${toolsCollapsed ? "w-14" : "w-48"} sm:block ${isMobile && toolsCollapsed ? "opacity-70 hover:opacity-100" : ""}`}
          >
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                {!toolsCollapsed && (
                  <span className="text-sm font-medium">Ferramentas</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                  onClick={toggleToolsPanel}
                >
                  {toolsCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Button
                      key={tool.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-${toolsCollapsed ? "center" : "start"} ${tool.color}`}
                      onClick={() => {
                        addNode(tool.nodeType, tool.questionType);
                      }}
                      title={toolsCollapsed ? tool.title : undefined}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/reactflow",
                          tool.nodeType,
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    >
                      <Icon
                        className={`h-4 w-4 ${!toolsCollapsed && "mr-2"}`}
                      />
                      {!toolsCollapsed && tool.title}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-border pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-${toolsCollapsed ? "center" : "start"} text-red-500`}
                  onClick={clearCanvas}
                  title={toolsCollapsed ? "Limpar Canvas" : undefined}
                >
                  <Trash2 className={`h-4 w-4 ${!toolsCollapsed && "mr-2"}`} />
                  {!toolsCollapsed && "Limpar Canvas"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div
          className="h-[80vh] w-full dark:bg-gray-900 relative"
          ref={reactFlowWrapper}
          onClick={() => {
            // Close any active connection when clicking on the canvas
            if (window.flowConnectionInfo) {
              window.flowConnectionInfo = null;
              document
                .querySelectorAll(".connection-target")
                .forEach((node) => {
                  node.classList.remove("connection-target");
                });
            }
          }}
        >
          <Card className="supabase-card h-full">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center justify-evenly">
                <CardTitle className="text-lg flex justify-center items-center">
                  {isPreviewMode ? "Preview do Fluxo" : "Canvas do FlowBuilder"}
                </CardTitle>
                <div className="flex space-x-2">
                  {!isPreviewMode && selectedNode && !isPropertiesPanelOpen && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPropertiesPanelOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Propriedades
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const flow = { name: flowName, nodes, edges };
                      console.log(JSON.stringify(flow));
                      alert("Fluxo exportado para o console!");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 h-full">
              <div
                style={{ width: "100%", height: "calc(80vh - 80px)" }}
                className="connection-canvas relative"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-right"
                  className="dark:bg-gray-900 connection-canvas"
                  defaultEdgeOptions={{
                    style: {
                      stroke: "#6b7280",
                      strokeWidth: 2,
                      strokeDasharray: "0",
                    },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      color: "#6b7280",
                    },
                    animated: false,
                    className: "flow-edge",
                  }}
                  onClick={() => {
                    // Cancel any active connection when clicking on the canvas
                    if (window.flowConnectionInfo) {
                      window.flowConnectionInfo = null;
                      window.dispatchEvent(
                        new Event("flowConnectionStateChange"),
                      );
                    }
                  }}
                >
                  <Background
                    color="#cbd5e1"
                    gap={20}
                    className="dark:bg-gray-900 [&>*]:dark:stroke-gray-600 bg-opacity-30 dark:bg-opacity-20"
                    variant="dots"
                  />
                  <Controls className="dark:bg-gray-800 dark:border-gray-700 flow-controls-mobile bg-white shadow-md flex justify-center items-center content-end mx-28" />
                  <MiniMap
                    className="dark:bg-gray-800 dark:border-gray-700 flow-minimap-mobile bg-white shadow-md"
                    nodeColor={(n) => {
                      if (n.type === "questionNode") return "#dbeafe";
                      if (n.type === "messageNode") return "#dcfce7";
                      return "#f3f4f6";
                    }}
                  />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Properties Panel */}
        {!isPreviewMode && isPropertiesPanelOpen && selectedNode && (
          <div className="flow-properties-panel">
            <Card className="supabase-card dark:bg-gray-800 dark:border-gray-700 shadow-xl">
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Propriedades</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsPropertiesPanelOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NodeProperties
                  node={selectedNode}
                  updateNodeData={updateNodeData}
                  deleteNode={deleteSelectedNode}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Saved Flows */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Meus Fluxos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="supabase-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Avaliação Inicial</CardTitle>
                <Badge variant="default">Ativo</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fluxo para avaliação inicial de novos pacientes
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>8 blocos</span>
                <span>Usado por 12 pacientes</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="supabase-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Acompanhamento Semanal
                </CardTitle>
                <Badge variant="outline">Rascunho</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fluxo para acompanhamento semanal do progresso
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>5 blocos</span>
                <span>Em desenvolvimento</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="supabase-card border-dashed">
            <CardContent className="flex items-center justify-center h-full py-12">
              <div className="text-center">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Criar Novo Fluxo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Floating FlowBuilder Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
          onClick={() => {
            // Open FlowBuilder in a new tab
            window.open("/flowbuilder", "_blank");
          }}
          title="Abrir FlowBuilder"
        >
          <Workflow className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

// Node Properties Component
const NodeProperties = ({ node, updateNodeData, deleteNode }) => {
  // Use state to ensure controlled inputs
  const [localNodeData, setLocalNodeData] = useState(node?.data || {});

  // Update local state when node changes
  useEffect(() => {
    if (node?.data) {
      setLocalNodeData(node.data);
    }
  }, [node?.data]);

  // Handle local changes and propagate to parent
  const handleLocalChange = (field, value) => {
    setLocalNodeData((prev) => ({ ...prev, [field]: value }));
    updateNodeData(node.id, { [field]: value });
  };
  if (!node) return null;

  const handleChange = (field, value) => {
    handleLocalChange(field, value);
  };

  const handleLabelChange = (e) => {
    handleLocalChange("label", e.target.value);
  };

  switch (node.type) {
    case "questionNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título da Pergunta</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título da pergunta"
            />
          </div>
          <div>
            <Label>Texto da Pergunta</Label>
            <Textarea
              value={localNodeData.question || ""}
              onChange={(e) => handleChange("question", e.target.value)}
              placeholder="Digite a pergunta aqui..."
              rows={3}
            />
          </div>
          <div>
            <Label>Tipo de Resposta</Label>
            <Select
              value={localNodeData.type || "text"}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="choice">Múltipla Escolha</SelectItem>
                <SelectItem value="scale">Escala (1-10)</SelectItem>
                <SelectItem value="boolean">Sim/Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {localNodeData.type === "choice" && (
            <div>
              <Label>Opções</Label>
              <div className="space-y-2">
                {(localNodeData.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...node.data.options];
                        newOptions[index] = e.target.value;
                        handleChange("options", newOptions);
                      }}
                      placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = [...node.data.options];
                        newOptions.splice(index, 1);
                        handleChange("options", newOptions);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleChange("options", [...(node.data.options || []), ""]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Opção
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={localNodeData.required || false}
              onCheckedChange={(checked) => handleChange("required", checked)}
            />
            <Label htmlFor="required">Resposta Obrigatória</Label>
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Pergunta
          </Button>
        </div>
      );

    case "messageNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título da Mensagem</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título da mensagem"
            />
          </div>
          <div>
            <Label>Conteúdo da Mensagem</Label>
            <Textarea
              value={node.data.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Digite a mensagem aqui..."
              rows={5}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showIcon"
              checked={localNodeData.showIcon || false}
              onCheckedChange={(checked) => handleChange("showIcon", checked)}
            />
            <Label htmlFor="showIcon">Mostrar Ícone</Label>
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Mensagem
          </Button>
        </div>
      );

    case "videoNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Vídeo</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título do vídeo"
            />
          </div>
          <div>
            <Label>Nome do Vídeo</Label>
            <Input
              value={localNodeData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Nome do vídeo"
            />
          </div>
          <div>
            <Label>URL do Vídeo</Label>
            <Input
              value={localNodeData.videoUrl || ""}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={localNodeData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição do vídeo..."
              rows={3}
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Vídeo
          </Button>
        </div>
      );

    case "audioNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Áudio</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título do áudio"
            />
          </div>
          <div>
            <Label>Nome do Áudio</Label>
            <Input
              value={localNodeData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Nome do áudio"
            />
          </div>
          <div>
            <Label>URL do Áudio</Label>
            <Input
              value={localNodeData.audioUrl || ""}
              onChange={(e) => handleChange("audioUrl", e.target.value)}
              placeholder="https://exemplo.com/audio.mp3"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={localNodeData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição do áudio..."
              rows={3}
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Áudio
          </Button>
        </div>
      );

    case "ebookNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do E-book</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título do e-book"
            />
          </div>
          <div>
            <Label>Nome do E-book</Label>
            <Input
              value={localNodeData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Nome do e-book"
            />
          </div>
          <div>
            <Label>URL do E-book</Label>
            <Input
              value={localNodeData.ebookUrl || ""}
              onChange={(e) => handleChange("ebookUrl", e.target.value)}
              placeholder="https://exemplo.com/ebook.pdf"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={localNodeData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição do e-book..."
              rows={3}
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir E-book
          </Button>
        </div>
      );

    case "logicNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título da Lógica</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título da lógica"
            />
          </div>
          <div>
            <Label>Condição</Label>
            <Textarea
              value={localNodeData.condition || ""}
              onChange={(e) => handleChange("condition", e.target.value)}
              placeholder="Ex: resposta === 'Sim'"
              rows={2}
            />
          </div>
          <div>
            <Label>Destino se Verdadeiro</Label>
            <Input
              value={localNodeData.trueTarget || ""}
              onChange={(e) => handleChange("trueTarget", e.target.value)}
              placeholder="ID do nó de destino"
            />
          </div>
          <div>
            <Label>Destino se Falso</Label>
            <Input
              value={localNodeData.falseTarget || ""}
              onChange={(e) => handleChange("falseTarget", e.target.value)}
              placeholder="ID do nó de destino"
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Lógica
          </Button>
        </div>
      );

    case "endNode":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Fim</Label>
            <Input
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Título do fim"
            />
          </div>
          <div>
            <Label>Mensagem Final</Label>
            <Textarea
              value={node.data.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Mensagem de finalização"
              rows={3}
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Fim
          </Button>
        </div>
      );

    default:
      return (
        <div className="text-center py-4">
          <p>Selecione um nó para editar suas propriedades</p>
        </div>
      );
  }
};

// Wrapper component that ensures AuthProvider is available
const SpecialistDashboardWithProvider = () => {
  try {
    // Try to use the existing auth context
    useAuth();
    return <SpecialistDashboard />;
  } catch (error) {
    // If no auth context is available, wrap with provider
    return (
      <AuthProvider>
        <SpecialistDashboard />
      </AuthProvider>
    );
  }
};

export default SpecialistDashboardWithProvider;

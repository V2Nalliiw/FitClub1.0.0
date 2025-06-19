import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Stethoscope,
  Users,
  Palette,
  BarChart3,
  Plus,
  SearchIcon,
  Edit,
  UserX,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Camera,
  UserCheck,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Types for specialist management
interface Specialist {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  avatar?: string;
  permissions: {
    canCreatePatients: boolean;
    canSendTips: boolean;
    canEditFlows: boolean;
  };
}

// Form validation schema
const specialistSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    role: z.string().min(2, "Especialidade é obrigatória"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .optional(),
    confirmPassword: z.string().optional(),
    avatar: z.string().optional(),
    canCreatePatients: z.boolean().default(false),
    canSendTips: z.boolean().default(false),
    canEditFlows: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Senhas não coincidem",
      path: ["confirmPassword"],
    },
  );

type SpecialistFormData = z.infer<typeof specialistSchema>;

// Mock data for specialists
const mockSpecialists: Specialist[] = [
  {
    id: "1",
    name: "Dr. Carlos Mendes",
    email: "carlos.mendes@clinica.com",
    cpf: "123.456.789-01",
    phone: "(11) 99999-1234",
    role: "Cardiologista",
    status: "active",
    createdAt: "2024-01-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    permissions: {
      canCreatePatients: true,
      canSendTips: true,
      canEditFlows: false,
    },
  },
  {
    id: "2",
    name: "Dra. Ana Paula",
    email: "ana.paula@clinica.com",
    cpf: "987.654.321-09",
    phone: "(11) 88888-5678",
    role: "Dermatologista",
    status: "active",
    createdAt: "2024-02-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    permissions: {
      canCreatePatients: true,
      canSendTips: false,
      canEditFlows: true,
    },
  },
  {
    id: "3",
    name: "Dr. Roberto Silva",
    email: "roberto.silva@clinica.com",
    cpf: "456.789.123-45",
    phone: "(11) 77777-9012",
    role: "Ortopedista",
    status: "inactive",
    createdAt: "2024-01-20",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=roberto",
    permissions: {
      canCreatePatients: false,
      canSendTips: false,
      canEditFlows: false,
    },
  },
];

const ClinicAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"dashboard" | "team">(
    "dashboard",
  );
  const [specialists, setSpecialists] = useState<Specialist[]>(mockSpecialists);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] =
    useState<Specialist | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<SpecialistFormData>({
    resolver: zodResolver(specialistSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
      avatar: "",
      canCreatePatients: false,
      canSendTips: false,
      canEditFlows: false,
    },
  });

  // Filter specialists based on search and status
  const filteredSpecialists = specialists.filter((specialist) => {
    const matchesSearch =
      specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || specialist.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddSpecialist = () => {
    setEditingSpecialist(null);
    form.reset();
    setIsModalOpen(true);
  };

  const handleEditSpecialist = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    form.reset({
      name: specialist.name,
      email: specialist.email,
      cpf: specialist.cpf,
      phone: specialist.phone,
      role: specialist.role,
      avatar: specialist.avatar || "",
      canCreatePatients: specialist.permissions.canCreatePatients,
      canSendTips: specialist.permissions.canSendTips,
      canEditFlows: specialist.permissions.canEditFlows,
    });
    setPreviewImage(specialist.avatar || null);
    setIsModalOpen(true);
  };

  const handleViewPermissions = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setShowPermissionsModal(true);
  };

  const handleToggleStatus = (id: string) => {
    setSpecialists((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "active" ? "inactive" : "active",
            }
          : s,
      ),
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        form.setValue("avatar", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeactivateSpecialist = (id: string) => {
    if (window.confirm("Tem certeza que deseja desativar este especialista?")) {
      setSpecialists((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "inactive" as const } : s,
        ),
      );
    }
  };

  const onSubmit = (data: SpecialistFormData) => {
    if (editingSpecialist) {
      // Update existing specialist
      setSpecialists((prev) =>
        prev.map((s) =>
          s.id === editingSpecialist.id
            ? {
                ...s,
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                phone: data.phone,
                role: data.role,
                avatar: data.avatar,
                permissions: {
                  canCreatePatients: data.canCreatePatients,
                  canSendTips: data.canSendTips,
                  canEditFlows: data.canEditFlows,
                },
              }
            : s,
        ),
      );
    } else {
      // Add new specialist
      const newSpecialist: Specialist = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        avatar: data.avatar,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        permissions: {
          canCreatePatients: data.canCreatePatients,
          canSendTips: data.canSendTips,
          canEditFlows: data.canEditFlows,
        },
      };
      setSpecialists((prev) => [...prev, newSpecialist]);
    }
    setIsModalOpen(false);
    setPreviewImage(null);
    form.reset();
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  if (currentView === "team") {
    return (
      <div className="min-h-screen bg-background pt-16">
        {/* Added pt-16 to prevent overlap with header */}
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("dashboard")}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleAddSpecialist}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Especialista
                </Button>
                <span className="text-sm text-muted-foreground">
                  Olá, {user?.name}
                </span>
                <Button variant="outline" onClick={logout}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <Table style={{ minWidth: "350px", width: "100%" }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">
                        Profissional
                      </TableHead>
                      <TableHead className="min-w-[90px] hidden md:table-cell">
                        Especialidade
                      </TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">
                        E-mail
                      </TableHead>
                      <TableHead className="min-w-[70px]">Status</TableHead>
                      <TableHead className="min-w-[80px] hidden md:table-cell">
                        Permissões
                      </TableHead>
                      <TableHead className="min-w-[60px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredSpecialists.map((specialist) => (
                        <motion.tr
                          key={specialist.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={specialist.avatar}
                                  alt={specialist.name}
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {specialist.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {specialist.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {specialist.phone}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium hidden md:table-cell">
                            {specialist.role}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {specialist.email}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={specialist.status === "active"}
                                onCheckedChange={() =>
                                  handleToggleStatus(specialist.id)
                                }
                                className="data-[state=checked]:bg-green-600"
                              />
                              <Badge
                                variant={
                                  specialist.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  specialist.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }
                              >
                                {specialist.status === "active"
                                  ? "Ativo"
                                  : "Inativo"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPermissions(specialist)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="md:hidden"
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSpecialist(specialist)}
                                className="hover:bg-blue-50 hover:text-blue-600 hidden md:inline-flex"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Permissions Modal */}
        <Dialog
          open={showPermissionsModal}
          onOpenChange={setShowPermissionsModal}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Permissões do Especialista</span>
              </DialogTitle>
            </DialogHeader>
            {selectedSpecialist && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedSpecialist.avatar}
                      alt={selectedSpecialist.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedSpecialist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedSpecialist.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedSpecialist.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Criar Pacientes</div>
                        <div className="text-sm text-gray-500">
                          Pode adicionar novos pacientes
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedSpecialist.permissions.canCreatePatients
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedSpecialist.permissions.canCreatePatients
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {selectedSpecialist.permissions.canCreatePatients
                        ? "Permitido"
                        : "Negado"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Enviar Dicas</div>
                        <div className="text-sm text-gray-500">
                          Pode enviar dicas aos pacientes
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedSpecialist.permissions.canSendTips
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedSpecialist.permissions.canSendTips
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {selectedSpecialist.permissions.canSendTips
                        ? "Permitido"
                        : "Negado"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Editar Fluxos</div>
                        <div className="text-sm text-gray-500">
                          Pode modificar fluxos de atendimento
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedSpecialist.permissions.canEditFlows
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedSpecialist.permissions.canEditFlows
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {selectedSpecialist.permissions.canEditFlows
                        ? "Permitido"
                        : "Negado"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSpecialist
                  ? "Editar Especialista"
                  : "Novo Especialista"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={previewImage || form.watch("avatar")}
                        alt="Preview"
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <Camera className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Clique no ícone para adicionar uma foto
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo"
                          {...field}
                        />
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
                      <FormLabel>E-mail profissional</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@clinica.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                        />
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
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Cardiologista, Enfermeiro"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-medium">Permissões</Label>
                  </div>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="canCreatePatients"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <UserCheck className="h-5 w-5 text-green-600" />
                            <div>
                              <FormLabel className="font-medium cursor-pointer">
                                Criar Pacientes
                              </FormLabel>
                              <p className="text-sm text-gray-500">
                                Pode adicionar novos pacientes ao sistema
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canSendTips"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            <div>
                              <FormLabel className="font-medium cursor-pointer">
                                Enviar Dicas
                              </FormLabel>
                              <p className="text-sm text-gray-500">
                                Pode enviar dicas e conteúdos aos pacientes
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canEditFlows"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Settings className="h-5 w-5 text-purple-600" />
                            <div>
                              <FormLabel className="font-medium cursor-pointer">
                                Editar Fluxos
                              </FormLabel>
                              <p className="text-sm text-gray-500">
                                Pode modificar fluxos de atendimento
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {!editingSpecialist && (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmação de senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showConfirmPassword ? "text" : "password"}
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Olá, {user?.name}
              </span>
              <Button variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-24 pb-6 px-4 sm:px-6 lg:px-8">
        {/* Increased top padding */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Administração da Clínica
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie especialistas, branding, relatórios e fluxos da clínica
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Especialistas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">+3 este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+28 esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fluxos Ativos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">2 novos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Engajamento
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Especialistas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione, edite ou remova especialistas da clínica
              </p>
              <Button className="w-full" onClick={() => setCurrentView("team")}>
                Acessar Gestão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding da Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Personalize cores, logos e identidade visual
              </p>
              <Button className="w-full" variant="outline">
                <Palette className="w-4 h-4 mr-2" />
                Personalizar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios da Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Visualize métricas e relatórios detalhados
              </p>
              <Button className="w-full" variant="outline">
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fluxos da Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Crie e gerencie fluxos de atendimento
              </p>
              <Button className="w-full" variant="outline">
                Gerenciar Fluxos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClinicAdminDashboard;

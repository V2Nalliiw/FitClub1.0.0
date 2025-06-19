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
  Trophy,
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Camera,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Types for achievements management
interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  status: "active" | "inactive";
  createdAt: string;
  image?: string;
  attributions?: Attribution[];
}

interface Attribution {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  awardedBy: string;
}

// Form validation schema
const achievementSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  points: z.coerce.number().min(1, "Pontos devem ser pelo menos 1"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  image: z.string().optional(),
});

type AchievementFormData = z.infer<typeof achievementSchema>;

// Mock data for achievements
const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Primeira Consulta",
    description: "Completou sua primeira consulta na clínica",
    points: 10,
    icon: "trophy",
    status: "active",
    createdAt: "2024-01-15",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80",
    attributions: [
      {
        id: "a1",
        patientName: "Maria Silva",
        patientId: "p1",
        date: "2024-03-10",
        awardedBy: "Dr. Carlos Mendes",
      },
      {
        id: "a2",
        patientName: "João Oliveira",
        patientId: "p2",
        date: "2024-03-15",
        awardedBy: "Dra. Ana Paula",
      },
    ],
  },
  {
    id: "2",
    title: "Completou Tratamento",
    description: "Finalizou com sucesso um tratamento completo",
    points: 50,
    icon: "star",
    status: "active",
    createdAt: "2024-02-10",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80",
    attributions: [
      {
        id: "a3",
        patientName: "Maria Silva",
        patientId: "p1",
        date: "2024-04-05",
        awardedBy: "Dr. Carlos Mendes",
      },
    ],
  },
  {
    id: "3",
    title: "Assiduidade",
    description: "Compareceu a 5 consultas consecutivas sem faltas",
    points: 25,
    icon: "clock",
    status: "inactive",
    createdAt: "2024-01-20",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80",
    attributions: [],
  },
];

const AchievementsPage = () => {
  const { user, logout } = useAuth();
  const [achievements, setAchievements] =
    useState<Achievement[]>(mockAchievements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showAttributionsModal, setShowAttributionsModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      points: 10,
      icon: "trophy",
      image: "",
    },
  });

  // Filter achievements based on search and status
  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || achievement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddAchievement = () => {
    setEditingAchievement(null);
    form.reset();
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    form.reset({
      title: achievement.title,
      description: achievement.description,
      points: achievement.points,
      icon: achievement.icon,
      image: achievement.image || "",
    });
    setPreviewImage(achievement.image || null);
    setIsModalOpen(true);
  };

  const handleViewAttributions = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAttributionsModal(true);
  };

  const handleToggleStatus = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "active" ? "inactive" : "active",
            }
          : a,
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
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conquista?")) {
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const onSubmit = (data: AchievementFormData) => {
    if (editingAchievement) {
      // Update existing achievement
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === editingAchievement.id
            ? {
                ...a,
                title: data.title,
                description: data.description,
                points: data.points,
                icon: data.icon,
                image: data.image,
              }
            : a,
        ),
      );
    } else {
      // Add new achievement
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        points: data.points,
        icon: data.icon,
        image: data.image,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        attributions: [],
      };
      setAchievements((prev) => [...prev, newAchievement]);
    }
    setIsModalOpen(false);
    setPreviewImage(null);
    form.reset();
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-5 w-5" />;
      case "star":
        return <Star className="h-5 w-5" />;
      case "clock":
        return <Clock className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Trophy className="h-8 w-8 text-amber-500" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Conquistas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAddAchievement}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conquista
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Conquistas
              </CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {achievements.filter((a) => a.status === "active").length}{" "}
                ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atribuições Totais
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {achievements.reduce(
                  (total, achievement) =>
                    total + (achievement.attributions?.length || 0),
                  0,
                )}
              </div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pontos Distribuídos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {achievements.reduce(
                  (total, achievement) =>
                    total +
                    achievement.points *
                      (achievement.attributions?.length || 0),
                  0,
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total acumulado</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por título ou descrição..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conquista</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atribuições</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAchievements.map((achievement) => (
                    <motion.tr
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            {getIconComponent(achievement.icon)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {achievement.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Criado em {achievement.createdAt}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {achievement.description}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {achievement.points} pts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={achievement.status === "active"}
                            onCheckedChange={() =>
                              handleToggleStatus(achievement.id)
                            }
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Badge
                            variant={
                              achievement.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              achievement.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }
                          >
                            {achievement.status === "active"
                              ? "Ativo"
                              : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAttributions(achievement)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          disabled={!achievement.attributions?.length}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {achievement.attributions?.length || 0}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAchievement(achievement)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteAchievement(achievement.id)
                            }
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Attributions Modal */}
      <Dialog
        open={showAttributionsModal}
        onOpenChange={setShowAttributionsModal}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Histórico de Atribuições</span>
            </DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  {getIconComponent(selectedAchievement.icon)}
                </div>
                <div>
                  <div className="font-medium">{selectedAchievement.title}</div>
                  <div className="text-sm text-gray-500">
                    {selectedAchievement.points} pontos
                  </div>
                </div>
              </div>

              {selectedAchievement.attributions?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Atribuído por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAchievement.attributions.map((attribution) => (
                      <TableRow key={attribution.id}>
                        <TableCell>{attribution.patientName}</TableCell>
                        <TableCell>{attribution.date}</TableCell>
                        <TableCell>{attribution.awardedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma atribuição encontrada para esta conquista.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Editar Conquista" : "Nova Conquista"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Achievement Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-32 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Clique no ícone para adicionar uma imagem
                </p>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o título da conquista"
                        {...field}
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
                      <Input
                        placeholder="Digite a descrição da conquista"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        {...field}
                      >
                        <option value="trophy">Troféu</option>
                        <option value="star">Estrela</option>
                        <option value="clock">Relógio</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsPage;

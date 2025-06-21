import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  FileText,
  Trophy,
  TrendingUp,
  Play,
  Calendar,
  MessageCircle,
  Bell,
  Settings,
  User,
  Activity,
  BookOpen,
  Video,
  Headphones,
  Star,
  Clock,
  CheckCircle,
  Target,
  Zap,
  Gift,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/auth/ThemeToggle";
import AppLogo from "@/components/auth/AppLogo";
import ClinicLogo from "@/components/auth/ClinicLogo";
import {
  Select,
  SelectContent,
} from "@/components/ui/select";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "tip-detail" | "video-player" | "questionnaire"
  >("dashboard");
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for demonstration
  const [healthTipsState, setHealthTipsState] = useState([
    {
      id: 1,
      title: "Exercícios Matinais",
      description: "Comece o dia com 10 minutos de alongamento",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
      category: "Exercício",
      duration: "10 min",
      completed: false,
      fullContent:
        "Realizar alongamentos matinais ajuda a preparar o corpo para o dia, melhora a flexibilidade e reduz o risco de lesões. Dedique 10 minutos todas as manhãs para esta prática.",
      steps: [
        "Alongamento do pescoço (2 min)",
        "Alongamento dos braços (2 min)",
        "Alongamento das pernas (3 min)",
        "Alongamento das costas (3 min)",
      ],
    },
    {
      id: 2,
      title: "Hidratação Adequada",
      description: "Beba pelo menos 8 copos de água por dia",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
      category: "Nutrição",
      duration: "Todo dia",
      completed: true,
      fullContent:
        "A hidratação adequada é essencial para o bom funcionamento do organismo. Manter-se hidratado melhora a concentração, a digestão e a saúde da pele.",
      steps: [
        "Beba 1 copo ao acordar",
        "2 copos antes do almoço",
        "2 copos à tarde",
        "2 copos antes do jantar",
        "1 copo antes de dormir",
      ],
    },
    {
      id: 3,
      title: "Meditação Guiada",
      description: "5 minutos de respiração consciente",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      category: "Bem-estar",
      duration: "5 min",
      completed: false,
      fullContent:
        "A meditação diária ajuda a reduzir o estresse, melhorar a concentração e promover o bem-estar mental. Apenas 5 minutos por dia podem fazer uma grande diferença.",
      steps: [
        "Encontre um local tranquilo",
        "Sente-se confortavelmente",
        "Feche os olhos e respire profundamente",
        "Concentre-se na respiração por 5 minutos",
      ],
    },
    {
      id: 4,
      title: "Caminhada Diária",
      description: "30 minutos de caminhada ao ar livre",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
      category: "Exercício",
      duration: "30 min",
      completed: false,
      fullContent:
        "A caminhada é uma das formas mais simples e eficazes de exercício. Melhora a saúde cardiovascular, fortalece os músculos e melhora o humor.",
      steps: [
        "Escolha um percurso seguro",
        "Use calçados confortáveis",
        "Mantenha um ritmo constante",
        "Hidrate-se durante o exercício",
      ],
    },
    {
      id: 5,
      title: "Alimentação Balanceada",
      description: "Inclua frutas e vegetais em todas as refeições",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
      category: "Nutrição",
      duration: "Diário",
      completed: false,
      fullContent:
        "Uma alimentação balanceada fornece os nutrientes necessários para o bom funcionamento do corpo e mente. Inclua variedade de cores no seu prato.",
      steps: [
        "Café da manhã: 1 fruta",
        "Almoço: salada colorida",
        "Lanche: vegetais ou frutas",
        "Jantar: legumes variados",
      ],
    },
  ]);

  const videoContent = [
    {
      id: 1,
      title: "Yoga para Iniciantes",
      thumbnail:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
      duration: "15 min",
      category: "Exercício",
      views: "1.2k",
    },
    {
      id: 2,
      title: "Receitas Saudáveis",
      thumbnail:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
      duration: "8 min",
      category: "Nutrição",
      views: "856",
    },
    {
      id: 3,
      title: "Técnicas de Relaxamento",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      duration: "12 min",
      category: "Bem-estar",
      views: "2.1k",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Primeira Semana",
      description: "Completou 7 dias consecutivos",
      icon: "🏆",
      unlocked: true,
    },
    {
      id: 2,
      title: "Hidratação Master",
      description: "Bebeu 8 copos de água por 5 dias",
      icon: "💧",
      unlocked: true,
    },
    {
      id: 3,
      title: "Zen Master",
      description: "10 sessões de meditação",
      icon: "🧘",
      unlocked: false,
    },
    {
      id: 4,
      title: "Fitness Warrior",
      description: "20 exercícios completados",
      icon: "💪",
      unlocked: false,
    },
  ];

  const questionnaires = [
    {
      id: 1,
      title: "Avaliação Semanal de Bem-estar",
      questions: 8,
      completed: false,
      dueDate: "Hoje",
    },
    {
      id: 2,
      title: "Questionário de Sono",
      questions: 5,
      completed: false,
      dueDate: "Amanhã",
    },
    {
      id: 3,
      title: "Avaliação Nutricional",
      questions: 12,
      completed: true,
      dueDate: "Ontem",
    },
  ];

  const menuItems = [
    { id: 1, title: "Início" },
    { id: 2, title: "Plano de Cuidados" },
    { id: 3, title: "Conquistas" },
    { id: 4, title: "Recursos" },
  ];

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl mobile-card-spacing p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold mb-2 text-white">
              Olá, {user?.name}! 👋
            </h2>
            <p className="text-sm sm:text-base text-blue-100 dark:text-blue-200">
              Como você está se sentindo hoje?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white">78%</div>
            <div className="text-xs sm:text-sm text-blue-100 dark:text-blue-200">
              Progresso Geral
            </div>
          </div>
        </div>
        <Progress
          value={78}
          className="mt-3 sm:mt-4 bg-blue-400 dark:bg-blue-500"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="mobile-card-spacing p-3 sm:p-4 text-center">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">
              42
            </div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-300">
              Dicas Recebidas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              12
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              Conquistas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              8
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-300">
              Questionários
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              <div className="text-sm text-orange-600 dark:text-orange-300">
                Dias Ativos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tips */}
      <Card>
        <CardHeader className="mobile-card-spacing">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            Dicas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-card-spacing">
          <div className="grid mobile-grid-compact md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {healthTipsState.slice(0, 3).map((tip) => (
              <Card
                key={tip.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    {tip.category}
                  </Badge>
                  {tip.completed && (
                    <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="mobile-card-spacing p-3 sm:p-4">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    {tip.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    {tip.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {tip.duration}
                    </div>
                    <Button
                      size="sm"
                      variant={tip.completed ? "secondary" : "default"}
                      className={
                        tip.completed
                          ? ""
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }
                      onClick={() => {
                        if (!tip.completed) {
                          setSelectedTip(tip);
                          setCurrentPage("tip-detail");
                        }
                      }}
                    >
                      {tip.completed ? "Concluído" : "Começar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid mobile-grid-compact md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardHeader className="mobile-card-spacing">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              Lembretes de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-card-spacing">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm sm:text-base">
                    Tomar medicação
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    14:00
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    Exercício da tarde
                  </div>
                  <div className="text-sm text-muted-foreground">16:30</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <MessageCircle className="h-5 w-5" />
              Mensagens Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1" />
                  <AvatarFallback>Dr</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-foreground">Dr. Silva</div>
                  <div className="text-sm text-muted-foreground">
                    Parabéns pelo progresso!
                  </div>
                </div>
                <Badge variant="secondary">Novo</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=nurse1" />
                  <AvatarFallback>En</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    Enfermeira Ana
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lembrete: consulta amanhã
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTipsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dicas de Saúde</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Todas
          </Button>
          <Button variant="outline" size="sm">
            Exercício
          </Button>
          <Button variant="outline" size="sm">
            Nutrição
          </Button>
          <Button variant="outline" size="sm">
            Bem-estar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthTipsState.map((tip) => (
          <Card
            key={tip.id}
            className="overflow-hidden hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="relative">
              <img
                src={tip.image}
                alt={tip.title}
                className="w-full h-48 object-cover"
              />
              <Badge className="absolute top-3 right-3" variant="secondary">
                {tip.category}
              </Badge>
              {tip.completed && (
                <div className="absolute top-3 left-3 bg-green-500 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">{tip.title}</h3>
              <p className="text-muted-foreground mb-4">{tip.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {tip.duration}
                </div>
                <Button
                  variant={tip.completed ? "secondary" : "default"}
                  className={
                    tip.completed
                      ? ""
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }
                  onClick={() => {
                    if (!tip.completed) {
                      setSelectedTip(tip);
                      setCurrentPage("tip-detail");
                    }
                  }}
                >
                  {tip.completed ? "Concluído" : "Começar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conteúdo em Vídeo</h2>
        <Button variant="outline">
          <Video className="h-4 w-4 mr-2" />
          Todos os Vídeos
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoContent.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            onClick={() => {
              setSelectedVideo(video);
              setCurrentPage("video-player");
            }}
          >
            <div className="relative group">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>
              <Badge className="absolute top-3 right-3" variant="secondary">
                {video.category}
              </Badge>
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {video.views} visualizações
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    setSelectedVideo(video);
                    setCurrentPage("video-player");
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Assistir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Suas Conquistas</h2>
        <p className="text-muted-foreground">
          Continue assim para desbloquear mais conquistas!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-6 ${
              achievement.unlocked
                ? "bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 border-yellow-200 dark:border-yellow-800"
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`text-4xl ${
                  achievement.unlocked ? "grayscale-0" : "grayscale"
                }`}
              >
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold ${
                    achievement.unlocked
                      ? "text-yellow-800 dark:text-yellow-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {achievement.title}
                </h3>
                <p
                  className={`${
                    achievement.unlocked
                      ? "text-yellow-700 dark:text-yellow-500"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {achievement.description}
                </p>
              </div>
              {achievement.unlocked && (
                <Badge className="bg-yellow-500 dark:bg-yellow-700 text-white">
                  Desbloqueado
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderQuestionnairesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questionários</h2>
        <Badge variant="secondary">2 Pendentes</Badge>
      </div>

      <div className="space-y-4">
        {questionnaires.map((questionnaire) => (
          <Card
            key={questionnaire.id}
            className={`p-6 ${
              questionnaire.completed
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {questionnaire.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {questionnaire.questions} perguntas
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Prazo: {questionnaire.dueDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {questionnaire.completed ? (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluído
                  </Badge>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      setSelectedQuestionnaire(questionnaire);
                      setCurrentPage("questionnaire");
                    }}
                  >
                    Responder
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meu Progresso</h2>

      {/* Overall Progress */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Progresso Geral</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Dicas Completadas</span>
              <span className="font-semibold">28/42 (67%)</span>
            </div>
            <Progress value={67} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Questionários Respondidos</span>
              <span className="font-semibold">6/8 (75%)</span>
            </div>
            <Progress value={75} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Dias Consecutivos</span>
              <span className="font-semibold">15 dias</span>
            </div>
            <Progress value={88} className="h-3" />
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Progresso Semanal</h3>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
            (day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{day}</div>
                <div
                  className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-semibold ${
                    index < 5
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < 5 ? "✓" : "○"}
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Goals */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Metas da Semana</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="flex-1">Completar 5 dicas de exercício</span>
            <Badge className="bg-green-500 text-white">Concluído</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="flex-1">Responder 2 questionários</span>
            <Badge variant="secondary">1/2</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Star className="h-5 w-5 text-orange-600" />
            <span className="flex-1">Assistir 3 vídeos educativos</span>
            <Badge variant="secondary">2/3</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  // Tip Detail Page
  const renderTipDetailPage = () => {
    if (!selectedTip) return null;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {selectedTip.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Card>
              <div className="relative">
                <img
                  src={selectedTip.image}
                  alt={selectedTip.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-4 right-4" variant="secondary">
                  {selectedTip.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedTip.duration}
                  </div>
                  <Badge
                    variant={selectedTip.completed ? "default" : "secondary"}
                  >
                    {selectedTip.completed ? "Concluído" : "Pendente"}
                  </Badge>
                </div>

                <p className="text-lg mb-6">{selectedTip.fullContent}</p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Passos para completar:
                  </h3>
                  <div className="space-y-2">
                    {selectedTip.steps.map((step: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  {!selectedTip.completed && (
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        // Mark tip as completed
                        setHealthTipsState((prev) =>
                          prev.map((tip) =>
                            tip.id === selectedTip.id
                              ? { ...tip, completed: true }
                              : tip,
                          ),
                        );
                        setCurrentPage("dashboard");
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage("dashboard")}
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  };

  // Video Player Page
  const renderVideoPlayerPage = () => {
    if (!selectedVideo) return null;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {selectedVideo.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative bg-black rounded-lg mb-6">
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-full h-96 object-cover rounded-lg opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4"
                      onClick={() => {
                        alert(
                          `Reproduzindo: ${selectedVideo.title}\n\nEm uma aplicação real, aqui seria reproduzido o vídeo.`,
                        );
                      }}
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                    {selectedVideo.duration}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary">{selectedVideo.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    {selectedVideo.views} visualizações
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  {selectedVideo.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Este vídeo faz parte da categoria {selectedVideo.category} e
                  tem duração de {selectedVideo.duration}. Conteúdo educativo
                  para ajudar no seu bem-estar e saúde.
                </p>

                <div className="flex gap-4">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      alert(
                        `Reproduzindo: ${selectedVideo.title}\n\nEm uma aplicação real, aqui seria reproduzido o vídeo.`,
                      );
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Reproduzir Vídeo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage("dashboard")}
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  };

  // Questionnaire Page
  const renderQuestionnairePage = () => {
    if (!selectedQuestionnaire) return null;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const mockQuestions = [
      {
        id: 1,
        question: "Como você se sente hoje?",
        type: "multiple",
        options: ["Muito bem", "Bem", "Regular", "Mal", "Muito mal"],
      },
      {
        id: 2,
        question: "Quantas horas você dormiu na noite passada?",
        type: "multiple",
        options: ["Menos de 4h", "4-6h", "6-8h", "8-10h", "Mais de 10h"],
      },
      {
        id: 3,
        question: "Você praticou algum exercício hoje?",
        type: "multiple",
        options: [
          "Sim, exercício intenso",
          "Sim, exercício leve",
          "Apenas caminhada",
          "Não pratiquei",
        ],
      },
      {
        id: 4,
        question: "Como está sua alimentação hoje?",
        type: "multiple",
        options: [
          "Muito saudável",
          "Saudável",
          "Regular",
          "Pouco saudável",
          "Nada saudável",
        ],
      },
      {
        id: 5,
        question: "Descreva como foi seu dia (opcional):",
        type: "text",
        options: [],
      },
    ];

    const currentQ = mockQuestions[currentQuestion];
    const isLastQuestion = currentQuestion === mockQuestions.length - 1;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {selectedQuestionnaire.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Pergunta {currentQuestion + 1} de {mockQuestions.length}
                  </CardTitle>
                  <Badge variant="secondary">
                    {Math.round(
                      ((currentQuestion + 1) / mockQuestions.length) * 100,
                    )}
                    % concluído
                  </Badge>
                </div>
                <Progress
                  value={((currentQuestion + 1) / mockQuestions.length) * 100}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">{currentQ.question}</h3>

                  {currentQ.type === "multiple" ? (
                    <div className="space-y-3">
                      {currentQ.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            answers[currentQuestion] === option
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start text-left h-auto p-4"
                          onClick={() => {
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion]: option,
                            }));
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="w-full min-h-[120px] p-4 border border-input rounded-md bg-transparent"
                      placeholder="Digite sua resposta aqui..."
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => {
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion]: e.target.value,
                        }));
                      }}
                    />
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestion((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentQuestion === 0}
                    >
                      Anterior
                    </Button>

                    {isLastQuestion ? (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          // Submit questionnaire
                          alert("Questionário enviado com sucesso!");
                          setCurrentPage("dashboard");
                        }}
                        disabled={!answers[currentQuestion]}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setCurrentQuestion((prev) => prev + 1)}
                        disabled={!answers[currentQuestion]}
                      >
                        Próxima
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  };

  if (currentPage === "tip-detail") {
    return renderTipDetailPage();
  }

  if (currentPage === "video-player") {
    return renderVideoPlayerPage();
  }

  if (currentPage === "questionnaire") {
    return renderQuestionnairePage();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <ClinicLogo />
              <span className="font-semibold text-lg hidden sm:block">
                FitClub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Perfil do Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                        />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{user?.name}</h3>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => (window.location.href = "/settings")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    </div>
                    <Button
                      onClick={logout}
                      variant="outline"
                      className="w-full"
                    >
                      Sair
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="bg-card border-b border-border hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 h-12">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Início</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Dicas</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Vídeos</span>
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Conquistas</span>
              </TabsTrigger>
              <TabsTrigger
                value="questionnaires"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span>Questionários</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Progresso</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto dashboard-mobile-content px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home">{renderHomeTab()}</TabsContent>
          <TabsContent value="tips">{renderTipsTab()}</TabsContent>
          <TabsContent value="videos">{renderVideosTab()}</TabsContent>
          <TabsContent value="achievements">
            {renderAchievementsTab()}
          </TabsContent>
          <TabsContent value="questionnaires">
            {renderQuestionnairesTab()}
          </TabsContent>
          <TabsContent value="progress">{renderProgressTab()}</TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
        <div className="grid grid-cols-6 h-16">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "home"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "tips"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Dicas</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "videos"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="h-5 w-5" />
            <span className="text-xs">Vídeos</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "achievements"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Conquistas</span>
          </button>
          <button
            onClick={() => setActiveTab("questionnaires")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "questionnaires"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Questionários</span>
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "progress"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Progresso</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
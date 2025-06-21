import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Building2,
  Camera,
  Save,
  User,
  Settings,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ImageGallery from "@/components/ImageGallery";
import { LogoService } from "@/services/logoService";

interface UnifiedSettingsPageProps {
  onBack: () => void;
}

interface AppLogo {
  type: string;
  url: string | null;
  file: File | null;
  preview: string;
}

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["specialist", "chief_specialist", "clinic_admin"]),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UnifiedSettingsPage: React.FC<UnifiedSettingsPageProps> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && ["profile", "preferences", "system"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'system' && user?.role === 'super_admin') {
      loadGlobalAppSettings();
    }
  }, [activeTab, user]);

  // Profile states
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.avatar || null,
  );
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  // Global app settings states (only for super_admin)
  const [logos, setLogos] = useState<{
    main: AppLogo;
    mobile: AppLogo;
    pwa: AppLogo;
    login: AppLogo;
  }>({
    main: { type: "main", url: null, file: null, preview: "" },
    mobile: { type: "mobile", url: null, file: null, preview: "" },
    pwa: { type: "pwa", url: null, file: null, preview: "" },
    login: { type: "login", url: null, file: null, preview: "" },
  });

  // System preferences
  const [systemPreferences, setSystemPreferences] = useState({
    defaultTheme: "light",
    defaultLanguage: "pt-BR",
    pushNotifications: true,
    autoActivateClinics: false,
    individualBranding: true,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: (user?.role as ProfileFormData["role"]) || "specialist",
      avatar: user?.avatar || "",
    },
  });

  useEffect(() => {
    if (user?.role === "super_admin") {
      loadGlobalAppSettings();
    }

    // Ensure dark mode consistency
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, [user]);

  const loadGlobalAppSettings = async () => {
    try {
      setIsTabLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setLogos({
          main: {
            type: "main",
            url: data.logo_url,
            file: null,
            preview: data.logo_url || "",
          },
          mobile: {
            type: "mobile",
            url: data.mobile_logo_url,
            file: null,
            preview: data.mobile_logo_url || "",
          },
          pwa: {
            type: "pwa",
            url: data.pwa_logo_url,
            file: null,
            preview: data.pwa_logo_url || "",
          },
          login: {
            type: "login",
            url: data.login_logo_url,
            file: null,
            preview: data.login_logo_url || "",
          },
        });
      }
    } catch (err) {
      console.error("Error fetching global app settings:", err);
      setError("Erro ao carregar configurações globais do app");
    } finally {
      setIsTabLoading(false);
    }
  };

  const handleImageSelect = async (imageUrl: string) => {
    setPreviewImage(imageUrl);
    form.setValue("avatar", imageUrl);

    try {
      if (user?.id) {
        const { error } = await supabase
          .from("user_profiles")
          .update({ avatar_url: imageUrl })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating profile image:", error);
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogoSelect = (
    imageUrl: string,
    logoType: "main" | "mobile" | "pwa" | "login",
  ) => {
    setLogos((prev) => ({
      ...prev,
      [logoType]: {
        ...prev[logoType],
        url: imageUrl,
        preview: imageUrl,
      },
    }));
  };

  const handleDirectLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    logoType: "main" | "mobile" | "pwa" | "login",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use LogoService for login logo, or handle other types as needed
      if (logoType === "login") {
        const result = await LogoService.uploadLoginLogo(file);
        if (result.success && result.url) {
          setLogos((prev) => ({
            ...prev,
            login: {
              ...prev.login,
              url: result.url!,
              preview: result.url!,
            },
          }));
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(result.error || "Erro ao fazer upload da logo");
        }
      }
    } catch (err) {
      console.error("Error uploading logo:", err);
      setError("Erro inesperado ao fazer upload da logo");
    } finally {
      setIsLoading(false);
      // Clear the input
      event.target.value = "";
    }
  };

  const handleRemoveLogo = (logoType: "main" | "mobile" | "pwa" | "login") => {
    setLogos((prev) => ({
      ...prev,
      [logoType]: {
        ...prev[logoType],
        file: null,
        preview: prev[logoType].url || "",
      },
    }));
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (user?.id) {
      let errorMsg = "";
      // Atualiza o e-mail no auth do Supabase
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: data.email });
        if (emailError) {
          errorMsg += `Erro ao atualizar e-mail: ${emailError.message}\n`;
        }
      }
      // Atualiza o perfil no banco
      const { error } = await supabase
        .from("user_profiles")
        .update({ name: data.name, role: data.role, email: data.email })
        .eq("id", user.id);
      if (error) {
        errorMsg += `Erro ao atualizar perfil: ${error.message}`;
      }
      if (errorMsg) {
        setError(errorMsg);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        window.location.reload();
      }
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mainLogoUrl = logos.main.url || logos.main.preview;
      const mobileLogoUrl = logos.mobile.url || logos.mobile.preview;
      const pwaLogoUrl = logos.pwa.url || logos.pwa.preview;
      const loginLogoUrl = logos.login.url || logos.login.preview;

      const { error: upsertError } = await supabase
        .from("app_settings")
        .upsert({
          id: "global",
          logo_url: mainLogoUrl,
          mobile_logo_url: mobileLogoUrl,
          pwa_logo_url: pwaLogoUrl,
          login_logo_url: loginLogoUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || "system",
        });

      if (upsertError) {
        throw upsertError;
      }

      setLogos({
        main: { ...logos.main, url: mainLogoUrl, file: null },
        mobile: { ...logos.mobile, url: mobileLogoUrl, file: null },
        pwa: { ...logos.pwa, url: pwaLogoUrl, file: null },
        login: { ...logos.login, url: loginLogoUrl, file: null },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving global app settings:", err);
      setError("Erro ao salvar configurações globais do app");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador";
      case "clinic_admin":
        return "Administrador da Clínica";
      case "chief_specialist":
        return "Especialista-Chefe";
      case "specialist":
        return "Especialista";
      case "patient":
        return "Paciente";
      default:
        return "Usuário";
    }
  };

  const renderLogoUploadSection = (
    logoType: "main" | "mobile" | "pwa" | "login",
    title: string,
    description: string,
  ) => {
    const logo = logos[logoType];
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">{title}</Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
            {logo.preview ? (
              <img
                src={logo.preview}
                alt={title}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Building2 className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
            <ImageGallery
              bucketId="app-images"
              onImageSelect={(imageUrl) => handleLogoSelect(imageUrl, logoType)}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-muted"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar da Galeria
                </Button>
              }
              allowedTypes={[
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/svg+xml",
              ]}
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleDirectLogoUpload(e, logoType)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-background hover:bg-muted"
                disabled={isLoading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Direto
              </Button>
            </div>
            {logo.preview && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleRemoveLogo(logoType)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Header */}
      <header className="bg-card dark:bg-card shadow-sm border-b border-border dark:border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <h1 className="text-xl font-semibold text-foreground">
                Configurações
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
            <AlertDescription>
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            {user?.role === "super_admin" && (
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Foto de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={previewImage || user?.avatar}
                        alt={user?.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ImageGallery
                      bucketId="profile-images"
                      onImageSelect={handleImageSelect}
                      trigger={
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                          <Camera className="h-4 w-4" />
                        </div>
                      }
                      allowedTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                      ]}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Clique no ícone da câmera para alterar sua foto
                  </p>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmitProfile)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome completo" {...field} />
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
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu e-mail" {...field} />
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
                            <FormLabel>Cargo/Função</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="specialist">Especialista</SelectItem>
                                  <SelectItem value="chief_specialist">Especialista-Chefe</SelectItem>
                                  <SelectItem value="clinic_admin">Administrador da Clínica</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-primary/90"
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar modo escuro da interface
                    </p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Idioma</Label>
                  <Select value="pt-BR" disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US" disabled>
                        English (US) - Em breve
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Outros idiomas estarão disponíveis em breve
                  </p>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Notificações Push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações do sistema
                    </p>
                  </div>
                  <Switch
                    checked={systemPreferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSystemPreferences((prev) => ({
                        ...prev,
                        pushNotifications: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab (Super Admin Only) */}
          {user?.role === "super_admin" && (
            <TabsContent value="system" className="space-y-6">
              {isTabLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Identidade Visual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderLogoUploadSection("main", "Logo Principal", "Ideal: 150x60px")}
                        {renderLogoUploadSection("mobile", "Logo Mobile", "Ideal: 50x50px")}
                        {renderLogoUploadSection("pwa", "Logo para PWA", "Ideal: 512x512px")}
                        {renderLogoUploadSection("login", "Logo da Tela de Login", "Ideal: 200x80px")}
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveGlobalSettings} disabled={isLoading}>
                          {isLoading ? "Salvando..." : "Salvar Identidade Visual"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferências do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Tema Padrão</Label>
                        <Select
                          value={systemPreferences.defaultTheme}
                          onValueChange={(value) =>
                            setSystemPreferences((prev) => ({
                              ...prev,
                              defaultTheme: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="system">Padrão do Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ativar novas clínicas automaticamente</Label>
                        <Switch
                          checked={systemPreferences.autoActivateClinics}
                          onCheckedChange={(checked) =>
                            setSystemPreferences((prev) => ({
                              ...prev,
                              autoActivateClinics: checked,
                            }))
                          }
                        />
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveGlobalSettings} disabled={isLoading}>
                          {isLoading ? "Salvando..." : "Salvar Preferências"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default UnifiedSettingsPage;

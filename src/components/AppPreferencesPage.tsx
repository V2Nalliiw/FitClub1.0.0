import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useColorTheme } from "@/hooks/useColorTheme";

interface AppPreferencesPageProps {
  onBack: () => void;
}

const AppPreferencesPage: React.FC<AppPreferencesPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const {
    theme: colorTheme,
    setTheme: setColorTheme,
    revertToDefault,
  } = useColorTheme();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    reminders: true,
    updates: true,
  });
  const [privacy, setPrivacy] = useState({
    analytics: false,
    dataSharing: false,
    locationTracking: false,
  });
  const [language, setLanguage] = useState("pt-BR");
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalSettings, setOriginalSettings] = useState<any>(null);

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading preferences:", error);
        return;
      }

      if (profile?.settings) {
        const settings = profile.settings as any;

        // Store original settings for reverting later
        if (!originalSettings) {
          setOriginalSettings(settings);
        }

        setNotifications(settings.notifications || notifications);
        setPrivacy(settings.privacy || privacy);
        setLanguage(settings.language || language);
        setAutoSync(settings.autoSync ?? autoSync);
        setOfflineMode(settings.offlineMode ?? offlineMode);

        // Apply color theme from settings
        if (settings.colorTheme) {
          setColorTheme(settings.colorTheme);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const settings = {
        notifications,
        privacy,
        language,
        autoSync,
        offlineMode,
        colorTheme,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .update({ settings })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving preferences:", error);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const handleRevertSettings = () => {
    if (!originalSettings) return;

    // Revert to original settings
    setNotifications(
      originalSettings.notifications || {
        push: true,
        email: false,
        reminders: true,
        updates: true,
      },
    );
    setPrivacy(
      originalSettings.privacy || {
        analytics: false,
        dataSharing: false,
        locationTracking: false,
      },
    );
    setLanguage(originalSettings.language || "pt-BR");
    setAutoSync(originalSettings.autoSync ?? true);
    setOfflineMode(originalSettings.offlineMode ?? false);

    // Revert color theme
    if (originalSettings.colorTheme) {
      setColorTheme(originalSettings.colorTheme);
    } else {
      revertToDefault();
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=40&q=80"
                alt="Clinic Management Logo"
                className="h-8 w-8 rounded-full object-cover"
              />
              <h1 className="text-xl font-semibold text-foreground">
                Preferências do App
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-8 dashboard-mobile-content px-3 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
            <AlertDescription>
              Preferências salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="settings-mobile-item">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="settings-mobile-item space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm sm:text-base font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receber notificações no dispositivo
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Notificações por E-mail
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Lembretes</Label>
                  <p className="text-sm text-muted-foreground">
                    Lembretes de medicação e consultas
                  </p>
                </div>
                <Switch
                  checked={notifications.reminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reminders: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Atualizações do App
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre novas funcionalidades
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, updates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade e Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Análise de Uso
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir coleta de dados para melhorar o app
                  </p>
                </div>
                <Switch
                  checked={privacy.analytics}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, analytics: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Compartilhamento de Dados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Compartilhar dados com parceiros para pesquisa
                  </p>
                </div>
                <Switch
                  checked={privacy.dataSharing}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, dataSharing: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Rastreamento de Localização
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usar localização para funcionalidades específicas
                  </p>
                </div>
                <Switch
                  checked={privacy.locationTracking}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, locationTracking: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configurações do App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Tema de Cores
                </Label>
                <Select
                  value={colorTheme}
                  onValueChange={(value) => setColorTheme(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex mt-2">
                  <div className="w-8 h-8 rounded-l-md bg-theme-blue-500 dark:bg-theme-blue-400 border border-border"></div>
                  <div className="w-8 h-8 bg-theme-green-500 dark:bg-theme-green-400 border-t border-b border-border"></div>
                  <div className="w-8 h-8 bg-theme-purple-500 dark:bg-theme-purple-400 border-t border-b border-border"></div>
                  <div className="w-8 h-8 bg-theme-orange-500 dark:bg-theme-orange-400 border-t border-b border-border"></div>
                  <div className="w-8 h-8 rounded-r-md bg-theme-red-500 dark:bg-theme-red-400 border border-border"></div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Sincronização Automática
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar dados automaticamente
                  </p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Modo Offline</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir uso do app sem conexão
                  </p>
                </div>
                <Switch
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save and Revert Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handleRevertSettings}
              variant="outline"
              disabled={loading || !originalSettings}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Configurações Originais
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Carregando..." : "Salvar Preferências"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppPreferencesPage;

import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ImageGallery from "@/components/ImageGallery";

interface GlobalAppSettingsProps {
  onBack: () => void;
}

interface AppLogo {
  type: string;
  url: string | null;
  file: File | null;
  preview: string;
}

const GlobalAppSettings: React.FC<GlobalAppSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadGlobalAppSettings();
  }, []);

  const loadGlobalAppSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          // Record not found, will be created on save
          console.log("No global app settings found, will create on save");
          return;
        }
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
      setIsLoading(false);
    }
  };

  const handleFileUpload = (
    file: File,
    logoType: "main" | "mobile" | "pwa" | "login",
  ) => {
    if (file.size > 2 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogos((prev) => ({
        ...prev,
        [logoType]: {
          ...prev[logoType],
          file,
          preview: result,
        },
      }));
    };
    reader.readAsDataURL(file);
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

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current logo URLs (they might have been set via gallery)
      const mainLogoUrl = logos.main.url || logos.main.preview;
      const mobileLogoUrl = logos.mobile.url || logos.mobile.preview;
      const pwaLogoUrl = logos.pwa.url || logos.pwa.preview;
      const loginLogoUrl = logos.login.url || logos.login.preview;

      // Upsert app settings
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

      // Update local state
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
              <h1 className="text-xl font-semibold text-foreground">
                Configurações Globais do App
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Logos do Aplicativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Logo Upload */}
                <div className="space-y-3">
                  <Label htmlFor="main-logo" className="text-base font-medium">
                    Logo Principal (Web)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {/* Logo Preview Area */}
                    <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                      {logos.main.preview ? (
                        <img
                          src={logos.main.preview}
                          alt="Logo principal"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                      <ImageGallery
                        bucketId="app-images"
                        onImageSelect={(imageUrl) => {
                          setLogos((prev) => ({
                            ...prev,
                            main: {
                              ...prev.main,
                              url: imageUrl,
                              preview: imageUrl,
                            },
                          }));
                        }}
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
                      {logos.main.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveLogo("main")}
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
                      {logos.mobile.preview ? (
                        <img
                          src={logos.mobile.preview}
                          alt="Logo mobile"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                      <ImageGallery
                        bucketId="app-images"
                        onImageSelect={(imageUrl) => {
                          setLogos((prev) => ({
                            ...prev,
                            mobile: {
                              ...prev.mobile,
                              url: imageUrl,
                              preview: imageUrl,
                            },
                          }));
                        }}
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
                      {logos.mobile.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveLogo("mobile")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Versão reduzida ou ícone (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PWA Logo Upload */}
                <div className="space-y-3">
                  <Label htmlFor="pwa-logo" className="text-base font-medium">
                    Logo PWA (App Móvel)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {/* Logo Preview Area */}
                    <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                      {logos.pwa.preview ? (
                        <img
                          src={logos.pwa.preview}
                          alt="Logo PWA"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                      <ImageGallery
                        bucketId="app-images"
                        onImageSelect={(imageUrl) => {
                          setLogos((prev) => ({
                            ...prev,
                            pwa: {
                              ...prev.pwa,
                              url: imageUrl,
                              preview: imageUrl,
                            },
                          }));
                        }}
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
                        allowedTypes={["image/png", "image/jpeg", "image/webp"]}
                      />
                      {logos.pwa.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveLogo("pwa")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG ou JPG de alta resolução (512x512 recomendado)
                    </p>
                  </div>
                </div>

                {/* Login Logo Upload */}
                <div className="space-y-3">
                  <Label htmlFor="login-logo" className="text-base font-medium">
                    Logo da Tela de Login
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {/* Logo Preview Area */}
                    <div className="h-32 flex items-center justify-center mb-4 bg-muted rounded-md">
                      {logos.login.preview ? (
                        <img
                          src={logos.login.preview}
                          alt="Logo de login"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                      <ImageGallery
                        bucketId="app-images"
                        onImageSelect={(imageUrl) => {
                          setLogos((prev) => ({
                            ...prev,
                            login: {
                              ...prev.login,
                              url: imageUrl,
                              preview: imageUrl,
                            },
                          }));
                        }}
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
                          "image/svg+xml",
                          "image/webp",
                        ]}
                      />
                      {logos.login.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveLogo("login")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Logo para a tela de login (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GlobalAppSettings;
